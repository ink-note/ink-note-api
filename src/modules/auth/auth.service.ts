import { MfaService } from '@/domain/mfa/mfa.service';
import { SessionService } from '@/domain/session/session.service';
import { TokensUtilService } from '@/domain/tokens-util/tokens-util.service';
import { UserService } from '@/domain/user/user.service';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { LoginWithEmailDto, RegisterWithEmailDto } from './dtos';
import { FingerPrint } from '@dilanjer/fingerprint';
import { MESSAGES } from '@/shared/constants/messages/en-EN';
import { LoginWithTOTPDto } from './dtos/Login-with-TOTP.dto';
import { UserProfile } from '@/domain/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokensUtilService: TokensUtilService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly mfaService: MfaService,
  ) {}

  async loginWithEmail({ email, password }: LoginWithEmailDto, fingerprint: FingerPrint) {
    const user = await this.userService.validate({ email, password });

    if (!user) {
      throw new BadRequestException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const mfaOptionsList = await this.mfaService.findManyByUserId({ userId: user.id });

    if (mfaOptionsList) {
      const mfaOptions = this.mfaService.prepareMfaOptionsData(mfaOptionsList);
      const temporaryLoginToken = this.tokensUtilService.createTemporaryLoginToken(user.id);
      return { mfaOptions, temporaryLoginToken };
    }

    const session = await this.sessionService.createNewOrFindSession({ user, fingerprint, isInitialSession: false });
    const tokens = this.tokensUtilService.createTokens(user, session, fingerprint);

    const userProfile = this.userService.prepareUserProfileData(user);

    return { userProfile, tokens };
  }

  async loginWithTOTP(temporaryLoginToken: string, data: LoginWithTOTPDto, fingerprint: FingerPrint) {
    if (!temporaryLoginToken) {
      throw new BadRequestException(MESSAGES.MFA.SESSION_NOT_FOUND);
    }

    const userData = this.tokensUtilService.verifyTemporaryLoginToken(temporaryLoginToken);

    if (!userData) {
      throw new BadRequestException(MESSAGES.MFA.SESSION_NOT_FOUND);
    }

    const mfaIsValid = await this.mfaService.verifyTOTP(data);

    if (!mfaIsValid) {
      throw new BadRequestException(MESSAGES.MFA.INCORRECT_TOTP);
    }

    const user = await this.userService.findOneById({ id: userData.userId });

    const session = await this.sessionService.createNewOrFindSession({ user, fingerprint });
    const tokens = this.tokensUtilService.createTokens(user, session, fingerprint);

    const userProfile = this.userService.prepareUserProfileData(user);

    return { userProfile, tokens };
  }

  async registerWithEmail(data: RegisterWithEmailDto, fingerprint: FingerPrint) {
    const userExit = await this.userService.findOneByEmail({ email: data.email });

    if (userExit) {
      throw new ConflictException(MESSAGES.AUTH.EMAIL_IN_USE);
    }

    const user = await this.userService.create(data);
    const session = await this.sessionService.createNewOrFindSession({ user, fingerprint, isInitialSession: true });
    const tokens = await this.tokensUtilService.createTokens(user, session, fingerprint);

    const userProfile = await this.userService.prepareUserProfileData(user);
    return { userProfile, tokens };
  }

  async logout(user: UserProfile, fingerprint: FingerPrint): Promise<string> {
    const session = await this.sessionService.findFirstByFingerPrintIdAndUserId({
      fingerprintId: fingerprint.id,
      userId: user.id,
    });

    if (!session) {
      throw new BadRequestException(MESSAGES.AUTH.SESSION_ERROR);
    }

    const sessionDeleted = await this.sessionService.deleteOneById(session.id);

    if (!sessionDeleted) {
      throw new BadRequestException(MESSAGES.AUTH.SESSION_ERROR);
    }

    return MESSAGES.AUTH.LOGOUT_SUCCESS;
  }
}
