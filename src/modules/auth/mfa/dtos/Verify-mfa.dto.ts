import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({
    description: 'Two factor authentication code.',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    required: true,
  })
  code: string;
}
