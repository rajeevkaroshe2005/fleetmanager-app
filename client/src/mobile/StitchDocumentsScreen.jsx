import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Truck,
  Eye
} from 'lucide-react';
import { NumberPlate } from '../components/NumberPlate';
import { getFileUrl } from '../services/api';

export function StitchDocumentsScreen({ 
  documents = [], 
  vehicles = [], 
  stats, 
  onSelectDocument, 
  onOpenAddDoc, 
  onSelectVehicle 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const docTypes = ['ALL', 'Insurance', 'Fitness Certificate', 'Road Tax', 'National Permit', 'PUC Certificate'];

  const filteredDocs = documents.filter(doc => {
    // Type filter
    if (selectedType !== 'ALL' && doc.document_type !== selectedType) {
      return false;
    }

    // Vehicle filter
    if (selectedVehicleId && String(doc.vehicle_id) !== String(selectedVehicleId)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchType = doc.document_type?.toLowerCase().includes(q);
      const matchNum = doc.document_number?.toLowerCase().includes(q);
      const matchVeh = doc.vehicle_number?.toLowerCase().includes(q);
      if (!matchType && !matchNum && !matchVeh) return false;
    }

    return true;
  });

  const totalDocs = documents.length;
  const validDocs = documents.filter(d => d.statusInfo?.status === 'VALID').length;
  const complianceRate = totalDocs > 0 ? Math.round((validDocs / totalDocs) * 100) : 100;

  return (
    <div className="space-y-4 pb-28 px-4 pt-1">
      {/* 1. Compliance Score Banner */}
      <section className="stitch-card p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Fleet Compliance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{complianceRate}%</span>
            <span className="text-xs text-slate-400">({validDocs}/{totalDocs} valid)</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            {totalDocs - validDocs === 0 ? '✓ 100% compliant across all assets' : `${totalDocs - validDocs} action items pending`}
          </p>
        </div>

        <button
          onClick={() => onOpenAddDoc()}
          className="stitch-btn-primary h-10 px-3.5 text-xs shrink-0 shadow-sm shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Upload</span>
        </button>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document name, number, or truck..."
            className="stitch-input pl-9 text-xs"
          />
        </div>

        {/* Document Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {docTypes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedType === t 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                  : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {t === 'ALL' ? `All Types (${totalDocs})` : t}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Document Cards List */}
      <section className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="stitch-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No documents found</p>
              <p className="text-xs text-slate-400">
                {searchQuery || selectedType !== 'ALL' 
                  ? 'Try clearing the search or category filters.' 
                  : 'Upload insurance, fitness, permit or tax receipts for your fleet.'}
              </p>
            </div>
            <button
              onClick={() => onOpenAddDoc()}
              className="stitch-btn-primary mx-auto text-xs h-9 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const status = doc.statusInfo?.status || 'VALID';
            const isExpired = status === 'EXPIRED';
            const isTomorrow = status === 'EXPIRES_TOMORROW' || status === 'EXPIRES_TODAY';
            const isTwoDays = status === 'EXPIRES_2_DAYS';

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className="stitch-card p-4 space-y-2.5 stitch-card-interactive"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                        {doc.vehicle_number}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate">
                        {doc.document_type}
                      </h3>
                    </div>

                    {doc.document_number && (
                      <p className="text-xs text-slate-400 font-mono">
                        Doc #: {doc.document_number}
                      </p>
                    )}
                  </div>

                  {/* Status Pill */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    isExpired 
                      ? 'stitch-pill-danger' 
                      : isTomorrow || isTwoDays 
                      ? 'stitch-pill-warning' 
                      : 'stitch-pill-active'
                  }`}>
                    {doc.statusInfo?.label || 'Valid'}
                  </span>
                </div>

                {/* Expiry Details & View Action */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs">
                  <div className="text-slate-400 font-mono text-[11px]">
                    Expires: <span className="text-white font-medium">{doc.expiry_date}</span>
                    {doc.statusInfo?.days !== null && (
                      <span className="text-slate-500 ml-1.5">
                        ({doc.statusInfo?.description})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDocument(doc);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
