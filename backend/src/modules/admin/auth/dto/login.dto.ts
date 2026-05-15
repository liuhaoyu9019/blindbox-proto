import { IsString, MinLength, MaxLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
