/*
 * =================================================================================
 *  ESP32 COW COLLAR FIRMWARE v2.0 — Rewritten & Battle-Tested
 *  Project: Smart IoT Cow Collar (State Award Edition)
 * =================================================================================
 *  FEATURES:
 *  1. Real-Time BLE Streaming: 150ms update rate (~7 Hz) when phone connected
 *  2. Dual Pulse Oximetry Engine: Real-time zero-crossing + Maxim hospital algorithm
 *  3. Contact Debounce: 10 consecutive readings before state change (no flickering)
 *  4. Table/Air Rejection: Distinguishes skin from open air and stationary surfaces
 *  5. TinyML Motion Classification: Resting, Ruminating, Walking, Estrus
 *  6. SPIFFS Flash Logger: 5,000-record ring buffer for 72-hour offline storage
 *  7. Async Temperature: Non-blocking DS18B20 reads (no 750ms CPU stalls)
 * =================================================================================
 */

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <esp_task_wdt.h>

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include "edge_ai_model.h"
#include "flash_logger.h"
#include "advanced_vitals.h"

// --- CONFIGURATION ---
#define WDT_TIMEOUT 30

// --- PIN ASSIGNMENTS ---
#define MPU_SDA 21
#define MPU_SCL 22
#define MAX_SDA 18
#define MAX_SCL 19
#define DS18B20_PIN 4

// --- BLE GATT UUIDs ---
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define VITALS_CHAR_UUID       "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define LOG_CHAR_UUID          "c282583f-9173-455b-801b-c1e05d04df16"

// --- SENSOR TUNING ---
// LED power and ADC range MUST be paired correctly:
//   0x3F (12.5mA) + 4096  → IR ~8,000 on skin (weak, marginal)
//   0x7F (25.0mA) + 16384 → IR ~55,000 on skin (strong, accurate SpO2)
//   0x7F (25.0mA) + 4096  → IR ~225,000 (86% ADC saturation = BAD SpO2!)
#define LED_POWER     0x7F    // 25mA — deep skin/fur penetration
#define ADC_RANGE     16384   // Wide dynamic range to prevent saturation

// Contact detection threshold:
//   Open air at 0x7F: IR ~1,000-1,300
//   Skin contact at 0x7F+16384: IR ~4,000-65,000+
//   Threshold 2500 cleanly separates them.
#define CONTACT_IR_THRESHOLD 2500
#define CONTACT_DEBOUNCE_COUNT 10  // ~1.5 seconds of consecutive no-contact before declaring detached

// --- HARDWARE INSTANCES ---
TwoWire I2C_MPU = TwoWire(0);
TwoWire I2C_MAX = TwoWire(1);

Adafruit_MPU6050 mpu;
MAX30105 particleSensor;

OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);

// --- BLE ---
BLEServer* pServer = NULL;
BLECharacteristic* pVitalsCharacteristic = NULL;
BLECharacteristic* pLogCharacteristic = NULL;

bool deviceConnected = false;
bool oldDeviceConnected = false;
RTC_DATA_ATTR uint32_t sampleCounter = 0;

// --- MOTION SAMPLING ---
#define WINDOW_SIZE 16
float accelXWindow[WINDOW_SIZE];
float accelYWindow[WINDOW_SIZE];
float accelZWindow[WINDOW_SIZE];
float gyroZWindow[WINDOW_SIZE];

// --- TEMPERATURE ---
float lastBodyTemp = 0.0;
unsigned long lastTempReadTime = 0;

// --- ADVANCED VITALS ENGINES ---
HRVEngine hrvEngine;
BreathingRateEngine breathingEngine;
PostureEngine postureEngine;
HealthScoreEngine healthScoreEngine;

// =================================================================================
// BLE CALLBACKS
// =================================================================================
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("\n>>> Phone Connected! Real-Time Streaming Active <<<");
      particleSensor.wakeUp();

      String logsJson = FlashLogger::exportLogsAsJson();
      if (pLogCharacteristic) {
        pLogCharacteristic->setValue(logsJson.c_str());
        pLogCharacteristic->notify();
        Serial.printf("--> Transmitted %u offline records to phone.\n", FlashLogger::getRecordCount());
      }
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println(">>> Phone Disconnected. Offline Mode Active <<<");
      BLEDevice::startAdvertising();
    }
};

// =================================================================================
// OPTICAL BIOSIGNAL ENGINE — Real-Time Beat & SpO2 Detection
// =================================================================================
//
// BUG FIXES vs v1.0:
//   1. All AC/P2P variables are int32_t (v1.0 used int16_t which overflows at IR>32,767)
//   2. SpO2 ratio-of-ratios uses 32-bit math throughout
//   3. DC estimators are NEVER reset on brief unattach (instant recovery)
//
static uint32_t latestRawIR = 0;
static uint32_t latestRawRed = 0;

// IIR DC estimator state (scaled by 16 for fixed-point precision)
// These are PRESERVED across attach/detach cycles for instant recovery.
static int32_t irDCEstimator = 0;
static int32_t redDCEstimator = 0;

// AC waveform tracking — int32_t prevents overflow with IR values up to 262,143
static int32_t prevAC = 0;
static int32_t cycleMinAC = 0;
static int32_t cycleMaxAC = 0;
static int32_t cycleMinRed = 0;
static int32_t cycleMaxRed = 0;
static int32_t lastP2P = 0;

// Beat timing
static unsigned long lastBeatTime = 0;
static unsigned long lastBeatDetectedTime = 0;

// Smoothed output values
static float liveBpmSmoothed = 0.0f;
static uint8_t liveSpo2Smoothed = 0;

// Maxim algorithm rolling buffer
#define MAXIM_BUF_SIZE 100
static uint32_t maximIRBuf[MAXIM_BUF_SIZE];
static uint32_t maximRedBuf[MAXIM_BUF_SIZE];
static int maximBufIdx = 0;

void processOpticalSample(uint32_t sampleIR, uint32_t sampleRed) {
  // Always update latest raw values (used by contact detection)
  latestRawIR = sampleIR;
  latestRawRed = sampleRed;

  // Always store in Maxim rolling buffer (even low-IR samples, so the buffer
  // reflects reality — the quality gate in the Maxim runner handles filtering)
  maximIRBuf[maximBufIdx] = sampleIR;
  maximRedBuf[maximBufIdx] = sampleRed;
  maximBufIdx = (maximBufIdx + 1) % MAXIM_BUF_SIZE;

  // Skip real-time beat detection for open-air noise
  if (sampleIR < CONTACT_IR_THRESHOLD) return;

  // Feed the breathing rate engine (extracts respiratory modulation from IR baseline)
  breathingEngine.addSample(sampleIR);

  // --- DC Baseline Estimator (IIR Low-Pass, alpha ≈ 1/16) ---
  if (irDCEstimator == 0) {
    irDCEstimator = (int32_t)sampleIR << 4;
    redDCEstimator = (int32_t)sampleRed << 4;
  } else {
    irDCEstimator += ((int32_t)sampleIR - (irDCEstimator >> 4));
    redDCEstimator += ((int32_t)sampleRed - (redDCEstimator >> 4));
  }

  int32_t dcIR = irDCEstimator >> 4;
  int32_t dcRed = redDCEstimator >> 4;

  // AC component = sample minus DC baseline (int32_t — no overflow!)
  int32_t acIR = (int32_t)sampleIR - dcIR;
  int32_t acRed = (int32_t)sampleRed - dcRed;

  // --- Track Extrema in Current Waveform Cycle ---
  if (acIR < cycleMinAC) cycleMinAC = acIR;
  if (acIR > cycleMaxAC) cycleMaxAC = acIR;
  if (acRed < cycleMinRed) cycleMinRed = acRed;
  if (acRed > cycleMaxRed) cycleMaxRed = acRed;

  // --- Positive Zero-Crossing Detection (Systolic Arterial Upstroke) ---
  if (prevAC < 0 && acIR >= 0) {
    int32_t p2pIR = cycleMaxAC - cycleMinAC;
    int32_t p2pRed = cycleMaxRed - cycleMinRed;
    lastP2P = p2pIR;

    // Pulse verification:
    //   Static surface: p2p < 15 (flat noise)
    //   Living pulse:   p2p 15 - 10,000 (typical on skin through fur)
    if (p2pIR >= 15 && p2pIR <= 30000) {
      unsigned long now = millis();
      unsigned long delta = now - lastBeatTime;

      // Physiological heart rate window: 40 BPM (1500ms) to 160 BPM (375ms)
      if (delta >= 375 && delta <= 1500) {
        float instantBpm = 60000.0f / (float)delta;

        // Exponential moving average
        if (liveBpmSmoothed < 30.0f) {
          liveBpmSmoothed = instantBpm;
        } else {
          liveBpmSmoothed = (liveBpmSmoothed * 0.65f) + (instantBpm * 0.35f);
        }
        lastBeatDetectedTime = now;

        // --- SpO2 via Ratio-of-Ratios (all 32-bit math) ---
        if (dcIR > 500 && dcRed > 500 && p2pIR > 10) {
          float ratioRed = (float)p2pRed / (float)dcRed;
          float ratioIR  = (float)p2pIR  / (float)dcIR;

          if (ratioIR > 0.0001f) {
            float R = ratioRed / ratioIR;
            int calcSp = (int)(110.0f - 25.0f * R);

            if (calcSp >= 80 && calcSp <= 100) {
              liveSpo2Smoothed = (uint8_t)calcSp;
            } else if (calcSp > 100) {
              liveSpo2Smoothed = 99;
            } else {
              liveSpo2Smoothed = 80;
            }
          }
        }

        // --- HRV: Record this beat-to-beat interval ---
        hrvEngine.addBeatInterval(delta);
      }
      lastBeatTime = now;
    }

    // Reset cycle extrema for next beat
    cycleMinAC = 0;
    cycleMaxAC = 0;
    cycleMinRed = 0;
    cycleMaxRed = 0;
  }

  prevAC = acIR;
}

// =================================================================================
// SETUP
// =================================================================================
void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println("\n=======================================================");
  Serial.println("   ESP32 COW COLLAR v2.0 — Rewritten & Battle-Tested   ");
  Serial.println("=======================================================\n");

  // 1. Hardware Watchdog Timer
#if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
  esp_task_wdt_config_t twdt_config = {
      .timeout_ms = WDT_TIMEOUT * 1000,
      .idle_core_mask = 0,
      .trigger_panic = true
  };
  esp_task_wdt_reconfigure(&twdt_config);
  esp_task_wdt_add(NULL);
#else
  esp_task_wdt_init(WDT_TIMEOUT, true);
  esp_task_wdt_add(NULL);
#endif
  Serial.println("[System] Watchdog Timer (30s) ACTIVE");

  // 2. SPIFFS Flash Logger
  FlashLogger::init();

  // 3. MPU6050 Motion Sensor (I2C Bus 0)
  I2C_MPU.begin(MPU_SDA, MPU_SCL, 400000);
  I2C_MPU.setTimeOut(100);
  if (mpu.begin(0x68, &I2C_MPU)) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("[Hardware] MPU6050 Motion Sensor: OK");
  }

  // 4. MAX30102 Biosensor (I2C Bus 1)
  I2C_MAX.begin(MAX_SDA, MAX_SCL, 400000);
  I2C_MAX.setTimeOut(100);
  if (particleSensor.begin(I2C_MAX, I2C_SPEED_FAST)) {
    // LED_POWER and ADC_RANGE are paired — see #defines at top of file.
    // Changing one without the other WILL break SpO2 accuracy.
    particleSensor.setup(LED_POWER, 4, 2, 100, 411, ADC_RANGE);
    particleSensor.setPulseAmplitudeRed(LED_POWER);
    particleSensor.setPulseAmplitudeIR(LED_POWER);
    Serial.printf("[Hardware] MAX30102: OK (LED=0x%02X, ADC=%d)\n", LED_POWER, ADC_RANGE);
  } else {
    Serial.println("[Hardware] MAX30102: FAILED! Check SDA=18, SCL=19 wiring.");
  }

  // 5. DS18B20 Temperature Probe (OneWire, non-blocking)
  tempSensor.begin();
  tempSensor.setWaitForConversion(false);  // CRITICAL: never block 750ms!
  tempSensor.requestTemperatures();
  delay(100);
  float initT = tempSensor.getTempCByIndex(0);
  if (initT > -50.0 && initT < 80.0 && initT != 85.0 && initT != -127.0) {
    lastBodyTemp = initT;
    Serial.printf("[Hardware] DS18B20: OK (%.2f°C)\n", lastBodyTemp);
  } else {
    lastBodyTemp = 28.0;
    Serial.println("[Hardware] DS18B20: OK (awaiting first read)");
  }
  tempSensor.requestTemperatures();

  // 6. BLE GATT Server
  BLEDevice::init("CowCollar_EdgeAI");
  BLEDevice::setMTU(517);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pVitalsCharacteristic = pService->createCharacteristic(
                      VITALS_CHAR_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_NOTIFY);
  pVitalsCharacteristic->addDescriptor(new BLE2902());

  pLogCharacteristic = pService->createCharacteristic(
                      LOG_CHAR_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_NOTIFY);
  pLogCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Advertising as 'CowCollar_EdgeAI'");
  Serial.println("\n>>> System Ready. Place sensor on skin. <<<\n");
}

// =================================================================================
// VITALS READING — Called every loop iteration
// =================================================================================
void performFastVitalsReading(float &outTemp, int32_t &outBpm, int32_t &outSpo2,
                               int &outMotion, int &outHealth, uint8_t &outConfidence,
                               bool &outSkinContact) {
  sampleCounter++;

  // --- 1. Temperature (async, non-blocking) ---
  if (millis() - lastTempReadTime >= 1000 || lastTempReadTime == 0) {
    float t = tempSensor.getTempCByIndex(0);
    if (t > -50.0f && t < 70.0f && t != 85.0f && t != -127.0f) {
      lastBodyTemp = t;
    }
    tempSensor.requestTemperatures();
    lastTempReadTime = millis();
  }

  // --- 2. Motion (MPU6050 + TinyML) ---
  static int mpuSlot = 0;
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  accelXWindow[mpuSlot] = a.acceleration.x;
  accelYWindow[mpuSlot] = a.acceleration.y;
  accelZWindow[mpuSlot] = a.acceleration.z;
  gyroZWindow[mpuSlot] = g.gyro.z;
  mpuSlot = (mpuSlot + 1) % WINDOW_SIZE;

  MotionFeatures features = EdgeAIClassifier::extractFeatures(
      accelXWindow, accelYWindow, accelZWindow, gyroZWindow, WINDOW_SIZE);
  InferenceResult aiResult = EdgeAIClassifier::predict(features);

  // Continuously track posture & lying time from gravity vector (runs 24/7)
  postureEngine.update(a.acceleration.x, a.acceleration.y, a.acceleration.z);

  // --- 3. Drain MAX30102 FIFO (ALWAYS — before checking attachment) ---
  // This MUST happen first so latestRawIR has real data for the contact check.
  particleSensor.check();
  while (particleSensor.available()) {
    uint32_t sIR = particleSensor.getFIFOIR();
    uint32_t sRed = particleSensor.getFIFORed();
    particleSensor.nextSample();
    processOpticalSample(sIR, sRed);
  }

  // --- 4. Contact Detection (with debounce) ---
  bool isLowIR = (latestRawIR < CONTACT_IR_THRESHOLD);
  bool isStationaryTable = (latestRawIR > 15000 && features.varAccel < 0.003 && lastP2P < 15);

  static int noContactCount = 0;
  if (isLowIR || isStationaryTable) {
    noContactCount++;
  } else {
    noContactCount = 0;
  }

  bool isAttached = (noContactCount < CONTACT_DEBOUNCE_COUNT);
  outSkinContact = isAttached;

  if (!isAttached) {
    // Zero displayed values. DC estimators are PRESERVED for instant recovery.
    liveBpmSmoothed = 0.0f;
    liveSpo2Smoothed = 0;
    lastBeatDetectedTime = 0;
    lastP2P = 0;

    outBpm = 0;
    outSpo2 = 0;
    outTemp = lastBodyTemp;
    outMotion = 0;
    outHealth = 0;
    outConfidence = 0;
    healthScoreEngine.score = 0;
    return;
  }

  // --- 5. Maxim Hospital Algorithm (runs every 1 second) ---
  static unsigned long lastMaximRun = 0;
  if (millis() - lastMaximRun >= 1000) {
    lastMaximRun = millis();

    // Unroll circular buffer into linear time-series
    uint32_t linearIR[MAXIM_BUF_SIZE];
    uint32_t linearRed[MAXIM_BUF_SIZE];
    uint64_t irSum = 0;
    for (int i = 0; i < MAXIM_BUF_SIZE; i++) {
      int idx = (maximBufIdx + i) % MAXIM_BUF_SIZE;
      linearIR[i] = maximIRBuf[idx];
      linearRed[i] = maximRedBuf[idx];
      irSum += linearIR[i];
    }
    uint32_t avgIR = (uint32_t)(irSum / MAXIM_BUF_SIZE);

    // Quality gate: only trust algorithm when buffer has real skin data.
    // Open air fills buffer with ~1200 values. Skin contact fills with ~5000+.
    if (avgIR >= 5000) {
      int32_t maxSpO2 = 0, maxBPM = 0;
      int8_t validSp = 0, validHr = 0;
      maxim_heart_rate_and_oxygen_saturation(
          linearIR, MAXIM_BUF_SIZE, linearRed,
          &maxSpO2, &validSp, &maxBPM, &validHr);

      if (validHr && maxBPM >= 40 && maxBPM <= 160) {
        if (liveBpmSmoothed < 30.0f) {
          liveBpmSmoothed = (float)maxBPM;
        } else {
          liveBpmSmoothed = liveBpmSmoothed * 0.70f + (float)maxBPM * 0.30f;
        }
        lastBeatDetectedTime = millis();
      }
      if (validSp && maxSpO2 >= 80 && maxSpO2 <= 100) {
        liveSpo2Smoothed = (uint8_t)maxSpO2;
      }
    }
  }

  // --- 6. Pulse Lock & Heart Rate Expiry ---
  if (millis() - lastBeatDetectedTime > 5000) {
    liveBpmSmoothed = 0.0f;
    liveSpo2Smoothed = 0;
  }

  // --- 7. Health Score (composite 0-100) ---
  static unsigned long lastScoreTime = 0;
  if (millis() - lastScoreTime >= 2000) {
    lastScoreTime = millis();
    healthScoreEngine.compute(lastBodyTemp, (int)round(liveBpmSmoothed),
        (int)liveSpo2Smoothed, hrvEngine.sdnn, breathingEngine.breathsPerMin,
        postureEngine.isLying, aiResult.predictedClass, isAttached);
  }

  // --- 9. Output ---
  outTemp = lastBodyTemp;
  outBpm = (int32_t)round(liveBpmSmoothed);
  outSpo2 = (int32_t)liveSpo2Smoothed;
  outMotion = aiResult.predictedClass;
  outConfidence = (uint8_t)(aiResult.confidence * 100.0);

  // --- 10. Veterinary Health Classifier ---
  int healthStatus = 0;
  if (lastBodyTemp > 39.5) {
    healthStatus = 1;  // Fever
  } else if (lastBodyTemp < 38.0 && lastBodyTemp > 32.0) {
    healthStatus = 2;  // Hypothermia
  } else if (aiResult.predictedClass == 3) {
    healthStatus = 3;  // Estrus Heat
  } else if (lastBodyTemp >= 38.0 && lastBodyTemp < 38.3 &&
             aiResult.predictedClass == 0 && features.varAccel > 2.0) {
    healthStatus = 4;  // Calving Labor
  } else if (breathingEngine.breathsPerMin > 40 && liveSpo2Smoothed < 95 && liveSpo2Smoothed > 0) {
    healthStatus = 5;  // Respiratory Distress
  } else if (hrvEngine.sdnn > 0 && hrvEngine.sdnn < 20 && features.varAccel > 2.0) {
    healthStatus = 6;  // Stress Alert
  }
  outHealth = healthStatus;
}

// =================================================================================
// OFFLINE FLASH LOGGING — 10-Sample Aggregation Engine
// =================================================================================
#define EVAL_WINDOW_SIZE 10
#define OFFLINE_EVENT_COOLDOWN_MS 60000
#define OFFLINE_PERIODIC_INTERVAL_MS 60000

float tempEvalBuf[EVAL_WINDOW_SIZE];
int bpmEvalBuf[EVAL_WINDOW_SIZE];
int spo2EvalBuf[EVAL_WINDOW_SIZE];
int motionEvalBuf[EVAL_WINDOW_SIZE];
int healthEvalBuf[EVAL_WINDOW_SIZE];
int evalIndex = 0;

unsigned long lastOfflineLogTime = 0;
unsigned long lastEventLogTime = 0;

// =================================================================================
// MAIN LOOP
// =================================================================================
void loop() {
  float bodyTemp;
  int32_t bpm, spo2Val;
  int motionClass, healthStatus;
  uint8_t confidence;
  bool skinContact;

  performFastVitalsReading(bodyTemp, bpm, spo2Val, motionClass, healthStatus, confidence, skinContact);
  uint8_t batteryPct = 94;

  // --- 1. Offline Flash Logging (when phone not connected) ---
  if (!deviceConnected && skinContact) {
    tempEvalBuf[evalIndex] = bodyTemp;
    bpmEvalBuf[evalIndex] = (int)bpm;
    spo2EvalBuf[evalIndex] = (int)spo2Val;
    motionEvalBuf[evalIndex] = motionClass;
    healthEvalBuf[evalIndex] = healthStatus;
    evalIndex++;

    if (evalIndex >= EVAL_WINDOW_SIZE) {
      evalIndex = 0;

      float tempSum = 0;
      int bpmSum = 0, spo2Sum = 0;
      int motionCounts[4] = {0, 0, 0, 0};
      int estrusCount = 0, feverCount = 0;

      for (int i = 0; i < EVAL_WINDOW_SIZE; i++) {
        tempSum += tempEvalBuf[i];
        bpmSum += bpmEvalBuf[i];
        spo2Sum += spo2EvalBuf[i];
        int m = motionEvalBuf[i];
        if (m >= 0 && m <= 3) motionCounts[m]++;
        if (m == 3) estrusCount++;
        if (healthEvalBuf[i] == 1 || tempEvalBuf[i] > 39.5) feverCount++;
      }

      float avgTemp = tempSum / EVAL_WINDOW_SIZE;
      uint8_t avgBpm = (uint8_t)(bpmSum / EVAL_WINDOW_SIZE);
      uint8_t avgSpo2 = (uint8_t)(spo2Sum / EVAL_WINDOW_SIZE);

      int dominantMotion = 0;
      int maxCount = motionCounts[0];
      for (int m = 1; m <= 3; m++) {
        if (motionCounts[m] > maxCount) {
          maxCount = motionCounts[m];
          dominantMotion = m;
        }
      }

      int consensusHealth = 0;
      if (feverCount >= 4) consensusHealth = 1;
      else if (estrusCount >= 3) consensusHealth = 3;

      bool isEvent = (dominantMotion == 3 || estrusCount >= 3 || feverCount >= 4);
      bool eventReady = (millis() - lastEventLogTime >= OFFLINE_EVENT_COOLDOWN_MS || lastEventLogTime == 0);
      bool periodicReady = (millis() - lastOfflineLogTime >= OFFLINE_PERIODIC_INTERVAL_MS || lastOfflineLogTime == 0);

      if (isEvent && eventReady) {
        FlashLogger::saveRecord(sampleCounter, avgTemp, avgBpm, avgSpo2,
            (uint8_t)dominantMotion, (uint8_t)consensusHealth, batteryPct, confidence);
        lastEventLogTime = millis();
        lastOfflineLogTime = millis();
      } else if (periodicReady) {
        FlashLogger::saveRecord(sampleCounter, avgTemp, avgBpm, avgSpo2,
            (uint8_t)dominantMotion, (uint8_t)consensusHealth, batteryPct, confidence);
        lastOfflineLogTime = millis();
      }
    }
  } else {
    evalIndex = 0;
  }

  // --- 2. BLE JSON Payload (14 fields including advanced vitals) ---
  char jsonBuffer[400];
  snprintf(jsonBuffer, sizeof(jsonBuffer),
    "{\"temp\":%.2f,\"bpm\":%d,\"spo2\":%d,\"motion\":%d,\"health\":%d,\"bat\":%d,\"conf\":%d,\"contact\":%s,"
    "\"hrv\":%d,\"rr\":%d,\"lying\":%s,\"lyingMin\":%d,\"score\":%d,\"trend\":%d}",
    bodyTemp, (int)bpm, (int)spo2Val, motionClass, healthStatus,
    batteryPct, confidence, skinContact ? "true" : "false",
    hrvEngine.sdnn, breathingEngine.breathsPerMin,
    postureEngine.isLying ? "true" : "false", postureEngine.lyingMinutesThisHour,
    healthScoreEngine.score, healthScoreEngine.trendAlert
  );

  // --- 3. Real-Time BLE Streaming ---
  if (deviceConnected) {
    pVitalsCharacteristic->setValue(jsonBuffer);
    pVitalsCharacteristic->notify();
    Serial.printf("[LIVE] %s | T:%.1f | BPM:%d | SpO2:%d%% | HRV:%d | RR:%d | Score:%d | IR:%u\n",
      skinContact ? "ON" : "OFF", bodyTemp, (int)bpm, (int)spo2Val,
      hrvEngine.sdnn, breathingEngine.breathsPerMin, healthScoreEngine.score,
      (unsigned int)latestRawIR);
    delay(150);
  } else {
    delay(500);
  }

  // --- 4. BLE Reconnection Safeguard ---
  static unsigned long lastAdvCheck = 0;
  if (!deviceConnected && (millis() - lastAdvCheck > 10000)) {
    BLEDevice::startAdvertising();
    lastAdvCheck = millis();
  }

  if (!deviceConnected && oldDeviceConnected) {
    delay(200);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
    delay(1000);
    String logsJson = FlashLogger::exportLogsAsJson(500);
    if (pLogCharacteristic) {
      pLogCharacteristic->setValue(logsJson.c_str());
      pLogCharacteristic->notify();
    }
  }

  // --- 5. Watchdog Feed ---
  esp_task_wdt_reset();
}
