import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { MailService } from '../../common/mail.service';
import { RegisterClientDto } from '../dto/register-client.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto, ResendOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Inscription d'un nouveau client
   * Vérifie l'unicité, hash le mot de passe, sauvegarde en BDD, envoie un OTP et génère les tokens.
   */
  async register(dto: RegisterClientDto) {
    // 1. Vérifier si le numéro de téléphone ou l'email existe déjà pour un Client
    const OR_CONDITIONS = [{ phoneNumber: dto.phoneNumber }];
    if (dto.email) {
      OR_CONDITIONS.push({ phoneNumber: dto.email } as any); // hack typage prisma pour simplifier, on reconstruit proprement
    }
    
    const existingClient = await this.prisma.clientUser.findFirst({
      where: {
        OR: dto.email 
          ? [{ phoneNumber: dto.phoneNumber }, { email: dto.email }]
          : [{ phoneNumber: dto.phoneNumber }]
      },
    });

    if (existingClient) {
      throw new ConflictException('Un utilisateur avec ce numéro de téléphone ou cet email existe déjà');
    }

    // 2. Hasher le mot de passe (10 rounds = bon compromis sécurité/performance)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Créer le client en base de données
    const newClient = await this.prisma.clientUser.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        password: hashedPassword,
        city: dto.city,
        neighborhood: dto.neighborhood,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    this.logger.log(`Nouveau client inscrit : ${newClient.id}`);

    // 4. Générer un OTP (ex: 6 chiffres aléatoires)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Mettre à jour l'utilisateur avec l'OTP
    await this.prisma.clientUser.update({
      where: { id: newClient.id },
      data: { otpCode, otpExpiresAt },
    });

    // 5. Envoyer l'OTP via Brevo + Console
    // La cible prioritaire est le téléphone s'il gère les SMS, sinon l'email (ici on passe le tel ou email)
    const otpTarget = dto.email ? dto.email : dto.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    // On ne génère plus les tokens ici, car le téléphone n'est pas vérifié.
    return {
      message: 'Inscription réussie, veuillez vérifier votre code OTP',
      requireOtp: true,
      user: {
        id: newClient.id,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
      }
    };
  }

  /**
   * Connexion d'un client
   * Accepte un identifiant (téléphone OU email) et un mot de passe
   */
  async login(dto: LoginDto) {
    // 1. Chercher l'utilisateur par téléphone ou email
    const client = await this.prisma.clientUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!client) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 2. Vérifier le mot de passe hashé
    const isPasswordValid = await bcrypt.compare(dto.password, client.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // 3. Vérifier le statut du compte (Admin suspension logic)
    if (!client.isActive) {
      throw new UnauthorizedException('Ce compte a été suspendu par l\'administration');
    }

    // NOUVEAU: Bloquer si le téléphone n'est pas vérifié et générer un nouvel OTP
    if (!client.isPhoneVerified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.clientUser.update({
        where: { id: client.id },
        data: { otpCode, otpExpiresAt },
      });

      const otpTarget = client.email ? client.email : client.phoneNumber;
      await this.mailService.sendOtp(otpTarget, otpCode);

      throw new UnauthorizedException('OTP_REQUIRED');
    }

    // 4. Générer les tokens JWT avec le rôle strict
    const tokens = await this.tokenService.generateTokens(client.id, 'CLIENT');

    return {
      message: 'Connexion réussie',
      tokens,
      user: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
      }
    };
  }

  /**
   * Vérification de l'OTP
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const client = await this.prisma.clientUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!client) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (client.isPhoneVerified) {
      throw new ConflictException('Ce compte est déjà vérifié');
    }

    if (client.otpCode !== dto.otp || !client.otpExpiresAt || client.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    // Valider le compte et nettoyer l'OTP
    const updatedClient = await this.prisma.clientUser.update({
      where: { id: client.id },
      data: {
        isPhoneVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Générer les tokens maintenant que le compte est vérifié
    const tokens = await this.tokenService.generateTokens(updatedClient.id, 'CLIENT');

    return {
      message: 'Compte vérifié avec succès',
      tokens,
      user: {
        id: updatedClient.id,
        firstName: updatedClient.firstName,
        lastName: updatedClient.lastName,
      }
    };
  }

  /**
   * Renvoi de l'OTP
   */
  async resendOtp(dto: ResendOtpDto) {
    const client = await this.prisma.clientUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!client) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (client.isPhoneVerified) {
      throw new ConflictException('Ce compte est déjà vérifié');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.clientUser.update({
      where: { id: client.id },
      data: { otpCode, otpExpiresAt },
    });

    const otpTarget = client.email ? client.email : client.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    return { message: 'Nouveau code envoyé avec succès' };
  }
  /**
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const client = await this.prisma.clientUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!client) {
      // Pour des raisons de sécurité, on ne précise pas si l'utilisateur existe ou non
      return { message: 'Si un compte existe avec cet identifiant, un OTP a été envoyé.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.clientUser.update({
      where: { id: client.id },
      data: { otpCode, otpExpiresAt },
    });

    const otpTarget = client.email ? client.email : client.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    return { message: 'Si un compte existe avec cet identifiant, un OTP a été envoyé.' };
  }

  /**
   * Réinitialisation effective du mot de passe
   */
  async resetPassword(dto: ResetPasswordDto) {
    const client = await this.prisma.clientUser.findFirst({
      where: {
        OR: [
          { phoneNumber: dto.identifier },
          { email: dto.identifier },
        ],
      },
    });

    if (!client) {
      throw new UnauthorizedException('Utilisateur introuvable ou OTP invalide');
    }

    if (client.otpCode !== dto.otp || !client.otpExpiresAt || client.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.clientUser.update({
      where: { id: client.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  /**
   * Suppression du compte client
   */
  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const client = await this.prisma.clientUser.findUnique({
      where: { id: userId }
    });

    if (!client) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, client.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // Créer la demande de suppression pour historique (audit)
    await this.prisma.accountDeletionRequest.create({
      data: {
        userId: client.id,
        userRole: 'CLIENT',
        reason: dto.reason,
      }
    });

    // Supprimer l'utilisateur. La contrainte onDelete: Cascade va supprimer les reviews, chatrooms, etc.
    await this.prisma.clientUser.delete({
      where: { id: client.id }
    });

    this.logger.log(`Compte client supprimé : ${client.id}`);

    return { message: 'Compte supprimé avec succès' };
  }
}
