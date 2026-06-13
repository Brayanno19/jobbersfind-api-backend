import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { MailService } from '../../common/mail.service';
import { RegisterArtisanDto } from '../dto/register-artisan.dto';
import { LoginDto } from '../dto/login.dto';
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
    const otpTarget = dto.email ? dto.email : dto.phoneNumber;
    await this.mailService.sendOtp(otpTarget, otpCode);

    // 5. Générer tokens
    const tokens = await this.tokenService.generateTokens(newArtisan.id, 'ARTISAN');

    return {
      message: 'Inscription réussie. Votre profil sera examiné par un administrateur.',
      tokens,
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
}
