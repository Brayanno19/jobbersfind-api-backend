import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MailModule } from './mail.module';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [MailModule]
})
export class PrismaModule {}
