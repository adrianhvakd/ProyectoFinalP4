import { Injectable } from '@nestjs/common';
import { CreateTanqueDto } from './dto/create-tanque.dto';
import { UpdateTanqueDto } from './dto/update-tanque.dto';

@Injectable()
export class TanqueService {
  create(createTanqueDto: CreateTanqueDto) {
    return 'This action adds a new tanque';
  }

  findAll() {
    return `This action returns all tanque`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tanque`;
  }

  update(id: number, updateTanqueDto: UpdateTanqueDto) {
    return `This action updates a #${id} tanque`;
  }

  remove(id: number) {
    return `This action removes a #${id} tanque`;
  }
}
