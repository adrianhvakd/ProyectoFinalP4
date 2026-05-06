import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Polygon } from 'geojson';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import { v4 } from 'uuid';

@Entity('zonas')
export class ZonaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Column({ default: 0 })
  cantidad_usuarios?: number;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  perimetro: Polygon;

  @OneToOne(() => TanqueEntity, (tanque) => tanque.zona, { nullable: true })
  @JoinColumn()
  tanque?: TanqueEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}