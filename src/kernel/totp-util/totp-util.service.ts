import { Injectable, Logger } from '@nestjs/common';

import { toDataURL, QRCodeOptions } from 'qrcode';
import { authenticator } from 'otplib';
import { nanoid } from 'nanoid';

import { TOTPDetails } from './types';

@Injectable()
export class TotpUtilService {
  private readonly logger = new Logger(TotpUtilService.name);

  public async createTOTPDetails(serviceName: string, identifier: string): Promise<TOTPDetails> {
    this.logger.log(`Creating TOTP details for service: ${serviceName}, identifier: ${identifier}`);

    const trimmedServiceName = serviceName.trim();
    const trimmedIdentifier = identifier.trim();

    // Generate secret key
    const secretKey: string = this.createSecret();

    // Create TOTP URL
    const TOTPUrl: string = this.createTOTPUrl(trimmedServiceName, trimmedIdentifier, secretKey);
    this.logger.log(`Created TOTP URL for service: ${serviceName}, identifier: ${identifier}`);

    // Generate QR code
    const QRCodeBase64: string = await this.createQRCode(TOTPUrl);
    this.logger.log(`Generated QR code for service: ${serviceName}, identifier: ${identifier}`);

    return { qrCodeUrl: QRCodeBase64, secret: secretKey };
  }

  public createBackupCodes(count: number = 10): Array<string> {
    this.logger.log(`Generating ${count} backup codes`);

    const backupCodes = Array.from({ length: count }, () => {
      const part1 = nanoid(5);
      const part2 = nanoid(5);

      return `${part1}-${part2}`;
    });

    this.logger.log(`Generated backup codes: ${backupCodes.join(', ')}`);
    return backupCodes;
  }

  public verifyTOTP(code: string, secret: string): boolean {
    this.logger.log(`Verifying TOTP code`);

    const isValid = authenticator
      .create({
        ...(authenticator.allOptions() as object),
      })
      .verify({ token: code, secret: secret });

    this.logger.log(`TOTP verification result - ${isValid ? 'Valid' : 'Invalid'}`);
    return isValid;
  }

  public CREATE_ADMIN_OTP_CODE(secret: string) {
    this.logger.log(`Creating admin OTP code`);

    const otpCode = authenticator.generate(secret);
    this.logger.log(`Generated admin OTP code: ${otpCode}`);
    return otpCode;
  }

  private createSecret(length: number = 10): string {
    this.logger.log(`Generating secret key with length: ${length}`);

    const secret = authenticator.generateSecret(length);
    return secret;
  }

  private createTOTPUrl(serviceName: string, identifier: string, secret: string): string {
    this.logger.log(`Creating TOTP URL for service: ${serviceName}, identifier: ${identifier}`);

    const url = authenticator.keyuri(serviceName, identifier, secret);
    this.logger.log(`Generated TOTP URL: ${url}`);
    return url;
  }

  private async createQRCode(value: string, options: QRCodeOptions = {}) {
    this.logger.log(`Creating QR code for value`);

    const qrCode = await toDataURL(value, options);
    this.logger.log(`Generated QR code`);
    return qrCode;
  }
}
