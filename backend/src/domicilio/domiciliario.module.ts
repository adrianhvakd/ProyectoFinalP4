import { Module } from '@nestjs/common';
import { DomiciliarioService } from './domiciliario.service';
import { DomiciliarioController } from './domiciliario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomiciliarioEntity } from './entities/domicliario.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DomiciliarioEntity,
      ReservorioEntity,
      UserEntity,
      SensorEntity,
      DispositivoESP32Entity,
      CaneriaEntity,
    ]),
  ],
  controllers: [DomiciliarioController],
  providers: [DomiciliarioService],
})
export class DomiciliarioModule {}