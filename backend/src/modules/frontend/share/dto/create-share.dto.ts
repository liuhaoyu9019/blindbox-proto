import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateShareDto {
  @IsString()
  cardId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;
}
