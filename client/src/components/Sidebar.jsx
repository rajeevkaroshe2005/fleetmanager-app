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
    <div className="flex flex-col h-full bg-[#081226] border-r border-white/10 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
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
            <p className="text-[11px] font-semibold text-blue-400 tracking-wide">FleetManager Pro</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation Links */}
      <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-2.5 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
          Fleet Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all h-11 ${
                isActive 
                  ? 'bg-blue-600/25 text-white border border-blue-500/50 shadow-md shadow-blue-600/20 font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-white/8 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md shadow-rose-500/40 shrink-0 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ALWAYS VISIBLE BOTTOM USER & LOGOUT BAR (Sticky bottom) */}
      <div className="p-3.5 border-t border-white/10 bg-[#060E1E] space-y-2.5 shrink-0">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-400/40 shadow-inner">
              {userInitials}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-white truncate">{user?.businessName || user?.name || 'Owner'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'owner@fleet.com'}</p>
            </div>
          </div>
        </div>

        {/* Clear, High-Contrast Logout Button */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/30 hover:border-rose-600 shadow-sm cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
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
