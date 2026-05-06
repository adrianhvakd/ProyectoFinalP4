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
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { v4 } from 'uuid';

@Entity('tanques')
export class TanqueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Column({ type: 'enum', enum: ['RESERVORIO_PUBLICO', 'DOMICILIARIO'] })
  tipo?: string;

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

  @ManyToOne(() => UserEntity, (user) => user.tanques)
  user?: UserEntity;

  @OneToMany(() => SensorEntity, (sensor) => sensor.tanque)
  sensores?: SensorEntity[];

  @OneToMany(() => DispositivoESP32Entity, (esp) => esp.tanque)
  dispositivos?: DispositivoESP32Entity[];

  @OneToMany(() => CaneriaEntity, (caneria) => caneria.tanqueOrigen)
  canerias?: CaneriaEntity[];

  @OneToOne(() => ZonaEntity, (zona) => zona.tanque)
  zona?: ZonaEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
