import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key-change-me-in-production',
    });
  }

  /**
   * Valide le payload JWT extrait du header d'autorisation.
   * Attachera cet objet à l'objet Request (req.user)
   */
  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
