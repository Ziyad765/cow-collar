# 🐄 CowCollar AI — Smart Livestock Health & Edge Intelligence System

> **State Award / ICU Monitor Edition**  
> An end-to-end IoT & Edge AI system for real-time dairy cattle vitals monitoring, estrus (heat) detection, 48-hour early fever alerts, and pre-partum calving prediction.

---

## 📌 Executive Summary

**CowCollar AI** pairs a custom **ESP32 Edge AI smart collar** with a cross-platform mobile app (Android APK & Universal Web PWA). It brings hospital-grade intensive care telemetry (ECG heart rate, SpO2 blood oxygen, body temperature, and 50Hz accelerometer activity classification) directly to dairy farmers and veterinarians.

```
┌────────────────────────────────┐         Bluetooth BLE         ┌───────────────────────────────┐
│     ESP32 Smart Cow Collar     │ ────────────────────────────> │ CowCollar AI Mobile / Web App │
│                                │  Live Stream: 150ms Telemetry │                               │
│ • MAX30102 Biosensor (BPM/SpO2)│  Offline Sync: 24h SPIFFS Log │ • Live Dynamic ECG Waveforms  │
│ • MPU6050 Accelerometer/Gyro   │                               │ • 4 Vital Gauges + Alerts     │
│ • DS18B20 Temp Probe           │                               │ • 24-Hour Offline Log Graph   │
│ • On-Device TinyML Classifier  │                               │ • WhatsApp Health Report      │
└────────────────────────────────┘                               └───────────────────────────────┘
```

---

## ✨ Key Features

- **⚡ High-Frequency Live Streaming (6–7 Hz)**  
  When paired with a smartphone, telemetry updates every **150ms** for a smooth, real-time hospital ICU monitor feel.

- **🤖 On-Device TinyML Posture Classification**  
  Uses an embedded 50Hz feature extractor and classifier on the ESP32 to categorize cattle behavior into **Resting (0)**, **Ruminating (1)**, **Walking (2)**, or **Restless (3)** without requiring cloud connectivity.

- **🚨 Early Clinical Health Diagnostics**  
  Classifies 4 primary health states:
  1. **Nominal / Healthy**: All vitals within physiological thresholds (38.5–39.5°C).
  2. **High Fever Alert**: Body temp > 39.5°C — flags infection 48 hours before visible clinical symptoms.
  3. **Estrus / Heat Window**: Detects estrus restlessness patterns to pinpoint the optimal 12-hour breeding window for artificial insemination (AI).
  4. **Calving Imminent**: Detects pre-partum temperature drop + labor restlessness spike 12–24 hours prior to delivery.

- **🔋 Intelligent Biosensor Power Saving**  
  Automatically shuts down MAX30102 biosensor LEDs (`particleSensor.shutDown()`) when idle or disconnected, drastically extending battery life.

- **✋ Skin Contact Verification**  
  Verifies IR reflection (`IR > 30,000`) before recording readings, preventing non-living objects (tables, books, straps) from generating false measurements.

- **💾 24-Hour Offline SPIFFS Flash Memory Logging**  
  When out of Bluetooth range (e.g. grazing in pastures), the collar records hourly vitals into SPIFFS flash memory. When the cow returns to the barn in the morning, the app auto-syncs the 24-hour log in bulk over BLE.

- **📱 Universal Cross-Platform Access**  
  - **Android Native App**: Pre-compiled `CowCollar_AI.apk` via Capacitor.
  - **Web PWA / Web Bluetooth**: Works natively in Chrome/Edge on PC, Mac, and Android, or via Bluefy browser on iPhone/iOS.

---

## 🛠️ Hardware Requirements

| Component | Purpose | Interface / Pin |
|---|---|---|
| **ESP32 WROOM-32** | Main Microcontroller + BLE + TinyML | Core MCU |
| **MAX30102 Sensor** | Heart Rate (BPM) & Blood Oxygen (SpO2) | I2C Bus 1 (`SDA: 18`, `SCL: 19`) |
| **MPU6050 Sensor** | 6-DOF Accelerometer & Gyroscope (50Hz) | I2C Bus 0 (`SDA: 21`, `SCL: 22`) |
| **DS18B20 Probe** | Waterproof Body Temperature Sensor | OneWire (`Pin 4`) |
| **3.7V LiPo Battery** | Collar Power Supply | TP4056 USB Charger |

---

## 💻 Tech Stack & Architecture

### **Firmware (`esp32_cow_collar.ino`)**
- **Language**: C++ / Arduino Framework
- **BLE Server**: Custom GATT Service (`SERVICE_UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b`)
- **Storage**: SPIFFS Flash File System (`flash_logger.h`)
- **ML Inference**: Micro-feature extraction & decision tree classifier (`edge_ai_model.h`)

### **Mobile & Web App (`src/`)**
- **Framework**: React 19 + Vite 8
- **Styling**: Clean Agricultural Light System (Tailwind + CSS Custom Properties)
- **Waveforms**: HTML5 Canvas 2D API rendering real-time BPM-synced ECG PQRST & SpO2 pleth waves
- **BLE Engine**: Universal `BleService` supporting both `@capacitor-community/bluetooth-le` and Web Bluetooth API

---

## 📁 Repository Structure

```
cow collar/
├── esp32_cow_collar.ino     # Main ESP32 Firmware (High-frequency BLE stream + LED Shutdown)
├── edge_ai_model.h          # On-device TinyML Classifier & Feature Extractor Header
├── flash_logger.h           # SPIFFS Offline Flash Logging Library
├── ml_pipeline/             # Python ML Training Pipeline & Scikit-Learn Exporter
│   └── train_tinyml_model.py
├── src/
│   ├── App.jsx              # Main Mobile Dashboard Component
│   ├── components/
│   │   ├── Header.jsx              # Brand header + cow selector + battery gauge
│   │   ├── DisconnectedState.jsx   # Hero screen when BLE is not paired
│   │   ├── AlertBanner.jsx         # Diagnostic alert cards (Fever/Estrus/Calving)
│   │   ├── IcuMonitorStrip.jsx     # Canvas ECG & SpO2 dynamic waveform monitor
│   │   ├── VitalsGrid.jsx          # 4 vital gauge cards (Temp, BPM, SpO2, Activity)
│   │   ├── TimelineSection.jsx     # 24-hour offline morning sync bar chart
│   │   ├── AnalyticsSection.jsx    # AI Insights & WhatsApp report export
│   │   ├── InteractiveControls.jsx # 1-tap pitch demo anomaly simulator
│   │   └── LogsSection.jsx         # System & live BLE telemetry log viewer
│   ├── services/
│   │   └── bleService.js    # Universal BLE client (Native Capacitor + Web Bluetooth)
│   └── index.css            # Design system CSS styles
├── android/                 # Capacitor Android native project folder
├── public/                  # PWA manifest & static assets
├── CowCollar_AI.apk         # Pre-built ready-to-install Android APK
└── package.json             # Dependencies & build scripts
```

---

## 🚀 Getting Started

### 1. Flash ESP32 Firmware
1. Open `esp32_cow_collar.ino` in **Arduino IDE** (or VS Code + PlatformIO).
2. Install dependencies via Arduino Library Manager:
   - `Adafruit MPU6050`
   - `SparkFun MAX30105`
   - `DallasTemperature` & `OneWire`
3. Connect ESP32 via USB and upload at `115200` baud.

### 2. Install Mobile App (Android APK)
Transfer `CowCollar_AI.apk` to your Android phone and tap **Install**.

### 3. Run Web App Locally
```bash
# Install dependencies
npm install

# Start local dev server with network broadcasting
npm run dev
```
Open **`http://localhost:5173`** (PC/Mac) or **`http://<YOUR-LOCAL-IP>:5173`** (Phone Wi-Fi).

---

## 🌐 Web Bluetooth Access Guide

| Platform | Supported Browser | Setup Instructions |
|---|---|---|
| **Android** | Google Chrome / Edge | Open web URL → Tap `📡 Connect` → Select `CowCollar_EdgeAI` |
| **Windows / Mac** | Google Chrome / Edge | Open Chrome → Turn on Bluetooth → Tap `📡 Connect` |
| **iPhone (iOS)** | **Bluefy Browser** *(App Store)* | Open URL inside Bluefy app → Tap `📡 Connect` |

---

## 📊 Live Logs & Telemetry Inspection

The app includes a built-in **System & Sensor Logs** viewer:
- Inspect raw JSON telemetry packets (`{"temp":38.8,"bpm":68,"spo2":98...}`) in real time.
- Filter by *Live Stream*, *BLE Events*, or *Flash Sync*.
- One-click copy or clear logs for diagnostic debugging.

---

## 📜 License & Citation

Licensed under the MIT License. Developed for IoT Dairy Operations & Precision Livestock Farming.
