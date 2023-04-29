import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Insert a valid password' })
  @MinLength(8, { message: 'Password is less than 8 characters' })
  @MaxLength(32, { message: 'Password is greater then 32 characters' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-_.!@#$%^&*])/)
  password: string;

  @IsString({ message: 'Insert a valid password' })
  @MinLength(8, { message: 'Password is less than 8 characters' })
  @MaxLength(32, { message: 'Password is greater then 32 characters' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-_.!@#$%^&*])/)
  passwordConfirmation: string;
}
