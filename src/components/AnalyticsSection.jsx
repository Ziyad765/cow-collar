import React from 'react';
import { MessageCircle, Share2, Sparkles, Clock, TrendingUp, Stethoscope, CheckCircle } from 'lucide-react';

export default function AnalyticsSection({
  selectedCow = 'Cow #245',
  temp = null,
  bpm = null,
  rr = null,
  ruminationHours = null,
  isLying = false,
  healthStatus = 0,
  isConnected = false
}) {
  const isFever = isConnected && (healthStatus === 1 || (temp !== null && temp > 39.5));
  const isEstrus = isConnected && healthStatus === 3;
  const isCalving = isConnected && healthStatus === 4;
  const isMilkFever = isConnected && healthStatus === 7;
  const isResp = isConnected && (healthStatus === 5 || (rr !== null && rr > 40));

  const getOverallStatus = () => {
    if (!isConnected) return '○ Collar Disconnected · Awaiting live signal';
    if (isFever) return '⚠️ Fever Risk - Early Subclinical Mastitis pattern detected.';
    if (isEstrus) return '🔥 Estrus Peak - 12-Hour Artificial Insemination window active.';
    if (isCalving) return '🍼 Calving Imminent - Temp drop 0.6°C detected (12-24h delivery window).';
    if (isMilkFever) return '🚨 CRITICAL: Calcium Deficiency (Milk Fever) suspected. Immediate Calcium Gel advised!';
    if (isResp) return '🫁 Respiratory Distress - Elevated breathing rate (>40/min).';
    return '✅ Normal - All biological vitals within healthy baseline ranges.';
  };

  const tempStr = isConnected && temp !== null ? `${temp}°C` : '--';
  const bpmStr = isConnected && bpm !== null ? `${bpm} BPM` : '--';
  const rrStr = isConnected && rr !== null ? `${rr} /min` : '--';
  const rumStr = isConnected && ruminationHours !== null ? `${ruminationHours.toFixed(1)} hrs` : '--';
  const postureStr = isConnected ? (isLying ? 'Lying Down (Resting)' : 'Standing (Active)') : '--';

  const handleWhatsApp = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const message = 
      `*CowCollar AI*\n` +
      `*Health Report — ${selectedCow}*\n\n` +
      `📌 *Cow ID:* 245 (HF Cross)\n` +
      `🕒 *Date:* ${dateStr}\n\n` +
      `🌡️ *Temperature:* ${tempStr} (${isFever ? 'High Fever Alert!' : isConnected ? 'Normal' : 'Disconnected'})\n` +
      `💓 *Heart Rate:* ${bpmStr}\n` +
      `🫁 *Respiration:* ${rrStr} (${isResp ? 'Elevated Distress' : isConnected ? 'Normal' : 'Disconnected'})\n` +
      `🌱 *Rumination:* ${rumStr}\n` +
      `🐄 *Posture:* ${postureStr}\n\n` +
      `📋 *Overall Diagnosis:*\n` +
      `${getOverallStatus()}\n\n` +
      `_Report generated via CowCollar AI Edge Intelligence System_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* WhatsApp Veterinary Report Card (Matching Slide 11) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 22,
        padding: '18px',
        border: '1px solid #E6F0EA',
        boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803D'
            }}>
              <MessageCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                1-Tap WhatsApp Summary
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                Send instant clinical report to local veterinarian
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '2px 8px', borderRadius: 99 }}>
            Slide 11 Verified
          </span>
        </div>

        {/* WhatsApp Message Preview Box */}
        <div style={{
          background: '#F0FDF4',
          borderRadius: 14,
          padding: '12px 14px',
          border: '1px solid #BBF7D0',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#14532D',
          lineHeight: 1.5,
          marginBottom: 14
        }}>
          <div><strong>CowCollar AI Health Report — {selectedCow}</strong></div>
          <div style={{ color: '#4B5563', fontSize: 10, margin: '2px 0 6px' }}>Date: Today, Just now</div>
          <div>🌡️ Temperature: {tempStr} {isFever ? '(High Alert)' : isConnected ? '(Normal)' : ''}</div>
          <div>💓 Heart Rate: {bpmStr}</div>
          <div>🫁 Respiration: {rrStr}</div>
          <div>🌱 Rumination: {rumStr}</div>
          <div>🐄 Posture: {postureStr}</div>
          <div style={{ marginTop: 6, fontWeight: 700, color: isFever ? '#B91C1C' : isConnected ? '#15803D' : '#64748B' }}>
            Overall: {getOverallStatus()}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleWhatsApp}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
          }}
        >
          <MessageCircle size={18} />
          Send to Veterinarian via WhatsApp
          <Share2 size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />
        </button>
      </div>
    </div>
  );
}
