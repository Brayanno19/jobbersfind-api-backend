import { Controller, Get, Patch, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard, ClientGuard } from '../auth/guards/roles.guard';
import { UploadsService } from '../uploads/uploads.service';

@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Consulter son profil
   */
  @Get('me')
  getProfile(@Request() req) {
    return this.clientsService.getProfile(req.user.userId); // req.user.userId vient du JwtStrategy
  }

  /**
   * Mettre à jour son profil (et sa position géographique)
   */
  @Patch('me')
  updateProfile(@Request() req, @Body() dto: UpdateClientDto) {
    return this.clientsService.updateProfile(req.user.userId, dto);
  }

  /**
   * Uploader / remplacer sa photo de profil
   */
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Fichier image manquant');
    const avatarUrl = await this.uploadsService.uploadFile(file, 'jobbersfind/avatars');
    return this.clientsService.uploadAvatar(req.user.userId, avatarUrl);
  }
}
