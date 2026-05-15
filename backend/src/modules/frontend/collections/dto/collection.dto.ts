import { IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, IsArray, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { Rarity } from '@prisma/client';

export class CollectionListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 50;

  @IsOptional()
  @IsString()
  seriesId?: string;

  @IsOptional()
  @IsEnum(Rarity)
  rarity?: Rarity;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCollected?: boolean;
}

export class CheckCollectionDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  cardIds: string[];
}
