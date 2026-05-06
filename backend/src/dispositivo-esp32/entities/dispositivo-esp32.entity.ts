import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';

@Entity('dispositivos_esp32')
export class DispositivoESP32Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column({ unique: true })
  chip_id?: string;

  @Column()
  api_key?: string;

  @Column({ default: true })
  is_active?: boolean;

  @ManyToOne(() => TanqueEntity, (tanque) => tanque.dispositivos)
  tanque?: TanqueEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
