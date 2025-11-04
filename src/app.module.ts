import { Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordModule } from './record/record.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CategoryModule } from './category/category.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL as string),
    TokenModule,
    UserModule,
    AuthModule,
    RecordModule,
    CloudinaryModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
