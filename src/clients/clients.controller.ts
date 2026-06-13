import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard, ClientGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, ClientGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Consulter son profil
   */
  @Get('me')
  getProfile(@Request() req) {
    return this.clientsService.getProfile(req.user.userId); // req.user.userId vient du JwtStrategy
  }

  /**
   * Mettre à jour son profil (et sa position géographique)
   */
  @Patch('me')
  updateProfile(@Request() req, @Body() dto: UpdateClientDto) {
    return this.clientsService.updateProfile(req.user.userId, dto);
  }
}
