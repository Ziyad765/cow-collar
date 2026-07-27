import React, { useRef, useEffect, useState } from 'react';
import { Activity, Heart, Wind } from 'lucide-react';

export default function IcuMonitorStrip({ bpm = 68, spo2 = 98, skinContact = true }) {
  const ecgRef = useRef(null);
  const spo2Ref = useRef(null);
  const ecgAnimRef = useRef(null);
  const spo2AnimRef = useRef(null);
  const ecgBuf = useRef([]);
  const spo2Buf = useRef([]);
  const ecgX = useRef(0);
  const spo2X = useRef(0);

  // Animated counters for smooth UI numbers
  const [displayBpm, setDisplayBpm] = useState(bpm);
  const [displaySpo2, setDisplaySpo2] = useState(spo2);

  useEffect(() => {
    let frame;
    let start = displayBpm;
    let target = skinContact ? bpm : 0;
    const step = () => {
      start += (target - start) * 0.15;
      setDisplayBpm(Math.round(start));
      if (Math.abs(start - target) > 0.5) frame = requestAnimationFrame(step);
      else setDisplayBpm(target);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [bpm, skinContact]);

  useEffect(() => {
    let frame;
    let start = displaySpo2;
    let target = skinContact ? spo2 : 0;
    const step = () => {
      start += (target - start) * 0.15;
      setDisplaySpo2(Math.round(start));
      if (Math.abs(start - target) > 0.5) frame = requestAnimationFrame(step);
      else setDisplaySpo2(target);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spo2, skinContact]);

  // --- Dynamic BPM-driven ECG Waveform ---
  useEffect(() => {
    const canvas = ecgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const CY = H / 2;

    if (ecgBuf.current.length !== W) {
      ecgBuf.current = new Array(W).fill(CY);
    }

    const draw = () => {
      let voltage = 0;
      if (skinContact && bpm > 0) {
        // Calculate beat period in ms dynamically from BPM
        const beatPeriod = (60 / bpm) * 1000;
        const now = performance.now();
        const phase = (now % beatPeriod) / beatPeriod; // 0.0 to 1.0

        // Realistic PQRST complex voltage curve
        if (phase >= 0.10 && phase < 0.20) {
          // P-wave
          voltage = Math.sin(((phase - 0.10) / 0.10) * Math.PI) * 0.15;
        } else if (phase >= 0.30 && phase < 0.32) {
          // Q-dip
          voltage = -0.25;
        } else if (phase >= 0.32 && phase < 0.36) {
          // R-spike
          voltage = 1.0;
        } else if (phase >= 0.36 && phase < 0.39) {
          // S-dip
          voltage = -0.35;
        } else if (phase >= 0.52 && phase < 0.68) {
          // T-wave
          voltage = Math.sin(((phase - 0.52) / 0.16) * Math.PI) * 0.3;
        } else {
          // Isoelectric baseline with tiny physiological noise
          voltage = (Math.random() - 0.5) * 0.03;
        }
      }

      // Scale voltage to canvas height amplitude
      const amplitude = H * 0.35;
      const y = CY - voltage * amplitude;
      ecgBuf.current[ecgX.current] = y;

      // Render Canvas
      ctx.fillStyle = '#090E17';
      ctx.fillRect(0, 0, W, H);

      // Render medical grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 15) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Draw ECG glow trace
      ctx.shadowBlur = skinContact ? 10 : 0;
      ctx.shadowColor = '#10B981';
      ctx.strokeStyle = skinContact ? '#10B981' : '#334155';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < W; i++) {
        const xi = (ecgX.current + 1 + i) % W;
        if (i === 0) ctx.moveTo(i, ecgBuf.current[xi]);
        else ctx.lineTo(i, ecgBuf.current[xi]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw active cursor dot
      if (skinContact) {
        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.arc(ecgX.current, ecgBuf.current[ecgX.current], 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ecgX.current = (ecgX.current + 2) % W;
      ecgAnimRef.current = requestAnimationFrame(draw);
    };

    ecgAnimRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(ecgAnimRef.current);
  }, [bpm, skinContact]);

  // --- Dynamic BPM-driven SpO2 Pleth Waveform ---
  useEffect(() => {
    const canvas = spo2Ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    if (spo2Buf.current.length !== W) {
      spo2Buf.current = new Array(W).fill(H * 0.65);
    }

    const draw = () => {
      let y = H * 0.65;
      if (skinContact && bpm > 0) {
        const beatPeriod = (60 / bpm) * 1000;
        const now = performance.now();
        const phase = (now % beatPeriod) / beatPeriod;
        // Smooth arterial pulse wave shape
        y = H * 0.65 - Math.pow(Math.sin(phase * Math.PI), 2.5) * (H * 0.5);
      }
      spo2Buf.current[spo2X.current] = y;

      ctx.fillStyle = '#090E17';
      ctx.fillRect(0, 0, W, H);

      // Gradient area fill below pleth wave
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, skinContact ? 'rgba(6, 182, 212, 0.25)' : 'rgba(51, 65, 85, 0)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      for (let i = 0; i < W; i++) {
        const xi = (spo2X.current + 1 + i) % W;
        if (i === 0) ctx.moveTo(i, spo2Buf.current[xi]);
        else ctx.lineTo(i, spo2Buf.current[xi]);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Cyan line trace
      ctx.shadowBlur = skinContact ? 8 : 0;
      ctx.shadowColor = '#06B6D4';
      ctx.strokeStyle = skinContact ? '#06B6D4' : '#334155';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < W; i++) {
        const xi = (spo2X.current + 1 + i) % W;
        if (i === 0) ctx.moveTo(i, spo2Buf.current[xi]);
        else ctx.lineTo(i, spo2Buf.current[xi]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      spo2X.current = (spo2X.current + 2) % W;
      spo2AnimRef.current = requestAnimationFrame(draw);
    };

    spo2AnimRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(spo2AnimRef.current);
  }, [bpm, skinContact]);

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #F1F5F9',
          background: '#FAFAFA'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#10B981" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
              Live Physiological Waveforms
            </span>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: skinContact ? '#059669' : '#D97706',
            background: skinContact ? '#ECFDF5' : '#FEF3C7',
            padding: '3px 8px',
            borderRadius: 99,
            border: `1px solid ${skinContact ? '#A7F3D0' : '#FDE68A'}`
          }}>
            {skinContact ? '● Live Dynamic Sync' : '⚠️ Skin Contact Off'}
          </span>
        </div>

        {/* Canvas Monitor Panel */}
        <div style={{ background: '#090E17', padding: '14px 14px 10px' }}>
          {/* ECG Trace Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <canvas ref={ecgRef} width={260} height={60} style={{ width: '100%', height: 60, display: 'block' }} />
            </div>
            <div style={{ minWidth: 68, textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <Heart size={10} fill="#10B981" /> ECG
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: skinContact ? '#34D399' : '#475569', lineHeight: 1, fontFamily: 'monospace' }}>
                {skinContact ? displayBpm : '--'}
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginTop: 2 }}>BPM</div>
            </div>
          </div>

          {/* SpO2 Pleth Wave Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <canvas ref={spo2Ref} width={260} height={42} style={{ width: '100%', height: 42, display: 'block' }} />
            </div>
            <div style={{ minWidth: 68, textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <Wind size={10} /> SpO₂
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: skinContact ? '#22D3EE' : '#475569', lineHeight: 1, fontFamily: 'monospace' }}>
                {skinContact ? `${displaySpo2}%` : '--'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
