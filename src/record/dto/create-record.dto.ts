import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRecordDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  recordType: string;

  image: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  narration: string;

  @IsNotEmpty()
  createdBy: string;
}
