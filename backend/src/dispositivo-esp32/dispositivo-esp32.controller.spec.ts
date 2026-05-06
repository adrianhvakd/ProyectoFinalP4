import { Test, TestingModule } from '@nestjs/testing';
import { DispositivoEsp32Controller } from './dispositivo-esp32.controller';
import { DispositivoEsp32Service } from './dispositivo-esp32.service';

describe('DispositivoEsp32Controller', () => {
  let controller: DispositivoEsp32Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispositivoEsp32Controller],
      providers: [DispositivoEsp32Service],
    }).compile();

    controller = module.get<DispositivoEsp32Controller>(DispositivoEsp32Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
