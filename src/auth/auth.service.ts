/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/schema/user.schema';
import { Token } from '../token/schema/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

type Payload = {
  _id: string;
  email: string;
  role: string;
  refreshToken?: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  // create token
  async createJwt(payload: Payload) {
    return await this.jwtService.signAsync(payload);
  }

  // attach cookies to response
  async attachCookiesToResponse(
    res: Response,
    payload: Payload,
    refreshToken: string,
  ) {
    const accessTokenJwt = await this.createJwt(payload);
    const refreshTokenJwt = await this.createJwt({ ...payload, refreshToken });

    const oneDay = 1000 * 60 * 60 * 24;
    const twoDays = 1000 * 60 * 60 * 48;

    res.cookie('accessToken', accessTokenJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneDay,
      sameSite: 'none',
    });

    res.cookie('refreshToken', refreshTokenJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: twoDays,
      sameSite: 'none',
    });
  }

  // encode password
  async encodePassword(password: string): Promise<string> {
    if (!password) {
      throw new BadRequestException('Password is required');
    }
    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);
    return encodedPassword;
  }

  // confirm password
  async confirmPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  // create hash
  createHash(string: string) {
    return crypto.createHash('md5').update(string).digest('hex');
  }

  // register user
  async register(data: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) throw new BadRequestException('this user already exists');

    const hashedPassword = await this.encodePassword(data.password);

    const isFirstUser = (await this.userModel.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'user';

    const verificationToken = crypto.randomBytes(40).toString('hex');

    const newData = {
      ...data,
      password: hashedPassword,
      role,
      verificationToken,
    };
    const user = await this.userModel.create(newData);

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';

    await this.mailService.sendVerificationEmail({
      name: user.firstName,
      email: user.email,
      verificationToken: user.verificationToken,
      origin,
    });

    return { message: 'Success! Please check your email to verify account' };
  }

  // verify email
  async verifyEmail(data: VerifyEmailDto) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) throw new UnauthorizedException('Verification failed');

    if (user.verificationToken !== data.verificationToken)
      throw new UnauthorizedException('Verification failed');

    user.isVerified = true;
    user.verified = new Date(Date.now());
    user.verificationToken = '';

    await user.save();

    return { message: 'Email Verified' };
  }

  // login user
  async login(data: LoginDto, res: Response) {
    const { email, password } = data;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('no user by this email');

    const correctPassword = await this.confirmPassword(password, user.password);

    if (!correctPassword) throw new UnauthorizedException('password incorrect');

    if (!user.isVerified)
      throw new UnauthorizedException('Please verify your email');

    const payload: Payload = {
      _id: user._id as string,
      email: user.email,
      role: user.role,
    };

    let refreshToken: string;
    const existingToken = await this.tokenModel.findOne({ user: payload._id });

    if (existingToken && existingToken.isValid) {
      refreshToken = existingToken.refreshToken;
    } else {
      refreshToken = crypto.randomBytes(40).toString('hex');
      await this.tokenModel.findOneAndUpdate(
        { user: payload._id },
        { refreshToken, isValid: true },
        { upsert: true, new: true },
      );
    }

    await this.attachCookiesToResponse(res, payload, refreshToken);
  }

  // logout user
  async logout(res: Response, userId: string) {
    await this.tokenModel.findOneAndDelete({ user: userId });

    res.cookie('accessToken', 'logout', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'none',
    });

    res.cookie('refreshToken', 'logout', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'none',
    });
  }

  // forgot password
  async forgotPassword(data: ForgotPasswordDto) {
    const { email } = data;

    const user = await this.userModel.findOne({ email });

    if (user) {
      const passwordToken = crypto.randomBytes(70).toString('hex');

      const origin = process.env.FRONTEND_URL || 'http://localhost:3000';

      await this.mailService.sendResetPasswordEmail({
        name: user.firstName,
        email: user.email,
        token: passwordToken,
        origin,
      });

      const tenMinutes = 1000 * 60 * 10;
      const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

      user.passwordToken = this.createHash(passwordToken);
      user.passwordTokenExpirationDate = passwordTokenExpirationDate;
      await user.save();
    }

    return { message: 'Please check your email for reset password link' };
  }

  // reset password
  async resetPassword(data: ResetPasswordDto) {
    const { token, email, password } = data;

    const user = await this.userModel.findOne({ email });

    if (user) {
      const currentDate = new Date();

      if (
        user.passwordToken === this.createHash(token) &&
        user.passwordTokenExpirationDate > currentDate
      ) {
        user.password = await this.encodePassword(password);
        user.passwordToken = '';
        user.passwordTokenExpirationDate = new Date(Date.now());
        await user.save();
      }
    }

    return { message: 'password reset successful' };
  }
}
