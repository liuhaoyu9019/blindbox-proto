import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(10)
  emoji: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
