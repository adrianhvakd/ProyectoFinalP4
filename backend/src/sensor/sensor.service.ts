import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorEntity } from './entities/sensor.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
    @InjectRepository(DispositivoESP32Entity)
    private readonly dispositivosRepository: Repository<DispositivoESP32Entity>,
  ) {}

  async create(createSensorDto: CreateSensorDto): Promise<SensorEntity> {
    let reservorio: ReservorioEntity | undefined;
    let domiciliario: DomiciliarioEntity | undefined;
    let dispositivo: DispositivoESP32Entity | undefined;
    
    if (createSensorDto.reservorioId) {
      const found = await this.reservorioRepository.findOneBy({ id: createSensorDto.reservorioId });
      if (found) reservorio = found;
    }
    
    if (createSensorDto.domiciliarioId) {
      const found = await this.domiciliarioRepository.findOneBy({ id: createSensorDto.domiciliarioId });
      if (found) domiciliario = found;
    }
    
    if (createSensorDto.dispositivoId) {
      const found = await this.dispositivosRepository.findOneBy({ id: createSensorDto.dispositivoId });
      if (found) dispositivo = found;
    }
    
    const sensor = this.sensorRepository.create({
      tipo: createSensorDto.tipo,
      unidad_medida: createSensorDto.unidad_medida,
      reservorio,
      domiciliario,
      dispositivo,
    });
    return this.sensorRepository.save(sensor);
  }

  async findAll(): Promise<SensorEntity[]> {
    return this.sensorRepository.find({ relations: ['reservorio', 'domiciliario', 'dispositivo'] });
  }

  async findByReservorio(reservorioId: string): Promise<SensorEntity[]> {
    return this.sensorRepository.find({ where: { reservorio: { id: reservorioId } }, relations: ['dispositivo'] });
  }

  async findByDomiciliario(domiciliarioId: string): Promise<SensorEntity[]> {
    return this.sensorRepository.find({ where: { domiciliario: { id: domiciliarioId } }, relations: ['dispositivo'] });
  }

  async findOne(id: string): Promise<SensorEntity> {
    const sensor = await this.sensorRepository.findOne({ where: { id }, relations: ['reservorio', 'domiciliario', 'dispositivo'] });
    if (!sensor) throw new NotFoundException('Sensor no encontrado');
    return sensor;
  }

  async update(id: string, updateSensorDto: UpdateSensorDto): Promise<SensorEntity> {
    const sensor = await this.findOne(id);
    
    if (updateSensorDto.dispositivoId) {
      const dispositivo = await this.dispositivosRepository.findOneBy({ id: updateSensorDto.dispositivoId });
      if (dispositivo) sensor.dispositivo = dispositivo;
    }
    
    return this.sensorRepository.save({ ...sensor, ...updateSensorDto });
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.sensorRepository.remove(sensor);
  }
}