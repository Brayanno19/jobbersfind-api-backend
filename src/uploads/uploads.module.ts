import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryProvider, UploadsService],
  exports: [CloudinaryProvider, UploadsService],
})
export class UploadsModule {}
