import React from 'react';
import { Bluetooth, ChevronDown, Wifi, Battery, Sparkles } from 'lucide-react';
import cowImg from '../assets/cow_245.jpg';

const HERD = [
  { id: '245', name: 'Cow #245', breed: 'HF Cross · Lactating (14.2 L/d)', tag: 'KL-07-245', status: 'Active' },
  { id: '104', name: 'Cow #104', breed: 'Jersey Cross · Gestating (Day 278)', tag: 'KL-07-104', status: 'Pre-Calving' },
  { id: '312', name: 'Cow #312', breed: 'Sahiwal · Heifer', tag: 'KL-07-312', status: 'Cycle Ready' },
  { id: '089', name: 'Cow #089', breed: 'HF Cross · Post-Partum (Day 2)', tag: 'KL-07-089', status: 'High Watch' }
];

export default function CowConnectionCard({
  isConnected = true,
  isSimulator = false,
  selectedCowId = '245',
  onSelectCow,
  activeSubTab = 'live',
  onTabChange,
  batteryPct = 94,
  onConnectReal,
  onToggleSimulator,
  onDisconnect
}) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const currentCow = HERD.find(c => c.id === selectedCowId) || HERD[0];

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      margin: '0 16px',
      padding: '16px 18px 0',
      boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
      border: '1px solid #E6F0EA',
      position: 'relative'
    }}>
      {/* Top Row: Bluetooth Status & Cow Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        {/* Left: Blue BLE Icon + Status + Cow Title */}
        <div 
          onClick={() => setShowDropdown(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1 }}
        >
          {/* Circular Blue Bluetooth Badge */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: isConnected 
              ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' 
              : 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: isConnected ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
            position: 'relative',
            flexShrink: 0
          }}>
            <Bluetooth size={22} strokeWidth={2.3} />
            {isConnected && (
              <span style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #FFFFFF'
              }} />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: isConnected ? '#059669' : '#64748B',
                letterSpacing: 0.3,
                textTransform: 'uppercase'
              }}>
                {isConnected ? (isSimulator ? '⚡ Demo Active' : '● Connected') : '○ Disconnected'}
              </span>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                {batteryPct}% Bat
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                {currentCow.name}
              </h2>
              <ChevronDown size={18} color="#64748B" />
            </div>
          </div>
        </div>

        {/* Right: Cow Avatar Thumbnail */}
        <div 
          onClick={() => setShowDropdown(v => !v)}
          style={{
            position: 'relative',
            cursor: 'pointer',
            padding: 2,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #059669, #10B981)',
            boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
          }}
        >
          <img 
            src={cowImg} 
            alt="Cow #245"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <span style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            background: '#F59E0B',
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: 6,
            border: '1px solid #FFFFFF'
          }}>
            #245
          </span>
        </div>
      </div>

      {/* Herd Switcher Dropdown Modal / Popover */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: 72,
          left: 16,
          right: 16,
          background: '#FFFFFF',
          borderRadius: 18,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
          border: '1px solid #CBD5E1',
          zIndex: 100,
          padding: 8,
          animation: 'fadeUp 0.2s ease forwards'
        }}>
          <div style={{ padding: '6px 12px 8px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Select Dairy Cow
          </div>
          {HERD.map(cow => (
            <div
              key={cow.id}
              onClick={() => {
                if (onSelectCow) onSelectCow(cow.id);
                setShowDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                background: cow.id === selectedCowId ? '#F0FDF4' : 'transparent',
                border: cow.id === selectedCowId ? '1px solid #BBF7D0' : '1px solid transparent',
                marginBottom: 4
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{cow.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{cow.breed}</div>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 99,
                background: cow.id === selectedCowId ? '#059669' : '#F1F5F9',
                color: cow.id === selectedCowId ? '#FFFFFF' : '#475569'
              }}>
                {cow.status}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 6, paddingTop: 6, display: 'flex', gap: 6 }}>
            {!isConnected ? (
              <>
                <button
                  onClick={() => { onConnectReal(); setShowDropdown(false); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📡 Scan BLE Collar
                </button>
                <button
                  onClick={() => { onToggleSimulator(); setShowDropdown(false); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Demo Stream
                </button>
              </>
            ) : (
              <button
                onClick={() => { onDisconnect(); setShowDropdown(false); }}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 10,
                  border: '1px solid #FECACA',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Disconnect Device
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs: Live Data | History | Insights */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #F1F5F9',
        marginTop: 6
      }}>
        {[
          { id: 'live', label: 'Live Data' },
          { id: 'history', label: 'History' },
          { id: 'insights', label: 'Insights' }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                fontSize: 14,
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#059669' : '#64748B',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: -1,
                  left: '20%',
                  right: '20%',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: '#059669'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
