import { Test, TestingModule } from '@nestjs/testing';
import { CaneriaService } from './caneria.service';

describe('CaneriaService', () => {
  let service: CaneriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaneriaService],
    }).compile();

    service = module.get<CaneriaService>(CaneriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
