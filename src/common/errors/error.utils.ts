import { ERROR_TAG } from './error-tags.enum';

export function getErrorTagByCode(errorCode: number): ERROR_TAG | null {
  const errorTags: { [key: number]: ERROR_TAG } = {
    100: ERROR_TAG.MFA_REQUIRED,
    101: ERROR_TAG.AUTHENTICATION_FAILED,
    102: ERROR_TAG.INVALID_TOKEN,
    103: ERROR_TAG.USER_NOT_FOUND,
    104: ERROR_TAG.USER_BANNED,
    105: ERROR_TAG.USER_NOT_VERIFIED,
    200: ERROR_TAG.PERMISSION_DENIED,
    201: ERROR_TAG.ACCESS_DENIED,
    202: ERROR_TAG.RESOURCE_NOT_FOUND,
    203: ERROR_TAG.ACTION_NOT_ALLOWED,
    300: ERROR_TAG.INVALID_INPUT,
    301: ERROR_TAG.DATA_CONFLICT,
    302: ERROR_TAG.DUPLICATE_ENTRY,
    303: ERROR_TAG.INVALID_EMAIL_FORMAT,
    304: ERROR_TAG.INVALID_PASSWORD_FORMAT,
    500: ERROR_TAG.INTERNAL_ERROR,
    501: ERROR_TAG.DATABASE_ERROR,
    502: ERROR_TAG.SERVER_UNAVAILABLE,
    503: ERROR_TAG.MAINTENANCE_MODE,
    600: ERROR_TAG.TOTP_FAILED,
    601: ERROR_TAG.BACKUP_CODE_FAILED,
    602: ERROR_TAG.MFA_SESSION_EXPIRED,
    603: ERROR_TAG.MFA_ALREADY_ENABLED,
    700: ERROR_TAG.TOKEN_EXPIRED,
    701: ERROR_TAG.SESSION_EXPIRED,
    702: ERROR_TAG.INVALID_CREDENTIALS,
    703: ERROR_TAG.PASSWORD_RESET_REQUIRED,
    704: ERROR_TAG.ACCOUNT_LOCKED,
    800: ERROR_TAG.EMAIL_IN_USE,
    801: ERROR_TAG.REGISTRATION_FAILED,
    802: ERROR_TAG.CONFIRMATION_TOKEN_NOT_FOUND,
    900: ERROR_TAG.UNEXPECTED_ERROR,
    901: ERROR_TAG.GENERAL_ERROR,
    902: ERROR_TAG.UNAUTHORIZED,
    903: ERROR_TAG.FORBIDDEN,
    904: ERROR_TAG.NOT_FOUND,
    1000: ERROR_TAG.SESSION_ERROR,
    1001: ERROR_TAG.SESSION_NOT_FOUND,
    1100: ERROR_TAG.INVALID_STATE,
    1101: ERROR_TAG.UNSUPPORTED_OPERATION,
  };

  return errorTags[errorCode] || null;
}
