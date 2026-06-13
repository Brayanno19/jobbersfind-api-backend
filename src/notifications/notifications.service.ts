import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enregistrer ou mettre à jour le token FCM d'un utilisateur
   */
  async registerToken(userId: string, role: string, fcmToken: string) {
    if (role === 'CLIENT') {
      await this.prisma.clientUser.update({
        where: { id: userId },
        data: { fcmToken },
      });
    } else if (role === 'ARTISAN') {
      await this.prisma.artisanUser.update({
        where: { id: userId },
        data: { fcmToken },
      });
    }

    this.logger.log(`Jeton FCM mis à jour pour l'utilisateur ${userId} (${role})`);
    return { message: 'Jeton FCM enregistré avec succès' };
  }

  /**
   * Récupérer les notifications de l'utilisateur connecté
   */
  async getNotificationsForUser(userId: string, role: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        userRole: role,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string, userId: string, role: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
        userRole: role,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Envoyer une notification (Interne / FCM Mock)
   */
  async sendNotification(recipientId: string, recipientRole: string, title: string, body: string) {
    // 1. Sauvegarder dans l'historique de la DB
    const dbNotification = await this.prisma.notification.create({
      data: {
        userId: recipientId,
        userRole: recipientRole,
        title,
        body,
        isRead: false,
      },
    });

    // 2. Récupérer le token FCM de l'utilisateur
    let fcmToken: string | null = null;

    if (recipientRole === 'CLIENT') {
      const client = await this.prisma.clientUser.findUnique({
        where: { id: recipientId },
        select: { fcmToken: true },
      });
      fcmToken = client?.fcmToken || null;
    } else if (recipientRole === 'ARTISAN') {
      const artisan = await this.prisma.artisanUser.findUnique({
        where: { id: recipientId },
        select: { fcmToken: true },
      });
      fcmToken = artisan?.fcmToken || null;
    }

    // 3. Envoyer la notification push via FCM (Mock pour la V1)
    if (fcmToken) {
      this.logger.log(
        `[FCM MOCK] Envoi du push à l'appareil (${fcmToken}) - Titre: "${title}", Message: "${body}"`
      );
      // Ici sera intégrée la logique admin.messaging().send() de firebase-admin
    } else {
      this.logger.log(
        `[FCM MOCK] Pas de token enregistré pour l'utilisateur ${recipientId}. Notification enregistrée uniquement en DB.`
      );
    }

    return dbNotification;
  }
}
