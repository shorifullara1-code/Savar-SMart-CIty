import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Phone, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const RegistrationModal: React.FC = () => {
  const {
    isRegisterOpen,
    setIsRegisterOpen,
    currentUser,
    registerUser,
    loginAsDemoCitizen,
    logoutUser,
    language,
    wards,
    loginUser,
  } = useApp();

  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [area, setArea] = useState(wards.length > 0 ? wards[0].areaName : 'Genda & Arapara');
  const [ward, setWard] = useState(wards.length > 0 ? wards[0].wardNumber : 'Ward 5');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isRegisterOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const cleanName = name.trim();
        const cleanMobile = mobile.trim().replace(/\s+/g, '');

        if (!cleanName) {
          setError(language === 'bn' ? 'দয়া করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!cleanMobile || cleanMobile.length < 10) {
          setError(language === 'bn' ? 'সঠিক ১১ বা ১০ ডিজিটের মোবাইল নম্বর দিন।' : 'Please enter a valid mobile number.');
          setLoading(false);
          return;
        }

        await registerUser({ name: cleanName, mobile: cleanMobile, area, ward });
      } else {
        const cleanMobile = mobile.trim().replace(/\s+/g, '');
        if (!cleanMobile) {
          setError(language === 'bn' ? 'রেজিস্ট্রেশনের সময় ব্যবহৃত মোবাইল নম্বরটি লিখুন।' : 'Please enter your registered mobile number.');
          setLoading(false);
          return;
        }

        const success = await loginUser({ mobile: cleanMobile });
        if (!success) {
          setError(
            language === 'bn'
              ? 'এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নিচে ক্লিক করে রেজিস্ট্রেশন করুন।'
              : 'No account found with this number. Please click below to register.'
          );
        }
      }
    } catch (err: any) {
      setError(err?.message || (language === 'bn' ? 'অনাকাঙ্ক্ষিত ত্রুটি, পুনরায় চেষ্টা করুন।' : 'An error occurred, please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (selectedAreaName: string) => {
    setArea(selectedAreaName);
    const matchedWard = wards.find((w) => w.areaName === selectedAreaName);
    if (matchedWard) {
      setWard(matchedWard.wardNumber);
    }
  };

  const switchToRegisterWithCurrentMobile = () => {
    setError('');
    setMode('register');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white p-5 relative">
          <button
            onClick={() => setIsRegisterOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {currentUser 
                  ? (language === 'bn' ? 'নাগরিক প্রোফাইল ও অ্যাকাউন্ট' : 'Citizen Profile & Account') 
                  : (mode === 'login' 
                      ? (language === 'bn' ? 'নাগরিক লগইন (মোবাইল নম্বর)' : 'Citizen Mobile Login')
                      : (language === 'bn' ? 'নতুন নাগরিক রেজিস্ট্রেশন' : 'Citizen Registration'))}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {language === 'bn' 
                  ? 'কোনো ইমেল বা ওটিপির ঝামেলা নেই — শুধু মোবাইল নম্বর দিয়েই প্রবেশ' 
                  : 'Fast mobile login — no email rate limits or SMS OTP required'}
              </p>
            </div>
          </div>
        </div>

        {/* Current status if already logged in */}
        {currentUser && (
          <div className="p-4 bg-emerald-50/90 border-b border-emerald-200/60 flex items-center justify-between text-xs">
            <div>
              <div className="text-emerald-950 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'বর্তমানে সক্রিয় অ্যাকাউন্ট:' : 'Active Account:'}</span>
              </div>
              <p className="text-slate-800 mt-1 font-semibold text-sm">{currentUser.name}</p>
              <p className="text-slate-600 text-[11px] font-mono">{currentUser.mobile} • {currentUser.area} ({currentUser.ward})</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                currentUser.role === 'admin' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {currentUser.role === 'admin' ? 'পৌরসভা অ্যাডমিন' : 'সাভার নাগরিক'}
              </span>
              <button
                type="button"
                onClick={logoutUser}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer pt-1"
              >
                {language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}

        {/* Toggle Mode (Register vs Login) */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(''); }} 
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মোবাইল দিয়ে লগইন' : 'Login by Mobile'}</span>
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setError(''); }} 
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'নতুন রেজিস্ট্রেশন' : 'New Registration'}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Info Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {mode === 'login' ? (
                language === 'bn'
                  ? 'রেজিস্ট্রেশনের সময় যে মোবাইল নম্বর দেওয়া হয়েছিল, শুধু সেটি লিখেই লগইন করতে পারবেন। ওটিপি লাগবে না।'
                  : 'Enter the mobile number you registered with to log in instantly. No OTP needed.'
              ) : (
                language === 'bn'
                  ? 'আপনার নাম ও মোবাইল নম্বর দিয়ে একবার রেজিস্ট্রেশন সম্পন্ন করলে এই নম্বরে যে কোনো সময় লগইন করতে পারবেন।'
                  : 'Register once with your name and mobile to submit and track local civic complaints.'
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
              <p className="font-medium">{error}</p>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={switchToRegisterWithCurrentMobile}
                  className="font-bold underline flex items-center gap-1 text-emerald-700 hover:text-emerald-800 cursor-pointer text-xs"
                >
                  <span>{language === 'bn' ? 'এখানে ক্লিক করে নতুন রেজিস্ট্রেশন সম্পন্ন করুন' : 'Click here to register now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'bn' ? 'উদা: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="01712xxxxxx"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl outline-hidden font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'bn' ? '১১ ডিজিটের মোবাইল নম্বর লিখুন (উদা: 01712458921)' : 'Enter 11-digit mobile number'}
            </p>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'bn' ? 'বসবাসের এলাকা ও ওয়ার্ড' : 'Area & Ward'} *
              </label>
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl outline-hidden bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-slate-700"
              >
                {wards.map((w) => (
                  <option key={w.wardNumber} value={w.areaName}>
                    {language === 'bn' ? `${w.banglaName} - ${w.wardNumber}` : `${w.areaName} (${w.wardNumber})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Processing...'}</span>
                </>
              ) : mode === 'register' ? (
                language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'
              ) : (
                language === 'bn' ? 'মোবাইল দিয়ে লগইন করুন' : 'Log In'
              )}
            </button>

            {/* Quick Demo Citizen Login for testing */}
            <button
              type="button"
              onClick={() => {
                loginAsDemoCitizen();
                setIsRegisterOpen(false);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-200 text-center"
            >
              {language === 'bn' ? 'টেস্ট করতে ডেমো নাগরিক প্রোফাইলে প্রবেশ করুন' : 'Try with Demo Citizen Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
