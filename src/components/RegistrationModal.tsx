import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAVAR_WARDS } from '../data/savarData';
import { X, User, Phone, MapPin, CheckCircle, Shield, Sparkles } from 'lucide-react';

export const RegistrationModal: React.FC = () => {
  const {
    isRegisterOpen,
    setIsRegisterOpen,
    currentUser,
    registerUser,
    loginAsDemoCitizen,
    toggleAdminRole,
    logoutUser,
    language,
  } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [area, setArea] = useState(currentUser?.area || SAVAR_WARDS[0].areaName);
  const [ward, setWard] = useState(currentUser?.ward || SAVAR_WARDS[0].wardNumber);
  const [error, setError] = useState('');

  if (!isRegisterOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'দয়া করে আপনার পুরো নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)' : 'Please enter a valid mobile number');
      return;
    }
    setError('');
    registerUser({ name, mobile, area, ward });
  };

  const handleAreaChange = (selectedAreaName: string) => {
    setArea(selectedAreaName);
    const matchedWard = SAVAR_WARDS.find((w) => w.areaName === selectedAreaName);
    if (matchedWard) {
      setWard(matchedWard.wardNumber);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 relative">
          <button
            onClick={() => setIsRegisterOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {currentUser 
                  ? (language === 'bn' ? 'নাগরিক প্রোফাইল ও সেটিংস' : 'Citizen Profile') 
                  : (language === 'bn' ? 'নাগরিক রেজিস্ট্রেশন' : 'Citizen Registration')}
              </h3>
              <p className="text-xs text-emerald-100">
                {language === 'bn' 
                  ? 'সাভার পৌরসভা সার্ভিস হাবে সমস্যা রিপোর্ট ও সমাধান ট্র্যাকিং' 
                  : 'Register with mobile & area to submit and track complaints'}
              </p>
            </div>
          </div>
        </div>

        {/* Current status if already logged in */}
        {currentUser && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <div className="text-emerald-950 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'বর্তমানে সাইন ইন রয়েছেন:' : 'Currently signed in:'}</span>
              </div>
              <p className="text-slate-600 mt-0.5 font-medium">{currentUser.name} ({currentUser.mobile})</p>
              <p className="text-slate-500 text-[11px]">{currentUser.area} - {currentUser.ward}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                currentUser.role === 'admin' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {currentUser.role === 'admin' ? 'পৌরসভা অ্যাডমিন' : 'সাভার নাগরিক'}
              </span>
              <button
                type="button"
                onClick={logoutUser}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'লগআউট' : 'Logout'}
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: মোঃ তানভীর রহমান' : 'e.g. Tanvir Rahman'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'মোবাইল নম্বর (লগইন ও আপডেটের জন্য)' : 'Mobile Number'} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'bn' ? 'অভিযোগের সমাধান ও এসএমএস আপডেটের জন্য ব্যবহৃত হবে।' : 'Used for SMS updates regarding your complaint.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'সাভার, বাইপাইল বা আশুলিয়ার বসবাসরত এলাকা' : 'Area in Savar, Baipail or Ashulia'} *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden bg-white cursor-pointer font-medium text-slate-800"
              >
                <optgroup label="সাভার পৌরসভা (ওয়ার্ড ১-৯)">
                  {SAVAR_WARDS.filter(w => w.wardNumber.startsWith('Ward')).map((w) => (
                    <option key={w.areaName} value={w.areaName}>
                      {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="বাইপাইল ও ডিইপিজেড জোন">
                  {SAVAR_WARDS.filter(w => w.wardNumber.includes('Baipayl')).map((w) => (
                    <option key={w.areaName} value={w.areaName}>
                      {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="আশুলিয়া ও জামগড়া জোন">
                  {SAVAR_WARDS.filter(w => w.wardNumber.includes('Ashulia')).map((w) => (
                    <option key={w.areaName} value={w.areaName}>
                      {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="স্মৃতিসৌধ, বিরুলিয়া ও অন্যান্য সংলগ্ন এলাকা">
                  {SAVAR_WARDS.filter(w => !w.wardNumber.startsWith('Ward') && !w.wardNumber.includes('Baipayl') && !w.wardNumber.includes('Ashulia')).map((w) => (
                    <option key={w.areaName} value={w.areaName}>
                      {language === 'bn' ? w.banglaName : `${w.areaName} (${w.wardNumber})`}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all cursor-pointer"
            >
              {currentUser 
                ? (language === 'bn' ? 'প্রোফাইল তথ্য আপডেট করুন' : 'Update Profile Info') 
                : (language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration')}
            </button>

            {/* Quick Demo Fill Buttons for effortless review */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={loginAsDemoCitizen}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'bn' ? 'নাগরিক ডেমো' : 'Citizen Demo'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleAdminRole();
                  setIsRegisterOpen(false);
                }}
                className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === 'bn' ? 'পৌরসভা অ্যাডমিন সুইচ' : 'Admin Authority'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
