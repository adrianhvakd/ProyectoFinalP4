import { Test, TestingModule } from '@nestjs/testing';
import { TanqueService } from './tanque.service';

describe('TanqueService', () => {
  let service: TanqueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TanqueService],
    }).compile();

    service = module.get<TanqueService>(TanqueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
