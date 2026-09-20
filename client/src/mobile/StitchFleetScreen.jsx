import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';

export function StitchFleetScreen({ 
  vehicles = [], 
  stats, 
  onSelectVehicle, 
  onOpenAddVehicle, 
  onOpenAddDoc,
  onRefresh
}) {
  const [filter, setFilter] = useState('all'); // all, active, expiring, maintenance
  const [searchQuery, setSearchQuery] = useState('');

  const totalUnits = stats?.totalVehicles ?? vehicles.length;
  const activeUnits = stats?.activeVehicles ?? vehicles.filter(v => v.status === 'active').length;
  const urgentCount = (stats?.expiredDocuments || 0) + (stats?.expiresTomorrow || 0) + (stats?.expires2Days || 0);

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = v.vehicle_number?.toLowerCase().includes(q);
      const matchModel = v.model?.toLowerCase().includes(q);
      const matchDriver = v.driver_name?.toLowerCase().includes(q);
      if (!matchNum && !matchModel && !matchDriver) return false;
    }

    // Tab filter
    if (filter === 'active') return v.status === 'active';
    if (filter === 'maintenance') return v.status === 'maintenance' || v.status === 'inactive';
    if (filter === 'expiring') return v.overallDocStatus === 'EXPIRED' || v.overallDocStatus === 'EXPIRING_SOON';
    return true;
  });

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Telemetry Strip */}
      <section className="grid grid-cols-3 gap-2 px-4 pt-1">
        <div className="stitch-card p-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Fleet</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">{totalUnits}</span>
            <span className="text-[10px] text-slate-500">Units</span>
          </div>
        </div>

        <div className="stitch-card p-3">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">In Service</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">{activeUnits}</span>
            <span className="text-[10px] text-slate-500">Active</span>
          </div>
        </div>

        <div className="stitch-card p-3">
          <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Action Req.</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-rose-400 font-mono tracking-tight">{urgentCount}</span>
            <span className="text-[10px] text-slate-500">Radar</span>
          </div>
        </div>
      </section>

      {/* 2. Filter Pills & Live Search */}
      <section className="px-4 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle number, model, or driver..."
            className="stitch-input pl-9 text-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All (${vehicles.length})` },
            { id: 'active', label: `Active (${activeUnits})` },
            { id: 'expiring', label: `Radar Alert (${urgentCount})` },
            { id: 'maintenance', label: 'Maintenance' }
          ].map((chip) => {
            const isSelected = filter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                    : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Vehicle Cards List */}
      <section className="px-4 space-y-3">
        {filteredVehicles.length === 0 ? (
          <div className="stitch-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No vehicles found</p>
              <p className="text-xs text-slate-400">
                {searchQuery ? 'No match for your search criteria' : 'Add your first commercial truck to get started.'}
              </p>
            </div>
            <button
              onClick={onOpenAddVehicle}
              className="stitch-btn-primary mx-auto text-xs h-10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const hasExpired = vehicle.overallDocStatus === 'EXPIRED';
            const hasExpiring = vehicle.overallDocStatus === 'EXPIRING_SOON';

            return (
              <div 
                key={vehicle.id}
                className="stitch-card p-4 space-y-3 stitch-card-interactive"
                onClick={() => onSelectVehicle(vehicle.id)}
              >
                {/* Header: Number Plate & Status Chip */}
                <div className="flex items-center justify-between gap-2">
                  <NumberPlate number={vehicle.vehicle_number} className="scale-90 origin-left" />

                  <div className="flex items-center gap-1.5">
                    {hasExpired ? (
                      <span className="px-2 py-0.5 rounded-full stitch-pill-danger text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                        Expired
                      </span>
                    ) : hasExpiring ? (
                      <span className="px-2 py-0.5 rounded-full stitch-pill-warning text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Radar
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full stitch-pill-active text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Compliant
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Body: Specs & Driver */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/[0.05]">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Model / Type</p>
                    <p className="text-white font-medium truncate mt-0.5">{vehicle.model}</p>
                    <p className="text-[11px] text-slate-400">{vehicle.vehicle_type || 'Truck'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Assigned Driver</p>
                    <p className="text-white font-medium truncate mt-0.5">
                      {vehicle.driver_name || 'Unassigned'}
                    </p>
                    {vehicle.driver_phone && (
                      <a 
                        href={`tel:${vehicle.driver_phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>{vehicle.driver_phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Telemetry & Quick Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{vehicle.doc_count || 0} documents on file</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddDoc(vehicle.id);
                    }}
                    className="px-2.5 py-1 rounded-md bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/25 font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Doc</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 4. Floating Action Button (FAB) */}
      <button
        onClick={onOpenAddVehicle}
        className="fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-blue-400/30"
        aria-label="Add Vehicle"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
