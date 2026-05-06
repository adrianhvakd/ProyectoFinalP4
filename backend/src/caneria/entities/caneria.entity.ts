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
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
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

  @ManyToOne(() => TanqueEntity, (tanque) => tanque.canerias, { nullable: true })
  tanqueOrigen?: TanqueEntity;

  @ManyToOne(() => TanqueEntity, (tanque) => tanque.canerias, { nullable: true })
  tanqueDestino?: TanqueEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}