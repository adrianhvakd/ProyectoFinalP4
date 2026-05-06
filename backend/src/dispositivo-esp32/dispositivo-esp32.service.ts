import { Injectable } from '@nestjs/common';
import { CreateDispositivoEsp32Dto } from './dto/create-dispositivo-esp32.dto';
import { UpdateDispositivoEsp32Dto } from './dto/update-dispositivo-esp32.dto';

@Injectable()
export class DispositivoEsp32Service {
  create(createDispositivoEsp32Dto: CreateDispositivoEsp32Dto) {
    return 'This action adds a new dispositivoEsp32';
  }

  findAll() {
    return `This action returns all dispositivoEsp32`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dispositivoEsp32`;
  }

  update(id: number, updateDispositivoEsp32Dto: UpdateDispositivoEsp32Dto) {
    return `This action updates a #${id} dispositivoEsp32`;
  }

  remove(id: number) {
    return `This action removes a #${id} dispositivoEsp32`;
  }
}
