import { Module } from '@nestjs/common';
import { CaneriaService } from './caneria.service';
import { CaneriaController } from './caneria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaneriaEntity } from './entities/caneria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaneriaEntity])],
  controllers: [CaneriaController],
  providers: [CaneriaService],
})
export class CaneriaModule {}
