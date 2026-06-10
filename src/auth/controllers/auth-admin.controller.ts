import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthAdminService } from '../services/auth-admin.service';
import { LoginDto } from '../dto/login.dto';

@Controller('auth/admin')
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  /**
   * Endpoint pour la connexion d'un administrateur
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authAdminService.login(dto);
  }
}
