import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
