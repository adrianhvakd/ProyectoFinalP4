import { Module } from '@nestjs/common';
import { CaneriaService } from './caneria.service';
import { CaneriaController } from './caneria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaneriaEntity } from './entities/caneria.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaneriaEntity, TanqueEntity])],
  controllers: [CaneriaController],
  providers: [CaneriaService],
})
export class CaneriaModule {}