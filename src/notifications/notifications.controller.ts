import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
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

  /**
   * Obtenir le nombre de notifications non lues
   */
  @Get('me/count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.userId, req.user.role);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  @Patch('me/read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId, req.user.role);
  }

  /**
   * Supprimer une notification spécifique
   */
  @Delete(':id')
  deleteNotification(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.notificationsService.deleteNotification(id, req.user.userId, req.user.role);
  }

  // --- ROUTES ADMIN ---

  /**
   * Diffuser une notification globale (Admin uniquement)
   */
  // Note: Ajoutez un garde RolesGuard pour restreindre aux admins si disponible
  @Post('admin/broadcast')
  broadcastNotification(
    @Request() req,
    @Body('targetRole') targetRole: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('type') type: string = 'announcement',
  ) {
    // Utiliser req.user.userId si l'admin est authentifié via JwtAuthGuard
    // Si l'admin a un autre guard, adapter ici.
    const adminId = req.user?.userId || 'admin_id_placeholder'; 
    return this.notificationsService.broadcastNotification(adminId, targetRole, title, body, type);
  }

  /**
   * Obtenir l'historique des diffusions avec pagination
   */
  @Get('admin/history')
  getBroadcastHistory(
    @Request() req,
  ) {
    // Dans une implémentation complète, vous pouvez extraire ?page=X&limit=Y des query params
    const page = req.query?.page ? parseInt(req.query.page) : 1;
    const limit = req.query?.limit ? parseInt(req.query.limit) : 10;
    return this.notificationsService.getBroadcastHistory(page, limit);
  }
}
