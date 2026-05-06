import { Module } from '@nestjs/common';
import { TanqueService } from './tanque.service';
import { TanqueController } from './tanque.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TanqueEntity } from './entities/tanque.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TanqueEntity,
      UserEntity,
      SensorEntity,
      DispositivoESP32Entity,
    ]),
  ],
  controllers: [TanqueController],
  providers: [TanqueService],
})
export class TanqueModule {}
