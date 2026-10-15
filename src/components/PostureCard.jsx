import React from 'react';

export default function PostureCard({ isLying = false, lyingMin = 0 }) {
  const dailyTarget = 14 * 60; // 840 min = 14 hours
  const progressPercent = Math.min(100, (lyingMin / 60) * 100); // % of current hour spent lying

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: '20px 18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: `2px solid ${isLying ? '#8B5CF6' : '#0EA5E9'}22`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{isLying ? '🛌' : '🐄'}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>
          POSTURE & LYING TIME
        </span>
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 16,
        background: isLying ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)' : 'linear-gradient(135deg, #0EA5E9, #38BDF8)',
        color: 'white',
        fontSize: 18,
        fontWeight: 800,
        marginBottom: 14,
        boxShadow: isLying ? '0 4px 12px rgba(139,92,246,0.3)' : '0 4px 12px rgba(14,165,233,0.3)'
      }}>
        {isLying ? '🛌 Lying Down' : '🐄 Standing'}
      </div>

      {/* Lying time this hour */}
      <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>
        Lying Time This Hour
      </div>
      <div style={{
        height: 10,
        borderRadius: 5,
        background: '#F1F5F9',
        overflow: 'hidden',
        marginBottom: 6
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          borderRadius: 5,
          background: 'linear-gradient(90deg, #8B5CF6, #C084FC)',
          transition: 'width 1s ease'
        }} />
      </div>
      <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
        {lyingMin} min / 60 min
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
        Healthy cows lie 12-14 hrs/day. Too much = lameness. Too little = estrus/stress.
      </div>
    </div>
  );
}
