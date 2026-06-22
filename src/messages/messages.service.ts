import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer ou créer une Room entre un Client et un Artisan
   */
  async getOrCreateRoom(clientId: string, artisanId: string) {
    let room = await this.prisma.chatRoom.findUnique({
      where: {
        clientId_artisanId: {
          clientId,
          artisanId,
        },
      },
    });

    if (!room) {
      room = await this.prisma.chatRoom.create({
        data: {
          clientId,
          artisanId,
        },
      });
    }

    return room;
  }

  /**
   * Lister toutes les Rooms pour un utilisateur (Client ou Artisan)
   */
  async getUserRooms(userId: string, role: string) {
    const isClient = role === 'CLIENT';

    const rooms = await this.prisma.chatRoom.findMany({
      where: isClient ? { clientId: userId } : { artisanId: userId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        artisan: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Dernier message
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return rooms;
  }

  /**
   * Historique d'une conversation
   */
  async getRoomMessages(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Sauvegarder un nouveau message envoyé
   */
  async saveMessage(roomId: string, senderId: string, senderRole: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        roomId,
        senderId,
        senderRole,
        content,
      },
    });

    // Mettre à jour la date de la Room pour la remonter en haut
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Marquer les messages comme lus
   */
  async markAsRead(roomId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
