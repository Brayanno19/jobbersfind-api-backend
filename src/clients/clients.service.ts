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
}
