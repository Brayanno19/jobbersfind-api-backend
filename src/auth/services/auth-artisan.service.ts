import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { MailService } from '../../common/mail.service';
import { RegisterArtisanDto } from '../dto/register-artisan.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthArtisanService {
  private readonly logger = new Logger(AuthArtisanService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Inscription d'un nouvel artisan
   */
  async register(dto: RegisterArtisanDto) {
    // 1. Vérifier si le numéro de téléphone ou l'email existe déjà
    const existingArtisan = await this.prisma.artisanUser.findFirst({
      where: {
        OR: dto.email 
          ? [{ phoneNumber: dto.phoneNumber }, { email: dto.email }]
          : [{ phoneNumber: dto.phoneNumber }]
      },
    });

    if (existingArtisan) {
      throw new ConflictException('Un artisan avec ce numéro de téléphone ou cet email existe déjà');
    }

    // 2. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Créer l'artisan en BDD (isVerified est false par défaut)
    const newArtisan = await this.prisma.artisanUser.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        companyName: dto.companyName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        password: hashedPassword,
        nationality: dto.nationality,
        city: dto.city,
        neighborhood: dto.neighborhood,
        latitude: dto.latitude,
        longitude: dto.longitude,
        // Liaison optionnelle avec les métiers (Domaines) lors de l'inscription complète
        domains: dto.domainIds && dto.domainIds.length > 0 ? {
          connect: dto.domainIds.map(id => ({ id }))
        } : undefined,
      },
    });

    this.logger.log(`Nouvel artisan inscrit : ${newArtisan.id}`);

    // 4. Envoyer OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Mettre à jour l'utilisateur
    await this.prisma.artisanUser.update({
      where: { id: newArtisan.id },
      data: { otpCode, otpExpiresAt },
    });

    const otpTarget = dto.email ? dto.email : dto.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    return {
      message: 'Inscription réussie. Veuillez vérifier votre code OTP.',
      requireOtp: true,
      user: {
        id: newArtisan.id,
        firstName: newArtisan.firstName,
        companyName: newArtisan.companyName,
        isVerified: newArtisan.isVerified,
      }
    };
  }

  /**
   * Connexion d'un artisan
   */
  async login(dto: LoginDto) {
    const artisan = await this.prisma.artisanUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!artisan) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, artisan.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!artisan.isActive) {
      throw new UnauthorizedException('Ce compte a été suspendu par l\'administration');
    }

    if (!artisan.isPhoneVerified) {
      throw new UnauthorizedException('OTP_REQUIRED');
    }

    const tokens = await this.tokenService.generateTokens(artisan.id, 'ARTISAN');

    return {
      message: 'Connexion réussie',
      tokens,
      user: {
        id: artisan.id,
        firstName: artisan.firstName,
        isVerified: artisan.isVerified,
      }
    };
  }

  /**
   * Vérification de l'OTP Artisan
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const artisan = await this.prisma.artisanUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!artisan) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (artisan.isPhoneVerified) {
      throw new ConflictException('Ce compte est déjà vérifié');
    }

    if (artisan.otpCode !== dto.otp || !artisan.otpExpiresAt || artisan.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    const updatedArtisan = await this.prisma.artisanUser.update({
      where: { id: artisan.id },
      data: {
        isPhoneVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const tokens = await this.tokenService.generateTokens(updatedArtisan.id, 'ARTISAN');

    return {
      message: 'Compte vérifié avec succès',
      tokens,
      user: {
        id: updatedArtisan.id,
        firstName: updatedArtisan.firstName,
        isVerified: updatedArtisan.isVerified,
      }
    };
  }

  /**
   * Renvoi de l'OTP Artisan
   */
  async resendOtp(dto: ResendOtpDto) {
    const artisan = await this.prisma.artisanUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!artisan) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (artisan.isPhoneVerified) {
      throw new ConflictException('Ce compte est déjà vérifié');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.artisanUser.update({
      where: { id: artisan.id },
      data: { otpCode, otpExpiresAt },
    });

    const otpTarget = artisan.email ? artisan.email : artisan.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    return { message: 'Nouveau code envoyé avec succès' };
  }
  /**
   * Demande de réinitialisation de mot de passe Artisan
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const artisan = await this.prisma.artisanUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!artisan) {
      return { message: 'Si un compte existe avec cet identifiant, un OTP a été envoyé.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.artisanUser.update({
      where: { id: artisan.id },
      data: { otpCode, otpExpiresAt },
    });

    const otpTarget = artisan.email ? artisan.email : artisan.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    return { message: 'Si un compte existe avec cet identifiant, un OTP a été envoyé.' };
  }

  /**
   * Réinitialisation effective du mot de passe Artisan
   */
  async resetPassword(dto: ResetPasswordDto) {
    const artisan = await this.prisma.artisanUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!artisan) {
      throw new UnauthorizedException('Utilisateur introuvable ou OTP invalide');
    }

    if (artisan.otpCode !== dto.otp || !artisan.otpExpiresAt || artisan.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.artisanUser.update({
      where: { id: artisan.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
