import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { NotFoundException } from '@nestjs/common';
import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import {
  AuthenticatedUser,
  JwtPayload,
  mapJwtPayloadToUser,
} from '../auth/strategies/jwt.strategy';
import {
  JoinQueueResult,
  QuizPackMatchService,
} from './quiz-pack-match.service';
import { JoinQueueDto } from './dto/join-queue.dto';

/** Event names, shared verbatim with the frontend client. */
export const QueueEvent = {
  // client → server
  Join: 'queue:join',
  Cancel: 'queue:cancel',
  // server → client
  Waiting: 'queue:waiting',
  Matched: 'queue:matched',
  TimedOut: 'queue:timed-out',
  AlreadyEngaged: 'queue:already-engaged',
  Error: 'queue:error',
} as const;

/** What the handshake middleware stashes on every authenticated socket. */
export interface SocketData {
  user: AuthenticatedUser;
}

export type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

@WebSocketGateway({ cors: { origin: true } })
export class QuizPackMatchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly matchService: QuizPackMatchService,
  ) {}

  afterInit() {
    // Authenticate during the handshake rather than in handleConnection, so a
    // rejected socket never reaches a connected state at all.
    this.server.use((socket, next) => {
      void this.authenticate(socket as AuthenticatedSocket)
        .then(() => next())
        .catch(() => next(new Error('Unauthorized')));
    });
  }

  handleConnection(socket: AuthenticatedSocket) {
    // Each player gets a room named after their own id, so the server can
    // reach them without tracking sockets by hand — and so a second tab
    // hears the same events as the first.
    void socket.join(socket.data.user.userId);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    // Closing the tab mid-search takes you out of the queue, otherwise the
    // next arrival would be paired against someone who has already left.
    this.matchService.leaveQueue(socket.data.user.userId);
  }

  @SubscribeMessage(QueueEvent.Join)
  async handleJoin(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() body: JoinQueueDto,
  ): Promise<void> {
    const { userId } = socket.data.user;

    let result: JoinQueueResult;
    try {
      result = await this.matchService.joinQueue(userId, body.packSlug, () =>
        this.server.to(userId).emit(QueueEvent.TimedOut),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        socket.emit(QueueEvent.Error, {
          message: 'That quiz pack does not exist',
        });
        return;
      }
      throw error;
    }

    switch (result.status) {
      case 'queued':
        socket.emit(QueueEvent.Waiting);
        return;

      case 'already-engaged':
        socket.emit(QueueEvent.AlreadyEngaged, {
          packSlug: result.packSlug,
          packTitle: result.packTitle,
        });
        return;

      case 'matched':
        // Both sides need telling — the opponent has been sitting in the
        // queue and has no request of their own in flight to answer.
        for (const player of result.match.players) {
          this.server.to(player.userId).emit(QueueEvent.Matched, result.match);
        }
        return;
    }
  }

  @SubscribeMessage(QueueEvent.Cancel)
  handleCancel(@ConnectedSocket() socket: AuthenticatedSocket): void {
    this.matchService.leaveQueue(socket.data.user.userId);
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
