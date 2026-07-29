import React from 'react';
import { Moon, Sunrise, Sun, ShieldCheck, Flame } from 'lucide-react';

export default function TimelineSection({ timelineData = [] }) {
  if (!timelineData || timelineData.length === 0) return null;

  const alerts = timelineData.filter(d => d.health > 0);

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>24-Hour Continuous Flash Log</h3>
            <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Persistent Ring Buffer · Multi-Phone Access</p>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: alerts.length > 0 ? '#D97706' : '#059669',
            background: alerts.length > 0 ? '#FEF3C7' : '#ECFDF5',
            padding: '4px 10px',
            borderRadius: 99,
            border: `1px solid ${alerts.length > 0 ? '#FDE68A' : '#A7F3D0'}`
          }}>
            {alerts.length > 0 ? `${alerts.length} Alert Period(s)` : '✔ All Nominal'}
          </span>
        </div>

        {/* Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          height: 56,
          background: '#F8FAFC',
          borderRadius: 12,
          padding: '8px',
          border: '1px solid #F1F5F9'
        }}>
          {timelineData.slice(-24).map((item, idx) => {
            const isAlert = item.health > 0;
            const barH = Math.min(100, Math.max(25, (((item.temp || 38.5) - 37.5) / 2.5) * 100));
            const barBg = item.motion === 3 ? '#F59E0B' : item.motion === 0 ? '#6366F1' : item.motion === 1 ? '#10B981' : '#0EA5E9';

            return (
              <div key={idx} title={`Time: ${item.time || idx + ':00'} | Temp: ${item.temp}°C | Motion: ${item.motion}`} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${barH}%`,
                  borderRadius: 3,
                  background: isAlert ? '#EF4444' : barBg,
                  transition: 'height 0.4s ease'
                }} />
              </div>
            );
          })}
        </div>

        {/* Time axis */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
          <span>🌙 12 AM</span>
          <span>🌅 6 AM</span>
          <span>☀️ 12 PM</span>
          <span>🌆 6 PM</span>
        </div>

        {/* Behavioral Color Legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10, pt: 8, borderTop: '1px solid #F1F5F9', fontSize: 10, color: '#64748B', fontWeight: 600, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#6366F1' }} /> Sleep/Rest
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} /> Rumination
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0EA5E9' }} /> Walking
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#F59E0B' }} /> Active/Estrus
          </span>
        </div>
      </div>
    </div>
  );
}
