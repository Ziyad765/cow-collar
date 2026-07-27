import React, { useRef, useEffect, useState } from 'react';
import { Thermometer, Heart, Wind, Activity } from 'lucide-react';

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

const MOTION_MAP = {
  0: { label: 'Resting', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', emoji: '💤' },
  1: { label: 'Ruminating', color: '#06B6D4', bg: '#CFFAFE', border: '#A5F3FC', emoji: '🐄' },
  2: { label: 'Walking', color: '#8B5CF6', bg: '#F3E8FF', border: '#DDD6FE', emoji: '🚶' },
  3: { label: 'Restless', color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A', emoji: '⚡' },
};

export default function VitalsGrid({ temp = 38.8, bpm = 68, spo2 = 98, motionState = 1, skinContact = true }) {
  const motion = MOTION_MAP[motionState] || MOTION_MAP[0];
  const tempPct = Math.min(100, Math.max(0, ((temp - 37.0) / 4.0) * 100));

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 2-Column Primary Vitals Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Temperature Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
              <Thermometer size={18} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Body Temp
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: temp > 39.5 ? '#EF4444' : temp < 38.0 ? '#3B82F6' : '#0F172A', fontFamily: 'monospace' }}>
              <AnimatedNumber value={temp} decimals={1} />
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>°C</span>
          </div>

          {/* Temperature Range Bar */}
          <div style={{ width: '100%', height: 5, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              width: `${tempPct}%`,
              height: '100%',
              background: temp > 39.5 ? '#EF4444' : '#10B981',
              borderRadius: 99,
              transition: 'width 0.5s ease'
            }} />
          </div>

          <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Normal: 38.5 – 39.5°C</div>
        </div>

        {/* Heart Rate / Pulse Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <Heart size={18} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Pulse Rate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: skinContact ? '#0F172A' : '#94A3B8', fontFamily: 'monospace' }}>
              {skinContact ? <AnimatedNumber value={bpm} /> : '--'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>BPM</span>
          </div>

          <div style={{ width: '100%', height: 5, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              width: skinContact ? `${Math.min(100, (bpm / 120) * 100)}%` : '0%',
              height: '100%',
              background: '#10B981',
              borderRadius: 99,
              transition: 'width 0.5s ease'
            }} />
          </div>

          <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Normal: 60 – 80 BPM</div>
        </div>
      </div>

      {/* Edge AI Posture State Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: motion.bg,
              border: `1px solid ${motion.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              {skinContact ? motion.emoji : '❓'}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Edge AI Posture Classifier
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: skinContact ? motion.color : '#94A3B8', letterSpacing: '-0.01em' }}>
                {skinContact ? motion.label : 'Sensor Unattached'}
              </div>
            </div>
          </div>

          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#059669',
            background: '#ECFDF5',
            padding: '4px 9px',
            borderRadius: 99,
            border: '1px solid #A7F3D0'
          }}>
            50Hz Accelerometer
          </span>
        </div>

        {/* State Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {Object.entries(MOTION_MAP).map(([key, m]) => {
            const isActive = skinContact && parseInt(key) === motionState;
            return (
              <div key={key} style={{
                padding: '8px 4px',
                borderRadius: 10,
                textAlign: 'center',
                background: isActive ? m.bg : '#F8FAFC',
                border: `1px solid ${isActive ? m.border : '#E2E8F0'}`,
                fontSize: 11,
                fontWeight: 700,
                color: isActive ? m.color : '#94A3B8',
                transition: 'all 0.2s ease'
              }}>
                {m.emoji} {m.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
