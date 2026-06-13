import { Test, TestingModule } from '@nestjs/testing';
import { ArtisansService } from './artisans.service';
import { PrismaService } from '../common/prisma.service';

describe('ArtisansService', () => {
  let service: ArtisansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtisansService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ArtisansService>(ArtisansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
