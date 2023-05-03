import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user-create-dto';
import { ReturnUserDto } from './dto/user-return-dto';
import { Role } from '../../auth/role.decorator';
import { UserRole } from './entities/user-enum';
import { UserUpdateDto } from './dto/user-update-dto';
import { GetUser } from '../../auth/get-user.decorator';
import { User } from './entities/user.entity';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { RolesGuard } from '../../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('signUp')
@UseGuards(AuthGuard(), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Role(UserRole.ADMIN)
  async findUsers(@Query() query: FindUsersQueryDto) {
    const found = await this.userService.findUsers(query);
    return {
      found,
      message: 'Users founded',
    };
  }

  @Get(':id')
  @Role(UserRole.ADMIN)
  async findUserById(@Param('id') id): Promise<ReturnUserDto> {
    const user = await this.userService.findUserById(id);
    return {
      user,
      message: 'User found successfully!',
    };
  }

  @Patch(':id')
  async updateUser(
    @Body() updateUserDto: UserUpdateDto,
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<ReturnUserDto> {
    if (user.role != UserRole.ADMIN && user.id.toString() != id) {
      throw new ForbiddenException(
        'You are not authorized to access this resource.',
      );
    } else {
      const user = await this.userService.updateUser(updateUserDto, id);
      return {
        user,
        message: 'User updated successfully!',
      };
    }
  }

  @Post('user')
  async signUpUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.userService.createUser(createUserDto);
    return {
      user,
      message: 'User created successfully!',
    };
  }

  @Post('admin')
  @Role(UserRole.ADMIN)
  async signUpAdmin(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ReturnUserDto> {
    const user = await this.userService.createAdmin(createUserDto);
    return {
      user,
      message: 'Admin created successfully!',
    };
  }

  @Delete(':id')
  @Role(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return {
      message: 'User removed successfully!',
    };
  }
}
