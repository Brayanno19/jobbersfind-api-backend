import { Module } from '@nestjs/common';
import { ArtisansController } from './artisans.controller';
import { ArtisansService } from './artisans.service';
import { PrismaModule } from '../common/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [ArtisansController],
  providers: [ArtisansService],
  exports: [ArtisansService],
})
export class ArtisansModule {}
