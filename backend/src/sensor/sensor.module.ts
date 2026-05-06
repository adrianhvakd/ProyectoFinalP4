import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorEntity } from './entities/sensor.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import { MedicionEntity } from 'src/medicion/entities/medicion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorEntity, TanqueEntity, MedicionEntity]),
  ],
  controllers: [SensorController],
  providers: [SensorService],
})
export class SensorModule {}
