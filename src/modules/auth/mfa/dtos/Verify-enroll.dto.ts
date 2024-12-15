import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class VerifyEnrollDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Code must be a 6-digit number' })
  code: string;

  @IsNotEmpty()
  @IsString()
  friendlyName: string;
}
