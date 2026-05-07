import { Module } from '@nestjs/common';
import { DispositivoEsp32Service } from './dispositivo-esp32.service';
import { DispositivoEsp32Controller } from './dispositivo-esp32.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoESP32Entity } from './entities/dispositivo-esp32.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoESP32Entity, ReservorioEntity, DomiciliarioEntity])],
  controllers: [DispositivoEsp32Controller],
  providers: [DispositivoEsp32Service],
})
export class DispositivoEsp32Module {}