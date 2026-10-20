import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const NetworkStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showBackOnlineNotice, setShowBackOnlineNotice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnlineNotice(true);
      const timer = setTimeout(() => setShowBackOnlineNotice(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnlineNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualCheck = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      setShowBackOnlineNotice(true);
      setTimeout(() => setShowBackOnlineNotice(false), 3000);
    }
  };

  if (isOnline && !showBackOnlineNotice) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white px-4 py-2 text-xs font-medium shadow-md flex items-center justify-between gap-3 sticky top-0 z-50 animate-in slide-in-from-top duration-200">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
            <span>
              <strong>ইন্টারনেট সংযোগ বিচ্ছিন্ন:</strong> সাভার সার্ভিস হাব বর্তমানে অফলাইন ক্যাশ মোডে চলছে। স্থানীয় ডেটা প্রদর্শিত হচ্ছে।
            </span>
          </div>
          <button
            onClick={handleManualCheck}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>পুনরায় চেক করুন</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-medium shadow-sm flex items-center justify-center gap-2 sticky top-0 z-50 animate-in slide-in-from-top duration-200">
      <Wifi className="w-4 h-4 text-emerald-200" />
      <span>ইন্টারনেট সংযোগ সক্রিয় হয়েছে। লোড ব্যালেন্সার ক্লাস্টারের সাথে সিঙ্ক সফল!</span>
    </div>
  );
};
