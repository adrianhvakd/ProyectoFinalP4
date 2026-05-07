import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomiciliarioEntity } from './entities/domicliario.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { CreateDomiciliarioDto } from './dto/create-domiciliario.dto';
import { UpdateDomiciliarioDto } from './dto/create-domiciliario.dto';

@Injectable()
export class DomiciliarioService {
  constructor(
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CaneriaEntity)
    private readonly caneriaRepository: Repository<CaneriaEntity>,
    @InjectRepository(DispositivoESP32Entity)
    private readonly dispositivoRepository: Repository<DispositivoESP32Entity>,
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
  ) {}

  async create(createDomiciliarioDto: CreateDomiciliarioDto): Promise<DomiciliarioEntity> {
    let user: UserEntity | undefined;
    if (createDomiciliarioDto.userId) {
      const foundUser = await this.userRepository.findOneBy({ id: createDomiciliarioDto.userId });
      user = foundUser ?? undefined;
    }

    let ubicacion = createDomiciliarioDto.ubicacion;
    if (!ubicacion && createDomiciliarioDto.lat && createDomiciliarioDto.lng) {
      ubicacion = {
        type: 'Point',
        coordinates: [createDomiciliarioDto.lng, createDomiciliarioDto.lat],
      };
    }

    let reservorio: ReservorioEntity | undefined;
    
    if (createDomiciliarioDto.reservorioId) {
      const found = await this.reservorioRepository.findOneBy({ id: createDomiciliarioDto.reservorioId });
      reservorio = found ?? undefined;
    } else if (ubicacion) {
      const [lng, lat] = ubicacion.coordinates;
      const found = await this.buscarReservorioMasCercano(lat, lng);
      reservorio = found ?? undefined;
    }

    if (!reservorio) {
      throw new NotFoundException('No se encontró un reservorio disponible');
    }

    const domiciliario = this.domiciliarioRepository.create({
      nombre: createDomiciliarioDto.nombre,
      capacidad_max: createDomiciliarioDto.capacidad_max,
      altura_max: createDomiciliarioDto.altura_max,
      ubicacion,
      reservorio,
      user,
    });
    
    const domiciliarioGuardado = await this.domiciliarioRepository.save(domiciliario);
    
    await this.crearCañeriaDesdeReservorio(reservorio, domiciliarioGuardado);
    
    return this.findOne(domiciliarioGuardado.id);
  }

  private async buscarReservorioMasCercano(lat: number, lng: number): Promise<ReservorioEntity | null> {
    const reservorios = await this.reservorioRepository.find({
      where: { tipo: 'RESERVORIO_PUBLICO' },
    });

    if (reservorios.length === 0) return null;

    let reservorioMasCercano: ReservorioEntity | null = null;
    let distanciaMinima = Infinity;

    for (const res of reservorios) {
      if (res.ubicacion?.coordinates) {
        const [resLng, resLat] = res.ubicacion.coordinates;
        const distancia = this.calcularDistanciaHaversine(lat, lng, resLat, resLng);
        
        if (res.radio_cobertura && distancia <= res.radio_cobertura) {
          if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
            reservorioMasCercano = res;
          }
        }
      }
    }

    return reservorioMasCercano;
  }

  private calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async crearCañeriaDesdeReservorio(reservorio: ReservorioEntity, domiciliario: DomiciliarioEntity): Promise<void> {
    if (!reservorio.ubicacion?.coordinates || !domiciliario.ubicacion?.coordinates) {
      return;
    }

    const existente = await this.caneriaRepository.findOne({
      where: {
        reservorioOrigen: { id: reservorio.id },
        domiciliarioDestino: { id: domiciliario.id },
      },
    });

    if (existente) {
      return;
    }

    const [lngRes, latRes] = reservorio.ubicacion.coordinates;
    const [lngDom, latDom] = domiciliario.ubicacion.coordinates;

    const caneria = this.caneriaRepository.create({
      ruta: {
        type: 'LineString',
        coordinates: [[lngRes, latRes], [lngDom, latDom]],
      },
      estado: 'ACTIVO',
      reservorioOrigen: reservorio,
      domiciliarioDestino: domiciliario,
    });

    await this.caneriaRepository.save(caneria);
  }

  async findAll(): Promise<DomiciliarioEntity[]> {
    return this.domiciliarioRepository.find({
      relations: ['sensores', 'reservorio', 'user', 'dispositivos'],
    });
  }

  async findByReservorio(reservorioId: string): Promise<DomiciliarioEntity[]> {
    return this.domiciliarioRepository.find({
      where: { reservorio: { id: reservorioId } },
      relations: ['sensores'],
    });
  }

  async findByUser(userId: string): Promise<DomiciliarioEntity[]> {
    return this.domiciliarioRepository.find({
      where: { user: { id: userId } },
      relations: ['sensores', 'reservorio'],
    });
  }

  async findOne(id: string): Promise<DomiciliarioEntity> {
    const domiciliario = await this.domiciliarioRepository.findOne({
      where: { id },
      relations: ['sensores', 'reservorio', 'user', 'dispositivos'],
    });
    if (!domiciliario) {
      throw new NotFoundException(`Domiciliario con ID ${id} no encontrado`);
    }
    return domiciliario;
  }

  async update(id: string, updateDomiciliarioDto: UpdateDomiciliarioDto): Promise<DomiciliarioEntity> {
    const domiciliario = await this.findOne(id);
    
    let ubicacion = updateDomiciliarioDto.ubicacion;
    if (!ubicacion && updateDomiciliarioDto.lat && updateDomiciliarioDto.lng) {
      ubicacion = {
        type: 'Point',
        coordinates: [updateDomiciliarioDto.lng, updateDomiciliarioDto.lat],
      };
    }

    let reservorio = domiciliario.reservorio;
    if (updateDomiciliarioDto.reservorioId) {
      reservorio = await this.reservorioRepository.findOneBy({ id: updateDomiciliarioDto.reservorioId }) ?? domiciliario.reservorio;
    }
    
    return this.domiciliarioRepository.save({ ...domiciliario, ...updateDomiciliarioDto, ubicacion, reservorio });
  }

  async remove(id: string): Promise<void> {
    const domiciliario = await this.findOne(id);
    
    const dispositivos = await this.dispositivoRepository.find({
      where: { domiciliario: { id } },
    });
    
    for (const disp of dispositivos) {
      await this.sensorRepository.delete({ dispositivo: { id: disp.id } });
    }
    
    await this.dispositivoRepository.delete({ domiciliario: { id } });
    
    await this.caneriaRepository.delete({ domiciliarioDestino: { id } });
    
    await this.domiciliarioRepository.remove(domiciliario);
  }
}