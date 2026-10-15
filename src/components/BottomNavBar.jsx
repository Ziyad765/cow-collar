import React from 'react';
import { Home, Bell, Grid, Activity } from 'lucide-react';

export default function BottomNavBar({ activeTab = 'home', onSelectTab, alertCount = 3 }) {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => <Home size={22} color={active ? '#059669' : '#64748B'} strokeWidth={active ? 2.5 : 2} />
    },
    {
      id: 'cows',
      label: 'Cows',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 8C4 5 6 3 8 3C9 5 9 6 8 8C7 7 6 7 5 8Z" fill={active ? '#059669' : '#94A3B8'} />
          <path d="M19 8C20 5 18 3 16 3C15 5 15 6 16 8C17 7 18 7 19 8Z" fill={active ? '#059669' : '#94A3B8'} />
          <path d="M6 9C6 7 8 5 12 5C16 5 18 7 18 9V14C18 17 15.5 19 12 19C8.5 19 6 17 6 14V9Z" stroke={active ? '#059669' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="11" r="1" fill={active ? '#059669' : '#64748B'}/>
          <circle cx="15" cy="11" r="1" fill={active ? '#059669' : '#64748B'}/>
        </svg>
      )
    },
    {
      id: 'alerts',
      label: 'Alerts',
      badge: alertCount,
      icon: (active) => <Bell size={22} color={active ? '#059669' : '#64748B'} strokeWidth={active ? 2.5 : 2} />
    },
    {
      id: 'more',
      label: 'More',
      icon: (active) => <Grid size={22} color={active ? '#059669' : '#64748B'} strokeWidth={active ? 2.5 : 2} />
    }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 440,
      background: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      paddingTop: 8,
      paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 8px), 12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 60,
      boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.06)'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 14px'
            }}
          >
            <div style={{ position: 'relative' }}>
              {tab.icon(isActive)}
              {tab.badge && tab.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 800,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF'
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 800 : 600,
              color: isActive ? '#059669' : '#64748B'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
