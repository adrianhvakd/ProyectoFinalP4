import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorEntity } from './entities/sensor.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { MedicionEntity } from 'src/medicion/entities/medicion.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorEntity, ReservorioEntity, DomiciliarioEntity, MedicionEntity, DispositivoESP32Entity]),
  ],
  controllers: [SensorController],
  providers: [SensorService],
})
export class SensorModule {}