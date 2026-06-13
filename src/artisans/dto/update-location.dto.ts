import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
