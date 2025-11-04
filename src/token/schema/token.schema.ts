import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true })
  refreshToken: string;

  @Prop({ default: true })
  isValid: boolean;

  @Prop({ ref: 'User', required: true })
  user: mongoose.Types.ObjectId;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
