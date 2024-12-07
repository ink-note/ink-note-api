import { Injectable } from '@nestjs/common';

import { MailerCoreService } from './mailer-core.service';

type EmailConfirmationData = {
  email: string;
  url: string;
};

type EmailNewSessionCreatedData = {
  email: string;
  ip: string;
  date: Date;
};

@Injectable()
export class MailerService {
  constructor(private readonly mailerCoreService: MailerCoreService) {}

  sendEmailConfirmation({ email, url }: EmailConfirmationData) {
    this.mailerCoreService
      .sendMail({
        to: email,
        from: 'onboarding@resend.dev',
        subject: `Hello ${email} ✔`,
        text: 'Ink Note',
        html: `<p> Hello <b>${email}</b>, Your email confirmation link <a href="${url}" target="_blank">Click here to confirm</a> </p>`,
      })
      .then((res) => console.log(res));
  }

  sendEmailNewSessionCreated({ date, email, ip }: EmailNewSessionCreatedData) {
    this.mailerCoreService
      .sendMail({
        to: email,
        from: 'onboarding@resend.dev',
        subject: `Ink Note Security: New Login`,
        text: 'Ink Note Security: New Login',
        html: `
          <h2 style="color: #333;">New Login Notification</h2>

          <p>Dear [${email}],</p>

          <p>We are writing to inform you that a new login session has been detected on your account.</p>

          <ul>
              <li><strong>Date & Time:</strong> [${date}]</li>
              <li><strong>Location:</strong> [${ip}]</li>
          </ul>

          <p>If you did not initiate this login session, please take immediate action to secure your account. You can reset your password or contact our support team for assistance.</p>

          <p>Thank you for choosing our service.</p>

          <p>Best regards,<br> [Ink Note]</p>`,
      })
      .then((res) => console.log(res));
  }
}
