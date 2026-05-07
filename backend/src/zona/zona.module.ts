import { Module } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { ZonaController } from './zona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonaEntity } from './entities/zona.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ZonaEntity, ReservorioEntity])],
  controllers: [ZonaController],
  providers: [ZonaService],
})
export class ZonaModule {}