import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
}
