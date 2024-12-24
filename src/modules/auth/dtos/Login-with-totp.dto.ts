import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCuid } from '@/common/validators/is-cuid';

export class LoginWithTOTPDto {
  @IsString()
  @IsCuid({ message: 'mfaSettingsId must be a valid CUID.' })
  @ApiProperty({
    description: 'The unique identifier for the MFA settings in CUID format.',
    example: 'cjh3ulz800001qnv4y5q2e4zz',
  })
  mfaSettingsId: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({
    description: 'Two factor authentication code.',
    example: '123456',
    minLength: 6,
    required: false,
  })
  code: string;
}
