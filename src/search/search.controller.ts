import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { NlpSeedService } from './seed/nlp-seed.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/roles.guard';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly nlpSeedService: NlpSeedService,
  ) {}

  @Post()
  @HttpCode(200)
  searchArtisans(@Body() dto: SearchQueryDto) {
    return this.searchService.searchArtisans(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('seed-dictionary')
  seedDictionary() {
    return this.nlpSeedService.seedDictionary();
  }

  @Post('seed-artisans')
  @HttpCode(200)
  seedArtisans() {
    return this.nlpSeedService.seedArtisans();
  }
}
