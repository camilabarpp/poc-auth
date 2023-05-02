import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../app/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../app/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CredentialsDto } from './dto/credentials-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly registerService: UserService,
    private jwtService: JwtService,
  ) {}

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

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { password, passwordConfirmation } = changePasswordDto;

    if (password != passwordConfirmation)
      throw new UnprocessableEntityException('The passwords do not matches');

    await this.registerService.changePassword(id, password);
  }

  async resetPassword(
    recoverToken: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { recoverToken },
      select: ['id'],
    });
    if (!user) throw new NotFoundException('Invalid token');

    try {
      await this.changePassword(user.id.toString(), changePasswordDto);
    } catch (error) {
      throw error;
    }
  }
}
