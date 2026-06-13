import { Controller, Get, Patch, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArtisansService } from './artisans.service';
import { UpdateArtisanDto } from './dto/update-artisan.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard, ArtisanGuard } from '../auth/guards/roles.guard';
import { UploadsService } from '../uploads/uploads.service';

@UseGuards(JwtAuthGuard, ArtisanGuard)
@Controller('artisans')
export class ArtisansController {
  constructor(
    private readonly artisansService: ArtisansService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.artisansService.getProfile(req.user.userId);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() dto: UpdateArtisanDto) {
    return this.artisansService.updateProfile(req.user.userId, dto);
  }

  @Patch('me/location')
  updateLocation(@Request() req, @Body() dto: UpdateLocationDto) {
    return this.artisansService.updateLocation(req.user.userId, dto);
  }

  @Post('me/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string, // ex: ID_CARD, PASSPORT, DIPLOMA, CERTIFICATE
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    const url = await this.uploadsService.uploadFile(file, 'jobbersfind/documents');
    return this.artisansService.addDocument(req.user.userId, type, url);
  }

  @Post('me/video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string, // ex: PRESENTATION, PORTFOLIO
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    const url = await this.uploadsService.uploadFile(file, 'jobbersfind/videos');
    return this.artisansService.addVideo(req.user.userId, type, url);
  }
}
