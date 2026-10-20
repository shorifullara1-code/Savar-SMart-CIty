import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Heart, 
  Shield, 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  Mail, 
  MessageCircle,
  Code2,
  Sparkles,
  Link as LinkIcon,
  Server
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, setActiveView, toggleAdminRole, isAdmin, setIsLoadBalancerOpen } = useApp();

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-400 text-xs mt-16 border-t border-slate-800">
      
      {/* Top Banner: Developer Feature Card & Savar Municipality Hotline */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between">
            
            {/* Developer Credit Feature Card (Requested: developed by Shoriful Islam, Contact 01938041064) */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-4 rounded-2xl border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 shrink-0">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Project Creator & Lead Engineer</span>
                  </div>
                  <h4 className="text-white font-bold text-sm sm:text-base">
                    Developed by <span className="text-emerald-300">Shoriful Islam</span>
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Savar Civic Tech & Digital Municipal Solution
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <a
                  href="tel:01938041064"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Direct Phone Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>01938041064</span>
                </a>

                <a
                  href="https://wa.me/8801938041064"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/50 transition-colors"
                  title="WhatsApp Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Official Savar Hotline Quick Card */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0 border border-slate-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {language === 'bn' ? 'সাভার পৌরসভা সরাসরি হেল্পলাইন' : 'Savar Pourashava Direct Helpline'}
                  </span>
                  <div className="text-white font-bold text-sm sm:text-base font-mono">
                    02-7742111 / 01700-000000
                  </div>
                  <span className="text-[11px] text-emerald-400">
                    {language === 'bn' ? '২৪ ঘণ্টা নাগরিক সেবা কন্ট্রোল রুম' : '24/7 Citizen Service Control Room'}
                  </span>
                </div>
              </div>

              <a
                href="tel:027742111"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shrink-0"
              >
                {language === 'bn' ? 'কল করুন' : 'Call Now'}
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block">
                  {language === 'bn' ? 'সাভার সার্ভিস হাব' : 'Savar Service Hub'}
                </span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">
                  Smart Digital Municipal Portal
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {language === 'bn'
                ? 'সাভার পৌরসভা ও আশপাশের অঞ্চলের সড়ক, ড্রেনেজ ও নাগরিক সমস্যা নিরসনে একটি আধুনিক, স্বচ্ছ ও কার্যকর ডিজিটাল প্ল্যাটফর্ম।'
                : 'A civic engagement platform enabling citizens to report broken roads, waterlogging, waste, and municipal hazards directly to authorities.'}
            </p>

            <div className="flex flex-col gap-1.5 text-slate-400 text-xs pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'সাভার পৌরসভা ভবন, ঢাকা-আরিচা মহাসড়ক সংলগ্ন, সাভার, ঢাকা-১৩৪০'
                    : 'Savar Pourashava Building, Dhaka-Aricha Highway, Savar, Dhaka-1340'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'শতভাগ নাগরিক স্বচ্ছতা ও বিফোর-আফটার সমাধান মনিটরিং'
                    : '100% Civic Transparency & Before-After Resolution Monitoring'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Official Savar & Important Links (Requested: savar pourosovar websiteer link, and gurutto purno link) */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'পৌরসভা ও সরকারি লিংক' : 'Official Portals'}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="http://savarpourashava.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>সাভার পৌরসভা পোর্টাল</span>
                </a>
              </li>
              <li>
                <a
                  href="http://savar.dhaka.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>সাভার উপজেলা প্রশাসন বাতায়ন</span>
                </a>
              </li>
              <li>
                <a
                  href="http://dhaka.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>ঢাকা জেলা প্রশাসন</span>
                </a>
              </li>
              <li>
                <a
                  href="https://bangladesh.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>বাংলাদেশ জাতীয় তথ্য বাতায়ন</span>
                </a>
              </li>
              <li>
                <a
                  href="https://lged.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-slate-300"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>স্থানীয় সরকার প্রকৌশল (LGED)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://999.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-300 transition-colors flex items-center gap-1.5 text-rose-400"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>জাতীয় জরুরি সেবা (৯৯৯)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'দ্রুত মেনু' : 'Quick Menu'}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveView('feed')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {language === 'bn' ? 'পাবলিক অভিযোগ ফিড' : 'Public Feed'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('map-view')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {language === 'bn' ? 'সাভারের ওয়ার্ড ম্যাপ ও হটস্পট' : 'Ward Map'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('my-reports')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {language === 'bn' ? 'আমার অভিযোগের বর্তমান অবস্থা' : 'My Reports'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('emergency')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {language === 'bn' ? 'জরুরি সেবা ডিরেক্টরি' : 'Emergency Contacts'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (!isAdmin) toggleAdminRole();
                    setActiveView('admin-portal');
                  }}
                  className="hover:text-amber-300 text-amber-400 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>{language === 'bn' ? 'পৌরসভা অ্যাডমিন প্যানেল' : 'Admin Portal'}</span>
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button
                    onClick={() => setIsLoadBalancerOpen(true)}
                    className="hover:text-emerald-300 text-emerald-400 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <Server className="w-3 h-3" />
                    <span>{language === 'bn' ? 'ক্লাস্টার লোড ব্যালেন্সার ও হেলথ' : 'Cluster Load Balancer'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Key Municipal Wards */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">
              {language === 'bn' ? 'সাভার অঞ্চলসমূহ' : 'Covered Zones'}
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              {language === 'bn' ? (
                <>
                  <li>• সাভার বাজার ও কোর্ট চত্বর</li>
                  <li>• থানা রোড ও নামাবাজার</li>
                  <li>• ব্যাংক টাউন ও কলোনি</li>
                  <li>• শিমুলতলা ও মজিদপুর</li>
                  <li>• গেন্ডা ও আনন্দপুর রেলগেট</li>
                  <li>• উলাইল ও কর্ণপাড়া শিল্পাঞ্চল</li>
                  <li>• রেডিও কলোনি ও হেমায়েতপুর</li>
                  <li>• আশুলিয়া ও বাইপাইল করিডোর</li>
                </>
              ) : (
                <>
                  <li>• Savar Bazar & Court Area</li>
                  <li>• Thana Road & Namabazar</li>
                  <li>• Bank Town & Colony</li>
                  <li>• Shimultola & Majidpur</li>
                  <li>• Genda & Anandapur Railgate</li>
                  <li>• Ulail & Karnapara Industrial Zone</li>
                  <li>• Radio Colony & Hemayetpur</li>
                  <li>• Ashulia & Baipail Corridor</li>
                </>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Developer Acknowledgement */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong>Savar Service Hub</strong>. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span>Developed by <strong className="text-emerald-400">Shoriful Islam</strong></span>
            <span className="text-slate-600">|</span>
            <a href="tel:01938041064" className="text-emerald-400 hover:underline font-mono">
              Contact: 01938041064
            </a>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-400">
              <span>{language === 'bn' ? 'সাভার পৌরসভা নাগরিক ডিজিটাল সেবা' : 'Savar Municipal Digital Civic Service'}</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
