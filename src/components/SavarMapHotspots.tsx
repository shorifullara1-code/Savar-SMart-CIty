import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAVAR_WARDS } from '../data/savarData';
import { SavarWardInfo } from '../types';
import { 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  User, 
  TrendingUp, 
  SlidersHorizontal,
  Compass,
  ArrowRight,
  PlusCircle,
  Eye,
  Filter,
  Layers,
  Building,
  Navigation
} from 'lucide-react';

export const SavarMapHotspots: React.FC = () => {
  const { 
    complaints, 
    language, 
    setFilterArea, 
    setActiveView, 
    setSelectedComplaintId,
    setIsNewComplaintOpen,
    wards
  } = useApp();

  const activeWards = wards && wards.length > 0 ? wards.map(dbW => {
    const base = SAVAR_WARDS.find(s => s.wardNumber === dbW.wardNumber) || SAVAR_WARDS[0];
    return {
      ...base,
      ...dbW,
      coordinates: base.coordinates
    };
  }) : SAVAR_WARDS;

  const [selectedWard, setSelectedWard] = useState<SavarWardInfo>(activeWards[0] || SAVAR_WARDS[0]);
  const [selectedZoneTab, setSelectedZoneTab] = useState<'all' | 'pourashava' | 'baipayl' | 'ashulia' | 'surrounding'>('all');

  // Filter wards by zone tab
  const getFilteredWards = () => {
    switch (selectedZoneTab) {
      case 'pourashava':
        return activeWards.filter((w) => w.wardNumber.startsWith('Ward'));
      case 'baipayl':
        return activeWards.filter((w) => w.wardNumber.includes('Baipayl'));
      case 'ashulia':
        return activeWards.filter((w) => w.wardNumber.includes('Ashulia'));
      case 'surrounding':
        return activeWards.filter((w) => 
          w.wardNumber.includes('Nabinagar') || 
          w.wardNumber.includes('Birulia') || 
          w.wardNumber.includes('Aminbazar')
        );
      case 'all':
      default:
        return activeWards;
    }
  };

  const displayedWards = getFilteredWards();

  // Calculate complaint counts per area
  const getAreaStats = (areaName: string) => {
    const areaComps = complaints.filter((c) => c.area === areaName);
    const solved = areaComps.filter((c) => c.status === 'solved').length;
    const pending = areaComps.filter((c) => c.status === 'pending').length;
    const inProgress = areaComps.filter((c) => c.status === 'in_progress' || c.status === 'approved').length;
    return { total: areaComps.length, solved, pending, inProgress, items: areaComps };
  };

  const selectedStats = getAreaStats(selectedWard.areaName);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'সাভার পৌরসভা, বাইপাইল, আশুলিয়া ও সংলগ্ন অঞ্চল' : 'Greater Savar, Baipayl & Ashulia Region'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'সাভার ও আশুলিয়া এলাকার ডিজিটাল সমস্যা ম্যাপ' : 'Interactive Geographic Hotspots Map'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn' 
              ? 'সাভার পৌরসভা (ওয়ার্ড ১-৯), বাইপাইল, আশুলিয়া, ডিইপিজেড, জামগড়া, নবীনগর, বিরুলিয়া ও আমিনবাজারের যেকোনো লোকেশনে ক্লিক করে অভিযোগের বর্তমান অবস্থা দেখুন বা নতুন অভিযোগ দাখিল করুন।' 
              : 'Explore civic issues and councilor contacts across Savar Pourashava, Baipayl, Ashulia, DEPZ, Jamgora, Birulia, and surrounding areas.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewComplaintOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'আপনার এলাকার সমস্যা জানান' : 'Report Issue Here'}</span>
          </button>
        </div>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedZoneTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
            selectedZoneTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'সকল অঞ্চল (সাভার, বাইপাইল ও আশুলিয়া)' : 'All Areas & Zones'} ({SAVAR_WARDS.length})
        </button>

        <button
          onClick={() => setSelectedZoneTab('pourashava')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
            selectedZoneTab === 'pourashava'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'সাভার পৌরসভা (১-৯ নং ওয়ার্ড)' : 'Pourashava (Wards 1-9)'}
        </button>

        <button
          onClick={() => setSelectedZoneTab('baipayl')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
            selectedZoneTab === 'baipayl'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'বাইপাইল ও ডিইপিজেড জোন' : 'Baipayl & DEPZ Hub'}
        </button>

        <button
          onClick={() => setSelectedZoneTab('ashulia')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
            selectedZoneTab === 'ashulia'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'আশুলিয়া ও জামগড়া জোন' : 'Ashulia & Jamgora'}
        </button>

        <button
          onClick={() => setSelectedZoneTab('surrounding')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
            selectedZoneTab === 'surrounding'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {language === 'bn' ? 'স্মৃতিসৌধ, বিরুলিয়া ও আমিনবাজার' : 'Memorial, Birulia & Aminbazar'}
        </button>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800 text-white flex flex-col justify-between min-h-[520px] relative overflow-hidden">
          
          {/* Subtle stylized grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Geographic River & Highway Lines representing Savar, Baipayl & Ashulia */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
            {/* Bangshi River (West) */}
            <path d="M 60,0 Q 140,160 160,300 T 220,540" fill="none" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" />
            {/* Turag River (East - Ashulia/Birulia) */}
            <path d="M 450,0 Q 420,150 490,280 T 560,540" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
            {/* Dhaka-Aricha Highway (East to West through Savar) */}
            <path d="M 0,420 Q 250,380 480,310 T 720,240" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="8 6" />
            {/* Nabinagar-Baipayl-Chandra Highway */}
            <path d="M 230,0 L 230,280" fill="none" stroke="#fbbf24" strokeWidth="6" strokeDasharray="8 6" />
            {/* Tongi-Ashulia-EPZ Road */}
            <path d="M 230,120 Q 360,110 550,110" fill="none" stroke="#34d399" strokeWidth="5" strokeDasharray="6 4" />
          </svg>

          {/* Map Top Labels */}
          <div className="relative z-10 flex flex-wrap items-center justify-between text-xs pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-slate-200">SAVAR, BAIPAYL & ASHULIA GEOGRAPHIC CANVAS</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              ২৪ ঘণ্টা স্যাটেলাইট জোন ট্র্যাকিং
            </div>
          </div>

          {/* Pins Canvas with Area Markers */}
          <div className="relative z-10 grow my-6 min-h-[360px]">
            {displayedWards.map((w) => {
              const stats = getAreaStats(w.areaName);
              const isSelected = selectedWard.areaName === w.areaName;

              return (
                <div
                  key={w.areaName}
                  style={{ left: `${w.coordinates.x}%`, top: `${w.coordinates.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                  onClick={() => setSelectedWard(w)}
                >
                  {/* Pin Circle */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-lg ${
                    isSelected
                      ? 'bg-emerald-400 text-slate-950 scale-110 ring-4 ring-emerald-500/40 shadow-emerald-500/30'
                      : stats.total > 0
                      ? 'bg-slate-800/95 hover:bg-emerald-600 text-white border border-slate-600'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-700 hover:text-white'
                  }`}>
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span className="truncate max-w-[85px] sm:max-w-[110px]">
                      {w.wardNumber.startsWith('Ward') ? w.wardNumber : w.banglaName.split('(')[0].split('ও')[0].trim()}
                    </span>
                    {stats.total > 0 && (
                      <span className={`text-[10px] px-1.5 rounded-full ${
                        isSelected ? 'bg-slate-950 text-white' : 'bg-emerald-500/25 text-emerald-300'
                      }`}>
                        {stats.total}
                      </span>
                    )}
                  </div>

                  {/* Hover tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-950 text-white text-[11px] p-2.5 rounded-xl whitespace-nowrap shadow-2xl border border-slate-700 z-30 pointer-events-none">
                    <p className="font-bold text-emerald-400">{w.banglaName}</p>
                    <p className="text-slate-300 text-[10px] mt-0.5">{w.zone}</p>
                    <p className="text-emerald-300 font-semibold mt-1">
                      {stats.total} টি অভিযোগ ({stats.solved} সমাধান সম্পন্ন)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Footer Legend */}
          <div className="relative z-10 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>নির্বাচিত লোকেশন</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-amber-400 inline-block" />
                <span>ঢাকা-আরিচা মহাসড়ক</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-sky-400 inline-block" />
                <span>বংশী ও তুরাগ নদী</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              সাভার পৌরসভা ও আশুলিয়া মডেল থানা জোন
            </span>
          </div>
        </div>

        {/* Selected Area/Ward Details & Complaints (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            
            {/* Header info */}
            <div className="border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  {selectedWard.wardNumber}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {selectedStats.total} {language === 'bn' ? 'টি অভিযোগ দাখিল' : 'Complaints Filed'}
                </span>
              </div>

              <h3 className="font-bold text-lg sm:text-xl text-slate-900 mt-1.5 leading-snug">
                {selectedWard.banglaName}
              </h3>
              <div className="text-xs font-medium text-emerald-700 mt-0.5">
                {selectedWard.zone}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedWard.description}
              </p>
            </div>

            {/* Councilor / Area In-Charge Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-4 text-xs space-y-2">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>{language === 'bn' ? 'কাউন্সিলর ও স্থানীয় জনপ্রতিনিধি' : 'Local Representative / Councilor'}</span>
                <span className="text-emerald-700 font-medium">দায়িত্বপ্রাপ্ত কর্মকর্তা</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{selectedWard.councilorName}</span>
                </div>
                <a
                  href={`tel:${selectedWard.contactNumber}`}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedWard.contactNumber}</span>
                </a>
              </div>
            </div>

            {/* Stats Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-950">
                <div className="font-extrabold text-lg text-amber-800">{selectedStats.inProgress}</div>
                <div className="text-[10px] text-amber-700 font-medium">{language === 'bn' ? 'কাজ চলছে' : 'Working'}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-emerald-950">
                <div className="font-extrabold text-lg text-emerald-800">{selectedStats.solved}</div>
                <div className="text-[10px] text-emerald-700 font-medium">{language === 'bn' ? 'সমাধানকৃত' : 'Solved'}</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-700">
                <div className="font-extrabold text-lg text-slate-800">{selectedStats.pending}</div>
                <div className="text-[10px] text-slate-500 font-medium">{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</div>
              </div>
            </div>

            {/* List of complaints in this selected area */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{language === 'bn' ? 'এই এলাকার সমস্যা তালিকা:' : 'Issues in this Area:'}</span>
                <span className="text-[11px] text-slate-400 font-normal">ক্লিক করে বিবরণ দেখুন</span>
              </div>

              {selectedStats.items.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-slate-400 text-xs border border-dashed border-slate-200">
                  {language === 'bn' ? 'এই এলাকায় বর্তমানে কোনো সক্রিয় অভিযোগ নথিভুক্ত নেই।' : 'No complaints recorded for this area.'}
                </div>
              ) : (
                selectedStats.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedComplaintId(item.id)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between text-xs gap-2 group"
                  >
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 group-hover:text-emerald-800 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.exactLocation}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      item.status === 'solved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons for this Area */}
          <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
            <button
              onClick={() => {
                setFilterArea(selectedWard.areaName);
                setActiveView('feed');
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30"
            >
              <span>{language === 'bn' ? `পাবলিক ফিডে এই এলাকার রিপোর্ট ফিল্টার করুন` : `Filter Public Feed for this Area`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsNewComplaintOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'এই এলাকার সমস্যা সরাসরি রিপোর্ট করুন' : 'Submit Issue from this Area'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
