import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/user-create-dto';
import { ReturnUserDto } from '../dto/user-return-dto';
import { CredentialsDto } from '../dto/credentials-dto';
import { User } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { Role } from './role.decorator';
import { UserRole } from '../entities/user-enum';
import { RolesGuard } from './roles.guard';

@Controller('register')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TODO - passar este endpoint para o RegisterController
  @Post('user')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<ReturnUserDto> {
    const user = await this.authService.createUser(createUserDto);
    return {
      user,
      message: 'User created successfully',
    };
  }

  //TODO - passar este endpoint para o RegisterController
  @Post('admin')
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async createAdminUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.authService.createAdmin(createUserDto);
    return {
      user,
      message: 'Admin created successfully',
    };
  }

  @Post('signIn')
  async signIn(
    @Body() credentialsDto: CredentialsDto,
  ): Promise<{ token: string }> {
    return await this.authService.signIn(credentialsDto);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getMe(@GetUser() user: User): User {
    return user;
  }
}
