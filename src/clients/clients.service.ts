import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère le profil complet d'un client connecté
   */
  async getProfile(userId: string) {
    const client = await this.prisma.clientUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        city: true,
        neighborhood: true,
        latitude: true,
        longitude: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
      }
    });

    if (!client) {
      throw new NotFoundException('Client introuvable');
    }
    return client;
  }

  /**
   * Met à jour les informations du profil client
   */
  async updateProfile(userId: string, dto: UpdateClientDto) {
    return this.prisma.clientUser.update({
      where: { id: userId },
      data: {
        ...dto
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        city: true,
        neighborhood: true,
        latitude: true,
        longitude: true,
        avatarUrl: true,
      }
    });
  }

  /**
   * Met à jour l'avatar (URL Cloudinary) du client
   */
  async uploadAvatar(userId: string, avatarUrl: string) {
    return this.prisma.clientUser.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  // ==========================================
  // FAVORIS
  // ==========================================
  
  async getFavorites(userId: string) {
    const favorites = await this.prisma.favoriteArtisan.findMany({
      where: { clientId: userId },
      include: {
        artisan: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            avatarUrl: true,
            averageRating: true,
            city: true,
            neighborhood: true,
            services: {
              take: 1, // Prendre le premier service comme exemple de "catégorie/prix"
              select: { title: true, price: true, minPrice: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Formatter pour le frontend
    return favorites.map(f => {
      const artisan = f.artisan;
      const service = artisan.services.length > 0 ? artisan.services[0] : null;
      let priceText = 'Sur devis';
      if (service?.price) priceText = `${service.price} FCFA`;
      else if (service?.minPrice) priceText = `À partir de ${service.minPrice} FCFA`;
      
      return {
        id: artisan.id,
        title: artisan.companyName || `${artisan.firstName} ${artisan.lastName}`,
        category: service?.title || 'Artisan',
        price: priceText,
        avatarUrl: artisan.avatarUrl,
        rating: artisan.averageRating,
      };
    });
  }

  async addFavorite(userId: string, artisanId: string) {
    // Vérifier que l'artisan existe
    const artisan = await this.prisma.artisanUser.findUnique({ where: { id: artisanId }});
    if (!artisan) throw new NotFoundException('Artisan introuvable');
    
    return this.prisma.favoriteArtisan.upsert({
      where: {
        clientId_artisanId: { clientId: userId, artisanId }
      },
      update: {},
      create: {
        clientId: userId,
        artisanId: artisanId
      }
    });
  }

  async removeFavorite(userId: string, artisanId: string) {
    try {
      await this.prisma.favoriteArtisan.delete({
        where: {
          clientId_artisanId: { clientId: userId, artisanId }
        }
      });
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Favori non trouvé' };
    }
  }

  // ==========================================
  // HISTORIQUE DE RECHERCHE
  // ==========================================

  async getSearchHistory(userId: string) {
    return this.prisma.searchHistory.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limiter aux 20 dernières recherches
    });
  }

  async addSearchHistory(userId: string, query: string, location: string, resultsCount: number) {
    return this.prisma.searchHistory.create({
      data: {
        clientId: userId,
        query,
        location,
        resultsCount
      }
    });
  }

  async clearSearchHistory(userId: string) {
    await this.prisma.searchHistory.deleteMany({
      where: { clientId: userId }
    });
    return { success: true };
  }
}
