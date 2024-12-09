import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dtos';
import { FingerPrint } from '@dilanjer/fingerprint';
import { UserService } from '../user/user.service';
import { MESSAGES } from '@/shared/constants/messages/en-EN';
import { compare, hash } from 'bcrypt';
import { SessionService } from './session';
import { ReturnSignUpData } from './types';
import { nanoid } from 'nanoid';
import { MfaService } from './mfa/mfa.service';
import { CurrentUserSession } from './strategies/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly mfaService: MfaService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  async signIn(data: SignInDto, fingerprint: FingerPrint) {
    const { email, password } = data;
    const user = await this.userService.findOne({ email });

    if (!user || !(await compare(password, user.password))) {
      throw new BadRequestException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const mfaOptions = await this.mfaService.findMany({ where: { userId: user.id } });

    if (mfaOptions) {
      const mfaPublicData = await Promise.all(mfaOptions.map((mfa) => this.mfaService.getMfaPublicData(mfa)));
      const mfaTemporaryToken = this.mfaService.createTemporaryToken();

      // TODO: save mfaToken to cache

      this.logger.debug({
        message: MESSAGES.MFA.MFA_ENABLED,
        email,
        mfaTemporarySessionToken: mfaTemporaryToken,
      });

      return { mfaPublicData, mfaTemporaryToken };
    }

    const tokens = await this.sessionService.createTokensAndSession({ fingerprint, user });

    const userProfile = this.userService.getUserPublicData(user);
    return { tokens, userProfile };
  }

  async signUp(data: SignUpDto, fingerprint: FingerPrint): Promise<ReturnSignUpData> {
    const { email, password, ...rest } = data;
    const { id: fingerprintId, ...fingerprintRest } = fingerprint;

    const userExist = await this.userService.findOne({ email });

    if (userExist) {
      throw new ConflictException(MESSAGES.AUTH.EMAIL_IN_USE);
    }
    const encryptedPassword = await hash(password, 8);
    const user = await this.userService.create({ password: encryptedPassword, email, ...rest });

    const tokens = await this.sessionService.createTokensAndSession({ fingerprint, user, isFirstSession: true });

    const emailConfirmationToken = nanoid(64);

    this.logger.debug({
      message: MESSAGES.LOGGER.TOKEN_CREATED,
      email,
      token: emailConfirmationToken,
    });

    //TODO: sent email confirmation token and save token in cache

    const userProfile = this.userService.getUserPublicData(user);
    return { tokens, userProfile };
  }

  async logout({ user, session }: CurrentUserSession): Promise<string> {
    const currentSession = await this.sessionService.delete({ id: session.id, userId: user.id });

    if (currentSession === null) {
      throw new BadRequestException(MESSAGES.AUTH.SESSION_ERROR);
    }

    return MESSAGES.AUTH.LOGOUT_SUCCESS;
  }

  logoutAllDevices() {}

  refresh() {}
}
