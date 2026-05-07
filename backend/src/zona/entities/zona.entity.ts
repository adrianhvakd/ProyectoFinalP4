import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Polygon } from 'geojson';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { v4 } from 'uuid';

@Entity('zonas')
export class ZonaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Column({ default: 500 })
  radio_cobertura?: number;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  perimetro: Polygon;

  @ManyToOne(() => ReservorioEntity, (reservorio) => reservorio.zona, {
    nullable: true,
  })
  @JoinColumn()
  reservorio?: ReservorioEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
