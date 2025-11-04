import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Record, RecordSchema } from './schema/record.schema';
import { TokenModule } from 'src/token/token.module';
import { Token, TokenSchema } from 'src/token/schema/token.schema';
import { User, UserSchema } from 'src/user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Record.name, schema: RecordSchema }]),
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
    AuthModule,
    UserModule,
    CloudinaryModule,
    TokenModule,
  ],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
