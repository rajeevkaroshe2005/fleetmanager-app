import React, { useState } from 'react';
import { Truck, Lock, Mail, User, Phone, Building, AlertCircle, Eye, EyeOff, ShieldCheck, Smartphone, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export function AuthView({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      confetti({ particleCount: 50, spread: 60 });
      onAuthSuccess(res.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        businessName: businessName.trim()
      });
      confetti({ particleCount: 60, spread: 70 });
      onAuthSuccess(res.user);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please verify the information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[440px] space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30 border border-white/20">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
            FleetManager <span className="text-blue-400">PRO</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Commercial Fleet & Expiry Compliance System
          </p>
        </div>

        {/* Auth Panel */}
        <div className="glass-panel p-7 sm:p-8 space-y-6">
          {/* Tabs: Sign In / Register Fleet */}
          <div className="flex border-b border-white/10 pb-2.5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-1 text-xs font-bold transition-all text-center ${
                !isRegister 
                  ? 'text-blue-400 border-b-2 border-blue-500 -mb-3 pb-2.5 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-1 text-xs font-bold transition-all text-center ${
                isRegister 
                  ? 'text-blue-400 border-b-2 border-blue-500 -mb-3 pb-2.5 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Fleet
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!isRegister ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter owner email address"
                    className="form-input h-11 text-xs sm:text-sm pl-9"
                    required
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="form-input h-11 text-xs sm:text-sm pl-9 pr-10 font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary h-11 text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/35"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Fleet'}
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FLEET FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Fleet Owner Name <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Patil"
                  className="form-input h-10 text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Transport / Business Name
                </label>
                <input 
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Rajesh Transport Logistics"
                  className="form-input h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Contact Phone Number
                </label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="form-input h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@transport.com"
                  className="form-input h-10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="form-input h-10 text-xs pr-10 font-mono"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary h-11 text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/35"
                >
                  {loading ? 'Creating Fleet Account...' : 'Register Fleet Account'}
                </button>
              </div>
            </form>
          )}

          {/* Direct APK Download Banner */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-2">
            <a 
              href="/download/apk" 
              download="FleetManagerPro.apk"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white transition-all text-xs font-bold shadow-sm group"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Download Android App (.APK)</span>
              <Download className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
            </a>
            <p className="text-[11px] text-slate-400 text-center">
              Direct install for Android &bull; Connects 24/7 over 4G/5G
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
