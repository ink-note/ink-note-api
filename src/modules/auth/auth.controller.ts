import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SignInDto, SignUpDto } from './dtos';
import { FingerPrint, Fingerprint } from '@dilanjer/fingerprint';
import { IssueTokens } from './types';
import { COOKIES } from '@/shared/constants/enums/cookies';
import { ms } from '@/shared/utils/ms';
import { Response } from 'express';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { MESSAGES } from '@/shared/constants/messages/en-EN';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign in user', description: 'Endpoint to sign in a user.' })
  @ApiBody({ type: SignInDto, description: 'User credentials for signing in.' })
  @Post('signin')
  async signin(@Body() data: SignInDto, @Fingerprint() fingerprint: FingerPrint, @Res({ passthrough: true }) res: Response) {
    const { tokens, userProfile } = await this.authService.signIn(data, fingerprint);

    this.setTokensCookies(res, tokens);

    return new ResponseWrapper({ data: userProfile });
  }

  @ApiOperation({ summary: 'Sign up user', description: 'Endpoint to sign up a new user.' })
  @ApiBody({ type: SignUpDto, description: 'User details for signing up.' })
  @Post('signup')
  async signup(@Body() data: SignUpDto, @Fingerprint() fingerprint: FingerPrint, @Res({ passthrough: true }) res: Response) {
    const { tokens, userProfile } = await this.authService.signUp(data, fingerprint);

    this.setTokensCookies(res, tokens);

    return new ResponseWrapper({ message: MESSAGES.SUCCESS.EMAIL_SENT, data: userProfile });
  }

  private setTokensCookies(res: Response, cookies: IssueTokens) {
    const { access_token, refresh_token } = cookies;

    res.cookie(COOKIES.ACCESS_TOKEN, access_token, {
      sameSite: 'lax',
      maxAge: ms(COOKIES.ACCESS_TOKEN_DURATION),
    });
    res.cookie(COOKIES.REFRESH_TOKEN, refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ms(COOKIES.REFRESH_TOKEN_DURATION),
    });
  }

  private removeTokensCookies(res: Response) {
    res.clearCookie(COOKIES.ACCESS_TOKEN);
    res.clearCookie(COOKIES.REFRESH_TOKEN);
  }
}
