import { Types } from 'mongoose';

export type RecordType = {
  _id: Types.ObjectId;
  amount: number;
  recordType: string;
  image: string;
  category: string;
  currency: string;
  locale: string;
  narration: string;
  createdBy: Types.ObjectId;
  createdAt: string;
};
