import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend le module de configuration accessible partout sans l'importer dans les autres modules
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
