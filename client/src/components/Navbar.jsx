import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Menu,
  CheckCheck, 
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ShieldAlert,
  LogOut,
  Settings,
  User,
  ChevronDown,
  FileText,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  BarChart3
} from 'lucide-react';
import { api } from '../services/api';

const TAB_TITLES = {
  dashboard: 'Fleet Overview',
  vehicles: 'Vehicle Fleet',
  vehicle_profile: 'Vehicle Details',
  documents: 'Documents & Compliance',
  reminders: 'Expiry & Reminders',
  drivers: 'Drivers Management',
  maintenance: 'Service & Maintenance',
  expenses: 'Fleet Expenses',
  reports: 'Analytics & Reports'
};

export function Navbar({ 
  user, 
  onLogout, 
  currentTab,
  onNavigate, 
  onOpenSearch, 
  onSelectVehicle, 
  onOpenMobileMenu,
  onOpenSettings,
  unreadNotificationCount = 0, 
  notifications = [], 
  onRefreshNotifications 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.markNotificationRead(notif.id);
        onRefreshNotifications();
      }
      setShowNotifications(false);
      if (notif.vehicle_id) {
        onSelectVehicle(notif.vehicle_id);
      } else {
        onNavigate('reminders');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pageTitle = TAB_TITLES[currentTab] || 'Dashboard';
  const userInitials = user?.businessName 
    ? user.businessName.slice(0, 2).toUpperCase()
    : user?.name ? user.name.slice(0, 2).toUpperCase() : 'RT';

  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 bg-[#050A14]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between gap-4">
      {/* Left: Mobile Drawer Button & Current Page Heading */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block truncate">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Fleet</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-blue-400 font-semibold">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Center/Right Section: Search Bar + Notification + User Menu */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search Trigger Button */}
        <button 
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 bg-[#0B1530] hover:bg-[#101E42] border border-white/10 hover:border-blue-500/40 rounded-xl px-3 sm:px-4 py-2 text-slate-400 hover:text-slate-200 transition-all shadow-inner group w-44 sm:w-72 md:w-80 text-left"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
          <span className="text-xs text-slate-400 group-hover:text-slate-200 font-medium truncate">
            Search vehicle, doc...
          </span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-white/10 shrink-0">
            Ctrl K
          </kbd>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-[#0B1530] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 relative transition-colors"
            title="Expiry Reminders & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md shadow-rose-500/50 animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Notification Popover Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-[#0B1530] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <span className="font-extrabold text-xs text-white">Compliance & Expiry Alerts</span>
                </div>
                {unreadNotificationCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
                    <p className="font-bold text-white">All caught up!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No pending 2-day or 1-day reminders.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isExpired = n.notification_type === 'expired';
                    const isOneDay = n.notification_type === 'one_day' || n.title?.toLowerCase().includes('tomorrow');

                    return (
                      <div 
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-blue-500/10' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isExpired ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : isOneDay ? (
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${!n.is_read ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 bg-white/5 border-t border-white/10 text-center">
                <button 
                  onClick={() => { setShowNotifications(false); onNavigate('reminders'); }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                >
                  View Expiry Radar →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Redesigned SaaS User Profile Capsule & Dropdown Menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-200 group cursor-pointer ${
              showUserMenu 
                ? 'bg-blue-600/25 border-blue-500/60 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30' 
                : 'bg-[#0B1528] hover:bg-[#111F3C] border-white/10 hover:border-blue-500/40'
            }`}
            title="Fleet Account & Settings"
          >
            {/* Avatar with gradient ring & active status dot */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-extrabold text-xs shadow-md ring-1 ring-white/20 tracking-wider">
                {userInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07111F]"></span>
            </div>

            {/* Profile Label: Name & Subtitle */}
            <div className="hidden sm:flex flex-col text-left min-w-0 pr-0.5">
              <span className="text-xs font-bold text-white max-w-[110px] truncate leading-tight group-hover:text-blue-200 transition-colors">
                {user?.businessName || user?.name || 'Fleet Owner'}
              </span>
              <span className="text-[10px] font-semibold text-blue-400 leading-tight">
                Fleet Owner
              </span>
            </div>

            {/* Smooth rotating chevron */}
            <ChevronDown 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180 text-blue-400' : 'group-hover:text-white'
              }`} 
            />
          </button>

          {/* Enhanced SaaS User Profile Dropdown Card */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0A1326] border border-white/15 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/40">
              {/* Top Gradient Accent Strip */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500"></div>

              {/* Profile Identity Card */}
              <div className="p-4 bg-gradient-to-b from-white/[0.06] to-transparent border-b border-white/10 space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-xl shadow-blue-600/30 ring-2 ring-white/20 shrink-0 tracking-wider">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-white truncate tracking-tight">
                      {user?.name || 'Fleet Manager'}
                    </h3>
                    {user?.businessName && (
                      <p className="text-xs text-blue-300 font-semibold truncate flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{user.businessName}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {user?.email || 'owner@fleetmanager.com'}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Fleet Owner</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>System Active</span>
                  </div>
                </div>
              </div>

              {/* Navigation & Management Actions */}
              <div className="p-2.5 space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/8 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                        Fleet Settings & Profile
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Company info, policy & demo reset
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('reports');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/8 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        Executive Reports & Audits
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Compliance registry & CSV exports
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('vehicles');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/8 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Commercial Vehicle Registry
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Truck details & allocated drivers
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('reminders');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/8 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Expiry Radar & Reminders
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        2-Day & 1-Day urgency warnings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              </div>

              {/* Sign Out Section */}
              <div className="p-3 border-t border-white/10 bg-black/30 space-y-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 transition-all duration-150 shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-rose-400 group-hover:text-white transition-colors" />
                    <span>Log Out of Fleet</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>

                <div className="text-center pt-1 text-[10px] text-slate-500 font-medium">
                  FleetManager Pro · Active Session
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
