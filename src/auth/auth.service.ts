import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/user-create-dto';
import { RegisterService } from '../register/register.service';
import { UserRole } from '../entities/user-enum';
import { CredentialsDto } from '../dto/credentials-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly registerService: RegisterService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Passwords do not match');
    } else {
      return await this.registerService.createUser(
        createUserDto,
        UserRole.USER,
      );
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Passwords do not match');
    } else {
      return this.registerService.createUser(createUserDto, UserRole.ADMIN);
    }
  }

  async signIn(credentialsDto: CredentialsDto) {
    const user = await this.registerService.checkCredentials(credentialsDto);

    if (user === null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtPayload = {
      id: user.id,
    };
    const token = this.jwtService.sign(jwtPayload);

    return { token };
  }
}
