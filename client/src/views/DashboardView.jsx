import React from 'react';
import { 
  Truck, 
  FileText, 
  Clock, 
  Plus, 
  IndianRupee,
  Camera, 
  Bell, 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  User,
  ShieldAlert
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
  // Real authenticated fleet metrics
  const totalVehicles = stats?.totalVehicles ?? vehicles.length ?? 0;
  const activeVehicles = stats?.activeVehicles ?? vehicles.filter(v => v.status === 'active').length;
  const totalDocs = stats?.totalDocuments ?? 0;
  const twoDaysCount = stats?.expires2Days ?? 0;
  const tomorrowCount = stats?.expiresTomorrow ?? 0;
  const expiredCount = stats?.expiredDocuments ?? 0;
  const urgentActions = stats?.urgentActions || [];

  const urgentTotal = twoDaysCount + tomorrowCount + expiredCount;
  const validDocsCount = stats?.validDocuments ?? Math.max(0, totalDocs - urgentTotal);
  const complianceRate = totalDocs > 0 ? Math.round((validDocsCount / totalDocs) * 100) : 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name?.split(' ')[0] || user?.businessName?.split(' ')[0] || 'Rajesh';

  // SVG Radial Gauge calculation (Clean & Sophisticated)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  // Semantic color for compliance
  const complianceColor = complianceRate === 100 
    ? '#10B981' 
    : complianceRate >= 80 
    ? '#F59E0B' 
    : '#EF4444';

  const priorityAction = urgentActions[0] || null;

  return (
    <div className="space-y-7 pb-12 sm:pb-16">
      {/* =========================================================================
          1. HERO SECTION: Compact (15-20% shorter), Integrated Truck Visual, Clear CTA Hierarchy
          ========================================================================= */}
      <section className="command-hero p-5 sm:p-6 lg:p-7 relative overflow-hidden">
        {/* Subtle background ambient light */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/[0.07] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Persona Greeting & Action Buttons */}
          <div className="space-y-3.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>FLEET COMMAND CENTER</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {getGreeting()}, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                Here's the current health of your fleet and the compliance documents that need your attention today.
              </p>
            </div>

            {/* Action Buttons with Clear Hierarchy: Primary vs Secondary */}
            <div className="flex items-center flex-wrap gap-2.5 pt-1">
              {/* Primary CTA */}
              <button 
                onClick={onOpenAddVehicle}
                className="btn-primary h-10 px-4 text-xs font-bold rounded-lg shadow-md shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Vehicle
              </button>

              {/* Secondary CTAs */}
              <button 
                onClick={onOpenAddDoc}
                className="btn-secondary h-10 px-3.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                Upload Document
              </button>

              <button 
                onClick={() => onNavigate('reminders')}
                className="btn-secondary h-10 px-3.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                Expiry Radar
              </button>
            </div>
          </div>

          {/* Right: Integrated Truck Visual (No heavy rectangular border; soft fade into background) */}
          <div className="hidden md:flex items-center justify-end relative shrink-0">
            <div className="relative w-64 lg:w-80 h-36 lg:h-40 overflow-hidden">
              <img 
                src="/truck_thumb.jpg" 
                alt="Commercial Truck" 
                className="w-full h-full object-cover object-center hero-truck-integrated opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081020]/90 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FLEET HEALTH: Unified Section (No "Four / Six Card" Boxy Admin Look)
          ========================================================================= */}
      <section className="bg-[#081020]/70 border border-white/[0.05] rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.04]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Fleet Health Overview
          </span>
          <span className="text-[10px] text-slate-500">Live Scoped Data</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-0 sm:divide-x sm:divide-white/[0.05]">
          {/* 1. Fleet */}
          <div 
            onClick={() => onNavigate('vehicles')}
            className="sm:px-4 first:sm:pl-0 cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fleet Capacity
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                {totalVehicles}
              </span>
              <span className="text-xs text-slate-400">vehicles</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              ● {activeVehicles} active
            </p>
          </div>

          {/* 2. Documents */}
          <div 
            onClick={() => onNavigate('documents')}
            className="sm:px-4 cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Document Vault
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                {totalDocs}
              </span>
              <span className="text-xs text-slate-400">tracked</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {validDocsCount} valid papers
            </p>
          </div>

          {/* 3. Compliance */}
          <div 
            onClick={() => onNavigate('documents')}
            className="sm:px-4 cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Compliance Rate
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-2xl font-extrabold ${complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {complianceRate}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {complianceRate === 100 ? 'Fully compliant' : 'Attention required'}
            </p>
          </div>

          {/* 4. Expiry Radar (Strict 1-Day & 2-Day Only) */}
          <div 
            onClick={() => onNavigate('reminders')}
            className="sm:px-4 cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Expiry Radar
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-2xl font-extrabold ${tomorrowCount + twoDaysCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                {tomorrowCount + twoDaysCount}
              </span>
              <span className="text-xs text-slate-400">upcoming</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {tomorrowCount} tomorrow · {twoDaysCount} in 2d
            </p>
          </div>

          {/* 5. Critical Issues */}
          <div 
            onClick={() => onNavigate('reminders')}
            className="sm:px-4 last:sm:pr-0 cursor-pointer group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Critical Risk
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className={`text-2xl font-extrabold ${expiredCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {expiredCount > 0 ? `${expiredCount} issue` : '0 issues'}
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 font-medium ${expiredCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {expiredCount > 0 ? 'Requires action' : 'Zero violations'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. COMPLIANCE CENTER: Single Elegant Panel with 3 Unified Zones (No Nested Boxes)
          ========================================================================= */}
      <section className="bg-[#081020] border border-white/[0.06] rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Compliance Center
            </span>
            {urgentTotal > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {urgentTotal} {urgentTotal === 1 ? 'issue requires attention' : 'issues require attention'}
              </span>
            )}
          </div>
          <button 
            onClick={() => onNavigate('documents')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
          >
            View All Documents <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Zone Clean Grid: Circular Gauge (Left) | Summary Statement (Center) | Priority Action (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Zone 1: Large Circular Compliance Indicator (3 cols) */}
          <div className="lg:col-span-3 flex items-center justify-center sm:justify-start lg:justify-center">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  stroke="rgba(255, 255, 255, 0.06)" 
                  strokeWidth="7" 
                  fill="transparent" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  stroke={complianceColor} 
                  strokeWidth="7" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" 
                  fill="transparent" 
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-white tracking-tight">{complianceRate}%</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Compliant</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Informative Center Narrative & Metrics Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-2 text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {urgentTotal === 0 
                ? 'All Fleet Documents Verified & Valid' 
                : `Your fleet currently has ${urgentTotal} document${urgentTotal > 1 ? 's' : ''} requiring attention.`}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {urgentTotal === 0
                ? 'Zero expired papers. All commercial trucks have active registration, fitness, and insurance.'
                : 'Immediate action prevents traffic penalties and ensures commercial clearance on transport routes.'}
            </p>

            {/* Clear Horizontal Metric Breakdown */}
            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">Expired</span>
                <span className={`font-bold ${expiredCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{expiredCount}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">Tomorrow</span>
                <span className={`font-bold ${tomorrowCount > 0 ? 'text-orange-400' : 'text-slate-300'}`}>{tomorrowCount}</span>
              </div>
              <span className="text-slate-700">•</span>
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">In 2 Days</span>
                <span className={`font-bold ${twoDaysCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{twoDaysCount}</span>
              </div>
            </div>
          </div>

          {/* Zone 3: Priority Action Document on the Right (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/[0.05] pt-4 lg:pt-0 lg:pl-6">
            {priorityAction ? (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Priority Document
                </span>
                
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{priorityAction.documentType}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                        Expired
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <NumberPlate number={priorityAction.vehicleNumber || 'MH 09'} />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Expired on <strong className="text-slate-200">{priorityAction.expiryDate}</strong>
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      if (priorityAction.vehicleId) {
                        onSelectVehicle(priorityAction.vehicleId);
                      } else {
                        onNavigate('reminders');
                      }
                    }}
                    className="toolbar-btn text-xs font-semibold px-3 py-2 bg-blue-600/15 text-blue-300 border-blue-500/30 hover:bg-blue-600/25 hover:text-white shrink-0"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            ) : (
              /* All Clear Reassurance */
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Legal Clearance</h4>
                  <p className="text-[11px] text-slate-400">No priority actions required.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. YOUR FLEET: Spacious Rows with Vertical Breathing Room
          ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Your Fleet</h2>
            <span className="text-xs text-slate-400">
              ({vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'})
            </span>
          </div>

          <button 
            onClick={() => onNavigate('vehicles')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
          >
            Manage Fleet <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {vehicles.length === 0 ? (
          /* Clean Empty State */
          <div className="p-10 rounded-xl bg-[#081020]/60 border border-white/[0.05] text-center space-y-3">
            <Truck className="w-8 h-8 text-slate-500 mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-white">No vehicles in fleet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Register commercial trucks to begin monitoring RC, fitness, permit, and driver assignments.
            </p>
            <button 
              onClick={onOpenAddVehicle}
              className="btn-primary text-xs py-2 px-4 font-bold mt-1 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add First Vehicle
            </button>
          </div>
        ) : (
          /* Spacious Fleet Rows with Generous Breathing Room & Subtle Hover */
          <div className="rounded-xl bg-[#081020]/70 border border-white/[0.05] divide-y divide-white/[0.04] overflow-hidden">
            {vehicles.slice(0, 5).map((v) => (
              <div 
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className="py-4 px-5 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
              >
                {/* Registration Plate & Model Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0">
                    <NumberPlate number={v.vehicle_number} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                        {v.model}
                      </h4>
                      <span className="text-xs text-slate-400">• {v.vehicle_type || 'Commercial Truck'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5 truncate">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{v.driver_name || 'Unassigned'}</span>
                      </span>
                      {v.manufacturing_year && (
                        <span className="text-slate-500">Year: {v.manufacturing_year}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.03]">
                  {/* Subtle Status Pill */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {v.status === 'active' ? 'Active' : 'Inactive'}
                  </span>

                  {/* Profile CTA */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelectVehicle(v.id); }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          5. QUICK OPERATIONS: Compact Action Toolbar (Not Rows of Giant Cards)
          ========================================================================= */}
      <section className="space-y-2.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Quick Actions
        </span>

        {/* Compact, elegant toolbar button group */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onOpenAddVehicle}
            className="toolbar-btn"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Add Vehicle</span>
          </button>

          <button 
            onClick={onOpenAddDoc}
            className="toolbar-btn"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Document</span>
          </button>

          <button 
            onClick={() => onNavigate('vehicles')}
            className="toolbar-btn"
          >
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span>Photo</span>
          </button>

          <button 
            onClick={() => onNavigate('reminders')}
            className="toolbar-btn relative"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Expiry Radar</span>
            {urgentTotal > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 ml-0.5 animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => onNavigate('expenses')}
            className="toolbar-btn"
          >
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            <span>Expense</span>
          </button>
        </div>
      </section>
    </div>
  );
}
