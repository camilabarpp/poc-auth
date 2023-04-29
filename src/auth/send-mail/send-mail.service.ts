import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SendMailService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly registerService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async sendRecoverPasswordEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);

    const recoverToken = this.generateRecoverToken(user);

    await this.saveUserWithRecoverToken(user, recoverToken);

    const mail = {
      to: user.email,
      from: 'noreply@application.com',
      subject: 'Recover password',
      template: 'recover-password',
      context: {
        token: user.recoverToken,
        username: user.name,
      },
    };
    await this.mailerService.sendMail(mail);
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('There is no user with this email');
    }
    return user;
  }

  private generateRecoverToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email }, 'super-secret', {
      expiresIn: '2m',
    });
  }

  private async saveUserWithRecoverToken(
    user: User,
    recoverToken: string,
  ): Promise<void> {
    user.recoverToken = recoverToken;
    await this.userRepository.save(user);
  }

  async sendEmailConfirmAccount(confirmationToken: string): Promise<void> {
    try {
      const payload = jwt.verify(confirmationToken, 'super-secret') as {
        type: string;
        exp: number;
      };

      if (payload.type !== 'confirmation') {
        new Error('Invalid token type');
      }

      if (this.isTokenExpired(payload.exp, payload.type)) {
        new Error('Token expired');
      }

      const result = await this.userRepository.update(
        { confirmationToken },
        { confirmationToken: null },
      );

      if (result.affected === 0) {
        new Error('Token invalid');
      }
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }
  private isTokenExpired(tokenExpiration: number, tokenType: string): boolean {
    const now = Math.floor(Date.now() / 1000); // obtém a data atual em segundos
    if (tokenType === 'confirmation') {
      const confirmationExpirationInSeconds = 2 * 24 * 60 * 60; // 2 dias em segundos
      return now - tokenExpiration > confirmationExpirationInSeconds;
    }
    return false;
  }
}
