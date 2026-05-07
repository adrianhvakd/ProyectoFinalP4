import {
  Component,
  Input,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GeoJSONFeature,
  Tanque,
  Sensor,
  DispositivoESP32,
  ApiService,
} from '../../services/api.service';
import * as L from 'leaflet';

type Paso = 'usuario' | 'tanque' | 'area' | 'datos' | 'esp32' | 'sensores' | 'resumen';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.component.html',
})
export class MapaComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() tanques: Tanque[] = [];
  @Input() mostrarCanerias = true;
  @Input() mostrarZonas = true;
  @Input() modoAdmin = false;
  @Input() modoSoloLectura = false;
  @Input() filtrarPorIds: string[] = [];
  @Output() tanqueGuardado = new EventEmitter<void>();
  @Output() tanqueClickeado = new EventEmitter<Tanque>();

  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private map!: L.Map;
  private caneriaLayer!: L.LayerGroup;
  private zonaLayer!: L.LayerGroup;
  private tanqueLayer!: L.LayerGroup;
  private previewCircleLayer!: L.LayerGroup;

  mostrarModal = signal(false);
  mostrarClickInstruction = signal(false);
  editandoTanque = signal(false);
  modoAjusteArea = signal(false);
  radioMinimo = signal(100);
  radioTemporal = signal(1000);

  pasoActual = signal<Paso>('tanque');

  tanqueForm = signal<any>({
    id: '',
    nombre: '',
    tipo: 'RESERVORIO_PUBLICO',
    capacidad_max: 10000,
    altura_max: 5,
    lat: 0,
    lng: 0,
    radio_cobertura: 1000,
  });

  sensoresForm = signal<any[]>([]);
  dispositivosForm = signal<any[]>([]);
  dispositivosList: any[] = [];
  cargandoDispositivos = signal(false);

  modoUsuario = signal<'existente' | 'nuevo'>('existente');
  usuariosDisponibles = signal<any[]>([]);
  usuarioSeleccionadoId = '';
  nuevoUsuario = { nombre: '', email: '', password: '' };
  usuarioCreadoId = signal<string | null>(null);

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      this.loadData();
      this.loadUsuarios();
      this.cdr.detectChanges();
    }, 50);
  }

  private loadUsuarios() {
    this.apiService.getUsers().subscribe({
      next: (users) => this.usuariosDisponibles.set(users),
      error: () => this.usuariosDisponibles.set([]),
    });
  }

  mostrarPasoUsuario(): boolean {
    return this.tanqueForm().tipo === 'DOMICILIARIO' && !this.editandoTanque();
  }

  getPasoIndex(): number {
    const current = this.pasoActual();
    if (this.editandoTanque()) {
      if (current === 'datos') return 1;
      if (current === 'esp32') return 2;
      if (current === 'sensores') return 3;
      return 1;
    }
    if (current === 'usuario') return 1;
    if (current === 'tanque') return 2;
    if (current === 'area') return 3;
    if (current === 'esp32') return 4;
    if (current === 'sensores') return 5;
    return 5;
  }

  getTotalSteps(): number {
    if (this.editandoTanque()) return 3;
    if (this.mostrarPasoUsuario() && this.mostrarPasoArea()) return 5;
    if (this.mostrarPasoUsuario()) return 4;
    if (this.mostrarPasoArea()) return 4;
    return 3;
  }

  getStepsConfig(): any[] {
    const steps: any[] = [];
    let num = 1;
    const current = this.pasoActual();
    const idx = this.stepIndex();

    if (this.editandoTanque()) {
      steps.push({
        key: 'datos',
        num: num++,
        label: 'Datos',
        active: idx >= 1,
        current: current === 'datos',
      });
      steps.push({
        key: 'esp32',
        num: num++,
        label: 'ESP32',
        active: idx >= 2,
        current: current === 'esp32',
      });
      steps.push({
        key: 'sensores',
        num: num++,
        label: 'Sensores',
        active: idx >= 3,
        current: current === 'sensores',
      });
      return steps;
    }

    if (this.mostrarPasoUsuario()) {
      steps.push({
        key: 'usuario',
        num: num++,
        label: 'Usuario',
        active: this.stepNumber('usuario') <= idx,
        current: current === 'usuario',
      });
    }

    steps.push({
      key: 'tanque',
      num: num++,
      label: 'Tanque',
      active: this.stepNumber('tanque') <= idx,
      current: current === 'tanque',
    });

    if (this.mostrarPasoArea()) {
      steps.push({
        key: 'area',
        num: num++,
        label: 'Área',
        active: this.stepNumber('area') <= idx,
        current: current === 'area',
      });
    }

    steps.push({
      key: 'esp32',
      num: num++,
      label: 'ESP32',
      active: this.stepNumber('esp32') <= idx,
      current: current === 'esp32',
    });
    steps.push({
      key: 'sensores',
      num: num++,
      label: 'Sensores',
      active: this.stepNumber('sensores') <= idx,
      current: current === 'sensores',
    });

    return steps;
  }

  esValidoPasoUsuario(): boolean {
    if (this.modoUsuario() === 'existente') {
      return !!this.usuarioSeleccionadoId;
    } else {
      return !!(this.nuevoUsuario.nombre && this.nuevoUsuario.email && this.nuevoUsuario.password);
    }
  }

  onTipoChange() {
    if (this.tanqueForm().tipo === 'RESERVORIO_PUBLICO') {
      this.actualizarCirculoPreview();
    } else {
      this.limpiarPreviewCirculo();
    }
  }

  actualizarCirculoPreview() {
    this.previewCircleLayer.clearLayers();
    const form = this.tanqueForm();
    const radio = this.modoAjusteArea() ? this.radioTemporal() : form.radio_cobertura || 1000;
    if (form.tipo === 'RESERVORIO_PUBLICO' && form.lat && form.lng && radio) {
      const circle = L.circle([form.lat, form.lng], {
        radius: radio,
        color: '#eab308',
        fillColor: '#eab308',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '5, 10',
      });
      circle.addTo(this.previewCircleLayer);
    }
  }

  private limpiarPreviewCirculo() {
    this.previewCircleLayer.clearLayers();
  }

  entrarModoAjusteArea() {
    this.modoAjusteArea.set(true);
    this.mostrarModal.set(false);
    this.radioTemporal.set(this.tanqueForm().radio_cobertura || 1000);

    if (this.tanqueForm().id) {
      this.apiService.getRadioMinimo(this.tanqueForm().id).subscribe({
        next: (min) => this.radioMinimo.set(min),
        error: () => this.radioMinimo.set(100),
      });
    } else {
      this.radioMinimo.set(100);
    }

    setTimeout(() => this.actualizarCirculoPreview(), 100);
  }

  onSliderRadioChange(value: number) {
    const min = this.radioMinimo();
    if (value < min) {
      this.radioTemporal.set(min);
    } else {
      this.radioTemporal.set(value);
    }
    this.actualizarCirculoPreview();
  }

  confirmarArea() {
    const nuevoRadio = this.radioTemporal();
    this.tanqueForm.update((f) => ({ ...f, radio_cobertura: nuevoRadio }));
    this.modoAjusteArea.set(false);
    this.limpiarPreviewCirculo();

    if (this.editandoTanque()) {
      const form = this.tanqueForm();
      this.apiService
        .updateTanque(form.id, {
          nombre: form.nombre,
          capacidad_max: form.capacidad_max,
          altura_max: form.altura_max,
          lat: form.lat,
          lng: form.lng,
          radio_cobertura: nuevoRadio,
        })
        .subscribe({
          next: () => {
            this.loadZonas();
            this.loadCanerias();
            this.mostrarModal.set(true);
            this.pasoActual.set('datos');
          },
        });
    } else {
      this.mostrarModal.set(true);
      this.pasoActual.set('esp32');
      this.loadZonas();
      this.loadCanerias();
    }
  }

  cancelarAjusteArea() {
    this.modoAjusteArea.set(false);
    this.limpiarPreviewCirculo();
    this.mostrarModal.set(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.map) {
      setTimeout(() => {
        if (!this.map) {
          this.initMap();
          this.loadData();
          this.loadUsuarios();
          this.cdr.detectChanges();
        }
      }, 100);
      return;
    }

    if (this.map) {
      this.map.invalidateSize();
      this.cdr.detectChanges();
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
      if (changes['filtrarPorIds'] && this.mostrarZonas) {
        this.loadZonas();
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    if (this.map) {
      return;
    }

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
    this.previewCircleLayer = L.layerGroup().addTo(this.map);

    if (this.modoAdmin) {
      this.mostrarClickInstruction.set(true);
      this.map.on('click', (e: any) => {
        if (!this.mostrarModal()) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          const clickedOnTank = this.tanques.some((tanque) => {
            if (!tanque.ubicacion?.coordinates) return false;
            const [tLng, tLat] = tanque.ubicacion.coordinates;
            const distance = this.map.distance([lat, lng], [tLat, tLng]);
            return distance < 50;
          });

          if (clickedOnTank) {
            return;
          }

          const dentroZona = this.estaDentroDeZona(lat, lng);

          if (dentroZona) {
            const popupContent = `
              <div class="text-center p-2">
                <p class="font-bold mb-2">Estás dentro de un área de reservorio</p>
                <p class="text-sm mb-3">¿Qué tipo de tanque quieres crear?</p>
                <div class="flex gap-2 justify-center">
                  <button id="btn-reservorio" class="btn btn-sm btn-primary">Reservorio</button>
                  <button id="btn-domiciliario" class="btn btn-sm btn-secondary">Domiciliario</button>
                </div>
              </div>
            `;

            this.map.openPopup(popupContent, e.latlng, { className: 'custom-popup' });

            setTimeout(() => {
              const btnReservorio = document.getElementById('btn-reservorio');
              const btnDomiciliario = document.getElementById('btn-domiciliario');

              if (btnReservorio) {
                btnReservorio.onclick = () => {
                  this.map.closePopup();
                  this.abrirModalNuevo(lat, lng, 'RESERVORIO_PUBLICO');
                };
              }

              if (btnDomiciliario) {
                btnDomiciliario.onclick = () => {
                  this.map.closePopup();
                  this.abrirModalNuevo(lat, lng, 'DOMICILIARIO');
                };
              }
            }, 100);
          } else {
            const popupContent = `
              <div class="text-center p-2">
                <p class="font-bold mb-2">Estás fuera de un área de reservorio</p>
                <p class="text-sm mb-3">Solo puedes crear un reservorio público aquí</p>
                <button id="btn-reservorio-outside" class="btn btn-sm btn-primary">Crear Reservorio</button>
              </div>
            `;

            this.map.openPopup(popupContent, e.latlng, { className: 'custom-popup' });

            setTimeout(() => {
              const btnReservorio = document.getElementById('btn-reservorio-outside');
              if (btnReservorio) {
                btnReservorio.onclick = () => {
                  this.map.closePopup();
                  this.abrirModalNuevo(lat, lng, 'RESERVORIO_PUBLICO');
                };
              }
            }, 100);
          }
        }
      });
    }
  }

  private estaDentroDeZona(lat: number, lng: number): boolean {
    const layer = this.zonaLayer;
    let dentro = false;

    layer.eachLayer((polygon: any) => {
      if (polygon.getLatLngs) {
        const latLngs = polygon.getLatLngs();
        const ring = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
        if (this.pointInPolygon([lat, lng], ring)) {
          dentro = true;
        }
      }
    });

    return dentro;
  }

  private pointInPolygon(point: [number, number], polygon: any): boolean {
    if (!polygon || polygon.length < 3) return false;

    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat,
        yi = polygon[i].lng;
      const xj = polygon[j].lat,
        yj = polygon[j].lng;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
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
        const idsFiltrados = this.filtrarPorIds;
        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'LineString') {
            const props = feature.properties || {};
            const reservorioOrigenId = props.reservorio_origen_id;
            const reservorioDestinoId = props.reservorio_destino_id;
            const domiciliarioId = props.domiciliario_destino_id;

            let mostrar = idsFiltrados.length === 0;

            if (!mostrar) {
              mostrar =
                idsFiltrados.includes(reservorioOrigenId) ||
                idsFiltrados.includes(reservorioDestinoId);
            }

            if (!mostrar && idsFiltrados.length > 0 && domiciliarioId) {
              const tanque = this.tanques.find((t) => t.id === domiciliarioId);
              mostrar = !!tanque;
            }

            if (!mostrar) return;

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
    if (!this.mostrarZonas) return;

    this.apiService.getZonasGeoJSON().subscribe({
      next: (data) => {
        const idsFiltrados = this.filtrarPorIds;
        console.log('loadZonas - filtrarPorIds:', idsFiltrados);

        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            const props = feature.properties || {};
            const reservorioId = props.reservorio_id;

            let mostrar = idsFiltrados.length === 0;
            if (!mostrar && reservorioId) {
              mostrar = idsFiltrados.includes(reservorioId);
            }

            if (!mostrar) return;

            const latLngs = this.coordinatesToLatLngLngs(feature.geometry.coordinates);
            const polygon = L.polygon(latLngs, {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
              bubblingMouseEvents: false,
              interactive: false,
            });
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

        const esReservorio = tanque.tipo === 'RESERVORIO_PUBLICO';
        const baseColor = tieneAlerta ? '#ef4444' : esReservorio ? '#3b82f6' : '#22c55e';

        const radius = esReservorio ? 20 : 12;

        const marker = L.circleMarker([lat, lng], {
          radius,
          fillColor: baseColor,
          fillOpacity: 0.8,
          color: '#fff',
          weight: 3,
          interactive: true,
        });

        const info = this.getTanqueInfo(tanque);
        marker.bindPopup(info, {
          maxWidth: 200,
          closeButton: true,
        });

        marker.on('click', (e: any) => {
          e.originalEvent.stopPropagation();
          this.tanqueClickeado.emit(tanque);
        });

        marker.on('popupopen', () => {
          if (this.modoAdmin) {
            const btn = document.getElementById('edit-tanque-' + tanque.id);
            if (btn) {
              btn.onclick = () => this.abrirModalEditar(tanque);
            }
          }
        });

        marker.addTo(this.tanqueLayer);
      }
    });

    if (this.map) {
      this.map.removeLayer(this.tanqueLayer);
      this.tanqueLayer.addTo(this.map);
    }
  }

  private checkAlerta(tanque: Tanque): boolean {
    const sensores = tanque.sensores as any[];
    if (!sensores) return false;

    const nivel = sensores.find((s) => s?.tipo === 'NIVEL');
    if (!nivel?.mediciones?.length) return false;

    const valor = nivel.mediciones[0].valor;
    return valor < 20 || valor > 95;
  }

  private getTanqueInfo(tanque: Tanque): string {
    const sensores = tanque.sensores as any[];
    let nivel = '-';
    let ph = '-';

    if (sensores) {
      const n = sensores.find((s) => s?.tipo === 'NIVEL');
      if (n?.mediciones?.length) nivel = `${n.mediciones[0].valor}%`;

      const p = sensores.find((s) => s?.tipo === 'PH');
      if (p?.mediciones?.length) ph = `${p.mediciones[0].valor}`;
    }

    const tieneAlerta = this.checkAlerta(tanque);
    const badge = tieneAlerta ? '<br><span class="text-error font-bold">⚠️ ALERTA</span>' : '';

    const esReservorio = tanque.tipo === 'RESERVORIO_PUBLICO';
    const typeLabel = esReservorio ? 'Reservorio Público' : 'Domiciliario';
    const editBtn =
      this.modoAdmin && !this.modoSoloLectura
        ? `<br><button id="edit-tanque-${tanque.id}" class="btn btn-sm btn-primary mt-2" style="margin-top:8px">Editar</button>`
        : '';

    return `
      <strong>${tanque.nombre}</strong><br>
      Tipo: ${typeLabel}<br>
      Capacidad: ${tanque.capacidad_max}L<br>
      Nivel: ${nivel}<br>
      pH: ${ph}${badge}${editBtn}
    `;
  }

  private coordinatesToLatLng(coords: number[][]): L.LatLngExpression[] {
    return coords.map((coord) => [coord[1], coord[0]] as L.LatLngExpression);
  }

  private coordinatesToLatLngLngs(coords: number[][][]): L.LatLngExpression[][] {
    return coords.map((ring) => ring.map((coord) => [coord[1], coord[0]] as L.LatLngExpression));
  }

  private abrirModalNuevo(lat: number, lng: number, tipo?: 'RESERVORIO_PUBLICO' | 'DOMICILIARIO') {
    this.editandoTanque.set(false);
    this.pasoActual.set(tipo === 'DOMICILIARIO' ? 'usuario' : 'tanque');
    this.tanqueForm.set({
      id: '',
      nombre: '',
      tipo: tipo || 'RESERVORIO_PUBLICO',
      capacidad_max: 10000,
      altura_max: 5,
      lat,
      lng,
      radio_cobertura: 1000,
    });
    this.dispositivosForm.set([]);
    this.sensoresForm.set([]);
    this.dispositivosList = [];
    this.usuarioSeleccionadoId = '';
    this.nuevoUsuario = { nombre: '', email: '', password: '' };
    this.usuarioCreadoId.set(null);
    this.modoUsuario.set('existente');
    this.mostrarModal.set(true);

    if (tipo === 'RESERVORIO_PUBLICO') {
      setTimeout(() => this.actualizarCirculoPreview(), 100);
    }
  }

  private abrirModalEditar(tanque: Tanque) {
    this.editandoTanque.set(true);
    this.pasoActual.set('datos');
    const [lng, lat] = tanque.ubicacion?.coordinates || [0, 0];

    this.tanqueForm.set({
      id: tanque.id,
      nombre: tanque.nombre,
      tipo: tanque.tipo || (tanque.radio_cobertura ? 'RESERVORIO_PUBLICO' : 'DOMICILIARIO'),
      capacidad_max: tanque.capacidad_max,
      altura_max: tanque.altura_max,
      lat,
      lng,
      radio_cobertura: tanque.radio_cobertura,
    });

    this.cargandoDispositivos.set(true);
    this.mostrarModal.set(true);

    const dispositivoCall =
      tanque.tipo === 'RESERVORIO_PUBLICO'
        ? this.apiService.getDispositivosByReservorio(tanque.id)
        : this.apiService.getDispositivosByDomiciliario(tanque.id);

    dispositivoCall.subscribe({
      next: (dispositivos) => {
        const dispositivosMapeados = dispositivos.map((d: any) => ({
          id: d.id,
          nombre: d.nombre,
          api_key: d.api_key,
        }));

        this.dispositivosForm.set(dispositivosMapeados);
        this.dispositivosList = dispositivosMapeados;

        const sensores = tanque.sensores || [];
        this.sensoresForm.set(
          sensores.map((s: any) => {
            const dispId = s.dispositivo?.id || s.dispositivoId || '';
            return {
              id: s.id,
              tipo: s.tipo,
              unidad_medida: s.unidad_medida,
              dispositivoId: dispId,
            };
          }),
        );

        this.cargandoDispositivos.set(false);
        this.cdr.detectChanges();
        if (tanque.tipo === 'RESERVORIO_PUBLICO') {
          setTimeout(() => this.actualizarCirculoPreview(), 100);
        }
      },
      error: () => {
        this.dispositivosForm.set([]);
        this.sensoresForm.set([]);
        this.cargandoDispositivos.set(false);
        this.cdr.detectChanges();
        if (tanque.tipo === 'RESERVORIO_PUBLICO') {
          setTimeout(() => this.actualizarCirculoPreview(), 100);
        }
      },
    });
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.limpiarPreviewCirculo();
  }

  stepNumber(paso: Paso): number {
    const steps: Record<Paso, number> = {
      usuario: 0,
      tanque: 1,
      area: 2,
      datos: 1,
      esp32: 2,
      sensores: 3,
      resumen: 5,
    };
    return steps[paso];
  }

  stepIndex(): number {
    const current = this.pasoActual();
    const mostrarUsuario = this.mostrarPasoUsuario();
    const esReservorio = this.tanqueForm().tipo === 'RESERVORIO_PUBLICO';

    if (this.editandoTanque()) {
      if (current === 'datos') return 1;
      if (current === 'esp32') return 2;
      if (current === 'sensores') return 3;
      return 1;
    }

    if (current === 'usuario') return mostrarUsuario ? 1 : -1;
    if (current === 'tanque') return mostrarUsuario ? 2 : esReservorio ? 1 : 1;
    if (current === 'area') return mostrarUsuario ? 3 : esReservorio ? 2 : -1;
    if (current === 'esp32') return mostrarUsuario ? 4 : esReservorio ? 3 : 2;
    if (current === 'sensores') return mostrarUsuario ? 5 : esReservorio ? 4 : 3;
    return 5;
  }

  mostrarPasoArea(): boolean {
    return this.tanqueForm().tipo === 'RESERVORIO_PUBLICO' && !this.editandoTanque();
  }

  onSensorDeviceChange(value: any, index: number) {
    const currentSensores = this.sensoresForm();
    currentSensores[index].dispositivoId = value;
    this.sensoresForm.set([...currentSensores]);
  }

  sigPaso() {
    if (this.editandoTanque()) {
      if (this.pasoActual() === 'datos') {
        this.pasoActual.set('esp32');
      } else if (this.pasoActual() === 'esp32') {
        if (this.cargandoDispositivos()) {
          return;
        }
        this.pasoActual.set('sensores');
      }
      return;
    }
    if (this.pasoActual() === 'usuario') {
      this.procesarUsuario();
      this.pasoActual.set('tanque');
    } else if (this.pasoActual() === 'tanque') {
      if (this.mostrarPasoArea()) {
        this.pasoActual.set('area');
      } else {
        this.pasoActual.set('esp32');
      }
    } else if (this.pasoActual() === 'area') {
      this.pasoActual.set('esp32');
    } else if (this.pasoActual() === 'esp32') {
      this.pasoActual.set('sensores');
    }
  }

  antPaso() {
    if (this.editandoTanque()) {
      if (this.pasoActual() === 'esp32') {
        this.pasoActual.set('datos');
      } else if (this.pasoActual() === 'sensores') {
        this.pasoActual.set('esp32');
      }
      return;
    }
    if (this.pasoActual() === 'tanque') {
      if (this.mostrarPasoUsuario()) {
        this.pasoActual.set('usuario');
      }
    } else if (this.pasoActual() === 'area') {
      this.pasoActual.set('tanque');
    } else if (this.pasoActual() === 'esp32') {
      if (this.mostrarPasoArea()) {
        this.pasoActual.set('area');
      } else {
        this.pasoActual.set('tanque');
      }
    } else if (this.pasoActual() === 'sensores') {
      this.pasoActual.set('esp32');
    }
  }

  private procesarUsuario() {
    if (this.modoUsuario() === 'existente') {
      this.usuarioCreadoId.set(this.usuarioSeleccionadoId);
    } else {
      this.apiService
        .createUser({
          nombre: this.nuevoUsuario.nombre,
          email: this.nuevoUsuario.email,
          password: this.nuevoUsuario.password,
          role: 'USER',
        })
        .subscribe({
          next: (user) => {
            this.usuarioCreadoId.set(user.id);
            this.loadUsuarios();
          },
        });
    }
  }

  agregarDispositivo() {
    this.dispositivosForm.update((d) => [...d, { nombre: '' }]);
  }

  eliminarDispositivo(index: number) {
    const dispId = this.dispositivosForm()[index].id;
    this.dispositivosForm.update((d) => d.filter((_: any, i: number) => i !== index));
    if (dispId) {
      this.sensoresForm.update((sensors) =>
        sensors.map((s: any) => {
          if (s.dispositivoId === dispId) {
            return { ...s, dispositivoId: '' };
          }
          return s;
        }),
      );
    }
  }

  copiarApiKey(apiKey: string) {
    navigator.clipboard
      .writeText(apiKey)
      .then(() => {
        alert('API Key copiada al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar:', err);
      });
  }

  agregarSensor() {
    const dispositivos = this.dispositivosForm();
    if (dispositivos.length === 0) return;

    const disp = dispositivos[0];
    const existingCount = this.sensoresForm().length;
    const existingDispIds = dispositivos.map((d: any) => d.id || `new-${dispositivos.indexOf(d)}`);

    this.sensoresForm.update((s) => [
      ...s,
      {
        tipo: 'NIVEL',
        unidad_medida: '%',
        dispositivoId: disp?.id || `new-0`,
      },
    ]);
  }

  eliminarSensor(index: number) {
    this.sensoresForm.update((s) => s.filter((_: any, i: number) => i !== index));
  }

  guardarTanque() {
    const form = this.tanqueForm();
    const data: any = {
      nombre: form.nombre,
      tipo: form.tipo,
      capacidad_max: form.capacidad_max,
      altura_max: form.altura_max,
      lat: form.lat,
      lng: form.lng,
      radio_cobertura: form.radio_cobertura || 1000,
    };

    if (form.tipo === 'DOMICILIARIO') {
      if (this.usuarioCreadoId()) {
        data.userId = this.usuarioCreadoId();
      }
    }

    if (this.editandoTanque()) {
      this.apiService.updateTanque(form.id, data).subscribe({
        next: () => {
          this.actualizarEntidades(form.id);
          this.loadZonas();
          this.loadCanerias();
          this.cerrarModal();
          this.tanqueGuardado.emit();
        },
      });
    } else {
      this.apiService.createTanque(data).subscribe({
        next: (nuevoTanque) => {
          this.crearEntidades(nuevoTanque.id, form.tipo);
          setTimeout(() => {
            this.loadZonas();
            this.loadCanerias();
          }, 500);
        },
      });
    }
  }

  private actualizarEntidades(tanqueId: string) {
    const tipo = this.tanqueForm().tipo;
    const isReservorio = tipo === 'RESERVORIO_PUBLICO';
    const entidadIdField = isReservorio ? 'reservorioId' : 'domiciliarioId';
    const entidadId = tanqueId;

    const dispositivos = this.dispositivosForm();
    const sensores = this.sensoresForm();

    dispositivos.forEach((d: any) => {
      if (d.id) {
        this.apiService.updateDispositivo(d.id, { nombre: d.nombre }).subscribe();
      } else {
        const payload: any = {
          nombre: d.nombre,
          ip_address: d.ip_address,
          puerto: d.puerto,
        };
        payload[entidadIdField] = entidadId;
        this.apiService.createDispositivo(payload).subscribe();
      }
    });

    sensores.forEach((s: any) => {
      if (s.id) {
        this.apiService
          .updateSensor(s.id, { tipo: s.tipo, unidad_medida: s.unidad_medida })
          .subscribe();
      } else {
        const payload: any = {
          tipo: s.tipo,
          unidad_medida: s.unidad_medida,
        };
        payload[entidadIdField] = entidadId;
        if (s.dispositivoId && !s.dispositivoId.startsWith('new-')) {
          payload.dispositivoId = s.dispositivoId;
        }
        this.apiService.createSensor(payload).subscribe();
      }
    });
  }

  private crearEntidades(tanqueId: string, tipo: string) {
    const isReservorio = tipo === 'RESERVORIO_PUBLICO';
    const entidadIdField = isReservorio ? 'reservorioId' : 'domiciliarioId';
    const entidadId = tanqueId;

    const dispositivos = this.dispositivosForm();
    const sensores = this.sensoresForm();

    if (dispositivos.length === 0 && sensores.length === 0) {
      this.cerrarModal();
      this.tanqueGuardado.emit();
      return;
    }

    const dispositivosCreados: any[] = [];

    dispositivos.forEach((d: any) => {
      const payload: any = {
        nombre: d.nombre,
      };
      payload[entidadIdField] = entidadId;

      this.apiService.createDispositivo(payload).subscribe({
        next: (nuevoDisp) => {
          dispositivosCreados.push(nuevoDisp);

          const sensoresParaEsteDisp = sensores.filter(
            (s: any) => s.dispositivoId === 'new-' + dispositivos.indexOf(d),
          );

          sensoresParaEsteDisp.forEach((s: any) => {
            const sensorPayload: any = {
              tipo: s.tipo,
              unidad_medida: s.unidad_medida,
              dispositivoId: nuevoDisp.id,
            };
            sensorPayload[entidadIdField] = entidadId;
            this.apiService.createSensor(sensorPayload).subscribe();
          });

          if (dispositivosCreados.length === dispositivos.length) {
            const sensoresSinDisp = sensores.filter(
              (s: any) => !s.dispositivoId.startsWith('new-'),
            );
            sensoresSinDisp.forEach((s: any) => {
              const sensorPayload: any = {
                tipo: s.tipo,
                unidad_medida: s.unidad_medida,
              };
              sensorPayload[entidadIdField] = entidadId;
              if (s.dispositivoId && !s.dispositivoId.startsWith('new-')) {
                sensorPayload.dispositivoId = s.dispositivoId;
              }
              this.apiService.createSensor(sensorPayload).subscribe();
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
    let tipo: string;

    if (form.tipo === 'RESERVORIO_PUBLICO' || form.tipo === 'DOMICILIARIO') {
      tipo = form.tipo;
    } else if (form.radio_cobertura && form.radio_cobertura > 0) {
      tipo = 'RESERVORIO_PUBLICO';
    } else {
      tipo = 'DOMICILIARIO';
    }

    console.log('Eliminando tanque:', form.id, 'tipo:', tipo);
    if (form.id) {
      this.apiService.deleteTanque(form.id, tipo).subscribe({
        next: () => {
          console.log('Tanque eliminado exitosamente');
          this.cerrarModal();
          this.tanqueGuardado.emit();
        },
        error: (err) => {
          console.error('Error al eliminar tanque:', err);
        },
      });
    }
  }
}
