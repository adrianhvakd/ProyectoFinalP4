import { Injectable } from '@nestjs/common';
import { CreateMedicionDto } from './dto/create-medicion.dto';
import { UpdateMedicionDto } from './dto/update-medicion.dto';

@Injectable()
export class MedicionService {
  create(createMedicionDto: CreateMedicionDto) {
    return 'This action adds a new medicion';
  }

  findAll() {
    return `This action returns all medicion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicion`;
  }

  update(id: number, updateMedicionDto: UpdateMedicionDto) {
    return `This action updates a #${id} medicion`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicion`;
  }
}
