import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MobileSidebar } from './MobileSidebar';
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  User, 
  MapPin, 
  PhoneCall, 
  ListFilter,
  CheckCircle2,
  Clock,
  Sparkles,
  Menu,
  Phone,
  Server,
  Search,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    language,
    setLanguage,
    activeView,
    setActiveView,
    setIsRegisterOpen,
    setIsNewComplaintOpen,
    toggleAdminRole,
    complaints,
    setIsLoadBalancerOpen,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const solvedCount = complaints.filter((c) => c.status === 'solved').length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        {/* Top Banner with Savar Municipality branding and quick stats */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              {language === 'bn' ? 'সাভার পৌরসভা ও আশুলিয়া জোন' : 'Savar Pourashava & Ashulia'}
            </span>
            <span className="hidden sm:inline text-slate-300">
              {language === 'bn' 
                ? 'নাগরিক সমস্যা ও স্বচ্ছ সমাধান প্ল্যাটফর্ম' 
                : 'Civic issue tracking & transparent redressal'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সমাধান:' : 'Solved:'} <strong>{solvedCount}</strong></span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'চলমান:' : 'Active:'} <strong>{inProgressCount}</strong></span>
            </div>
            {pendingCount > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <button 
                  onClick={() => {
                    if (!isAdmin) toggleAdminRole();
                    setActiveView('admin-portal');
                  }}
                  className="flex items-center gap-1 text-rose-300 hover:text-white transition-colors cursor-pointer"
                  title="Review pending reports"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{language === 'bn' ? 'অপেক্ষমাণ:' : 'Pending:'} <strong>{pendingCount}</strong></span>
                </button>
              </>
            )}
            {/* Load Balancer Cluster Status Quick Button (Admin Only) */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsLoadBalancerOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-mono transition-colors cursor-pointer"
                  title="Cluster Load Balancer & Error Diagnostics"
                >
                  <Server className="w-3 h-3 text-emerald-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">{language === 'bn' ? '৪/৪ নোড | লোড ব্যালেন্সার' : '4/4 Nodes | Load Balancer'}</span>
                  <span className="md:hidden">{language === 'bn' ? 'ব্যালেন্সার' : 'LB'}</span>
                </button>
                <span className="text-slate-600">|</span>
              </>
            )}
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-2 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition-colors"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Mobile Hamburger Button (Strictly Mobile md:hidden, computer view has no sidebar) + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hamburger Button strictly on small mobile (<768px). Computer view has NO toggle sidebar */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                aria-label="Open mobile navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo & Brand */}
              <div 
                onClick={() => setActiveView('feed')} 
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                  <Building2 className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {language === 'bn' ? 'সাভার সার্ভিস হাব' : 'Savar Service Hub'}
                    </span>
                    <span className="hidden lg:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Gov Civic Hub
                    </span>
                  </div>
                  <p className="text-[10px] lg:text-[11px] text-slate-500 hidden sm:block">
                    {language === 'bn' ? 'সাভার, বাইপাইল ও আশুলিয়ার নাগরিক সমস্যা সমাধান' : 'Savar, Baipail & Ashulia Civic Portal'}
                  </p>
                </div>
              </div>
            </div>

            {/* Global Search Bar (Desktop) */}
            <div className="flex-1 max-w-xs lg:max-w-md mx-3 hidden md:flex items-center relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'feed' && activeView !== 'admin-portal') {
                    setActiveView('feed');
                  }
                }}
                placeholder={
                  language === 'bn'
                    ? 'অভিযোগ, এলাকা, বা স্ট্যাটাস খুঁজুন...'
                    : 'Search complaints by keyword, location, status...'
                }
                className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Navigation Links (Always visible on computer view md:flex) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm font-medium">
              <button
                onClick={() => setActiveView('feed')}
                className={`px-2.5 lg:px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'feed'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ListFilter className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                <span>{language === 'bn' ? 'পাবলিক অভিযোগ' : 'Public Feed'}</span>
              </button>

              <button
                onClick={() => setActiveView('map-view')}
                className={`px-2.5 lg:px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'map-view'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'সাভার ও আশুলিয়া ম্যাপ' : 'Ward Map'}</span>
              </button>

              <button
                onClick={() => setActiveView('my-reports')}
                className={`px-2.5 lg:px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'my-reports'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-teal-600" />
                <span>{language === 'bn' ? 'আমার অভিযোগ' : 'My Reports'}</span>
                {currentUser && complaints.some(c => c.reporterId === currentUser.id || c.reporterMobile === currentUser.mobile) && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {complaints.filter(c => c.reporterId === currentUser.id || c.reporterMobile === currentUser.mobile).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('emergency')}
                className={`px-2.5 lg:px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'emergency'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PhoneCall className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-rose-500" />
                <span>{language === 'bn' ? 'জরুরি সেবা' : 'Emergency'}</span>
              </button>

              <button
                onClick={() => {
                  if (!isAdmin) toggleAdminRole();
                  else setActiveView('admin-portal');
                }}
                className={`px-2.5 lg:px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                  activeView === 'admin-portal'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-emerald-500" />
                <span>{language === 'bn' ? 'পৌরসভা অ্যাডমিন' : 'Authority Admin'}</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsLoadBalancerOpen(true)}
                  className="px-2.5 lg:px-3 py-2 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs lg:text-sm border border-emerald-200/70"
                  title="Cluster Load Balancer & Error Diagnostics"
                >
                  <Server className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-emerald-600" />
                  <span className="hidden xl:inline">{language === 'bn' ? 'লোড ব্যালেন্সার' : 'Load Balancer'}</span>
                  <span className="xl:hidden">{language === 'bn' ? 'ব্যালেন্সার' : 'LB'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </button>
              )}
            </nav>

            {/* Actions & User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Post Button */}
              <button
                onClick={() => setIsNewComplaintOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-sm shadow-emerald-600/30 hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'bn' ? 'অভিযোগ করুন' : 'Submit Issue'}</span>
              </button>

              {/* Role switch toggle (Desktop) */}
              <button
                onClick={toggleAdminRole}
                title={isAdmin ? 'Switch to Citizen View' : 'Switch to Savar Authority Admin'}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                  isAdmin 
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100' 
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {isAdmin 
                    ? (language === 'bn' ? 'অ্যাডমিন মোড অন' : 'Admin Active') 
                    : (language === 'bn' ? 'অ্যাডমিন সুইচ' : 'Admin Mode')}
                </span>
              </button>

              {/* Citizen profile button */}
              {currentUser ? (
                <div 
                  onClick={() => setIsRegisterOpen(true)}
                  className="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {currentUser.name ? currentUser.name.slice(0, 1) : 'U'}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                      {currentUser.mobile || currentUser.area}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 cursor-pointer"
                >
                  {language === 'bn' ? 'লগইন' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="px-3 pb-2.5 pt-1 md:hidden bg-white border-t border-slate-100">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'feed' && activeView !== 'admin-portal') {
                  setActiveView('feed');
                }
              }}
              placeholder={
                language === 'bn'
                  ? 'অভিযোগ, এলাকা বা স্ট্যাটাস খুঁজুন...'
                  : 'Search by keyword, location, status...'
              }
              className="w-full pl-9 pr-8 py-2 bg-slate-100 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Render Mobile Sidebar component */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
