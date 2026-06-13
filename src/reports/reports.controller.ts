import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Créer un signalement (Client ou Artisan)
   */
  @Post()
  create(
    @Request() req,
    @Body() dto: CreateReportDto,
  ) {
    const reporterId = req.user.userId;
    const reporterRole = req.user.role; // CLIENT ou ARTISAN
    return this.reportsService.createReport(reporterId, reporterRole, dto);
  }

  /**
   * Récupérer tous les signalements (Admin uniquement)
   */
  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query('status') status?: string) {
    return this.reportsService.findAll(status);
  }

  /**
   * Récupérer les détails d'un signalement (Admin uniquement)
   */
  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  /**
   * Mettre à jour le statut d'un signalement (Admin uniquement)
   */
  @UseGuards(AdminGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, dto.status);
  }
}
