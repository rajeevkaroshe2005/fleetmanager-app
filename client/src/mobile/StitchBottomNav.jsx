import React from 'react';
import { Truck, ShieldAlert, FileText, SlidersHorizontal } from 'lucide-react';

export function StitchBottomNav({ currentTab, onNavigate, stats }) {
  const urgentCount = (stats?.expiredDocuments || 0) + (stats?.expiresTomorrow || 0) + (stats?.expires2Days || 0);

  const tabs = [
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'radar', label: 'Live Radar', icon: ShieldAlert, badge: urgentCount },
    { id: 'docs', label: 'Compliance', icon: FileText },
    { id: 'ops', label: 'Operations', icon: SlidersHorizontal }
  ];

  return (
    <nav className="stitch-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`stitch-nav-item ${isActive ? 'active' : ''}`}
            aria-label={tab.label}
          >
            <div className="relative flex items-center justify-center">
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse shadow-md shadow-rose-500/50">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
