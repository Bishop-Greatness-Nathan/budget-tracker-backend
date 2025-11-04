import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  verificationToken: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
