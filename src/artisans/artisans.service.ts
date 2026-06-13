import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateArtisanDto } from './dto/update-artisan.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class ArtisansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Consulter son profil avec toutes les relations
   */
  async getProfile(userId: string) {
    const artisan = await this.prisma.artisanUser.findUnique({
      where: { id: userId },
      include: {
        domains: true,
        documents: true,
        videos: true,
      }
    });

    if (!artisan) {
      throw new NotFoundException('Artisan introuvable');
    }
    // Exclusion du mot de passe
    const { password, ...result } = artisan;
    return result;
  }

  /**
   * Mettre à jour les infos textuelles et les métiers (max 3)
   */
  async updateProfile(userId: string, dto: UpdateArtisanDto) {
    const { domainIds, ...basicData } = dto;

    const updateData: any = { ...basicData };

    // Remplacement des domaines existants
    if (domainIds) {
      if (domainIds.length > 3) {
        throw new BadRequestException('Un artisan ne peut avoir que 3 métiers maximum.');
      }
      updateData.domains = {
        set: domainIds.map(id => ({ id })) 
      };
    }

    const artisan = await this.prisma.artisanUser.update({
      where: { id: userId },
      data: updateData,
      include: {
        domains: true,
      }
    });

    const { password, ...result } = artisan;
    return result;
  }

  /**
   * Mettre à jour uniquement les coordonnées géographiques
   */
  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const artisan = await this.prisma.artisanUser.update({
      where: { id: userId },
      data: {
        ...dto
      }
    });
    const { password, ...result } = artisan;
    return result;
  }

  /**
   * Ajouter un document (Upload)
   */
  async addDocument(userId: string, type: string, url: string) {
    return this.prisma.artisanDocument.create({
      data: {
        artisanId: userId,
        type,
        url,
        status: 'PENDING',
      }
    });
  }

  /**
   * Ajouter une vidéo (Upload)
   */
  async addVideo(userId: string, type: string, url: string) {
    return this.prisma.artisanVideo.create({
      data: {
        artisanId: userId,
        type,
        url,
      }
    });
  }
}
