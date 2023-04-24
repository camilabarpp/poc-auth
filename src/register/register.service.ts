import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/user-create-dto';
import { UserRole } from '../entities/user-enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CredentialsDto } from '../dto/credentials-dto';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { email, name, password } = createUserDto;

    const user = new User();
    user.email = email;
    user.name = name;
    user.role = role;
    user.status = true;
    user.confirmationToken = crypto.randomBytes(32).toString('hex');
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    try {
      await this.userRepository.save(user);
      delete user.password;
      delete user.salt;
      return user;
    } catch (error) {
      const errorMessage = `Error to save on database! ${error.message}`;
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async checkCredentials(credentialsDto: CredentialsDto): Promise<User> {
    const { email, password } = credentialsDto;
    const user = await this.userRepository.findOne({
      where: { email, status: true },
    });

    if (user && (await user.checkPassword(password))) {
      return user;
    } else {
      return null;
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
