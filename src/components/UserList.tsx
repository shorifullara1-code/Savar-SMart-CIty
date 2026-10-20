import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Search, Users, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface UserData {
  id: string;
  name: string;
  mobile: string;
  ward: string;
  area: string;
  role: string;
}

export const UserList: React.FC = () => {
  const { language, wards } = useApp();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filterWard, setFilterWard] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    let combined: UserData[] = [];

    // 1. Fetch from Supabase 'citizens' table
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        combined = data.map((p: any) => ({
          id: p.id,
          name: p.name || 'N/A',
          mobile: p.mobile || 'N/A',
          ward: p.ward || 'Ward 1',
          area: p.area || 'Savar',
          role: p.role || 'citizen',
        }));
      }
    } catch (err) {
      console.warn('Supabase citizens fetch notice:', err);
    }

    // 2. Merge with localStorage registered citizens cache
    try {
      const localRaw = localStorage.getItem('savar_registered_citizens_v2');
      if (localRaw) {
        const localList = JSON.parse(localRaw);
        const existingMobiles = new Set(combined.map((u) => u.mobile.replace(/\s+/g, '')));
        for (const loc of localList) {
          const clean = (loc.mobile || '').replace(/\s+/g, '');
          if (!existingMobiles.has(clean)) {
            combined.push({
              id: loc.id || `citizen-${clean}`,
              name: loc.name || 'N/A',
              mobile: loc.mobile || 'N/A',
              ward: loc.ward || 'Ward 1',
              area: loc.area || 'Savar',
              role: loc.role || 'citizen',
            });
            existingMobiles.add(clean);
          }
        }
      }
    } catch (e) {
      // ignore
    }

    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchWard = filterWard === 'all' || u.ward === filterWard;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search) ||
      u.area.toLowerCase().includes(search.toLowerCase());
    return matchWard && matchSearch;
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(language === 'bn' ? 'সাভার পৌরসভা - নিবন্ধিত নাগরিক ও ব্যবহারকারী তালিকা' : 'Savar Pourashava - Registered Citizens Directory', 14, 15);
    (doc as any).autoTable({
      head: [
        [
          language === 'bn' ? 'নাম' : 'Name',
          language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile',
          language === 'bn' ? 'ওয়ার্ড' : 'Ward',
          language === 'bn' ? 'এলাকা' : 'Area',
          language === 'bn' ? 'পদবী' : 'Role',
        ],
      ],
      body: filteredUsers.map((u) => [
        u.name,
        u.mobile,
        u.ward,
        u.area,
        u.role === 'admin' ? (language === 'bn' ? 'অ্যাডমিন' : 'Admin') : (language === 'bn' ? 'নাগরিক' : 'Citizen'),
      ]),
    });
    doc.save('savar-citizens-list.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              value={search}
              placeholder={language === 'bn' ? 'নাম বা মোবাইল দিয়ে অনুসন্ধান...' : 'Search by name or mobile...'}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterWard}
            className="border border-slate-300 rounded-xl text-xs px-3 py-2 outline-hidden bg-white focus:ring-2 focus:ring-emerald-500"
            onChange={(e) => setFilterWard(e.target.value)}
          >
            <option value="all">{language === 'bn' ? 'সকল ওয়ার্ড' : 'All Wards'}</option>
            {wards.map((w) => (
              <option key={w.wardNumber} value={w.wardNumber}>
                {language === 'bn' ? `${w.banglaName} (${w.wardNumber})` : `${w.areaName} (${w.wardNumber})`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            title={language === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        <button 
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'bn' ? 'নাগরিক তালিকা পিডিএফ ডাউনলোড' : 'Export PDF'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">
              {language === 'bn' ? 'কোনো নিবন্ধিত নাগরিক পাওয়া যায়নি' : 'No registered citizens found'}
            </p>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? 'নাগরিকরা মোবাইল দিয়ে রেজিস্ট্রেশন করলে এই তালিকায় তাৎক্ষণিক যুক্ত হবে।' : 'New registrations will automatically appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">{language === 'bn' ? 'নাগরিকের নাম' : 'Full Name'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'লগইন মোবাইল নম্বর' : 'Mobile Number'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'এলাকা ও ওয়ার্ড' : 'Area & Ward'}</th>
                  <th className="p-3.5">{language === 'bn' ? 'ভূমিকা' : 'Role'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-800">{u.name}</td>
                    <td className="p-3.5 font-mono text-emerald-700 font-medium">{u.mobile}</td>
                    <td className="p-3.5 text-slate-600">{u.area} • {u.ward}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {u.role === 'admin' ? 'অ্যাডমিন' : 'নাগরিক'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
