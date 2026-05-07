import { Module } from '@nestjs/common';
import { CaneriaService } from './caneria.service';
import { CaneriaController } from './caneria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaneriaEntity } from './entities/caneria.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaneriaEntity, ReservorioEntity, DomiciliarioEntity])],
  controllers: [CaneriaController],
  providers: [CaneriaService],
})
export class CaneriaModule {}