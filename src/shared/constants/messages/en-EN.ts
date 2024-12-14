// src/constants/messages.ts

export const MESSAGES = {
  AUTH: {
    EMAIL_IN_USE: 'This email is already associated with an account. Use "Forgot Password" to reset it.',
    INVALID_CREDENTIALS: 'Incorrect email or password. Please check and try again.',
    LOGOUT_SUCCESS: 'You have been successfully logged out.',
    SIGNUP_SUCCESS: 'Your account has been created, and a confirmation email has been sent.',
    SESSION_ERROR: 'There was an issue logging out. Please try again later.',
    USER_BANNED: 'Your account has been banned. Please contact support for assistance.',
    USER_NOT_FOUND: 'User not found. Please try logging in again.',
  },
  SUCCESS: {
    DATA_SAVED: 'Your data has been successfully saved.',
    PROFILE_UPDATED: 'Your profile has been updated.',
    EMAIL_SENT: 'A verification email has been sent.',
    USER_CONFIRMATION: 'Your account has been successfully verified. Thank you!',
  },
  ERROR: {
    GENERAL_ERROR: 'An error occurred. Please try again.',
    UNEXPECTED_ERROR: 'We encountered an unexpected error. Please try again later.',
    INVALID_INPUT: 'The provided input is invalid.',
    NOT_FOUND: 'The resource could not be found.',
    CONFIRMATION_TOKEN_NOT_FOUND: 'The token associated with this data could not be located.',
  },
  MFA: {
    ENABLED: 'Two-Factor Authentication (2FA) is now active.',
    DISABLED: 'Two-Factor Authentication (2FA) has been disabled.',
    ALREADY_ENABLED: 'Two-Factor Authentication is already enabled.',
    DISABLED_CURRENTLY: 'Two-Factor Authentication is currently disabled.',
    INCORRECT_TOTP: 'The OTP is incorrect or expired. Please try again.',
    INCORRECT_BACKUP_CODE: 'The Backup Code is incorrect. Please verify and try again.',
    SESSION_NOT_FOUND: 'Unable to find MFA session. Please log in again.',
    REQUIRED: 'Two-Factor Authentication is required. Please complete the verification process.',
  },

  LOGGER: {
    TOKEN_CREATED: 'A confirmation token has been created for user email.',
    USER_SIGNUP_ATTEMPT: 'A user has attempted to sign up with email.',
    PASSWORD_RESET_REQUESTED: 'A password reset request was initiated.',
    PASSWORD_CHANGED: 'A user has successfully updated their password.',
    EMAIL_VERIFICATION_SENT: 'An email verification message was sent.',
    USER_LOGIN: 'A user has logged in successfully.',
    USER_LOGOUT: 'A user has logged out successfully.',
    MFA_SETUP_INITIATED: 'A user has started the setup process for 2FA.',
    MFA_SETUP_COMPLETED: 'A user has successfully completed 2FA setup.',
    UNAUTHORIZED_ACCESS_ATTEMPT: 'An unauthorized access attempt was detected.',
  },
};
