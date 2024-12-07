import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum TwoFactorType {
  TOTP = 'totp',
  BACKUP_CODE = 'backupCode',
}

export class SignInDto {
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsEmail()
  @ApiProperty({
    description: 'User email for signing in.',
    format: 'email',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one letter and one number.',
  })
  @ApiProperty({
    description: 'User password for signing in.',
    minLength: 2,
    maxLength: 40,
    example: 'password123',
  })
  password: string;

  // @IsString()
  // @IsOptional()
  // @MinLength(6)
  // @MaxLength(6)
  // @ApiProperty({
  //   description: 'Two factor authentication code.',
  //   example: '123456',
  //   minLength: 6,
  //   required: false,
  // })
  // twoFactorCode?: string;

  // @IsEnum(TwoFactorType)
  // @ValidateIf((o) => o.twoFactorCode !== undefined)
  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description:
  //     'Type of two-factor authentication (e.g., TOTP or backup code).',
  //   enum: TwoFactorType,
  //   required: false,
  //   default: TwoFactorType.TOTP,
  // })
  // twoFactorType?: TwoFactorType;
}
