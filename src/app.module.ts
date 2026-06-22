import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { ArtisansModule } from './artisans/artisans.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadsModule } from './uploads/uploads.module';
import { VerificationModule } from './verification/verification.module';
import { SearchModule } from './search/search.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { AdminsModule } from './admins/admins.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend le module de configuration accessible partout sans l'importer dans les autres modules
    }),
    AuthModule,
    PrismaModule,
    ClientsModule,
    ArtisansModule,
    CategoriesModule,
    UploadsModule,
    VerificationModule,
    SearchModule,
    ReviewsModule,
    ReportsModule,
    NotificationsModule,
    PostsModule,
    AdminsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
