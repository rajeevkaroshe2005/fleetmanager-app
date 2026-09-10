import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Truck, 
  FileText, 
  User, 
  Wrench, 
  IndianRupee, 
  Camera, 
  Phone, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  UploadCloud, 
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  FileCheck
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

export function VehicleProfileView({ 
  vehicleId, 
  onBack, 
  onOpenAddDoc, 
  onSelectDocument,
  onOpenAddMaintenance,
  onOpenAddExpense,
  onDeleteVehicle
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents'); // documents, driver, maintenance, expenses, photos
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getVehicle(vehicleId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchProfile();
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-300">Loading vehicle profile...</p>
      </div>
    );
  }

  if (!data || !data.vehicle) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
        <h3 className="text-base font-bold text-white">Vehicle Not Found</h3>
        <button onClick={onBack} className="btn-secondary text-xs mt-2">
          ← Back to Vehicles
        </button>
      </div>
    );
  }

  const { vehicle, documents = [], photos = [], maintenance = [], expenses = [], stats } = data;

  const expiredDocsCount = documents.filter(d => d.statusInfo?.status === 'EXPIRED').length;
  const expiringDocsCount = documents.filter(d => d.statusInfo?.status === 'EXPIRES_TOMORROW' || d.statusInfo?.status === 'EXPIRES_2_DAYS' || d.statusInfo?.status === 'EXPIRES_TODAY').length;

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
      await api.uploadVehiclePhotos(vehicle.id, formData);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Delete this photo permanently?')) {
      try {
        await api.deleteVehiclePhoto(vehicle.id, photoId);
        fetchProfile();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const handleDeleteVehicle = async () => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.vehicle_number}? All associated documents, expenses, and logs will be deleted.`)) {
      try {
        await api.deleteVehicle(vehicle.id);
        if (onDeleteVehicle) {
          onDeleteVehicle();
        } else {
          onBack();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete vehicle');
      }
    }
  };

  const handleDownloadDoc = (e, doc) => {
    e.stopPropagation();
    if (doc.file_path) {
      const link = document.createElement('a');
      link.href = doc.file_path;
      link.download = doc.file_name || `${vehicle.vehicle_number}_${doc.document_type.replace(/\s+/g, '_')}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`No file scan was uploaded for this ${doc.document_type}. Click 'Inspect' to attach a scan.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="btn-secondary text-xs py-2 px-4 font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vehicles
        </button>

        <button 
          onClick={handleDeleteVehicle}
          className="btn-danger text-xs py-2 px-4 font-semibold inline-flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Truck
        </button>
      </div>

      {/* Vehicle Hero Header Card */}
      <div className="glass-panel p-6 sm:p-8 space-y-7 bg-[#0B1528] border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold border border-blue-400/30 shadow-lg shadow-blue-500/15 shrink-0">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <NumberPlate number={vehicle.vehicle_number} />
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  vehicle.status === 'active' 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}>
                  {vehicle.status === 'active' ? 'Active Fleet' : 'Inactive'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                {vehicle.model}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {vehicle.vehicle_type || 'Commercial Vehicle'} · Manufacturing Year: {vehicle.manufacturing_year || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onOpenAddDoc(vehicle.id)}
              className="btn-primary h-11 px-5 text-sm font-bold shadow-lg shadow-blue-600/25 rounded-xl shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Document
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/[0.08] text-xs">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-slate-400 block text-xs font-semibold">Total Documents</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{documents.length}</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-slate-400 block text-xs font-semibold">Compliance Status</span>
            <span className={`text-base font-extrabold mt-1 block ${
              expiredDocsCount > 0 ? 'text-rose-400' : expiringDocsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {expiredDocsCount > 0 ? `${expiredDocsCount} Expired` : expiringDocsCount > 0 ? `${expiringDocsCount} Expiring` : 'All Valid'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-slate-400 block text-xs font-semibold">Service Logs</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{maintenance.length}</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-slate-400 block text-xs font-semibold">Recorded Expenses</span>
            <span className="text-xl font-extrabold text-purple-400 mt-1 block">
              ₹{expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: 'documents', label: 'Documents & Expiry', count: documents.length, icon: FileText },
          { id: 'driver', label: 'Driver Details', icon: User },
          { id: 'maintenance', label: 'Maintenance Logs', count: maintenance.length, icon: Wrench },
          { id: 'expenses', label: 'Expenses', count: expenses.length, icon: IndianRupee },
          { id: 'photos', label: 'Vehicle Photos', count: photos.length, icon: Camera },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Compliance Records ({documents.length})</h3>
            <button onClick={() => onOpenAddDoc(vehicle.id)} className="btn-primary text-xs py-1.5 px-3">
              <Plus className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="glass-panel p-10 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm font-bold text-white">No documents uploaded for this truck</p>
              <p className="text-xs text-slate-400">Upload RC, Insurance, PUC, or Fitness certificate to track reminders.</p>
              <button onClick={() => onOpenAddDoc(vehicle.id)} className="btn-primary text-xs mt-2">
                + Upload First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="glass-card p-5 cursor-pointer hover:border-blue-500/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">
                        {doc.document_type}
                      </h4>
                      {doc.document_number && (
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{doc.document_number}</p>
                      )}
                    </div>
                    <StatusBadge statusInfo={doc.statusInfo} size="sm" />
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expiry Date:</span>
                      <span className="font-extrabold text-white">{doc.expiry_date}</span>
                    </div>
                    {doc.issue_date && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Issued On:</span>
                        <span className="text-slate-300">{doc.issue_date}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs">
                    {doc.file_path ? (
                      <button 
                        onClick={(e) => handleDownloadDoc(e, doc)}
                        className="btn-secondary text-xs py-1 px-2.5 text-cyan-300"
                        title="Download attached file"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" /> Download Scan
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">No file attached</span>
                    )}

                    <span className="text-blue-400 font-semibold group-hover:underline">Inspect Document →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: DRIVER */}
      {activeTab === 'driver' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 max-w-xl space-y-4">
            <h3 className="font-extrabold text-sm text-white border-b border-white/10 pb-3">
              Assigned Commercial Driver
            </h3>

            {vehicle.driver_name ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Driver Name</span>
                  <span className="font-bold text-white text-sm">{vehicle.driver_name}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Phone Contact</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{vehicle.driver_phone || 'N/A'}</span>
                    {vehicle.driver_phone && (
                      <a href={`tel:${vehicle.driver_phone}`} className="btn-secondary text-[11px] py-1 px-2.5">
                        <Phone className="w-3 h-3 text-emerald-400" /> Call
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Driver Licence</span>
                  <span className="font-mono text-slate-200 font-bold">{vehicle.driver_licence || 'On file'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <User className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
                <p className="text-sm font-bold text-white">No driver currently assigned</p>
                <p className="text-xs text-slate-400">Assign a driver from the Drivers tab to track driver licence validity.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Service & Repair History</h3>
            <button onClick={() => onOpenAddMaintenance(vehicle.id)} className="btn-primary text-xs py-1.5 px-3">
              <Plus className="w-3.5 h-3.5" /> Add Maintenance Log
            </button>
          </div>

          {maintenance.length === 0 ? (
            <div className="glass-panel p-10 text-center text-slate-400 space-y-2">
              <Wrench className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm font-bold text-white">No maintenance logged yet</p>
              <p className="text-xs text-slate-400">Log oil changes, tyre rotations, brake overhauls, and periodic services.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {maintenance.map((m) => (
                <div key={m.id} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-blue-500">
                  <div>
                    <h4 className="font-bold text-sm text-white">{m.maintenance_type}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Service Date: {m.service_date} · {m.vendor_name ? `Vendor: ${m.vendor_name}` : 'Self workshop'}
                    </p>
                    {m.notes && <p className="text-[11px] text-slate-400 mt-1 italic">"{m.notes}"</p>}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-extrabold text-white block">
                      ₹{m.amount ? m.amount.toLocaleString('en-IN') : '0'}
                    </span>
                    {m.next_service_date && (
                      <span className="text-[11px] text-amber-400 block mt-0.5 font-medium">
                        Next Due: {m.next_service_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Truck Expenses</h3>
            <button onClick={() => onOpenAddExpense(vehicle.id)} className="btn-primary text-xs py-1.5 px-3">
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="glass-panel p-10 text-center text-slate-400 space-y-2">
              <IndianRupee className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm font-bold text-white">No expenses recorded for this truck</p>
              <p className="text-xs text-slate-400">Track diesel costs, tolls, permits, driver allowances, and repairs.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {expenses.map((exp) => (
                <div key={exp.id} className="glass-card p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{exp.category}</span>
                      <span className="text-[11px] text-slate-400">· {exp.expense_date}</span>
                    </div>
                    {exp.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{exp.description}</p>
                    )}
                  </div>

                  <span className="font-extrabold text-sm text-purple-400 shrink-0">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: PHOTOS */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Vehicle Gallery ({photos.length})</h3>
            <label className="btn-primary text-xs py-1.5 px-3 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
                disabled={uploadingPhotos}
              />
            </label>
          </div>

          {photos.length === 0 ? (
            <div className="glass-panel p-10 text-center text-slate-400 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="text-sm font-bold text-white">No truck photos uploaded yet</p>
              <p className="text-xs text-slate-400">Upload exterior, interior, chassis, or odometer photos for inspection records.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="glass-card overflow-hidden group relative aspect-video bg-black/40 rounded-xl">
                  <img 
                    src={photo.file_path} 
                    alt="Vehicle photograph" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a 
                      href={photo.file_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30"
                      title="View Full Size"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
