import { Test, TestingModule } from '@nestjs/testing';
import { AuthAdminService } from './auth-admin.service';
import { PrismaService } from '../../common/prisma.service';
import { TokenService } from './token.service';

describe('AuthAdminService', () => {
  let service: AuthAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthAdminService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthAdminService>(AuthAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
