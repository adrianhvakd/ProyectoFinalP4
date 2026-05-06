import { Module } from '@nestjs/common';
import { DispositivoEsp32Service } from './dispositivo-esp32.service';
import { DispositivoEsp32Controller } from './dispositivo-esp32.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoESP32Entity } from './entities/dispositivo-esp32.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoESP32Entity, TanqueEntity])],
  controllers: [DispositivoEsp32Controller],
  providers: [DispositivoEsp32Service],
})
export class DispositivoEsp32Module {}
