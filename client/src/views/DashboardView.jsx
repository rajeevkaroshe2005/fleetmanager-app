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

  // SVG Radial Gauge calculation (Prominent, High-Precision & Elegant)
  const radius = 44;
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
    <div className="space-y-8 pb-16 lg:pb-24">
      {/* =========================================================================
          1. FLEET COMMAND CENTER HERO: Spacious, Integrated Truck Visual, Clear CTA Hierarchy
          ========================================================================= */}
      <section className="command-hero p-7 sm:p-8 lg:p-9 relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/[0.08] rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left: Persona Greeting & Action Buttons */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fleet Command Center</span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {getGreeting()}, {userName} 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed">
                Fleet health and compliance overview.
              </p>
            </div>

            {/* Action Buttons with Clear Hierarchy: Primary vs Secondary */}
            <div className="flex items-center flex-wrap gap-3 pt-2">
              {/* Primary Action Button */}
              <button 
                onClick={onOpenAddVehicle}
                className="btn-primary h-11 px-5 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Vehicle
              </button>

              {/* Secondary Actions */}
              <button 
                onClick={onOpenAddDoc}
                className="btn-secondary h-11 px-4 text-xs sm:text-sm font-medium rounded-xl text-slate-300 hover:text-white bg-white/[0.03] border-white/10 hover:bg-white/[0.08] transition-all"
              >
                <FileText className="w-4 h-4 text-slate-400 mr-2" />
                Upload Document
              </button>

              <button 
                onClick={() => onNavigate('reminders')}
                className="btn-secondary h-11 px-4 text-xs sm:text-sm font-medium rounded-xl text-slate-300 hover:text-white bg-white/[0.03] border-white/10 hover:bg-white/[0.08] transition-all"
              >
                <Clock className="w-4 h-4 text-slate-400 mr-2" />
                Expiry Radar
              </button>
            </div>
          </div>

          {/* Right: Integrated Truck Visual (Occupying ~30% of hero, soft natural fade, no boxy card outline) */}
          <div className="hidden md:flex items-center justify-end relative shrink-0 w-72 lg:w-96 h-44 lg:h-48 overflow-hidden">
            <img 
              src="/truck_thumb.jpg" 
              alt="Commercial Fleet Truck" 
              className="w-full h-full object-cover object-center hero-truck-integrated opacity-90 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081020]/90 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FLEET HEALTH: One Cohesive Component with Large Numbers & Subtle Dividers
          ========================================================================= */}
      <section className="bg-[#081020] border border-white/[0.06] rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.05]">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Fleet Health
          </h2>
          <span className="text-xs text-slate-400">
            Real-time telemetry & compliance telemetry
          </span>
        </div>

        {/* 5-Column Cohesive Health Grid with Subtle Dividers & Prominent Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
          {/* 1. Vehicles */}
          <div 
            onClick={() => onNavigate('vehicles')}
            className="sm:px-5 first:sm:pl-0 cursor-pointer group space-y-1"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-blue-400 transition-colors block">
              {totalVehicles}
            </span>
            <div className="text-sm font-semibold text-slate-200">
              Vehicles
            </div>
            <p className="text-xs text-emerald-400 font-medium pt-0.5">
              ● {activeVehicles} Active
            </p>
          </div>

          {/* 2. Documents */}
          <div 
            onClick={() => onNavigate('documents')}
            className="sm:px-5 cursor-pointer group space-y-1"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-blue-400 transition-colors block">
              {totalDocs}
            </span>
            <div className="text-sm font-semibold text-slate-200">
              Documents
            </div>
            <p className="text-xs text-slate-400 pt-0.5">
              {validDocsCount} Valid
            </p>
          </div>

          {/* 3. Compliance */}
          <div 
            onClick={() => onNavigate('documents')}
            className="sm:px-5 cursor-pointer group space-y-1"
          >
            <span className={`text-3xl sm:text-4xl font-extrabold block ${complianceRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {complianceRate}%
            </span>
            <div className="text-sm font-semibold text-slate-200">
              Compliance
            </div>
            <p className="text-xs text-slate-400 pt-0.5">
              {complianceRate === 100 ? 'Fully Compliant' : 'Needs Attention'}
            </p>
          </div>

          {/* 4. Upcoming (Strictly 1-Day & 2-Day Only) */}
          <div 
            onClick={() => onNavigate('reminders')}
            className="sm:px-5 cursor-pointer group space-y-1"
          >
            <span className={`text-3xl sm:text-4xl font-extrabold block ${tomorrowCount + twoDaysCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {tomorrowCount + twoDaysCount}
            </span>
            <div className="text-sm font-semibold text-slate-200">
              Upcoming Expiry
            </div>
            <p className="text-xs text-slate-400 pt-0.5">
              {tomorrowCount} Tomorrow · {twoDaysCount} in 2 Days
            </p>
          </div>

          {/* 5. Critical Issues */}
          <div 
            onClick={() => onNavigate('reminders')}
            className="sm:px-5 last:sm:pr-0 cursor-pointer group space-y-1"
          >
            <span className={`text-3xl sm:text-4xl font-extrabold block ${expiredCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {expiredCount}
            </span>
            <div className="text-sm font-semibold text-slate-200">
              Critical
            </div>
            <p className={`text-xs font-medium pt-0.5 ${expiredCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {expiredCount > 0 ? '1 Issue Expired' : 'Zero Issues'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. COMPLIANCE CENTER: Most Important Section — 3-Part Composition Without Nested Boxes
          ========================================================================= */}
      <section className="bg-[#081020] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Compliance Center
            </h2>
            {urgentTotal > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                {urgentTotal} {urgentTotal === 1 ? 'document requires attention' : 'documents require attention'}
              </span>
            )}
          </div>
          <button 
            onClick={() => onNavigate('documents')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
          >
            Review Document Vault <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Part Elegant Composition: LEFT (Gauge) | CENTER (Explanation + Expiry Summary) | RIGHT (Priority Document) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Part 1: LEFT — Large Compliance Percentage (3 cols) */}
          <div className="lg:col-span-3 flex items-center justify-center sm:justify-start lg:justify-center">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r={radius} 
                  stroke="rgba(255, 255, 255, 0.06)" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{complianceRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Compliant</span>
              </div>
            </div>
          </div>

          {/* Part 2: CENTER — Explanation & Expiry Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-3 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {urgentTotal === 0 
                ? 'All fleet documents verified and legally compliant.' 
                : `Your fleet has ${urgentTotal} document${urgentTotal > 1 ? 's' : ''} requiring immediate attention.`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              {urgentTotal === 0
                ? 'Zero expired papers. All commercial trucks have active registration, fitness, and insurance.'
                : 'Expired papers risk vehicle impoundment and heavy traffic authority penalties on transit highways.'}
            </p>

            {/* Horizontal Expiry Summary Strip */}
            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Expired:</span>
                <span className={`font-bold ${expiredCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{expiredCount}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Tomorrow:</span>
                <span className={`font-bold ${tomorrowCount > 0 ? 'text-orange-400' : 'text-slate-300'}`}>{tomorrowCount}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">In 2 Days:</span>
                <span className={`font-bold ${twoDaysCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>{twoDaysCount}</span>
              </div>
            </div>
          </div>

          {/* Part 3: RIGHT — Priority Document & Direct Action (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-5 lg:pt-0 lg:pl-8">
            {priorityAction ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Priority Document
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Expired
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <h4 className="font-bold text-base text-white truncate">
                      {priorityAction.documentType}
                    </h4>
                    <div>
                      <NumberPlate number={priorityAction.vehicleNumber || 'MH 09'} />
                    </div>
                    <p className="text-xs text-slate-400">
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
                    className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 shrink-0"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            ) : (
              /* All Clear State */
              <div className="flex items-center gap-3.5 py-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Full Legal Clearance</h4>
                  <p className="text-xs text-slate-400 mt-0.5">All fleet documents are legally verified.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. YOUR FLEET: Increased Row Height, Actual Fleet Record Feel, Spacious
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Your Fleet</h2>
            <span className="text-xs font-medium text-slate-400">
              ({vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'})
            </span>
          </div>

          <button 
            onClick={() => onNavigate('vehicles')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {vehicles.length === 0 ? (
          /* Clean Empty State */
          <div className="p-12 rounded-2xl bg-[#081020] border border-white/[0.06] text-center space-y-4">
            <Truck className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-white">No vehicles registered</h3>
              <p className="text-xs text-slate-400">
                Register commercial trucks to begin monitoring RC, fitness, permit, and driver assignments.
              </p>
            </div>
            <button 
              onClick={onOpenAddVehicle}
              className="btn-primary text-xs py-2.5 px-5 font-bold mt-1 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" /> Add First Vehicle
            </button>
          </div>
        ) : (
          /* Spacious Fleet Rows with 16-20px Vertical Padding */
          <div className="rounded-2xl bg-[#081020] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden shadow-sm">
            {/* Table Header Row */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-3">Vehicle</div>
              <div className="col-span-3">Model / Type</div>
              <div className="col-span-2">Driver</div>
              <div className="col-span-1">Year</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Vehicle Records */}
            {vehicles.slice(0, 5).map((v) => (
              <div 
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className="py-5 px-6 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center hover:bg-white/[0.02] cursor-pointer transition-colors group"
              >
                {/* 1. Registration Plate with Truck Icon (3 cols) */}
                <div className="md:col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="shrink-0">
                    <NumberPlate number={v.vehicle_number} />
                  </div>
                </div>

                {/* 2. Model & Type (3 cols) */}
                <div className="md:col-span-3 min-w-0">
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                    {v.model}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {v.vehicle_type || 'Commercial Truck'}
                  </p>
                </div>

                {/* 3. Driver (2 cols) */}
                <div className="md:col-span-2 text-xs text-slate-300 flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{v.driver_name || 'Unassigned'}</span>
                </div>

                {/* 4. Year (1 col) */}
                <div className="md:col-span-1 text-xs text-slate-400">
                  {v.manufacturing_year || '—'}
                </div>

                {/* 5. Status (1 col) */}
                <div className="md:col-span-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {v.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* 6. Action (2 cols) */}
                <div className="md:col-span-2 flex items-center justify-end">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelectVehicle(v.id); }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
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
          5. QUICK ACTIONS: Compact Toolbar (Not Giant 100px Cards)
          ========================================================================= */}
      <section className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-300">
          Quick Actions
        </h3>

        {/* Compact, elegant toolbar button group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Action */}
          <button 
            onClick={onOpenAddVehicle}
            className="btn-primary h-9 px-3.5 text-xs font-bold rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Vehicle
          </button>

          {/* Secondary Actions */}
          <button 
            onClick={onOpenAddDoc}
            className="toolbar-btn h-9"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Document</span>
          </button>

          <button 
            onClick={() => onNavigate('vehicles')}
            className="toolbar-btn h-9"
          >
            <Camera className="w-3.5 h-3.5 text-slate-400" />
            <span>Photo</span>
          </button>

          <button 
            onClick={() => onNavigate('reminders')}
            className="toolbar-btn h-9 relative"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Expiry Radar</span>
            {urgentTotal > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 ml-0.5 animate-pulse" />
            )}
          </button>

          <button 
            onClick={() => onNavigate('expenses')}
            className="toolbar-btn h-9"
          >
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            <span>Expense</span>
          </button>
        </div>
      </section>
    </div>
  );
}
