import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthClientService } from '../services/auth-client.service';
import { RegisterClientDto } from '../dto/register-client.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth/client')
export class AuthClientController {
  constructor(private readonly authClientService: AuthClientService) {}

  /**
   * Endpoint pour l'inscription d'un client
   */
  @Post('register')
  async register(@Body() dto: RegisterClientDto) {
    return this.authClientService.register(dto);
  }

  /**
   * Endpoint pour la connexion d'un client
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authClientService.login(dto);
  }
}
