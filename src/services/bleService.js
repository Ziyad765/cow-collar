// Universal Native & Web BLE Service for Smart Cow Collar (iOS & Android Web PWA Compatible)

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const VITALS_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const LOG_CHAR_UUID = 'c282583f-9173-455b-801b-c1e05d04df16';

class BleService {
  constructor() {
    this.device = null;
    this.deviceId = null;
    this.isConnected = false;
    this.isSimulator = false;
    this.listeners = [];
    this.timelineListeners = [];
    this.logListeners = [];
    this.packetLogs = [];
    this.simInterval = null;
    this.isCapacitor = false;
    this.realDeviceTimeline = [];
  }

  onData(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  onTimelineData(callback) {
    this.timelineListeners.push(callback);
    return () => {
      this.timelineListeners = this.timelineListeners.filter(l => l !== callback);
    };
  }

  onPacketLog(callback) {
    this.logListeners.push(callback);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== callback);
    };
  }

  addPacketLog(type, message, rawPayload = null) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0');
    const entry = {
      id: Date.now() + Math.random(),
      timestamp,
      type,
      message,
      rawPayload
    };
    this.packetLogs.unshift(entry);
    if (this.packetLogs.length > 100) this.packetLogs.pop();
    this.logListeners.forEach(cb => cb(this.packetLogs));
  }

  getPacketLogs() {
    return this.packetLogs;
  }

  clearLogs() {
    this.packetLogs = [];
    this.logListeners.forEach(cb => cb(this.packetLogs));
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => cb(data));
  }

  notifyTimelineListeners(data) {
    if (data && Array.isArray(data) && data.length > 0) {
      try {
        const cappedData = data.slice(-288); // Keep max 288 records (24h-48h window) for memory efficiency
        localStorage.setItem('cow_collar_timeline_data', JSON.stringify(cappedData));
      } catch (e) {}
    }
    this.timelineListeners.forEach(cb => cb(data));
  }

  processIncomingRealVitals(parsed) {
    if (!parsed || parsed.temp === undefined) return;

    const newRecord = {
      id: parsed.id || Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Number(parsed.temp) || 0,
      bpm: Number(parsed.bpm) || 0,
      spo2: Number(parsed.spo2) || 0,
      motion: Number(parsed.motion) ?? 0,
      health: Number(parsed.health) ?? 0,
      bat: Number(parsed.bat) || 100,
      conf: Number(parsed.conf) || 95
    };

    if (this.realDeviceTimeline.length === 0) {
      this.realDeviceTimeline.push(newRecord);
    } else {
      const lastRec = this.realDeviceTimeline[this.realDeviceTimeline.length - 1];
      if (Date.now() - (lastRec.timestampMs || 0) > 2500) {
        newRecord.timestampMs = Date.now();
        this.realDeviceTimeline.push(newRecord);
        if (this.realDeviceTimeline.length > 288) {
          this.realDeviceTimeline.shift();
        }
      } else {
        newRecord.timestampMs = lastRec.timestampMs || Date.now();
        this.realDeviceTimeline[this.realDeviceTimeline.length - 1] = newRecord;
      }
    }

    this.notifyTimelineListeners(this.realDeviceTimeline);
  }

  setRealFlashLogs(logsArray) {
    if (Array.isArray(logsArray) && logsArray.length > 0) {
      const formatted = logsArray.map(item => ({
        id: item.id || Math.random(),
        time: item.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Number(item.temp) || 0,
        bpm: Number(item.bpm) || 0,
        spo2: Number(item.spo2) || 0,
        motion: Number(item.motion) ?? 0,
        health: Number(item.health) ?? 0,
        bat: Number(item.bat) || 100,
        conf: Number(item.conf) || 95
      }));
      this.realDeviceTimeline = formatted;
      this.notifyTimelineListeners(this.realDeviceTimeline);
    }
  }

  generateDefault24hTimeline() {
    const simTimeline = [];
    const now = new Date();
    for (let h = 24; h >= 0; h--) {
      const logTime = new Date(now.getTime() - h * 3600 * 1000);
      const isNightRest = h >= 1 && h <= 5;
      const isEstrusWindow = h === 7 || h === 8;
      const isRuminationWindow = (h >= 9 && h <= 12) || (h >= 18 && h <= 21);
      
      simTimeline.push({
        id: 24 - h,
        time: logTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: isEstrusWindow ? 39.1 : +(38.5 + (Math.sin(h * 0.3) * 0.25)).toFixed(2),
        bpm: isNightRest ? 62 : 68 + (h % 5),
        spo2: 98,
        motion: isNightRest ? 0 : (isEstrusWindow ? 3 : (isRuminationWindow ? 1 : 2)),
        health: isEstrusWindow ? 3 : 0,
        bat: 94 - Math.floor(h / 3)
      });
    }
    return simTimeline;
  }

  getStoredTimelineData() {
    try {
      const stored = localStorage.getItem('cow_collar_timeline_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return this.generateDefault24hTimeline();
  }

  async connectRealDevice() {
    this.stopSimulator();
    this.realDeviceTimeline = []; // Reset real device timeline on new connection
    this.addPacketLog('info', 'Initiating BLE connection to CowCollar_EdgeAI...');

    // 1. Native Capacitor BLE (Safe Dynamic Import)
    try {
      const { BleClient } = await import('@capacitor-community/bluetooth-le');
      await BleClient.initialize();
      this.isCapacitor = true;

      const device = await BleClient.requestDevice({
        services: [SERVICE_UUID],
        name: 'CowCollar_EdgeAI'
      });

      this.deviceId = device.deviceId;
      this.addPacketLog('success', `BLE Device Found: ${device.name || this.deviceId}`);

      await BleClient.connect(this.deviceId, () => {
        this.isConnected = false;
        this.addPacketLog('warning', 'BLE Device Disconnected');
        this.notifyListeners({ status: 'disconnected' });
      });

      this.addPacketLog('success', 'GATT Connection Established');

      // Subscribe to Live Vitals
      await BleClient.startNotifications(
        this.deviceId,
        SERVICE_UUID,
        VITALS_CHAR_UUID,
        (value) => {
          const decoder = new TextDecoder('utf-8');
          const rawValue = decoder.decode(value);
          try {
            const parsed = JSON.parse(rawValue);
            this.addPacketLog('stream', `LIVE RX: ${parsed.temp}°C | ${parsed.bpm} BPM | ${parsed.spo2}% SpO2`, rawValue);
            this.notifyListeners({ status: 'live', data: parsed });
            this.processIncomingRealVitals(parsed);
          } catch (err) {
            this.addPacketLog('error', 'BLE Packet parse error', rawValue);
          }
        }
      );

      // Subscribe to 24h Offline Logs
      try {
        await BleClient.startNotifications(
          this.deviceId,
          SERVICE_UUID,
          LOG_CHAR_UUID,
          (value) => {
            const decoder = new TextDecoder('utf-8');
            const rawValue = decoder.decode(value);
            try {
              const logsArray = JSON.parse(rawValue);
              this.addPacketLog('sync', `24h Flash Log Sync: ${logsArray.length} records received`, rawValue);
              this.setRealFlashLogs(logsArray);
            } catch (err) {
              console.error('Timeline parse error:', rawValue);
            }
          }
        );

        // Direct GATT read for instant 1-Day log sync
        try {
          const logVal = await BleClient.read(this.deviceId, SERVICE_UUID, LOG_CHAR_UUID);
          const decoder = new TextDecoder('utf-8');
          const rawValue = decoder.decode(logVal.value || logVal);
          if (rawValue && rawValue.startsWith('[')) {
            const logsArray = JSON.parse(rawValue);
            if (Array.isArray(logsArray) && logsArray.length > 0) {
              this.addPacketLog('sync', `Direct Read Sync: ${logsArray.length} records received`, rawValue);
              this.setRealFlashLogs(logsArray);
            }
          }
        } catch (readErr) {}
      } catch (logErr) {}

      this.isConnected = true;
      this.isSimulator = false;
      return true;

    } catch (nativeErr) {
      console.warn('Native BLE unavailable, switching to Universal Web Bluetooth PWA mode...', nativeErr);
    }

    // 2. Universal Web Bluetooth Fallback
    if (navigator.bluetooth) {
      try {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [
            { name: 'CowCollar_EdgeAI' },
            { namePrefix: 'CowCollar' }
          ],
          optionalServices: [SERVICE_UUID]
        });

        this.addPacketLog('success', `Web BLE Device Found: ${this.device.name}`);

        this.device.addEventListener('gattserverdisconnected', () => {
          this.isConnected = false;
          this.addPacketLog('warning', 'Web BLE GATT Disconnected');
          this.notifyListeners({ status: 'disconnected' });
        });

        const server = await this.device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);

        const vitalsChar = await service.getCharacteristic(VITALS_CHAR_UUID);
        await vitalsChar.startNotifications();
        vitalsChar.addEventListener('characteristicvaluechanged', (event) => {
          const decoder = new TextDecoder('utf-8');
          const rawValue = decoder.decode(event.target.value);
          try {
            const parsed = JSON.parse(rawValue);
            this.addPacketLog('stream', `LIVE RX: ${parsed.temp}°C | ${parsed.bpm} BPM | ${parsed.spo2}% SpO2`, rawValue);
            this.notifyListeners({ status: 'live', data: parsed });
            this.processIncomingRealVitals(parsed);
          } catch (err) {
            this.addPacketLog('error', 'BLE Parse error', rawValue);
          }
        });

        // Web BLE 24-Hour Log Sync
        try {
          const logChar = await service.getCharacteristic(LOG_CHAR_UUID);
          await logChar.startNotifications();
          logChar.addEventListener('characteristicvaluechanged', (event) => {
            const decoder = new TextDecoder('utf-8');
            const rawValue = decoder.decode(event.target.value);
            try {
              const logsArray = JSON.parse(rawValue);
              this.addPacketLog('sync', `Web BLE 24h Log Sync: ${logsArray.length} records received`, rawValue);
              this.setRealFlashLogs(logsArray);
            } catch (err) {}
          });
        } catch (webLogErr) {}

        this.isConnected = true;
        this.isSimulator = false;
        return true;
      } catch (webErr) {
        this.addPacketLog('error', `Connection Failed: ${webErr.message}`);
        throw webErr;
      }
    }

    throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome/Edge on Android, or the Bluefy app on iPhone!');
  }

  startSimulator() {
    this.stopSimulator();
    this.isSimulator = true;
    this.isConnected = true;
    this.addPacketLog('info', 'Started High-Frequency Demo Simulator (350ms stream)');

    let simTemp = 38.8;
    let simBpm = 68;
    let simSpo2 = 98;
    let simMotion = 1; 
    let simHealth = 0; 
    let simBat = 94;
    let tickCount = 0;

    const simTimeline = [];
    const now = new Date();
    for (let h = 24; h >= 0; h--) {
      const logTime = new Date(now.getTime() - h * 3600 * 1000);
      const isNightRest = h >= 1 && h <= 5;
      const isEstrusWindow = h === 7 || h === 8;
      
      simTimeline.push({
        id: 24 - h,
        time: logTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: isEstrusWindow ? 39.1 : +(38.5 + Math.random() * 0.4).toFixed(2),
        bpm: isNightRest ? 62 : 68 + Math.floor(Math.random() * 6),
        spo2: 98,
        motion: isNightRest ? 0 : (isEstrusWindow ? 3 : (h % 3 === 0 ? 1 : 2)),
        health: isEstrusWindow ? 3 : 0,
        bat: 94 - Math.floor(h / 3)
      });
    }

    setTimeout(() => {
      this.notifyTimelineListeners(simTimeline);
    }, 300);

    // High-Frequency 350ms simulator stream
    this.simInterval = setInterval(() => {
      tickCount++;
      simTemp = +(38.5 + Math.sin(tickCount * 0.15) * 0.35 + (Math.random() * 0.15)).toFixed(2);
      simBpm = Math.floor(66 + Math.sin(tickCount * 0.25) * 5 + Math.random() * 3);
      simSpo2 = Math.min(100, Math.max(95, Math.floor(98 + (Math.random() * 2 - 1))));
      simBat = Math.max(20, 94 - Math.floor(tickCount / 100));

      if (tickCount % 40 > 30) {
        simMotion = 3; 
        simHealth = 3; 
      } else {
        simMotion = (tickCount % 4 === 0) ? 0 : (tickCount % 4 === 1) ? 1 : 2;
        simHealth = 0;
      }

      const payloadData = {
        temp: simTemp,
        bpm: simBpm,
        spo2: simSpo2,
        motion: simMotion,
        health: simHealth,
        bat: simBat,
        conf: 96.4,
        contact: true
      };

      const rawJson = JSON.stringify(payloadData);
      this.addPacketLog('stream', `SIM RX: ${simTemp}°C | ${simBpm} BPM | ${simSpo2}% SpO2`, rawJson);

      this.notifyListeners({
        status: 'simulator',
        data: payloadData
      });
    }, 350);
  }

  stopSimulator() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.isSimulator = false;
  }

  async disconnect() {
    this.stopSimulator();
    if (this.isCapacitor && this.deviceId) {
      try {
        await BleClient.disconnect(this.deviceId);
      } catch (e) {}
    } else if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.addPacketLog('info', 'Disconnected from CowCollar');
    this.notifyListeners({ status: 'disconnected' });
  }
}

export const bleService = new BleService();
