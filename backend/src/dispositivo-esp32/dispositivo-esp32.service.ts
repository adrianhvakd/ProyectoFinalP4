import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispositivoESP32Entity } from './entities/dispositivo-esp32.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';

@Injectable()
export class DispositivoEsp32Service {
  constructor(
    @InjectRepository(DispositivoESP32Entity)
    private readonly espRepository: Repository<DispositivoESP32Entity>,
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
  ) {}

  async create(data: { nombre: string; ip_address: string; puerto?: number; estado?: string; tanqueId: string }): Promise<DispositivoESP32Entity> {
    const tanque = await this.tanqueRepository.findOneBy({ id: data.tanqueId });
    if (!tanque) throw new NotFoundException('Tanque no encontrado');
    
    const esp = this.espRepository.create({
      nombre: data.nombre,
      ip_address: data.ip_address,
      puerto: data.puerto || 80,
      estado: data.estado || 'ACTIVO',
      tanque,
    });
    return this.espRepository.save(esp);
  }

  async findAll(): Promise<DispositivoESP32Entity[]> {
    return this.espRepository.find({ relations: ['tanque'] });
  }

  async findByTanque(tanqueId: string): Promise<DispositivoESP32Entity[]> {
    return this.espRepository.find({ where: { tanque: { id: tanqueId } } });
  }

  async findOne(id: string): Promise<DispositivoESP32Entity> {
    const esp = await this.espRepository.findOne({ where: { id }, relations: ['tanque'] });
    if (!esp) throw new NotFoundException('Dispositivo no encontrado');
    return esp;
  }

  async update(id: string, data: { nombre?: string; ip_address?: string; puerto?: number; estado?: string }): Promise<DispositivoESP32Entity> {
    const esp = await this.findOne(id);
    if (data.nombre) esp.nombre = data.nombre;
    if (data.ip_address) esp.ip_address = data.ip_address;
    if (data.puerto) esp.puerto = data.puerto;
    if (data.estado) esp.estado = data.estado;
    return this.espRepository.save(esp);
  }

  async remove(id: string): Promise<void> {
    const esp = await this.findOne(id);
    await this.espRepository.remove(esp);
  }
}