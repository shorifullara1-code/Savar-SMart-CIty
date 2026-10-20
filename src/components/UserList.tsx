import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Search, Users, RefreshCw, FileSpreadsheet, Printer } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UserData {
  id: string;
  name: string;
  mobile: string;
  ward: string;
  area: string;
  role: string;
}

export const UserList: React.FC = () => {
  const { language, wards, showToast } = useApp();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filterWard, setFilterWard] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  // 1. Robust PDF Download with autoTable
  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(5, 150, 105); // Emerald-600
      doc.rect(0, 0, 210, 24, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SAVAR POURASHAVA - CITIZEN DIRECTORY', 14, 14);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Citizen Submissions & Account Directory', 14, 20);

      // Metadata info
      doc.setTextColor(70, 70, 70);
      doc.setFontSize(9);
      doc.text(`Total Records: ${filteredUsers.length} | Export Date: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableData = filteredUsers.map((u, index) => [
        String(index + 1),
        u.name || 'N/A',
        u.mobile || 'N/A',
        u.ward || 'Ward 1',
        u.area || 'Savar',
        u.role === 'admin' ? 'Admin' : 'Citizen',
      ]);

      autoTable(doc, {
        startY: 34,
        head: [['#', 'Name', 'Mobile Number', 'Ward', 'Area', 'Role']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42], // Slate-900
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          font: 'helvetica',
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 35, font: 'courier' },
          3: { cellWidth: 25 },
          4: { cellWidth: 45 },
          5: { cellWidth: 20, halign: 'center' },
        },
      });

      doc.save(`savar-citizens-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast(
        language === 'bn' ? 'নাগরিক তালিকা পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : 'Citizen directory PDF downloaded successfully!',
        'success'
      );
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      // If error occurs, fallback to CSV immediately
      downloadCSV();
      showToast(
        language === 'bn' 
          ? 'পিডিএফ ব্যর্থ হয়েছে, সিএসভি ফাইল হিসেবে ডাউনলোড করা হলো।' 
          : 'PDF generation issue, exported as CSV instead.',
        'info'
      );
    } finally {
      setDownloading(false);
    }
  };

  // 2. UTF-8 CSV Export (supports full Bengali and Excel)
  const downloadCSV = () => {
    try {
      const headers = ['#', 'Name', 'Mobile', 'Ward', 'Area', 'Role'];
      const rows = filteredUsers.map((u, idx) => [
        idx + 1,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${u.mobile}"`,
        `"${u.ward}"`,
        `"${(u.area || '').replace(/"/g, '""')}"`,
        `"${u.role === 'admin' ? 'Admin' : 'Citizen'}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `savar-citizens-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        language === 'bn' ? 'সিএসভি (এক্সেল) ফাইল ডাউনলোড সম্পন্ন হয়েছে!' : 'CSV exported successfully!',
        'success'
      );
    } catch (e) {
      console.error('CSV export error:', e);
    }
  };

  // 3. Browser Print dialog for instant print to paper or browser PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
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

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
          <button 
            onClick={downloadCSV}
            title="Export as CSV / Excel"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'এক্সেল / CSV' : 'CSV'}</span>
          </button>

          <button 
            onClick={handlePrint}
            title="Print Table"
            className="hidden sm:flex bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold items-center gap-1.5 cursor-pointer border border-slate-200 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          <button 
            onClick={downloadPDF}
            disabled={downloading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-75"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading 
                ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...') 
                : (language === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF')}
            </span>
          </button>
        </div>
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
