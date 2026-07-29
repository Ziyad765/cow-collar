import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import IcuMonitorStrip from './components/IcuMonitorStrip';
import VitalsGrid from './components/VitalsGrid';
import DailyStatsSection from './components/DailyStatsSection';
import AnalyticsSection from './components/AnalyticsSection';
import TimelineSection from './components/TimelineSection';
import InteractiveControls from './components/InteractiveControls';
import DisconnectedState from './components/DisconnectedState';
import LogsSection from './components/LogsSection';
import { bleService } from './services/bleService';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);
  const [selectedCow, setSelectedCow] = useState('Lakshmi #104');
  const [errorMsg, setErrorMsg] = useState('');
  const [timelineData, setTimelineData] = useState(() => bleService.getStoredTimelineData());
  const [showLogs, setShowLogs] = useState(false);

  // Vitals state - default null when disconnected
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    const unsubscribeLive = bleService.onData((res) => {
      if (res.status === 'disconnected') {
        setIsConnected(false);
        setIsSimulator(false);
        setVitals(null);
      } else if (res.status === 'live' || res.status === 'simulator') {
        setIsConnected(true);
        setIsSimulator(res.status === 'simulator');
        setVitals(res.data);
      }
    });

    const unsubscribeTimeline = bleService.onTimelineData((data) => {
      if (data && data.length > 0) {
        setTimelineData(data);
      }
    });

    return () => {
      unsubscribeLive();
      unsubscribeTimeline();
    };
  }, []);

  const handleConnectReal = async () => {
    setErrorMsg('');
    try {
      await bleService.connectRealDevice();
    } catch (err) {
      setErrorMsg(err.message || 'Bluetooth connection failed. Ensure BLE is active.');
    }
  };

  const handleToggleSimulator = () => {
    setErrorMsg('');
    bleService.startSimulator();
  };

  const handleDisconnect = () => {
    bleService.disconnect();
    setIsConnected(false);
    setIsSimulator(false);
    setVitals(null);
  };

  const handleInjectAnomaly = (healthCode) => {
    if (!vitals) return;
    if (healthCode === 1) { // Fever
      setVitals(v => ({ ...v, temp: 39.8, health: 1, contact: true }));
    } else if (healthCode === 3) { // Estrus
      setVitals(v => ({ ...v, temp: 39.1, motion: 3, health: 3, contact: true }));
    } else if (healthCode === 4) { // Calving
      setVitals(v => ({ ...v, temp: 38.2, motion: 3, health: 4, contact: true }));
    } else { // Normal
      setVitals(v => ({ ...v, temp: 38.8, bpm: 68, spo2: 98, motion: 1, health: 0, contact: true }));
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
      paddingBottom: 32
    }}>
      {/* Header */}
      <Header 
        isConnected={isConnected}
        isSimulator={isSimulator}
        batteryLevel={vitals ? vitals.bat : null}
        selectedCow={selectedCow}
        setSelectedCow={setSelectedCow}
        onConnectReal={handleConnectReal}
        onToggleSimulator={handleToggleSimulator}
        onDisconnect={handleDisconnect}
      />

      {/* Error Message Toast */}
      {errorMsg && (
        <div style={{
          margin: '12px 16px 0',
          padding: '12px 16px',
          borderRadius: 14,
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          fontSize: 13,
          color: '#991B1B',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
        }}>
          <span>⚠️</span>
          <span style={{ flex: 1 }}>{errorMsg}</span>
          <button 
            onClick={() => setErrorMsg('')} 
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!isConnected ? (
        <DisconnectedState 
          selectedCow={selectedCow}
          onConnectReal={handleConnectReal}
          onToggleSimulator={handleToggleSimulator}
          timelineData={timelineData}
        />
      ) : (
        <main style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          {/* 1. Diagnostic Alert Banner */}
          <AlertBanner 
            healthStatus={vitals.health}
            temp={vitals.temp}
          />

          {/* 2. Real-Time Dynamic ECG Waveform */}
          <IcuMonitorStrip 
            bpm={vitals.bpm}
            spo2={vitals.spo2}
            skinContact={vitals.contact !== false}
          />

          {/* 3. Vitals Grid */}
          <VitalsGrid 
            temp={vitals.temp}
            bpm={vitals.bpm}
            spo2={vitals.spo2}
            motionState={vitals.motion}
            skinContact={vitals.contact !== false}
          />

          {/* 4. Smartwatch 24-Hour Daily Statistics & AI Analysis */}
          <DailyStatsSection timelineData={timelineData} />

          {/* 5. 24-Hour Offline Morning Sync Timeline */}
          <TimelineSection timelineData={timelineData} />

          {/* 5. AI Insights & WhatsApp Export */}
          <AnalyticsSection 
            selectedCow={selectedCow}
            temp={vitals.temp}
            healthStatus={vitals.health}
            motionState={vitals.motion}
          />

          {/* 6. Pitch Simulator Anomaly Controls (Only in Demo mode) */}
          {isSimulator && (
            <InteractiveControls onInjectAnomaly={handleInjectAnomaly} />
          )}

          {/* 7. System & Sensor Data Logs Section */}
          <LogsSection />
        </main>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center', fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
        CowCollar AI · ESP32 Livestock Edge Intelligence System
      </footer>
    </div>
  );
}
