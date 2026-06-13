import { IsNotEmpty, IsInt, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
