import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { MedicionEntity } from 'src/medicion/entities/medicion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TanqueEntity,
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