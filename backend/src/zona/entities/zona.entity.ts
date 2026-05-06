import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Polygon } from 'geojson';
import { v4 } from 'uuid';

@Entity('zonas')
export class ZonaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  perimetro: Polygon;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
