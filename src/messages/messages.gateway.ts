import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const userId = payload.sub;
      client.data.user = payload;
      
      this.connectedUsers.set(userId, client.id);
      
      // Rejoindre une room personnelle pour recevoir les notifications
      client.join(`user_${userId}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data?.user?.sub) {
      this.connectedUsers.delete(client.data.user.sub);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody('roomId') roomId: string) {
    client.join(roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody('roomId') roomId: string) {
    client.leave(roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; receiverId: string },
  ) {
    const senderId = client.data.user.sub;
    const senderRole = client.data.user.role;

    // Sauvegarder en DB
    const message = await this.messagesService.saveMessage(data.roomId, senderId, senderRole, data.content);

    // Diffuser dans la room (pour l'expéditeur et le destinataire s'ils sont dedans)
    this.server.to(data.roomId).emit('newMessage', message);

    // Si le destinataire n'est pas dans la room, on peut lui envoyer une notif globale via sa room perso
    // Pour ça, on vérifie s'il est connecté
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(`user_${data.receiverId}`).emit('notification', {
        type: 'NEW_MESSAGE',
        message: 'Vous avez reçu un nouveau message',
        roomId: data.roomId,
      });
    }
  }
}
