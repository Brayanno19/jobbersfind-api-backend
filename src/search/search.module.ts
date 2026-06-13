import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../common/prisma.module';
import { NlpSeedService } from './seed/nlp-seed.service';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, NlpSeedService]
})
export class SearchModule {}
