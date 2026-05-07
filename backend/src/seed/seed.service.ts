import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/user/entities/user.entity';
import { ReservorioEntity } from 'src/reservorio/entities/reservorio.entity';
import { DomiciliarioEntity } from 'src/domicilio/entities/domicliario.entity';
import { ZonaEntity } from 'src/zona/entities/zona.entity';
import { CaneriaEntity } from 'src/caneria/entities/caneria.entity';
import { SensorEntity } from 'src/sensor/entities/sensor.entity';
import { DispositivoESP32Entity } from 'src/dispositivo-esp32/entities/dispositivo-esp32.entity';
import { MedicionEntity } from 'src/medicion/entities/medicion.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ReservorioEntity)
    private readonly reservorioRepository: Repository<ReservorioEntity>,
    @InjectRepository(DomiciliarioEntity)
    private readonly domiciliarioRepository: Repository<DomiciliarioEntity>,
    @InjectRepository(ZonaEntity)
    private readonly zonaRepository: Repository<ZonaEntity>,
    @InjectRepository(CaneriaEntity)
    private readonly caneriaRepository: Repository<CaneriaEntity>,
    @InjectRepository(SensorEntity)
    private readonly sensorRepository: Repository<SensorEntity>,
    @InjectRepository(DispositivoESP32Entity)
    private readonly dispositivoRepository: Repository<DispositivoESP32Entity>,
    @InjectRepository(MedicionEntity)
    private readonly medicionRepository: Repository<MedicionEntity>,
  ) {}

  async seed() {
    try {
      await this.medicionRepository.createQueryBuilder().delete().execute();
      await this.sensorRepository.createQueryBuilder().delete().execute();
      await this.dispositivoRepository.createQueryBuilder().delete().execute();
      await this.caneriaRepository.createQueryBuilder().delete().execute();
      await this.zonaRepository.createQueryBuilder().delete().execute();
      await this.domiciliarioRepository.createQueryBuilder().delete().execute();
      await this.reservorioRepository.createQueryBuilder().delete().execute();
      await this.userRepository.createQueryBuilder().delete().execute();

      const hashedAdmin = await bcrypt.hash('admin123', 10);
      const hashedUser = await bcrypt.hash('user123', 10);

      const admin = await this.userRepository.save({
        email: 'admin@test.com', password: hashedAdmin, nombre: 'Administrador', role: 'ADMIN',
      });
      const user1 = await this.userRepository.save({
        email: 'user1@test.com', password: hashedUser, nombre: 'Juan Pérez', role: 'USER',
      });
      const user2 = await this.userRepository.save({
        email: 'user2@test.com', password: hashedUser, nombre: 'María García', role: 'USER',
      });

      const r1 = await this.reservorioRepository.save({
        nombre: 'Reservorio Central Potosí', capacidad_max: 100000, altura_max: 15, radio_cobertura: 1500,
        ubicacion: { type: 'Point', coordinates: [-65.75, -19.57] }, user: admin,
      });
      const r2 = await this.reservorioRepository.save({
        nombre: 'Reservorio Norte Cantatira', capacidad_max: 80000, altura_max: 12, radio_cobertura: 1000,
        ubicacion: { type: 'Point', coordinates: [-65.735, -19.555] }, user: admin,
      });
      const r3 = await this.reservorioRepository.save({
        nombre: 'Reservorio Sur Huacata', capacidad_max: 60000, altura_max: 10, radio_cobertura: 800,
        ubicacion: { type: 'Point', coordinates: [-65.765, -19.585] }, user: admin,
      });
      const r4 = await this.reservorioRepository.save({
        nombre: 'Reservorio Este Villa Dolores', capacidad_max: 50000, altura_max: 8, radio_cobertura: 600,
        ubicacion: { type: 'Point', coordinates: [-65.725, -19.57] }, user: admin,
      });

      const d1 = await this.domiciliarioRepository.save({
        nombre: 'Tanque Juan - Centro', capacidad_max: 5000, altura_max: 3,
        ubicacion: { type: 'Point', coordinates: [-65.745, -19.575] }, reservorio: r1, user: user1,
      });
      const d2 = await this.domiciliarioRepository.save({
        nombre: 'Tanque Juan - Casa', capacidad_max: 3000, altura_max: 2,
        ubicacion: { type: 'Point', coordinates: [-65.73, -19.565] }, reservorio: r2, user: user1,
      });
      const d3 = await this.domiciliarioRepository.save({
        nombre: 'Tanque María - Villa Fatima', capacidad_max: 4000, altura_max: 2.5,
        ubicacion: { type: 'Point', coordinates: [-65.76, -19.56] }, reservorio: r3, user: user2,
      });
      const d4 = await this.domiciliarioRepository.save({
        nombre: 'Tanque María - Centro', capacidad_max: 2500, altura_max: 1.8,
        ubicacion: { type: 'Point', coordinates: [-65.755, -19.58] }, reservorio: r3, user: user2,
      });

      const dispositivos: DispositivoESP32Entity[] = [];
      const reservorios = [r1, r2, r3, r4];
      const domiciliarios = [d1, d2, d3, d4];
      const nombresEsp = ['ESP-Central', 'ESP-Norte', 'ESP-Sur', 'ESP-Este', 'ESP-Juan1', 'ESP-Juan2', 'ESP-Maria1', 'ESP-Maria2'];

      for (let i = 0; i < 4; i++) {
        const disp = await this.dispositivoRepository.save({
          nombre: nombresEsp[i],
          api_key: this.generateApiKey(),
          estado: 'ACTIVO',
          reservorio: reservorios[i],
        });
        dispositivos.push(disp);
      }

      for (let i = 0; i < 4; i++) {
        const disp = await this.dispositivoRepository.save({
          nombre: nombresEsp[i + 4],
          api_key: this.generateApiKey(),
          estado: 'ACTIVO',
          domiciliario: domiciliarios[i],
        });
        dispositivos.push(disp);
      }

      const todosTanques = [...reservorios, ...domiciliarios];
      const sensores: SensorEntity[] = [];

      for (let i = 0; i < todosTanques.length; i++) {
        const t = todosTanques[i];
        if (i < 4) {
          const sn = await this.sensorRepository.save({ 
            tipo: 'NIVEL', unidad_medida: '%', reservorio: t as ReservorioEntity, dispositivo: dispositivos[i] 
          });
          const sp = await this.sensorRepository.save({ 
            tipo: 'PH', unidad_medida: 'pH', reservorio: t as ReservorioEntity, dispositivo: dispositivos[i] 
          });
          sensores.push(sn, sp);
        } else {
          const idx = i - 4;
          const sn = await this.sensorRepository.save({ 
            tipo: 'NIVEL', unidad_medida: '%', domiciliario: t as DomiciliarioEntity, dispositivo: dispositivos[i] 
          });
          const sp = await this.sensorRepository.save({ 
            tipo: 'PH', unidad_medida: 'pH', domiciliario: t as DomiciliarioEntity, dispositivo: dispositivos[i] 
          });
          sensores.push(sn, sp);
        }
      }

      for (const s of sensores) {
        for (let i = 0; i < 10; i++) {
          const f = new Date();
          f.setHours(f.getHours() - i);
          const v = s.tipo === 'NIVEL' ? 50 + Math.random() * 40 : 6 + Math.random() * 2;
          await this.medicionRepository.save({
            valor: parseFloat(v.toFixed(2)), fecha_hora: f, sensor: s,
          });
        }
      }

      await this.zonaRepository.save({
        nombre: 'Zona Centro Potosí',
        radio_cobertura: 1500,
        perimetro: { type: 'Polygon', coordinates: [[
          [-65.77, -19.59], [-65.73, -19.59], [-65.73, -19.55], [-65.77, -19.55], [-65.77, -19.59]
        ]]},
        reservorio: r1,
      });

      await this.zonaRepository.save({
        nombre: 'Zona Norte Cantatira',
        radio_cobertura: 1000,
        perimetro: { type: 'Polygon', coordinates: [[
          [-65.75, -19.57], [-65.72, -19.57], [-65.72, -19.54], [-65.75, -19.54], [-65.75, -19.57]
        ]]},
        reservorio: r2,
      });

      await this.zonaRepository.save({
        nombre: 'Zona Sur Huacata',
        radio_cobertura: 800,
        perimetro: { type: 'Polygon', coordinates: [[
          [-65.79, -19.61], [-65.76, -19.61], [-65.76, -19.57], [-65.79, -19.57], [-65.79, -19.61]
        ]]},
        reservorio: r3,
      });

      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.735, -19.555]] },
        estado: 'ACTIVO', reservorioOrigen: r1, reservorioDestino: r2,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.765, -19.585]] },
        estado: 'ACTIVO', reservorioOrigen: r1, reservorioDestino: r3,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.725, -19.57]] },
        estado: 'ACTIVO', reservorioOrigen: r1, reservorioDestino: r4,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.735, -19.555], [-65.725, -19.57]] },
        estado: 'ACTIVO', reservorioOrigen: r2, reservorioDestino: r4,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.765, -19.585], [-65.735, -19.555]] },
        estado: 'ACTIVO', reservorioOrigen: r3, reservorioDestino: r2,
      });

      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.735, -19.555], [-65.73, -19.565]] },
        estado: 'ACTIVO', reservorioOrigen: r2, domiciliarioDestino: d2,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.745, -19.575]] },
        estado: 'ACTIVO', reservorioOrigen: r1, domiciliarioDestino: d1,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.765, -19.585], [-65.755, -19.58]] },
        estado: 'ACTIVO', reservorioOrigen: r3, domiciliarioDestino: d4,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.765, -19.585], [-65.76, -19.56]] },
        estado: 'ACTIVO', reservorioOrigen: r3, domiciliarioDestino: d3,
      });

      return { message: 'Seed completado - Potosí Bolivia', 
        reservorios: 4, 
        domiciliarios: 4,
        dispositivos: 8, 
        sensores: 16, 
        zonas: 3, 
        canerias: 9,
        usuarios: ['admin@test.com', 'user1@test.com', 'user2@test.com'] 
      };
    } catch (e) {
      this.logger.error(e.message);
      return { error: e.message };
    }
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}