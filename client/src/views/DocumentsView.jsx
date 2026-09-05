import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Download,
  Truck,
  Eye,
  ShieldAlert,
  Clock,
  XCircle,
  FileCheck
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { NumberPlate } from '../components/NumberPlate';

export function DocumentsView({ 
  documents = [], 
  vehicles = [], 
  onSelectDocument, 
  onOpenAddDoc, 
  onSelectVehicle 
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, EXPIRED, TOMORROW, TWO_DAYS, VALID
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  // Group and count documents
  const expiredDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRED');
  const tomorrowDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRES_TOMORROW' || d.statusInfo?.status === 'EXPIRES_TODAY');
  const twoDaysDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRES_2_DAYS');
  const validDocs = documents.filter(d => d.statusInfo?.status === 'VALID');

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'EXPIRED' && doc.statusInfo?.status !== 'EXPIRED') return false;
    if (activeTab === 'TOMORROW' && doc.statusInfo?.status !== 'EXPIRES_TOMORROW' && doc.statusInfo?.status !== 'EXPIRES_TODAY') return false;
    if (activeTab === 'TWO_DAYS' && doc.statusInfo?.status !== 'EXPIRES_2_DAYS') return false;
    if (activeTab === 'VALID' && doc.statusInfo?.status !== 'VALID') return false;

    if (selectedVehicleFilter && String(doc.vehicle_id) !== String(selectedVehicleFilter)) return false;
    if (selectedTypeFilter && doc.document_type !== selectedTypeFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVehicle = doc.vehicle_number?.toLowerCase().includes(q);
      const matchType = doc.document_type?.toLowerCase().includes(q);
      const matchNumber = doc.document_number?.toLowerCase().includes(q);
      if (!matchVehicle && !matchType && !matchNumber) return false;
    }

    return true;
  });

  const uniqueDocTypes = Array.from(new Set(documents.map(d => d.document_type))).filter(Boolean);

  const handleDownload = (e, doc) => {
    e.stopPropagation();
    if (doc.file_path) {
      const link = document.createElement('a');
      link.href = doc.file_path;
      link.download = doc.file_name || `${doc.vehicle_number}_${doc.document_type.replace(/\s+/g, '_')}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`No file scan was uploaded for this ${doc.document_type} record. Click 'View / Edit' to upload a document scan.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Compliance & Document Expiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track RTO documents with automated <strong className="text-amber-400">2-day</strong> and <strong className="text-orange-400">1-day</strong> renewal reminders.
          </p>
        </div>

        <button 
          onClick={() => onOpenAddDoc()} 
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {/* Top Statistics Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`glass-card p-4 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
            activeTab === 'ALL' ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/15' : 'hover:border-white/20'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Docs</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">{documents.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPIRED')}
          className={`glass-card p-4 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
            activeTab === 'EXPIRED' ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/20' : 'hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Expired</span>
            {expiredDocs.length > 0 && <span className="pulse-dot bg-rose-500"></span>}
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1 block">{expiredDocs.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('TOMORROW')}
          className={`glass-card p-4 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
            activeTab === 'TOMORROW' ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-500/20' : 'hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">Tomorrow</span>
            {tomorrowDocs.length > 0 && <span className="pulse-dot bg-orange-500"></span>}
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-orange-400 mt-1 block">{tomorrowDocs.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('TWO_DAYS')}
          className={`glass-card p-4 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
            activeTab === 'TWO_DAYS' ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/20' : 'hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">In 2 Days</span>
            {twoDaysDocs.length > 0 && <span className="pulse-dot bg-amber-500"></span>}
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 block">{twoDaysDocs.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('VALID')}
          className={`glass-card p-4 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] col-span-2 sm:col-span-1 ${
            activeTab === 'VALID' ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/20' : 'hover:border-emerald-500/40'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Valid</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block">{validDocs.length}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document type, number, truck..."
            className="form-input pl-9 h-10 text-xs sm:text-sm"
          />
        </div>

        <div>
          <select 
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="form-select h-10 text-xs sm:text-sm"
          >
            <option value="">All Fleet Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.vehicle_number} — {v.model}</option>
            ))}
          </select>
        </div>

        <div>
          <select 
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="form-select h-10 text-xs sm:text-sm"
          >
            <option value="">All Document Types</option>
            {uniqueDocTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
          <h3 className="text-base font-bold text-white">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedVehicleFilter || selectedTypeFilter || activeTab !== 'ALL'
              ? 'No documents matched the current filters. Try changing or resetting filters.'
              : 'Upload your vehicle documents (RC, Insurance, Fitness, Permits) to monitor renewals.'}
          </p>
          <button 
            onClick={() => onOpenAddDoc()} 
            className="btn-primary text-xs mt-2"
          >
            + Upload Document
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const status = doc.statusInfo?.status;
            let borderAccent = 'border-l-blue-500';
            if (status === 'EXPIRED') borderAccent = 'border-l-rose-500';
            else if (status === 'EXPIRES_TOMORROW' || status === 'EXPIRES_TODAY') borderAccent = 'border-l-orange-500';
            else if (status === 'EXPIRES_2_DAYS') borderAccent = 'border-l-amber-500';
            else if (status === 'VALID') borderAccent = 'border-l-emerald-500';

            return (
              <div 
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className={`glass-card p-4 sm:p-5 cursor-pointer hover:bg-white/8 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${borderAccent} group`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0">
                    <NumberPlate number={doc.vehicle_number} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors truncate">
                        {doc.document_type}
                      </h4>
                      <StatusBadge statusInfo={doc.statusInfo} size="sm" />
                      {doc.file_path && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          <FileCheck className="w-3 h-3" /> File attached
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      {doc.document_number && (
                        <span className="font-mono text-slate-300 font-semibold">{doc.document_number}</span>
                      )}
                      {doc.issue_date && (
                        <span>Issued: {doc.issue_date}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right mr-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Expiry Date
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold ${
                      status === 'EXPIRED' ? 'text-rose-400' : status === 'EXPIRES_TOMORROW' ? 'text-orange-400' : status === 'EXPIRES_2_DAYS' ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {doc.expiry_date}
                    </span>
                  </div>

                  {/* PROMINENT DOWNLOAD OPTION */}
                  {doc.file_path ? (
                    <button
                      onClick={(e) => handleDownload(e, doc)}
                      className="btn-secondary text-xs py-1.5 px-3 font-semibold text-cyan-300 hover:text-white"
                      title="Download attached document file"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> Download
                    </button>
                  ) : (
                    <span 
                      className="text-[11px] text-slate-500 italic px-2 py-1"
                      title="No file scan attached. Click View to upload one."
                    >
                      No file
                    </span>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDocument(doc);
                    }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
