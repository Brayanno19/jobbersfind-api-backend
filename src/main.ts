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

  // Configuration CORS sécurisée (Uniquement les origines autorisées)
  app.enableCors({
    origin: [
      'https://admin.jobbersfind.3tglobaltech.com',
      'http://admin.jobbersfind.3tglobaltech.com',
      'http://localhost:3000', // Pour le développement local
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

