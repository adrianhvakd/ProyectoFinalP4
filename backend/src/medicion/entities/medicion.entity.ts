import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('mediciones')
export class MedicionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id?: number;

  @Column('float')
  valor?: number;

  @CreateDateColumn()
  fecha_hora?: Date;

  @ManyToOne(() => SensorEntity, (sensor) => sensor.mediciones, {
    onDelete: 'CASCADE',
  })
  sensor?: SensorEntity;
}
