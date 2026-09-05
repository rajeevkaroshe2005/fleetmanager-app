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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Commercial Fleet ({vehicles.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your trucks, assigned drivers, and document validity in one place.
          </p>
        </div>

        <button 
          onClick={onOpenAddVehicle}
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Search, Filter Tabs & Grid/List Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle plate (e.g. MH 09), model, driver..."
            className="form-input pl-9 h-10 text-xs sm:text-sm"
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
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
          <Truck className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
          <h3 className="text-base font-bold text-white">No vehicles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No commercial vehicles matched "${searchQuery}". Try clearing search or filters.` 
              : 'Add your first commercial truck to start managing vehicle documents, reminders and expenses.'}
          </p>
          <button 
            onClick={onOpenAddVehicle} 
            className="btn-primary text-xs mt-2"
          >
            + Add Vehicle
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Glass Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((vehicle) => {
            const hasExpired = vehicle.overallDocStatus === 'EXPIRED';
            const hasExpiring = vehicle.overallDocStatus === 'EXPIRING_SOON';

            return (
              <div 
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle.id)}
                className="glass-card p-5 cursor-pointer hover:border-blue-500/40 hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top: Number Plate, Status & Type */}
                <div className="flex items-start justify-between gap-2">
                  <NumberPlate number={vehicle.vehicle_number} />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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
                  <p className="text-xs text-slate-400 mt-0.5">{vehicle.vehicle_type || 'Commercial Truck'}</p>
                </div>

                {/* Driver & Documents Health */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" /> Driver:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {vehicle.driver_name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" /> Compliance:
                    </span>
                    {hasExpired ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Expired Doc
                      </span>
                    ) : hasExpiring ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Expiring Soon
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> All Valid
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: View Details CTA */}
                <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs text-slate-400 group-hover:text-blue-400 font-semibold transition-colors">
                  <span>View Full Profile</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW (Responsive Table) */
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Vehicle Number</th>
                  <th className="p-4">Model & Type</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVehicles.map((vehicle) => (
                  <tr 
                    key={vehicle.id}
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      <NumberPlate number={vehicle.vehicle_number} />
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{vehicle.model}</span>
                      <span className="text-slate-400 text-[11px]">{vehicle.vehicle_type}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {vehicle.driver_name || 'Unassigned'}
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
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {vehicle.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(vehicle.id);
                        }}
                        className="btn-secondary text-xs py-1 px-2.5"
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
