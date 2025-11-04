/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Res,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) data: CreateUserDto,
  ) {
    let imageUrl = '';
    let newData = data;

    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
      newData = { ...data, image: imageUrl };
    }
    return this.authService.register(newData);
  }

  @Post('login')
  async login(@Body(ValidationPipe) data: LoginDto, @Res() res: Response) {
    await this.authService.login(data, res);
    res.send({ message: 'user logged in' });
  }

  @Post('verify-email')
  async verifyEmail(@Body(ValidationPipe) data: VerifyEmailDto) {
    return await this.authService.verifyEmail(data);
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(@Res() res: Response, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;

    await this.authService.logout(res, userId as string);
    return res.send({ message: 'Logged out...' });
  }

  @Post('forgot-password')
  forgotPassword(@Body(ValidationPipe) data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  resetPassword(@Body(ValidationPipe) data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }
}
