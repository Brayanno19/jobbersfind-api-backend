import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsNotEmpty()
  @IsString()
  query: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  radius?: number = 10; // Par défaut 10 km
}
