import React, { useState } from 'react';
import { StitchOfflineBanner } from './StitchOfflineBanner';
import { StitchMobileHeader } from './StitchMobileHeader';
import { StitchBottomNav } from './StitchBottomNav';
import { StitchFleetScreen } from './StitchFleetScreen';
import { StitchRadarScreen } from './StitchRadarScreen';
import { StitchDocumentsScreen } from './StitchDocumentsScreen';
import { StitchOperationsScreen } from './StitchOperationsScreen';
import { StitchVehicleDetailSheet } from './StitchVehicleDetailSheet';
import { StitchAddVehicleSheet } from './StitchAddVehicleSheet';
import { StitchAddDocumentSheet } from './StitchAddDocumentSheet';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { SettingsModal } from '../components/SettingsModal';
import { MaintenanceView } from '../views/MaintenanceView';
import { ExpensesView } from '../views/ExpensesView';

export function StitchMobileApp({
  user,
  stats,
  vehicles = [],
  documents = [],
  drivers = [],
  notifications = [],
  unreadCount = 0,
  onRefreshData,
  onLogout
}) {
  const [currentTab, setCurrentTab] = useState('fleet'); // 'fleet', 'radar', 'docs', 'ops', 'maintenance', 'expenses'
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [addDocInitialVehicleId, setAddDocInitialVehicleId] = useState('');
  const [selectedDocumentForModal, setSelectedDocumentForModal] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenAddDoc = (vehicleId = '') => {
    setAddDocInitialVehicleId(vehicleId);
    setIsAddDocOpen(true);
  };

  const handleVehicleAdded = () => {
    onRefreshData();
  };

  const handleVehicleDeleted = () => {
    setSelectedVehicleId(null);
    onRefreshData();
  };

  const handleDocumentAdded = () => {
    onRefreshData();
  };

  return (
    <div className="stitch-canvas min-h-screen flex flex-col font-sans relative antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Offline Network Banner */}
      <StitchOfflineBanner />

      {/* 2. Top Header */}
      <StitchMobileHeader
        user={user}
        stats={stats}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
        onOpenNotifications={() => setCurrentTab('radar')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Screen Viewport */}
      <main className="flex-1 overflow-x-hidden pt-3">
        {currentTab === 'fleet' && (
          <StitchFleetScreen
            vehicles={vehicles}
            stats={stats}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
            onOpenAddDoc={handleOpenAddDoc}
            onRefresh={onRefreshData}
          />
        )}

        {currentTab === 'radar' && (
          <StitchRadarScreen
            stats={stats}
            documents={documents}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            onOpenAddDoc={handleOpenAddDoc}
            onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
          />
        )}

        {currentTab === 'docs' && (
          <StitchDocumentsScreen
            documents={documents}
            vehicles={vehicles}
            stats={stats}
            onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
            onOpenAddDoc={handleOpenAddDoc}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
          />
        )}

        {currentTab === 'ops' && (
          <StitchOperationsScreen
            user={user}
            drivers={drivers}
            stats={stats}
            onLogout={onLogout}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {/* Sub-views reachable from Operations */}
        {currentTab === 'maintenance' && (
          <div className="px-4 pb-28 space-y-4">
            <button
              onClick={() => setCurrentTab('ops')}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              &larr; Back to Operations
            </button>
            <MaintenanceView vehicles={vehicles} />
          </div>
        )}

        {currentTab === 'expenses' && (
          <div className="px-4 pb-28 space-y-4">
            <button
              onClick={() => setCurrentTab('ops')}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              &larr; Back to Operations
            </button>
            <ExpensesView vehicles={vehicles} />
          </div>
        )}
      </main>

      {/* 4. Frosted Bottom Navigation Bar */}
      <StitchBottomNav
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        stats={stats}
      />

      {/* 5. Modals & Bottom Sheets */}
      {selectedVehicleId && (
        <StitchVehicleDetailSheet
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
          onSelectDocument={(doc) => setSelectedDocumentForModal(doc)}
          onOpenAddDoc={handleOpenAddDoc}
          onVehicleDeleted={handleVehicleDeleted}
          onVehicleUpdated={onRefreshData}
        />
      )}

      {isAddVehicleOpen && (
        <StitchAddVehicleSheet
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          onVehicleAdded={handleVehicleAdded}
          drivers={drivers}
        />
      )}

      {isAddDocOpen && (
        <StitchAddDocumentSheet
          isOpen={isAddDocOpen}
          onClose={() => setIsAddDocOpen(false)}
          onDocumentAdded={handleDocumentAdded}
          vehicles={vehicles}
          initialVehicleId={addDocInitialVehicleId}
        />
      )}

      {selectedDocumentForModal && (
        <DocumentViewerModal
          document={selectedDocumentForModal}
          isOpen={!!selectedDocumentForModal}
          onClose={() => setSelectedDocumentForModal(null)}
          onDocumentUpdated={onRefreshData}
          onDocumentDeleted={onRefreshData}
        />
      )}

      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectVehicle={(vId) => {
            setIsSearchOpen(false);
            setSelectedVehicleId(vId);
          }}
          onSelectDocument={(doc) => {
            setIsSearchOpen(false);
            setSelectedDocumentForModal(doc);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
