import { Component, Input, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeoJSONFeature, Tanque, Sensor, DispositivoESP32, ApiService } from '../../services/api.service';
import * as L from 'leaflet';

type Paso = 'tanque' | 'esp32' | 'sensores' | 'resumen';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full h-[500px] rounded-lg overflow-hidden border border-base-300 relative">
      <div #mapContainer id="map" class="w-full h-full"></div>
      
      @if (mostrarClickInstruction()) {
        <div class="absolute top-2 left-2 z-[1000] bg-base-100 px-3 py-1 rounded shadow text-sm">
          Click en el mapa para agregar un tanque
        </div>
      }
    </div>

    @if (mostrarModal()) {
      <dialog class="modal modal-open">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-4">
            {{ editandoTanque() ? 'Editar Tanque' : 'Nuevo Tanque (Paso ' + pasoActual() + '/3)' }}
          </h3>

          <!-- Progress steps -->
          <div class="flex justify-center mb-6">
            <div class="flex items-center">
              @if (stepNumber('tanque') <= stepIndex()) {
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
              } @else {
                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center font-bold">1</div>
              }
              <span class="ml-2" [class.font-bold]="stepNumber('tanque') === stepIndex()">Tanque</span>
            </div>
            <div class="w-8 h-0.5 bg-base-300 mx-2"></div>
            <div class="flex items-center">
              @if (stepNumber('esp32') <= stepIndex()) {
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
              } @else {
                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center font-bold">2</div>
              }
              <span class="ml-2" [class.font-bold]="stepNumber('esp32') === stepIndex()">ESP32</span>
            </div>
            <div class="w-8 h-0.5 bg-base-300 mx-2"></div>
            <div class="flex items-center">
              @if (stepNumber('sensores') <= stepIndex()) {
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
              } @else {
                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center font-bold">3</div>
              }
              <span class="ml-2" [class.font-bold]="stepNumber('sensores') === stepIndex()">Sensores</span>
            </div>
          </div>

          <!-- Paso 1: Datos del Tanque -->
          @if (pasoActual() === 'tanque') {
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control col-span-2">
                <label class="label"><span class="label-text">Nombre del Tanque</span></label>
                <input type="text" [(ngModel)]="tanqueForm().nombre" class="input input-bordered" placeholder="Tanque Centro" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Tipo</span></label>
                <select [(ngModel)]="tanqueForm().tipo" class="select select-bordered">
                  <option value="RESERVORIO_PUBLICO">Reservorio Público</option>
                  <option value="DOMICILIARIO">Domiciliario</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Capacidad (L)</span></label>
                <input type="number" [(ngModel)]="tanqueForm().capacidad_max" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Altura (m)</span></label>
                <input type="number" [(ngModel)]="tanqueForm().altura_max" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Latitud</span></label>
                <input type="number" [(ngModel)]="tanqueForm().lat" class="input input-bordered" readonly />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Longitud</span></label>
                <input type="number" [(ngModel)]="tanqueForm().lng" class="input input-bordered" readonly />
              </div>
            </div>
          }

          <!-- Paso 2: ESP32 -->
          @if (pasoActual() === 'esp32') {
            <div class="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Se requiere crear al menos un dispositivo ESP32 para poder agregar sensores</span>
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold mb-2">Dispositivos ESP32</h4>
              <button class="btn btn-sm btn-outline" (click)="agregarDispositivo()">+ Agregar ESP32</button>
            </div>
            
            <div class="space-y-3">
              @for (disp of dispositivosForm(); track $index) {
                <div class="flex gap-2 items-end p-3 bg-base-200 rounded-lg">
                  <div class="form-control flex-1">
                    <label class="label text-xs"><span class="label-text">Nombre</span></label>
                    <input type="text" [(ngModel)]="disp.nombre" class="input input-sm input-bordered" placeholder="ESP-01" />
                  </div>
                  <div class="form-control flex-1">
                    <label class="label text-xs"><span class="label-text">IP</span></label>
                    <input type="text" [(ngModel)]="disp.ip_address" class="input input-sm input-bordered" placeholder="192.168.1.100" />
                  </div>
                  <div class="form-control w-20">
                    <label class="label text-xs"><span class="label-text">Puerto</span></label>
                    <input type="number" [(ngModel)]="disp.puerto" class="input input-sm input-bordered" />
                  </div>
                  <button class="btn btn-sm btn-error mb-0.5" (click)="eliminarDispositivo($index)">X</button>
                </div>
              }
              
              @if (dispositivosForm().length === 0) {
                <div class="text-center text-error py-4">
                  Debe agregar al menos un ESP32
                </div>
              }
            </div>
          }

          <!-- Paso 3: Sensores -->
          @if (pasoActual() === 'sensores') {
            <div class="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Debe agregar al menos un sensor</span>
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold mb-2">Sensores</h4>
              <button class="btn btn-sm btn-outline" (click)="agregarSensor()">+ Agregar Sensor</button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="table table-xs">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Unidad</th>
                    <th>ESP32</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (sensor of sensoresForm(); track $index) {
                    <tr>
                      <td>
                        <select [(ngModel)]="sensor.tipo" class="select select-xs select-bordered">
                          <option value="NIVEL">NIVEL</option>
                          <option value="PH">PH</option>
                          <option value="TURBIDEZ">TURBIDEZ</option>
                          <option value="TEMPERATURA">TEMPERATURA</option>
                          <option value="FLUJO">FLUJO</option>
                        </select>
                      </td>
                      <td>
                        <input type="text" [(ngModel)]="sensor.unidad_medida" class="input input-xs input-bordered w-20" placeholder="%" />
                      </td>
                      <td>
                        <select [(ngModel)]="sensor.dispositivoId" class="select select-xs select-bordered">
                          @for (disp of dispositivosForm(); track disp.id || $index) {
                            <option [value]="disp.id || 'new-' + $index">{{ disp.nombre || 'ESP-' + $index }}</option>
                          }
                        </select>
                      </td>
                      <td>
                        <button class="btn btn-xs btn-error" (click)="eliminarSensor($index)">X</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            
            @if (sensoresForm().length === 0) {
              <div class="text-center text-error py-4">
                Debe agregar al menos un sensor
              </div>
            }
          }

          <!-- Resumen (for editing) -->
          @if (editandoTanque() && pasoActual() === 'resumen') {
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Nombre:</strong> {{ tanqueForm().nombre }}</div>
                <div><strong>Tipo:</strong> {{ tanqueForm().tipo }}</div>
                <div><strong>Capacidad:</strong> {{ tanqueForm().capacidad_max }}L</div>
                <div><strong>Altura:</strong> {{ tanqueForm().altura_max }}m</div>
              </div>
              
              <div>
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-semibold">ESP32 ({{ dispositivosForm().length }})</h4>
                  <button class="btn btn-xs btn-outline" (click)="agregarDispositivo()">+ Agregar</button>
                </div>
                <ul class="space-y-1 text-sm">
                  @for (disp of dispositivosForm(); track disp.id || $index) {
                    <li class="flex justify-between items-center bg-base-200 p-2 rounded">
                      <span>{{ disp.nombre }} ({{ disp.ip_address }}:{{ disp.puerto }})</span>
                      <button class="btn btn-xs btn-error" (click)="eliminarDispositivo($index)">X</button>
                    </li>
                  }
                </ul>
                @if (dispositivosForm().length === 0) {
                  <div class="text-error text-sm">Sin ESP32 - Agrega uno para poder añadir sensores</div>
                }
              </div>
              
              <div>
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-semibold">Sensores ({{ sensoresForm().length }})</h4>
                  <button class="btn btn-xs btn-outline" [disabled]="dispositivosForm().length === 0" (click)="agregarSensor()">+ Agregar</button>
                </div>
                <ul class="space-y-1 text-sm">
                  @for (sensor of sensoresForm(); track sensor.id || $index) {
                    <li class="flex justify-between items-center bg-base-200 p-2 rounded">
                      <span>{{ sensor.tipo }} ({{ sensor.unidad_medida }})</span>
                      <button class="btn btn-xs btn-error" (click)="eliminarSensor($index)">X</button>
                    </li>
                  }
                </ul>
                @if (sensoresForm().length === 0) {
                  <div class="text-warning text-sm">Sin sensores</div>
                }
              </div>

              <div class="flex gap-2 mt-4">
                <button class="btn btn-primary flex-1" (click)="sigPaso()">Editar Tanque</button>
                <button class="btn btn-error flex-1" (click)="eliminarTanque()">Eliminar</button>
              </div>
            </div>
          }

          @if (editandoTanque() && pasoActual() === 'tanque') {
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control col-span-2">
                <label class="label"><span class="label-text">Nombre del Tanque</span></label>
                <input type="text" [(ngModel)]="tanqueForm().nombre" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Tipo</span></label>
                <select [(ngModel)]="tanqueForm().tipo" class="select select-bordered">
                  <option value="RESERVORIO_PUBLICO">Reservorio Público</option>
                  <option value="DOMICILIARIO">Domiciliario</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Capacidad (L)</span></label>
                <input type="number" [(ngModel)]="tanqueForm().capacidad_max" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Altura (m)</span></label>
                <input type="number" [(ngModel)]="tanqueForm().altura_max" class="input input-bordered" />
              </div>
            </div>
          }

          <div class="modal-action">
            @if (editandoTanque()) {
              @if (pasoActual() === 'resumen') {
                <button class="btn" (click)="cerrarModal()">Cerrar</button>
              } @else {
                <button class="btn btn-outline" (click)="antPaso()">Volver</button>
                <button class="btn btn-primary" (click)="guardarTanque()">Guardar Cambios</button>
              }
            } @else {
              @if (pasoActual() === 'tanque') {
                <button class="btn btn-primary" [disabled]="!tanqueForm().nombre" (click)="sigPaso()">Siguiente</button>
              }
              @if (pasoActual() === 'esp32') {
                <button class="btn btn-outline" (click)="antPaso()">Anterior</button>
                <button class="btn btn-primary" [disabled]="dispositivosForm().length === 0" (click)="sigPaso()">Siguiente</button>
              }
              @if (pasoActual() === 'sensores') {
                <button class="btn btn-outline" (click)="antPaso()">Anterior</button>
                <button class="btn btn-primary" [disabled]="sensoresForm().length === 0" (click)="guardarTanque()">Guardar</button>
              }
            }
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button (click)="cerrarModal()">cerrar</button>
        </form>
      </dialog>
    }
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class MapaComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  @Input() tanques: Tanque[] = [];
  @Input() mostrarCanerias = true;
  @Input() mostrarZonas = true;
  @Input() modoAdmin = false;
  @Output() tanqueGuardado = new EventEmitter<void>();

  private apiService = inject(ApiService);
  private map!: L.Map;
  private caneriaLayer!: L.LayerGroup;
  private zonaLayer!: L.LayerGroup;
  private tanqueLayer!: L.LayerGroup;

  mostrarModal = signal(false);
  mostrarClickInstruction = signal(false);
  editandoTanque = signal(false);
  
  pasoActual = signal<Paso>('tanque');
  
  tanqueForm = signal<any>({
    id: '',
    nombre: '',
    tipo: 'RESERVORIO_PUBLICO',
    capacidad_max: 10000,
    altura_max: 5,
    lat: 0,
    lng: 0,
  });
  
  sensoresForm = signal<any[]>([]);
  dispositivosForm = signal<any[]>([]);

  ngAfterViewInit() {
    this.initMap();
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map) {
      if (changes['tanques'] && !changes['tanques'].firstChange) {
        this.renderTanques();
      }
      if (changes['mostrarCanerias']) {
        if (this.mostrarCanerias) {
          this.loadCanerias();
        } else {
          this.caneriaLayer?.clearLayers();
        }
      }
      if (changes['mostrarZonas']) {
        if (this.mostrarZonas) {
          this.loadZonas();
        } else {
          this.zonaLayer?.clearLayers();
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-19.57, -65.75],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.caneriaLayer = L.layerGroup().addTo(this.map);
    this.zonaLayer = L.layerGroup().addTo(this.map);
    this.tanqueLayer = L.layerGroup().addTo(this.map);

    if (this.modoAdmin) {
      this.mostrarClickInstruction.set(true);
      this.map.on('click', (e: any) => {
        if (!this.mostrarModal()) {
          this.abrirModalNuevo(e.latlng.lat, e.latlng.lng);
        }
      });
    }
  }

  private loadData() {
    if (this.mostrarCanerias) this.loadCanerias();
    if (this.mostrarZonas) this.loadZonas();
    this.renderTanques();
  }

  private loadCanerias() {
    this.caneriaLayer.clearLayers();
    this.apiService.getCaneriasGeoJSON().subscribe({
      next: (data) => {
        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'LineString') {
            const latLngs = this.coordinatesToLatLng(feature.geometry.coordinates);
            const polyline = L.polyline(latLngs, {
              color: '#3b82f6',
              weight: 3,
              opacity: 0.7,
            });
            if (feature.properties?.estado) {
              polyline.bindPopup(`Estado: ${feature.properties.estado}`);
            }
            polyline.addTo(this.caneriaLayer);
          }
        });
      },
    });
  }

  private loadZonas() {
    this.zonaLayer.clearLayers();
    this.apiService.getZonasGeoJSON().subscribe({
      next: (data) => {
        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            const latLngs = this.coordinatesToLatLngLngs(feature.geometry.coordinates);
            const polygon = L.polygon(latLngs, {
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.15,
              weight: 2,
            });
            if (feature.properties?.nombre) {
              polygon.bindPopup(`Zona: ${feature.properties.nombre}`);
            }
            polygon.addTo(this.zonaLayer);
          }
        });
      },
    });
  }

  private renderTanques() {
    this.tanqueLayer.clearLayers();

    this.tanques.forEach((tanque) => {
      if (tanque.ubicacion?.coordinates) {
        const [lng, lat] = tanque.ubicacion.coordinates;
        
        const tieneAlerta = this.checkAlerta(tanque);
        const color = tieneAlerta ? '#ef4444' : '#22c55e';
        
        const marker = L.circleMarker([lat, lng], {
          radius: 12,
          fillColor: color,
          fillOpacity: 0.8,
          color: '#fff',
          weight: 2,
        });

        const info = this.getTanqueInfo(tanque);
        marker.bindPopup(info);

        if (this.modoAdmin) {
          marker.on('click', () => {
            this.abrirModalEditar(tanque);
          });
        }

        marker.addTo(this.tanqueLayer);
      }
    });
  }

  private checkAlerta(tanque: Tanque): boolean {
    const sensores = tanque.sensores as any[];
    if (!sensores) return false;
    
    const nivel = sensores.find(s => s?.tipo === 'NIVEL');
    if (!nivel?.mediciones?.length) return false;
    
    const valor = nivel.mediciones[0].valor;
    return valor < 20 || valor > 95;
  }

  private getTanqueInfo(tanque: Tanque): string {
    const sensores = tanque.sensores as any[];
    let nivel = '-';
    let ph = '-';
    
    if (sensores) {
      const n = sensores.find(s => s?.tipo === 'NIVEL');
      if (n?.mediciones?.length) nivel = `${n.mediciones[0].valor}%`;
      
      const p = sensores.find(s => s?.tipo === 'PH');
      if (p?.mediciones?.length) ph = `${p.mediciones[0].valor}`;
    }
    
    const tieneAlerta = this.checkAlerta(tanque);
    const badge = tieneAlerta ? '<br><span class="text-error font-bold">⚠️ ALERTA</span>' : '';
    
    return `
      <strong>${tanque.nombre}</strong><br>
      Tipo: ${tanque.tipo}<br>
      Capacidad: ${tanque.capacidad_max}L<br>
      Nivel: ${nivel}<br>
      pH: ${ph}${badge}
    `;
  }

  private coordinatesToLatLng(coords: number[][]): L.LatLngExpression[] {
    return coords.map((coord) => [coord[1], coord[0]] as L.LatLngExpression);
  }

  private coordinatesToLatLngLngs(coords: number[][][]): L.LatLngExpression[][] {
    return coords.map((ring) =>
      ring.map((coord) => [coord[1], coord[0]] as L.LatLngExpression),
    );
  }

  private abrirModalNuevo(lat: number, lng: number) {
    this.editandoTanque.set(false);
    this.pasoActual.set('tanque');
    this.tanqueForm.set({
      id: '',
      nombre: '',
      tipo: 'RESERVORIO_PUBLICO',
      capacidad_max: 10000,
      altura_max: 5,
      lat,
      lng,
    });
    this.dispositivosForm.set([]);
    this.sensoresForm.set([]);
    this.mostrarModal.set(true);
  }

  private abrirModalEditar(tanque: Tanque) {
    this.editandoTanque.set(true);
    this.pasoActual.set('resumen');
    const [lng, lat] = tanque.ubicacion?.coordinates || [0, 0];
    
    this.tanqueForm.set({
      id: tanque.id,
      nombre: tanque.nombre,
      tipo: tanque.tipo,
      capacidad_max: tanque.capacidad_max,
      altura_max: tanque.altura_max,
      lat,
      lng,
    });

    const sensores = tanque.sensores || [];
    this.sensoresForm.set(sensores.map((s: any) => ({
      id: s.id,
      tipo: s.tipo,
      unidad_medida: s.unidad_medida,
      dispositivoId: s.dispositivo?.id || '',
    })));

    this.apiService.getDispositivosByTanque(tanque.id).subscribe({
      next: (dispositivos) => {
        this.dispositivosForm.set(dispositivos.map((d: any) => ({
          id: d.id,
          nombre: d.nombre,
          ip_address: d.ip_address,
          puerto: d.puerto,
        })));
        this.mostrarModal.set(true);
      },
      error: () => {
        this.dispositivosForm.set([]);
        this.mostrarModal.set(true);
      },
    });
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  stepNumber(paso: Paso): number {
    const steps: Record<Paso, number> = { 'tanque': 1, 'esp32': 2, 'sensores': 3, 'resumen': 4 };
    return steps[paso];
  }

  stepIndex(): number {
    const current = this.pasoActual();
    if (current === 'tanque') return 1;
    if (current === 'esp32') return 2;
    if (current === 'sensores') return 3;
    return 4;
  }

  sigPaso() {
    if (this.editandoTanque()) {
      if (this.pasoActual() === 'resumen') {
        this.pasoActual.set('tanque');
      }
      return;
    }
    if (this.pasoActual() === 'tanque') {
      this.pasoActual.set('esp32');
    } else if (this.pasoActual() === 'esp32') {
      this.pasoActual.set('sensores');
    }
  }

  antPaso() {
    if (this.editandoTanque()) {
      if (this.pasoActual() === 'tanque') {
        this.pasoActual.set('resumen');
      } else if (this.pasoActual() === 'esp32') {
        this.pasoActual.set('tanque');
      } else if (this.pasoActual() === 'sensores') {
        this.pasoActual.set('esp32');
      }
      return;
    }
    if (this.pasoActual() === 'esp32') {
      this.pasoActual.set('tanque');
    } else if (this.pasoActual() === 'sensores') {
      this.pasoActual.set('esp32');
    }
  }

  agregarDispositivo() {
    this.dispositivosForm.update(d => [...d, { nombre: '', ip_address: '', puerto: 80 }]);
  }

  eliminarDispositivo(index: number) {
    const dispId = this.dispositivosForm()[index].id;
    this.dispositivosForm.update(d => d.filter((_: any, i: number) => i !== index));
    if (dispId) {
      this.sensoresForm.update(sensors => 
        sensors.map((s: any) => {
          if (s.dispositivoId === dispId) {
            return { ...s, dispositivoId: '' };
          }
          return s;
        })
      );
    }
  }

  agregarSensor() {
    const dispositivos = this.dispositivosForm();
    if (dispositivos.length === 0) return;
    
    const disp = dispositivos[0];
    const existingCount = this.sensoresForm().length;
    const existingDispIds = dispositivos.map((d: any) => d.id || `new-${dispositivos.indexOf(d)}`);
    
    this.sensoresForm.update(s => [...s, { 
      tipo: 'NIVEL', 
      unidad_medida: '%', 
      dispositivoId: disp?.id || `new-0` 
    }]);
  }

  eliminarSensor(index: number) {
    this.sensoresForm.update(s => s.filter((_: any, i: number) => i !== index));
  }

  guardarTanque() {
    const form = this.tanqueForm();
    const data = {
      nombre: form.nombre,
      tipo: form.tipo,
      capacidad_max: form.capacidad_max,
      altura_max: form.altura_max,
      lat: form.lat,
      lng: form.lng,
    };

    if (this.editandoTanque()) {
      this.apiService.updateTanque(form.id, data).subscribe({
        next: () => {
          this.actualizarEntidades(form.id);
          this.cerrarModal();
          this.tanqueGuardado.emit();
        },
      });
    } else {
      this.apiService.createTanque(data).subscribe({
        next: (nuevoTanque) => {
          this.crearEntidades(nuevoTanque.id);
        },
      });
    }
  }

  private actualizarEntidades(tanqueId: string) {
    const dispositivos = this.dispositivosForm();
    const sensores = this.sensoresForm();
    
    dispositivos.forEach((d: any) => {
      if (d.id) {
        this.apiService.updateDispositivo(d.id, { nombre: d.nombre, ip_address: d.ip_address, puerto: d.puerto }).subscribe();
      } else {
        this.apiService.createDispositivo({
          nombre: d.nombre,
          ip_address: d.ip_address,
          puerto: d.puerto,
          tanqueId,
        }).subscribe();
      }
    });

    sensores.forEach((s: any) => {
      if (s.id) {
        this.apiService.updateSensor(s.id, { tipo: s.tipo, unidad_medida: s.unidad_medida }).subscribe();
      } else {
        this.apiService.createSensor({
          tipo: s.tipo,
          unidad_medida: s.unidad_medida,
          tanqueId,
        }).subscribe();
      }
    });
  }

  private crearEntidades(tanqueId: string) {
    const dispositivos = this.dispositivosForm();
    const sensores = this.sensoresForm();
    
    const dispositivosCreados: any[] = [];
    
    dispositivos.forEach((d: any) => {
      this.apiService.createDispositivo({
        nombre: d.nombre,
        ip_address: d.ip_address,
        puerto: d.puerto,
        tanqueId,
      }).subscribe({
        next: (nuevoDisp) => {
          dispositivosCreados.push(nuevoDisp);
          
          const sensoresParaEsteDisp = sensores.filter((s: any) => 
            s.dispositivoId === 'new-' + dispositivos.indexOf(d)
          );
          
          sensoresParaEsteDisp.forEach((s: any) => {
            this.apiService.createSensor({
              tipo: s.tipo,
              unidad_medida: s.unidad_medida,
              tanqueId,
              dispositivoId: nuevoDisp.id,
            }).subscribe();
          });
          
          if (dispositivosCreados.length === dispositivos.length) {
            const sensoresSinDisp = sensores.filter((s: any) => !s.dispositivoId.startsWith('new-'));
            sensoresSinDisp.forEach((s: any) => {
              this.apiService.createSensor({
                tipo: s.tipo,
                unidad_medida: s.unidad_medida,
                tanqueId,
              }).subscribe();
            });
            
            this.cerrarModal();
            this.tanqueGuardado.emit();
          }
        },
      });
    });
  }

  eliminarTanque() {
    const form = this.tanqueForm();
    if (form.id) {
      this.apiService.deleteTanque(form.id).subscribe({
        next: () => {
          this.cerrarModal();
          this.tanqueGuardado.emit();
        },
      });
    }
  }
}