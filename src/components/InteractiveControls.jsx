import React from 'react';
import { ShieldCheck, ShieldAlert, Flame, Baby, Sliders, Wind, HeartCrack, AlertTriangle } from 'lucide-react';

const SCENARIOS = [
  { code: 0, icon: <ShieldCheck size={16} />, label: 'Normal', desc: '38.1°C Nominal', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  { code: 1, icon: <ShieldAlert size={16} />, label: 'Fever', desc: '39.8°C Mastitis', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { code: 3, icon: <Flame size={16} />, label: 'Estrus', desc: 'Heat +180%', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  { code: 4, icon: <Baby size={16} />, label: 'Calving', desc: '37.6°C Pre-Birth', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { code: 7, icon: <AlertTriangle size={16} />, label: 'Milk Fever', desc: 'Calcium Crash', color: '#B91C1C', bg: '#FEF2F2', border: '#F87171' },
  { code: 5, icon: <Wind size={16} />, label: 'Resp / BRD', desc: 'RR:48 /min', color: '#0284C7', bg: '#EFF6FF', border: '#BAE6FD' },
  { code: 6, icon: <HeartCrack size={16} />, label: 'HRV Stress', desc: 'SDNN:14ms', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' }
];

export default function InteractiveControls({ onInjectAnomaly }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 22,
        padding: '16px',
        border: '1px solid #CBD5E1',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sliders size={16} color="#059669" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              AgriCon Jury 1-Tap Anomaly Simulator
            </span>
          </div>
          <span style={{ fontSize: 10, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
            Live Demo
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: 8 }}>
          {SCENARIOS.map(s => (
            <button
              key={s.code}
              onClick={() => onInjectAnomaly(s.code)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 6px',
                borderRadius: 14,
                border: `1.5px solid ${s.border}`,
                background: s.bg,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
                {s.label}
              </span>
              <span style={{ fontSize: 9, color: '#64748B', fontWeight: 600 }}>
                {s.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
