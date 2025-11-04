import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Record extends Document {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['income', 'expenditure'] })
  recordType: string;

  @Prop()
  image: string;

  @Prop({ trim: true, required: true, enum: ['GBP', 'EUR', 'USD', 'NGN'] })
  currency: string;

  @Prop({
    trim: true,
    required: true,
    enum: ['en-US', 'en-GB', 'en-EU', 'en-NG'],
  })
  locale: string;

  @Prop({ trim: true, required: true })
  narration: string;

  @Prop({ ref: 'Category', required: true })
  category: mongoose.Types.ObjectId;

  @Prop({ ref: 'User', required: true })
  createdBy: mongoose.Types.ObjectId;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
