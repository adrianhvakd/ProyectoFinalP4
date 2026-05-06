import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicionEntity } from './entities/medicion.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import { CreateMedicionDto } from './dto/create-medicion.dto';
import { UpdateMedicionDto } from './dto/update-medicion.dto';

@Injectable()
export class MedicionService {
  private readonly logger = new Logger(MedicionService.name);

  constructor(
    @InjectRepository(MedicionEntity)
    private readonly medicionRepository: Repository<MedicionEntity>,
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
  ) {}

  async create(createMedicionDto: CreateMedicionDto): Promise<MedicionEntity> {
    const sensor = await this.sensorRepository.findOne({
      where: { id: createMedicionDto.sensorId },
      relations: ['tanque'],
    });

    if (!sensor) {
      throw new Error(`Sensor con ID ${createMedicionDto.sensorId} no encontrado`);
    }

    let { valor } = createMedicionDto;

    if (sensor.tipo === 'NIVEL' && sensor.tanque) {
      const tanque = sensor.tanque;
      
      if (valor > tanque.altura_max!) {
        this.logger.warn(
          `ALERTA: Nivel ${valor}m supera altura_max ${tanque.altura_max}m del tanque ${tanque.nombre} (ID: ${tanque.id})`,
        );
        
        const porcentaje = (valor / tanque.altura_max!) * 100;
        if (porcentaje > 100) {
          valor = 100;
          this.logger.warn(`Nivel ajustado al 100% de capacidad para el tanque ${tanque.nombre}`);
        }
      }
    }

    const medicion = this.medicionRepository.create({
      valor,
      sensor,
      fecha_hora: new Date(),
    });

    return this.medicionRepository.save(medicion);
  }

  async findAll() {
    return this.medicionRepository.find({
      relations: ['sensor', 'sensor.tanque'],
      order: { fecha_hora: 'DESC' },
      take: 1000,
    });
  }

  async findBySensorId(sensorId: string) {
    const sensor = await this.sensorRepository.findOneBy({ id: sensorId });
    if (!sensor) {
      throw new Error(`Sensor con ID ${sensorId} no encontrado`);
    }

    return this.medicionRepository.find({
      where: { sensor: { id: sensorId } },
      relations: ['sensor'],
      order: { fecha_hora: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: number) {
    const medicion = await this.medicionRepository.findOne({
      where: { id },
      relations: ['sensor'],
    });
    if (!medicion) {
      throw new Error(`Medición con ID ${id} no encontrada`);
    }
    return medicion;
  }

  async update(id: number, updateMedicionDto: UpdateMedicionDto) {
    const medicion = await this.medicionRepository.findOneBy({ id });
    if (!medicion) {
      throw new Error(`Medición con ID ${id} no encontrada`);
    }
    return this.medicionRepository.save({ ...medicion, ...updateMedicionDto });
  }

  async remove(id: number) {
    const medicion = await this.medicionRepository.findOneBy({ id });
    if (!medicion) {
      throw new Error(`Medición con ID ${id} no encontrada`);
    }
    await this.medicionRepository.remove(medicion);
    return { message: `Medición con ID ${id} eliminada` };
  }
}