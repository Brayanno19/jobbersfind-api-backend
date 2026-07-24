import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthClientController } from './controllers/auth-client.controller';
import { AuthArtisanController } from './controllers/auth-artisan.controller';
import { AuthAdminController } from './controllers/auth-admin.controller';
import { AuthController } from './controllers/auth.controller';

import { AuthClientService } from './services/auth-client.service';
import { AuthArtisanService } from './services/auth-artisan.service';
import { AuthAdminService } from './services/auth-admin.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { PrismaModule } from '../common/prisma.module';
import { MailModule } from '../common/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [
    AuthClientController,
    AuthArtisanController,
    AuthAdminController,
    AuthController,
  ],
  providers: [
    AuthClientService,
    AuthArtisanService,
    AuthAdminService,
    TokenService,
    JwtStrategy,
  ],
})
export class AuthModule {}
