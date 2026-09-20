import React, { useState } from 'react';
import { X, UploadCloud, FileText, AlertCircle, Camera, Check } from 'lucide-react';
import { api } from '../services/api';

export function StitchAddDocumentSheet({ 
  isOpen, 
  onClose, 
  onDocumentAdded, 
  vehicles = [], 
  initialVehicleId = '' 
}) {
  const [vehicleId, setVehicleId] = useState(initialVehicleId);
  const [documentType, setDocumentType] = useState('Insurance');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const docTypes = [
    'Insurance',
    'Fitness Certificate',
    'Road Tax',
    'National Permit',
    'State Permit',
    'PUC Certificate',
    'RC Book',
    'Speed Governor',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetVehId = vehicleId || initialVehicleId;
    if (!targetVehId) {
      setErrorMessage('Please select a vehicle from your fleet.');
      return;
    }

    if (!documentType) {
      setErrorMessage('Please select a document type.');
      return;
    }

    if (!expiryDate) {
      setErrorMessage('Please provide an expiry date for compliance tracking.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('vehicle_id', targetVehId);
      formData.append('document_type', documentType);
      formData.append('expiry_date', expiryDate);
      if (documentNumber) formData.append('document_number', documentNumber.trim());
      if (issueDate) formData.append('issue_date', issueDate);
      if (notes) formData.append('notes', notes.trim());
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.addDocument(formData);
      onDocumentAdded(res);
      onClose();
      // Reset
      setDocumentNumber('');
      setIssueDate('');
      setExpiryDate('');
      setNotes('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload document error:', err);
      setErrorMessage('Unable to upload document. Please check the information and try again.');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Upload Document</h2>
              <p className="text-[10px] text-slate-400">Add compliance papers to the digital vault</p>
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

          {/* Vehicle Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Select Vehicle <span className="text-rose-400">*</span>
            </label>
            <select
              value={vehicleId || initialVehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="stitch-input text-xs bg-[#0D1322] cursor-pointer font-mono"
            >
              <option value="">Select a truck...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} — {v.model}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Document Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="stitch-input text-xs bg-[#0D1322] cursor-pointer"
            >
              {docTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Document Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Document Policy / Certificate #</label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g. POL-88902419"
              className="stitch-input font-mono text-xs"
            />
          </div>

          {/* Expiry Date (Critical) & Issue Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-rose-300">
                Expiry Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="stitch-input text-xs font-mono border-rose-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="stitch-input text-xs font-mono"
              />
            </div>
          </div>

          {/* File Upload / Camera Trigger */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Upload PDF or Document Photo</label>
            <div className="stitch-card p-3 border-dashed border-white/20 text-center hover:border-blue-500/50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                {selectedFile ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-white truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB &bull; Tap to change</p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">Tap to upload file or take photo</p>
                    <p className="text-[10px] text-slate-500">PDF, JPG, PNG up to 25MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Insurer name, broker contact, agent info..."
              className="stitch-input text-xs"
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
            {loading ? 'Uploading...' : 'Save Document'}
          </button>
        </div>
      </div>
    </div>
  );
}
