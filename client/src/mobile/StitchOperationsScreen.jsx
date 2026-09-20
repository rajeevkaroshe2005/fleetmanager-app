import React, { useState } from 'react';
import { 
  Users, 
  Wrench, 
  IndianRupee, 
  Settings, 
  LogOut, 
  Server, 
  Smartphone, 
  ChevronRight,
  ShieldCheck,
  Phone,
  Plus
} from 'lucide-react';
import { api, getServerUrl, setServerUrl } from '../services/api';

export function StitchOperationsScreen({ 
  user, 
  drivers = [], 
  stats, 
  onLogout, 
  onOpenSettings,
  onNavigateTab
}) {
  const [activeSubTab, setActiveSubTab] = useState('menu'); // 'menu', 'drivers', 'server'
  const [customServerUrl, setCustomServerUrl] = useState(getServerUrl());
  const [serverStatusMsg, setServerStatusMsg] = useState('');
  const [testingServer, setTestingServer] = useState(false);

  const handleSaveServer = async () => {
    setTestingServer(true);
    setServerStatusMsg('Testing connection...');
    try {
      const ok = await api.testServerConnection(customServerUrl);
      if (ok) {
        setServerUrl(customServerUrl);
        setServerStatusMsg('✓ Connected successfully!');
      } else {
        setServerStatusMsg('⚠ Server responded with an error. Check URL.');
      }
    } catch (e) {
      setServerStatusMsg(`✕ Failed to reach server: ${e.message}`);
    } finally {
      setTestingServer(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-1">
      {/* User Profile Card */}
      <div className="stitch-card p-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm overflow-hidden shrink-0">
          <img 
            src="/screen.png" 
            alt="User" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerText = user?.name ? user.name.slice(0, 2).toUpperCase() : 'FM';
            }}
          />
        </div>

        <div className="truncate min-w-0">
          <h2 className="text-sm font-bold text-white tracking-tight truncate">
            {user?.name || 'Fleet Director'}
          </h2>
          <p className="text-xs text-slate-300 truncate">
            {user?.businessName || 'Transport Logistics Pro'}
          </p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {user?.email || 'owner@fleet.com'}
          </p>
        </div>
      </div>

      {/* Main Operations List */}
      <div className="stitch-card divide-y divide-white/[0.06] overflow-hidden">
        {/* Drivers Module */}
        <button
          onClick={() => setActiveSubTab(activeSubTab === 'drivers' ? 'menu' : 'drivers')}
          className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Fleet Drivers</p>
              <p className="text-[10px] text-slate-400">{drivers.length} drivers on payroll</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${activeSubTab === 'drivers' ? 'rotate-90' : ''}`} />
        </button>

        {/* Expanded Drivers Section */}
        {activeSubTab === 'drivers' && (
          <div className="p-3 bg-[#0D1322] space-y-2 border-t border-white/[0.06]">
            {drivers.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 text-center">No drivers registered in fleet.</p>
            ) : (
              drivers.map((dr) => (
                <div key={dr.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{dr.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Licence: {dr.licence_number || 'N/A'}</p>
                    {dr.vehicle_number && (
                      <p className="text-[10px] text-blue-400">Assigned: {dr.vehicle_number}</p>
                    )}
                  </div>
                  {dr.phone && (
                    <a 
                      href={`tel:${dr.phone}`}
                      className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Maintenance Logs */}
        <button
          onClick={() => onNavigateTab('maintenance')}
          className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Service &amp; Maintenance</p>
              <p className="text-[10px] text-slate-400">Tyres, oil changes, engine logs</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Expense Tracker */}
        <button
          onClick={() => onNavigateTab('expenses')}
          className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Expenses &amp; Fuel</p>
              <p className="text-[10px] text-slate-400">₹{(stats?.thisMonthExpenses || 0).toLocaleString('en-IN')} this month</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Server URL & Cloud Config */}
        <button
          onClick={() => setActiveSubTab(activeSubTab === 'server' ? 'menu' : 'server')}
          className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">API Server Endpoint</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{getServerUrl() || 'Default relative /api'}</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${activeSubTab === 'server' ? 'rotate-90' : ''}`} />
        </button>

        {/* Expanded Server Config */}
        {activeSubTab === 'server' && (
          <div className="p-4 bg-[#0D1322] space-y-3 border-t border-white/[0.06] text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Backend API URL</label>
              <input
                type="text"
                value={customServerUrl}
                onChange={(e) => setCustomServerUrl(e.target.value)}
                placeholder="https://fleetmanager-app.onrender.com"
                className="stitch-input text-xs"
              />
              <p className="text-[10px] text-slate-500">
                Use for physical phones connecting to cloud Render backend or local Wi-Fi IP.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveServer}
                disabled={testingServer}
                className="stitch-btn-primary h-9 px-4 text-xs"
              >
                {testingServer ? 'Verifying...' : 'Save & Connect'}
              </button>

              <button
                onClick={() => {
                  setCustomServerUrl('');
                  setServerUrl('');
                  setServerStatusMsg('Reset to default');
                }}
                className="stitch-btn-secondary h-9 px-3 text-xs"
              >
                Reset Default
              </button>
            </div>

            {serverStatusMsg && (
              <p className="text-xs font-mono text-slate-300">{serverStatusMsg}</p>
            )}
          </div>
        )}

        {/* Android APK Direct Download */}
        <a
          href="/download/apk"
          download="FleetManagerPro.apk"
          className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer text-left transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Download Native Android APK</p>
              <p className="text-[10px] text-slate-400">Install FleetManager Pro on your phone</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </a>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={onLogout}
        className="w-full h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Fleet</span>
      </button>
    </div>
  );
}
