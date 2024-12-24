import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class MfaBackupCodeService {
  private readonly backupCodeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  async generateBackupCodes(count: number = 10): Promise<string[]> {
    const nanoId = customAlphabet(this.backupCodeAlphabet, 5);

    return await Promise.all(Array.from({ length: count }, () => `${nanoId()}-${nanoId()}`));
  }
}
