import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Point } from 'geojson';
import { UserEntity } from 'src/user/entities/user.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { v4 } from 'uuid';

@Entity('tanques_reservorio')
export class ReservorioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Column({ default: 'RESERVORIO_PUBLICO' })
  tipo?: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO' = 'RESERVORIO_PUBLICO';

  @Column('float')
  capacidad_max?: number;

  @Column('float')
  altura_max?: number;

  @Column({ default: 1000 })
  radio_cobertura?: number;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  ubicacion: Point;

  @ManyToOne(() => UserEntity, (user) => user.tanques)
  user?: UserEntity;

  @OneToMany(() => SensorEntity, (sensor) => sensor.reservorio)
  sensores?: SensorEntity[];

  @OneToMany(() => DispositivoESP32Entity, (esp) => esp.reservorio)
  dispositivos?: DispositivoESP32Entity[];

  @OneToMany(() => DomiciliarioEntity, (d) => d.reservorio)
  domiciliarios?: DomiciliarioEntity[];

  @OneToOne(() => ZonaEntity, (zona) => zona.reservorio)
  zona?: ZonaEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}