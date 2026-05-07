#!/usr/bin/env python3
"""
Simulador de ESP32 que envía mediciones al backend
"""

import requests
import random
import time
import sys
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:3000"
API_KEY = "Y4FPELRB11JZDSPDRVL8FTN8PKLFZA0A"  # <-- Reemplazar con la API key del dispositivo ESP32
SENSOR_ID = "fd77f34f-a12b-4745-809c-a5e0ee426826"  # <-- Reemplazar con el ID del sensor

def get_sensor_id_from_device():
    """Obtiene el ID de un sensor asociado al dispositivo"""
    try:
        response = requests.get(f"{BASE_URL}/dispositivo-esp32")
        devices = response.json()
        for device in devices:
            if device.get('api_key') == API_KEY:
                if device.get('sensores') and len(device['sensores']) > 0:
                    return device['sensores'][0]['id']
        return None
    except Exception as e:
        print(f"Error obteniendo sensor: {e}")
        return None

def send_medicion(sensor_id: str, valor: float):
    """Envía una medición al backend"""
    payload = {
        "sensorId": sensor_id,
        "valor": valor,
        "apiKey": API_KEY
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/medicion",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Medición enviada: valor={valor:.2f}")
            return data
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Error de conexión: {e}")
        return None

def main():
    global SENSOR_ID
    
    print("=== Simulador ESP32 ===")
    print(f"Backend URL: {BASE_URL}")
    
    # Si no se especifica sensor, intentar obtenerlo del dispositivo
    if not SENSOR_ID and API_KEY:
        SENSOR_ID = get_sensor_id_from_device()
        if SENSOR_ID:
            print(f"Sensor ID obtenido del dispositivo: {SENSOR_ID}")
    
    if not API_KEY:
        print("ERROR: Debes configurar la API_KEY en el script")
        print("  1. Registra un dispositivo ESP32 en el sistema")
        print("  2. Copia la api_key generada")
        print("  3. Pega la api_key en la variable API_KEY de este script")
        sys.exit(1)
    
    if not SENSOR_ID:
        print("ERROR: Debes configurar el SENSOR_ID en el script")
        print("  Opciones:")
        print("  1. Configura SENSOR_ID manualmente")
        print("  2. Deja SENSOR_ID vacío y configura API_KEY con un dispositivo que tenga sensores")
        sys.exit(1)
    
    print(f"API Key: {API_KEY[:8]}...")
    print(f"Sensor ID: {SENSOR_ID}")
    print("\nIniciando envío de mediciones (Ctrl+C para detener)...\n")
    
    # Simular diferentes tipos de sensores según el sensor_id
    sensor_tipo = None  # Se detecta automáticamente con el primer valor
    
    try:
        while True:
            # Generar valor según tipo de sensor
            # Si el sensor es NIVEL, generar valores entre 0-100
            # Si es PH, generar valores entre 0-14
            valor = round(random.uniform(0, 100), 2)
            
            send_medicion(SENSOR_ID, valor)
            
            # Esperar entre 2-5 segundos (simulando lectura periódica)
            time.sleep(random.uniform(2, 5))
            
    except KeyboardInterrupt:
        print("\n\nSimulación detenida.")

if __name__ == "__main__":
    main()