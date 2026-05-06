import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
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

@Entity('dispositivos_esp32')
export class DispositivoESP32Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column()
  nombre?: string;

  @Column()
  ip_address?: string;

  @Column({ default: 80 })
  puerto?: number;

  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO',
  })
  estado?: string;

  @ManyToOne(() => TanqueEntity, (tanque) => tanque.dispositivos)
  tanque?: TanqueEntity;

  @OneToMany(() => SensorEntity, (sensor) => sensor.dispositivo)
  sensores?: SensorEntity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}