import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginWithEmailDto, LoginWithTOTPDto, RegisterWithEmailDto } from './dtos';
import { Fingerprint, FingerPrint } from '@dilanjer/fingerprint';
import { Response } from 'express';
import { COOKIES_NAME, COOKIES_DURATION } from '@/common/constants/cookies';
import { Cookies } from '@/common/decorators/Cookies';
import { AccessTokenGuard } from '@/common/guard/access-token.guard';
import { User } from '@/common/decorators/User';
import { UserProfile } from '@/domain/types';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('loginWithEmail')
  async loginWithEmail(
    @Body() data: LoginWithEmailDto,
    @Fingerprint() Fingerprint: FingerPrint,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { mfaOptions, temporaryLoginToken, tokens, userProfile } = await this.authService.loginWithEmail(data, Fingerprint);

    if (mfaOptions) {
      response.cookie(COOKIES_NAME.MFA_LOGIN_TOKEN, temporaryLoginToken, {
        httpOnly: true,
        maxAge: COOKIES_DURATION.MFA_LOGIN_TOKEN_DURATION,
      });

      return mfaOptions;
    }

    if (tokens) {
      const { access_token, session_token } = tokens;

      response.cookie(COOKIES_NAME.SESSION_TOKEN, session_token, {
        httpOnly: true,
        maxAge: COOKIES_DURATION.SESSION_TOKEN_DURATION,
      });
      return { access_token, userProfile };
    }
  }

  @Post('loginWithTOTP')
  async loginWithTOTP(
    @Body() data: LoginWithTOTPDto,
    @Fingerprint() Fingerprint: FingerPrint,
    @Res({ passthrough: true }) response: Response,
    @Cookies(COOKIES_NAME.MFA_LOGIN_TOKEN) temporaryLoginToken,
  ) {
    const { tokens, userProfile } = await this.authService.loginWithTOTP(temporaryLoginToken, data, Fingerprint);

    const { access_token, session_token } = tokens;

    response.cookie(COOKIES_NAME.SESSION_TOKEN, session_token, {
      httpOnly: true,
      maxAge: COOKIES_DURATION.SESSION_TOKEN_DURATION,
    });

    response.clearCookie(COOKIES_NAME.MFA_LOGIN_TOKEN);
    return { access_token, userProfile };
  }

  @Post('registerWithEmail')
  async registerWithEmail(
    @Body() data: RegisterWithEmailDto,
    @Fingerprint() fingerprint: FingerPrint,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { tokens, userProfile } = await this.authService.registerWithEmail(data, fingerprint);
    const { access_token, session_token } = tokens;

    response.cookie(COOKIES_NAME.SESSION_TOKEN, session_token, {
      httpOnly: true,
      maxAge: COOKIES_DURATION.SESSION_TOKEN_DURATION,
    });

    return { access_token, userProfile };
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(
    @User() user: UserProfile,
    @Fingerprint() fingerprint: FingerPrint,
    @Res({ passthrough: true }) response: Response,
  ) {
    const message = await this.authService.logout(user, fingerprint);

    response.clearCookie(COOKIES_NAME.MFA_LOGIN_TOKEN);
    response.clearCookie(COOKIES_NAME.SESSION_TOKEN);
    return message;
  }
}
