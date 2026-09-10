import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './views/DashboardView';
import { VehiclesView } from './views/VehiclesView';
import { VehicleProfileView } from './views/VehicleProfileView';
import { DocumentsView } from './views/DocumentsView';
import { ExpiryRemindersView } from './views/ExpiryRemindersView';
import { DriversView } from './views/DriversView';
import { MaintenanceView } from './views/MaintenanceView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { AuthView } from './views/AuthView';
import { AddDocumentModal } from './components/AddDocumentModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { api } from './services/api';

export function App() {
  const [user, setUser] = useState(api.getCurrentUser());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Core fleet state
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals state
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [addDocInitialVehicleId, setAddDocInitialVehicleId] = useState('');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedDocumentForModal, setSelectedDocumentForModal] = useState(null);

  // Load all fleet data for the authenticated user
  const loadFleetData = useCallback(async () => {
    if (!user) return;
    try {
      const [statsRes, vehiclesRes, docsRes, driversRes, notifRes] = await Promise.all([
        api.getStats().catch(() => null),
        api.getVehicles().catch(() => ({ vehicles: [] })),
        api.getDocuments().catch(() => ({ documents: [] })),
        api.getDrivers().catch(() => ({ drivers: [] })),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }))
      ]);

      if (statsRes) setStats(statsRes);
      if (vehiclesRes?.vehicles) setVehicles(vehiclesRes.vehicles);
      if (docsRes?.documents) setDocuments(docsRes.documents);
      if (driversRes?.drivers) setDrivers(driversRes.drivers);
      if (notifRes?.notifications) {
        setNotifications(notifRes.notifications);
        setUnreadCount(notifRes.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching fleet data:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFleetData();
      const interval = setInterval(loadFleetData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadFleetData]);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K for search)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Native Mobile Integration (Status Bar & Android Hardware Back Button)
  useEffect(() => {
    let backListener;

    async function initMobile() {
      try {
        if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
          await StatusBar.setBackgroundColor({ color: '#050B14' }).catch(() => {});

          const { App: CapApp } = await import('@capacitor/app');
          backListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
            if (isAddDocOpen) { setIsAddDocOpen(false); return; }
            if (isAddVehicleOpen) { setIsAddVehicleOpen(false); return; }
            if (isSearchOpen) { setIsSearchOpen(false); return; }
            if (isSettingsOpen) { setIsSettingsOpen(false); return; }
            if (selectedDocumentForModal) { setSelectedDocumentForModal(null); return; }
            if (isMobileDrawerOpen) { setIsMobileDrawerOpen(false); return; }

            if (currentTab === 'vehicle_profile') {
              setCurrentTab('vehicles');
              return;
            }

            if (currentTab !== 'dashboard') {
              setCurrentTab('dashboard');
              return;
            }

            if (canGoBack) {
              window.history.back();
            } else {
              CapApp.exitApp();
            }
          });
        }
      } catch (err) {
        // Fallback gracefully in web mode
      }
    }

    initMobile();

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, [
    isAddDocOpen, 
    isAddVehicleOpen, 
    isSearchOpen, 
    isSettingsOpen, 
    selectedDocumentForModal, 
    isMobileDrawerOpen, 
    currentTab
  ]);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setStats(null);
    setVehicles([]);
    setDocuments([]);
    setDrivers([]);
    setNotifications([]);
    setCurrentTab('dashboard');
  };

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setCurrentTab('vehicle_profile');
  };

  const handleOpenAddDoc = (vehicleId = '') => {
    setAddDocInitialVehicleId(vehicleId);
    setIsAddDocOpen(true);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo trucks, compliance documents, and 2-day/1-day reminders to initial sample state?')) {
      try {
        await api.resetDemoData();
        await loadFleetData();
        setCurrentTab('dashboard');
        alert('Fleet data successfully refreshed!');
      } catch (e) {
        alert(e.message);
      }
    }
  };

  if (!user) {
    return <AuthView onAuthSuccess={(u) => { setUser(u); }} />;
  }

  return (
    <div className="min-h-screen bg-[#050A14] text-slate-100 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Left Deep Navy Glass Sidebar (Fixed on Desktop & Drawer on Mobile) */}
      <Sidebar 
        currentTab={currentTab}
        onNavigate={(tab) => { 
          setCurrentTab(tab); 
          setSelectedVehicleId(null); 
          setIsMobileDrawerOpen(false);
        }}
        stats={stats}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Top Navbar */}
        <Navbar 
          user={user}
          currentTab={currentTab}
          onLogout={handleLogout}
          onNavigate={(tab) => { setCurrentTab(tab); setSelectedVehicleId(null); }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectVehicle={handleSelectVehicle}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unreadNotificationCount={unreadCount}
          notifications={notifications}
          onRefreshNotifications={loadFleetData}
        />

        {/* Scrollable Page Body with Generous SaaS Spacing */}
        <main className="flex-1 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-9 pb-28 lg:pb-12 max-w-[1440px] w-full mx-auto overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView 
              stats={stats}
              vehicles={vehicles}
              user={user}
              onNavigate={(tab) => { setCurrentTab(tab); setSelectedVehicleId(null); }}
              onSelectVehicle={handleSelectVehicle}
              onOpenAddDoc={() => handleOpenAddDoc()}
              onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
              onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
            />
          )}

          {currentTab === 'vehicles' && (
            <VehiclesView 
              vehicles={vehicles}
              onSelectVehicle={handleSelectVehicle}
              onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
              onOpenAddDoc={() => handleOpenAddDoc()}
            />
          )}

          {currentTab === 'vehicle_profile' && (
            <VehicleProfileView 
              vehicleId={selectedVehicleId}
              onBack={() => { setCurrentTab('vehicles'); loadFleetData(); }}
              onOpenAddDoc={(vId) => handleOpenAddDoc(vId)}
              onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
              onOpenAddMaintenance={(vId) => setCurrentTab('maintenance')}
              onOpenAddExpense={(vId) => setCurrentTab('expenses')}
              onDeleteVehicle={() => { loadFleetData(); setCurrentTab('vehicles'); }}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView 
              documents={documents}
              vehicles={vehicles}
              onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
              onOpenAddDoc={() => handleOpenAddDoc()}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {currentTab === 'reminders' && (
            <ExpiryRemindersView 
              documents={documents}
              vehicles={vehicles}
              onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
              onOpenAddDoc={() => handleOpenAddDoc()}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {currentTab === 'drivers' && (
            <DriversView 
              drivers={drivers}
              vehicles={vehicles}
              onRefresh={loadFleetData}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {currentTab === 'maintenance' && (
            <MaintenanceView 
              vehicles={vehicles}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView 
              vehicles={vehicles}
              onSelectVehicle={handleSelectVehicle}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView 
              vehicles={vehicles}
              documents={documents}
              stats={stats}
              user={user}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav 
        currentTab={currentTab}
        onNavigate={(tab) => { setCurrentTab(tab); setSelectedVehicleId(null); }}
        stats={stats}
      />

      {/* Add Document Modal */}
      <AddDocumentModal 
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        vehicles={vehicles}
        initialVehicleId={addDocInitialVehicleId}
        onSuccess={loadFleetData}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal 
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        drivers={drivers}
        onSuccess={loadFleetData}
      />

      {/* Document Viewer / Replacer Modal */}
      <DocumentViewerModal 
        document={selectedDocumentForModal}
        isOpen={!!selectedDocumentForModal}
        onClose={() => setSelectedDocumentForModal(null)}
        onUpdate={loadFleetData}
        onDelete={loadFleetData}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectVehicle={handleSelectVehicle}
        onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onResetDemoData={handleResetData}
      />
    </div>
  );
}

export default App;
