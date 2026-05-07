import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { MedicionEntity } from 'src/medicion/entities/medicion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ReservorioEntity,
      DomiciliarioEntity,
      ZonaEntity,
      CaneriaEntity,
      SensorEntity,
      DispositivoESP32Entity,
      MedicionEntity,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}