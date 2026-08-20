import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: true } })
export class QuizPackMatchGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      try {
        const payload = await this.jwtService.verifyAsync<{
          sub: string;
          username: string;
        }>(token);
        socket.data.user = { userId: payload.sub, username: payload.username };
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  handleDisconnect(client: Socket) {
    // reconnect/forfeit handling lands here in a later ticket
  }
}
