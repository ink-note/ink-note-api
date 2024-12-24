export interface TOTPDetails {
  secret: string;
  qrCodeUrl: string;
}

export interface CreateBackupCodesOutput {
  codes: string[];
  hashes: string[];
}
