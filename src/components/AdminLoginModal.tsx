import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, Loader2, Eye, EyeOff, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [idOrEmail, setIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin, language } = useApp();

  if (!isOpen) return null;

  const handleClose = () => {
    setIdOrEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await loginAdmin({
        idOrEmail: idOrEmail.trim(),
        password: password.trim(),
      });

      if (success) {
        setIdOrEmail('');
        setPassword('');
        setError('');
        onClose();
      } else {
        setError(
          language === 'bn'
            ? 'লগইন ব্যর্থ। সঠিক অ্যাডমিন আইডি ও পাসওয়ার্ড দিন।'
            : 'Login failed. Please check your Admin ID and password.'
        );
      }
    } catch (err: any) {
      setError(err?.message || (language === 'bn' ? 'লগইনে সমস্যা হয়েছে।' : 'Error logging in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-600 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'bn' ? 'সাভার পৌরসভা অ্যাডমিন লগইন' : 'Pourashava Admin Login'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn' 
              ? 'পৌরসভা কর্মকর্তা ও প্রশাসনিক পোর্টালে নিরাপদ প্রবেশাধিকার' 
              : 'Secure access to Savar Municipality Administrative Portal'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'bn' ? 'অ্যাডমিন আইডি / মোবাইল / ইমেল' : 'Admin ID / Mobile / Email'} *
            </label>
            <div className="relative">
              <input
                type="text"
                value={idOrEmail}
                onChange={(e) => setIdOrEmail(e.target.value)}
                placeholder={language === 'bn' ? 'আপনার অ্যাডমিন আইডি লিখুন' : 'Enter your Admin ID'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {language === 'bn' ? 'গোপন পাসওয়ার্ড' : 'Password'} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-75 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{language === 'bn' ? 'অ্যাডমিন পোর্টালে প্রবেশ করুন' : 'Login to Admin Portal'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
