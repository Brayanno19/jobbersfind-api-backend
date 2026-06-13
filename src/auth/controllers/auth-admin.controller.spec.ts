import { Test, TestingModule } from '@nestjs/testing';
import { AuthAdminController } from './auth-admin.controller';
import { AuthAdminService } from '../services/auth-admin.service';

describe('AuthAdminController', () => {
  let controller: AuthAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthAdminController],
      providers: [
        {
          provide: AuthAdminService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthAdminController>(AuthAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
