import React from 'react';
import { AlertTriangle, Baby, CheckCircle2, Flame, ShieldAlert } from 'lucide-react';

const ALERTS = {
  0: {
    icon: <CheckCircle2 size={22} color="#10B981" />,
    title: 'All Vitals Nominal',
    subtitle: 'Cattle is healthy & resting comfortably',
    body: 'Continuous 50Hz TinyML edge monitoring active. No thermal anomalies or restlessness detected.',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badge: 'Nominal'
  },
  1: {
    icon: <ShieldAlert size={22} color="#EF4444" />,
    title: 'High Fever Alert',
    subtitle: (temp) => `Body Temp ${temp}°C — Early Clinical Flag`,
    body: 'Temperature above 39.5°C threshold. Immediate veterinary examination recommended.',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    badge: 'Critical'
  },
  2: {
    icon: <AlertTriangle size={22} color="#3B82F6" />,
    title: 'Low Body Temperature',
    subtitle: (temp) => `Body Temp ${temp}°C — Below Normal`,
    body: 'Abnormally low body temp detected. Inspect cattle for metabolic shock or milk fever.',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    badge: 'Monitor'
  },
  3: {
    icon: <Flame size={22} color="#D97706" />,
    title: 'Estrus / Heat Window',
    subtitle: () => 'Optimal 12-hour Breeding Window Open',
    body: 'Edge AI detected estrus restlessness pattern. Prime time for artificial insemination (AI).',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    badge: 'Action Needed'
  },
  4: {
    icon: <Baby size={22} color="#7C3AED" />,
    title: 'Calving Imminent',
    subtitle: (temp) => `Pre-partum signature drop (${temp}°C)`,
    body: 'Temperature drop + restlessness spike detected. Delivery expected within 12–24 hours. Prepare stall.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badge: 'Prepare Now'
  }
};

export default function AlertBanner({ healthStatus = 0, temp = 38.8 }) {
  const alert = ALERTS[healthStatus] || ALERTS[0];
  const subtitleText = typeof alert.subtitle === 'function' ? alert.subtitle(temp) : alert.subtitle;

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: alert.bg,
        border: `1px solid ${alert.border}`,
        borderRadius: 20,
        padding: '16px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          {alert.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: alert.color, letterSpacing: '-0.01em' }}>
              {alert.title}
            </h3>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: alert.color,
              background: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: 99,
              border: `1px solid ${alert.border}`
            }}>
              {alert.badge}
            </span>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
            {subtitleText}
          </div>

          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, margin: 0 }}>
            {alert.body}
          </p>
        </div>
      </div>
    </div>
  );
}
