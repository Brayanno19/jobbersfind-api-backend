import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Endpoint pour rafraîchir un Access Token à l'aide d'un Refresh Token
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const tokens = await this.tokenService.refreshTokens(refreshToken);
    
    return {
      message: 'Tokens renouvelés avec succès',
      tokens,
    };
  }
}
