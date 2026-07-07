import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer les statistiques globales de la plateforme
   */
  async getGlobalStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalClients,
      totalArtisans,
      activeArtisans,
      totalPosts,
      totalReviews,
      totalReports,
      pendingReports,
      recentClients,
      recentArtisans,
      last7DaysClients,
      last7DaysArtisans
    ] = await Promise.all([
      this.prisma.clientUser.count(),
      this.prisma.artisanUser.count(),
      this.prisma.artisanUser.count({ where: { isActive: true } }),
      this.prisma.post.count(),
      this.prisma.review.count(),
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.clientUser.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, isActive: true }
      }),
      this.prisma.artisanUser.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, companyName: true, createdAt: true, isVerified: true, isActive: true }
      }),
      this.prisma.clientUser.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      }),
      this.prisma.artisanUser.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      })
    ]);

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const chartData: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dStr = d.toISOString().split('T')[0];

      const cCount = last7DaysClients.filter(c => c.createdAt.toISOString().split('T')[0] === dStr).length;
      const aCount = last7DaysArtisans.filter(a => a.createdAt.toISOString().split('T')[0] === dStr).length;

      chartData.push({
        name: dayName,
        clients: cCount,
        artisans: aCount
      });
    }

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
      },
      recentActivity: {
        clients: recentClients,
        artisans: recentArtisans
      },
      chartData
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

  /**
   * --- CATEGORIES (JobDomain) ---
   */
  async getCategories() {
    return this.prisma.jobDomain.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { artisans: true }
        }
      }
    });
  }

  async createCategory(data: { name: string, description?: string, isActive?: boolean }) {
    return this.prisma.jobDomain.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true
      }
    });
  }

  async updateCategory(id: string, data: { name?: string, description?: string, isActive?: boolean }) {
    const category = await this.prisma.jobDomain.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Catégorie non trouvée');
    
    return this.prisma.jobDomain.update({
      where: { id },
      data
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.jobDomain.findUnique({ where: { id }, include: { artisans: true } });
    if (!category) throw new NotFoundException('Catégorie non trouvée');
    
    if (category.artisans.length > 0) {
      await this.prisma.jobDomain.update({
        where: { id },
        data: { isActive: false }
      });
      return { success: true, message: 'Catégorie désactivée car elle contient des artisans' };
    }
    
    await this.prisma.jobDomain.delete({ where: { id } });
    return { success: true, message: 'Catégorie supprimée avec succès' };
  }

  /**
   * --- NOTIFICATIONS GLOBALES ---
   */
  async broadcastNotification(data: { title: string, body: string, target: 'CLIENTS' | 'ARTISANS' | 'ALL' }) {
    let clients: any[] = [];
    let artisans: any[] = [];

    if (data.target === 'CLIENTS' || data.target === 'ALL') {
      clients = await this.prisma.clientUser.findMany({ select: { id: true } });
    }
    if (data.target === 'ARTISANS' || data.target === 'ALL') {
      artisans = await this.prisma.artisanUser.findMany({ select: { id: true } });
    }

    const notifications: any[] = [];
    
    for (const c of clients) {
      notifications.push({
        userId: c.id,
        userRole: 'CLIENT',
        title: data.title,
        body: data.body,
        isRead: false
      });
    }

    for (const a of artisans) {
      notifications.push({
        userId: a.id,
        userRole: 'ARTISAN',
        title: data.title,
        body: data.body,
        isRead: false
      });
    }

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications
      });
    }

    return { success: true, count: notifications.length, message: 'Notifications envoyées avec succès' };
  }
}

