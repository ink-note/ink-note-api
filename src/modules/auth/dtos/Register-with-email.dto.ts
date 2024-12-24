import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterWithEmailDto {
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  @IsEmail()
  @ApiProperty({
    description: 'User email for signing up.',
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
    description: 'User password for signing up.',
    minLength: 2,
    maxLength: 40,
    example: 'Password123',
  })
  password: string;

  @IsString()
  @Matches(/^[A-Za-z]+$/, { message: 'First name can only contain letters.' })
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty({
    description: 'User first name for signing up.',
    example: 'John',
    minLength: 2,
    maxLength: 40,
  })
  firstName: string;

  @IsString()
  @Matches(/^[A-Za-z]+$/, { message: 'First name can only contain letters.' })
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty({
    description: 'User last name for signing up.',
    example: 'Doe',
    minLength: 2,
    maxLength: 40,
  })
  lastName: string;
}
