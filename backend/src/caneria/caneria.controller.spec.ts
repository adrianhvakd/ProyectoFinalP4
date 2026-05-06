import { Test, TestingModule } from '@nestjs/testing';
import { CaneriaController } from './caneria.controller';
import { CaneriaService } from './caneria.service';

describe('CaneriaController', () => {
  let controller: CaneriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaneriaController],
      providers: [CaneriaService],
    }).compile();

    controller = module.get<CaneriaController>(CaneriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
