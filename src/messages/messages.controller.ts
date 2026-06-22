import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
      artisanId = req.user.userId;
      clientId = body.clientId || '';
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
