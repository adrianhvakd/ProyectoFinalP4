import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TanqueEntity } from './entities/tanque.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateTanqueDto } from './dto/create-tanque.dto';
import { UpdateTanqueDto } from './dto/update-tanque.dto';

@Injectable()
export class TanqueService {
  constructor(
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createTanqueDto: CreateTanqueDto): Promise<TanqueEntity> {
    let user: UserEntity | undefined;
    if (createTanqueDto.userId) {
      const foundUser = await this.userRepository.findOneBy({ id: createTanqueDto.userId });
      user = foundUser ?? undefined;
    }

    let ubicacion = createTanqueDto.ubicacion;
    if (!ubicacion && createTanqueDto.lat && createTanqueDto.lng) {
      ubicacion = {
        type: 'Point',
        coordinates: [createTanqueDto.lng, createTanqueDto.lat],
      };
    }

    const tanque = this.tanqueRepository.create({
      ...createTanqueDto,
      ubicacion,
      user,
    });
    return this.tanqueRepository.save(tanque);
  }

  async findAll(): Promise<TanqueEntity[]> {
    return this.tanqueRepository.find({
      relations: ['sensores', 'zona', 'user'],
    });
  }

  async findByUser(userId: string): Promise<TanqueEntity[]> {
    return this.tanqueRepository.find({
      where: { user: { id: userId } },
      relations: ['sensores', 'zona'],
    });
  }

  async findOne(id: string): Promise<TanqueEntity> {
    const tanque = await this.tanqueRepository.findOne({
      where: { id },
      relations: ['sensores', 'zona', 'user'],
    });
    if (!tanque) {
      throw new NotFoundException(`Tanque con ID ${id} no encontrado`);
    }
    return tanque;
  }

  async update(id: string, updateTanqueDto: UpdateTanqueDto): Promise<TanqueEntity> {
    const tanque = await this.findOne(id);
    
    let ubicacion = updateTanqueDto.ubicacion;
    if (!ubicacion && updateTanqueDto.lat && updateTanqueDto.lng) {
      ubicacion = {
        type: 'Point',
        coordinates: [updateTanqueDto.lng, updateTanqueDto.lat],
      };
    }
    
    return this.tanqueRepository.save({ ...tanque, ...updateTanqueDto, ubicacion });
  }

  async remove(id: string): Promise<void> {
    const tanque = await this.findOne(id);
    await this.tanqueRepository.remove(tanque);
  }
}