/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { Token } from '../token/schema/token.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const accessToken = request.cookies['accessToken'];
    const refreshToken = request.cookies['refreshToken'];

    try {
      if (accessToken) {
        const accessTokenPayload =
          await this.jwtService.verifyAsync(accessToken);

        request.user = {
          userId: accessTokenPayload._id,
          email: accessTokenPayload.email,
          role: accessTokenPayload.role,
        };

        return true; // if access token is valid, allow access
      }
    } catch (error) {
      console.error('Access token verification failed:', error.message);
    }

    // If access token is invalid, check refresh token
    if (!refreshToken) {
      throw new UnauthorizedException('Authentication Invalid');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const existingToken = await this.tokenModel.findOne({
        user: payload._id,
        isValid: true,
      });

      if (!existingToken) {
        throw new UnauthorizedException('Authenticatioiin Invalid');
      }

      await this.authService.attachCookiesToResponse(
        response,
        payload,
        existingToken.refreshToken,
      );

      request.user = {
        userId: payload._id,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (error) {
      console.error('Refresh token verification failed:', error.message);
      throw new UnauthorizedException('Authentication Invalid');
    }
  }
}
