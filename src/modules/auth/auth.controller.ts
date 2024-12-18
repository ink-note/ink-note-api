import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SignInDto, SignUpDto } from './dtos';
import { FingerPrint, Fingerprint } from '@dilanjer/fingerprint';
import { COOKIES } from '@/shared/constants/enums/cookies';
import { Response } from 'express';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { MESSAGES } from '@/shared/constants/messages/en-EN';
import { IssueTokens } from './session/types';
import { AuthGuard } from '@/common/guards/auth';
import { UserSessionType } from './types';
import { User } from '@/common/decorators/User';
import { DURATIONS } from '@/shared/constants/enums/durations';
import { ROUTES } from '@/common/constants/routes';

@Controller(ROUTES.AUTH.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign in user', description: 'Endpoint to sign in a user.' })
  @ApiBody({ type: SignInDto, description: 'User credentials for signing in.' })
  @Post(ROUTES.AUTH.SIGN_IN)
  async signIn(@Body() data: SignInDto, @Fingerprint() fingerprint: FingerPrint, @Res({ passthrough: true }) res: Response) {
    const { tokens, userProfile, mfaPublicData, mfaTemporaryToken } = await this.authService.signIn(data, fingerprint);

    if (mfaPublicData) {
      res.cookie('2fa-token', mfaTemporaryToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: DURATIONS.SESSION_TOKEN_DURATION,
      });
      return new ResponseWrapper({ data: { mfaPublicData, mfaTemporaryToken } });
    }

    this.setTokensCookies(res, tokens);

    return new ResponseWrapper({ data: userProfile });
  }

  @ApiOperation({ summary: 'Sign up user', description: 'Endpoint to sign up a new user.' })
  @ApiBody({ type: SignUpDto, description: 'User details for signing up.' })
  @Post(ROUTES.AUTH.SIGN_UP)
  async signUp(@Body() data: SignUpDto, @Fingerprint() fingerprint: FingerPrint, @Res({ passthrough: true }) res: Response) {
    const { tokens, userProfile } = await this.authService.signUp(data, fingerprint);

    this.setTokensCookies(res, tokens);

    return new ResponseWrapper({ message: MESSAGES.SUCCESS.EMAIL_SENT, data: userProfile });
  }

  @AuthGuard()
  @Get(ROUTES.AUTH.LOGOUT)
  async logout(@User() user: UserSessionType, @Res({ passthrough: true }) res: Response) {
    const message = await this.authService.logout(user);
    this.removeTokensCookies(res);
    return new ResponseWrapper(message);
  }

  private setTokensCookies(res: Response, tokens: IssueTokens) {
    const { access_token, session_token } = tokens;

    res.cookie(COOKIES.ACCESS_TOKEN, access_token, {
      sameSite: 'lax',
      maxAge: DURATIONS.ACCESS_TOKEN_DURATION,
    });
    res.cookie(COOKIES.SESSION_TOKEN, session_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: DURATIONS.SESSION_TOKEN_DURATION,
    });
  }

  private removeTokensCookies(res: Response) {
    res.clearCookie(COOKIES.ACCESS_TOKEN);
    res.clearCookie(COOKIES.SESSION_TOKEN);
  }
}
