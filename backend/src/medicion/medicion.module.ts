import { Module } from '@nestjs/common';
import { MedicionService } from './medicion.service';
import { MedicionController } from './medicion.controller';
import { MedicionGateway } from './medicion.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicionEntity } from './entities/medicion.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicionEntity, SensorEntity, ReservorioEntity, DomiciliarioEntity, DispositivoESP32Entity])],
  controllers: [MedicionController],
  providers: [MedicionService, MedicionGateway],
  exports: [MedicionService],
})
export class MedicionModule {}