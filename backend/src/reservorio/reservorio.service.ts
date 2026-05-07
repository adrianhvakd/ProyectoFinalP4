import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservorioEntity } from './entities/reservorio.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { CreateReservorioDto } from './dto/create-reservorio.dto';
import { UpdateReservorioDto } from './dto/create-reservorio.dto';

@Injectable()
export class ReservorioService {
  constructor(
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ZonaEntity)
    private readonly zonaRepository: Repository<ZonaEntity>,
    @InjectRepository(DispositivoESP32Entity)
    private readonly dispositivoRepository: Repository<DispositivoESP32Entity>,
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
    @InjectRepository(CaneriaEntity)
    private readonly caneriaRepository: Repository<CaneriaEntity>,
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
  ) {}

  async create(createReservorioDto: CreateReservorioDto): Promise<ReservorioEntity> {
    let user: UserEntity | undefined;
    if (createReservorioDto.userId) {
      const foundUser = await this.userRepository.findOneBy({ id: createReservorioDto.userId });
      user = foundUser ?? undefined;
    }

    let ubicacion = createReservorioDto.ubicacion;
    if (!ubicacion && createReservorioDto.lat && createReservorioDto.lng) {
      ubicacion = {
        type: 'Point',
        coordinates: [createReservorioDto.lng, createReservorioDto.lat],
      };
    }

    const radioCobertura = createReservorioDto.radio_cobertura || 1000;

    const reservorio = this.reservorioRepository.create({
      ...createReservorioDto,
      ubicacion,
      user,
      radio_cobertura: radioCobertura,
    });
    
    const reservorioGuardado = await this.reservorioRepository.save(reservorio);
    
    if (reservorioGuardado.tipo === 'RESERVORIO_PUBLICO') {
      await this.crearZonaDesdeReservorio(reservorioGuardado);
    }
    
    return this.findOne(reservorioGuardado.id);
  }

  async findAll(): Promise<ReservorioEntity[]> {
    return this.reservorioRepository.find({
      relations: ['sensores', 'zona', 'user', 'dispositivos'],
    });
  }

  async findByUser(userId: string): Promise<ReservorioEntity[]> {
    return this.reservorioRepository.find({
      where: { user: { id: userId } },
      relations: ['sensores', 'zona'],
    });
  }

  async findOne(id: string): Promise<ReservorioEntity> {
    const reservorio = await this.reservorioRepository.findOne({
      where: { id },
      relations: ['sensores', 'zona', 'user', 'dispositivos', 'domiciliarios'],
    });
    if (!reservorio) {
      throw new NotFoundException(`Reservorio con ID ${id} no encontrado`);
    }
    return reservorio;
  }

  async update(id: string, updateReservorioDto: UpdateReservorioDto): Promise<ReservorioEntity> {
    const reservorio = await this.findOne(id);
    
    const radioAnterior = reservorio.radio_cobertura || 0;
    
    let ubicacion = updateReservorioDto.ubicacion;
    if (!ubicacion && updateReservorioDto.lat && updateReservorioDto.lng) {
      ubicacion = {
        type: 'Point',
        coordinates: [updateReservorioDto.lng, updateReservorioDto.lat],
      };
    }
    
    const reservorioActualizado = await this.reservorioRepository.save({ 
      ...reservorio, 
      ...updateReservorioDto, 
      ubicacion 
    });
    
    let areaExpandidida = false;
    
    if (reservorioActualizado.tipo === 'RESERVORIO_PUBLICO' && 
        reservorioActualizado.ubicacion?.coordinates &&
        reservorioActualizado.radio_cobertura &&
        (updateReservorioDto.radio_cobertura !== undefined || updateReservorioDto.nombre !== undefined)) {
      await this.actualizarZonaDesdeReservorio(reservorioActualizado);
      
      if (updateReservorioDto.radio_cobertura !== undefined && updateReservorioDto.radio_cobertura > radioAnterior) {
        areaExpandidida = true;
      }
    }
    
    if (areaExpandidida && reservorioActualizado.radio_cobertura) {
      await this.crearCañeriasAutomaticas(reservorioActualizado);
    }
    
    return this.findOne(id);
  }
  
  private async crearCañeriasAutomaticas(reservorio: ReservorioEntity): Promise<void> {
    if (!reservorio.ubicacion?.coordinates || !reservorio.radio_cobertura) {
      return;
    }
    
    const [lngRes, latRes] = reservorio.ubicacion.coordinates;
    const radio = reservorio.radio_cobertura;
    
    const domiciliarios = await this.domiciliarioRepository.find({
      relations: ['reservorio'],
    });
    
    for (const dom of domiciliarios) {
      if (!dom.ubicacion?.coordinates || dom.reservorio?.id === reservorio.id) {
        continue;
      }
      
      const [lngDom, latDom] = dom.ubicacion.coordinates;
      const distancia = this.calcularDistanciaHaversine(latRes, lngRes, latDom, lngDom);
      
      if (distancia <= radio) {
        const existente = await this.caneriaRepository.findOne({
          where: {
            reservorioOrigen: { id: reservorio.id },
            domiciliarioDestino: { id: dom.id },
          },
        });
        
        if (!existente) {
          await this.crearCañeria(reservorio, dom);
          
          dom.reservorio = reservorio;
          await this.domiciliarioRepository.save(dom);
        }
      }
    }
  }
  
private async crearCañeria(reservorio: ReservorioEntity, domiciliario: any): Promise<void> {
    const [lngRes, latRes] = reservorio.ubicacion.coordinates;
    const [lngDom, latDom] = domiciliario.ubicacion.coordinates;
    
    const caneria = this.caneriaRepository.create({
      ruta: {
        type: 'LineString',
        coordinates: [
          [lngRes, latRes],
          [lngDom, latDom],
        ],
      },
      estado: 'ACTIVO',
      reservorioOrigen: reservorio,
      domiciliarioDestino: domiciliario,
    });
    
    await this.caneriaRepository.save(caneria);
  }

  private async actualizarZonaDesdeReservorio(reservorio: ReservorioEntity): Promise<ZonaEntity> {
    if (!reservorio.ubicacion?.coordinates || !reservorio.radio_cobertura) {
      throw new Error('El reservorio debe tener ubicación y radio de cobertura');
    }

    if (!reservorio.zona) {
      return this.crearZonaDesdeReservorio(reservorio);
    }

    const [lng, lat] = reservorio.ubicacion.coordinates;
    const radio = reservorio.radio_cobertura;
    const polygon = this.generarCirculoPolygon(lat, lng, radio);

    reservorio.zona.radio_cobertura = radio;
    reservorio.zona.perimetro = polygon;
    reservorio.zona.nombre = `Zona ${reservorio.nombre}`;

    return this.zonaRepository.save(reservorio.zona);
  }

  async remove(id: string): Promise<void> {
    const dispositivos = await this.dispositivoRepository.find({
      where: { reservorio: { id } },
    });
    
    for (const disp of dispositivos) {
      await this.sensorRepository.delete({ dispositivo: { id: disp.id } });
    }
    
    await this.dispositivoRepository.delete({ reservorio: { id } });
    
    await this.caneriaRepository.delete({ reservorioOrigen: { id } });
    await this.caneriaRepository.delete({ reservorioDestino: { id } });
    
    await this.domiciliarioRepository
      .createQueryBuilder()
      .update()
      .set({ reservorio: null as any })
      .where('reservorioId = :id', { id })
      .execute();
    
    const reservorio = await this.reservorioRepository.findOne({
      where: { id },
      relations: ['zona'],
    });
    
    if (reservorio?.zona) {
      await this.zonaRepository.remove(reservorio.zona);
    }
    
    await this.reservorioRepository.delete({ id });
  }

  private async crearZonaDesdeReservorio(reservorio: ReservorioEntity): Promise<ZonaEntity> {
    if (!reservorio.ubicacion?.coordinates || !reservorio.radio_cobertura) {
      throw new Error('El reservorio debe tener ubicación y radio de cobertura');
    }

    const [lng, lat] = reservorio.ubicacion.coordinates;
    const radio = reservorio.radio_cobertura;
    const polygon = this.generarCirculoPolygon(lat, lng, radio);

    const zona = this.zonaRepository.create({
      nombre: `Zona ${reservorio.nombre}`,
      radio_cobertura: radio,
      perimetro: polygon,
      reservorio: reservorio,
    });

    return this.zonaRepository.save(zona);
  }

  private generarCirculoPolygon(lat: number, lng: number, radioMetros: number): any {
    const puntos = 64;
    const radioGrados = radioMetros / 111320;
    const coordinates: number[][] = [];

    for (let i = 0; i <= puntos; i++) {
      const theta = (i / puntos) * 2 * Math.PI;
      const dLat = radioGrados * Math.sin(theta);
      const dLng = radioGrados * Math.cos(theta) / Math.cos(lat * Math.PI / 180);
      coordinates.push([lng + dLng, lat + dLat]);
    }

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  }

  async getRadioMinimo(id: string): Promise<number> {
    const reservorio = await this.findOne(id);
    const domiciliarios = reservorio.domiciliarios || [];
    
    if (domiciliarios.length === 0) {
      return 100;
    }

    const [resLng, resLat] = reservorio.ubicacion.coordinates;
    let distanciaMaxima = 0;

    for (const dom of domiciliarios) {
      if (dom.ubicacion?.coordinates) {
        const [domLng, domLat] = dom.ubicacion.coordinates;
        const distancia = this.calcularDistanciaHaversine(resLat, resLng, domLat, domLng);
        if (distancia > distanciaMaxima) {
          distanciaMaxima = distancia;
        }
      }
    }

    return Math.ceil(distanciaMaxima + 100);
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
}