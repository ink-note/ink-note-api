import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  mfaId: string;

  @IsString()
  @ApiProperty({
    description: 'Two factor authentication code.',
    example: '123456',
    minLength: 6,
    required: true,
  })
  code: string;
}
