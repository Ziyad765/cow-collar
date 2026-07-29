import React from 'react';
import { Bluetooth, Sparkles, Activity, ShieldCheck, Zap, Radio } from 'lucide-react';

export default function DisconnectedState({ selectedCow, onConnectReal, onToggleSimulator }) {
  return (
    <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Primary Hero Disconnected Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 24,
        padding: '28px 20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Pulsing Icon Badge */}
        <div style={{
          width: 68,
          height: 68,
          borderRadius: 22,
          background: '#F1F5F9',
          border: '2px solid #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          marginBottom: 16,
          position: 'relative'
        }}>
          <Radio size={32} strokeWidth={2} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Device Not Connected
        </h2>
        
        <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500, lineHeight: 1.5, maxWidth: 290, marginBottom: 14 }}>
          No active Bluetooth connection to <strong style={{ color: '#0F172A' }}>{selectedCow}'s</strong> smart collar.
        </p>

        {/* Offline Smartwatch Logging Banner */}
        <div style={{
          width: '100%',
          background: '#F0FDF4',
          borderRadius: 14,
          padding: '10px 12px',
          border: '1px solid #BBF7D0',
          fontSize: 11,
          color: '#166534',
          fontWeight: 600,
          textAlign: 'left',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ fontSize: 16 }}>💾</span>
          <span>
            <strong>Collar is logging offline:</strong> Stores 24h vitals in Flash memory. Connect <em>any smartphone</em> at any time to sync 1-day cow statistics!
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onConnectReal}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 16,
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Bluetooth size={18} strokeWidth={2.5} />
            Connect Cow Collar (BLE)
          </button>

          <button
            onClick={onToggleSimulator}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: 16,
              background: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={16} color="#F59E0B" />
            Launch Interactive Demo Mode
          </button>
        </div>
      </div>

      {/* Feature Preview Cards (What you get when connected) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 18,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Activity size={18} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>Real-Time Vitals</div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Live ECG, Heart Rate, SpO2 & Temperature</div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: 18,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Zap size={18} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>Estrus & Fever AI</div>
          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>48-hour early clinical alert notifications</div>
        </div>
      </div>
    </div>
  );
}
