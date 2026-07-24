import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging, Message, MulticastMessage } from 'firebase-admin/messaging';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Initialisation de Firebase Admin SDK
    try {
      if (!getApps().length) {
        initializeApp({
          // Si la variable d'environnement GOOGLE_APPLICATION_CREDENTIALS est définie,
          // credential.applicationDefault() fonctionnera automatiquement.
          credential: applicationDefault(),
        });
        this.logger.log('Firebase Admin SDK initialisé avec succès.');
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'initialisation de Firebase Admin SDK', error);
    }
  }

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
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId: string, role: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        userRole: role,
        isRead: false,
      },
    });
    return { count };
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string, role: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        userRole: role,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { message: `${result.count} notifications marquées comme lues` };
  }

  /**
   * Supprimer une notification spécifique
   */
  async deleteNotification(id: string, userId: string, role: string) {
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

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification supprimée avec succès' };
  }

  /**
   * Diffuser une notification à un groupe d'utilisateurs (Admin)
   */
  async broadcastNotification(adminId: string, targetRole: string, title: string, body: string, type: string) {
    let users: { id: string, fcmToken: string | null, role: string }[] = [];

    // 1. Récupérer les cibles
    if (targetRole === 'ALL' || targetRole === 'CLIENT') {
      const clients = await this.prisma.clientUser.findMany({
        where: { isActive: true },
        select: { id: true, fcmToken: true },
      });
      users = [...users, ...clients.map(c => ({ ...c, role: 'CLIENT' }))];
    }
    
    if (targetRole === 'ALL' || targetRole === 'ARTISAN') {
      const artisans = await this.prisma.artisanUser.findMany({
        where: { isActive: true },
        select: { id: true, fcmToken: true },
      });
      users = [...users, ...artisans.map(a => ({ ...a, role: 'ARTISAN' }))];
    }

    if (users.length === 0) {
      return { message: 'Aucun utilisateur ciblé trouvé', sentCount: 0 };
    }

    // 2. Enregistrer l'historique du broadcast
    const broadcastLog = await this.prisma.broadcastLog.create({
      data: {
        adminId,
        targetRole,
        title,
        body,
        type,
        sentCount: users.length,
      },
    });

    // 3. Préparer les notifications individuelles en base de données
    const dbNotifications = users.map(u => ({
      userId: u.id,
      userRole: u.role,
      title,
      body,
      type,
      isRead: false,
    }));

    await this.prisma.notification.createMany({
      data: dbNotifications,
    });

    // 4. Envoi FCM en masse
    const fcmTokens = users.map(u => u.fcmToken).filter(token => token !== null && token !== '') as string[];
    
    if (fcmTokens.length > 0) {
      try {
        const payload: MulticastMessage = {
          tokens: fcmTokens,
          notification: { title, body },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            type,
          },
          android: {
            priority: 'high',
            notification: { sound: 'default' },
          },
          apns: {
            payload: {
              aps: { sound: 'default' },
            },
          },
        };

        const response = await getMessaging().sendEachForMulticast(payload);
        this.logger.log(`Broadcast FCM envoyé: ${response.successCount} succès, ${response.failureCount} échecs`);
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi broadcast FCM`, error);
      }
    }

    return { 
      message: 'Diffusion effectuée avec succès', 
      broadcastId: broadcastLog.id,
      sentCount: users.length,
      fcmSent: fcmTokens.length
    };
  }

  /**
   * Obtenir l'historique des diffusions (Admin) avec pagination
   */
  async getBroadcastHistory(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.broadcastLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.broadcastLog.count(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Envoyer une notification (Interne + Push FCM réel)
   */
  async sendNotification(recipientId: string, recipientRole: string, title: string, body: string, data?: any) {
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

    // 3. Envoyer la notification push via FCM (Réel)
    if (fcmToken) {
      try {
        const payload: Message = {
          token: fcmToken,
          notification: {
            title,
            body,
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            notificationId: dbNotification.id,
            ...data, // Données additionnelles pour la navigation côté Flutter
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
            },
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1, // Le badge pourrait être calculé avec getUnreadCount()
              },
            },
          },
        };

        const response = await getMessaging().send(payload);
        this.logger.log(`Push FCM envoyé avec succès à ${fcmToken}. ID: ${response}`);
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi du push FCM à ${fcmToken}`, error);
      }
    } else {
      this.logger.log(
        `[FCM] Pas de token enregistré pour l'utilisateur ${recipientId}. Notification enregistrée uniquement en DB.`
      );
    }

    return dbNotification;
  }
}
