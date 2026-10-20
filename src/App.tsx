import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PublicFeed } from './components/PublicFeed';
import { AdminPortal } from './components/AdminPortal';
import { SavarMapHotspots } from './components/SavarMapHotspots';
import { MyReports } from './components/MyReports';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { RegistrationModal } from './components/RegistrationModal';
import { NewComplaintModal } from './components/NewComplaintModal';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal';
import { LoadBalancerModal } from './components/LoadBalancerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { NetworkStatusBar } from './components/NetworkStatusBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, toast, clearToast, isLoadBalancerOpen, setIsLoadBalancerOpen } = useApp();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* Network Connectivity Status Bar (Handles Online/Offline gracefully) */}
      <NetworkStatusBar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-500'
              : toast.type === 'warning'
              ? 'bg-amber-900/95 text-white border-amber-500'
              : 'bg-slate-900/95 text-white border-slate-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>
            <button
              onClick={clearToast}
              className="text-white/60 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      {/* Main Content Area wrapped in nested Error Boundary protection */}
      <ErrorBoundary>
        <motion.main 
          key={activeView}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grow w-full"
        >
          {activeView === 'feed' && <PublicFeed />}
          {activeView === 'admin-portal' && <AdminPortal />}
          {activeView === 'map-view' && <SavarMapHotspots />}
          {activeView === 'my-reports' && <MyReports />}
          {activeView === 'emergency' && <EmergencyDirectory />}
        </motion.main>
      </ErrorBoundary>

      {/* Modals */}
      <RegistrationModal />
      <NewComplaintModal />
      <ComplaintDetailsModal />
      <LoadBalancerModal isOpen={isLoadBalancerOpen} onClose={() => setIsLoadBalancerOpen(false)} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
