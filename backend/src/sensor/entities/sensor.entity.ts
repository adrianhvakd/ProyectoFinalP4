import { MedicionEntity } from 'src/medicion/entities/medicion.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
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

@Entity('sensores')
export class SensorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column({
    type: 'enum',
    enum: ['NIVEL', 'PH', 'TURBIDEZ', 'TEMPERATURA', 'FLUJO'],
  })
  tipo?: string;

  @Column()
  unidad_medida?: string;

  @ManyToOne(() => ReservorioEntity, (reservorio) => reservorio.sensores, { nullable: true })
  reservorio?: ReservorioEntity;

  @ManyToOne(() => DomiciliarioEntity, (domiciliario) => domiciliario.sensores, { nullable: true })
  domiciliario?: DomiciliarioEntity;

  @ManyToOne(() => DispositivoESP32Entity, (dispositivo) => dispositivo.sensores, { nullable: true })
  dispositivo?: DispositivoESP32Entity;

  @OneToMany(() => MedicionEntity, (medicion) => medicion.sensor)
  mediciones?: MedicionEntity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}