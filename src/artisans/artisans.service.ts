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
        services: true,
        portfolio: true,
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
      if (domainIds.length > 4) {
        throw new BadRequestException('Un artisan ne peut avoir que 4 métiers maximum.');
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
  /**
   * Mettre à jour l'avatar (URL Cloudinary) de l'artisan
   */
  async uploadAvatar(userId: string, avatarUrl: string) {
    return this.prisma.artisanUser.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  // =========================================================================
  // SERVICES (Prestations de l'artisan)
  // =========================================================================
  
  async addService(userId: string, data: { title: string; description?: string; price?: number }) {
    return this.prisma.artisanService.create({
      data: {
        artisanId: userId,
        title: data.title,
        description: data.description,
        price: data.price ? Number(data.price) : null,
      }
    });
  }

  async updateService(userId: string, serviceId: string, data: { title?: string; description?: string; price?: number }) {
    // Vérifier que le service appartient bien à l'artisan
    const service = await this.prisma.artisanService.findUnique({ where: { id: serviceId }});
    if (!service || service.artisanId !== userId) {
      throw new NotFoundException('Service introuvable ou accès refusé');
    }

    return this.prisma.artisanService.update({
      where: { id: serviceId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price !== undefined ? (data.price ? Number(data.price) : null) : undefined,
      }
    });
  }

  async deleteService(userId: string, serviceId: string) {
    const service = await this.prisma.artisanService.findUnique({ where: { id: serviceId }});
    if (!service || service.artisanId !== userId) {
      throw new NotFoundException('Service introuvable ou accès refusé');
    }
    return this.prisma.artisanService.delete({ where: { id: serviceId }});
  }

  // =========================================================================
  // PORTFOLIO (Réalisations en images/vidéos)
  // =========================================================================
  
  async addPortfolioItem(userId: string, data: { title?: string; mediaUrl: string; mediaType: string }) {
    return this.prisma.portfolioItem.create({
      data: {
        artisanId: userId,
        title: data.title,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
      }
    });
  }

  async deletePortfolioItem(userId: string, itemId: string) {
    const item = await this.prisma.portfolioItem.findUnique({ where: { id: itemId }});
    if (!item || item.artisanId !== userId) {
      throw new NotFoundException('Élément du portfolio introuvable ou accès refusé');
    }
    return this.prisma.portfolioItem.delete({ where: { id: itemId }});
  }
}
