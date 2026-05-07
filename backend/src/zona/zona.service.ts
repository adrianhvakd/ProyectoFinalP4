import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonaEntity } from './entities/zona.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import type { GeoJSONFeature, GeoJSONCollection } from '../common/geojson.interface';

@Injectable()
export class ZonaService {
  constructor(
    @InjectRepository(ZonaEntity)
    private readonly zonaRepository: Repository<ZonaEntity>,
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
  ) {}

  async findAllGeoJSON(): Promise<GeoJSONCollection> {
    const zonas = await this.zonaRepository.find({
      relations: ['reservorio'],
    });

    const features: GeoJSONFeature[] = zonas.map((zona) => ({
      type: 'Feature',
      id: zona.id,
      geometry: {
        type: 'Polygon',
        coordinates: zona.perimetro?.coordinates || [],
      },
      properties: {
        id: zona.id,
        nombre: zona.nombre || 'Sin nombre',
        reservorio_id: zona.reservorio?.id,
        radio_cobertura: zona.radio_cobertura,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async getZonaByReservorio(reservorioId: string): Promise<GeoJSONFeature | null> {
    const reservorio = await this.reservorioRepository.findOne({
      where: { id: reservorioId },
      relations: ['zona'],
    });

    if (!reservorio) {
      throw new NotFoundException(`Reservorio con ID ${reservorioId} no encontrado`);
    }

    if (!reservorio.zona) {
      return null;
    }

    const zona = reservorio.zona;

    return {
      type: 'Feature',
      id: zona.id,
      geometry: {
        type: 'Polygon',
        coordinates: zona.perimetro?.coordinates || [],
      },
      properties: {
        id: zona.id,
        nombre: zona.nombre || 'Sin nombre',
        reservorio_id: reservorio.id,
        radio_cobertura: zona.radio_cobertura,
      },
    };
  }

  create(createZonaDto: any) {
    return 'This action adds a new zona';
  }

  async findAll() {
    return this.zonaRepository.find({ relations: ['reservorio'] });
  }

  async findOne(id: string) {
    const zona = await this.zonaRepository.findOne({
      where: { id },
      relations: ['reservorio'],
    });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }
    return zona;
  }

  async update(id: string, updateZonaDto: any) {
    const zona = await this.zonaRepository.findOneBy({ id });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }
    return this.zonaRepository.save({ ...zona, ...updateZonaDto });
  }

  async remove(id: string) {
    const zona = await this.zonaRepository.findOneBy({ id });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }
    await this.zonaRepository.remove(zona);
    return { message: `Zona con ID ${id} eliminada` };
  }

  async crearZonaDesdeReservorio(reservorio: ReservorioEntity): Promise<ZonaEntity> {
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

  async actualizarZonaDesdeReservorio(reservorio: ReservorioEntity): Promise<ZonaEntity> {
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
}