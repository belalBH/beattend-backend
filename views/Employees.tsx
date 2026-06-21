import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  UserPlus, 
  LayoutGrid, 
  List, 
  Eye,
  Settings2,
  MoreHorizontal,
  MapPin,
  Phone,
  Cake,
  Mail
} from 'lucide-react';
import { INITIAL_EMPLOYEES, API_BASE_URL } from '../constants';
import { EmployeeDetailView } from './EmployeeDetail';
import { translations } from '../i18n';

type ViewMode = 'grid' | 'list';

export const EmployeesView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else {
        setEmployees(INITIAL_EMPLOYEES);
      }
    } catch (e) {
      console.error("Error fetching employees:", e);
      setEmployees(INITIAL_EMPLOYEES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (isAddingNew || selectedEmployee) {
    return (
      <EmployeeDetailView 
        employee={selectedEmployee} 
        onBack={(shouldRefresh) => { 
          setIsAddingNew(false); 
          setSelectedEmployee(null); 
          if (shouldRefresh) fetchEmployees(); 
        }} 
        lang={lang} 
      />
    );
  }

  const extendedEmployees = employees.map((emp, idx) => ({
    ...emp,
    id_str: emp.empNo || (1256 + idx).toString(),
    type: idx % 2 === 0 ? 'Experience' : 'Fresher',
    teamLeader: idx === 0 ? 'Philip P.' : 'Arlene K.',
    productivity: emp.productivity || Math.floor(Math.random() * (95 - 60 + 1)) + 60,
    joiningDate: emp.joiningDate || emp.hiringDate || (lang === 'ar' ? '20 مارس 2015' : 'Mar 20, 2015'),
    salary: emp.salary ? (lang === 'ar' ? parseInt(emp.salary).toLocaleString() + ' ر.س' : '$' + parseInt(emp.salary).toLocaleString()) : (lang === 'ar' ? '6,000 ر.س' : '$6,000'),
    workType: emp.workType || emp.contractType || (idx % 3 === 0 ? 'WFO' : 'WFH'),
    location: emp.location || emp.branch || (lang === 'ar' ? 'الرياض، السعودية' : 'Riyadh, KSA'),
    status: emp.status === 'نشط' || emp.status === 'active' || emp.status === 'على رأس العمل' || emp.status === 'On duty' ? t.active : t.inactive
  }));

  const filteredEmployees = extendedEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.id_str.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{t.manage_employees}</h2>
        <button 
          onClick={() => { setIsAddingNew(true); setSelectedEmployee(null); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#15385E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#15385E]/10 hover:bg-[#17AE9F] transition-all"
        >
          <UserPlus size={18} /> {t.add_new}
        </button>
      </div>

      <div className="bg-white border border-gray-50 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
              <input 
                type="text" 
                placeholder={t.search_placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-50 border-none rounded-xl text-xs font-medium outline-none`}
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500">
              {t.status} : {lang === 'ar' ? 'الكل' : 'All'} <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500">
              <Settings2 size={14} /> {t.advance_filter}
            </button>

            <div className={`flex items-center gap-1 bg-gray-50 p-1 rounded-xl ${lang === 'ar' ? 'mr-auto' : 'ml-auto'} lg:ml-0`}>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#15385E] shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#15385E] shadow-sm' : 'text-gray-400'}`}><List size={18} /></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            {lang === 'ar' ? 'جاري تحميل الموظفين...' : 'Loading employees...'}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {lang === 'ar' ? 'لا يوجد موظفين حالياً' : 'No employees found'}
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                  <th className="px-4 py-4">{t.id}</th>
                  <th className="px-4 py-4">{t.name}</th>
                  <th className="px-4 py-4">{t.status}</th>
                  <th className="px-4 py-4">{t.role}</th>
                  <th className="px-4 py-4">{t.productive}</th>
                  <th className="px-4 py-4">{t.joining_date}</th>
                  <th className="px-4 py-4">{t.salary}</th>
                  <th className="px-4 py-4">{t.work_type}</th>
                  <th className="px-4 py-4 text-center">{lang === 'ar' ? 'تعديل' : 'Edit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-[11px] font-bold text-[#15385E]">{emp.id_str}</td>
                    <td className="px-4 py-4 text-[11px] font-bold text-gray-900">{emp.name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${emp.status === t.active ? 'bg-[#E8F7F5] text-[#17AE9F]' : 'bg-gray-100 text-gray-400'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium text-gray-500">{emp.title}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20 overflow-hidden">
                          <div className="h-full bg-[#15385E]" style={{ width: `${emp.productivity}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">{emp.productivity}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium text-gray-500">{emp.joiningDate}</td>
                    <td className="px-4 py-4 text-[11px] font-bold text-gray-700">{emp.salary}</td>
                    <td className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase">{emp.workType}</td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => setSelectedEmployee(emp)} className="p-1.5 hover:bg-white rounded-lg text-gray-300 hover:text-[#15385E]"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {filteredEmployees.map((emp) => (
              <div 
                key={emp.id} 
                onClick={() => setSelectedEmployee(emp)}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm relative cursor-pointer hover:shadow-md transition-all group"
              >
                <button className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-gray-300 group-hover:text-[#15385E]`}><MoreHorizontal size={20} /></button>
                <div className="text-center mb-6">
                  <h3 className="text-sm font-bold text-gray-900">{emp.name}</h3>
                  <p className="text-[11px] text-gray-400 font-medium">{emp.title}</p>
                </div>
                <div className="flex justify-center mb-4"><img src={emp.avatar} className="w-20 h-20 rounded-full border-4 border-gray-50 object-cover" /></div>
                <div className="space-y-3 pt-6 border-t border-gray-50 text-[10px] font-bold">
                  <div className="flex justify-between text-gray-400"><span>{lang === 'ar' ? 'الموقع' : 'Location'}</span><span className="text-gray-900 truncate max-w-[120px]">{emp.location}</span></div>
                  <div className="flex justify-between text-gray-400"><span>{lang === 'ar' ? 'الحالة' : 'Status'}</span><span className={emp.status === t.active ? 'text-[#17AE9F]' : 'text-gray-400'}>{emp.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
