import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';

@Entity('dispositivos_esp32')
export class DispositivoESP32Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column({ unique: true })
  api_key: string = v4();

  @Column()
  nombre?: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO',
  })
  estado?: string;

  @ManyToOne(() => ReservorioEntity, (reservorio) => reservorio.dispositivos, { nullable: true })
  reservorio?: ReservorioEntity;

  @ManyToOne(() => DomiciliarioEntity, (domiciliario) => domiciliario.dispositivos, { nullable: true })
  domiciliario?: DomiciliarioEntity;

  @OneToMany(() => SensorEntity, (sensor) => sensor.dispositivo)
  sensores?: SensorEntity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}