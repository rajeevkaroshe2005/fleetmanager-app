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
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  Activity,
  User,
  ShieldAlert,
  ArrowUpRight,
  Calendar
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
  // Real dynamic authenticated fleet metrics
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

  const userName = user?.name?.split(' ')[0] || user?.businessName?.split(' ')[0] || 'Rajeev';

  // SVG Radial Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  // Compliance color
  const complianceColor = complianceRate === 100 
    ? '#10B981' 
    : complianceRate >= 80 
    ? '#F59E0B' 
    : '#EF4444';

  return (
    <div className="space-y-8">
      {/* =========================================================================
          1. HERO / OVERVIEW AREA: Atmospheric Commercial Command Center
          ========================================================================= */}
      <section className="command-hero p-6 sm:p-8 lg:p-9 relative overflow-hidden">
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Persona Greeting & Action Hub */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>FLEET COMMAND CENTER • LIVE MONITORING</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {getGreeting()}, {userName} 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-xl">
                Here's the current health of your fleet and the compliance documents that need your attention today.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center flex-wrap gap-3 pt-2">
              <button 
                onClick={onOpenAddVehicle}
                className="btn-primary h-11 px-5 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Vehicle
              </button>

              <button 
                onClick={onOpenAddDoc}
                className="btn-secondary h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-white/[0.04] hover:bg-white/[0.08]"
              >
                <FileText className="w-4 h-4 text-slate-400 mr-2" />
                Upload Document
              </button>

              <button 
                onClick={() => onNavigate('reminders')}
                className="btn-secondary h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-white/[0.04] hover:bg-white/[0.08]"
              >
                <Clock className="w-4 h-4 text-slate-400 mr-2" />
                Expiry Radar
              </button>
            </div>
          </div>

          {/* Right: Sophisticated Realistic Commercial Truck Visual */}
          <div className="hidden md:flex items-center justify-end relative shrink-0">
            <div className="relative w-72 lg:w-80 xl:w-96 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#070D1A] group">
              <img 
                src="/truck_thumb.jpg" 
                alt="Fleet Commercial Truck" 
                className="w-full h-44 lg:h-48 object-cover object-center group-hover:scale-105 transition-transform duration-500 hero-truck-mask opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D1A] via-transparent to-transparent" />
              
              {/* Floating micro-badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-slate-300 px-3 py-1.5 rounded-lg bg-[#070D1A]/85 backdrop-blur-md border border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span>{activeVehicles} of {totalVehicles} Vehicles Active</span>
                </div>
                <span className="text-blue-400 font-mono text-[10px]">RADAR ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FLEET HEALTH: Integrated Command Bar (No 4 Identical Boxy Cards!)
          ========================================================================= */}
      <section className="bg-[#081020] border border-white/[0.06] rounded-2xl overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
          {/* Metric 1: Fleet Capacity */}
          <div 
            onClick={() => onNavigate('vehicles')}
            className="p-5 lg:p-6 hover:bg-white/[0.02] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Fleet Capacity</span>
              <Truck className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{totalVehicles}</span>
                <span className="text-xs text-slate-400 font-medium">registered</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{activeVehicles} active on commercial routes</span>
            </div>
          </div>

          {/* Metric 2: Document Vault */}
          <div 
            onClick={() => onNavigate('documents')}
            className="p-5 lg:p-6 hover:bg-white/[0.02] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Document Vault</span>
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{totalDocs}</span>
                <span className="text-xs text-slate-400 font-medium">monitored</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <span className="text-slate-400">{validDocsCount} verified valid</span>
              <span className="text-slate-600">•</span>
              <span className={complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{complianceRate}% legal</span>
            </div>
          </div>

          {/* Metric 3: Expiry Radar (Strict 1-Day and 2-Day Only) */}
          <div 
            onClick={() => onNavigate('reminders')}
            className="p-5 lg:p-6 hover:bg-white/[0.02] cursor-pointer transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Expiry Radar</span>
              <Clock className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${
                  tomorrowCount + twoDaysCount > 0 ? 'text-amber-400' : 'text-white'
                }`}>
                  {tomorrowCount + twoDaysCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">upcoming</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className={tomorrowCount > 0 ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                {tomorrowCount} tomorrow
              </span>
              <span className="text-slate-600">•</span>
              <span className={twoDaysCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {twoDaysCount} in 2 days
              </span>
            </div>
          </div>

          {/* Metric 4: Critical Compliance / Fines Risk */}
          <div 
            onClick={() => onNavigate('reminders')}
            className={`p-5 lg:p-6 cursor-pointer transition-colors group flex flex-col justify-between ${
              expiredCount > 0 ? 'bg-rose-500/[0.04] hover:bg-rose-500/[0.08]' : 'hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Critical Violations</span>
              <XCircle className={`w-4 h-4 transition-colors ${
                expiredCount > 0 ? 'text-rose-400' : 'text-slate-500 group-hover:text-rose-400'
              }`} />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${
                  expiredCount > 0 ? 'text-rose-400' : 'text-white'
                }`}>
                  {expiredCount}
                </span>
                <span className="text-xs text-slate-400 font-medium">expired</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {expiredCount > 0 ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Action Required (Fines Risk)
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero Expired Documents
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. COMPLIANCE CENTER: The Visual Centerpiece of the Dashboard
          ========================================================================= */}
      <section className="bg-[#081020] border border-white/[0.07] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        {/* Subtle accent backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/[0.03] rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Compliance Center</h2>
              {urgentTotal > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {urgentTotal} Immediate {urgentTotal === 1 ? 'Action' : 'Actions'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  100% Compliant
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Regulatory certificate monitoring and strict 1-day & 2-day advance expiry renewal window.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('documents')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            Review Document Vault <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Centerpiece Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Column (5 cols): Radial Progress Score & Status Statement */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-6">
            <div className="flex items-center gap-6">
              {/* SVG Radial Gauge */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r={radius} 
                    stroke="rgba(255, 255, 255, 0.08)" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  {/* Active Progress Arc */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r={radius} 
                    stroke={complianceColor} 
                    strokeWidth="8" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    fill="transparent" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white tracking-tight">{complianceRate}%</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Compliant</span>
                </div>
              </div>

              {/* Status Summary Text */}
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-white leading-snug">
                  {urgentTotal === 0 
                    ? 'All Fleet Papers Valid' 
                    : `Your fleet currently has ${urgentTotal} document${urgentTotal > 1 ? 's' : ''} requiring immediate attention.`}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {urgentTotal === 0
                    ? 'Every commercial vehicle has valid RC, insurance, fitness, permit, and driver credentials.'
                    : 'Unrenewed documents risk vehicle impoundment and traffic authority penalties.'}
                </p>
              </div>
            </div>

            {/* Expiry Breakdown Capsules */}
            <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-white/[0.06]">
              <div className={`p-2.5 rounded-lg border ${expiredCount > 0 ? 'bg-rose-500/10 border-rose-500/25' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <span className={`block text-lg font-extrabold ${expiredCount > 0 ? 'text-rose-400' : 'text-white'}`}>{expiredCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expired</span>
              </div>
              <div className={`p-2.5 rounded-lg border ${tomorrowCount > 0 ? 'bg-orange-500/10 border-orange-500/25' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <span className={`block text-lg font-extrabold ${tomorrowCount > 0 ? 'text-orange-400' : 'text-white'}`}>{tomorrowCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tomorrow</span>
              </div>
              <div className={`p-2.5 rounded-lg border ${twoDaysCount > 0 ? 'bg-amber-500/10 border-amber-500/25' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                <span className={`block text-lg font-extrabold ${twoDaysCount > 0 ? 'text-amber-400' : 'text-white'}`}>{twoDaysCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In 2 Days</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('reminders')}
              className="w-full btn-primary h-10 text-xs font-bold rounded-xl"
            >
              Review Compliance Radar →
            </button>
          </div>

          {/* Right Column (7 cols): Priority Action Items or Clean Shield Reassurance */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {urgentTotal === 0 ? (
              /* Serene 100% Compliant Reassurance State */
              <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="text-base font-bold text-white">Full Legal Compliance Achieved</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Zero expired documents and no papers due within the strict 1-day and 2-day reminder windows. Your commercial fleet is authorized for uninterrupted transport.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('documents')}
                  className="btn-secondary text-xs px-4 py-2 font-semibold mt-2"
                >
                  View All Active Documents
                </button>
              </div>
            ) : (
              /* Urgent Document Action List */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span>Priority Action List</span>
                  <span>{urgentActions.length} Pending</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {urgentActions.slice(0, 4).map((action, idx) => {
                    const isExpired = action.status === 'EXPIRED';
                    const isTomorrow = action.status === 'EXPIRES_TOMORROW' || action.status === 'EXPIRES_TODAY';

                    return (
                      <div 
                        key={action.id || idx}
                        className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <NumberPlate number={action.vehicleNumber || 'MH 09'} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white truncate">{action.documentType}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isExpired 
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                                  : isTomorrow
                                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}>
                                {action.badgeLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Deadline: <strong className="text-slate-200">{action.expiryDate}</strong>
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (action.vehicleId) {
                              onSelectVehicle(action.vehicleId);
                            } else {
                              onNavigate('reminders');
                            }
                          }}
                          className="btn-secondary text-xs py-1.5 px-3 font-semibold hover:text-white shrink-0 self-end sm:self-auto"
                        >
                          Inspect Vehicle →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. YOUR FLEET: Premium Fleet Ledger (Spacious, Not Flat)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Your Fleet</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                {vehicles.length} {vehicles.length === 1 ? 'Truck' : 'Trucks'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active commercial vehicles, assigned drivers, and live compliance standing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('vehicles')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              View Full Fleet <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {vehicles.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-2xl bg-[#081020] border border-white/[0.06] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
              <Truck className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-white">No vehicles added yet</h3>
              <p className="text-xs text-slate-400">
                Register your first commercial truck to automatically monitor insurance, fitness, permit, and driver assignments.
              </p>
            </div>
            <button 
              onClick={onOpenAddVehicle}
              className="btn-primary text-xs py-2.5 px-5 font-bold mt-2 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Register First Vehicle
            </button>
          </div>
        ) : (
          /* Spacious Fleet Ledger Cards */
          <div className="space-y-3">
            {vehicles.slice(0, 5).map((v) => (
              <div 
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className="fleet-ledger-item p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Vehicle Plate & Identification */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0">
                    <NumberPlate number={v.vehicle_number} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors truncate">
                        {v.model}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.05] text-slate-400 border border-white/[0.06]">
                        {v.vehicle_type || 'Commercial Truck'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{v.driver_name || 'Driver unassigned'}</span>
                      </span>
                      {v.manufacturing_year && (
                        <span className="hidden sm:inline text-slate-500">
                          Year: <strong className="text-slate-400">{v.manufacturing_year}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.04] shrink-0">
                  {/* Status Indicator */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {v.status === 'active' ? 'Active' : 'Inactive'}
                  </span>

                  {/* View Details Action */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelectVehicle(v.id); }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          5. QUICK ACTIONS: Compact, Tactile Action Bar (The Goldilocks Middle Ground)
          ========================================================================= */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Quick Operations</span>
          </div>
          <span className="text-[11px] text-slate-500">1-Click Fast Actions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Action 1: Add Vehicle */}
          <div 
            onClick={onOpenAddVehicle}
            className="quick-action-tile group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center border border-blue-500/25 shrink-0 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate group-hover:text-blue-400 transition-colors">
                Add Vehicle
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Register truck</span>
            </div>
          </div>

          {/* Action 2: Add Document */}
          <div 
            onClick={onOpenAddDoc}
            className="quick-action-tile group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/15 text-cyan-400 flex items-center justify-center border border-cyan-500/25 shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate group-hover:text-cyan-400 transition-colors">
                Document
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Sync RC & insurance</span>
            </div>
          </div>

          {/* Action 3: Vehicle Photos */}
          <div 
            onClick={() => onNavigate('vehicles')}
            className="quick-action-tile group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate group-hover:text-purple-400 transition-colors">
                Photo Upload
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Inspect fleet trucks</span>
            </div>
          </div>

          {/* Action 4: Expiry Radar */}
          <div 
            onClick={() => onNavigate('reminders')}
            className="quick-action-tile group relative"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 text-amber-400 flex items-center justify-center border border-amber-500/25 shrink-0 group-hover:scale-110 transition-transform relative">
              <Bell className="w-5 h-5" />
              {urgentTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-md">
                  {urgentTotal}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate group-hover:text-amber-400 transition-colors">
                Expiry Radar
              </span>
              <span className="text-[10px] text-slate-400 block truncate">1 & 2-day renewals</span>
            </div>
          </div>

          {/* Action 5: Add Expense */}
          <div 
            onClick={() => onNavigate('expenses')}
            className="quick-action-tile group col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 shrink-0 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate group-hover:text-emerald-400 transition-colors">
                Record Expense
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Fuel & toll costs</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
