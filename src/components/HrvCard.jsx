import React from 'react';

const stressLevel = (hrv) => {
  if (hrv <= 0) return { label: 'No Data', color: '#94A3B8', bg: '#F1F5F9' };
  if (hrv >= 60) return { label: 'Relaxed', color: '#059669', bg: '#D1FAE5' };
  if (hrv >= 40) return { label: 'Calm', color: '#0D9488', bg: '#CCFBF1' };
  if (hrv >= 25) return { label: 'Mild Stress', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Stressed', color: '#DC2626', bg: '#FEE2E2' };
};

export default function HrvCard({ hrv = 0, rmssd = 0 }) {
  const stress = stressLevel(hrv);

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: '20px 18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `2px solid ${stress.color}22`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>💓</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>
          HEART RATE VARIABILITY
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 42, fontWeight: 800, color: stress.color, lineHeight: 1 }}>
          {hrv > 0 ? hrv : '—'}
        </span>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#64748B' }}>ms SDNN</span>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 20,
        background: stress.bg,
        fontSize: 13,
        fontWeight: 700,
        color: stress.color
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: stress.color,
          animation: hrv > 0 ? 'pulse 2s infinite' : 'none'
        }} />
        {stress.label}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
        {hrv >= 60 ? 'Healthy autonomic nervous system. No stress detected.' :
         hrv >= 40 ? 'Normal variability. Cow appears calm.' :
         hrv >= 25 ? 'Moderate stress or early illness marker. Monitor closely.' :
         hrv > 0 ? '⚠️ Low HRV — possible illness, pain, or high stress. Check cow.' :
         'Waiting for enough heartbeats to compute HRV...'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
