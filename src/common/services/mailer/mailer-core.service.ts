import {
  type Transporter,
  type SendMailOptions,
  createTransport,
} from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerCoreService {
  private readonly transporter: Transporter;
  constructor(private readonly config: ConfigService<EnvironmentVariables>) {
    this.transporter = createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: parseInt(this.config.get<string>('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendMail(options: SendMailOptions) {
    return await this.transporter.sendMail(options);
  }
}
