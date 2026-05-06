import { Injectable } from '@nestjs/common';
import { CreateCaneriaDto } from './dto/create-caneria.dto';
import { UpdateCaneriaDto } from './dto/update-caneria.dto';

@Injectable()
export class CaneriaService {
  create(createCaneriaDto: CreateCaneriaDto) {
    return 'This action adds a new caneria';
  }

  findAll() {
    return `This action returns all caneria`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caneria`;
  }

  update(id: number, updateCaneriaDto: UpdateCaneriaDto) {
    return `This action updates a #${id} caneria`;
  }

  remove(id: number) {
    return `This action removes a #${id} caneria`;
  }
}
