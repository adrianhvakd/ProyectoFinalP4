import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfigDB } from './config/config.database';
import { UserModule } from './user/user.module';
import { TanqueModule } from './tanque/tanque.module';
import { ZonaModule } from './zona/zona.module';
import { CaneriaModule } from './caneria/caneria.module';
import { MedicionModule } from './medicion/medicion.module';
import { SensorModule } from './sensor/sensor.module';
import { DispositivoEsp32Module } from './dispositivo-esp32/dispositivo-esp32.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => getConfigDB(),
    }),
    UserModule,
    TanqueModule,
    DispositivoEsp32Module,
    SensorModule,
    MedicionModule,
    CaneriaModule,
    ZonaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
