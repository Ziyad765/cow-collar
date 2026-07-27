import React from 'react';
import { ShieldCheck, ShieldAlert, Flame, Baby, Sliders } from 'lucide-react';

const SCENARIOS = [
  { code: 0, icon: <ShieldCheck size={16} />, label: 'Normal', desc: '38.8°C Nominal', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  { code: 1, icon: <ShieldAlert size={16} />, label: 'Fever', desc: '39.8°C High', color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5' },
  { code: 3, icon: <Flame size={16} />, label: 'Estrus', desc: 'Heat cycle', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  { code: 4, icon: <Baby size={16} />, label: 'Calving', desc: 'Pre-delivery', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' }
];

export default function InteractiveControls({ onInjectAnomaly }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sliders size={16} color="#475569" />
            <h3 style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pitch Demo Anomaly Injector
            </h3>
          </div>
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>1-Tap Simulator</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {SCENARIOS.map(s => (
            <button
              key={s.code}
              onClick={() => onInjectAnomaly(s.code)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 4px',
                borderRadius: 12,
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.color,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {s.icon}
              <span style={{ fontSize: 11, fontWeight: 700 }}>{s.label}</span>
              <span style={{ fontSize: 9, opacity: 0.8, fontWeight: 500 }}>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
