import { Test, TestingModule } from '@nestjs/testing';
import { ArtisansController } from './artisans.controller';
import { ArtisansService } from './artisans.service';
import { UploadsService } from '../uploads/uploads.service';

describe('ArtisansController', () => {
  let controller: ArtisansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtisansController],
      providers: [
        {
          provide: ArtisansService,
          useValue: {},
        },
        {
          provide: UploadsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ArtisansController>(ArtisansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
