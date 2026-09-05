import React from 'react';
import { LayoutDashboard, Truck, FileText, Users, IndianRupee } from 'lucide-react';

export function MobileNav({ currentTab, onNavigate, stats }) {
  const urgentCount = (stats?.expiredDocuments || 0) + (stats?.expiresTomorrow || 0) + (stats?.expires2Days || 0);

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'documents', label: 'Documents', icon: FileText, badge: urgentCount },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
  ];

  return (
    <nav className="mobile-nav-glass lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id || (item.id === 'documents' && currentTab === 'reminders');

        return (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`mobile-nav-glass-item relative ${isActive ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon className="w-4 h-4" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[8px] flex items-center justify-center animate-pulse shadow-md shadow-rose-500/50">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
