import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  Calendar, 
  Clock,
  Gauge,
  Truck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { NumberPlate } from '../components/NumberPlate';

const MAINTENANCE_TYPES = [
  'Scheduled Periodic Service',
  'Engine Oil & Filter Change',
  'Tyre Replacement / Rotation',
  'Battery Replacement',
  'Brake & Suspension Overhaul',
  'Clutch / Transmission Repair',
  'Cooling / Radiator Work',
  'Electrical / Wiring Repair',
  'Body / Paint / Welding',
  'Other Repair'
];

export function MaintenanceView({ vehicles = [], onSelectVehicle }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('');

  const [vehicleId, setVehicleId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('Scheduled Periodic Service');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  const [nextServiceKm, setNextServiceKm] = useState('');
  const [amount, setAmount] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getMaintenance(selectedVehicleFilter || null);
      setRecords(res.maintenance || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedVehicleFilter]);

  const handleOpenAdd = (vId = '') => {
    setVehicleId(vId || (vehicles[0]?.id ? String(vehicles[0].id) : ''));
    setMaintenanceType('Scheduled Periodic Service');
    setServiceDate(new Date().toISOString().split('T')[0]);
    setNextServiceDate('');
    setCurrentKm('');
    setNextServiceKm('');
    setAmount('');
    setVendorName('');
    setNotes('');
    setError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!vehicleId || !maintenanceType || !serviceDate) {
      setError('Please fill in vehicle, service type, and date');
      return;
    }

    setSaving(true);
    try {
      await api.addMaintenance({
        vehicle_id: parseInt(vehicleId, 10),
        maintenance_type: maintenanceType,
        service_date: serviceDate,
        next_service_date: nextServiceDate || null,
        current_km: currentKm ? parseInt(currentKm, 10) : null,
        next_service_km: nextServiceKm ? parseInt(nextServiceKm, 10) : null,
        amount: amount ? parseFloat(amount) : 0,
        vendor_name: vendorName.trim(),
        notes: notes.trim()
      });

      confetti({ particleCount: 40, spread: 50 });
      setIsAddModalOpen(false);
      fetchRecords();
    } catch (err) {
      setError(err.message || 'Failed to save maintenance log');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this maintenance record?')) {
      try {
        await api.deleteMaintenance(id);
        fetchRecords();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalCost = records.reduce((acc, r) => acc + (r.amount || 0), 0);
  const upcomingCount = records.filter(r => r.next_service_date && new Date(r.next_service_date) >= new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Maintenance & Service History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track periodic servicing, tyre changes, and workshop costs across your fleet.
          </p>
        </div>

        <button 
          onClick={() => handleOpenAdd()} 
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Log Service
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Services Logged</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">{records.length}</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Workshop Cost</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1 block">
            ₹{totalCost.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="glass-card p-5 col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Upcoming Scheduled</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 block">{upcomingCount}</span>
        </div>
      </div>

      {/* Filter by Vehicle */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <select 
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="form-select h-10 text-xs sm:text-sm"
          >
            <option value="">All Fleet Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicle_number} — {v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
          <Wrench className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
          <h3 className="text-base font-bold text-white">No maintenance records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log periodic oil changes, tyre replacements, and fitness repairs to track upkeep costs.
          </p>
          <button onClick={() => handleOpenAdd()} className="btn-primary text-xs mt-2">
            + Log First Service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div 
              key={r.id}
              className="glass-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-blue-500 hover:bg-white/8 transition-all"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="shrink-0 mt-0.5">
                  <NumberPlate number={r.vehicle_number} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm sm:text-base text-white">{r.maintenance_type}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span>Date: <strong className="text-slate-200">{r.service_date}</strong></span>
                    {r.vendor_name && <span>Vendor: <strong className="text-slate-200">{r.vendor_name}</strong></span>}
                    {r.current_km && <span>Odometer: <strong className="text-slate-200">{r.current_km.toLocaleString('en-IN')} KM</strong></span>}
                  </div>
                  {r.notes && (
                    <p className="text-xs text-slate-400 mt-1.5 italic">"{r.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-left md:text-right">
                  <span className="text-sm sm:text-base font-extrabold text-white block">
                    ₹{r.amount ? r.amount.toLocaleString('en-IN') : '0'}
                  </span>
                  {r.next_service_date && (
                    <span className="text-[11px] text-amber-400 block mt-0.5 font-medium">
                      Next Due: {r.next_service_date}
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Maintenance Modal */}
      {isAddModalOpen && (
        <div className="glass-modal-backdrop">
          <div className="glass-modal-box max-w-lg w-full p-0 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Log Vehicle Maintenance</h3>
                  <p className="text-xs text-slate-400">Record service, parts replaced, and costs</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)]">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Select Commercial Vehicle <span className="text-rose-400">*</span>
                  </label>
                  <select 
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="form-select h-10 text-xs sm:text-sm"
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_number} — {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Maintenance Type <span className="text-rose-400">*</span>
                  </label>
                  <select 
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    className="form-select h-10 text-xs sm:text-sm"
                  >
                    {MAINTENANCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Service Date <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="date"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      className="form-input h-10 text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Total Cost (₹)
                    </label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 8500"
                      className="form-input h-10 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Current Odometer (KM)
                    </label>
                    <input 
                      type="number"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(e.target.value)}
                      placeholder="e.g. 145000"
                      className="form-input h-10 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Next Service Due Date
                    </label>
                    <input 
                      type="date"
                      value={nextServiceDate}
                      onChange={(e) => setNextServiceDate(e.target.value)}
                      className="form-input h-10 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Workshop / Vendor Name
                  </label>
                  <input 
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Authorized Tata Service Center"
                    className="form-input h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Work Description & Replaced Parts
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Replaced 15W40 engine oil, diesel filter, front brake liners..."
                    className="form-textarea text-xs sm:text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 flex items-center justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="btn-secondary text-xs sm:text-sm px-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary text-xs sm:text-sm px-5 font-bold"
                >
                  {saving ? 'Saving...' : '+ Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
