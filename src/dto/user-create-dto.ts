import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  @MaxLength(200, { message: 'Email is greater than 200 characters' })
  email: string;

  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200, { message: 'Name is greater than 200 characters' })
  name: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password is less than 8 characters' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-_.!@#$%^&*])/)
  password: string;

  @IsNotEmpty({ message: 'Password confirmation is required' })
  @MinLength(8, {
    message: 'Password confirmation is less than 8 characters',
  })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-_.!@#$%^&*])/)
  passwordConfirmation: string;
}
