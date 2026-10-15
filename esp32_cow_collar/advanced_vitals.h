/*
 * =================================================================================
 *  ADVANCED VETERINARY VITALS ENGINE
 *  HRV | Breathing Rate | Posture Detection | Health Score
 * =================================================================================
 *  All features use existing sensors — no new hardware required.
 *  Include this header in the main .ino and call the update functions each loop.
 * =================================================================================
 */

#ifndef ADVANCED_VITALS_H
#define ADVANCED_VITALS_H

#include <Arduino.h>
#include <math.h>

// =================================================================================
// 1. HRV ENGINE — Heart Rate Variability (SDNN + RMSSD)
// =================================================================================
// Stores beat-to-beat intervals and computes:
//   SDNN  = Standard deviation of NN intervals (overall HRV)
//   RMSSD = Root mean square of successive differences (parasympathetic)
//
// Clinical significance for cattle:
//   SDNN > 60ms = Healthy, relaxed
//   SDNN 30-60  = Mild stress
//   SDNN < 30   = High stress or illness (drops 24-48h before clinical signs)

#define HRV_MAX_INTERVALS 20  // Last 20 beat-to-beat intervals (~20 heartbeats)

class HRVEngine {
public:
  int32_t rrIntervals[HRV_MAX_INTERVALS];  // Beat-to-beat intervals in ms
  int rrCount = 0;
  int rrIndex = 0;
  int sdnn = 0;     // Standard deviation of NN intervals (ms)
  int rmssd = 0;    // Root mean square of successive differences (ms)

  // Call this when a heartbeat is detected. Pass the inter-beat interval in ms.
  void addBeatInterval(unsigned long intervalMs) {
    if (intervalMs < 300 || intervalMs > 2000) return;  // Reject physiologically impossible

    rrIntervals[rrIndex] = (int32_t)intervalMs;
    rrIndex = (rrIndex + 1) % HRV_MAX_INTERVALS;
    if (rrCount < HRV_MAX_INTERVALS) rrCount++;

    // Recompute HRV metrics when we have at least 5 intervals
    if (rrCount >= 5) {
      computeHRV();
    }
  }

  void reset() {
    rrCount = 0;
    rrIndex = 0;
    sdnn = 0;
    rmssd = 0;
  }

private:
  void computeHRV() {
    // 1. Compute mean RR interval
    float sum = 0;
    for (int i = 0; i < rrCount; i++) {
      sum += rrIntervals[i];
    }
    float meanRR = sum / rrCount;

    // 2. SDNN = standard deviation of all NN intervals
    float sumSqDiff = 0;
    for (int i = 0; i < rrCount; i++) {
      float diff = rrIntervals[i] - meanRR;
      sumSqDiff += diff * diff;
    }
    sdnn = (int)sqrtf(sumSqDiff / rrCount);

    // 3. RMSSD = root mean square of successive differences
    float sumSuccDiffSq = 0;
    int succCount = 0;
    for (int i = 1; i < rrCount; i++) {
      // Get the two successive intervals (handle circular buffer)
      int idxCurr = (rrIndex - rrCount + i + HRV_MAX_INTERVALS) % HRV_MAX_INTERVALS;
      int idxPrev = (rrIndex - rrCount + i - 1 + HRV_MAX_INTERVALS) % HRV_MAX_INTERVALS;
      float diff = (float)(rrIntervals[idxCurr] - rrIntervals[idxPrev]);
      sumSuccDiffSq += diff * diff;
      succCount++;
    }
    if (succCount > 0) {
      rmssd = (int)sqrtf(sumSuccDiffSq / succCount);
    }
  }
};

// =================================================================================
// 2. BREATHING RATE ENGINE — Respiratory Rate from PPG Waveform
// =================================================================================
// The IR DC baseline has a slow modulation caused by breathing (thoracic pressure
// changes modulate venous return → changes photodiode signal amplitude).
//
// Method: IIR bandpass filter (0.15-0.5 Hz = 9-30 breaths/min), then count
// zero-crossings over a 30-second window.
//
// Normal cattle: 15-30 breaths/min. Elevated = respiratory distress or fever.

class BreathingRateEngine {
public:
  int breathsPerMin = 0;

  // Call every time a new optical sample is processed.
  // Pass the raw IR value (acts as a proxy for DC baseline).
  void addSample(uint32_t rawIR) {
    if (rawIR < 2500) return;  // Skip air samples

    sampleCount++;

    // IIR low-pass at ~0.5 Hz (respiratory upper bound)
    // With 25 SPS FIFO rate: alpha = 2*pi*0.5/25 ≈ 0.126
    float input = (float)rawIR;
    lpFiltered = lpFiltered * 0.875f + input * 0.125f;

    // IIR high-pass at ~0.15 Hz (respiratory lower bound)
    // Removes the very slow DC drift
    float hpInput = lpFiltered;
    hpFiltered = 0.94f * hpFiltered + 0.94f * (hpInput - hpPrev);
    hpPrev = hpInput;

    float respSignal = hpFiltered;

    // Zero-crossing detection for breathing rate
    if (prevRespSignal < 0 && respSignal >= 0) {
      crossingCount++;
    }
    prevRespSignal = respSignal;

    // Every 30 seconds (~750 samples at 25 SPS), compute breathing rate
    if (sampleCount >= 750) {
      // Each full breathing cycle has 1 positive zero-crossing
      breathsPerMin = crossingCount * 2;  // Scale 30s window to 60s

      // Clamp to physiological range
      if (breathsPerMin < 5) breathsPerMin = 0;
      if (breathsPerMin > 60) breathsPerMin = 0;

      crossingCount = 0;
      sampleCount = 0;
    }
  }

  void reset() {
    breathsPerMin = 0;
    lpFiltered = 0;
    hpFiltered = 0;
    hpPrev = 0;
    prevRespSignal = 0;
    crossingCount = 0;
    sampleCount = 0;
  }

private:
  float lpFiltered = 0;
  float hpFiltered = 0;
  float hpPrev = 0;
  float prevRespSignal = 0;
  int crossingCount = 0;
  int sampleCount = 0;
};

// =================================================================================
// 3. POSTURE & LYING TIME ENGINE
// =================================================================================
// Uses the MPU6050 accelerometer gravity vector to determine if the cow is
// standing or lying down. When a cow lies down, the sensor orientation changes
// significantly — the gravity vector rotates.
//
// Method: Compute the angle between the current gravity vector and the
// "standing" reference (0, 0, 9.8). If angle > 45°, cow is lying.
//
// Also tracks cumulative lying time per hour.

class PostureEngine {
public:
  bool isLying = false;
  int lyingMinutesThisHour = 0;  // 0-60
  int lyingMinutesToday = 0;     // 0-1440 (24 hours)

  // Call every loop iteration with current accelerometer values
  void update(float ax, float ay, float az) {
    // Compute the magnitude of gravity in the Z axis (assuming collar vertical when standing)
    float totalMag = sqrtf(ax * ax + ay * ay + az * az);
    if (totalMag < 0.1f) return;  // Skip if no valid reading

    // The fraction of gravity in the Z axis indicates posture
    // Standing: |az| / totalMag ≈ 1.0 (gravity aligned with Z)
    // Lying:    |az| / totalMag < 0.7 (gravity rotated away from Z)
    float zFraction = fabsf(az) / totalMag;

    // Debounce: use a low-pass filter on the posture signal
    postureSmoothed = postureSmoothed * 0.95f + zFraction * 0.05f;

    bool newLying = (postureSmoothed < 0.65f);

    // Transition detection
    if (newLying != isLying) {
      isLying = newLying;
      if (isLying) {
        lyingStartMs = millis();
      }
    }

    // Update lying time every minute
    unsigned long now = millis();
    if (now - lastMinuteCheck >= 60000) {
      lastMinuteCheck = now;

      if (isLying) {
        lyingMinutesThisHour++;
        lyingMinutesToday++;
      }

      minuteCounter++;
      if (minuteCounter >= 60) {
        minuteCounter = 0;
        lyingMinutesThisHour = 0;  // Reset hourly counter
      }
    }
  }

  void reset() {
    isLying = false;
    lyingMinutesThisHour = 0;
    postureSmoothed = 1.0f;
  }

private:
  float postureSmoothed = 1.0f;  // 1.0 = standing
  unsigned long lyingStartMs = 0;
  unsigned long lastMinuteCheck = 0;
  int minuteCounter = 0;
};

// =================================================================================
// 4. COMPOSITE HEALTH SCORE ENGINE (0-100)
// =================================================================================
// Combines all vital signs into a single intuitive score:
//   100 = Perfect health
//   80+ = Good
//   60-79 = Fair (needs monitoring)
//   40-59 = Poor (likely sick)
//   <40  = Critical (immediate attention)
//
// Scoring formula (each metric contributes a weighted deduction):

class HealthScoreEngine {
public:
  int score = 100;
  int trendAlert = 0;  // 0=stable, 1=temp rising, 2=activity dropping, 3=HRV declining

  // Call periodically (every 1-5 seconds) with current vitals
  void compute(float temp, int bpm, int spo2, int hrv, int breathRate,
               bool isLying, int motionClass, bool skinContact) {
    if (!skinContact) {
      score = 0;
      return;
    }

    int s = 100;

    // Temperature deductions (normal cattle: 38.0 - 39.5°C)
    if (temp > 40.0f) s -= 30;           // High fever
    else if (temp > 39.5f) s -= 15;      // Mild fever
    else if (temp < 37.0f) s -= 25;      // Severe hypothermia
    else if (temp < 38.0f) s -= 10;      // Mild hypothermia

    // Heart rate deductions (normal cattle: 40-80 BPM)
    if (bpm == 0) s -= 5;                // No reading (marginal contact)
    else if (bpm > 100) s -= 20;         // Tachycardia
    else if (bpm > 80) s -= 5;           // Slightly elevated
    else if (bpm < 40) s -= 15;          // Bradycardia

    // SpO2 deductions (normal: 95-100%)
    if (spo2 == 0) s -= 5;               // No reading
    else if (spo2 < 90) s -= 25;         // Severe hypoxemia
    else if (spo2 < 95) s -= 10;         // Mild hypoxemia

    // HRV deductions (higher = healthier)
    if (hrv > 0) {
      if (hrv < 20) s -= 20;             // Very low HRV = high stress
      else if (hrv < 40) s -= 10;        // Moderate stress
    }

    // Breathing rate deductions (normal cattle: 15-30)
    if (breathRate > 0) {
      if (breathRate > 40) s -= 15;      // Respiratory distress
      else if (breathRate > 30) s -= 5;  // Slightly elevated
      else if (breathRate < 10) s -= 10; // Abnormally slow
    }

    // Clamp
    if (s < 0) s = 0;
    if (s > 100) s = 100;
    score = s;

    // --- Trend detection (compare with history) ---
    trendAlert = 0;
    addToHistory(temp, bpm, hrv);

    if (historyCount >= 5) {
      // Check if temperature is rising over last 5 readings
      float tempDelta = tempHistory[(histIdx - 1 + 10) % 10] - tempHistory[(histIdx - historyCount + 10) % 10];
      if (tempDelta > 0.5f) trendAlert = 1;  // Temperature rising

      // Check if HRV is declining
      if (hrvHistory[(histIdx - 1 + 10) % 10] > 0 && hrvHistory[(histIdx - historyCount + 10) % 10] > 0) {
        int hrvDelta = hrvHistory[(histIdx - 1 + 10) % 10] - hrvHistory[(histIdx - historyCount + 10) % 10];
        if (hrvDelta < -15) trendAlert = 3;  // HRV declining
      }
    }
  }

private:
  float tempHistory[10];
  int bpmHistory[10];
  int hrvHistory[10];
  int histIdx = 0;
  int historyCount = 0;

  void addToHistory(float temp, int bpm, int hrv) {
    tempHistory[histIdx] = temp;
    bpmHistory[histIdx] = bpm;
    hrvHistory[histIdx] = hrv;
    histIdx = (histIdx + 1) % 10;
    if (historyCount < 10) historyCount++;
  }
};

#endif // ADVANCED_VITALS_H
