import { Test, TestingModule } from '@nestjs/testing';
import { AuthArtisanService } from './auth-artisan.service';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { MailService } from '../../common/mail.service';

describe('AuthArtisanService', () => {
  let service: AuthArtisanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthArtisanService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthArtisanService>(AuthArtisanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
