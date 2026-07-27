"""
=================================================================================
REAL-TIME SERIAL DATA COLLECTOR FOR ESP32 COW COLLAR
Project: Smart IoT Cow Collar (State Award / Research Edition)
=================================================================================

Connects to the ESP32 USB COM port to log live 50Hz MPU6050 accelerometer
and gyroscope readings directly into CSV format for training customized AI models.
"""

import sys
import time
import csv

try:
    import serial
except ImportError:
    print("PySerial not installed. Run: pip install pyserial")
    sys.exit(1)

# Configuration
PORT = 'COM9'  # Update to your ESP32 COM port
BAUD_RATE = 115200
OUTPUT_FILE = 'cattle_motion_dataset.csv'

print(f"Connecting to ESP32 on {PORT} at {BAUD_RATE} baud...")

try:
    ser = serial.Serial(PORT, BAUD_RATE, timeout=2)
    time.sleep(2)
    print("Connected! Press Ctrl+C to stop logging data.\n")

    with open(OUTPUT_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp', 'accel_x', 'accel_y', 'accel_z', 'gyro_z', 'label'])

        label = input("Enter current animal behavior label (0=Resting, 1=Ruminating, 2=Walking, 3=Estrus): ")

        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line.startswith("DATA:"):
                    # Format: DATA:accelX,accelY,accelZ,gyroZ
                    parts = line.replace("DATA:", "").split(",")
                    if len(parts) == 4:
                        writer.writerow([time.time(), parts[0], parts[1], parts[2], parts[3], label])
                        print(f"Logged sample: {parts} (Label: {label})")

except KeyboardInterrupt:
    print("\nData logging stopped. Saved to", OUTPUT_FILE)
except Exception as e:
    print("Serial Connection Error:", e)
