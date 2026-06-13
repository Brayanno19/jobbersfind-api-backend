import { Test, TestingModule } from '@nestjs/testing';
import { AuthArtisanController } from './auth-artisan.controller';
import { AuthArtisanService } from '../services/auth-artisan.service';

describe('AuthArtisanController', () => {
  let controller: AuthArtisanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthArtisanController],
      providers: [
        {
          provide: AuthArtisanService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthArtisanController>(AuthArtisanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
