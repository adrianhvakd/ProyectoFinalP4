import { Module } from '@nestjs/common';
import { MedicionService } from './medicion.service';
import { MedicionController } from './medicion.controller';
import { MedicionGateway } from './medicion.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicionEntity } from './entities/medicion.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicionEntity, SensorEntity, TanqueEntity])],
  controllers: [MedicionController],
  providers: [MedicionService, MedicionGateway],
  exports: [MedicionService],
})
export class MedicionModule {}