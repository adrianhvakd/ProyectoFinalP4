import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaneriaEntity } from './entities/caneria.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import type { GeoJSONFeature, GeoJSONCollection } from '../common/geojson.interface';

@Injectable()
export class CaneriaService {
  constructor(
    @InjectRepository(CaneriaEntity)
    private readonly caneriaRepository: Repository<CaneriaEntity>,
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
  ) {}

  async findAllGeoJSON(): Promise<GeoJSONCollection> {
    const canerias = await this.caneriaRepository.find({
      relations: ['reservorioOrigen', 'reservorioDestino', 'domiciliarioDestino'],
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
        reservorio_origen_id: caneria.reservorioOrigen?.id,
        reservorio_destino_id: caneria.reservorioDestino?.id,
        domiciliario_destino_id: caneria.domiciliarioDestino?.id,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async findByReservorioId(reservorioId: string): Promise<GeoJSONCollection> {
    await this.reservorioRepository.findOneBy({ id: reservorioId });

    const canerias = await this.caneriaRepository.find({
      where: [
        { reservorioOrigen: { id: reservorioId } },
        { reservorioDestino: { id: reservorioId } },
      ],
      relations: ['reservorioOrigen', 'reservorioDestino', 'domiciliarioDestino'],
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
        reservorio_origen_id: caneria.reservorioOrigen?.id,
        reservorio_destino_id: caneria.reservorioDestino?.id,
        domiciliario_destino_id: caneria.domiciliarioDestino?.id,
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

  async crearCañeriaDesdeReservorio(reservorio: ReservorioEntity, domiciliario: DomiciliarioEntity): Promise<CaneriaEntity> {
    if (!reservorio.ubicacion?.coordinates || !domiciliario.ubicacion?.coordinates) {
      throw new Error('El reservorio y el domiciliario deben tener ubicación');
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

    return this.caneriaRepository.save(caneria);
  }
}