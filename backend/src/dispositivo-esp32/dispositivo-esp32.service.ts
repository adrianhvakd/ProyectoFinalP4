import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispositivoESP32Entity } from './entities/dispositivo-esp32.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';

@Injectable()
export class DispositivoEsp32Service {
  constructor(
    @InjectRepository(DispositivoESP32Entity)
    private readonly espRepository: Repository<DispositivoESP32Entity>,
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
  ) {}

  async create(data: { nombre: string; reservorioId?: string; domiciliarioId?: string }): Promise<DispositivoESP32Entity> {
    let reservorio: ReservorioEntity | undefined;
    let domiciliario: DomiciliarioEntity | undefined;

    if (data.reservorioId) {
      const found = await this.reservorioRepository.findOneBy({ id: data.reservorioId });
      if (found) reservorio = found;
    }

    if (data.domiciliarioId) {
      const found = await this.domiciliarioRepository.findOneBy({ id: data.domiciliarioId });
      if (found) domiciliario = found;
    }

    const apiKey = this.generateApiKey();
    
    const esp = this.espRepository.create({
      nombre: data.nombre,
      api_key: apiKey,
      estado: 'ACTIVO',
      reservorio,
      domiciliario,
    });
    return this.espRepository.save(esp);
  }

  async findAll(): Promise<DispositivoESP32Entity[]> {
    return this.espRepository.find({ relations: ['reservorio', 'domiciliario'] });
  }

  async findByReservorio(reservorioId: string): Promise<DispositivoESP32Entity[]> {
    return this.espRepository.find({ where: { reservorio: { id: reservorioId } } });
  }

  async findByDomiciliario(domiciliarioId: string): Promise<DispositivoESP32Entity[]> {
    return this.espRepository.find({ where: { domiciliario: { id: domiciliarioId } } });
  }

  async findOne(id: string): Promise<DispositivoESP32Entity> {
    const esp = await this.espRepository.findOne({ 
      where: { id }, 
      relations: ['reservorio', 'domiciliario', 'sensores'] 
    });
    if (!esp) throw new NotFoundException('Dispositivo no encontrado');
    return esp;
  }

  async findByApiKey(apiKey: string): Promise<DispositivoESP32Entity | null> {
    const esp = await this.espRepository.findOne({ 
      where: { api_key: apiKey },
      relations: ['reservorio', 'domiciliario', 'sensores']
    });
    return esp || null;
  }

  async update(id: string, data: { nombre?: string; estado?: string }): Promise<DispositivoESP32Entity> {
    const esp = await this.findOne(id);
    if (data.nombre) esp.nombre = data.nombre;
    if (data.estado) esp.estado = data.estado;
    return this.espRepository.save(esp);
  }

  async regenerateApiKey(id: string): Promise<DispositivoESP32Entity> {
    const esp = await this.findOne(id);
    esp.api_key = this.generateApiKey();
    return this.espRepository.save(esp);
  }

  async remove(id: string): Promise<void> {
    const esp = await this.findOne(id);
    await this.espRepository.remove(esp);
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}