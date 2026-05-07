import { Injectable, Logger, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicionEntity } from './entities/medicion.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
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
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
    @InjectRepository(DispositivoESP32Entity)
    private readonly dispositivoRepository: Repository<DispositivoESP32Entity>,
  ) {}

  async create(createMedicionDto: CreateMedicionDto): Promise<MedicionEntity> {
    const { sensorId, valor, apiKey } = createMedicionDto;

    if (!sensorId || !valor || !apiKey) {
      throw new BadRequestException('sensorId, valor y apiKey son requeridos');
    }

    const dispositivo = await this.dispositivoRepository.findOne({
      where: { api_key: apiKey },
      relations: ['sensores'],
    });

    if (!dispositivo) {
      throw new UnauthorizedException('API Key inválida o dispositivo no encontrado');
    }

    const sensor = await this.sensorRepository.findOne({
      where: { id: sensorId },
      relations: ['reservorio', 'domiciliario', 'dispositivo'],
    });

    if (!sensor) {
      throw new NotFoundException(`Sensor con ID ${sensorId} no encontrado`);
    }

    const sensorPerteneceAlDispositivo = dispositivo.sensores?.some(s => s.id === sensorId);
    if (!sensorPerteneceAlDispositivo) {
      throw new UnauthorizedException('El sensor no pertenece al dispositivo con esa API Key');
    }

    let valorFinal = valor;

    if (sensor.tipo === 'NIVEL') {
      const reservorio = sensor.reservorio;
      const domiciliario = sensor.domiciliario;
      const entity = reservorio || domiciliario;
      
      if (entity && valorFinal > entity.altura_max!) {
        this.logger.warn(
          `ALERTA: Nivel ${valorFinal}m supera altura_max ${entity.altura_max}m de ${entity.nombre} (ID: ${entity.id})`,
        );
        
        const porcentaje = (valorFinal / entity.altura_max!) * 100;
        if (porcentaje > 100) {
          valorFinal = 100;
          this.logger.warn(`Nivel ajustado al 100% de capacidad para ${entity.nombre}`);
        }
      }
    }

    const medicion = this.medicionRepository.create({
      valor: valorFinal,
      sensor,
      fecha_hora: new Date(),
    });

    const savedMedicion = await this.medicionRepository.save(medicion);
    
    return savedMedicion;
  }

  async createByAdmin(createMedicionDto: CreateMedicionDto): Promise<MedicionEntity> {
    const { sensorId, valor } = createMedicionDto;

    if (!sensorId || !valor) {
      throw new BadRequestException('sensorId y valor son requeridos');
    }

    const sensor = await this.sensorRepository.findOne({
      where: { id: sensorId },
      relations: ['reservorio', 'domiciliario'],
    });

    if (!sensor) {
      throw new NotFoundException(`Sensor con ID ${sensorId} no encontrado`);
    }

    let valorFinal = valor;

    if (sensor.tipo === 'NIVEL') {
      const reservorio = sensor.reservorio;
      const domiciliario = sensor.domiciliario;
      const entity = reservorio || domiciliario;
      
      if (entity && valorFinal > entity.altura_max!) {
        this.logger.warn(
          `ALERTA: Nivel ${valorFinal}m supera altura_max ${entity.altura_max}m de ${entity.nombre} (ID: ${entity.id})`,
        );
        
        const porcentaje = (valorFinal / entity.altura_max!) * 100;
        if (porcentaje > 100) {
          valorFinal = 100;
          this.logger.warn(`Nivel ajustado al 100% de capacidad para ${entity.nombre}`);
        }
      }
    }

    const medicion = this.medicionRepository.create({
      valor: valorFinal,
      sensor,
      fecha_hora: new Date(),
    });

    return this.medicionRepository.save(medicion);
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

  async findAll() {
    return this.medicionRepository.find({
      relations: ['sensor'],
      order: { fecha_hora: 'DESC' },
      take: 1000,
    });
  }
}