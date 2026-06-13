import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lister les documents en attente de validation
   */
  async getPendingDocuments() {
    return this.prisma.artisanDocument.findMany({
      where: { status: 'PENDING' },
      include: {
        artisan: {
          select: { id: true, firstName: true, lastName: true, companyName: true }
        }
      }
    });
  }

  /**
   * Voir le dossier complet d'un artisan pour vérification
   */
  async getArtisanDossier(id: string) {
    const artisan = await this.prisma.artisanUser.findUnique({
      where: { id },
      include: {
        documents: true,
        videos: true,
        domains: true,
      }
    });
    if (!artisan) throw new NotFoundException('Artisan introuvable');
    return artisan;
  }

  /**
   * Mettre à jour le statut d'un document (VALIDATED, REJECTED)
   */
  async updateDocumentStatus(documentId: string, status: string) {
    return this.prisma.artisanDocument.update({
      where: { id: documentId },
      data: { status }
    });
  }

  /**
   * Certifier (ou décertifier) un artisan
   */
  async certifyArtisan(id: string, isVerified: boolean) {
    return this.prisma.artisanUser.update({
      where: { id },
      data: { isVerified }
    });
  }
}
