import { Test, TestingModule } from '@nestjs/testing';
import { AuthClientController } from './auth-client.controller';
import { AuthClientService } from '../services/auth-client.service';

describe('AuthClientController', () => {
  let controller: AuthClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthClientController],
      providers: [
        {
          provide: AuthClientService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthClientController>(AuthClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
