import { Module } from '@nestjs/common';
import { ReservorioService } from './reservorio.service';
import { ReservorioController } from './reservorio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservorioEntity } from './entities/reservorio.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservorioEntity,
      UserEntity,
      SensorEntity,
      DispositivoESP32Entity,
      ZonaEntity,
      CaneriaEntity,
      DomiciliarioEntity,
    ]),
  ],
  controllers: [ReservorioController],
  providers: [ReservorioService],
})
export class ReservorioModule {}