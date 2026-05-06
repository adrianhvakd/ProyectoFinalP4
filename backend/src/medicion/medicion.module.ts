import { Module } from '@nestjs/common';
import { MedicionService } from './medicion.service';
import { MedicionController } from './medicion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicionEntity } from './entities/medicion.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicionEntity, SensorEntity])],
  controllers: [MedicionController],
  providers: [MedicionService],
})
export class MedicionModule {}
