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
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>24-Hour Offline Log</h3>
            <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Auto-synced from flash memory ring buffer</p>
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
            {alerts.length > 0 ? `${alerts.length} Overnight Alert(s)` : '✔ All Nominal'}
          </span>
        </div>

        {/* Bar Chart */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          height: 52,
          background: '#F8FAFC',
          borderRadius: 12,
          padding: '8px',
          border: '1px solid #F1F5F9'
        }}>
          {timelineData.slice(0, 24).map((item, idx) => {
            const isAlert = item.health > 0;
            const barH = Math.min(100, Math.max(20, ((item.temp - 37.5) / 3.0) * 100));
            return (
              <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${barH}%`,
                  borderRadius: 3,
                  background: isAlert ? '#F59E0B' : item.motion === 0 ? '#6366F1' : '#10B981',
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
        </div>
      </div>
    </div>
  );
}
