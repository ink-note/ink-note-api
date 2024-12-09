import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionTokenGuard extends AuthGuard('jwt-session') {}
