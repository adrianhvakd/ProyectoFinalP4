import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConfigDB } from './config/config.database';
import { UserModule } from './user/user.module';
import { ReservorioModule } from './reservorio/reservorio.module';
import { DomiciliarioModule } from './domicilio/domiciliario.module';
import { ZonaModule } from './zona/zona.module';
import { CaneriaModule } from './caneria/caneria.module';
import { MedicionModule } from './medicion/medicion.module';
import { SensorModule } from './sensor/sensor.module';
import { DispositivoEsp32Module } from './dispositivo-esp32/dispositivo-esp32.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => getConfigDB(),
    }),
    UserModule,
    ReservorioModule,
    DomiciliarioModule,
    DispositivoEsp32Module,
    SensorModule,
    MedicionModule,
    CaneriaModule,
    ZonaModule,
    AuthModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}