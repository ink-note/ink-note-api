export enum ERROR_TAG {
  // Authentication errors
  MFA_REQUIRED = 'MFA_REQUIRED', // Two-Factor Authentication required
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED', // Authentication failed
  INVALID_TOKEN = 'INVALID_TOKEN', // Invalid or expired token
  USER_NOT_FOUND = 'USER_NOT_FOUND', // User not found
  USER_BANNED = 'USER_BANNED', // User is banned
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED', // User is not verified

  // Access and permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED', // No permission to perform this action
  ACCESS_DENIED = 'ACCESS_DENIED', // Access denied
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND', // Requested resource not found
  ACTION_NOT_ALLOWED = 'ACTION_NOT_ALLOWED', // Action is not allowed for the current user

  // Data-related errors
  INVALID_INPUT = 'INVALID_INPUT', // Invalid input provided
  DATA_CONFLICT = 'DATA_CONFLICT', // Data conflict (e.g., when creating a record)
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY', // Duplicate entry
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT', // Invalid email format
  INVALID_PASSWORD_FORMAT = 'INVALID_PASSWORD_FORMAT', // Invalid password format

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR', // Internal server error
  DATABASE_ERROR = 'DATABASE_ERROR', // Database error
  SERVER_UNAVAILABLE = 'SERVER_UNAVAILABLE', // Server is unavailable
  MAINTENANCE_MODE = 'MAINTENANCE_MODE', // Server in maintenance mode

  // Two-factor authentication (2FA) errors
  TOTP_FAILED = 'TOTP_FAILED', // OTP verification failed
  BACKUP_CODE_FAILED = 'BACKUP_CODE_FAILED', // Backup code verification failed
  MFA_SESSION_EXPIRED = 'MFA_SESSION_EXPIRED', // MFA session expired
  MFA_ALREADY_ENABLED = 'MFA_ALREADY_ENABLED', // MFA is already enabled

  // Data processing errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED', // Token has expired
  SESSION_EXPIRED = 'SESSION_EXPIRED', // Session expired
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS', // Invalid credentials
  PASSWORD_RESET_REQUIRED = 'PASSWORD_RESET_REQUIRED', // Password reset required
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED', // Account is locked

  // Registration and confirmation errors
  EMAIL_IN_USE = 'EMAIL_IN_USE', // Email is already in use
  REGISTRATION_FAILED = 'REGISTRATION_FAILED', // Registration failed
  CONFIRMATION_TOKEN_NOT_FOUND = 'CONFIRMATION_TOKEN_NOT_FOUND', // Confirmation token not found

  // General errors
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR', // Unexpected error
  GENERAL_ERROR = 'GENERAL_ERROR', // General error
  UNAUTHORIZED = 'UNAUTHORIZED', // Unauthorized access
  FORBIDDEN = 'FORBIDDEN', // Forbidden access
  NOT_FOUND = 'NOT_FOUND', // Resource not found

  // Session handling errors
  SESSION_ERROR = 'SESSION_ERROR', // Session error
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND', // Session not found

  // Other errors
  INVALID_STATE = 'INVALID_STATE', // Invalid state
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION', // Operation not supported
}
