import { Test, TestingModule } from '@nestjs/testing';
import { MedicionController } from './medicion.controller';
import { MedicionService } from './medicion.service';

describe('MedicionController', () => {
  let controller: MedicionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicionController],
      providers: [MedicionService],
    }).compile();

    controller = module.get<MedicionController>(MedicionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
