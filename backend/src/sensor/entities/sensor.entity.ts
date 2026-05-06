import { MedicionEntity } from 'src/medicion/entities/medicion.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
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

  @ManyToOne(() => TanqueEntity, (tanque) => tanque.sensores)
  tanque?: TanqueEntity;

  @OneToMany(() => MedicionEntity, (medicion) => medicion.sensor)
  mediciones?: MedicionEntity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
