/*
 * Simple MAX30102 Pulse & SpO2 Tester
 * Uses Maxim hospital algorithm directly — for hardware validation only.
 * LED power and ADC range match the main firmware (0x7F + 16384).
 */

#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"

#define MAX_SDA 18
#define MAX_SCL 19

TwoWire I2C_MAX = TwoWire(1);
MAX30105 particleSensor;

uint32_t irBuffer[100];
uint32_t redBuffer[100];

int32_t spo2 = 0;
int8_t validSPO2 = 0;
int32_t heartRate = 0;
int8_t validHeartRate = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n==============================================");
  Serial.println("    SIMPLE MAX30102 PULSE & SPO2 TESTER       ");
  Serial.println("==============================================\n");

  I2C_MAX.begin(MAX_SDA, MAX_SCL, 400000);
  if (!particleSensor.begin(I2C_MAX, I2C_SPEED_FAST)) {
    Serial.println("ERROR: MAX30102 not found! Check SDA=18, SCL=19 wiring.");
    while (1);
  }
  Serial.println("[Hardware] MAX30102 Sensor OK!");

  // Must match main firmware: 0x7F LED + 16384 ADC range
  particleSensor.setup(0x7F, 4, 2, 100, 411, 16384);
  particleSensor.setPulseAmplitudeRed(0x7F);
  particleSensor.setPulseAmplitudeIR(0x7F);

  Serial.println("\n>>> Place finger or skin over sensor now... <<<\n");
}

void loop() {
  // Collect 100 samples (~4 seconds at 25 SPS)
  for (byte i = 0; i < 100; i++) {
    while (!particleSensor.available()) {
      particleSensor.check();
    }
    redBuffer[i] = particleSensor.getFIFORed();
    irBuffer[i] = particleSensor.getFIFOIR();
    particleSensor.nextSample();
  }

  // Run Maxim hospital algorithm
  maxim_heart_rate_and_oxygen_saturation(
      irBuffer, 100, redBuffer,
      &spo2, &validSPO2, &heartRate, &validHeartRate);

  uint32_t latestIR = irBuffer[99];

  if (latestIR < 2500) {
    Serial.printf("[TEST] Contact: NO  | IR: %u | Sensor off skin\n", latestIR);
  } else {
    int displayBpm = (validHeartRate && heartRate >= 40 && heartRate <= 160) ? heartRate : 0;
    int displaySpo2 = (validSPO2 && spo2 >= 80 && spo2 <= 100) ? spo2 : 0;

    Serial.printf("[TEST] Contact: YES | IR: %u | BPM: %d | SpO2: %d%%\n",
      latestIR, displayBpm, displaySpo2);
  }
}
