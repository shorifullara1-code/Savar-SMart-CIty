import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ComplaintCard } from './ComplaintCard';
import { 
  User, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Phone,
  MapPin,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const MyReports: React.FC = () => {
  const {
    currentUser,
    complaints,
    language,
    setIsNewComplaintOpen,
    setIsRegisterOpen,
    setSelectedComplaintId,
    registerUser,
    showToast,
  } = useApp();

  const [mobileLookup, setMobileLookup] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'pending' | 'in_progress' | 'solved'>('all');

  // If not logged in, user can lookup their submitted complaints by mobile number
  const handleMobileLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = mobileLookup.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      showToast(
        language === 'bn' ? 'সঠিক মোবাইল নম্বর লিখুন (যেমন: 01712458921)' : 'Please enter a valid mobile number',
        'warning'
      );
      return;
    }

    // Check if any complaint exists with this mobile
    const matched = complaints.find((c) => c.reporterMobile.replace(/\D/g, '').includes(cleanNumber));
    if (matched) {
      // Auto register/sign-in this user
      registerUser({
        name: matched.reporterName,
        mobile: matched.reporterMobile,
        area: matched.area,
        ward: matched.ward,
      });
      showToast(
        language === 'bn' ? `${matched.reporterName}, আপনার অভিযোগসমূহ প্রদর্শিত হচ্ছে` : `Welcome ${matched.reporterName}! Loading your reports.`
      );
    } else {
      showToast(
        language === 'bn' ? `"${mobileLookup}" নম্বরে কোনো অভিযোগ পাওয়া যায়নি। নতুন অভিযোগ দিতে রেজিস্ট্রেশন করুন।` : `No complaints found for mobile ${mobileLookup}`,
        'info'
      );
    }
  };

  if (!currentUser) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Sign In & Mobile Lookup Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/20">
            <User className="w-8 h-8" />
          </div>

          <h3 className="font-bold text-slate-900 text-xl sm:text-2xl mb-2">
            {language === 'bn' ? 'আপনার দাখিলকৃত সমস্যা ও অভিযোগ দেখুন' : 'View Your Submitted Complaints'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
            {language === 'bn' 
              ? 'সাভার পৌরসভা ও আশুলিয়া এলাকার আপনি যেসব সমস্যার অভিযোগ করেছেন, সেগুলোর বর্তমান অবস্থা ও সমাধান দেখতে মোবাইল নম্বর দিন বা সাইন ইন করুন।' 
              : 'Enter your registered mobile number or sign in to track authority approval, department assignment, and resolution proof.'}
          </p>

          {/* Quick Mobile Number Lookup */}
          <form onSubmit={handleMobileLookup} className="max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={mobileLookup}
                  onChange={(e) => setMobileLookup(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার মোবাইল নম্বর (যেমন: 01712458921)' : 'Your mobile number'}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50 font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                {language === 'bn' ? 'খুঁজুন' : 'Search'}
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 flex-wrap">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{language === 'bn' ? 'নাগরিক রেজিস্ট্রেশন বা লগইন' : 'Citizen Registration / Login'}</span>
            </button>

            <button
              onClick={() => {
                registerUser({
                  name: 'তানভীর আহমেদ',
                  mobile: '01712-458921',
                  area: 'Genda & Arapara',
                  ward: 'Ward 5',
                });
                showToast(language === 'bn' ? 'ডেমো নাগরিক হিসেবে সাইন ইন সম্পন্ন হয়েছে' : 'Signed in as Demo Citizen');
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              {language === 'bn' ? 'ডেমো অ্যাকাউন্ট দিয়ে দেখুন' : 'Quick Demo Citizen Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter complaints submitted by this user (by ID or Mobile)
  const userComplaints = complaints.filter(
    (c) => c.reporterId === currentUser.id || c.reporterMobile === currentUser.mobile
  );

  const pendingCount = userComplaints.filter((c) => c.status === 'pending').length;
  const inProgressCount = userComplaints.filter((c) => c.status === 'in_progress' || c.status === 'approved').length;
  const solvedCount = userComplaints.filter((c) => c.status === 'solved').length;

  const displayedComplaints = userComplaints.filter((c) => {
    if (activeStatusTab === 'pending') return c.status === 'pending';
    if (activeStatusTab === 'in_progress') return c.status === 'in_progress' || c.status === 'approved';
    if (activeStatusTab === 'solved') return c.status === 'solved';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Citizen Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {currentUser.name ? currentUser.name.slice(0, 1) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.name}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                সাভার নিবন্ধিত নাগরিক
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono text-emerald-800 font-semibold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {currentUser.mobile}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {currentUser.area} {currentUser.ward ? `(${currentUser.ward})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewComplaintOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন সমস্যা জমা দিন' : 'Submit New Issue'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary for this Citizen */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveStatusTab(activeStatusTab === 'pending' ? 'all' : 'pending')}
          className={`border rounded-2xl p-4 transition-all cursor-pointer ${
            activeStatusTab === 'pending'
              ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400'
              : 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
            <span>{language === 'bn' ? 'অ্যাডমিন পর্যালোচনায়' : 'In Review'}</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-900">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {language === 'bn' ? 'অনুমোদন হলে পাবলিক হবে' : 'Pending admin approval'}
          </div>
        </div>

        <div 
          onClick={() => setActiveStatusTab(activeStatusTab === 'in_progress' ? 'all' : 'in_progress')}
          className={`border rounded-2xl p-4 transition-all cursor-pointer ${
            activeStatusTab === 'in_progress'
              ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-400'
              : 'bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
            <span>{language === 'bn' ? 'অনুমোদিত / কাজ চলছে' : 'Active Work'}</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-900">{inProgressCount}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">
            {language === 'bn' ? 'মাঠে টিম নিয়োজিত' : 'Team working on site'}
          </div>
        </div>

        <div 
          onClick={() => setActiveStatusTab(activeStatusTab === 'solved' ? 'all' : 'solved')}
          className={`border rounded-2xl p-4 transition-all cursor-pointer ${
            activeStatusTab === 'solved'
              ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span>{language === 'bn' ? 'সফল সমাধানকৃত' : 'Solved Issues'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-900">{solvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            {language === 'bn' ? 'নাগরিক সেবা সম্পন্ন' : 'Grievance resolved'}
          </div>
        </div>
      </div>

      {/* Reports Header & Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base">
            {language === 'bn' ? 'আপনার দাখিলকৃত রিপোর্ট তালিকা' : 'Your Complaints'} ({displayedComplaints.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' 
              ? 'যেকোনো অভিযোগে ক্লিক করে পৌরসভা কর্তৃপক্ষের নোট, অ্যাসাইন করা কর্মকর্তা ও অগ্রগতি দেখুন।' 
              : 'Click any card to inspect municipal authority responses and resolution proof.'}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveStatusTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeStatusTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'সকল' : 'All'} ({userComplaints.length})
          </button>
          <button
            onClick={() => setActiveStatusTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeStatusTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'পর্যালোচনায়' : 'Pending'} ({pendingCount})
          </button>
          <button
            onClick={() => setActiveStatusTab('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeStatusTab === 'in_progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'চলমান' : 'In Progress'} ({inProgressCount})
          </button>
          <button
            onClick={() => setActiveStatusTab('solved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeStatusTab === 'solved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'সমাধান সম্পন্ন' : 'Solved'} ({solvedCount})
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {displayedComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
          <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-60" />
          <h4 className="font-bold text-slate-800 text-sm mb-1">
            {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো অভিযোগ পাওয়া যায়নি' : 'No complaints found'}
          </h4>
          <p className="text-xs mb-4">
            {language === 'bn' 
              ? 'আপনার এলাকায় ভাঙা রাস্তা, ড্রেনেজ বা ময়লা সংক্রান্ত কোনো সমস্যা থাকলে রিপোর্ট করুন।' 
              : 'Report road, drain, or sanitation hazards to municipal authorities.'}
          </p>
          <button
            onClick={() => setIsNewComplaintOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
          >
            {language === 'bn' ? 'নতুন অভিযোগ দাখিল করুন' : 'Submit Issue'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedComplaints.map((comp) => (
            <ComplaintCard
              key={comp.id}
              complaint={comp}
              onOpenDetails={() => setSelectedComplaintId(comp.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
