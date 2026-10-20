import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CATEGORIES_CONFIG, SAVAR_WARDS } from '../data/savarData';
import { ComplaintCard } from './ComplaintCard';
import { ProblemCategory, ComplaintStatus } from '../types';
import { 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter, 
  SlidersHorizontal,
  Sparkles,
  Building2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  QrCode,
  ArrowRight,
  Activity,
  CheckCircle,
  User,
  Layers
} from 'lucide-react';

export const PublicFeed: React.FC = () => {
  const {
    complaints,
    language,
    filterCategory,
    setFilterCategory,
    filterArea,
    setFilterArea,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    setIsNewComplaintOpen,
    setSelectedComplaintId,
    setActiveView,
    toggleAdminRole,
    isAdmin,
    showToast,
    currentUser,
    setIsRegisterOpen,
  } = useApp();

  const [trackingInput, setTrackingInput] = useState('');
  // Mode: 'public' or 'my-reports'
  const [feedMode, setFeedMode] = useState<'all-public' | 'my-reports'>('all-public');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('all');

  // User's own complaints (including pending, approved, in-progress, solved)
  const myComplaints = complaints.filter(
    (c) => currentUser && (c.reporterId === currentUser.id || c.reporterMobile === currentUser.mobile)
  );

  // List to display based on feedMode
  const baseComplaints = feedMode === 'my-reports'
    ? myComplaints
    : complaints.filter((c) => c.status === 'approved' || c.status === 'in_progress' || c.status === 'solved');

  // Apply filters
  const filtered = baseComplaints.filter((comp) => {
    // Ward filter (Requested: ar word onujayi jeno report dekha jay filter kore)
    if (selectedWardFilter !== 'all') {
      if (selectedWardFilter.startsWith('Ward')) {
        if (comp.ward !== selectedWardFilter) return false;
      } else {
        // e.g. 'Baipayl', 'Ashulia', 'Nabinagar', 'Birulia', 'Aminbazar'
        const lowerFilter = selectedWardFilter.toLowerCase();
        const wardMatch = comp.ward.toLowerCase().includes(lowerFilter);
        const areaMatch = comp.area.toLowerCase().includes(lowerFilter);
        const locMatch = comp.exactLocation.toLowerCase().includes(lowerFilter);
        if (!wardMatch && !areaMatch && !locMatch) {
          return false;
        }
      }
    }

    // Status filter
    if (filterStatus !== 'all' && comp.status !== filterStatus) {
      return false;
    }
    // Category filter
    if (filterCategory !== 'all' && comp.category !== filterCategory) {
      return false;
    }
    // Area filter
    if (filterArea !== 'all' && comp.area !== filterArea) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = comp.title.toLowerCase().includes(q);
      const matchDesc = comp.description.toLowerCase().includes(q);
      const matchLoc = comp.exactLocation.toLowerCase().includes(q);
      const matchArea = comp.area.toLowerCase().includes(q);
      const matchWard = comp.ward.toLowerCase().includes(q);
      const matchCode = comp.trackingCode.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchArea && !matchWard && !matchCode) {
        return false;
      }
    }
    return true;
  });

  const totalPublic = complaints.filter((c) => c.status === 'approved' || c.status === 'in_progress' || c.status === 'solved').length;
  const totalSolved = complaints.filter((c) => c.status === 'solved').length;
  const totalActive = complaints.filter((c) => c.status === 'in_progress').length;
  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const resolutionRate = totalPublic > 0 ? Math.round((totalSolved / totalPublic) * 100) : 0;

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterArea('all');
    setFilterStatus('all');
    setSelectedWardFilter('all');
    setSearchQuery('');
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = trackingInput.trim().toUpperCase();
    if (!cleanCode) return;

    const matched = complaints.find(
      (c) => c.trackingCode.toUpperCase() === cleanCode || c.id.toUpperCase() === cleanCode
    );

    if (matched) {
      setSelectedComplaintId(matched.id);
      showToast(language === 'bn' ? `ট্র্যাকিং কোড ${matched.trackingCode} খুঁজে পাওয়া গেছে` : `Found complaint ${matched.trackingCode}`);
    } else {
      showToast(
        language === 'bn' ? `দুঃখিত, "${cleanCode}" কোডের কোনো অভিযোগ পাওয়া যায়নি` : `No complaint found for code "${cleanCode}"`,
        'warning'
      );
    }
  };

  const hasActiveFilters = filterCategory !== 'all' || filterArea !== 'all' || filterStatus !== 'all' || selectedWardFilter !== 'all' || searchQuery !== '';

  const wardTabs = [
    { id: 'all', labelBn: 'সকল ওয়ার্ড ও জোন', labelEn: 'All Wards' },
    { id: 'Ward 1', labelBn: '১ নং ওয়ার্ড (সাভার বাজার ও কোর্ট)', labelEn: 'Ward 1' },
    { id: 'Ward 2', labelBn: '২ নং ওয়ার্ড (থানা রোড ও নামাবাজার)', labelEn: 'Ward 2' },
    { id: 'Ward 3', labelBn: '৩ নং ওয়ার্ড (ব্যাংক টাউন ও কলোনি)', labelEn: 'Ward 3' },
    { id: 'Ward 4', labelBn: '৪ নং ওয়ার্ড (শিমুলতলা ও মজিদপুর)', labelEn: 'Ward 4' },
    { id: 'Ward 5', labelBn: '৫ নং ওয়ার্ড (গেন্ডা ও আনন্দপুর)', labelEn: 'Ward 5' },
    { id: 'Ward 6', labelBn: '৬ নং ওয়ার্ড (উলাইল ও কর্ণপাড়া)', labelEn: 'Ward 6' },
    { id: 'Ward 7', labelBn: '৭ নং ওয়ার্ড (রেডিও কলোনি)', labelEn: 'Ward 7' },
    { id: 'Ward 8', labelBn: '৮ নং ওয়ার্ড (হেমায়েতপুর ও তেঁতুলঝোড়া)', labelEn: 'Ward 8' },
    { id: 'Ward 9', labelBn: '৯ নং ওয়ার্ড (সিঅ্যান্ডবি ও জাবি গেট)', labelEn: 'Ward 9' },
    { id: 'Baipayl', labelBn: 'বাইপাইল জোন (টার্মিনাল ও ডিইপিজেড)', labelEn: 'Baipayl Zone' },
    { id: 'Ashulia', labelBn: 'আশুলিয়া ও জামগড়া জোন', labelEn: 'Ashulia Zone' },
    { id: 'Nabinagar', labelBn: 'নবীনগর ও জাতীয় স্মৃতিসৌধ', labelEn: 'Nabinagar Zone' },
    { id: 'Birulia', labelBn: 'বিরুলিয়া ও গোলাপ গ্রাম', labelEn: 'Birulia Zone' },
    { id: 'Aminbazar', labelBn: 'আমিনবাজার প্রবেশদ্বার', labelEn: 'Aminbazar Zone' },
  ];

  const getWardCount = (tabId: string) => {
    if (tabId === 'all') return baseComplaints.length;
    if (tabId.startsWith('Ward')) {
      return baseComplaints.filter((c) => c.ward === tabId).length;
    }
    const lower = tabId.toLowerCase();
    return baseComplaints.filter((c) => 
      c.ward.toLowerCase().includes(lower) || 
      c.area.toLowerCase().includes(lower) ||
      c.exactLocation.toLowerCase().includes(lower)
    ).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white shadow-2xl p-5 sm:p-8 md:p-10 border border-emerald-700/50">
        
        {/* Glow decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30 mb-4 backdrop-blur-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাভার পৌরসভা, বাইপাইল ও আশুলিয়া নাগরিক পোর্টাল' : 'Savar, Baipayl & Ashulia Civic Portal'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {language === 'bn' 
              ? 'সাভার, বাইপাইল ও আশুলিয়ার নাগরিক সমস্যা সরাসরি পৌরসভাকে জানান' 
              : 'Direct Civic Grievance & Rapid Resolution for Savar'}
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base mt-3 leading-relaxed">
            {language === 'bn'
              ? 'ভাঙা রাস্তা, ড্রেনেজ বা জলাবদ্ধতার ছবি তুলে সহজে অভিযোগ দাখিল করুন। পৌরসভা কর্তৃপক্ষ যাচাই ও অনুমোদনের পর কাজ শুরু করবে এবং সমাধানের বাস্তব প্রমাণসহ আপডেট প্রদান করবে।'
              : 'Report road potholes, clogged drains, overflowing waste or streetlight issues. Track authority responses with verified Before & After photo updates.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setIsNewComplaintOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'সমস্যার অভিযোগ দাখিল করুন' : 'Report Civic Issue Now'}</span>
            </button>

            <button
              onClick={() => setActiveView('map-view')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 sm:py-3 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-2 backdrop-blur-xs"
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>{language === 'bn' ? 'সাভার ও আশুলিয়া ম্যাপ' : 'Interactive Map'}</span>
            </button>

            {pendingCount > 0 && (
              <button
                onClick={() => {
                  if (!isAdmin) toggleAdminRole();
                  setActiveView('admin-portal');
                }}
                className="bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border border-rose-500/40 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} {language === 'bn' ? 'টি নতুন অভিযোগ অনুমোদনের অপেক্ষায়' : 'awaiting approval'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar in Hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-8 border-t border-emerald-800/60 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-emerald-300 font-medium">{language === 'bn' ? 'অনুমোদিত পাবলিক রিপোর্ট' : 'Public Reports'}</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalPublic}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-amber-300 font-medium">{language === 'bn' ? 'মাঠে কাজ চলমান' : 'Work in Progress'}</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalActive}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-emerald-400 font-medium">{language === 'bn' ? 'সফল সমাধানকৃত' : 'Resolved & Verified'}</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{totalSolved}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="text-teal-300 font-medium">{language === 'bn' ? 'সমাধান সাফল্যের হার' : 'Success Rate'}</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{resolutionRate}%</div>
          </div>
        </div>
      </div>

      {/* Digital Real-Time Tracking Widget & Live Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Quick Tracking Search Bar (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'ডিজিটাল ট্র্যাকিং কোড দিয়ে সার্চ' : 'Instant Grievance Tracking'}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {language === 'bn' 
                ? 'আপনার অভিযোগ দাখিলের সময় প্রাপ্ত ট্র্যাকিং নম্বর দিয়ে সরাসরি স্ট্যাটাস ও বিফোর-আফটার রিপোর্ট দেখুন।' 
                : 'Enter your tracking ID to inspect real-time progress and completion proof.'}
            </p>

            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="যেমন: SAV-8922, SAV-9041, SAV-9210..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono uppercase bg-slate-50/60"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>{language === 'bn' ? 'ট্র্যাক করুন' : 'Track'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Click Demo Tracking Pills */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'bn' ? 'ক্লিক করে তাৎক্ষণিক দেখুন:' : 'Quick preview:'}
            </span>
            {complaints.filter(c => c.status !== 'rejected').slice(0, 4).map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedComplaintId(comp.id)}
                className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors"
              >
                {comp.trackingCode}
              </button>
            ))}
          </div>
        </div>

        {/* Digital Transparency Meter (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                <span>সাভার ও আশুলিয়া ফিল্ড রেসপন্স</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h4 className="font-bold text-sm sm:text-base text-white">
              {language === 'bn' ? 'পৌরসভা ও উপজেলা টাস্কফোর্স' : 'Pourashava Field Response'}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              গড় সমাধান সময়: <strong>৪৮ ঘণ্টা</strong> | সক্রিয় জোন: <strong>সাভার, বাইপাইল, আশুলিয়া</strong>
            </p>

            {/* Resolution Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>সমাধান সম্পন্ন হার</span>
                <span className="font-bold text-emerald-400">{resolutionRate}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>নাগরিক সমস্যা সরাসরি মনিটর করা হচ্ছে</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
        </div>

      </div>

      {/* Main Mode Toggle: All Public Reports vs My Submitted Reports (Requested: user ra jeno dekhte par etader kora issues report gula) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
          <button
            onClick={() => setFeedMode('all-public')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              feedMode === 'all-public'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'সকল পাবলিক অভিযোগ' : 'All Public Reports'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              {totalPublic}
            </span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                setIsRegisterOpen(true);
                return;
              }
              setFeedMode('my-reports');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              feedMode === 'my-reports'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'bn' ? 'আমার জমাকৃত অভিযোগ' : 'My Submitted Issues'}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
              feedMode === 'my-reports' ? 'bg-white text-emerald-900' : 'bg-slate-100 text-slate-700'
            }`}>
              {myComplaints.length}
            </span>
          </button>
        </div>

        {feedMode === 'my-reports' && (
          <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentUser?.name}-এর দাখিলকৃত রিপোর্টসমূহ প্রদর্শিত হচ্ছে</span>
          </div>
        )}
      </div>

      {/* Ward-wise Filter Bar (Requested: ar word onujayi jeno report dekha jay filter kore) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'ওয়ার্ড ও আঞ্চলিক ফিল্টার (১-৯ নং ওয়ার্ড, বাইপাইল ও আশুলিয়া):' : 'Filter by Ward & Region:'}</span>
          </div>
          {selectedWardFilter !== 'all' && (
            <button
              onClick={() => setSelectedWardFilter('all')}
              className="text-emerald-700 font-semibold hover:underline text-xs cursor-pointer"
            >
              সকল ওয়ার্ড দেখুন
            </button>
          )}
        </div>

        {/* Horizontal scrollable ward tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {wardTabs.map((tab) => {
            const isSelected = selectedWardFilter === tab.id;
            const count = getWardCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedWardFilter(isSelected && tab.id !== 'all' ? 'all' : tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Ward Filter Banner */}
        {selectedWardFilter !== 'all' && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'bn'
                  ? `চিহ্নিত ওয়ার্ড: ${wardTabs.find((t) => t.id === selectedWardFilter)?.labelBn || selectedWardFilter} — ${filtered.length}টি রিপোর্ট সক্রিয়`
                  : `Filtering for ${selectedWardFilter} — ${filtered.length} reports`}
              </span>
            </div>
            <button
              onClick={() => setSelectedWardFilter('all')}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              {language === 'bn' ? 'সকল ওয়ার্ড দেখুন' : 'Show All'}
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        
        {/* Top search & area dropdown row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'রাস্তা, ড্রেন, গেন্ডা, বাইপাইল, জামগড়া বা ট্র্যাকিং কোড দিয়ে খুঁজুন...'
                  : 'Search by road, drain, area, or tracking code...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Area / Ward selector */}
          <div className="relative sm:w-72">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white cursor-pointer font-medium text-slate-700 truncate"
            >
              <option value="all">{language === 'bn' ? 'সকল সাভার, বাইপাইল ও আশুলিয়া এলাকা' : 'All Savar & Ashulia Areas'}</option>
              {SAVAR_WARDS.map((w) => (
                <option key={w.areaName} value={w.areaName}>
                  {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Quick Select */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সকল' : 'All'}
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filterStatus === 'in_progress' ? 'bg-white text-orange-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'চলমান' : 'Active'}
            </button>
            <button
              onClick={() => setFilterStatus('solved')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filterStatus === 'solved' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সমাধানকৃত' : 'Solved'}
            </button>
          </div>
        </div>

        {/* Category Pills Row - Smooth horizontal scrolling */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'সব বিভাগ' : 'All Categories'}
          </button>

          {(Object.keys(CATEGORIES_CONFIG) as ProblemCategory[]).map((catKey) => {
            const conf = CATEGORIES_CONFIG[catKey];
            const isSelected = filterCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setFilterCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{language === 'bn' ? conf.labelBn : conf.labelEn}</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 shrink-0 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              {feedMode === 'my-reports'
                ? (language === 'bn' ? 'আমার জমাকৃত অভিযোগ তালিকা' : 'My Submitted Reports')
                : (language === 'bn' ? 'সাভার ও আশুলিয়া পাবলিক অভিযোগ ফিড' : 'Public Grievance Feed')}
            </h2>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {filtered.length} {language === 'bn' ? 'টি সমস্যা' : 'issues'}
            </span>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            {feedMode === 'my-reports'
              ? (language === 'bn' ? 'আপনার ব্যক্তিগত ট্র্যাকিং তালিকা' : 'Your Personal Reports')
              : (language === 'bn' ? 'কর্তৃপক্ষ কর্তৃক যাচাইকৃত ও অনুমোদিত' : 'Moderated & Verified Public Feed')}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <Filter className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="font-bold text-slate-800 text-base mb-1">
              {feedMode === 'my-reports'
                ? (language === 'bn' ? 'আপনার কোনো অভিযোগ পাওয়া যায়নি' : 'You have not submitted any reports yet')
                : (language === 'bn' ? 'কোনো অভিযোগ খুঁজে পাওয়া যায়নি' : 'No matching complaints found')}
            </h3>
            <p className="text-xs mb-4">
              {feedMode === 'my-reports'
                ? (language === 'bn' ? 'আপনার এলাকার রাস্তা, ড্রেন বা অন্যান্য সমস্যা জানাতে এখনই অভিযোগ দাখিল করুন।' : 'Submit a complaint to track it here.')
                : (language === 'bn' ? 'আপনার সার্চ ফিল্টার পরিবর্তন করুন অথবা এই ওয়ার্ডে নতুন সমস্যা রিপোর্ট করুন।' : 'Try altering your filters or be the first to report here.')}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
              >
                {language === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Clear All Filters'}
              </button>
              <button
                onClick={() => setIsNewComplaintOpen(true)}
                className="text-xs font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                {language === 'bn' ? 'নতুন অভিযোগ করুন' : 'Submit Issue'}
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((comp) => (
              <motion.div
                key={comp.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <ComplaintCard
                  complaint={comp}
                  onOpenDetails={() => setSelectedComplaintId(comp.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
