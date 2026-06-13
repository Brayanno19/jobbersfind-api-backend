import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;
}
