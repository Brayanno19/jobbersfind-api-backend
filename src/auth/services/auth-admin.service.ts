import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthAdminService {
  private readonly logger = new Logger(AuthAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Connexion d'un administrateur
   * Les administrateurs utilisent uniquement l'email pour se connecter
   */
  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findFirst({
      where: {
        email: dto.identifier,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Identifiants administrateur invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants administrateur invalides');
    }

    // Générer les tokens avec rôle ADMIN
    const tokens = await this.tokenService.generateTokens(admin.id, 'ADMIN');

    this.logger.log(`Connexion administrateur réussie : ${admin.email}`);

    return {
      message: 'Connexion administrateur réussie',
      tokens,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      }
    };
  }
}
