import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonaEntity } from './entities/zona.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import type { GeoJSONFeature, GeoJSONCollection } from '../common/geojson.interface';

@Injectable()
export class ZonaService {
  constructor(
    @InjectRepository(ZonaEntity)
    private readonly zonaRepository: Repository<ZonaEntity>,
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
  ) {}

  async findAllGeoJSON(): Promise<GeoJSONCollection> {
    const zonas = await this.zonaRepository.find({
      relations: ['tanque'],
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
        tanque_id: zona.tanque?.id,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async getZonaByTanque(tanqueId: string): Promise<GeoJSONFeature | null> {
    const tanque = await this.tanqueRepository.findOne({
      where: { id: tanqueId },
      relations: ['zona'],
    });

    if (!tanque) {
      throw new NotFoundException(`Tanque con ID ${tanqueId} no encontrado`);
    }

    if (!tanque.zona) {
      return null;
    }

    const zona = tanque.zona;

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
        tanque_id: tanque.id,
      },
    };
  }

  create(createZonaDto: any) {
    return 'This action adds a new zona';
  }

  async findAll() {
    return this.zonaRepository.find({ relations: ['tanque'] });
  }

  async findOne(id: string) {
    const zona = await this.zonaRepository.findOne({
      where: { id },
      relations: ['tanque'],
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
}