import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { MailService } from '../../common/mail.service';
import { RegisterClientDto } from '../dto/register-client.dto';
import { LoginDto } from '../dto/login.dto';
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
      },
    });

    this.logger.log(`Nouveau client inscrit : ${newClient.id}`);

    // 4. Générer un OTP (ex: 6 chiffres aléatoires)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Envoyer l'OTP via Brevo + Console
    // La cible prioritaire est le téléphone s'il gère les SMS, sinon l'email (ici on passe le tel ou email)
    const otpTarget = dto.email ? dto.email : dto.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    // 6. Générer les tokens (connexion automatique après inscription)
    const tokens = await this.tokenService.generateTokens(newClient.id, 'CLIENT');

    return {
      message: 'Inscription réussie, veuillez vérifier votre code OTP',
      tokens,
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
}
