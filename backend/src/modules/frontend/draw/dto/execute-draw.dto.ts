import { IsString } from 'class-validator';

export class ExecuteDrawDto {
  @IsString()
  seriesId: string;
}
