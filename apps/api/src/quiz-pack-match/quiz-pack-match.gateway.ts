import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, mapJwtPayloadToUser } from '../auth/strategies/jwt.strategy';

@WebSocketGateway({ cors: { origin: true } })
export class QuizPackMatchGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.server.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        socket.data.user = mapJwtPayloadToUser(payload);
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
