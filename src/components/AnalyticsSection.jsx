import React from 'react';
import { Clock, TrendingUp, Share2, Sparkles, MessageCircle } from 'lucide-react';

export default function AnalyticsSection({ selectedCow = 'Lakshmi #104', temp = 38.8, healthStatus = 0 }) {
  const handleWhatsApp = () => {
    const statusText = healthStatus === 1 ? '⚠️ FEVER DETECTED' : healthStatus === 3 ? '🔥 ESTRUS WINDOW OPEN' : healthStatus === 4 ? '🍼 CALVING SOON' : '✅ HEALTHY & NOMINAL';
    const text = encodeURIComponent(
      `🐄 *CowCollar AI — Cattle Health Report*\n` +
      `\n📌 Cattle: ${selectedCow}` +
      `\n🌡️ Body Temp: ${temp}°C` +
      `\n📊 Health Status: ${statusText}` +
      `\n⏱️ Rumination: 8.4 hrs today` +
      `\n🕒 Synced: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` +
      `\n\n_Powered by CowCollar Edge AI System_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const estrusScore = healthStatus === 3 ? 94 : 14;

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* AI Insights Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color="#F59E0B" />
          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Predictive Insights
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Rumination Card */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '12px', border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <Clock size={12} color="#10B981" /> Rumination
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', fontFamily: 'monospace' }}>
              8.4 <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>hrs</span>
            </div>
            <div style={{ fontSize: 10, color: '#059669', fontWeight: 600, marginTop: 4 }}>
              ↑ Healthy digestive rhythm
            </div>
          </div>

          {/* Estrus Probability Card */}
          <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '12px', border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <TrendingUp size={12} color="#F59E0B" /> Estrus Score
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: estrusScore > 80 ? '#D97706' : '#475569', fontFamily: 'monospace' }}>
              {estrusScore}%
            </div>
            <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: `${estrusScore}%`, height: '100%', background: '#F59E0B', borderRadius: 99 }} />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Share Button */}
      <button
        onClick={handleWhatsApp}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 16,
          background: '#10B981',
          color: '#FFFFFF',
          border: 'none',
          fontSize: 14,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
        }}
      >
        <MessageCircle size={18} />
        Send Health Report via WhatsApp
        <Share2 size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />
      </button>
    </div>
  );
}
