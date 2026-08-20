import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: true } })
export class QuizPackMatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        username: string;
      }>(token);
      client.data.user = { userId: payload.sub, username: payload.username };
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // reconnect/forfeit handling lands here in a later ticket
  }
}
