import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Building, 
  Mail, 
  Phone, 
  User, 
  AlertTriangle,
  Smartphone,
  Check,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export function SettingsModal({ isOpen, onClose, user, onResetDemoData }) {
  const [serverUrl, setServerUrlState] = useState(api.getServerUrl() || '');
  const [testStatus, setTestStatus] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTestStatus('testing');
    try {
      const ok = await api.testServerConnection(serverUrl);
      setTestStatus(ok ? 'success' : 'failed');
    } catch {
      setTestStatus('failed');
    }
  };

  const handleSaveUrl = () => {
    api.setServerUrl(serverUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="glass-modal-backdrop">
      <div className="glass-modal-box max-w-lg w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Fleet Settings & Info</h2>
              <p className="text-xs text-slate-400">Account overview & compliance configuration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Fleet Profile Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Fleet Owner Profile
            </h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-blue-400" /> Business Name
                </span>
                <span className="font-bold text-white">{user?.businessName || 'Rajesh Transport'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Owner Name
                </span>
                <span className="font-bold text-white">{user?.name || 'Rajesh Patil'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
                </span>
                <span className="font-medium text-slate-200">{user?.email || 'rajesh@transport.com'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> Contact Phone
                </span>
                <span className="font-medium text-slate-200">{user?.phone || '+91 98220 12345'}</span>
              </div>
            </div>
          </div>

          {/* Compliance & Reminders Policy */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Automated Reminder Policy
            </h3>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Standard Expiry Engine Active</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                System automatically scans all RC, Insurance, PUC, Fitness, and Driver Licences every 30 seconds.
                Triggers compliance notifications exactly:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                <li><strong className="text-amber-400">2 Days Before Expiry</strong> (Early warning alert)</li>
                <li><strong className="text-orange-400">1 Day Before Expiry</strong> (Urgent action alert)</li>
                <li><strong className="text-rose-400">Expired</strong> (Immediate compliance hold)</li>
              </ul>
            </div>
          </div>

          {/* Mobile & Server Connection */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile App & Server Connection</span>
            </h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Backend Server URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrlState(e.target.value)}
                      placeholder="e.g. http://10.150.152.80:5000"
                      className="form-input text-xs pl-8 h-9"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testStatus === 'testing'}
                    className="btn-secondary text-xs px-3 h-9 shrink-0"
                  >
                    {testStatus === 'testing' ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUrl}
                    className="btn-primary text-xs px-3 h-9 shrink-0"
                  >
                    {saveSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : 'Save'}
                  </button>
                </div>
              </div>

              {testStatus === 'success' && (
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Server reachable! Status: 200 OK
                </p>
              )}
              {testStatus === 'failed' && (
                <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unable to reach server. Make sure node server is running.
                </p>
              )}
              {saveSuccess && (
                <p className="text-[11px] text-cyan-400 font-semibold">
                  ✓ Server URL saved for mobile app.
                </p>
              )}

              <p className="text-[10px] text-slate-400 leading-relaxed">
                When running as a native Android app, use your host machine's Wi-Fi IP (<code className="text-cyan-300">http://10.150.152.80:5000</code>) or standard emulator host (<code className="text-cyan-300">http://10.0.2.2:5000</code>).
              </p>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Data Management
            </h3>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white">Reset Demo Fleet Data</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reload sample commercial trucks, test documents, and 2-day/1-day reminders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResetDemoData();
                }}
                className="btn-secondary text-xs shrink-0 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Sample Data
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-primary text-xs"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
