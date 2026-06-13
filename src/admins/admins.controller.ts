import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('stats')
  getGlobalStats() {
    return this.adminsService.getGlobalStats();
  }

  @Get('clients')
  getClients(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.adminsService.getClients(+page, +limit);
  }

  @Patch('clients/:id/status')
  updateClientStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.adminsService.updateClientStatus(id, isActive);
  }

  @Get('artisans')
  getArtisans(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.adminsService.getArtisans(+page, +limit);
  }

  @Patch('artisans/:id/status')
  updateArtisanStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.adminsService.updateArtisanStatus(id, isActive);
  }
}
