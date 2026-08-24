import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  username: string;
}

/** The shape attached to every authenticated request and socket. */
export interface AuthenticatedUser {
  userId: string;
  username: string;
}

export function mapJwtPayloadToUser(payload: JwtPayload): AuthenticatedUser {
  return { userId: payload.sub, username: payload.username };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return mapJwtPayloadToUser(payload);
  }
}
