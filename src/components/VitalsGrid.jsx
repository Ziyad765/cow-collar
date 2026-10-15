import React, { useRef, useEffect, useState } from 'react';
import { Thermometer, Heart, Wind, Activity, ChevronRight } from 'lucide-react';
import HealthScoreCard from './HealthScoreCard';

function AnimatedNumber({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(value);

  useEffect(() => {
    let frame;
    const animate = () => {
      ref.current += (value - ref.current) * 0.15;
      setDisplay(ref.current);
      if (Math.abs(ref.current - value) > 0.05) frame = requestAnimationFrame(animate);
      else setDisplay(value);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</>;
}

export default function VitalsGrid({
  temp = 38.1,
  bpm = 68,
  spo2 = 98,
  motionState = 1,
  skinContact = true,
  hrv = 0,
  rr = null,
  isLying = false,
  lyingMin = 0,
  healthScore = 0,
  trend = 0,
  ruminationHours = null,
  isConnected = false
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Status evaluations
  const isFever = isConnected && temp !== null && temp > 39.5;
  const isHypothermia = isConnected && temp !== null && temp < 37.8 && temp > 0;
  const tempStatus = !isConnected || temp === null
    ? { label: 'Disconnected', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' }
    : isFever 
    ? { label: 'High Fever', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
    : isHypothermia
    ? { label: 'Low Temp', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }
    : { label: 'Normal', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };

  const isTachy = isConnected && bpm !== null && bpm > 85;
  const bpmStatus = !isConnected || bpm === null
    ? { label: 'Disconnected', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' }
    : isTachy
    ? { label: 'Elevated', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }
    : { label: 'Normal', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };

  const isRespDistress = isConnected && rr !== null && rr > 40;
  const respStatus = !isConnected || rr === null
    ? { label: 'Disconnected', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' }
    : isRespDistress
    ? { label: 'Distress', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
    : { label: 'Normal', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };

  const isLowRumination = isConnected && ruminationHours !== null && ruminationHours < 4.5;
  const ruminationStatus = !isConnected || ruminationHours === null
    ? { label: 'Disconnected', color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' }
    : isLowRumination
    ? { label: 'Reduced', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }
    : { label: 'Good', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 2x2 Grid of Primary Vitals (Matching Screenshot 1 & 2) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        
        {/* 1. Temperature Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          padding: '16px 14px',
          border: '1px solid #E6F0EA',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 124
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: isFever ? '#FEE2E2' : '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFever ? '#DC2626' : '#2E7D32',
              flexShrink: 0
            }}>
              <Thermometer size={20} strokeWidth={2.3} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Temperature
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: tempStatus.color,
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {isConnected && temp !== null ? <><AnimatedNumber value={temp} decimals={1} />°C</> : '-- °C'}
            </span>
            {isFever && <span style={{ fontSize: 16, color: '#DC2626', fontWeight: 800 }}>⬆️</span>}
          </div>

          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: tempStatus.color,
              background: tempStatus.bg,
              border: `1px solid ${tempStatus.border}`,
              padding: '2px 8px',
              borderRadius: 20
            }}>
              {tempStatus.label}
            </span>
          </div>
        </div>

        {/* 2. Heart Rate Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          padding: '16px 14px',
          border: '1px solid #E6F0EA',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 124
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
              flexShrink: 0
            }}>
              <Heart size={20} strokeWidth={2.3} fill="#DC2626" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Heart Rate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: isConnected && skinContact ? '#0F172A' : '#64748B',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {isConnected && bpm !== null && skinContact ? <AnimatedNumber value={bpm} /> : '--'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
              BPM
            </span>
          </div>

          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: bpmStatus.color,
              background: bpmStatus.bg,
              border: `1px solid ${bpmStatus.border}`,
              padding: '2px 8px',
              borderRadius: 20
            }}>
              {bpmStatus.label}
            </span>
          </div>
        </div>

        {/* 3. Respiration Rate Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          padding: '16px 14px',
          border: '1px solid #E6F0EA',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 124
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
              flexShrink: 0
            }}>
              <Wind size={20} strokeWidth={2.3} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Respiration
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: respStatus.color,
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {isConnected && rr !== null ? rr : '--'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
              /min
            </span>
          </div>

          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: respStatus.color,
              background: respStatus.bg,
              border: `1px solid ${respStatus.border}`,
              padding: '2px 8px',
              borderRadius: 20
            }}>
              {respStatus.label}
            </span>
          </div>
        </div>

        {/* 4. Rumination Hours Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 22,
          padding: '16px 14px',
          border: '1px solid #E6F0EA',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 124
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0
            }}>
              <span style={{ fontSize: 18 }}>🌱</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Rumination
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0F172A',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {isConnected && ruminationHours !== null ? ruminationHours.toFixed(1) : '--'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
              hrs
            </span>
          </div>

          <div>
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: ruminationStatus.color,
              background: ruminationStatus.bg,
              border: `1px solid ${ruminationStatus.border}`,
              padding: '2px 8px',
              borderRadius: 20
            }}>
              {ruminationStatus.label}
            </span>
          </div>
        </div>

      </div>

      {/* 5. Full-Width Posture & Resting Card (Matching Screenshot 1) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 22,
        padding: '16px 18px',
        border: '1px solid #E6F0EA',
        boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Standing / Lying Cow Graphic Silhouette */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: isConnected && isLying ? '#F3E8FF' : '#E8F5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26
          }}>
            {!isConnected ? '○' : isLying ? '🛌' : '🐄'}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Posture
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {isConnected ? (isLying ? 'Lying Down' : 'Standing') : '--'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              {isConnected ? (isLying ? `${lyingMin} min resting this hour` : 'Active grazing & movement') : 'Awaiting collar signal'}
            </div>
          </div>
        </div>

        <div>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: isConnected ? (isLying ? '#7C3AED' : '#059669') : '#64748B',
            background: isConnected ? (isLying ? '#F5F3FF' : '#ECFDF5') : '#F1F5F9',
            border: `1px solid ${isConnected ? (isLying ? '#DDD6FE' : '#A7F3D0') : '#CBD5E1'}`,
            padding: '6px 14px',
            borderRadius: 20
          }}>
            {isConnected ? (isLying ? 'Resting' : 'Active') : 'Unattached'}
          </span>
        </div>
      </div>

      {/* Toggle Button for ICU Waveforms & Advanced Diagnostics */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: '#059669',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {showAdvanced ? 'Hide Advanced ICU Telemetry ▲' : 'View Composite Health Score & Advanced Metrics ▼'}
        </button>
      </div>

      {/* Advanced Telemetry Drawer (Health Score, SpO2, HRV) */}
      {showAdvanced && (
        <div style={{ animation: 'fadeUp 0.25s ease forwards' }}>
          <HealthScoreCard score={healthScore} trend={trend} skinContact={skinContact} />
        </div>
      )}
    </div>
  );
}
