import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../common/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  providers: [PostsService],
  controllers: [PostsController]
})
export class PostsModule {}
