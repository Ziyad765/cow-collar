import React, { useState } from 'react';
import { Activity, Battery, BatteryMedium, BatteryLow, Bluetooth, BluetoothOff, ChevronDown, Sparkles } from 'lucide-react';

const COWS = ['Lakshmi #104', 'Gauri #105', 'Nandi #106', 'Kamdhenu #107'];

export default function Header({ 
  isConnected, 
  isSimulator, 
  batteryLevel, 
  selectedCow, 
  setSelectedCow, 
  onConnectReal, 
  onToggleSimulator, 
  onDisconnect 
}) {
  const [showPicker, setShowPicker] = useState(false);

  const batPct = batteryLevel !== null ? batteryLevel : 0;
  const BatteryIcon = batPct > 60 ? Battery : batPct > 30 ? BatteryMedium : BatteryLow;
  const batColor = batPct > 60 ? '#10B981' : batPct > 30 ? '#F59E0B' : '#EF4444';

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      paddingTop: 'max(calc(env(safe-area-inset-top) + 10px), 28px)',
      paddingBottom: '14px',
      paddingLeft: '16px',
      paddingRight: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
    }}>
      {/* Top Row: App Title & Battery */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}>
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                CowCollar <span style={{ color: '#10B981' }}>AI</span>
              </h1>
              {isConnected && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isSimulator ? '#D97706' : '#059669',
                  background: isSimulator ? '#FEF3C7' : '#ECFDF5',
                  padding: '2px 7px',
                  borderRadius: 99
                }}>
                  {isSimulator ? 'Demo Mode' : 'Connected'}
                </span>
              )}
            </div>
            <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>
              Smart Livestock Monitor
            </p>
          </div>
        </div>

        {/* Battery Indicator (if connected) */}
        {isConnected && batteryLevel !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 10,
            background: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}>
            <BatteryIcon size={16} color={batColor} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>
              {batteryLevel}%
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Cow Selector & Bluetooth Control */}
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Cow Selector Dropdown */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={() => setShowPicker(v => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 12,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>🐄 {selectedCow}</span>
            <ChevronDown size={14} color="#64748B" style={{ transform: showPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showPicker && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 100,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              {COWS.map(cow => (
                <button
                  key={cow}
                  onClick={() => { setSelectedCow(cow); setShowPicker(false); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: cow === selectedCow ? '#ECFDF5' : '#FFFFFF',
                    color: cow === selectedCow ? '#059669' : '#334155',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer'
                  }}
                >
                  🐄 {cow}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Connect / Disconnect Button */}
        {!isConnected ? (
          <button
            onClick={onConnectReal}
            style={{
              padding: '9px 16px',
              borderRadius: 12,
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}
          >
            <Bluetooth size={14} /> Connect
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            style={{
              padding: '9px 14px',
              borderRadius: 12,
              background: '#FEF2F2',
              color: '#EF4444',
              border: '1px solid #FCA5A5',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <BluetoothOff size={14} /> Disconnect
          </button>
        )}
      </div>
    </header>
  );
}
