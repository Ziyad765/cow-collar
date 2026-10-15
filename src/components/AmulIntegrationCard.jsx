import React from 'react';
import { Database, ShieldCheck, HeartPulse, Activity, CheckCircle, ArrowRight } from 'lucide-react';

export default function AmulIntegrationCard({ 
  cowId = '245', 
  breed = 'Holstein Friesian Cross', 
  owner = 'Rajesh K. (Kochi Union)', 
  milkToday = '14.2 L', 
  fat = '3.8%', 
  snf = '8.6%' 
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 24,
      padding: '20px',
      margin: '0 16px',
      border: '1px solid #E6F0EA',
      boxShadow: '0 8px 24px -4px rgba(6, 78, 59, 0.06)'
    }}>
      {/* Header with Cooperative Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#F0FDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <Database size={18} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Cooperative Data Hub
            </div>
            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
              MILMA · AMUL · NDDB INAPH
            </div>
          </div>
        </div>

        {/* Cooperative Brand Pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: '#DC2626', color: '#fff' }}>
            Amul
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: '#0284C7', color: '#fff' }}>
            milma
          </span>
          <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: '#166534', color: '#fff' }}>
            NDDB
          </span>
        </div>
      </div>

      {/* Side-by-Side: Amul Historical Brain + CowCollar Live Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {/* Left: What Amul/Milma Knows */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 16,
          padding: '12px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🏛️</span> Milk Society Records
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
            Cow #{cowId} · {breed}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
            Owner: {owner}
          </div>
          
          <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>TODAY'S MILK</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0284C7' }}>{milkToday}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>FAT / SNF</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{fat} / {snf}</div>
            </div>
          </div>
        </div>

        {/* Right: What CowCollar AI Adds */}
        <div style={{
          background: '#F0FDF4',
          borderRadius: 16,
          padding: '12px',
          border: '1px solid #BBF7D0'
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📡</span> Live Collar Signals
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
            ✓ Core Temp: 38.1°C (Safe)
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
            ✓ Pulse: 68 BPM (Normal)
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 6 }}>
            ✓ Chewing: 6.2 hrs/day
          </div>

          <div style={{ borderTop: '1px dashed #A7F3D0', paddingTop: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#047857' }}>
              ● Zero Infection Anomaly
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Integration Pitch Banner (Matching Slide 8) */}
      <div style={{
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
        borderRadius: 16,
        padding: '12px 14px',
        color: '#FFFFFF'
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>
          🤝 Complementary Animal Intelligence
        </div>
        <p style={{ fontSize: 11, color: '#D1FAE5', lineHeight: 1.4, margin: 0 }}>
          "Amul has the digital brain; CowCollar AI adds continuous eyes and ears on the cow."
        </p>
      </div>
    </div>
  );
}
