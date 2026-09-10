import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle,
  Truck,
  CreditCard,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatusBadge } from '../components/StatusBadge';
import { NumberPlate } from '../components/NumberPlate';
import { api } from '../services/api';

export function DriversView({ 
  drivers = [], 
  vehicles = [], 
  onRefresh, 
  onSelectVehicle 
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [licenceExpiry, setLicenceExpiry] = useState('');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setName('');
    setPhone('');
    setLicenceNumber('');
    setLicenceExpiry('');
    setAssignedVehicleId('');
    setAddress('');
    setEmergencyContact('');
    setNotes('');
    setError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dr) => {
    setEditingDriver(dr);
    setName(dr.name || '');
    setPhone(dr.phone || '');
    setLicenceNumber(dr.licence_number || '');
    setLicenceExpiry(dr.licence_expiry || '');
    setAssignedVehicleId(dr.assigned_vehicle_id ? String(dr.assigned_vehicle_id) : '');
    setAddress(dr.address || '');
    setEmergencyContact(dr.emergency_contact || '');
    setNotes(dr.notes || '');
    setError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Driver full name and contact phone number are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        licence_number: licenceNumber ? licenceNumber.trim() : null,
        licence_expiry: licenceExpiry ? licenceExpiry.trim() : null,
        assigned_vehicle_id: assignedVehicleId ? parseInt(assignedVehicleId, 10) : null,
        address: address ? address.trim() : null,
        emergency_contact: emergencyContact ? emergencyContact.trim() : null,
        notes: notes ? notes.trim() : ''
      };

      if (editingDriver) {
        await api.updateDriver(editingDriver.id, payload);
      } else {
        await api.addDriver(payload);
        confetti({ particleCount: 40, spread: 50 });
      }

      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to save driver details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dr) => {
    if (window.confirm(`Delete driver ${dr.name} permanently?`)) {
      try {
        await api.deleteDriver(dr.id);
        onRefresh();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Commercial Drivers ({drivers.length})
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Manage commercial drivers, truck assignments, contact info, and driving licence expiry status.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd} 
          className="btn-primary h-11 px-5 text-sm font-bold self-start md:self-auto shadow-lg shadow-blue-600/25 rounded-xl shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Driver
        </button>
      </div>

      {/* Drivers Cards Grid */}
      {drivers.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3 bg-[#0B1528] border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No commercial drivers registered yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add drivers to assign them to vehicles and monitor Driving Licence renewals automatically.
          </p>
          <button onClick={handleOpenAdd} className="btn-primary text-xs mt-2 font-bold px-4 py-2">
            + Add First Driver
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((driver) => (
            <div key={driver.id} className="glass-card p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all group bg-[#0B1528] border-white/[0.08]">
              <div>
                {/* Driver Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-400/30 shadow-md shrink-0">
                      {driver.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">
                        {driver.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" /> {driver.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenEdit(driver)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Driver"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(driver)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Driver"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-400" /> Assigned Vehicle:
                    </span>
                    {driver.vehicle_number ? (
                      <button 
                        onClick={() => driver.assigned_vehicle_id && onSelectVehicle(driver.assigned_vehicle_id)}
                        className="font-bold text-blue-400 hover:underline"
                      >
                        {driver.vehicle_number}
                      </button>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Driving Licence:
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {driver.licence_number || 'N/A'}
                    </span>
                  </div>

                  {driver.licence_expiry && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Licence Expiry:
                      </span>
                      <span className="font-extrabold text-slate-200">
                        {driver.licence_expiry}
                      </span>
                    </div>
                  )}

                  {driver.emergency_contact && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                      <span className="text-slate-500">Emergency Contact:</span>
                      <span className="text-slate-400">{driver.emergency_contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Action Button */}
              {driver.phone && (
                <a 
                  href={`tel:${driver.phone}`}
                  className="btn-secondary w-full text-xs text-center justify-center py-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call {driver.name.split(' ')[0]}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {isAddModalOpen && (
        <div className="glass-modal-backdrop">
          <div className="glass-modal-box max-w-lg w-full p-0 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingDriver ? 'Edit Commercial Driver' : 'Add Commercial Driver'}
                  </h3>
                  <p className="text-xs text-slate-400">Driver profile & licence compliance records</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)]">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Driver Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Shinde"
                      className="form-input h-10 text-xs sm:text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Mobile Phone <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="form-input h-10 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Driving Licence Number
                    </label>
                    <input 
                      type="text"
                      value={licenceNumber}
                      onChange={(e) => setLicenceNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. MH09 2018001234"
                      className="form-input h-10 text-xs sm:text-sm font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Licence Expiry Date
                    </label>
                    <input 
                      type="date"
                      value={licenceExpiry}
                      onChange={(e) => setLicenceExpiry(e.target.value)}
                      className="form-input h-10 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Assign to Commercial Vehicle
                  </label>
                  <select 
                    value={assignedVehicleId}
                    onChange={(e) => setAssignedVehicleId(e.target.value)}
                    className="form-select h-10 text-xs sm:text-sm"
                  >
                    <option value="">-- No Vehicle Assigned --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_number} — {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Emergency Contact / Relative Phone
                  </label>
                  <input 
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Brother: +91 94220 54321"
                    className="form-input h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Residential Address
                  </label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home address, city, district..."
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
                  disabled={loading} 
                  className="btn-primary text-xs sm:text-sm px-5 font-bold"
                >
                  {loading ? 'Saving Driver...' : editingDriver ? 'Save Changes' : '+ Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
