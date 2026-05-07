import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = v4();

  @Column({ unique: true })
  email?: string;

  @Column()
  password?: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'USER'], default: 'USER' })
  role?: string;

  @Column()
  nombre?: string;

  @OneToMany(() => ReservorioEntity, (reservorio) => reservorio.user)
  tanques?: ReservorioEntity[];

  @OneToMany(() => DomiciliarioEntity, (domicliario) => domicliario.user)
  domiciliarios?: DomiciliarioEntity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}