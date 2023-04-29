import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { SendMailService } from './send-mail.service';

@Controller('send-mail')
export class SendMailController {
  constructor(private readonly sendMailService: SendMailService) {}

  @Post('send-recover-email')
  async sendRecoverPasswordEmail(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.sendMailService.sendRecoverPasswordEmail(email);
    return {
      message: 'It was sent an email to recover your password',
    };
  }

  @Patch('confirm-email/:token')
  async confirmEmail(@Param('token') token: string) {
    await this.sendMailService.sendEmailConfirmAccount(token);
    return {
      message: 'Email confirmed',
    };
  }
}
