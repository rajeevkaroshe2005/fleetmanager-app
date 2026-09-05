import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Truck, FileText, User, ArrowRight, Clock } from 'lucide-react';
import { api } from '../services/api';
import { NumberPlate } from './NumberPlate';
import { StatusBadge } from './StatusBadge';

export function GlobalSearchModal({ isOpen, onClose, onSelectVehicle, onSelectDocument }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ vehicles: [], documents: [], drivers: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setResults({ vehicles: [], documents: [], drivers: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ vehicles: [], documents: [], drivers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res || { vehicles: [], documents: [], drivers: [] });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const totalResults = (results.vehicles?.length || 0) + (results.documents?.length || 0) + (results.drivers?.length || 0);

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal-box max-w-xl w-full p-0 overflow-hidden shadow-2xl">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type vehicle number, document type, driver name..."
            className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm font-medium w-full"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded font-mono border border-white/10 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Searching across fleet...</p>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p className="font-bold text-white">No matching fleet records found</p>
              <p className="text-[11px] text-slate-500 mt-1">Try searching by vehicle registration or driver name</p>
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
              <p className="text-slate-300 font-semibold">Quick Fleet Search</p>
              <p className="text-[11px] text-slate-500 mt-1">Find any vehicle, expiry document, or driver instantly</p>
            </div>
          )}

          {/* Vehicles Section */}
          {results.vehicles?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Vehicles ({results.vehicles.length})</span>
              </div>
              <div className="space-y-1">
                {results.vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onClose();
                      onSelectVehicle(v.id);
                    }}
                    className="p-3 rounded-xl hover:bg-white/8 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <NumberPlate number={v.vehicle_number} />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{v.model}</p>
                        <p className="text-[11px] text-slate-400">{v.driver_name || 'No driver assigned'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {results.documents?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Documents ({results.documents.length})</span>
              </div>
              <div className="space-y-1">
                {results.documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onClose();
                      onSelectDocument(d);
                    }}
                    className="p-3 rounded-xl hover:bg-white/8 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{d.document_type}</p>
                        <StatusBadge statusInfo={d.statusInfo} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Truck: <strong className="text-slate-300">{d.vehicle_number}</strong> · Expires: {d.expiry_date}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drivers Section */}
          {results.drivers?.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Drivers ({results.drivers.length})</span>
              </div>
              <div className="space-y-1">
                {results.drivers.map((dr) => (
                  <div
                    key={dr.id}
                    onClick={() => {
                      onClose();
                      if (dr.assigned_vehicle_id) {
                        onSelectVehicle(dr.assigned_vehicle_id);
                      }
                    }}
                    className="p-3 rounded-xl hover:bg-white/8 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{dr.name}</p>
                      <p className="text-[11px] text-slate-400">Phone: {dr.phone} {dr.vehicle_number ? `· Truck: ${dr.vehicle_number}` : ''}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
