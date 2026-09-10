import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  User, 
  FileText, 
  ChevronRight, 
  CheckCircle2,
  Calendar,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';
import { StatusBadge } from '../components/StatusBadge';

export function VehiclesView({ 
  vehicles = [], 
  onSelectVehicle, 
  onOpenAddVehicle, 
  onOpenAddDoc 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE, EXPIRING, EXPIRED
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driver_name && v.driver_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') {
      return v.status === 'active';
    }
    if (statusFilter === 'INACTIVE') {
      return v.status === 'inactive' || v.status === 'maintenance';
    }
    if (statusFilter === 'EXPIRING') {
      return v.overallDocStatus === 'EXPIRING_SOON';
    }
    if (statusFilter === 'EXPIRED') {
      return v.overallDocStatus === 'EXPIRED';
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Commercial Fleet ({vehicles.length})
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Real-time commercial truck register, driver assignments, and vehicle compliance status.
          </p>
        </div>

        <button 
          onClick={onOpenAddVehicle}
          className="btn-primary h-11 px-5 text-sm font-bold self-start md:self-auto shadow-lg shadow-blue-600/25 rounded-xl shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Vehicle
        </button>
      </div>

      {/* Search, Filter Tabs & Grid/List Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate (e.g. MH 09), model, driver..."
            className="form-input pl-10 h-11 text-xs sm:text-sm rounded-xl"
          />
        </div>

        {/* Status Filters & View Mode */}
        <div className="flex items-center justify-between md:justify-end gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            {[
              { id: 'ALL', label: 'All Fleet' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'EXPIRING', label: 'Expiring Soon' },
              { id: 'EXPIRED', label: 'Expired' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid / List Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3 bg-[#0B1528] border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No vehicles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No commercial vehicles matched "${searchQuery}". Try adjusting your search query or status filter.` 
              : 'Add your first commercial truck to begin tracking insurance, fitness, permit & PUCC documents.'}
          </p>
          <button 
            onClick={onOpenAddVehicle} 
            className="btn-primary text-xs mt-2 font-bold px-4 py-2"
          >
            + Add Vehicle
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Unlumen Glass Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const hasExpired = vehicle.overallDocStatus === 'EXPIRED';
            const hasExpiring = vehicle.overallDocStatus === 'EXPIRING_SOON';

            return (
              <div 
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle.id)}
                className="glass-card p-6 cursor-pointer hover:border-blue-500/40 hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-5 group bg-[#0B1528] border-white/[0.08]"
              >
                {/* Card Top: Number Plate, Status & Type */}
                <div className="flex items-start justify-between gap-3">
                  <NumberPlate number={vehicle.vehicle_number} />
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    vehicle.status === 'active' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                  }`}>
                    {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Model & Make */}
                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">
                    {vehicle.model}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{vehicle.vehicle_type || 'Commercial Truck'}</span>
                    {vehicle.manufacturing_year && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span>Year {vehicle.manufacturing_year}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Driver & Documents Health */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Driver:
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {vehicle.driver_name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
                    <span className="text-slate-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Compliance:
                    </span>
                    {hasExpired ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Expired Doc
                      </span>
                    ) : hasExpiring ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Expiring Soon
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Valid
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: View Details CTA */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 font-bold transition-colors">
                  <span>View Full Profile</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW (Responsive Table) */
        <div className="glass-panel overflow-hidden bg-[#0B1528] border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/[0.08] text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Vehicle Plate</th>
                  <th className="p-4">Model & Type</th>
                  <th className="p-4">Assigned Driver</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredVehicles.map((vehicle) => (
                  <tr 
                    key={vehicle.id}
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      <NumberPlate number={vehicle.vehicle_number} />
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block text-xs">{vehicle.model}</span>
                      <span className="text-slate-400 text-[11px]">{vehicle.vehicle_type}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.driver_name || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      {vehicle.overallDocStatus === 'EXPIRED' ? (
                        <span className="badge badge-expired">Expired</span>
                      ) : vehicle.overallDocStatus === 'EXPIRING_SOON' ? (
                        <span className="badge badge-amber">Expiring Soon</span>
                      ) : (
                        <span className="badge badge-valid">Valid</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        vehicle.status === 'active' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                          : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                      }`}>
                        {vehicle.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(vehicle.id);
                        }}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
