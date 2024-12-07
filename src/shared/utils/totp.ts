import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { nanoid } from 'nanoid';

/**
 * Generates a secret key, OTP authentication URI, and a QR code.
 *
 * @param {string} serviceName - The name of the service or issuer.
 * @param {string} emailOrIdentifier - The email or identifier of the user.
 * @param {number} [keyLength=10] - The length of the generated secret key.
 * @returns {Promise<{ qrCodeUrl: string, secretKey: string, otpAuthUrl: string }>} An object with the QR code, secret key, and OTP authentication URL.
 */
async function generateMfaKey(
  serviceName: string,
  emailOrIdentifier: string,
  keyLength: number = 10,
): Promise<{ qrCodeUrl: string; secretKey: string; otpAuthUrl: string }> {
  const trimmedEmailOrIdentifier = emailOrIdentifier.trim();
  const trimmedServiceName = serviceName.trim();

  const secretKey: string = authenticator.generateSecret(keyLength);
  const otpAuthUrl: string = authenticator.keyuri(
    trimmedEmailOrIdentifier,
    trimmedServiceName,
    secretKey,
  );

  return {
    qrCodeUrl: await toDataURL(otpAuthUrl, {}),
    otpAuthUrl,
    secretKey,
  };
}

/**
 * Validates an OTP token against a secret key.
 *
 * @param {string} otpToken - The one-time password to validate.
 * @param {string} secretKey - The secret key associated with the OTP.
 * @param {Object} [options] - Optional configuration for OTP validation.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
function validateOtp(
  otpToken: string,
  secretKey: string,
  options: object = {},
): boolean {
  if (options && typeof options !== 'object') {
    throw new Error('Invalid options.');
  }

  return authenticator
    .create({
      ...(authenticator.allOptions() as object),
      ...options,
    })
    .verify({ token: otpToken, secret: secretKey });
}

/**
 * Generates a one-time password (OTP) for the given secret key.
 *
 * @param {string} secretKey - The secret key for generating the OTP.
 * @returns {string} The generated 6-digit OTP.
 */
function createOtp(secretKey: string): string {
  return authenticator.generate(secretKey);
}

/**
 * Creates backup codes for recovery.
 *
 * @param {number} [count=6] - The number of backup codes to generate.
 * @param {number} [codeLength=10] - The length of each backup code.
 * @returns {string[]} An array of backup codes.
 */
function createBackupCodes(
  count: number = 6,
  codeLength: number = 10,
): string[] {
  return Array.from({ length: count }, () => nanoid(codeLength));
}

export const mfa = {
  generateMfaKey,
  createOtp,
  validateOtp,
  createBackupCodes,
};
