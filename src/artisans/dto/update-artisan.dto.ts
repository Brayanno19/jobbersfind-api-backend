import { IsOptional, IsString, IsEmail, IsArray, ArrayMaxSize } from 'class-validator';

export class UpdateArtisanDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3, { message: 'Un artisan peut avoir au maximum 3 métiers' })
  domainIds?: string[];
}
