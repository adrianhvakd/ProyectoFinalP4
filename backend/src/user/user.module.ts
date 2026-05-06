import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, TanqueEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
