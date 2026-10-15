import React from 'react';
import { Bluetooth, BluetoothOff, Battery, BatteryMedium, BatteryLow, Sparkles } from 'lucide-react';

export default function Header({ 
  isConnected, 
  isSimulator, 
  batteryLevel, 
  onConnectReal, 
  onToggleSimulator, 
  onDisconnect 
}) {
  const batPct = batteryLevel !== null ? batteryLevel : 94;
  const BatteryIcon = batPct > 60 ? Battery : batPct > 30 ? BatteryMedium : BatteryLow;
  const batColor = batPct > 60 ? '#34D399' : batPct > 30 ? '#FBBF24' : '#F87171';

  return (
    <header style={{
      background: 'linear-gradient(135deg, #063D27 0%, #064E3B 100%)',
      paddingTop: 'max(calc(env(safe-area-inset-top) + 8px), 16px)',
      paddingBottom: '16px',
      paddingLeft: '18px',
      paddingRight: '18px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(6, 78, 59, 0.25)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: Brand Logo + Cow Outline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Custom Cow Silhouette with Green Sprout Icon */}
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 8C4 5 6 3 8 3C9 5 9 6 8 8C7 7 6 7 5 8Z" fill="#34D399" />
              <path d="M19 8C20 5 18 3 16 3C15 5 15 6 16 8C17 7 18 7 19 8Z" fill="#34D399" />
              <path d="M6 9C6 7 8 5 12 5C16 5 18 7 18 9V14C18 17 15.5 19 12 19C8.5 19 6 17 6 14V9Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <ellipse cx="9" cy="11" rx="1" ry="1.5" fill="#FFFFFF"/>
              <ellipse cx="15" cy="11" rx="1" ry="1.5" fill="#FFFFFF"/>
              <circle cx="10" cy="15" r="0.8" fill="#34D399"/>
              <circle cx="14" cy="15" r="0.8" fill="#34D399"/>
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{
                fontSize: 19,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: 0
              }}>
                CowCollar <span style={{ color: '#34D399' }}>AI</span>
              </h1>
            </div>
            <p style={{ fontSize: 10, color: '#A7F3D0', fontWeight: 600, letterSpacing: 0.4, margin: '3px 0 0', textTransform: 'uppercase' }}>
              Livestock Edge Intelligence
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls & Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isConnected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <BatteryIcon size={14} color={batColor} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                {batPct}%
              </span>
            </div>
          )}

          {!isConnected ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={onConnectReal}
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Bluetooth size={14} /> Connect
              </button>
              <button
                onClick={onToggleSimulator}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: 10,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ⚡ Demo
              </button>
            </div>
          ) : (
            <button
              onClick={onDisconnect}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 10,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
