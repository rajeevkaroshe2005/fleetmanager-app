import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  Truck, 
  Download, 
  Plus, 
  Search,
  MessageSquare,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { NumberPlate } from '../components/NumberPlate';

export function ExpiryRemindersView({ 
  documents = [], 
  vehicles = [], 
  onSelectDocument, 
  onOpenAddDoc, 
  onSelectVehicle 
}) {
  const [filter, setFilter] = useState('URGENT'); // URGENT, EXPIRED, TOMORROW, TWO_DAYS, ALL
  const [searchQuery, setSearchQuery] = useState('');

  const expiredDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRED');
  const tomorrowDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRES_TOMORROW' || d.statusInfo?.status === 'EXPIRES_TODAY');
  const twoDaysDocs = documents.filter(d => d.statusInfo?.status === 'EXPIRES_2_DAYS');
  const validDocs = documents.filter(d => d.statusInfo?.status === 'VALID');

  const urgentDocs = [...expiredDocs, ...tomorrowDocs, ...twoDaysDocs];

  const filteredList = documents.filter(doc => {
    const status = doc.statusInfo?.status;

    if (filter === 'URGENT') {
      if (status !== 'EXPIRED' && status !== 'EXPIRES_TOMORROW' && status !== 'EXPIRES_TODAY' && status !== 'EXPIRES_2_DAYS') {
        return false;
      }
    } else if (filter === 'EXPIRED') {
      if (status !== 'EXPIRED') return false;
    } else if (filter === 'TOMORROW') {
      if (status !== 'EXPIRES_TOMORROW' && status !== 'EXPIRES_TODAY') return false;
    } else if (filter === 'TWO_DAYS') {
      if (status !== 'EXPIRES_2_DAYS') return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVehicle = doc.vehicle_number?.toLowerCase().includes(q);
      const matchType = doc.document_type?.toLowerCase().includes(q);
      const matchNumber = doc.document_number?.toLowerCase().includes(q);
      if (!matchVehicle && !matchType && !matchNumber) return false;
    }

    return true;
  });

  const handleCopyAlert = (doc) => {
    const text = `[FLEET REMINDER] Document "${doc.document_type}" for truck ${doc.vehicle_number} expires on ${doc.expiry_date}. Status: ${doc.statusInfo?.label || 'Action required'}. Please arrange renewal immediately.`;
    navigator.clipboard.writeText(text);
    alert('Reminder text copied to clipboard! You can paste it in WhatsApp or SMS.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-amber-400" />
            Expiry Radar & Automated Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated alerts active at strictly <strong className="text-amber-400">2 days</strong> and <strong className="text-orange-400">1 day</strong> before renewal deadlines.
          </p>
        </div>

        <button 
          onClick={() => onOpenAddDoc()} 
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Top 3 Reminder Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expired */}
        <button
          onClick={() => setFilter('EXPIRED')}
          className={`glass-card p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
            filter === 'EXPIRED' ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/15' : 'hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Expired Documents</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-rose-400 block mt-2">{expiredDocs.length}</span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Immediate compliance violation</span>
          </div>
        </button>

        {/* Expiring Tomorrow (1 Day) */}
        <button
          onClick={() => setFilter('TOMORROW')}
          className={`glass-card p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
            filter === 'TOMORROW' ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-500/15' : 'hover:border-orange-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Expiring Tomorrow (1-Day)</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-orange-400 block mt-2">{tomorrowDocs.length}</span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">24 hours remaining for renewal</span>
          </div>
        </button>

        {/* Expiring in 2 Days */}
        <button
          onClick={() => setFilter('TWO_DAYS')}
          className={`glass-card p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
            filter === 'TWO_DAYS' ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/15' : 'hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Expiring in 2 Days</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-amber-400 block mt-2">{twoDaysDocs.length}</span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Early renewal warning alert</span>
          </div>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto shrink-0">
          {[
            { id: 'URGENT', label: `All Actions (${urgentDocs.length})` },
            { id: 'EXPIRED', label: `Expired (${expiredDocs.length})` },
            { id: 'TOMORROW', label: `Tomorrow (${tomorrowDocs.length})` },
            { id: 'TWO_DAYS', label: `In 2 Days (${twoDaysDocs.length})` },
            { id: 'ALL', label: `All Docs (${documents.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle or doc..."
            className="form-input pl-9 h-10 text-xs"
          />
        </div>
      </div>

      {/* Reminders List */}
      {filteredList.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 opacity-80" />
          <h3 className="text-base font-bold text-white">No pending reminders in this view!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'URGENT' 
              ? 'Great news! All vehicle documents and driver licences are valid and beyond the 2-day reminder threshold.'
              : 'No documents match the selected filter category.'}
          </p>
          <button 
            onClick={() => setFilter('ALL')} 
            className="btn-secondary text-xs mt-2"
          >
            View All Fleet Documents
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((doc) => {
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
                className={`glass-card p-4 sm:p-5 cursor-pointer hover:bg-white/8 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${borderAccent} group`}
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
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {doc.document_number ? `Number: ${doc.document_number} · ` : ''}
                      Expiry: <strong className="text-slate-200">{doc.expiry_date}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAlert(doc);
                    }}
                    className="btn-secondary text-xs py-1.5 px-2.5 text-slate-300 hover:text-white"
                    title="Copy WhatsApp / SMS reminder template"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Share Alert
                  </button>

                  {doc.file_path && (
                    <a 
                      href={doc.file_path} 
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="btn-secondary text-xs py-1.5 px-2.5 text-slate-300 hover:text-white"
                      title="Download attached document"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> Download
                    </a>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDocument(doc);
                    }}
                    className="btn-primary text-xs py-1.5 px-3 font-semibold"
                  >
                    Inspect
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
