import React, { useState } from 'react';
import { X, Plus, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export function StitchAddVehicleSheet({ isOpen, onClose, onVehicleAdded, drivers = [] }) {
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'Truck',
    model: '',
    manufacturing_year: new Date().getFullYear(),
    driver_id: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const vehicleTypes = [
    'Truck', 'Trailer', 'Tanker', 'Tipper', 'Container', 'Mini Truck', 'Pickup', 'Van', 'Bus', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.vehicle_number.trim()) {
      setErrorMessage('Please enter the vehicle registration number (e.g. MH 09 GJ 6600)');
      return;
    }

    if (!formData.model.trim()) {
      setErrorMessage('Please enter the vehicle model name (e.g. Tata Signa 4825.T)');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addVehicle({
        vehicle_number: formData.vehicle_number.toUpperCase().trim(),
        vehicle_type: formData.vehicle_type,
        model: formData.model.trim(),
        manufacturing_year: formData.manufacturing_year ? parseInt(formData.manufacturing_year) : null,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
        notes: formData.notes?.trim() || ''
      });

      onVehicleAdded(res);
      onClose();
      // Reset form
      setFormData({
        vehicle_number: '',
        vehicle_type: 'Truck',
        model: '',
        manufacturing_year: new Date().getFullYear(),
        driver_id: '',
        notes: ''
      });
    } catch (err) {
      console.error('Add vehicle error:', err);
      // Clean, user-friendly error message
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('UNIQUE')) {
        setErrorMessage('This registration number is already registered in your fleet.');
      } else {
        setErrorMessage('Unable to save vehicle. Please check the information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg stitch-sheet max-h-[90vh] flex flex-col bg-[#131B2E] border-t sm:border border-white/10 sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Add Fleet Vehicle</h2>
              <p className="text-[10px] text-slate-400">Register a new commercial unit to your ledger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Registration Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.vehicle_number}
              onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
              placeholder="e.g. MH 09 GJ 6600"
              className="stitch-input font-mono uppercase text-sm tracking-wider"
            />
          </div>

          {/* Model Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Vehicle Model <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Tata Signa 4825.T / Eicher Pro 2110"
              className="stitch-input text-sm"
            />
          </div>

          {/* Vehicle Type & Manufacturing Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Vehicle Type</label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="stitch-input text-xs bg-[#0D1322] cursor-pointer"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Year</label>
              <input
                type="number"
                min="1980"
                max={new Date().getFullYear() + 1}
                value={formData.manufacturing_year}
                onChange={(e) => setFormData({ ...formData, manufacturing_year: e.target.value })}
                className="stitch-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Assigned Driver */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Assign Driver</label>
            <select
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              className="stitch-input text-xs bg-[#0D1322] cursor-pointer"
            >
              <option value="">Unassigned (Assign later)</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone || 'No phone'})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Notes / Remarks</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Route allocation, chassis number, or maintenance notes..."
              className="stitch-input !h-auto py-2 text-xs"
            />
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0D1322] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="stitch-btn-secondary h-11 px-4 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="stitch-btn-primary h-11 px-6 text-xs font-bold shadow-lg shadow-blue-600/30"
          >
            {loading ? 'Saving...' : 'Register Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}
