import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CredentialsDto } from './dto/credentials-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly registerService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  // async sendRecoverPasswordEmail(email: string): Promise<void> {
  //   const user = await this.findUserByEmail(email);
  //
  //   const recoverToken = this.generateRecoverToken(user);
  //
  //   await this.saveUserWithRecoverToken(user, recoverToken);
  //
  //   const mail = {
  //     to: user.email,
  //     from: 'noreply@application.com',
  //     subject: 'Recover password',
  //     template: 'recover-password',
  //     context: {
  //       token: user.recoverToken,
  //       username: user.name,
  //     },
  //   };
  //   await this.mailerService.sendMail(mail);
  // }

  // private async findUserByEmail(email: string): Promise<User> {
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user) {
  //     throw new NotFoundException('There is no user with this email');
  //   }
  //   return user;
  // }
  //
  // private generateRecoverToken(user: User): string {
  //   return jwt.sign({ id: user.id, email: user.email }, 'super-secret', {
  //     expiresIn: '2m',
  //   });
  // }
  //
  // private async saveUserWithRecoverToken(
  //   user: User,
  //   recoverToken: string,
  // ): Promise<void> {
  //   user.recoverToken = recoverToken;
  //   await this.userRepository.save(user);
  // }

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
