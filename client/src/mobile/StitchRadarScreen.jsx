import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  UploadCloud, 
  CheckCircle2, 
  ChevronRight,
  Truck
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';

export function StitchRadarScreen({ 
  stats, 
  documents = [], 
  onSelectVehicle, 
  onOpenAddDoc, 
  onSelectDocument 
}) {
  const [filter, setFilter] = useState('all'); // all, expired, tomorrow, two_days

  const expiredCount = stats?.expiredDocuments || 0;
  const tomorrowCount = stats?.expiresTomorrow || 0;
  const twoDaysCount = stats?.expires2Days || 0;
  const totalUrgent = expiredCount + tomorrowCount + twoDaysCount;

  // Filter urgent actions from live stats
  const urgentActions = stats?.urgentActions || [];
  const filteredActions = urgentActions.filter(action => {
    if (filter === 'expired') return action.status === 'EXPIRED';
    if (filter === 'tomorrow') return action.status === 'EXPIRES_TOMORROW' || action.status === 'EXPIRES_TODAY';
    if (filter === 'two_days') return action.status === 'EXPIRES_2_DAYS';
    return true;
  });

  return (
    <div className="space-y-4 pb-28 px-4 pt-1">
      {/* 1. Radar Urgency Overview */}
      <section className="stitch-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Compliance Radar</h2>
              <p className="text-[10px] text-slate-400">Strict 1-day &amp; 2-day fleet expiry monitoring</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold">
            {totalUrgent} Critical
          </span>
        </div>

        {/* 3-Part Radar Counter Matrix */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
          <button 
            onClick={() => setFilter('expired')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filter === 'expired' 
                ? 'bg-rose-500/20 border-rose-500/50' 
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
            }`}
          >
            <p className="text-[10px] text-rose-400 font-semibold uppercase">Expired</p>
            <p className="text-xl font-extrabold text-white font-mono mt-0.5">{expiredCount}</p>
            <p className="text-[9px] text-rose-300/80">Out of Service</p>
          </button>

          <button 
            onClick={() => setFilter('tomorrow')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filter === 'tomorrow' 
                ? 'bg-amber-500/20 border-amber-500/50' 
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
            }`}
          >
            <p className="text-[10px] text-amber-400 font-semibold uppercase">Tomorrow</p>
            <p className="text-xl font-extrabold text-white font-mono mt-0.5">{tomorrowCount}</p>
            <p className="text-[9px] text-amber-300/80">1 Day Left</p>
          </button>

          <button 
            onClick={() => setFilter('two_days')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              filter === 'two_days' 
                ? 'bg-yellow-500/20 border-yellow-500/50' 
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
            }`}
          >
            <p className="text-[10px] text-yellow-400 font-semibold uppercase">In 2 Days</p>
            <p className="text-xl font-extrabold text-white font-mono mt-0.5">{twoDaysCount}</p>
            <p className="text-[9px] text-yellow-300/80">2 Days Left</p>
          </button>
        </div>
      </section>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Alerts (${totalUrgent})` },
          { id: 'expired', label: `Expired (${expiredCount})` },
          { id: 'tomorrow', label: `Tomorrow (${tomorrowCount})` },
          { id: 'two_days', label: `In 2 Days (${twoDaysCount})` }
        ].map(pill => (
          <button
            key={pill.id}
            onClick={() => setFilter(pill.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              filter === pill.id 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06]'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. Urgent Documents Feed */}
      <section className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="stitch-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">All Clear in this Category</p>
              <p className="text-xs text-slate-400">
                {totalUrgent === 0 
                  ? 'Your entire fleet is 100% compliant with no upcoming 1-day or 2-day renewals.' 
                  : 'No documents match this specific alert window filter.'}
              </p>
            </div>
          </div>
        ) : (
          filteredActions.map((action, idx) => {
            const isExpired = action.status === 'EXPIRED';
            const isTomorrow = action.status === 'EXPIRES_TOMORROW' || action.status === 'EXPIRES_TODAY';

            return (
              <div 
                key={action.id || idx}
                className={`stitch-card p-4 space-y-3 border-l-4 ${
                  isExpired 
                    ? 'border-l-rose-500' 
                    : isTomorrow 
                    ? 'border-l-amber-500' 
                    : 'border-l-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08]">
                        {action.vehicleNumber || 'Fleet Unit'}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {action.documentType}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-300">
                      {action.badgeLabel || action.actionText}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Expiry: {action.expiryDate}
                    </p>
                  </div>

                  {/* Status Pill */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                    isExpired 
                      ? 'stitch-pill-danger' 
                      : 'stitch-pill-warning'
                  }`}>
                    {isExpired ? 'EXPIRED' : isTomorrow ? '1 DAY' : '2 DAYS'}
                  </span>
                </div>

                {/* Quick Resolution CTA */}
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  {action.vehicleId && (
                    <button
                      onClick={() => onSelectVehicle(action.vehicleId)}
                      className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>View Vehicle</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenAddDoc(action.vehicleId || '')}
                    className="stitch-btn-primary h-9 px-4 text-xs ml-auto shadow-sm shadow-blue-600/30"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Renew Document</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
