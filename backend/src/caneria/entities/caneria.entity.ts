import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LineString } from 'geojson';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { v4 } from 'uuid';

@Entity('canerias')
export class CaneriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
  })
  ruta?: LineString;

  @Column()
  estado?: string;

  @ManyToOne(() => ReservorioEntity, { nullable: true })
  reservorioOrigen?: ReservorioEntity;

  @ManyToOne(() => ReservorioEntity, { nullable: true })
  reservorioDestino?: ReservorioEntity;

  @ManyToOne(() => DomiciliarioEntity, { nullable: true })
  domiciliarioDestino?: DomiciliarioEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}