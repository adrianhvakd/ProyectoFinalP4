import { Test, TestingModule } from '@nestjs/testing';
import { DispositivoEsp32Service } from './dispositivo-esp32.service';

describe('DispositivoEsp32Service', () => {
  let service: DispositivoEsp32Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DispositivoEsp32Service],
    }).compile();

    service = module.get<DispositivoEsp32Service>(DispositivoEsp32Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
