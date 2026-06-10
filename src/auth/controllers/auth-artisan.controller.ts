import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthArtisanService } from '../services/auth-artisan.service';
import { RegisterArtisanDto } from '../dto/register-artisan.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth/artisan')
export class AuthArtisanController {
  constructor(private readonly authArtisanService: AuthArtisanService) {}

  /**
   * Endpoint pour l'inscription d'un artisan
   */
  @Post('register')
  async register(@Body() dto: RegisterArtisanDto) {
    return this.authArtisanService.register(dto);
  }

  /**
   * Endpoint pour la connexion d'un artisan
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authArtisanService.login(dto);
  }
}
