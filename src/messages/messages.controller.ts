import { Controller, Get, Post, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('rooms')
  getUserRooms(@Request() req) {
    const userId = req.user.userId;
    const role = req.user.role; // 'CLIENT' ou 'ARTISAN'
    return this.messagesService.getUserRooms(userId, role);
  }

  @Post('rooms/init')
  initRoom(@Request() req, @Body() body: { artisanId?: string; clientId?: string }) {
    const role = req.user.role;
    let clientId = '';
    let artisanId = '';

    if (role === 'CLIENT') {
      clientId = req.user.userId;
      artisanId = body.artisanId || '';
    } else {
      // Un artisan essaie de discuter
      if (!body.clientId) {
        throw new BadRequestException("En tant qu'artisan, vous ne pouvez pas démarrer une discussion avec un autre artisan.");
      }
      artisanId = req.user.userId;
      clientId = body.clientId;
    }

    if (!clientId || !artisanId) {
      throw new BadRequestException("Les identifiants du client et de l'artisan sont requis.");
    }

    return this.messagesService.getOrCreateRoom(clientId, artisanId);
  }

  @Get('rooms/:roomId/messages')
  getMessages(@Param('roomId') roomId: string) {
    return this.messagesService.getRoomMessages(roomId);
  }

  @Post('rooms/:roomId/read')
  markAsRead(@Request() req, @Param('roomId') roomId: string) {
    return this.messagesService.markAsRead(roomId, req.user.userId);
  }
}
