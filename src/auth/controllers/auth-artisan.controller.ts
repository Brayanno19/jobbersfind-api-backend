import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthArtisanService } from '../services/auth-artisan.service';
import { RegisterArtisanDto } from '../dto/register-artisan.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

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

  /**
   * Endpoint pour vérifier l'OTP d'un artisan
   */
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authArtisanService.verifyOtp(dto);
  }

  /**
   * Endpoint pour renvoyer l'OTP à un artisan
   */
  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authArtisanService.resendOtp(dto);
  }
  /**
   * Endpoint pour demander une réinitialisation de mot de passe
   */
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authArtisanService.forgotPassword(dto);
  }

  /**
   * Endpoint pour réinitialiser le mot de passe
   */
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authArtisanService.resetPassword(dto);
  }
}
