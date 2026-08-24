import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  mapJwtPayloadToUser,
} from '../auth/strategies/jwt.strategy';

/** What the handshake middleware stashes on every authenticated socket. */
export interface SocketData {
  user: { userId: string; username: string };
}

export type AuthenticatedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  SocketData
>;

@WebSocketGateway({ cors: { origin: true } })
export class QuizPackMatchGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    // Authenticate during the handshake rather than in handleConnection, so a
    // rejected socket never reaches a connected state at all.
    this.server.use((socket, next) => {
      void this.authenticate(socket as AuthenticatedSocket)
        .then(() => next())
        .catch(() => next(new Error('Unauthorized')));
    });
  }

  private async authenticate(socket: AuthenticatedSocket): Promise<void> {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      throw new Error('Missing token');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    socket.data.user = mapJwtPayloadToUser(payload);
  }
}
