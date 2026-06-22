import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthClientService } from '../services/auth-client.service';
import { RegisterClientDto } from '../dto/register-client.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

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

  /**
   * Endpoint pour vérifier l'OTP d'un client
   */
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authClientService.verifyOtp(dto);
  }

  /**
   * Endpoint pour renvoyer l'OTP à un client
   */
  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authClientService.resendOtp(dto);
  }
  /**
   * Endpoint pour demander une réinitialisation de mot de passe
   */
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authClientService.forgotPassword(dto);
  }

  /**
   * Endpoint pour réinitialiser le mot de passe
   */
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authClientService.resetPassword(dto);
  }
}
