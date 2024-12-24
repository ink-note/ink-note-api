import { Injectable, Logger } from '@nestjs/common';

import { toDataURL, QRCodeOptions } from 'qrcode';
import { authenticator } from 'otplib';

import { TOTPDetails } from './types';

@Injectable()
export class TotpUtilService {
  private readonly logger = new Logger(TotpUtilService.name);

  async createTOTPDetails(serviceName: string, identifier: string): Promise<TOTPDetails> {
    const trimmedServiceName = serviceName.trim();
    const trimmedIdentifier = identifier.trim();

    const secretKey = this.generateSecret();
    const TOTPUrl = this.generateTOTPUrl(trimmedServiceName, trimmedIdentifier, secretKey);
    const QRCodeBase64 = await this.generateQRCode(TOTPUrl);

    return { qrCodeUrl: QRCodeBase64, secret: secretKey };
  }

  verifyTOTP(code: string, secret: string): boolean {
    return authenticator.verify({ token: code, secret });
  }

  GENERATE_ADMIN_OTP_CODE(secret: string): string {
    this.logger.log(`Creating admin OTP code`);
    const otpCode = authenticator.generate(secret);
    return otpCode;
  }

  private generateSecret(length: number = 10): string {
    this.logger.log(`Generating secret key with length: ${length}`);

    const secret = authenticator.generateSecret(length);
    return secret;
  }

  private generateTOTPUrl(serviceName: string, identifier: string, secret: string): string {
    this.logger.log(`Creating TOTP URL for service: ${serviceName}, identifier: ${identifier}`);

    const url = authenticator.keyuri(serviceName, identifier, secret);
    return url;
  }

  private async generateQRCode(value: string, options: QRCodeOptions = {}) {
    this.logger.log(`Creating QR code for value`);

    const qrCode = await toDataURL(value, options);
    return qrCode;
  }
}
