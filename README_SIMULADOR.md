# Simulador ESP32

Script Python que simula un dispositivo ESP32 enviando mediciones al backend.

## Requisitos

```bash
pip install requests
```

## Configuración

1. **Crear un dispositivo ESP32 en el sistema:**
   - Inicia sesión como ADMIN en el frontend
   - Ve a la sección de dispositivos ESP32
   - Crea un nuevo dispositivo asociado a un reservorio/domiciliario

2. **Crear sensores asociados al dispositivo:**
   - Crea al menos un sensor (tipo NIVEL, PH, etc.) asociado al dispositivo

3. **Obtener la API Key:**
   - La API key se genera automáticamente al crear el dispositivo
   - Guárdala para configurar el simulador

4. **Configurar el script:**
   Edita `simulador_esp32.py` y actualiza las variables:

   ```python
   API_KEY = "tu_api_key_aqui"
   SENSOR_ID = "uuid_del_sensor"  # Opcional: se detecta automáticamente
   ```

## Uso

```bash
# Iniciar el backend
cd backend && npm run start:dev

# Iniciar el frontend (en otra terminal)
cd frontend && npm run dev

# Ejecutar el simulador
python simulador_esp32.py
```

## Flujo de datos

1. El simulador envía POST a `/medicion` con `{ sensorId, valor, apiKey }`
2. El backend valida que la API key corresponde al dispositivo
3. El backend verifica que el sensor pertenece al dispositivo
4. Se crea la medición y se emite vía Socket.IO
5. El frontend recibe `medicion:new` y actualiza los gráficos en tiempo real

## Ejemplo de salida

```
=== Simulador ESP32 ===
Backend URL: http://localhost:3000
API Key: ABC12345...
Sensor ID: 550e8400-e29b-41d4-a716-446655440000

Iniciando envío de mediciones (Ctrl+C para detener)...

[10:30:15] Medición enviada: valor=45.23
[10:30:18] Medición enviada: valor=47.89
[10:30:22] Medición enviada: valor=43.56
```