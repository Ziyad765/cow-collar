import React from 'react';
import { Activity, Clock, Flame, Heart, Moon, ShieldCheck, Sparkles, Sun, Thermometer, Footprints } from 'lucide-react';

export default function DailyStatsSection({ timelineData = [] }) {
  if (!timelineData || timelineData.length === 0) return null;

  // 1. Calculate 24-Hour Aggregated Statistics
  const totalSamples = timelineData.length;
  // Scale samples to 24-hour day
  const sampleDurationHours = 24 / Math.max(1, totalSamples);

  let tempSum = 0;
  let minTemp = 999;
  let maxTemp = -999;

  let bpmSum = 0;
  let spo2Sum = 0;
  let validBpmCount = 0;

  let restSamples = 0;       // motion 0
  let ruminateSamples = 0;   // motion 1
  let walkSamples = 0;       // motion 2
  let estrusSamples = 0;     // motion 3

  let feverAlerts = 0;
  let estrusAlerts = 0;

  timelineData.forEach((record) => {
    const t = Number(record.temp) || 38.5;
    tempSum += t;
    if (t < minTemp) minTemp = t;
    if (t > maxTemp) maxTemp = t;

    const bpm = Number(record.bpm) || 68;
    if (bpm > 0) {
      bpmSum += bpm;
      validBpmCount++;
    }

    const spo2 = Number(record.spo2) || 98;
    if (spo2 > 0) spo2Sum += spo2;

    const motion = Number(record.motion) ?? 1;
    if (motion === 0) restSamples++;
    else if (motion === 1) ruminateSamples++;
    else if (motion === 2) walkSamples++;
    else if (motion === 3) estrusSamples++;

    if (record.health === 1 || t > 39.5) feverAlerts++;
    if (record.health === 3 || motion === 3) estrusAlerts++;
  });

  const avgTemp = +(tempSum / totalSamples).toFixed(2);
  const avgBpm = validBpmCount > 0 ? Math.round(bpmSum / validBpmCount) : 68;
  const avgSpo2 = validBpmCount > 0 ? Math.round(spo2Sum / validBpmCount) : 98;

  // Proportional 24-Hour Behavioral Hour Allocation (Guarantees smooth, stable 24h total)
  const restRatio = restSamples / totalSamples;
  const ruminateRatio = ruminateSamples / totalSamples;
  const walkRatio = walkSamples / totalSamples;
  const estrusRatio = estrusSamples / totalSamples;

  const restHours = +(restRatio * 24.0).toFixed(1);
  const ruminateHours = +(ruminateRatio * 24.0).toFixed(1);
  const walkHours = +(walkRatio * 24.0).toFixed(1);
  const estrusHours = +(estrusRatio * 24.0).toFixed(1);

  // Calibrated Movement Index & Step Count (0 - 4,500 realistic daily range)
  const estimatedSteps = Math.round(walkHours * 650 + estrusHours * 1400 + ruminateHours * 80);

  // Health Score Calculation (0 - 100)
  let healthScore = 100;
  if (feverAlerts > 0) healthScore -= 25;
  if (avgTemp > 39.2 || avgTemp < 38.0) healthScore -= 15;
  if (ruminateHours < 6.0) healthScore -= 15; // Low rumination penalty
  if (estrusAlerts > 0) healthScore -= 5;     // Active heat window
  healthScore = Math.max(35, Math.min(100, healthScore));

  const getScoreColor = (score) => {
    if (score >= 85) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', label: 'OPTIMAL HEALTH' };
    if (score >= 70) return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', label: 'MODERATE MONITORING' };
    return { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5', label: 'ATTENTION REQUIRED' };
  };

  const statusBadge = getScoreColor(healthScore);

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 24-Hour Smartwatch Health Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderRadius: 22,
        padding: '18px 16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
      }}>
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4F46E5'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                1-Day Cow Health Statistics
              </h3>
              <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                24-Hour Smartwatch Flash Memory Sync
              </p>
            </div>
          </div>

          <div style={{
            background: statusBadge.bg,
            color: statusBadge.text,
            border: `1px solid ${statusBadge.border}`,
            padding: '4px 10px',
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.04em'
          }}>
            {statusBadge.label}
          </div>
        </div>

        {/* Health Score Gauge & Quick Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr',
          gap: 12,
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '14px',
          border: '1px solid #F1F5F9',
          marginBottom: 14
        }}>
          {/* Health Index Ring */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F8FAFC',
            borderRadius: 14,
            padding: '10px',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: statusBadge.text, lineHeight: 1, fontFamily: 'monospace' }}>
              {healthScore}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
              WELLNESS INDEX
            </div>
            <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>
              Out of 100
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Thermometer size={12} color="#EF4444" /> Avg Temp
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', marginTop: 2 }}>
                {avgTemp}°C
              </div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 500 }}>
                Range: {minTemp.toFixed(1)} - {maxTemp.toFixed(1)}°C
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Heart size={12} color="#EC4899" /> Avg Pulse
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', marginTop: 2 }}>
                {avgBpm} <span style={{ fontSize: 10, color: '#64748B' }}>BPM</span>
              </div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 500 }}>
                SpO2: {avgSpo2}%
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: 10, border: '1px solid #F1F5F9', gridColumn: 'span 2' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Footprints size={12} color="#6366F1" /> Total Movement Index
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#4F46E5', fontFamily: 'monospace', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{estimatedSteps.toLocaleString()} <span style={{ fontSize: 10, color: '#64748B' }}>movement points</span></span>
                <span style={{ fontSize: 10, background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                  Active Grazing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Activity & Rumination Breakdown */}
        <h4 style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          24-Hour Activity & Behavioral Breakdown
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {/* Rumination Card (Crucial for Cattle) */}
          <div style={{ background: '#ECFDF5', borderRadius: 12, padding: '10px 12px', border: '1px solid #A7F3D0' }}>
            <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              🌿 Rumination (Cud Chewing)
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#047857', fontFamily: 'monospace', marginTop: 4 }}>
              {ruminateHours} <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>hrs</span>
            </div>
            <div style={{ fontSize: 10, color: '#059669', fontWeight: 500, marginTop: 2 }}>
              {Math.round((ruminateHours / 24) * 100)}% of 24h day (Target: 7-9h)
            </div>
          </div>

          {/* Resting / Sleeping Card */}
          <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '10px 12px', border: '1px solid #C7D2FE' }}>
            <div style={{ fontSize: 10, color: '#4338CA', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Moon size={12} /> Sleep & Resting
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#3730A3', fontFamily: 'monospace', marginTop: 4 }}>
              {restHours} <span style={{ fontSize: 11, fontWeight: 600, color: '#4338CA' }}>hrs</span>
            </div>
            <div style={{ fontSize: 10, color: '#4338CA', fontWeight: 500, marginTop: 2 }}>
              {Math.round((restHours / 24) * 100)}% of 24h day
            </div>
          </div>

          {/* Walking / Grazing Card */}
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sun size={12} color="#F59E0B" /> Walking & Grazing
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', marginTop: 4 }}>
              {walkHours} <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>hrs</span>
            </div>
          </div>

          {/* Active / Estrus Heat Card */}
          <div style={{ background: estrusHours > 1 ? '#FEF3C7' : '#F8FAFC', borderRadius: 12, padding: '10px 12px', border: `1px solid ${estrusHours > 1 ? '#FDE68A' : '#E2E8F0'}` }}>
            <div style={{ fontSize: 10, color: estrusHours > 1 ? '#B45309' : '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Flame size={12} color={estrusHours > 1 ? '#D97706' : '#94A3B8'} /> Active / Estrus Heat
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: estrusHours > 1 ? '#92400E' : '#0F172A', fontFamily: 'monospace', marginTop: 4 }}>
              {estrusHours} <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>hrs</span>
            </div>
          </div>
        </div>

        {/* Dynamic 24-Hour AI Clinical Analysis Summary */}
        <div style={{
          background: '#F1F5F9',
          borderRadius: 14,
          padding: '12px 14px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start'
        }}>
          <Sparkles size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
            <strong style={{ color: '#0F172A', fontWeight: 700 }}>24-Hour AI Medical Analysis: </strong>
            {feverAlerts > 0 ? (
              <span>⚠️ Elevated body temperature detected over the last 24 hours (peak {maxTemp.toFixed(1)}°C). Recommend clinical inspection for mastitis or infection.</span>
            ) : estrusAlerts > 0 ? (
              <span>🔥 Estrus heat window detected during the last 24-hour cycle. High motility & elevated body temp ({avgTemp}°C) indicates optimal artificial insemination window.</span>
            ) : ruminateHours < 6.0 ? (
              <span>⚠️ Rumination hours ({ruminateHours}h) are below optimal range (7-9h). Monitor feed intake and digestive rhythm.</span>
            ) : (
              <span>✅ Excellent 24-hour health score ({healthScore}/100). Normal rumination rhythm ({ruminateHours} hrs) and stable body temperature baseline ({avgTemp}°C).</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
