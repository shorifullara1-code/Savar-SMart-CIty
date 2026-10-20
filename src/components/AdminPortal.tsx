import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ProblemCategory, ComplaintStatus } from '../types';
import { 
  CATEGORIES_CONFIG, 
  MUNICIPAL_DEPARTMENTS, 
  SAVAR_WARDS, 
  SOLVED_PRESET_IMAGES 
} from '../data/savarData';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  User, 
  SlidersHorizontal,
  FileCheck,
  Send,
  Building,
  CheckCircle,
  TrendingUp,
  Filter,
  Eye,
  Trash2,
  Database,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { UserList } from './UserList';

const SUPABASE_FULL_SQL = `-- সাভার সার্ভিস হাব (Savar Service Hub) - Supabase সম্পূর্ণ ডাটাবেজ স্কিমা
-- Project ID: qdlserqmaseoyuzmltmp

-- ১. Citizens Table (নাগরিক তথ্য টেবিল - মোবাইল নম্বর ভিত্তিক রেজিস্ট্রেশন ও লগইন)
create table if not exists public.citizens (
  id text primary key,
  mobile text unique not null,
  name text not null,
  area text,
  ward text,
  role text not null default 'citizen',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ২. Complaints Table (অভিযোগ টেবিল)
create table if not exists public.complaints (
  id text primary key,
  tracking_code text,
  title text not null,
  description text not null,
  category text not null,
  area text not null,
  ward text not null,
  exact_location text not null,
  urgency text not null,
  status text not null default 'pending',
  reporter_id text,
  reporter_name text,
  reporter_mobile text,
  image_url text,
  solved_image_url text,
  solution_details text,
  department text,
  assigned_officer text,
  admin_note text,
  rejection_reason text,
  upvotes integer default 0,
  upvoted_by_user_ids text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone,
  solved_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ৩. Comments Table (মন্তব্য টেবিল)
create table if not exists public.comments (
  id text primary key,
  complaint_id text references public.complaints(id) on delete cascade,
  user_name text not null,
  user_area text,
  user_role text not null default 'citizen',
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ৪. Wards Table (ওয়ার্ড টেবিল)
create table if not exists public.wards (
  ward_number text primary key,
  area_name text not null,
  bangla_name text not null,
  zone text,
  description text,
  councilor_name text,
  contact_number text
);

-- ৫. RLS Permissions (সবার জন্য রিড ও রাইট পলিসি সক্রিয়করণ)
alter table public.citizens enable row level security;
alter table public.complaints enable row level security;
alter table public.comments enable row level security;
alter table public.wards enable row level security;

create policy "Enable all for citizens" on public.citizens for all using (true) with check (true);
create policy "Enable all for complaints" on public.complaints for all using (true) with check (true);
create policy "Enable all for comments" on public.comments for all using (true) with check (true);
create policy "Enable all for wards" on public.wards for all using (true) with check (true);

-- ৬. প্রাথমিক অ্যাডমিন ও টেস্ট নাগরিক ডেটা
insert into public.citizens (id, mobile, name, area, ward, role)
values 
  ('admin-savar-auth-1', '01938041064', 'সাভার পৌরসভা ও আশুলিয়া জোন (প্রধান অ্যাডমিন)', 'Savar Municipality Core', 'All Wards', 'admin'),
  ('citizen-01712458921', '01712458921', 'তানভীর আহমেদ', 'Genda & Arapara', 'Ward 5', 'citizen')
on conflict (mobile) do nothing;
`;

export const AdminPortal: React.FC = () => {
  const {
    complaints,
    approveComplaint,
    rejectComplaint,
    updateComplaintStatus,
    markComplaintAsSolved,
    deleteComplaint,
    setSelectedComplaintId,
    language,
    showToast,
    wards,
    updateWard,
    isAdmin,
  } = useApp();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস প্রয়োজন' : 'Admin Access Required'}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {language === 'bn' ? 'এই প্যানেলে প্রবেশের জন্য অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।' : 'Please login as an administrator to access this panel.'}
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'solved' | 'all' | 'wards' | 'users' | 'database'>('pending');
  const [copiedSql, setCopiedSql] = useState(false);
  const [selectedForAction, setSelectedForAction] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'solve' | 'reject' | null>(null);

  // Form states for approval/solve
  const [selectedDept, setSelectedDept] = useState(MUNICIPAL_DEPARTMENTS[0]);
  const [officerName, setOfficerName] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [solutionDetails, setSolutionDetails] = useState('');
  const [solvedImage, setSolvedImage] = useState(SOLVED_PRESET_IMAGES[0].url);
  const [rejectionReason, setRejectionReason] = useState('');

  // Statistics
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'pending');
  const inProgress = complaints.filter((c) => c.status === 'in_progress' || c.status === 'approved');
  const solved = complaints.filter((c) => c.status === 'solved');
  const rejected = complaints.filter((c) => c.status === 'rejected');
  const solvedRate = total > 0 ? Math.round((solved.length / total) * 100) : 0;

  // Filtered list based on active tab
  const getTabComplaints = () => {
    switch (activeTab) {
      case 'pending':
        return pending;
      case 'active':
        return inProgress;
      case 'solved':
        return solved;
      case 'all':
      default:
        return complaints;
    }
  };

  const displayedComplaints = getTabComplaints();

  const openActionModal = (comp: Complaint, type: 'approve' | 'solve' | 'reject') => {
    setSelectedForAction(comp);
    setActionType(type);
    const catConf = CATEGORIES_CONFIG[comp.category];
    setSelectedDept(catConf?.departmentDefault || MUNICIPAL_DEPARTMENTS[0]);
    setOfficerName(comp.assignedOfficer || 'উপ-সহকারী প্রকৌশলী');
    setAdminNote(comp.adminNote || 'নাগরিক ভোগান্তি লাঘবে দ্রুত পদক্ষেপ গ্রহণ করা হচ্ছে।');
    setSolutionDetails(comp.solutionDetails || 'পৌরসভা টিম ঘটনাস্থল পরিদর্শন করে কাজ সমাপ্ত করেছে।');
    setRejectionReason('');
  };

  const closeActionModal = () => {
    setSelectedForAction(null);
    setActionType(null);
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForAction || !actionType) return;

    if (actionType === 'approve') {
      approveComplaint(
        selectedForAction.id,
        selectedDept,
        officerName.trim(),
        adminNote.trim()
      );
    } else if (actionType === 'solve') {
      if (!solutionDetails.trim()) {
        showToast(
          language === 'bn' ? 'দয়া করে সমাধানের বিবরণ লিখুন' : 'Please provide resolution details',
          'warning'
        );
        return;
      }
      markComplaintAsSolved(selectedForAction.id, {
        solutionDetails: solutionDetails.trim(),
        solvedImageUrl: solvedImage,
      });
    } else if (actionType === 'reject') {
      if (!rejectionReason.trim()) {
        showToast(
          language === 'bn' ? 'দয়া করে বাতিলের কারণ উল্লেখ করুন' : 'Please provide rejection reason',
          'warning'
        );
        return;
      }
      rejectComplaint(selectedForAction.id, rejectionReason.trim());
    }
    closeActionModal();
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Header & Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {language === 'bn' ? 'সাভার পৌরসভা অ্যাডমিন ও অথরিটি পোর্টাল' : 'Savar Pourashava Admin Portal'}
                </h1>
                <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                  Verified Authority
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                {language === 'bn'
                  ? 'নাগরিকদের অভিযোগ যাচাই, অনুমোদন, বিভাগীয় দায়িত্ব বণ্টন ও সমাধান কার্যবিবরণী'
                  : 'Review citizen submissions, approve for public feed, assign departments & mark resolved'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">{language === 'bn' ? 'লাইভ ডাটাবেজ সিঙ্ক' : 'Live Moderation Sync'}</span>
          </div>
        </div>

        {/* High-level KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          
          <div 
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'pending'
                ? 'bg-rose-500/20 border-rose-500 ring-1 ring-rose-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
              <span>{language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approval'}</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
              {pending.length}
              {pending.length > 0 && (
                <span className="text-[11px] font-normal text-rose-400">
                  {language === 'bn' ? 'যাচাই প্রয়োজন' : 'Action needed'}
                </span>
              )}
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('active')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'active'
                ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
              <span>{language === 'bn' ? 'চলমান ও প্রক্রিয়াধীন' : 'In Progress'}</span>
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {inProgress.length}
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('solved')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'solved'
                ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
              <span>{language === 'bn' ? 'সফল সমাধান' : 'Solved Issues'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {solved.length}
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('all')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'all'
                ? 'bg-teal-500/20 border-teal-500 ring-1 ring-teal-500'
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-teal-300 mb-1">
              <span>{language === 'bn' ? 'মোট অভিযোগ ও সাফল্যের হার' : 'Total & Success Rate'}</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-2">
              {total}
              <span className="text-xs font-semibold text-emerald-400">
                ({solvedRate}% {language === 'bn' ? 'সমাধান' : 'solved'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Review'}</span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
              {pending.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{language === 'bn' ? 'চলমান ও অনুমোদিত' : 'Active / Working'}</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
              {inProgress.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('solved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'solved'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'সমাধানকৃত আর্কাইভ' : 'Solved Archive'}</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
              {solved.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{language === 'bn' ? 'সকল তালিকা' : 'All List'}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'bn' ? 'ব্যবহারকারী তালিকা' : 'User List'}</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{language === 'bn' ? 'ডাটাবেজ ও SQL কোড' : 'Database & SQL'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {language === 'bn' ? `মোট প্রদর্শিত: ${activeTab === 'users' ? 'ব্যবহারকারী' : activeTab === 'database' ? 'SQL স্কিমা' : displayedComplaints.length} টি` : `Showing ${activeTab === 'users' ? 'users' : activeTab === 'database' ? 'SQL Schema' : displayedComplaints.length} items`}
        </div>
      </div>

      {/* Complaints or Users or Database Content */}
      {activeTab === 'database' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>{language === 'bn' ? 'Supabase ডাটাবেজ সংযোগ ও SQL সেটাপ' : 'Supabase Database & SQL Setup'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'bn'
                  ? 'এই SQL কোডটি দিয়ে Supabase এ citizens, complaints, comments ও wards টেবিল এবং RLS তৈরি হবে।'
                  : 'Run this SQL script in Supabase to enable citizens mobile login, complaints persistence, and RLS.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard/project/qdlserqmaseoyuzmltmp/sql"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{language === 'bn' ? 'Supabase SQL Editor খুলুন' : 'Open Supabase SQL'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_FULL_SQL);
                  setCopiedSql(true);
                  showToast(language === 'bn' ? 'সম্পূর্ণ SQL কোড কপি হয়েছে!' : 'SQL code copied to clipboard!', 'success');
                  setTimeout(() => setCopiedSql(false), 3000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? (language === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (language === 'bn' ? 'SQL কোড কপি করুন' : 'Copy Full SQL')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-900 block mb-1">১. Project ID & URL</span>
              <p className="font-mono text-emerald-800 text-[11px] truncate">qdlserqmaseoyuzmltmp</p>
              <p className="text-emerald-700 mt-1 text-[11px]">সংযুক্ত এবং সক্রিয়</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="font-bold text-blue-900 block mb-1">২. নাগরিক মোবাইল লগইন</span>
              <p className="text-blue-800 text-[11px]">পাসওয়ার্ড বা ওটিপির প্রয়োজন নেই</p>
              <p className="text-blue-700 mt-1 text-[11px]">সরাসরি মোবাইল নম্বর দিয়ে তাৎক্ষণিক লগইন</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1">৩. অ্যাডমিন ক্রেডেনশিয়াল</span>
              <p className="font-mono text-amber-900 text-[11px]">ID: admin</p>
              <p className="font-mono text-amber-800 text-[11px]">Pass: SavarAdmin@2026!</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{language === 'bn' ? 'Supabase SQL স্ক্রিপ্ট প্রিভিউ:' : 'Supabase SQL Schema Preview:'}</span>
              <span className="text-slate-400 font-mono text-[11px]">supabase_schema.sql</span>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800 selection:bg-emerald-600">
              {SUPABASE_FULL_SQL}
            </pre>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <UserList />
      ) : activeTab === 'wards' ? (
        // ... existing wards code
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wards.map((ward) => (
             <div key={ward.wardNumber} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
               <h3 className="font-bold text-slate-800 text-base">{language === 'bn' ? ward.banglaName : ward.areaName}</h3>
               <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="text-[10px] text-slate-500 font-semibold uppercase">Bangla Name</label>
                     <input
                       type="text"
                       value={ward.banglaName}
                       onChange={(e) => updateWard(ward.wardNumber, { banglaName: e.target.value })}
                       className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-500 font-semibold uppercase">English Name</label>
                     <input
                       type="text"
                       value={ward.areaName}
                       onChange={(e) => updateWard(ward.wardNumber, { areaName: e.target.value })}
                       className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                     />
                   </div>
                 </div>
                 
                 <div className="pt-2 border-t border-slate-100">
                   <label className="text-[10px] text-emerald-700 font-bold uppercase mb-1.5 block">
                     {language === 'bn' ? 'ওয়ার্ড কর্মকর্তা' : 'Ward Official'}
                   </label>
                   <div className="grid grid-cols-1 gap-2">
                     <input
                       type="text"
                       value={ward.councilorName}
                       onChange={(e) => updateWard(ward.wardNumber, { councilorName: e.target.value })}
                       placeholder={language === 'bn' ? 'কর্মকর্তার নাম' : 'Official Name'}
                       className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                     />
                     <input
                       type="text"
                       value={ward.contactNumber}
                       onChange={(e) => updateWard(ward.wardNumber, { contactNumber: e.target.value })}
                       placeholder={language === 'bn' ? 'যোগাযোগ নম্বর' : 'Contact Number'}
                       className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                     />
                   </div>
                 </div>
               </div>
               <button
                 onClick={() => {
                   updateWard(ward.wardNumber, { 
                     banglaName: ward.banglaName, 
                     areaName: ward.areaName,
                     councilorName: ward.councilorName,
                     contactNumber: ward.contactNumber
                   });
                   showToast(language === 'bn' ? 'ওয়ার্ডের তথ্য আপডেট হয়েছে!' : 'Ward info updated!', 'success');
                 }}
                 className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer mt-2"
               >
                 {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
               </button>
             </div>
           ))}
         </div>
       ) : displayedComplaints.length === 0 ? (
        // ... rest of complaints code

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-slate-800 text-base mb-1">
            {language === 'bn' ? 'এই বিভাগে কোনো অভিযোগ খালি নেই' : 'No complaints in this queue'}
          </h3>
          <p className="text-xs">
            {language === 'bn' ? 'সকল অভিযোগ যথারীতি পরিচালিত হচ্ছে।' : 'All issues are monitored.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedComplaints.map((comp) => {
            const catConf = CATEGORIES_CONFIG[comp.category] || CATEGORIES_CONFIG.other;

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Image thumbnail & Title */}
                  <div className="flex items-start gap-4">
                    <img
                      src={comp.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80'}
                      alt={comp.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                      onClick={() => setSelectedComplaintId(comp.id)}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {comp.trackingCode}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium border ${catConf.bgLight}`}>
                          {language === 'bn' ? catConf.labelBn : catConf.labelEn}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {comp.ward}
                        </span>

                        {comp.status === 'pending' && (
                          <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold border border-rose-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {language === 'bn' ? 'অনুমোদনের অপেক্ষায় (নট পাবলিক)' : 'Pending Approval'}
                          </span>
                        )}
                        {comp.status === 'approved' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold border border-blue-300">
                            {language === 'bn' ? 'অনুমোদিত ও পাবলিক' : 'Approved & Public'}
                          </span>
                        )}
                        {comp.status === 'in_progress' && (
                          <span className="text-xs bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full font-bold border border-orange-300">
                            {language === 'bn' ? 'কাজ চলমান' : 'In Progress'}
                          </span>
                        )}
                        {comp.status === 'solved' && (
                          <span className="text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {language === 'bn' ? 'সমাধান হয়েছে' : 'Resolved'}
                          </span>
                        )}
                        {comp.status === 'rejected' && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            {language === 'bn' ? 'বাতিলকৃত' : 'Rejected'}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setSelectedComplaintId(comp.id)}
                        className="font-bold text-slate-900 text-base hover:text-emerald-700 cursor-pointer transition-colors"
                      >
                        {comp.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {comp.exactLocation} ({comp.area})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {comp.reporterName}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-emerald-800 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {comp.reporterMobile}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                    
                    {/* View details */}
                    <button
                      onClick={() => setSelectedComplaintId(comp.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'দেখুন' : 'View'}</span>
                    </button>

                    {/* Pending Actions */}
                    {comp.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openActionModal(comp, 'approve')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'অনুমোদন ও পাবলিক করুন' : 'Approve & Publish'}</span>
                        </button>
                        <button
                          onClick={() => openActionModal(comp, 'reject')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'বাতিল' : 'Reject'}</span>
                        </button>
                      </>
                    )}

                    {/* Approved / In-progress Actions */}
                    {(comp.status === 'approved' || comp.status === 'in_progress') && (
                      <>
                        {comp.status === 'approved' && (
                          <button
                            onClick={() => updateComplaintStatus(comp.id, 'in_progress')}
                            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'কাজ শুরু মার্ক করুন' : 'Start Work'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => openActionModal(comp, 'solve')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'সমাধান সম্পন্ন (Solved Mark)' : 'Mark Solved'}</span>
                        </button>
                      </>
                    )}

                    {/* Delete action */}
                    <button
                      onClick={() => deleteComplaint(comp.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete complaint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Complaint Body Description snippet */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <p className="line-clamp-2">{comp.description}</p>
                </div>

                {/* Assigned Department or Note banner if exists */}
                {(comp.department || comp.adminNote || comp.solutionDetails) && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-xs space-y-1">
                    {comp.department && (
                      <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'bn' ? 'নিযুক্ত বিভাগ:' : 'Assigned Dept:'} {comp.department}</span>
                        {comp.assignedOfficer && (
                          <span className="text-slate-500 font-normal">({comp.assignedOfficer})</span>
                        )}
                      </div>
                    )}
                    {comp.adminNote && (
                      <p className="text-slate-600"><span className="font-semibold text-slate-800">{language === 'bn' ? 'অফিসিয়াল নোট:' : 'Note:'}</span> {comp.adminNote}</p>
                    )}
                    {comp.solutionDetails && (
                      <p className="text-emerald-900 font-medium"><span className="font-bold">{language === 'bn' ? 'সমাধান সারাংশ:' : 'Solution:'}</span> {comp.solutionDetails}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog (Approve / Solve / Reject) */}
      {selectedForAction && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
            
            <div className={`p-4 text-white flex items-center justify-between ${
              actionType === 'approve' 
                ? 'bg-emerald-700' 
                : actionType === 'solve' 
                ? 'bg-teal-700' 
                : 'bg-rose-700'
            }`}>
              <div className="flex items-center gap-2">
                {actionType === 'approve' && <CheckCircle className="w-5 h-5" />}
                {actionType === 'solve' && <CheckCircle2 className="w-5 h-5" />}
                {actionType === 'reject' && <XCircle className="w-5 h-5" />}
                <h3 className="font-bold text-base">
                  {actionType === 'approve' && (language === 'bn' ? 'অভিযোগ অনুমোদন ও পাবলিক ফিডে প্রকাশ' : 'Approve & Publish Complaint')}
                  {actionType === 'solve' && (language === 'bn' ? 'সমস্যা সমাধান নিশ্চিতকরণ (Mark as Solved)' : 'Mark as Solved')}
                  {actionType === 'reject' && (language === 'bn' ? 'অভিযোগ বাতিলকরণ' : 'Reject Complaint')}
                </h3>
              </div>
              <button onClick={closeActionModal} className="text-white/80 hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-mono">{selectedForAction.trackingCode}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-0.5">{selectedForAction.title}</h4>
                <p className="text-slate-500 mt-0.5">{selectedForAction.exactLocation} • {selectedForAction.ward}</p>
              </div>

              {actionType === 'approve' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পৌরসভা দায়িত্বপ্রাপ্ত বিভাগ বণ্টন করুন' : 'Assign Municipal Department'}
                    </label>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-xl outline-hidden bg-white text-xs font-medium"
                    >
                      {MUNICIPAL_DEPARTMENTS.map((dept, i) => (
                        <option key={i} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'দায়িত্বপ্রাপ্ত প্রকৌশলী / পরিদর্শক কর্মকর্তা' : 'Assigned Officer'}
                    </label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      placeholder="যেমন: ইঞ্জিনিয়ার মোঃ শফিকুল ইসলাম"
                      className="w-full p-2 border border-slate-300 rounded-xl outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'অফিসিয়াল অনুমোদন মন্তব্য (পাবলিকে প্রদর্শিত হবে)' : 'Approval Official Note'}
                    </label>
                    <textarea
                      rows={2}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="যেমন: পৌরসভা পরিদর্শন করেছে এবং কাজের শিডিউল প্রস্তুত করা হয়েছে।"
                      className="w-full p-2 border border-slate-300 rounded-xl outline-hidden text-xs"
                    />
                  </div>
                </>
              )}

              {actionType === 'solve' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'কীভাবে সমস্যার সমাধান করা হলো বিস্তারিত লিখুন' : 'Detailed Resolution Summary'} *
                    </label>
                    <textarea
                      rows={3}
                      value={solutionDetails}
                      onChange={(e) => setSolutionDetails(e.target.value)}
                      placeholder="যেমন: রাস্তার কার্পেটিং ও পিচ ঢালাই সফলভাবে সম্পন্ন হয়েছে এবং যান চলাচল স্বাভাবিক করা হয়েছে..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl outline-hidden text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      {language === 'bn' ? 'সমাধানের পর বাস্তব ছবি (After Photo):' : 'Select Solved Proof Image:'}
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {SOLVED_PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSolvedImage(img.url)}
                          className={`rounded-lg overflow-hidden border h-14 cursor-pointer relative ${
                            solvedImage === img.url ? 'ring-2 ring-emerald-600' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'বাতিলের কারণ' : 'Rejection Reason'} *
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="যেমন: উক্ত স্থানটি সাভার পৌরসভার আওতাভুক্ত নয় বা প্রয়োজনীয় বিবরণ নেই..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-hidden text-xs"
                    required
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  {language === 'bn' ? 'ফিরে যান' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold cursor-pointer ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionType === 'solve'
                      ? 'bg-teal-600 hover:bg-teal-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionType === 'approve' && (language === 'bn' ? 'অনুমোদন নিশ্চিত করুন' : 'Confirm & Publish')}
                  {actionType === 'solve' && (language === 'bn' ? 'সমাধান নিশ্চিত করুন' : 'Confirm Solved')}
                  {actionType === 'reject' && (language === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
