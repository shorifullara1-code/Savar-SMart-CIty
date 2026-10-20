import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Search } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface UserData {
  id: string;
  name: string;
  mobile: string;
  ward: string;
}

export const UserList: React.FC = () => {
  const { language, wards } = useApp();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filterWard, setFilterWard] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data) {
        setUsers(data.map(p => ({
          id: p.id,
          name: p.full_name || 'N/A',
          mobile: p.mobile || 'N/A',
          ward: p.ward || 'N/A'
        })));
      }
    };
    fetchUsers();
  }, []);


  const filteredUsers = users.filter(u => 
    (filterWard === 'all' || u.ward === filterWard) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.mobile.includes(search))
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(language === 'bn' ? 'ব্যবহারকারী তালিকা' : 'User List', 14, 15);
    (doc as any).autoTable({
      head: [[language === 'bn' ? 'নাম' : 'Name', language === 'bn' ? 'মোবাইল' : 'Mobile', language === 'bn' ? 'ওয়ার্ড' : 'Ward']],
      body: filteredUsers.map(u => [u.name, u.mobile, u.ward]),
    });
    doc.save('user-list.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              placeholder={language === 'bn' ? 'অনুসন্ধান...' : 'Search...'}
              className="pl-9 pr-3 py-2 border rounded-lg text-xs"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="border rounded-lg text-xs px-2"
            onChange={(e) => setFilterWard(e.target.value)}
          >
            <option value="all">{language === 'bn' ? 'সকল ওয়ার্ড' : 'All Wards'}</option>
            {wards.map(w => <option key={w.wardNumber} value={w.wardNumber}>{language === 'bn' ? w.banglaName : w.areaName}</option>)}
          </select>
        </div>
        <button 
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold">
            <tr>
              <th className="p-3">{language === 'bn' ? 'নাম' : 'Name'}</th>
              <th className="p-3">{language === 'bn' ? 'মোবাইল' : 'Mobile'}</th>
              <th className="p-3">{language === 'bn' ? 'ওয়ার্ড' : 'Ward'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 font-mono">{u.mobile}</td>
                <td className="p-3">{u.ward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
