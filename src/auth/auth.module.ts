import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from 'src/mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { Token, TokenSchema } from 'src/token/schema/token.schema';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

dotenv.config();

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Token.name,
        schema: TokenSchema,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
