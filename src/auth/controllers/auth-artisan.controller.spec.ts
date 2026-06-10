import { Test, TestingModule } from '@nestjs/testing';
import { AuthArtisanController } from './auth-artisan.controller';

describe('AuthArtisanController', () => {
  let controller: AuthArtisanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthArtisanController],
    }).compile();

    controller = module.get<AuthArtisanController>(AuthArtisanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
