import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Token, TokenSchema } from 'src/token/schema/token.schema';
import * as dotenv from 'dotenv';

import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

dotenv.config();

@Module({
  imports: [
    AuthModule,
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
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
