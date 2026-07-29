/*
 * =================================================================================
 *  OFFLINE FLASH LOGGING ENGINE FOR ESP32 COW COLLAR
 *  Project: Smart IoT Cow Collar (State Award / Advanced Edition)
 * =================================================================================
 *  Features:
 *  - Non-Volatile Flash Ring-Buffer Storage (SPIFFS / EEPROM)
 *  - Stores 72 Hours (3 Full Days) of Offline Sensor & TinyML Readings
 *  - Compact 12-Byte Binary Record Layout
 *  - Morning Bulk BLE Log Dump Function for Instant Phone Auto-Sync
 * =================================================================================
 */

#ifndef FLASH_LOGGER_H
#define FLASH_LOGGER_H

#include <Arduino.h>
#include <SPIFFS.h>

#define MAX_LOG_RECORDS 5000 // High-Capacity Log Buffer (5,000 Records = 60 KB Flash Memory)
#define LOG_FILE_PATH "/cow_vitals_log.bin"

// Compact 12-Byte Binary Log Entry
struct __attribute__((__packed__)) LogRecord {
  uint32_t sampleId;     // Incremental sample index (0 to 5000)
  uint16_t temp_x100;    // Temp * 100 (e.g., 3885 = 38.85 °C)
  uint8_t  bpm;          // Heart Rate BPM
  uint8_t  spo2;         // SpO2 Percentage
  uint8_t  motionClass;  // 0=Resting, 1=Ruminating, 2=Walking, 3=Estrus
  uint8_t  healthStatus; // 0=Normal, 1=Fever, 2=Hypothermia, 3=Estrus, 4=Calving
  uint8_t  battery;      // Battery %
  uint8_t  confidence;   // AI Confidence %
};

class FlashLogger {
public:
  static void init() {
    if (!SPIFFS.begin(true)) {
      Serial.println("[FlashLogger] SPIFFS Mount Failed!");
    } else {
      Serial.printf("[FlashLogger] SPIFFS Mounted Successfully. Total Space: %u bytes, Used: %u bytes.\n", SPIFFS.totalBytes(), SPIFFS.usedBytes());
    }
  }

  // Trim oldest records if log file exceeds MAX_LOG_RECORDS
  static void trimOldestRecords() {
    if (!SPIFFS.exists(LOG_FILE_PATH)) return;
    File file = SPIFFS.open(LOG_FILE_PATH, FILE_READ);
    if (!file) return;

    size_t totalRecords = file.size() / sizeof(LogRecord);
    if (totalRecords <= MAX_LOG_RECORDS) {
      file.close();
      return;
    }

    size_t skipRecords = totalRecords - MAX_LOG_RECORDS + 1;
    file.seek(skipRecords * sizeof(LogRecord));

    File tempFile = SPIFFS.open("/cow_vitals_tmp.bin", FILE_WRITE);
    if (!tempFile) {
      file.close();
      return;
    }

    while (file.available() >= sizeof(LogRecord)) {
      LogRecord rec;
      file.read((uint8_t*)&rec, sizeof(LogRecord));
      tempFile.write((uint8_t*)&rec, sizeof(LogRecord));
    }

    file.close();
    tempFile.close();

    SPIFFS.remove(LOG_FILE_PATH);
    SPIFFS.rename("/cow_vitals_tmp.bin", LOG_FILE_PATH);
    Serial.printf("[FlashLogger] High-capacity ring buffer trimmed: kept latest %u records.\n", MAX_LOG_RECORDS);
  }

  // Append a new 12-byte reading record to offline flash memory (Persistent Rolling Ring Buffer)
  static void saveRecord(uint32_t sampleId, float temp, uint8_t bpm, uint8_t spo2, uint8_t motion, uint8_t health, uint8_t battery, uint8_t confidence) {
    LogRecord rec;
    rec.sampleId = sampleId;
    rec.temp_x100 = (uint16_t)(temp * 100);
    rec.bpm = bpm;
    rec.spo2 = spo2;
    rec.motionClass = motion;
    rec.healthStatus = health;
    rec.battery = battery;
    rec.confidence = confidence;

    // Enforce rolling ring buffer cap
    if (getRecordCount() >= MAX_LOG_RECORDS) {
      trimOldestRecords();
    }

    File file = SPIFFS.open(LOG_FILE_PATH, FILE_APPEND);
    if (!file) {
      Serial.println("[FlashLogger] Failed to open file for writing!");
      return;
    }

    file.write((uint8_t*)&rec, sizeof(LogRecord));
    file.close();
    Serial.printf("[FlashLogger] Saved persistent offline sample #%u (Temp: %.2f°C, Motion: %u)\n", sampleId, temp, motion);
  }

  // Get total number of stored offline records
  static uint16_t getRecordCount() {
    if (!SPIFFS.exists(LOG_FILE_PATH)) return 0;
    File file = SPIFFS.open(LOG_FILE_PATH, FILE_READ);
    if (!file) return 0;
    uint16_t count = file.size() / sizeof(LogRecord);
    file.close();
    return count;
  }

  // Export stored records into JSON string for multi-phone BLE sync (exports latest maxRecords)
  static String exportLogsAsJson(size_t maxRecordsToExport = 500) {
    if (!SPIFFS.exists(LOG_FILE_PATH)) return "[]";

    File file = SPIFFS.open(LOG_FILE_PATH, FILE_READ);
    if (!file) return "[]";

    size_t totalCount = file.size() / sizeof(LogRecord);
    if (totalCount == 0) {
      file.close();
      return "[]";
    }

    size_t exportCount = (totalCount > maxRecordsToExport) ? maxRecordsToExport : totalCount;
    size_t skipCount = totalCount - exportCount;
    if (skipCount > 0) {
      file.seek(skipCount * sizeof(LogRecord));
    }

    // Reserve string buffer memory to prevent ESP32 RAM fragmentation
    String json = "";
    json.reserve(exportCount * 80 + 10);
    json += "[";
    bool first = true;

    while (file.available() >= sizeof(LogRecord)) {
      LogRecord rec;
      file.read((uint8_t*)&rec, sizeof(LogRecord));

      if (!first) json += ",";
      first = false;

      float temp = rec.temp_x100 / 100.0f;
      json += "{\"id\":" + String(rec.sampleId) +
              ",\"temp\":" + String(temp, 2) +
              ",\"bpm\":" + String(rec.bpm) +
              ",\"spo2\":" + String(rec.spo2) +
              ",\"motion\":" + String(rec.motionClass) +
              ",\"health\":" + String(rec.healthStatus) +
              ",\"bat\":" + String(rec.battery) +
              ",\"conf\":" + String(rec.confidence) + "}";
    }

    file.close();
    json += "]";
    return json;
  }

  // Manual Factory Reset Clear Only (Never called automatically on phone sync)
  static void clearLogs() {
    if (SPIFFS.exists(LOG_FILE_PATH)) {
      SPIFFS.remove(LOG_FILE_PATH);
      Serial.println("[FlashLogger] Offline logs reset via manual action.");
    }
  }
};

#endif // FLASH_LOGGER_H
