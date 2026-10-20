import React from 'react';
import { useApp } from '../context/AppContext';
import { SAVAR_EMERGENCY_CONTACTS } from '../data/savarData';
import { 
  PhoneCall, 
  Shield, 
  Flame, 
  Building2, 
  HeartPulse, 
  Zap, 
  Clock, 
  ArrowRight,
  Phone
} from 'lucide-react';

export const EmergencyDirectory: React.FC = () => {
  const { language, setIsNewComplaintOpen } = useApp();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'Shield': return Shield;
      case 'Flame': return Flame;
      case 'HeartPulse': return HeartPulse;
      case 'Zap': return Zap;
      default: return PhoneCall;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-700/50">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>{language === 'bn' ? 'সাভার জরুরি রেসপন্স হটলাইন' : 'Savar Emergency Response Directory'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'bn' ? 'জরুরি সেবা ও নিয়ন্ত্রণ কক্ষ' : 'Emergency & Rapid Response Control'}
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed">
            {language === 'bn'
              ? 'অগ্নিকাণ্ড, ড্রেনেজ বিপর্যয়, পুলিশি সহায়তা বা গুরুতর নাগরিক দুর্যোগে তাৎক্ষণিক সরাসরি কল করুন।'
              : 'Direct hotline access to Savar Municipality, Fire Rescue, Police, and Medical emergency departments.'}
          </p>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAVAR_EMERGENCY_CONTACTS.map((item, idx) => {
          const IconComp = getIcon(item.icon);

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 border border-emerald-100">
                  <IconComp className="w-6 h-6" />
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {language === 'bn' ? item.serviceBn : item.serviceEn}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-4">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.timing}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${item.number}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{item.number}</span>
                </a>

                {item.mobile && (
                  <a
                    href={`tel:${item.mobile}`}
                    className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold transition-colors"
                    title="Alternative Mobile Number"
                  >
                    {item.mobile}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout to file complaint if not emergency */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-emerald-950">
          <div className="font-bold text-sm mb-0.5">
            {language === 'bn' ? 'সরাসরি অভিযোগ নথিভুক্ত করতে চান?' : 'Want to file an issue for investigation?'}
          </div>
          <p className="text-emerald-800">
            {language === 'bn' 
              ? 'ভাঙা রাস্তা, আবর্জনা বা সড়ক বাতির মতো সমস্যার জন্য অনলাইন রিপোর্ট করুন।' 
              : 'Submit photo and details to assign municipal field engineers.'}
          </p>
        </div>

        <button
          onClick={() => setIsNewComplaintOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 shrink-0"
        >
          <span>{language === 'bn' ? 'অনলাইন অভিযোগ করুন' : 'Submit Issue Online'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
