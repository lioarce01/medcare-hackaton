import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // 👈 OBTÉNLO desde Supabase → Project Settings > API > JWT Secret
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
    };
  }
}
