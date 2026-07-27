import React, { useState, useEffect } from 'react';
import { Terminal, Trash2, Copy, Check, Filter } from 'lucide-react';
import { bleService } from '../services/bleService';

export default function LogsSection() {
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLogs(bleService.getPacketLogs());
    const unsubscribe = bleService.onPacketLog((newLogs) => {
      setLogs([...newLogs]);
    });
    return () => unsubscribe();
  }, []);

  const handleClear = () => {
    bleService.clearLogs();
  };

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${l.rawPayload ? '| ' + l.rawPayload : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(l => {
    if (filter === 'stream') return l.type === 'stream';
    if (filter === 'events') return l.type === 'info' || l.type === 'success' || l.type === 'warning' || l.type === 'error';
    if (filter === 'sync') return l.type === 'sync';
    return true;
  });

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)'
      }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Terminal size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>System & Sensor Data Logs</h3>
              <p style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Live BLE packets & SPIFFS flash logs ({filteredLogs.length})</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleCopy}
              disabled={logs.length === 0}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: copied ? '#ECFDF5' : '#F8FAFC',
                border: `1px solid ${copied ? '#A7F3D0' : '#E2E8F0'}`,
                color: copied ? '#059669' : '#475569',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleClear}
              disabled={logs.length === 0}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#EF4444',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={12} />
              Clear
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'stream', label: '⚡ Live Stream' },
            { id: 'events', label: '📡 BLE Events' },
            { id: 'sync', label: '💾 Flash Sync' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 99,
                border: 'none',
                background: filter === f.id ? '#10B981' : '#F1F5F9',
                color: filter === f.id ? '#FFFFFF' : '#64748B',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Console Logs Terminal Window */}
        <div style={{
          height: 180,
          background: '#090E17',
          borderRadius: 12,
          padding: '10px 12px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: 11,
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ color: '#475569', textAlign: 'center', marginTop: 70, fontSize: 12 }}>
              No log entries recorded yet. Connect collar to view live stream.
            </div>
          ) : (
            filteredLogs.map(log => {
              let tagColor = '#94A3B8';
              let tagBg = 'rgba(255, 255, 255, 0.06)';
              if (log.type === 'stream') { tagColor = '#34D399'; tagBg = 'rgba(52, 211, 153, 0.15)'; }
              else if (log.type === 'success') { tagColor = '#60A5FA'; tagBg = 'rgba(96, 165, 250, 0.15)'; }
              else if (log.type === 'warning') { tagColor = '#FBBF24'; tagBg = 'rgba(251, 191, 36, 0.15)'; }
              else if (log.type === 'error') { tagColor = '#F87171'; tagBg = 'rgba(248, 113, 113, 0.15)'; }
              else if (log.type === 'sync') { tagColor = '#C084FC'; tagBg = 'rgba(192, 132, 252, 0.15)'; }

              return (
                <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#64748B', fontSize: 10 }}>[{log.timestamp}]</span>
                    <span style={{ color: tagColor, background: tagBg, padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>
                      {log.type}
                    </span>
                    <span style={{ color: '#E2E8F0', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.message}
                    </span>
                  </div>
                  {log.rawPayload && (
                    <div style={{ color: '#475569', fontSize: 10, paddingLeft: 12, wordBreak: 'break-all' }}>
                      RAW JSON: {log.rawPayload}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
