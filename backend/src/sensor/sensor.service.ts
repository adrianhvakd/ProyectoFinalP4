import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorEntity } from './entities/sensor.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
    @InjectRepository(DispositivoESP32Entity)
    private readonly dispositivosRepository: Repository<DispositivoESP32Entity>,
  ) {}

  async create(createSensorDto: CreateSensorDto): Promise<SensorEntity> {
    let tanque: TanqueEntity | undefined | null;
    let dispositivo: DispositivoESP32Entity | undefined | null;
    
    if (createSensorDto.tanqueId) {
      tanque = await this.tanqueRepository.findOneBy({ id: createSensorDto.tanqueId });
      if (!tanque) throw new NotFoundException('Tanque no encontrado');
    }
    
    if (createSensorDto.dispositivoId) {
      dispositivo = await this.dispositivosRepository.findOneBy({ id: createSensorDto.dispositivoId });
      if (!dispositivo) throw new NotFoundException('Dispositivo ESP32 no encontrado');
    }
    
    const sensor = this.sensorRepository.create({
      tipo: createSensorDto.tipo,
      unidad_medida: createSensorDto.unidad_medida,
      tanque: tanque || undefined,
      dispositivo: dispositivo || undefined,
    });
    return this.sensorRepository.save(sensor);
  }

  async findAll(): Promise<SensorEntity[]> {
    return this.sensorRepository.find({ relations: ['tanque', 'dispositivo'] });
  }

  async findByTanque(tanqueId: string): Promise<SensorEntity[]> {
    return this.sensorRepository.find({ where: { tanque: { id: tanqueId } }, relations: ['dispositivo'] });
  }

  async findOne(id: string): Promise<SensorEntity> {
    const sensor = await this.sensorRepository.findOne({ where: { id }, relations: ['tanque', 'dispositivo'] });
    if (!sensor) throw new NotFoundException('Sensor no encontrado');
    return sensor;
  }

  async update(id: string, updateSensorDto: UpdateSensorDto): Promise<SensorEntity> {
    const sensor = await this.findOne(id);
    
    if (updateSensorDto.dispositivoId) {
      const dispositivo = await this.dispositivosRepository.findOneBy({ id: updateSensorDto.dispositivoId });
      if (!dispositivo) throw new NotFoundException('Dispositivo ESP32 no encontrado');
      sensor.dispositivo = dispositivo;
    }
    
    return this.sensorRepository.save({ ...sensor, ...updateSensorDto });
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.sensorRepository.remove(sensor);
  }
}