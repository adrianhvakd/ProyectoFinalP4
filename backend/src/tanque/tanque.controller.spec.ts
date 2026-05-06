import { Test, TestingModule } from '@nestjs/testing';
import { TanqueController } from './tanque.controller';
import { TanqueService } from './tanque.service';

describe('TanqueController', () => {
  let controller: TanqueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TanqueController],
      providers: [TanqueService],
    }).compile();

    controller = module.get<TanqueController>(TanqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
