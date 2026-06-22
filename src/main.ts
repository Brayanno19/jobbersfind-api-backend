import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Sécurité: Configuration de Helmet
  app.use(helmet());
  
  // Configuration globale du validateur (Class-Validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non décorées des DTOs
      forbidNonWhitelisted: true, // Renvoie une erreur si des propriétés non définies sont envoyées
      transform: true, // Transforme automatiquement les payloads en objets DTO typés
    }),
  );

  // Configuration CORS
  app.enableCors();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

