import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer les statistiques globales de la plateforme
   */
  async getGlobalStats() {
    const [
      totalClients,
      totalArtisans,
      activeArtisans,
      totalPosts,
      totalReviews,
      totalReports,
      pendingReports
    ] = await Promise.all([
      this.prisma.clientUser.count(),
      this.prisma.artisanUser.count(),
      this.prisma.artisanUser.count({ where: { isActive: true } }),
      this.prisma.post.count(),
      this.prisma.review.count(),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } })
    ]);

    return {
      users: {
        clients: totalClients,
        artisans: {
          total: totalArtisans,
          active: activeArtisans,
          suspended: totalArtisans - activeArtisans
        }
      },
      content: {
        posts: totalPosts,
        reviews: totalReviews,
      },
      moderation: {
        totalReports,
        pendingReports
      }
    };
  }

  /**
   * Liste des clients avec pagination
   */
  async getClients(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.clientUser.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          createdAt: true
        }
      }),
      this.prisma.clientUser.count()
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Modifier le statut (actif/suspendu) d'un client
   */
  async updateClientStatus(id: string, isActive: boolean) {
    const client = await this.prisma.clientUser.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client non trouvé');

    return this.prisma.clientUser.update({
      where: { id },
      data: { isActive },
      select: { id: true, firstName: true, isActive: true }
    });
  }

  /**
   * Liste des artisans avec pagination
   */
  async getArtisans(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.artisanUser.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          companyName: true,
          isActive: true,
          isVerified: true,
          credibilityScore: true,
          averageRating: true,
          createdAt: true
        }
      }),
      this.prisma.artisanUser.count()
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Modifier le statut (actif/suspendu) d'un artisan
   */
  async updateArtisanStatus(id: string, isActive: boolean) {
    const artisan = await this.prisma.artisanUser.findUnique({ where: { id } });
    if (!artisan) throw new NotFoundException('Artisan non trouvé');

    return this.prisma.artisanUser.update({
      where: { id },
      data: { isActive },
      select: { id: true, firstName: true, companyName: true, isActive: true }
    });
  }
}
