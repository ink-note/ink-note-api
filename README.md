# Todo

## kernel/mfa

- Create temporary session for each user.
- Verify and create MFA method.
- Add support for email MFA.
- Add support for TOTP (Time-Based One-Time Password).
- Add support for push notification-based MFA.
- Implement fallback mechanisms for MFA.
- Clean up unnecessary logs.
- Add logs for MFA-related events (successful setup, verification, etc.).
- Implement MFA recovery options (e.g., backup codes, account recovery).
- Test MFA flows for edge cases (e.g., expired codes, incorrect attempts).

## kernel/auth-core

- Create login methods.
- Login with email/password.
- Login with MFA.
- Login with OAuth providers (Google, GitHub, etc.).
- Login with social sign-in (optional).
- Register new users.
- Refresh access tokens.
- Logout user.
- Revoke individual session.
- Cancel all sessions except the current session.
- Implement session expiration.
- Get login options (available methods for the user).
- Get MFA options (configured methods for the user).
- Enforce password strength and security requirements.
- Send email notifications for login events.
- Rate-limit login attempts to prevent brute force attacks.
- Handle account lockout after repeated failed login attempts.
- Add audit logging for authentication events.
- Test for vulnerabilities (e.g., session fixation, replay attacks).
