import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Rarity } from '@prisma/client';

export class CreateItemDto {
  @IsString()
  seriesId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subtitle?: string;

  @IsString()
  @MaxLength(10)
  emoji: string;

  @IsEnum(Rarity)
  rarity: Rarity;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(1)
  seriesIndex: number;
}
