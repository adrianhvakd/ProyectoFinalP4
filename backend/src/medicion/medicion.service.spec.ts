import { Test, TestingModule } from '@nestjs/testing';
import { MedicionService } from './medicion.service';

describe('MedicionService', () => {
  let service: MedicionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicionService],
    }).compile();

    service = module.get<MedicionService>(MedicionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
