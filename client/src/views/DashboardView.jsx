import React from 'react';
import { 
  Truck, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Plus, 
  IndianRupee,
  Camera,
  Bell,
  XCircle,
  User,
  CheckCircle2
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';

export function DashboardView({ 
  stats, 
  vehicles = [],
  user,
  onNavigate, 
  onSelectVehicle, 
  onOpenAddDoc, 
  onOpenAddVehicle, 
  onSelectDocument 
}) {
  // Purely dynamic counts from user's live fleet data (no static numbers!)
  const totalVehicles = stats?.totalVehicles ?? vehicles.length ?? 0;
  const totalDocs = stats?.totalDocuments ?? 0;
  const twoDaysCount = stats?.expires2Days ?? 0;
  const tomorrowCount = stats?.expiresTomorrow ?? 0;
  const expiredCount = stats?.expiredDocuments ?? 0;
  const urgentActions = stats?.urgentActions || [];
  const activeCount = stats?.activeVehicles ?? 0;

  const urgentTotal = twoDaysCount + tomorrowCount + expiredCount;
  const validDocsCount = stats?.validDocuments ?? Math.max(0, totalDocs - urgentTotal);

  return (
    <div className="space-y-6">
      {/* Top Section: Greeting, Subtitle & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Fleet Manager'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time compliance, document reminders, and fleet operations overview.
          </p>
        </div>

        <button 
          onClick={onOpenAddVehicle}
          className="btn-primary text-xs sm:text-sm font-bold self-start sm:self-auto shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* 5 KPI Cards Row - Equal Height, Balanced Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Vehicles (Blue) */}
        <div 
          onClick={() => onNavigate('vehicles')}
          className="kpi-card kpi-blue cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Total Vehicles</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalVehicles}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
              <span>{totalVehicles > 0 ? `${activeCount} active` : 'No vehicles yet'}</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Documents (Cyan) */}
        <div 
          onClick={() => onNavigate('documents')}
          className="kpi-card kpi-cyan cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalDocs}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
              <span>{totalDocs > 0 ? `${validDocsCount} valid` : 'No documents'}</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Expiring in 2 Days (Amber) */}
        <div 
          onClick={() => onNavigate('reminders')}
          className="kpi-card kpi-amber cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Expiring in 2 Days</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{twoDaysCount}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
              <span>{twoDaysCount > 0 ? 'Urgent notice' : 'None pending'}</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Expiring Tomorrow (Orange) */}
        <div 
          onClick={() => onNavigate('reminders')}
          className="kpi-card kpi-orange cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Expiring Tomorrow</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-400/30 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{tomorrowCount}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-orange-400 font-semibold">
              <span>{tomorrowCount > 0 ? 'Immediate action' : 'None pending'}</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Expired Documents (Red) */}
        <div 
          onClick={() => onNavigate('reminders')}
          className="kpi-card kpi-red cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Expired Documents</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-400/30 shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{expiredCount}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-rose-400 font-semibold">
              <span>{expiredCount > 0 ? 'Compliance breach' : 'Zero expired'}</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Documents Requiring Attention & Recent Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Documents Requiring Attention */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Documents Requiring Attention
              </h2>
              {urgentTotal > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                  {urgentTotal} Pending
                </span>
              )}
            </div>
            <button 
              onClick={() => onNavigate('reminders')}
              className="btn-secondary text-xs py-1 px-3"
            >
              View Expiry Radar
            </button>
          </div>

          {urgentActions.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-90" />
              <h4 className="text-sm font-bold text-white">All Fleet Documents Compliant!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No vehicle documents or driver licences are currently expired or expiring within the 2-day reminder period.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentActions.slice(0, 5).map((action) => (
                <div 
                  key={action.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      <NumberPlate number={action.vehicleNumber || 'MH 09'} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white truncate">{action.documentType}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          action.status === 'EXPIRED'
                            ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                            : action.status === 'EXPIRES_TOMORROW' || action.status === 'EXPIRES_TODAY'
                            ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                            : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                        }`}>
                          {action.badgeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Expires: <strong className="text-slate-200">{action.expiryDate}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button 
                      onClick={() => {
                        if (action.vehicleId) {
                          onSelectVehicle(action.vehicleId);
                        } else {
                          onNavigate('reminders');
                        }
                      }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {urgentActions.length > 5 && (
            <div className="text-center pt-2">
              <button 
                onClick={() => onNavigate('reminders')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
              >
                View All {urgentActions.length} Pending Reminders →
              </button>
            </div>
          )}
        </div>

        {/* Recent Vehicles Card */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <h3 className="font-extrabold text-sm sm:text-base text-white">Recent Vehicles</h3>
            <button 
              onClick={() => onNavigate('vehicles')}
              className="btn-secondary text-xs py-1 px-3 text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All ({vehicles.length})
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
              <Truck className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <h4 className="text-sm font-bold text-white">No vehicles registered yet</h4>
              <p className="text-xs text-slate-400">Add your first commercial truck to get started.</p>
              <button 
                onClick={onOpenAddVehicle} 
                className="btn-primary text-xs py-1.5 px-3 mt-1"
              >
                + Add Vehicle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.slice(0, 5).map((v) => (
                <div 
                  key={v.id}
                  onClick={() => onSelectVehicle(v.id)}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between cursor-pointer hover:bg-white/8 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      <NumberPlate number={v.vehicle_number} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                        {v.model}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{v.driver_name || 'Unassigned'}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                    {v.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Operations Section - Full Width */}
      <div className="glass-panel p-5 sm:p-6 space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Quick Operations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button 
            onClick={onOpenAddVehicle}
            className="quick-action-card"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <span>Add Vehicle</span>
          </button>

          <button 
            onClick={onOpenAddDoc}
            className="quick-action-card"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <span>Add Document</span>
          </button>

          <button 
            onClick={() => onNavigate('vehicles')}
            className="quick-action-card"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <span>Upload Photo</span>
          </button>

          <button 
            onClick={() => onNavigate('reminders')}
            className="quick-action-card relative"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 relative">
              <Bell className="w-5 h-5" />
              {urgentTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[8px] flex items-center justify-center">
                  {urgentTotal}
                </span>
              )}
            </div>
            <span>View Expiring</span>
          </button>

          <button 
            onClick={() => onNavigate('expenses')}
            className="quick-action-card col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
}
