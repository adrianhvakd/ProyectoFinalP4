import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaneriaEntity } from './entities/caneria.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import type { GeoJSONFeature, GeoJSONCollection } from '../common/geojson.interface';

@Injectable()
export class CaneriaService {
  constructor(
    @InjectRepository(CaneriaEntity)
    private readonly caneriaRepository: Repository<CaneriaEntity>,
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
  ) {}

  async findAllGeoJSON(): Promise<GeoJSONCollection> {
    const canerias = await this.caneriaRepository.find({
      relations: ['tanqueOrigen', 'tanqueDestino'],
    });

    const features: GeoJSONFeature[] = canerias.map((caneria) => ({
      type: 'Feature',
      id: caneria.id,
      geometry: {
        type: 'LineString',
        coordinates: caneria.ruta?.coordinates || [],
      },
      properties: {
        id: caneria.id,
        estado: caneria.estado || 'DESCONOCIDO',
        tanque_origen_id: caneria.tanqueOrigen?.id,
        tanque_destino_id: caneria.tanqueDestino?.id,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async findByTanqueId(tanqueId: string): Promise<GeoJSONCollection> {
    const tanque = await this.tanqueRepository.findOneBy({ id: tanqueId });
    if (!tanque) {
      throw new NotFoundException(`Tanque con ID ${tanqueId} no encontrado`);
    }

    const canerias = await this.caneriaRepository.find({
      where: [
        { tanqueOrigen: { id: tanqueId } },
        { tanqueDestino: { id: tanqueId } },
      ],
      relations: ['tanqueOrigen', 'tanqueDestino'],
    });

    const features: GeoJSONFeature[] = canerias.map((caneria) => ({
      type: 'Feature',
      id: caneria.id,
      geometry: {
        type: 'LineString',
        coordinates: caneria.ruta?.coordinates || [],
      },
      properties: {
        id: caneria.id,
        estado: caneria.estado || 'DESCONOCIDO',
        tanque_origen_id: caneria.tanqueOrigen?.id,
        tanque_destino_id: caneria.tanqueDestino?.id,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  create(createCaneriaDto: any) {
    return 'This action adds a new caneria';
  }

  async findAll() {
    return this.caneriaRepository.find();
  }

  async findOne(id: string) {
    const caneria = await this.caneriaRepository.findOneBy({ id });
    if (!caneria) {
      throw new NotFoundException(`Caneria con ID ${id} no encontrada`);
    }
    return caneria;
  }

  async update(id: string, updateCaneriaDto: any) {
    const caneria = await this.caneriaRepository.findOneBy({ id });
    if (!caneria) {
      throw new NotFoundException(`Caneria con ID ${id} no encontrada`);
    }
    return this.caneriaRepository.save({ ...caneria, ...updateCaneriaDto });
  }

  async remove(id: string) {
    const caneria = await this.caneriaRepository.findOneBy({ id });
    if (!caneria) {
      throw new NotFoundException(`Caneria con ID ${id} no encontrada`);
    }
    await this.caneriaRepository.remove(caneria);
    return { message: `Caneria con ID ${id} eliminada` };
  }
}