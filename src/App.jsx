import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CowConnectionCard from './components/CowConnectionCard';
import AlertBanner from './components/AlertBanner';
import VitalsGrid from './components/VitalsGrid';
import IcuMonitorStrip from './components/IcuMonitorStrip';
import AmulIntegrationCard from './components/AmulIntegrationCard';
import ClinicalDiagnosticSection from './components/ClinicalDiagnosticSection';
import AnalyticsSection from './components/AnalyticsSection';
import DailyStatsSection from './components/DailyStatsSection';
import TimelineSection from './components/TimelineSection';
import InteractiveControls from './components/InteractiveControls';
import BottomNavBar from './components/BottomNavBar';
import LogsSection from './components/LogsSection';
import { bleService } from './services/bleService';
import cowImg from './assets/cow_245.jpg';
import { ShieldAlert, Baby, AlertTriangle, Flame, CheckCircle, ChevronRight, Sliders, Bluetooth, RefreshCw } from 'lucide-react';

const HERD_DATA = [
  {
    id: '245',
    name: 'Cow #245',
    tag: 'KL-07-245',
    breed: 'HF Cross (Holstein Friesian)',
    status: 'Fever Risk (38.6°C)',
    statusColor: '#DC2626',
    statusBg: '#FEF2F2',
    milkToday: '14.2 L',
    fat: '3.8%',
    snf: '8.6%',
    owner: 'Rajesh K. (Kochi Union)',
    defaultVitals: { temp: 38.6, bpm: 68, rr: 32, rumination: 6.2, lying: false, lyingMin: 18, health: 1 }
  },
  {
    id: '104',
    name: 'Cow #104',
    tag: 'KL-07-104',
    breed: 'Jersey Cross (Gestating)',
    status: 'Pre-Calving (37.6°C)',
    statusColor: '#7C3AED',
    statusBg: '#F5F3FF',
    milkToday: 'Dry Period',
    fat: '--',
    snf: '--',
    owner: 'Rajesh K. (Kochi Union)',
    defaultVitals: { temp: 37.6, bpm: 72, rr: 28, rumination: 5.8, lying: true, lyingMin: 42, health: 4 }
  },
  {
    id: '312',
    name: 'Cow #312',
    tag: 'KL-07-312',
    breed: 'Sahiwal Cross (Heifer)',
    status: 'Estrus Peak (+180%)',
    statusColor: '#D97706',
    statusBg: '#FEF3C7',
    milkToday: 'Heifer (Pre-Lactation)',
    fat: '--',
    snf: '--',
    owner: 'Rajesh K. (Kochi Union)',
    defaultVitals: { temp: 38.9, bpm: 84, rr: 34, rumination: 4.9, lying: false, lyingMin: 8, health: 3 }
  },
  {
    id: '089',
    name: 'Cow #089',
    tag: 'KL-07-089',
    breed: 'HF Cross (Post-Partum Day 2)',
    status: 'Milk Fever Alert (<37.5°C)',
    statusColor: '#B91C1C',
    statusBg: '#FEE2E2',
    milkToday: '11.0 L (Colostrum/Milk)',
    fat: '4.2%',
    snf: '8.8%',
    owner: 'Rajesh K. (Kochi Union)',
    defaultVitals: { temp: 37.4, bpm: 92, rr: 22, rumination: 1.2, lying: true, lyingMin: 58, health: 7 }
  }
];

export default function App() {
  const [isConnected, setIsConnected] = useState(true); // Default connected for live experience
  const [isSimulator, setIsSimulator] = useState(true);
  const [selectedCowId, setSelectedCowId] = useState('245');
  const [activeSubTab, setActiveSubTab] = useState('live'); // 'live' | 'history' | 'insights'
  const [activeBottomNav, setActiveBottomNav] = useState('home'); // 'home' | 'cows' | 'alerts' | 'more'
  const [errorMsg, setErrorMsg] = useState('');
  const [timelineData, setTimelineData] = useState(() => bleService.getStoredTimelineData());

  const currentCow = HERD_DATA.find(c => c.id === selectedCowId) || HERD_DATA[0];

  // Vitals State with defaults matching the uploaded presentation
  const [vitals, setVitals] = useState({
    temp: 38.6,
    bpm: 68,
    spo2: 98,
    rr: 32,
    rumination: 6.2,
    motion: 1,
    health: 1, // Start with Cow #245 showing mild fever risk as in Screenshot 2
    bat: 94,
    conf: 96,
    contact: true,
    hrv: 58,
    lying: false,
    lyingMin: 18,
    score: 88,
    trend: 0
  });

  useEffect(() => {
    // Start simulator automatically so web users immediately see live 6-Hz streaming!
    bleService.startSimulator();

    const unsubscribeLive = bleService.onData((res) => {
      if (res.status === 'disconnected') {
        setIsConnected(false);
        setIsSimulator(false);
      } else if (res.status === 'live' || res.status === 'simulator') {
        setIsConnected(true);
        setIsSimulator(res.status === 'simulator');
        setVitals(prev => ({
          ...prev,
          ...res.data,
          // Preserve specific diagnostic overrides if user tested anomaly
          temp: prev.overrideTemp !== undefined ? prev.overrideTemp : res.data.temp,
          health: prev.overrideHealth !== undefined ? prev.overrideHealth : res.data.health,
          rr: res.data.rr || prev.rr || 32,
          rumination: res.data.rumination || prev.rumination || 6.2
        }));
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
      setErrorMsg(err.message || 'Bluetooth connection failed. Turn on Bluetooth or use Demo mode.');
    }
  };

  const handleToggleSimulator = () => {
    setErrorMsg('');
    bleService.startSimulator();
    setIsConnected(true);
    setIsSimulator(true);
  };

  const handleDisconnect = () => {
    bleService.disconnect();
    setIsConnected(false);
    setIsSimulator(false);
  };

  const handleSelectCow = (id) => {
    setSelectedCowId(id);
    const cow = HERD_DATA.find(c => c.id === id);
    if (cow && cow.defaultVitals) {
      setVitals(v => ({
        ...v,
        ...cow.defaultVitals,
        overrideTemp: cow.defaultVitals.temp,
        overrideHealth: cow.defaultVitals.health
      }));
    }
  };

  const handleInjectAnomaly = (code) => {
    if (code === 0) { // Normal
      setVitals(v => ({
        ...v,
        temp: 38.1,
        bpm: 68,
        spo2: 98,
        rr: 32,
        rumination: 6.8,
        motion: 1,
        health: 0,
        score: 95,
        lying: false,
        lyingMin: 14,
        overrideTemp: 38.1,
        overrideHealth: 0
      }));
    } else if (code === 1) { // Fever / Mastitis
      setVitals(v => ({
        ...v,
        temp: 39.8,
        bpm: 88,
        spo2: 96,
        rr: 38,
        rumination: 3.2,
        motion: 1,
        health: 1,
        score: 55,
        lying: false,
        lyingMin: 18,
        overrideTemp: 39.8,
        overrideHealth: 1
      }));
    } else if (code === 3) { // Estrus
      setVitals(v => ({
        ...v,
        temp: 38.9,
        bpm: 84,
        spo2: 97,
        rr: 36,
        rumination: 4.8,
        motion: 3,
        health: 3,
        score: 74,
        lying: false,
        lyingMin: 6,
        overrideTemp: 38.9,
        overrideHealth: 3
      }));
    } else if (code === 4) { // Calving
      setVitals(v => ({
        ...v,
        temp: 37.6,
        bpm: 78,
        spo2: 97,
        rr: 30,
        rumination: 4.5,
        motion: 3,
        health: 4,
        score: 68,
        lying: true,
        lyingMin: 35,
        overrideTemp: 37.6,
        overrideHealth: 4
      }));
    } else if (code === 7) { // Milk Fever (Calcium Deficiency)
      setVitals(v => ({
        ...v,
        temp: 37.4,
        bpm: 96,
        spo2: 93,
        rr: 20,
        rumination: 0.8,
        motion: 0,
        health: 7,
        score: 38,
        lying: true,
        lyingMin: 58,
        overrideTemp: 37.4,
        overrideHealth: 7
      }));
    } else if (code === 5) { // Respiratory Distress (BRD)
      setVitals(v => ({
        ...v,
        temp: 39.4,
        bpm: 94,
        spo2: 88,
        rr: 48,
        rumination: 3.5,
        motion: 1,
        health: 5,
        score: 42,
        lying: false,
        lyingMin: 22,
        overrideTemp: 39.4,
        overrideHealth: 5
      }));
    } else if (code === 6) { // HRV Stress
      setVitals(v => ({
        ...v,
        hrv: 14,
        bpm: 102,
        spo2: 96,
        rr: 38,
        rumination: 4.1,
        health: 6,
        score: 48,
        overrideTemp: v.temp,
        overrideHealth: 6
      }));
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      paddingBottom: 85
    }}>
      {/* 1. Dark Forest Green Header (#064E3B) with CowCollar AI logo */}
      <Header 
        isConnected={isConnected}
        isSimulator={isSimulator}
        batteryLevel={vitals ? vitals.bat : 94}
        onConnectReal={handleConnectReal}
        onToggleSimulator={handleToggleSimulator}
        onDisconnect={handleDisconnect}
      />

      {/* Error Message Toast */}
      {errorMsg && (
        <div style={{
          margin: '10px 16px',
          padding: '10px 14px',
          borderRadius: 14,
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          fontSize: 12,
          color: '#991B1B',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* Main Body Switcher based on Bottom Navigation */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
        
        {/* ==================== VIEW 1: HOME TAB ==================== */}
        {activeBottomNav === 'home' && (
          <>
            {/* Top Cow Connection & Sub-Tabs Card */}
            <CowConnectionCard 
              isConnected={isConnected}
              isSimulator={isSimulator}
              selectedCowId={selectedCowId}
              onSelectCow={handleSelectCow}
              activeSubTab={activeSubTab}
              onTabChange={setActiveSubTab}
              batteryPct={vitals ? vitals.bat : 94}
              onConnectReal={handleConnectReal}
              onToggleSimulator={handleToggleSimulator}
              onDisconnect={handleDisconnect}
            />

            {/* Sub-Tab 1: Live Data */}
            {activeSubTab === 'live' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-up">
                {/* Alert Profile Strip & Health Status Banner (Screenshot 2) */}
                <AlertBanner 
                  healthStatus={vitals.health}
                  temp={vitals.temp}
                  cowName={currentCow.name}
                />

                {/* 2x2 Primary Vitals Grid + Full Width Posture (Screenshot 1) */}
                <VitalsGrid 
                  temp={vitals.temp}
                  bpm={vitals.bpm}
                  spo2={vitals.spo2}
                  rr={vitals.rr}
                  ruminationHours={vitals.rumination}
                  motionState={vitals.motion}
                  skinContact={vitals.contact !== false}
                  hrv={vitals.hrv}
                  isLying={vitals.lying}
                  lyingMin={vitals.lyingMin}
                  healthScore={vitals.score}
                  trend={vitals.trend}
                />

                {/* Real-time Dynamic 60fps ECG & SpO2 Waveforms */}
                <IcuMonitorStrip 
                  bpm={vitals.bpm}
                  spo2={vitals.spo2}
                  skinContact={vitals.contact !== false}
                />
              </div>
            )}

            {/* Sub-Tab 2: History (24-Hour Offline Sync) */}
            {activeSubTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-up">
                <DailyStatsSection timelineData={timelineData} />
                <TimelineSection timelineData={timelineData} />
              </div>
            )}

            {/* Sub-Tab 3: Insights & Cooperatives */}
            {activeSubTab === 'insights' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-up">
                <AmulIntegrationCard 
                  cowId={currentCow.id}
                  breed={currentCow.breed}
                  owner={currentCow.owner}
                  milkToday={currentCow.milkToday}
                  fat={currentCow.fat}
                  snf={currentCow.snf}
                />
                <ClinicalDiagnosticSection />
                <AnalyticsSection 
                  selectedCow={currentCow.name}
                  temp={vitals.temp}
                  bpm={vitals.bpm}
                  rr={vitals.rr}
                  ruminationHours={vitals.rumination}
                  isLying={vitals.lying}
                  healthStatus={vitals.health}
                />
              </div>
            )}
          </>
        )}

        {/* ==================== VIEW 2: COWS HERD TAB ==================== */}
        {activeBottomNav === 'cows' && (
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Dairy Herd (4 Cows)
                </h2>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Kochi Union · Cooperative Tag #KL-07
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: 99 }}>
                All 4 Collars Online
              </span>
            </div>

            {HERD_DATA.map(cow => {
              const isCurrent = cow.id === selectedCowId;
              return (
                <div
                  key={cow.id}
                  onClick={() => {
                    handleSelectCow(cow.id);
                    setActiveBottomNav('home');
                    setActiveSubTab('live');
                  }}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 20,
                    padding: '16px',
                    border: isCurrent ? '2px solid #059669' : '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img 
                      src={cowImg} 
                      alt={cow.name}
                      style={{ width: 50, height: 50, borderRadius: 14, objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{cow.name}</span>
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>({cow.tag})</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 1 }}>{cow.breed}</div>
                      <div style={{ fontSize: 11, color: '#0284C7', fontWeight: 700, marginTop: 3 }}>
                        Daily Milk: {cow.milkToday}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: cow.statusColor,
                      background: cow.statusBg,
                      padding: '3px 8px',
                      borderRadius: 99,
                      border: `1px solid ${cow.statusColor}30`
                    }}>
                      {cow.status}
                    </span>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                      Inspect <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== VIEW 3: ALERTS TAB ==================== */}
        {activeBottomNav === 'alerts' && (
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Active Veterinary Alerts
                </h2>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Identified by Edge AI & Cloud Diagnostics
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: 99 }}>
                3 Action Required
              </span>
            </div>

            {/* Alert Item 1: Fever */}
            <div 
              onClick={() => { handleSelectCow('245'); handleInjectAnomaly(1); setActiveBottomNav('home'); }}
              style={{
                background: '#FEF2F2',
                borderRadius: 20,
                padding: '16px',
                border: '1.5px solid #FCA5A5',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ShieldAlert size={16} /> Cow #245 · Subclinical Mastitis
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', background: '#FFFFFF', padding: '2px 6px', borderRadius: 6 }}>
                  48h Notice
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#7F1D1D', lineHeight: 1.4, margin: '0 0 8px' }}>
                Body temperature elevated to <strong>39.8°C</strong> + rumination down by 45 minutes. Palpate right udder.
              </p>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#DC2626' }}>Tap to view live telemetry →</span>
            </div>

            {/* Alert Item 2: Milk Fever */}
            <div 
              onClick={() => { handleSelectCow('089'); handleInjectAnomaly(7); setActiveBottomNav('home'); }}
              style={{
                background: '#FFF7ED',
                borderRadius: 20,
                padding: '16px',
                border: '1.5px solid #FDBA74',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#C2410C', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertTriangle size={16} /> Cow #089 · Calcium Deficiency Alert
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#C2410C', background: '#FFFFFF', padding: '2px 6px', borderRadius: 6 }}>
                  Urgent
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#7C2D12', lineHeight: 1.4, margin: '0 0 8px' }}>
                Post-partum temp drop (<strong>37.4°C</strong>) + continuous sternal recumbency (&gt;55m). Administer oral calcium gel now!
              </p>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#C2410C' }}>Tap to view live telemetry →</span>
            </div>

            {/* Alert Item 3: Calving */}
            <div 
              onClick={() => { handleSelectCow('104'); handleInjectAnomaly(4); setActiveBottomNav('home'); }}
              style={{
                background: '#F5F3FF',
                borderRadius: 20,
                padding: '16px',
                border: '1.5px solid #DDD6FE',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#6D28D9', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Baby size={16} /> Cow #104 · Calving Pre-Delivery Alert
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6D28D9', background: '#FFFFFF', padding: '2px 6px', borderRadius: 6 }}>
                  12-24h
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#4C1D95', lineHeight: 1.4, margin: '0 0 8px' }}>
                Pre-partum 0.6°C temperature drop detected (37.6°C). Delivery imminent. Prepare maternity pen.
              </p>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#6D28D9' }}>Tap to view live telemetry →</span>
            </div>
          </div>
        )}

        {/* ==================== VIEW 4: MORE & SETTINGS TAB ==================== */}
        {activeBottomNav === 'more' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-up">
            {/* 1-Tap Anomaly Simulator */}
            <InteractiveControls onInjectAnomaly={handleInjectAnomaly} />

            {/* Amul / Milma Integration Card */}
            <AmulIntegrationCard 
              cowId={currentCow.id}
              breed={currentCow.breed}
              owner={currentCow.owner}
              milkToday={currentCow.milkToday}
              fat={currentCow.fat}
              snf={currentCow.snf}
            />

            {/* Full Clinical Diagnostic Overview */}
            <ClinicalDiagnosticSection />

            {/* Hardware & System Logs */}
            <LogsSection />

            {/* Griph Engineers & AgriCon Footnote */}
            <div style={{ textAlign: 'center', padding: '10px 16px', fontSize: 11, color: '#64748B' }}>
              <div><strong>CowCollar AI</strong> · Designed & Engineered by Griph Engineers, Kochi</div>
              <div style={{ marginTop: 2 }}>Presented at TiE Kerala AgriCon 2026 · KAU Thrissur</div>
            </div>
          </div>
        )}

      </main>

      {/* Fixed 4-Tab Bottom Navigation Bar (Screenshot 2) */}
      <BottomNavBar 
        activeTab={activeBottomNav}
        onSelectTab={setActiveBottomNav}
        alertCount={3}
      />
    </div>
  );
}
