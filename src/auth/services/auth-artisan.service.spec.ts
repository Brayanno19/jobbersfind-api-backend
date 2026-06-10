import { Test, TestingModule } from '@nestjs/testing';
import { AuthArtisanService } from './auth-artisan.service';

describe('AuthArtisanService', () => {
  let service: AuthArtisanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthArtisanService],
    }).compile();

    service = module.get<AuthArtisanService>(AuthArtisanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
