import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard générique pour vérifier le token JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * Guard spécifique pour restreindre l'accès aux Administrateurs
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injecté par JwtStrategy

    if (!user) {
      return false;
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Accès refusé : rôle insuffisant');
    }

    return true;
  }
}

// Helpers rapides pour injecter les rôles
export const AdminGuard = new RolesGuard(['ADMIN', 'SUPER_ADMIN']);
export const ClientGuard = new RolesGuard(['CLIENT']);
export const ArtisanGuard = new RolesGuard(['ARTISAN']);
