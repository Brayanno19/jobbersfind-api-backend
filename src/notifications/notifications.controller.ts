import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Enregistrer ou mettre à jour le jeton FCM de l'appareil
   */
  @Post('fcm-token')
  registerToken(
    @Request() req,
    @Body() dto: RegisterTokenDto,
  ) {
    return this.notificationsService.registerToken(req.user.userId, req.user.role, dto.fcmToken);
  }

  /**
   * Consulter ses notifications (Client ou Artisan)
   */
  @Get('me')
  getNotifications(@Request() req) {
    return this.notificationsService.getNotificationsForUser(req.user.userId, req.user.role);
  }

  /**
   * Marquer une notification spécifique comme lue
   */
  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.notificationsService.markAsRead(id, req.user.userId, req.user.role);
  }
}
