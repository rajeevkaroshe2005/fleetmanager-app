import React, { useState } from 'react';
import { 
  X, 
  Download, 
  RefreshCw, 
  Trash2, 
  FileText, 
  UploadCloud, 
  AlertCircle,
  Calendar,
  Truck,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { NumberPlate } from './NumberPlate';
import { api } from '../services/api';

export function DocumentViewerModal({ document, isOpen, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !document) return null;

  const handleStartEdit = () => {
    setExpiryDate(document.expiry_date || '');
    setDocNumber(document.document_number || '');
    setNotes(document.notes || '');
    setNewFile(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setError('');
    if (!expiryDate) {
      setError('Expiry date is required');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('expiry_date', expiryDate);
      formData.append('document_number', docNumber);
      formData.append('notes', notes);
      if (newFile) formData.append('file', newFile);

      await api.updateDocument(document.id, formData);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${document.document_type} permanently?`)) {
      setLoading(true);
      try {
        await api.deleteDocument(document.id);
        if (onDelete) onDelete();
        onClose();
      } catch (err) {
        alert(err.message || 'Failed to delete document');
      } finally {
        setLoading(false);
      }
    }
  };

  const isPdf = document.file_path && (document.file_path.toLowerCase().endsWith('.pdf') || document.file_type === 'pdf');
  const isImage = document.file_path && (
    document.file_path.toLowerCase().endsWith('.jpg') || 
    document.file_path.toLowerCase().endsWith('.jpeg') || 
    document.file_path.toLowerCase().endsWith('.png') ||
    document.file_path.toLowerCase().endsWith('.webp')
  );

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal-box max-w-2xl w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-white">{document.document_type}</h2>
                <StatusBadge statusInfo={document.statusInfo} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>Truck:</span>
                <strong className="text-white">{document.vehicle_number}</strong>
                {document.document_number && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{document.document_number}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Issue Date</span>
              <span className="font-bold text-white mt-0.5 block">{document.issue_date || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Expiry Date</span>
              <span className="font-bold text-white mt-0.5 block">{document.expiry_date}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[11px]">Reminder Status</span>
              <span className="font-bold text-blue-400 mt-0.5 block">{document.statusInfo?.label || 'Active'}</span>
            </div>
          </div>

          {/* File Preview Area */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Attached Document Preview
            </h4>

            {document.file_path ? (
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40 p-4 text-center">
                {isImage ? (
                  <img 
                    src={document.file_path} 
                    alt={document.document_type} 
                    className="max-h-72 mx-auto rounded-lg object-contain shadow-lg"
                  />
                ) : isPdf ? (
                  <div className="py-8 space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-blue-400" />
                    <p className="text-xs text-slate-300 font-bold">PDF Document File</p>
                    <a 
                      href={document.file_path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                    </a>
                  </div>
                ) : (
                  <div className="py-8 space-y-2">
                    <FileText className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="text-xs text-slate-300">File attached</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-3">
                  <a 
                    href={document.file_path} 
                    download 
                    className="btn-secondary text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Original File
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/15 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p>No document scan/image was uploaded for this record.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Click "Edit / Replace" below to attach a scan.</p>
              </div>
            )}
          </div>

          {/* Inline Edit Form */}
          {isEditing ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-4">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Edit Expiry & Replace File
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Expiry Date <span className="text-rose-400">*</span>
                  </label>
                  <input 
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="form-input text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Document Number
                  </label>
                  <input 
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">
                  Replace File (Optional)
                </label>
                <input 
                  type="file"
                  onChange={(e) => setNewFile(e.target.files[0])}
                  className="form-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">
                  Notes
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-textarea text-xs resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveEdit} 
                  disabled={loading} 
                  className="btn-primary text-xs"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sticky Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 flex items-center justify-between gap-3 shrink-0">
          <button 
            type="button" 
            onClick={handleDelete} 
            disabled={loading}
            className="btn-danger text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Document
          </button>

          <div className="flex items-center gap-2.5">
            {!isEditing && (
              <button 
                type="button" 
                onClick={handleStartEdit} 
                className="btn-secondary text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Renew / Edit
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-primary text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
