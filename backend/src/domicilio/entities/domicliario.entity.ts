import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Point } from 'geojson';
import { UserEntity } from 'src/user/entities/user.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { v4 } from 'uuid';

@Entity('tanques_domiciliario')
export class DomiciliarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Column('float')
  capacidad_max?: number;

  @Column('float')
  altura_max?: number;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  ubicacion: Point;

  @ManyToOne(() => ReservorioEntity, (reservorio) => reservorio.domiciliarios, { nullable: true, onDelete: 'SET NULL' })
  reservorio?: ReservorioEntity;

  @ManyToOne(() => UserEntity, (user) => user.domiciliarios)
  user?: UserEntity;

  @OneToMany(() => SensorEntity, (sensor) => sensor.domiciliario)
  sensores?: SensorEntity[];

  @OneToMany(() => DispositivoESP32Entity, (esp) => esp.domiciliario)
  dispositivos?: DispositivoESP32Entity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}