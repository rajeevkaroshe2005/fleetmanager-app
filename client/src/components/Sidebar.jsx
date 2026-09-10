import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  Bell, 
  Users, 
  Wrench, 
  IndianRupee, 
  LogOut, 
  BarChart3,
  Settings,
  X
} from 'lucide-react';

export function Sidebar({ 
  currentTab, 
  onNavigate, 
  stats, 
  user, 
  onLogout, 
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile
}) {
  const urgentCount = (stats?.expiredDocuments || 0) + (stats?.expiresTomorrow || 0) + (stats?.expires2Days || 0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'documents', label: 'Documents', icon: FileText },
    { 
      id: 'reminders', 
      label: 'Expiry & Reminders', 
      icon: Bell, 
      badge: urgentCount > 0 ? urgentCount : null 
    },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: () => onOpenSettings ? onOpenSettings() : onNavigate('dashboard') },
  ];

  const handleItemClick = (item) => {
    if (onCloseMobile) onCloseMobile();
    if (item.onClick) {
      item.onClick();
    } else {
      onNavigate(item.id);
    }
  };

  const userInitials = user?.businessName 
    ? user.businessName.slice(0, 2).toUpperCase()
    : user?.name ? user.name.slice(0, 2).toUpperCase() : 'RT';

  const content = (
    <div className="flex flex-col h-full bg-[#050B16] border-r border-white/[0.06] text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div 
          onClick={() => { if (onCloseMobile) onCloseMobile(); onNavigate('dashboard'); }} 
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-transform shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-white tracking-tight leading-tight truncate">
              {user?.businessName || 'Fleet Transport'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <p className="text-[11px] font-semibold text-blue-400 tracking-wide">FleetManager Pro</p>
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links - Categorized SaaS Structure */}
      <nav className="p-3.5 space-y-4 flex-1 overflow-y-auto">
        {[
          {
            section: 'OVERVIEW',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
            ]
          },
          {
            section: 'FLEET',
            items: [
              { id: 'vehicles', label: 'Vehicles', icon: Truck },
              { id: 'drivers', label: 'Drivers', icon: Users },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench }
            ]
          },
          {
            section: 'COMPLIANCE',
            items: [
              { id: 'documents', label: 'Documents', icon: FileText },
              { 
                id: 'reminders', 
                label: 'Expiry & Reminders', 
                icon: Bell, 
                badge: urgentCount > 0 ? urgentCount : null 
              }
            ]
          },
          {
            section: 'FINANCE',
            items: [
              { id: 'expenses', label: 'Expenses', icon: IndianRupee },
              { id: 'reports', label: 'Reports', icon: BarChart3 }
            ]
          },
          {
            section: 'SYSTEM',
            items: [
              { 
                id: 'settings', 
                label: 'Settings', 
                icon: Settings, 
                onClick: () => onOpenSettings ? onOpenSettings() : onNavigate('dashboard') 
              }
            ]
          }
        ].map((group) => (
          <div key={group.section} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all h-10 relative group ${
                    isActive 
                      ? 'bg-blue-600/15 text-white border border-blue-500/35 shadow-sm font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0 pl-1">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge !== null && (
                    <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md shadow-rose-500/40 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sticky User Profile & Logout */}
      <div className="p-4 border-t border-white/[0.08] bg-[#050A16] space-y-3 shrink-0">
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-400/30">
              {userInitials}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate">{user?.businessName || user?.name || 'Transport Owner'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'owner@fleet.com'}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30 select-none">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
