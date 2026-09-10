import React, { useState } from 'react';
import { X, Truck, AlertCircle, Calendar, User, FileText, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export function AddVehicleModal({ isOpen, onClose, drivers = [], onSuccess }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [purchaseDate, setPurchaseDate] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [driverId, setDriverId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setVehicleNumber('');
    setVehicleType('Truck');
    setModel('');
    setYear(new Date().getFullYear());
    setPurchaseDate('');
    setOwnerName('');
    setDriverId('');
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNum = vehicleNumber.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!cleanNum) {
      setError('Please enter the vehicle registration number (e.g. MH 09 GJ 6600)');
      return;
    }
    if (!model.trim()) {
      setError('Please enter the model name (e.g. Eicher Pro 2110 / Tata Signa)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicle_number: cleanNum,
        vehicle_type: vehicleType || 'Truck',
        model: model.trim(),
        manufacturing_year: (year && !isNaN(parseInt(year, 10))) ? parseInt(year, 10) : null,
        purchase_date: (purchaseDate && purchaseDate.trim()) ? purchaseDate.trim() : null,
        owner_name: (ownerName && ownerName.trim()) ? ownerName.trim() : null,
        driver_id: (driverId && !isNaN(parseInt(driverId, 10)) && parseInt(driverId, 10) > 0) ? parseInt(driverId, 10) : null,
        notes: (notes && notes.trim()) ? notes.trim() : ''
      };

      await api.addVehicle(payload);

      confetti({ particleCount: 50, spread: 60 });
      resetForm();
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Add vehicle error:', err);
      setError(err.message || 'Unable to save vehicle. Please check the vehicle details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-modal-backdrop p-3 sm:p-4">
      <div className="glass-modal-box max-w-2xl w-full p-0 overflow-hidden shadow-2xl border border-white/[0.12] bg-[#0B1528] rounded-2xl">
        {/* Sticky Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#081020] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shadow-md shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Register Commercial Vehicle</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add vehicle details to track insurance, fitness, permit & PUCC compliance</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(88vh-140px)]">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Section 1: Identification */}
            <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300 pb-2 border-b border-white/[0.06]">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Vehicle Identification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Registration Number <span className="text-rose-400">*</span>
                  </label>
                  <input 
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH 09 GJ 6600"
                    className="form-input h-11 font-mono uppercase font-bold tracking-wider text-sm"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400">Official commercial plate number (RTO format).</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Vehicle Type
                  </label>
                  <select 
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="form-select h-11 text-xs sm:text-sm font-medium"
                  >
                    <option value="Truck">Standard Truck</option>
                    <option value="Multi-Axle Truck">Multi-Axle Truck</option>
                    <option value="Tractor Trailer">Tractor Trailer</option>
                    <option value="Container Truck">Container Truck</option>
                    <option value="Tipper / Dumper">Tipper / Dumper</option>
                    <option value="Mini Truck / Pickup">Mini Truck / Pickup</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Classification of commercial transport.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Model & Make <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Eicher Pro 2110 / Tata Signa 4825.TK"
                  className="form-input h-11 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Section 2: Specifications & Purchase */}
            <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300 pb-2 border-b border-white/[0.06]">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Specifications & Ownership</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Manufacturing Year
                  </label>
                  <input 
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="1970"
                    max="2050"
                    className="form-input h-11 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Purchase Date
                  </label>
                  <input 
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="form-input h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Owner / Registered Entity Name
                </label>
                <input 
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rajesh Transport Logistics"
                  className="form-input h-11 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Section 3: Driver & Assignment */}
            <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-300 pb-2 border-b border-white/[0.06]">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Driver Assignment & Operational Notes</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Assigned Driver
                </label>
                <select 
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="form-select h-11 text-xs sm:text-sm font-medium"
                >
                  <option value="">-- No Driver Assigned --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Can be assigned or reassigned later at any time.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Operational Notes
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular Pune-Bangalore route, GPS unit serial, chassis number..."
                  className="form-textarea text-xs sm:text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#070E1C] flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn-secondary text-xs sm:text-sm px-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary text-xs sm:text-sm px-5 font-bold"
            >
              {loading ? 'Saving Vehicle...' : '+ Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
