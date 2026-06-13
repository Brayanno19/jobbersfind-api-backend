import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('pending')
  getPendingDocuments() {
    return this.verificationService.getPendingDocuments();
  }

  @Get('artisan/:id')
  getArtisanDossier(@Param('id') id: string) {
    return this.verificationService.getArtisanDossier(id);
  }

  @Patch('document/:id')
  updateDocumentStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.verificationService.updateDocumentStatus(id, status);
  }

  @Patch('artisan/:id/certify')
  certifyArtisan(@Param('id') id: string, @Body('isVerified') isVerified: boolean) {
    return this.verificationService.certifyArtisan(id, isVerified);
  }
}
