import { UserRole } from '../entities/user-enum';
import { IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString({ message: 'Enter a valid name' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Enter a valid name' })
  email: string;

  @IsOptional()
  role: UserRole;

  @IsOptional()
  status: boolean;
}
