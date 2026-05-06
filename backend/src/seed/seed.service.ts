import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/user/entities/user.entity';
import { TanqueEntity } from 'src/tanque/entities/tanque.entity';
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
    @InjectRepository(TanqueEntity)
    private readonly tanqueRepository: Repository<TanqueEntity>,
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
      await this.tanqueRepository.createQueryBuilder().delete().execute();
      await this.userRepository.createQueryBuilder().delete().execute();

      // Usuarios
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

      // Tanques admin - Potosí (centro aproximado: -19.57, -65.75)
      const t1 = await this.tanqueRepository.save({
        nombre: 'Tanque Central Potosí', tipo: 'RESERVORIO_PUBLICO', capacidad_max: 100000, altura_max: 15,
        ubicacion: { type: 'Point', coordinates: [-65.75, -19.57] }, user: admin,
      });
      const t2 = await this.tanqueRepository.save({
        nombre: 'Tanque Norte Cantatira', tipo: 'RESERVORIO_PUBLICO', capacidad_max: 80000, altura_max: 12,
        ubicacion: { type: 'Point', coordinates: [-65.735, -19.555] }, user: admin,
      });
      const t3 = await this.tanqueRepository.save({
        nombre: 'Tanque Sur Huacata', tipo: 'RESERVORIO_PUBLICO', capacidad_max: 60000, altura_max: 10,
        ubicacion: { type: 'Point', coordinates: [-65.765, -19.585] }, user: admin,
      });
      const t4 = await this.tanqueRepository.save({
        nombre: 'Tanque Este Villa Dolores', tipo: 'RESERVORIO_PUBLICO', capacidad_max: 50000, altura_max: 8,
        ubicacion: { type: 'Point', coordinates: [-65.725, -19.57] }, user: admin,
      });

      // Tanques user1
      const t5 = await this.tanqueRepository.save({
        nombre: 'Tanque Juan - Centro', tipo: 'DOMICILIARIO', capacidad_max: 5000, altura_max: 3,
        ubicacion: { type: 'Point', coordinates: [-65.745, -19.575] }, user: user1,
      });
      const t6 = await this.tanqueRepository.save({
        nombre: 'Tanque Juan - Casa', tipo: 'DOMICILIARIO', capacidad_max: 3000, altura_max: 2,
        ubicacion: { type: 'Point', coordinates: [-65.73, -19.565] }, user: user1,
      });

      // Tanques user2
      const t7 = await this.tanqueRepository.save({
        nombre: 'Tanque María - Villa Fatima', tipo: 'DOMICILIARIO', capacidad_max: 4000, altura_max: 2.5,
        ubicacion: { type: 'Point', coordinates: [-65.76, -19.56] }, user: user2,
      });
      const t8 = await this.tanqueRepository.save({
        nombre: 'Tanque María - Centro', tipo: 'DOMICILIARIO', capacidad_max: 2500, altura_max: 1.8,
        ubicacion: { type: 'Point', coordinates: [-65.755, -19.58] }, user: user2,
      });

      // Dispositivos ESP32 (al menos 1 por tanque)
      const dispositivos: DispositivoESP32Entity[] = [];
      const tankIds = [t1, t2, t3, t4, t5, t6, t7, t8];
      const nombresEsp = ['ESP-001', 'ESP-002', 'ESP-003', 'ESP-004', 'ESP-005', 'ESP-006', 'ESP-007', 'ESP-008'];
      const ips = ['192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104', '192.168.1.105', '192.168.1.106', '192.168.1.107', '192.168.1.108'];
      
      for (let i = 0; i < tankIds.length; i++) {
        const disp = await this.dispositivoRepository.save({
          nombre: nombresEsp[i],
          ip_address: ips[i],
          puerto: 80,
          estado: 'ACTIVO',
          tanque: tankIds[i],
        });
        dispositivos.push(disp);
      }

      // Sensores (al menos 1 por tanque, relacionados a su ESP32)
      const sensores: SensorEntity[] = [];
      for (let i = 0; i < tankIds.length; i++) {
        const sn = await this.sensorRepository.save({ 
          tipo: 'NIVEL', unidad_medida: '%', tanque: tankIds[i], dispositivo: dispositivos[i] 
        });
        const sp = await this.sensorRepository.save({ 
          tipo: 'PH', unidad_medida: 'pH', tanque: tankIds[i], dispositivo: dispositivos[i] 
        });
        sensores.push(sn, sp);
      }

      // Mediciones
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

      // Zonas (más pequeñas y centradas en Potosí)
      await this.zonaRepository.save({
        nombre: 'Zona Centro Potosí',
        perimetro: { type: 'Polygon', coordinates: [[
          [-65.77, -19.59], [-65.73, -19.59], [-65.73, -19.55], [-65.77, -19.55], [-65.77, -19.59]
        ]]},
        tanque: t1,
      });

      await this.zonaRepository.save({
        nombre: 'Zona Norte Cantatira',
        perimetro: { type: 'Polygon', coordinates: [[
          [-65.75, -19.57], [-65.72, -19.57], [-65.72, -19.54], [-65.75, -19.54], [-65.75, -19.57]
        ]]},
        cantidad_usuarios: 150,
        tanque: t2,
      });

      await this.zonaRepository.save({
        nombre: 'Zona Sur Huacata',
        perimetro: { type: 'Polygon', coordinates: [[
          [-65.79, -19.61], [-65.76, -19.61], [-65.76, -19.57], [-65.79, -19.57], [-65.79, -19.61]
        ]]},
        cantidad_usuarios: 200,
        tanque: t3,
      });

      // Cañerías (red más completa entre tanques)
      // Del central a todos los demás
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.735, -19.555]] },
        estado: 'ACTIVO', tanqueOrigen: t1, tanqueDestino: t2,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.765, -19.585]] },
        estado: 'ACTIVO', tanqueOrigen: t1, tanqueDestino: t3,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.725, -19.57]] },
        estado: 'ACTIVO', tanqueOrigen: t1, tanqueDestino: t4,
      });
      
      // Conexiones entre reservorios (t2, t3, t4)
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.735, -19.555], [-65.725, -19.57]] },
        estado: 'ACTIVO', tanqueOrigen: t2, tanqueDestino: t4,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.765, -19.585], [-65.735, -19.555]] },
        estado: 'ACTIVO', tanqueOrigen: t3, tanqueDestino: t2,
      });
      
      // Conexiones a domiciliarios
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.735, -19.555], [-65.73, -19.565]] },
        estado: 'ACTIVO', tanqueOrigen: t2, tanqueDestino: t6,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.75, -19.57], [-65.745, -19.575]] },
        estado: 'ACTIVO', tanqueOrigen: t1, tanqueDestino: t5,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.765, -19.585], [-65.755, -19.58]] },
        estado: 'ACTIVO', tanqueOrigen: t3, tanqueDestino: t8,
      });
      await this.caneriaRepository.save({
        ruta: { type: 'LineString', coordinates: [[-65.765, -19.585], [-65.76, -19.56]] },
        estado: 'ACTIVO', tanqueOrigen: t3, tanqueDestino: t7,
      });

      return { message: 'Seed completado - Potosí Bolivia', 
        tanques: 8, 
        dispositivos: 8, 
        sensores: 16, 
        zonas: 3, 
        canerias: 8,
        usuarios: ['admin@test.com', 'user1@test.com', 'user2@test.com'] 
      };
    } catch (e) {
      this.logger.error(e.message);
      return { error: e.message };
    }
  }
}