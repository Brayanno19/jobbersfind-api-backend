import { Test, TestingModule } from '@nestjs/testing';
import { AuthClientService } from './auth-client.service';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';
import { MailService } from '../../common/mail.service';

describe('AuthClientService', () => {
  let service: AuthClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthClientService,
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

    service = module.get<AuthClientService>(AuthClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
