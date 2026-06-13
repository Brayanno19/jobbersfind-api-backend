import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un nouveau signalement
   */
  async createReport(reporterId: string, reporterRole: string, dto: CreateReportDto) {
    const { reportedId, reportedRole, type, description } = dto;

    // Empêcher l'auto-signalement
    if (reporterId === reportedId) {
      throw new BadRequestException('Vous ne pouvez pas vous signaler vous-même.');
    }

    // Vérifier que l'utilisateur signalé existe
    let reportedExists = false;
    if (reportedRole === 'CLIENT') {
      const client = await this.prisma.clientUser.findUnique({ where: { id: reportedId } });
      reportedExists = !!client;
    } else if (reportedRole === 'ARTISAN') {
      const artisan = await this.prisma.artisanUser.findUnique({ where: { id: reportedId } });
      reportedExists = !!artisan;
    }

    if (!reportedExists) {
      throw new NotFoundException(`L'utilisateur signalé (${reportedRole}) avec l'ID ${reportedId} n'existe pas.`);
    }

    // Créer le signalement
    return this.prisma.report.create({
      data: {
        reporterId,
        reporterRole,
        reportedId,
        reportedRole,
        type,
        description,
        status: 'PENDING',
      },
    });
  }

  /**
   * Récupérer tous les signalements (Admin)
   */
  async findAll(status?: string) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Récupérer un signalement spécifique (Admin)
   */
  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Signalement introuvable`);
    }

    return report;
  }

  /**
   * Mettre à jour le statut d'un signalement (Admin)
   */
  async updateStatus(id: string, status: string) {
    // Vérifier l'existence
    await this.findOne(id);

    return this.prisma.report.update({
      where: { id },
      data: { status },
    });
  }
}
