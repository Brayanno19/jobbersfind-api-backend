import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Génère un Access Token et un Refresh Token pour un utilisateur
   */
  async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    const secret = this.configService.get<string>('JWT_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Vérifie la validité d'un token
   */
  async verifyToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (e) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
