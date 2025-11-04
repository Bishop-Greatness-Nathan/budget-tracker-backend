import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 20,
    enum: ['Bro', 'Sis', 'Pst', 'Bishop'],
  })
  title: string;

  @Prop({ required: true, trim: true, minLength: 2, maxLength: 20 })
  firstName: string;

  @Prop({ required: true, trim: true, minLength: 2, maxLength: 20 })
  lastName: string;

  @Prop()
  @IsEmail()
  email: string;

  @Prop({ required: true, trim: true, minLength: 8 })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  image: string;

  @Prop()
  verificationToken: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verified: Date;

  @Prop()
  passwordToken: string;

  @Prop()
  passwordTokenExpirationDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
