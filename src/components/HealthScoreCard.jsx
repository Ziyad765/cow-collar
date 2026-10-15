import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const getScoreGrade = (score, skinContact) => {
  if (!skinContact || score <= 0) {
    return { label: 'Unattached', color: '#94A3B8', bg: '#F1F5F9', border: '#CBD5E1', desc: 'Awaiting skin contact data' };
  }
  if (score >= 85) {
    return { label: 'Optimal / Prime', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', desc: 'All biological vitals within ideal physiological ranges.' };
  }
  if (score >= 70) {
    return { label: 'Good Health', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4', desc: 'Stable condition. Minor non-critical baseline variations.' };
  }
  if (score >= 55) {
    return { label: 'Needs Attention', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Mild vitals deviation detected (temp or stress indicator).' };
  }
  if (score >= 40) {
    return { label: 'Suspect Illness', color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5', desc: 'Significant physiological distress. Veterinary examination advised.' };
  }
  return { label: 'Critical Alert', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Severe multi-vital abnormality. Immediate intervention required!' };
};

const getTrendInfo = (trendCode) => {
  switch (trendCode) {
    case 1:
      return { label: 'Body Temp Rising', icon: TrendingUp, color: '#DC2626', bg: '#FEE2E2' };
    case 2:
      return { label: 'Activity Dropping', icon: TrendingDown, color: '#D97706', bg: '#FEF3C7' };
    case 3:
      return { label: 'HRV Autonomic Stress', icon: AlertTriangle, color: '#EA580C', bg: '#FFEDD5' };
    default:
      return { label: 'Vital Trends Stable', icon: ShieldCheck, color: '#059669', bg: '#D1FAE5' };
  }
};

export default function HealthScoreCard({ score = 100, trend = 0, skinContact = true }) {
  const grade = getScoreGrade(score, skinContact);
  const trendInfo = getTrendInfo(trend);
  const TrendIcon = trendInfo.icon;

  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = skinContact && score > 0
    ? circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference
    : circumference;

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 20,
      padding: '20px 18px',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      border: `1px solid ${grade.border}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: grade.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: grade.color
          }}>
            <Activity size={18} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Composite Health Index
          </span>
        </div>

        {/* Live Status Badge */}
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: grade.color,
          background: grade.bg,
          padding: '4px 10px',
          borderRadius: 20,
          border: `1px solid ${grade.border}`
        }}>
          {grade.label}
        </span>
      </div>

      {/* Main Gauge & Score Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
        {/* Radial SVG Gauge */}
        <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
          <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="8"
            />
            {/* Value Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={grade.color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: skinContact ? grade.color : '#94A3B8',
              lineHeight: 1,
              fontFamily: 'monospace'
            }}>
              {skinContact && score > 0 ? score : '—'}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginTop: 2 }}>
              out of 100
            </span>
          </div>
        </div>

        {/* Breakdown & Clinical Insights */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
            Multi-Vital AI Analysis
          </div>
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, marginBottom: 8 }}>
            {grade.desc}
          </div>

          {/* Trend Alert Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 12,
            background: trendInfo.bg,
            color: trendInfo.color,
            fontSize: 11,
            fontWeight: 700
          }}>
            <TrendIcon size={14} />
            <span>{trendInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Sub-bar explaining composition */}
      <div style={{
        paddingTop: 10,
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: 600
      }}>
        <span>Integrates: Temp (30%)</span>
        <span>•</span>
        <span>SpO2 (25%)</span>
        <span>•</span>
        <span>HRV (20%)</span>
        <span>•</span>
        <span>Respiration (15%)</span>
        <span>•</span>
        <span>Posture (10%)</span>
      </div>
    </div>
  );
}
