import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  X, 
  ListFilter, 
  MapPin, 
  User, 
  PhoneCall, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles, 
  Globe, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Code2,
  Server
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    isAdmin,
    language,
    setLanguage,
    setIsRegisterOpen,
    setIsNewComplaintOpen,
    toggleAdminRole,
    complaints,
    setIsLoadBalancerOpen,
  } = useApp();

  if (!isOpen) return null;

  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const solvedCount = complaints.filter((c) => c.status === 'solved').length;

  const handleNavClick = (view: 'feed' | 'my-reports' | 'admin-portal' | 'map-view' | 'emergency') => {
    setActiveView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-slate-200">
        
        {/* Top Header */}
        <div>
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">
                  {language === 'bn' ? 'সাভার সার্ভিস হাব' : 'Savar Service Hub'}
                </h3>
                <span className="text-[10px] text-emerald-200">ডিজিটাল নাগরিক পোর্টাল</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Summary Card */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            {currentUser ? (
              <div 
                onClick={() => {
                  setIsRegisterOpen(true);
                  onClose();
                }}
                className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 1) : 'U'}
                </div>
                <div className="overflow-hidden grow">
                  <div className="font-bold text-xs text-slate-800 truncate">{currentUser.name}</div>
                  <div className="text-[11px] font-mono text-emerald-700 truncate">{currentUser.mobile}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentUser.area}</div>
                </div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {currentUser.role === 'admin' 
                    ? (language === 'bn' ? 'অ্যাডমিন' : 'Admin') 
                    : (language === 'bn' ? 'নাগরিক' : 'Citizen')}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-slate-600 mb-2">
                  {language === 'bn' ? 'সমস্যা জমা ও ট্র্যাকিং করতে সাইন ইন করুন' : 'Sign in to submit and track issues'}
                </p>
                <button
                  onClick={() => {
                    setIsRegisterOpen(true);
                    onClose();
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {language === 'bn' ? 'রেজিস্ট্রেশন / লগইন' : 'Register / Login'}
                </button>
              </div>
            )}

            {/* Quick Live Counters */}
            <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-xs">
              <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                <div className="font-extrabold text-emerald-800 text-sm">{solvedCount}</div>
                <div className="text-[9px] text-emerald-600">{language === 'bn' ? 'সমাধান' : 'Resolved'}</div>
              </div>
              <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                <div className="font-extrabold text-amber-800 text-sm">{inProgressCount}</div>
                <div className="text-[9px] text-amber-600">{language === 'bn' ? 'চলমান' : 'Active'}</div>
              </div>
              <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                <div className="font-extrabold text-rose-800 text-sm">{pendingCount}</div>
                <div className="text-[9px] text-rose-600">{language === 'bn' ? 'পর্যালোচনা' : 'Review'}</div>
              </div>
            </div>
          </div>

          {/* Quick Submit CTA */}
          <div className="p-4 pb-2">
            <button
              onClick={() => {
                setIsNewComplaintOpen(true);
                onClose();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'সমস্যা রিপোর্ট করুন' : 'Submit Issue'}</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {language === 'bn' ? 'মূল মেনু' : 'Main Menu'}
            </div>

            <button
              onClick={() => handleNavClick('feed')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'feed'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListFilter className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'পাবলিক অভিযোগ ফিড' : 'Public Feed'}</span>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-600">
                {complaints.filter(c => c.status !== 'pending').length}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('map-view')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'map-view'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'ওয়ার্ড ম্যাপ ও হটস্পট' : 'Ward Map & Density'}</span>
            </button>

            <button
              onClick={() => handleNavClick('my-reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'my-reports'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'আমার অভিযোগসমূহ' : 'My Reports'}</span>
            </button>

            <button
              onClick={() => handleNavClick('emergency')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'emergency'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>{language === 'bn' ? 'জরুরি সেবা হটলাইন' : 'Emergency Directory'}</span>
            </button>

            <button
              onClick={() => {
                if (!isAdmin) toggleAdminRole();
                handleNavClick('admin-portal');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeView === 'admin-portal'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>{language === 'bn' ? 'পৌরসভা অ্যাডমিন পোর্টাল' : 'Pourashava Admin'}</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsLoadBalancerOpen(true);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'ক্লাস্টার লোড ব্যালেন্সার ও হেলথ' : 'Load Balancer & Cluster'}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>
            )}
          </div>

          {/* Quick Settings: Language & Admin toggle */}
          <div className="p-4 pt-1 space-y-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {language === 'bn' ? 'ভাষা / Language:' : 'Language:'}
              </span>
              <button
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                {language === 'bn' ? 'English' : 'বাংলা'}
              </button>
            </div>

            <button
              onClick={() => {
                toggleAdminRole();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {isAdmin 
                  ? (language === 'bn' ? 'নাগরিক মোডে ফিরুন' : 'Back to Citizen') 
                  : (language === 'bn' ? 'অ্যাডমিন মোডে পরিবর্তন' : 'Switch to Admin')}
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Developer Attribution & Pourashava hotline */}
        <div className="p-4 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs space-y-3">
          {/* Savar Pourashava Direct Hotline */}
          <a
            href="tel:02-7742111"
            className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold font-mono text-xs shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>পৌরসভা হেল্পলাইন: ০২-৭৭৪২১১১</span>
          </a>

          {/* Developer Credit */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-white font-medium mb-1">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Developed by <strong className="text-emerald-400">Shoriful Islam</strong></span>
            </div>
            <div className="flex items-center justify-between">
              <span>Contact:</span>
              <a
                href="tel:01938041064"
                className="font-mono font-bold text-emerald-300 hover:underline"
              >
                01938041064
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
