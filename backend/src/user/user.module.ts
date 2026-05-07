import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ReservorioEntity, DomiciliarioEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}