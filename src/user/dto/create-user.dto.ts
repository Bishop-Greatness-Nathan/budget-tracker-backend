/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MinLength, MaxLength, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  firstName: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  image: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
