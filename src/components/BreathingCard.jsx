import React, { useEffect, useState } from 'react';

export default function BreathingCard({ breathRate = 0 }) {
  const [breathPhase, setBreathPhase] = useState(0);

  useEffect(() => {
    if (breathRate <= 0) return;
    const interval = setInterval(() => {
      setBreathPhase(p => (p + 1) % 100);
    }, (60000 / Math.max(breathRate, 10)) / 100);
    return () => clearInterval(interval);
  }, [breathRate]);

  const scale = breathRate > 0 ? 1 + Math.sin(breathPhase * Math.PI * 2 / 100) * 0.15 : 1;

  const getStatus = () => {
    if (breathRate <= 0) return { label: 'No Data', color: '#94A3B8', bg: '#F1F5F9' };
    if (breathRate <= 30) return { label: 'Normal', color: '#059669', bg: '#D1FAE5' };
    if (breathRate <= 40) return { label: 'Elevated', color: '#D97706', bg: '#FEF3C7' };
    return { label: 'Distress', color: '#DC2626', bg: '#FEE2E2' };
  };

  const status = getStatus();

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: '20px 18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `2px solid ${status.color}22`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🫁</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>
          RESPIRATORY RATE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: `${status.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s ease'
        }}>
          <span style={{
            fontSize: 28,
            transform: `scale(${scale})`,
            transition: 'transform 0.15s ease',
            display: 'block'
          }}>
            🫁
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: status.color, lineHeight: 1 }}>
              {breathRate > 0 ? breathRate : '—'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>br/min</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 20,
        background: status.bg,
        fontSize: 13,
        fontWeight: 700,
        color: status.color
      }}>
        {status.label}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
        {breathRate > 0 ? `Normal cattle: 15-30 br/min` : 'Measuring respiratory modulation...'}
      </div>
    </div>
  );
}
