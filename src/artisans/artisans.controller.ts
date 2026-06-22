import { Controller, Get, Patch, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile, BadRequestException, Param, Delete } from '@nestjs/common';
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

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Fichier image manquant');
    const avatarUrl = await this.uploadsService.uploadFile(file, 'jobbersfind/avatars');
    return this.artisansService.uploadAvatar(req.user.userId, avatarUrl);
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

  // =========================================================================
  // SERVICES
  // =========================================================================

  @Post('me/services')
  addService(@Request() req, @Body() body: { title: string; description?: string; price?: number }) {
    return this.artisansService.addService(req.user.userId, body);
  }

  @Patch('me/services/:serviceId')
  updateService(@Request() req, @Param('serviceId') serviceId: string, @Body() body: { title?: string; description?: string; price?: number }) {
    return this.artisansService.updateService(req.user.userId, serviceId, body);
  }

  @Delete('me/services/:serviceId')
  deleteService(@Request() req, @Param('serviceId') serviceId: string) {
    return this.artisansService.deleteService(req.user.userId, serviceId);
  }

  // =========================================================================
  // PORTFOLIO
  // =========================================================================

  @Post('me/portfolio')
  @UseInterceptors(FileInterceptor('file'))
  async addPortfolioItem(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('mediaType') mediaType: string = 'IMAGE',
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    const url = await this.uploadsService.uploadFile(file, 'jobbersfind/portfolio');
    return this.artisansService.addPortfolioItem(req.user.userId, { title, mediaUrl: url, mediaType });
  }

  @Delete('me/portfolio/:itemId')
  deletePortfolioItem(@Request() req, @Param('itemId') itemId: string) {
    return this.artisansService.deletePortfolioItem(req.user.userId, itemId);
  }
}
