import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Calendar, 
  User, 
  Phone, 
  FileText, 
  Camera, 
  Wrench, 
  IndianRupee, 
  Trash2, 
  Edit, 
  Plus, 
  Eye,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';
import { api, getFileUrl } from '../services/api';

export function StitchVehicleDetailSheet({ 
  vehicleId, 
  onClose, 
  onSelectDocument, 
  onOpenAddDoc, 
  onVehicleDeleted, 
  onVehicleUpdated 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('docs'); // 'docs', 'photos', 'maintenance', 'expenses'
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDetail = async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const res = await api.getVehicle(vehicleId);
      setData(res);
    } catch (err) {
      console.error('Fetch vehicle detail error:', err);
      setErrorMsg('Unable to load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [vehicleId]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${data?.vehicle?.vehicle_number}? This will remove all associated records.`)) {
      return;
    }

    try {
      await api.deleteVehicle(vehicleId);
      onVehicleDeleted(vehicleId);
      onClose();
    } catch (err) {
      alert('Failed to delete vehicle: ' + err.message);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
      await api.uploadVehiclePhotos(vehicleId, formData);
      await fetchDetail();
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!vehicleId) return null;

  const vehicle = data?.vehicle;
  const documents = data?.documents || [];
  const photos = data?.photos || [];
  const maintenance = data?.maintenance || [];
  const expenses = data?.expenses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg stitch-sheet h-[92vh] flex flex-col bg-[#131B2E] border-t sm:border border-white/10 sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0D1322] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NumberPlate number={vehicle?.vehicle_number || 'TRUCK'} className="scale-90 origin-left" />
            <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
              {vehicle?.model}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
            <div className="space-y-2 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
              <p>Loading vehicle telemetry...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Specs Strip */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Type</p>
                <p className="text-xs font-bold text-white mt-0.5">{vehicle?.vehicle_type || 'Truck'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Year</p>
                <p className="text-xs font-bold text-white mt-0.5">{vehicle?.manufacturing_year || 'N/A'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Driver</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5 truncate">
                  {vehicle?.driver_name || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Driver Contact bar if assigned */}
            {vehicle?.driver_phone && (
              <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Assigned Driver</p>
                  <p className="font-bold text-white">{vehicle.driver_name}</p>
                </div>
                <a 
                  href={`tel:${vehicle.driver_phone}`}
                  className="stitch-btn-primary h-8 px-3 text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            )}

            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1">
              {[
                { id: 'docs', label: `Docs (${documents.length})`, icon: FileText },
                { id: 'photos', label: `Photos (${photos.length})`, icon: Camera },
                { id: 'maintenance', label: 'Service', icon: Wrench },
                { id: 'expenses', label: 'Expenses', icon: IndianRupee }
              ].map(t => {
                const Icon = t.icon;
                const isSelected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2 px-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB: Documents */}
            {activeTab === 'docs' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Compliance Papers</p>
                  <button
                    onClick={() => onOpenAddDoc(vehicleId)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Document</span>
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/[0.05]">
                    No documents uploaded yet for this vehicle.
                  </div>
                ) : (
                  documents.map((doc) => {
                    const isExpired = doc.statusInfo?.status === 'EXPIRED';
                    const isTomorrow = doc.statusInfo?.status === 'EXPIRES_TOMORROW' || doc.statusInfo?.status === 'EXPIRES_TODAY';
                    const isTwoDays = doc.statusInfo?.status === 'EXPIRES_2_DAYS';

                    return (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDocument(doc)}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">{doc.document_type}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Expires: {doc.expiry_date}
                          </p>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isExpired 
                            ? 'stitch-pill-danger' 
                            : isTomorrow || isTwoDays 
                            ? 'stitch-pill-warning' 
                            : 'stitch-pill-active'
                        }`}>
                          {doc.statusInfo?.label || 'Valid'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: Photos */}
            {activeTab === 'photos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Vehicle Gallery</p>
                  <label className="stitch-btn-primary h-8 px-3 text-xs cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                {photos.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/[0.05]">
                    No photos added. Upload chassis, cabin, or cargo photos.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {photos.map((p) => (
                      <div key={p.id} className="aspect-video rounded-lg overflow-hidden bg-black border border-white/10 relative">
                        <img 
                          src={getFileUrl(p.file_path)} 
                          alt="Vehicle" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Maintenance */}
            {activeTab === 'maintenance' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-white">Maintenance Records</p>
                {maintenance.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/[0.05]">
                    No service logs recorded.
                  </div>
                ) : (
                  maintenance.map((m) => (
                    <div key={m.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{m.maintenance_type}</p>
                        <p className="text-[10px] text-slate-400">{m.service_date} &bull; {m.vendor_name || 'In-House'}</p>
                      </div>
                      <span className="font-mono font-bold text-amber-400">₹{m.amount}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Expenses */}
            {activeTab === 'expenses' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Expense Ledger</p>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Total: ₹{(data?.stats?.totalExpense || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {expenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/[0.05]">
                    No expenses logged for this truck.
                  </div>
                ) : (
                  expenses.map((e) => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{e.category}</p>
                        <p className="text-[10px] text-slate-400">{e.expense_date}</p>
                      </div>
                      <span className="font-mono font-bold text-white">₹{e.amount}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
