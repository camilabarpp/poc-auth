import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from '../dto/user-create-dto';
import { ReturnUserDto } from '../dto/user-return-dto';
import { Role } from '../auth/role.decorator';
import { UserRole } from '../entities/user-enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('user')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<ReturnUserDto> {
    const user = await this.registerService.createUser(createUserDto);
    return {
      user,
      message: 'User created successfully',
    };
  }

  @Post('admin')
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async createAdminUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.registerService.createAdmin(createUserDto);
    return {
      user,
      message: 'Admin created successfully',
    };
  }
}
