import React from 'react';
import { AlertTriangle, Flame, Baby, CheckCircle2, ShieldAlert, ChevronRight, Wind, HeartCrack } from 'lucide-react';
import cowImg from '../assets/cow_245.jpg';

const ALERTS = {
  0: {
    statusTag: 'Nominal Health',
    pillText: 'All Vitals Normal · Grazing Comfortably',
    pillColor: '#059669',
    pillBg: '#ECFDF5',
    pillBorder: '#A7F3D0',
    riskTitle: 'All Clear · Active Monitoring',
    riskSubtitle: 'No clinical fever, estrus spikes, or calcium issues detected',
    cardBg: '#F0FDF4',
    cardBorder: '#BBF7D0',
    icon: CheckCircle2,
    iconColor: '#10B981',
    code: 0
  },
  1: {
    statusTag: 'Fever Risk',
    pillText: '⚠️ Fever Risk · Check right udder >',
    pillColor: '#DC2626',
    pillBg: '#FEF2F2',
    pillBorder: '#FECACA',
    riskTitle: 'Early Infection Risk',
    riskSubtitle: 'Probable Subclinical Mastitis detected (Temp > 39.5°C)',
    cardBg: '#FEF2F2',
    cardBorder: '#FECACA',
    icon: ShieldAlert,
    iconColor: '#DC2626',
    code: 1
  },
  2: {
    statusTag: 'Low Temp Warning',
    pillText: '❄️ Hypothermia Warning · Check bedding >',
    pillColor: '#2563EB',
    pillBg: '#EFF6FF',
    pillBorder: '#BFDBFE',
    riskTitle: 'Low Core Body Temperature',
    riskSubtitle: 'Temp dropped below 38.0°C. Inspect for metabolic shock',
    cardBg: '#EFF6FF',
    cardBorder: '#BFDBFE',
    icon: AlertTriangle,
    iconColor: '#2563EB',
    code: 2
  },
  3: {
    statusTag: 'Estrus Detected',
    pillText: '🔥 Peak Heat Window · Call Inseminator >',
    pillColor: '#D97706',
    pillBg: '#FEF3C7',
    pillBorder: '#FDE68A',
    riskTitle: 'Optimal 12-Hour AI Window',
    riskSubtitle: 'Estrus restlessness (+180% motion) & fertile thermal shift',
    cardBg: '#FEF3C7',
    cardBorder: '#FDE68A',
    icon: Flame,
    iconColor: '#D97706',
    code: 3
  },
  4: {
    statusTag: 'Calving Alert',
    pillText: '🐄 Calving Imminent · Prepare Stall >',
    pillColor: '#7C3AED',
    pillBg: '#F5F3FF',
    pillBorder: '#DDD6FE',
    riskTitle: 'Pre-Partum Signature Detected',
    riskSubtitle: 'Natural 0.6°C temperature drop + labor restlessness (12-24h notice)',
    cardBg: '#F5F3FF',
    cardBorder: '#DDD6FE',
    icon: Baby,
    iconColor: '#7C3AED',
    code: 4
  },
  5: {
    statusTag: 'Respiratory Distress',
    pillText: '🫁 Tachypnea Warning · Check Lungs >',
    pillColor: '#DC2626',
    pillBg: '#FEF2F2',
    pillBorder: '#FECACA',
    riskTitle: 'Bovine Respiratory Disease (BRD)',
    riskSubtitle: 'Rapid breathing rate (>40 /min) & low SpO2 blood oxygen',
    cardBg: '#FEF2F2',
    cardBorder: '#FECACA',
    icon: Wind,
    iconColor: '#DC2626',
    code: 5
  },
  6: {
    statusTag: 'Autonomic Stress',
    pillText: '💓 HRV Stress Warning · High Pain Index >',
    pillColor: '#EA580C',
    pillBg: '#FFF7ED',
    pillBorder: '#FED7AA',
    riskTitle: 'Acute Physiological Distress',
    riskSubtitle: 'Heart Rate Variability suppressed (SDNN < 20ms). Early pathogen trigger',
    cardBg: '#FFF7ED',
    cardBorder: '#FED7AA',
    icon: HeartCrack,
    iconColor: '#EA580C',
    code: 6
  },
  7: {
    statusTag: 'Calcium Deficiency',
    pillText: '⚠️ Milk Fever Crisis · Give Calcium Gel >',
    pillColor: '#B91C1C',
    pillBg: '#FEF2F2',
    pillBorder: '#F87171',
    riskTitle: 'Stage 1/2 Hypocalcemia Risk',
    riskSubtitle: 'Postpartum temp drop (<37.8°C) + 95 min lying down + rumination arrest',
    cardBg: '#FEF2F2',
    cardBorder: '#F87171',
    icon: AlertTriangle,
    iconColor: '#B91C1C',
    code: 7
  }
};

export default function AlertBanner({ healthStatus = 0, temp = 38.1, cowName = 'Cow #245', isConnected = true }) {
  let effectiveStatus = Number(healthStatus) || 0;
  const numTemp = Number(temp);

  // Fallback temperature evaluation if no specific event is injected
  if (effectiveStatus < 3) {
    if (numTemp > 39.5) effectiveStatus = 1; // High Fever
    else if (numTemp < 37.8 && numTemp > 0) effectiveStatus = 2; // Low Temp
  }

  const alert = !isConnected ? {
    statusTag: 'Disconnected',
    pillText: '○ Disconnected · Awaiting Collar',
    pillColor: '#64748B',
    pillBg: '#F1F5F9',
    pillBorder: '#CBD5E1',
    riskTitle: 'Device Disconnected',
    riskSubtitle: 'No active BLE collar signal. Connect collar or tap Demo to test.',
    cardBg: '#F8FAFC',
    cardBorder: '#E2E8F0',
    icon: AlertTriangle,
    iconColor: '#64748B'
  } : (ALERTS[effectiveStatus] || ALERTS[0]);

  const IconComponent = alert.icon;

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 1. Cow Profile Quick Alert Strip (Matching Screenshot 2) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '12px 14px',
        border: '1px solid #E6F0EA',
        boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        {/* Cow Avatar & ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={cowImg}
            alt={cowName}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              objectFit: 'cover',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {cowName}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
              HF Cross · Ear Tag #245
            </div>
          </div>
        </div>

        {/* Dynamic Alert Pill (Matching Screenshot 2: "Fever Risk - Check right udder >") */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 12px',
          borderRadius: 14,
          background: alert.pillBg,
          border: `1px solid ${alert.pillBorder}`,
          color: alert.pillColor,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer'
        }}>
          <span>{alert.pillText}</span>
        </div>
      </div>

      {/* 2. Health Status Card (Matching Screenshot 2: "Health Status - Early Infection Risk Probable Mastitis >") */}
      <div style={{
        background: alert.cardBg,
        borderRadius: 20,
        padding: '14px 16px',
        border: `1px solid ${alert.cardBorder}`,
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alert.iconColor,
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            <IconComponent size={22} strokeWidth={2.3} />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Health Status
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: alert.pillColor, lineHeight: 1.2 }}>
              {alert.riskTitle}
            </div>
            <div style={{ fontSize: 12, color: '#475569', fontWeight: 500, marginTop: 2 }}>
              {alert.riskSubtitle}
            </div>
          </div>
        </div>

        <ChevronRight size={20} color={alert.pillColor} />
      </div>
    </div>
  );
}
