import React, { useState } from 'react';
import { ShieldAlert, Flame, Baby, AlertTriangle, Wind, Activity, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

const CONDITIONS = [
  {
    id: 1,
    title: '48-Hour Early Fever Alert',
    tag: 'Mastitis · Babesiosis · Foot Rot',
    icon: ShieldAlert,
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    metric: '39.5°C+',
    metricLabel: 'Internal Fever Threshold',
    desc: 'Continuous core temperature flags systemic infection 2 full days before visible udder swelling or milk drop.',
    action: 'Allows veterinarians to prescribe mild anti-inflammatories, avoiding expensive antibiotics & lost milk.'
  },
  {
    id: 2,
    title: 'Exact Estrus (Heat) Window',
    tag: 'Artificial Insemination Timing',
    icon: Flame,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
    metric: '+180%',
    metricLabel: 'Restlessness Motion Spike',
    desc: 'Correlates hyperactivity with a subtle 0.3°C temperature shift to pinpoint the optimal 12-hour breeding window.',
    action: 'Doubles conception success rate, saving ₹7,500 by preventing 21 wasted open days.'
  },
  {
    id: 3,
    title: 'Calving Pre-Delivery Alert',
    tag: 'Pre-Partum Safe Delivery',
    icon: Baby,
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    metric: '-0.6°C',
    metricLabel: 'Pre-Labor Temp Drop',
    desc: 'Detects the biological hypothermia dip that occurs 12–24 hours before calf birth, coupled with labor restlessness.',
    action: 'Ensures the farmer is present during delivery, preventing dystocia and calf mortality.'
  },
  {
    id: 4,
    title: 'Calcium Deficiency (Milk Fever)',
    tag: 'Downer Cow Emergency Warning',
    icon: AlertTriangle,
    iconColor: '#B91C1C',
    iconBg: '#FEE2E2',
    metric: '<37.8°C',
    metricLabel: 'Temp Dip + >90m Lying',
    desc: 'Postpartum calcium drain causes immediate muscle weakness, cessation of rumination, and sternal recumbency.',
    action: 'Alerts the farmer to administer oral calcium gel or IV borogluconate before permanent paralysis occurs!'
  },
  {
    id: 5,
    title: 'Respiratory Distress & Heat Stress',
    tag: 'Pneumonia · Bovine Respiratory (BRD)',
    icon: Wind,
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    metric: '>40 /min',
    metricLabel: 'Tachypnea & SpO2 <90%',
    desc: 'Tracks elevated breathing rate from PPG baseline modulations paired with depressed blood oxygen saturation.',
    action: 'Flags acute lung inflammation and high-humidity heat exhaustion during Kerala monsoons.'
  },
  {
    id: 6,
    title: 'Rumination & Digestive Disorders',
    tag: 'Ketosis · Subacute Acidosis (SARA)',
    icon: Activity,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    metric: '-60%',
    metricLabel: 'Chewing Time Deficit',
    desc: 'Monitors daily rumination hours (normal: 6-8 hrs). Sharp drops indicate rumen motility stoppage or ketosis.',
    action: 'Detects metabolic imbalances in early lactation days before physical weakness or milk yield loss.'
  }
];

export default function ClinicalDiagnosticSection() {
  const [expandedId, setExpandedId] = useState(4); // Default expand Milk Fever to highlight the new feature!

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 24,
      padding: '20px',
      margin: '0 16px',
      border: '1px solid #E6F0EA',
      boxShadow: '0 8px 24px -4px rgba(6, 78, 59, 0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: '#ECFDF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#059669'
        }}>
          <Stethoscope size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            Comprehensive Health Intelligence
          </h3>
          <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>
            What CowCollar AI detects days before visible illness
          </p>
        </div>
      </div>

      {/* Accordion / Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CONDITIONS.map(cond => {
          const isExpanded = expandedId === cond.id;
          const Icon = cond.icon;

          return (
            <div
              key={cond.id}
              onClick={() => setExpandedId(isExpanded ? null : cond.id)}
              style={{
                borderRadius: 16,
                padding: '12px 14px',
                background: isExpanded ? cond.iconBg : '#F8FAFC',
                border: `1px solid ${isExpanded ? cond.iconColor + '40' : '#E2E8F0'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cond.iconColor,
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    <Icon size={18} strokeWidth={2.3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      {cond.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                      {cond.tag}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: cond.iconColor,
                    background: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontFamily: 'monospace'
                  }}>
                    {cond.metric}
                  </span>
                  {isExpanded ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid ' + cond.iconColor + '20' }}>
                  <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.4, marginBottom: 6 }}>
                    {cond.desc}
                  </p>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: cond.iconColor,
                    background: '#FFFFFF',
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: `1px solid ${cond.iconColor}30`
                  }}>
                    💡 Action: {cond.action}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
