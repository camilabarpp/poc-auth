import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from '../dto/user-create-dto';
import { ReturnUserDto } from '../dto/user-return-dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('admin')
  async createAdminUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.registerService.createAdminUser(createUserDto);
    return {
      user,
      message: 'Administrador cadastrado com sucesso',
    };
  }
}
