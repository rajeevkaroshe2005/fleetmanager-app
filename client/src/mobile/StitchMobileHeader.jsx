import React from 'react';
import { Search, Plus, Bell, ShieldCheck, ShieldAlert } from 'lucide-react';

export function StitchMobileHeader({ 
  user, 
  stats, 
  onOpenSearch, 
  onOpenAddVehicle, 
  onOpenNotifications,
  onOpenSettings
}) {
  const urgentCount = (stats?.expiredDocuments || 0) + (stats?.expiresTomorrow || 0) + (stats?.expires2Days || 0);
  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'FM';

  return (
    <header className="sticky top-0 z-40 bg-[#0D1322]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
      {/* Brand & Fleet Telemetry Beacon */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button 
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 cursor-pointer overflow-hidden"
          title="Account & Settings"
        >
          <img 
            src="/screen.png" 
            alt="Avatar" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerText = userInitials;
            }}
          />
        </button>

        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              {user?.businessName || 'FleetManager Pro'}
            </h1>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {stats?.totalVehicles ?? 0} units active &bull; {stats?.validDocuments ?? 0} compliant
          </p>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenSearch}
          className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 flex items-center justify-center relative cursor-pointer transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse ring-2 ring-[#0D1322]" />
          )}
        </button>

        <button
          onClick={onOpenAddVehicle}
          className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </header>
  );
}
