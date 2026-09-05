import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Truck, 
  Calendar,
  AlertCircle,
  FileUp,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const COMMON_DOC_TYPES = [
  'Registration Certificate (RC)',
  'Insurance',
  'PUC (Pollution Under Control)',
  'Fitness Certificate',
  'National Permit',
  'State Permit',
  'Road Tax',
  'Driver Licence',
  'Custom / Other Document'
];

export function AddDocumentModal({ 
  isOpen, 
  onClose, 
  vehicles = [], 
  initialVehicleId = '', 
  onSuccess 
}) {
  const [vehicleId, setVehicleId] = useState(initialVehicleId || '');
  const [docType, setDocType] = useState('Insurance');
  const [customDocType, setCustomDocType] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVehicleId(initialVehicleId || (vehicles[0]?.id ? String(vehicles[0].id) : ''));
      setDocType('Insurance');
      setCustomDocType('');
      setFile(null);
      setFilePreview(null);
      setDocNumber('');
      setIssueDate('');
      setExpiryDate('');
      setNotes('');
      setError('');
    }
  }, [isOpen, initialVehicleId, vehicles]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target.result);
        reader.readAsDataURL(selected);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target.result);
        reader.readAsDataURL(selected);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleScanWithCamera = async () => {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (photo && photo.webPath) {
        const res = await fetch(photo.webPath);
        const blob = await res.blob();
        const ext = photo.format || 'jpeg';
        const docFileName = `doc_scan_${Date.now()}.${ext}`;
        const capturedFile = new File([blob], docFileName, { type: `image/${ext}` });
        setFile(capturedFile);
        setFilePreview(photo.webPath);
      }
    } catch (err) {
      console.log('Camera capture cancelled or fallback:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId) {
      setError('Please select a commercial vehicle');
      return;
    }

    const finalType = docType === 'Custom / Other Document' ? customDocType.trim() : docType;
    if (!finalType) {
      setError('Please enter or select a valid document type');
      return;
    }

    if (!expiryDate) {
      setError('Please select document expiry date');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('vehicle_id', vehicleId);
      formData.append('document_type', finalType);
      formData.append('expiry_date', expiryDate);
      if (docNumber) formData.append('document_number', docNumber.trim());
      if (issueDate) formData.append('issue_date', issueDate);
      if (notes) formData.append('notes', notes.trim());
      if (file) formData.append('file', file);

      await api.addDocument(formData);
      confetti({ particleCount: 50, spread: 60 });
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      console.error('Add document error:', err);
      setError(err.message || 'Failed to upload document. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal-box max-w-2xl w-full p-0 overflow-hidden">
        {/* Sticky Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">Upload Vehicle Document</h2>
              <p className="text-xs text-slate-400">Add documents to activate automated 2-day and 1-day reminders</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 sm:p-7 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Vehicle & Document Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Vehicle <span className="text-rose-400">*</span>
                </label>
                <select 
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="form-select h-11 text-xs sm:text-sm font-medium"
                  required
                >
                  {vehicles.length === 0 ? (
                    <option value="">No vehicles available</option>
                  ) : (
                    vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_number} — {v.model}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Document Type <span className="text-rose-400">*</span>
                </label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="form-select h-11 text-xs sm:text-sm font-medium"
                  required
                >
                  {COMMON_DOC_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {docType === 'Custom / Other Document' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Custom Document Title <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text"
                  value={customDocType}
                  onChange={(e) => setCustomDocType(e.target.value)}
                  placeholder="e.g. Green Tax / Speed Governor Certificate"
                  className="form-input h-11 text-xs sm:text-sm"
                  required
                />
              </div>
            )}

            {/* Document Number & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Document Number
                </label>
                <input 
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. POL/2026/8921"
                  className="form-input h-11 text-xs sm:text-sm font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Issue Date
                </label>
                <input 
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="form-input h-11 text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Expiry Date <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="form-input h-11 text-xs sm:text-sm border-blue-500/40"
                  required
                />
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Upload File or Photo (Optional, PDF / Image)
                </label>
                <button
                  type="button"
                  onClick={handleScanWithCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="Take a photo of physical document with camera"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scan with Camera</span>
                </button>
              </div>

              <div 
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="target-dropzone"
              >
                <input 
                  type="file"
                  id="doc-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
                <label htmlFor="doc-file-input" className="cursor-pointer block">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      <p className="text-xs font-bold text-white">{file.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/25 shadow-inner">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1">
                        Click or drag & drop document file here
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports PDF, PNG, JPG, JPEG up to 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Compliance Notes
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Insurer branch contact, agent name, endorsement info..."
                className="form-textarea text-xs sm:text-sm resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary text-xs sm:text-sm px-4"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary text-xs sm:text-sm px-5 font-bold"
            >
              {loading ? 'Uploading...' : '+ Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
