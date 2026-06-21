import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Package, 
  Users, 
  Banknote, 
  Edit3, 
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface SubscriptionPackage {
  id: string;
  name: string;
  employees: number;
  monthlyPrice: number;
  annualPrice: number;
}

export const PackagesView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [employees, setEmployees] = useState('15');
  const [monthlyPrice, setMonthlyPrice] = useState('299');
  const [annualPrice, setAnnualPrice] = useState('2999');

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (e) {
      console.error("Error loading packages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setEditingPackage(null);
    setName('');
    setEmployees('15');
    setMonthlyPrice('299');
    setAnnualPrice('2999');
    setShowModal(true);
  };

  const openEditModal = (pack: SubscriptionPackage) => {
    setEditingPackage(pack);
    setName(pack.name);
    setEmployees(pack.employees.toString());
    setMonthlyPrice(pack.monthlyPrice.toString());
    setAnnualPrice(pack.annualPrice.toString());
    setShowModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert(lang === 'ar' ? 'اسم الباقة مطلوب' : 'Package Name is required');
      return;
    }

    try {
      const body = {
        name,
        employees: parseInt(employees) || 0,
        monthlyPrice: parseFloat(monthlyPrice) || 0,
        annualPrice: parseFloat(annualPrice) || 0
      };

      const url = editingPackage
        ? `${API_BASE_URL}/api/packages/${editingPackage.id}`
        : `${API_BASE_URL}/api/packages`;
      const method = editingPackage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPackage(null);
        fetchPackages();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save package');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend API');
    }
  };

  const handleDeletePackage = async (pack: SubscriptionPackage) => {
    const confirmMsg = lang === 'ar'
      ? `هل أنت متأكد من حذف باقة ${pack.name} نهائياً؟`
      : `Are you sure you want to delete package ${pack.name} permanently?`;

    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/packages/${pack.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPackages();
      } else {
        alert(lang === 'ar' ? 'فشل حذف الباقة' : 'Failed to delete package');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header and Add button */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'باقات اشتراكات النظام' : 'Subscription Packages'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {lang === 'ar' ? 'تخصيص الباقات وأسعارها وتحديد سقف الموظفين المسموح به لكل فئة' : 'Configure package plans, prices, and allowed employee caps.'}
          </p>
        </div>
        <button 
          onClick={openAddModal} 
          className="flex items-center gap-2 px-6 py-3 bg-[#15385E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#15385E]/20 hover:bg-[#17AE9F] transition-all"
        >
          <Plus size={18} />
          {lang === 'ar' ? 'إنشاء باقة جديدة' : 'Create Package'}
        </button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100/70 rounded-[2.5rem] shadow-sm">
          {lang === 'ar' ? 'جاري تحميل الباقات...' : 'Loading packages...'}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100/70 rounded-[2.5rem] shadow-sm space-y-4">
          <Package size={48} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold">{lang === 'ar' ? 'لا توجد باقات معرفة حالياً' : 'No packages defined yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pack) => {
            const isPremium = pack.name.includes('الاحترافية') || pack.name.includes('Enterprise') || pack.name.includes('pro') || pack.name.includes('المتقدمة');
            
            return (
              <div 
                key={pack.id} 
                className={`bg-white p-6 rounded-[2.5rem] border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isPremium ? 'border-[#17AE9F]/30' : 'border-gray-100/70'
                }`}
              >
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-[#E8F7F5] text-[#17AE9F] text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1 border-l border-b border-[#17AE9F]/10">
                    <Sparkles size={10} />
                    <span>{lang === 'ar' ? 'موصى بها' : 'Popular'}</span>
                  </div>
                )}

                <div>
                  {/* Package Title & Icon */}
                  <div className="flex items-center gap-3 mb-6 pt-2">
                    <div className={`p-3 rounded-2xl ${isPremium ? 'bg-[#E8F7F5] text-[#17AE9F]' : 'bg-[#EBF2FA] text-[#15385E]'}`}>
                      <Package size={22} />
                    </div>
                    <div>
                      <h3 className="text-md font-black text-gray-900 leading-tight">{pack.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{lang === 'ar' ? 'فئة باقة النظام' : 'Subscription tier'}</p>
                    </div>
                  </div>

                  {/* Allowed Employees count */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/20">
                      <Users size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'عدد الموظفين المسموح' : 'Allowed Employees Count'}</p>
                        <p className="text-xs font-black text-gray-900 mt-0.5">
                          {pack.employees} {lang === 'ar' ? 'موظف بحد أقصى' : 'users maximum'}
                        </p>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/20">
                        <Banknote size={16} className="text-[#17AE9F]" />
                        <div className="mt-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'السعر الشهري' : 'Monthly Price'}</p>
                          <p className="text-xs font-black text-[#15385E] mt-0.5">
                            {pack.monthlyPrice.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/20">
                        <Banknote size={16} className="text-[#15385E]" />
                        <div className="mt-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'السعر السنوي' : 'Annual Price'}</p>
                          <p className="text-xs font-black text-[#17AE9F] mt-0.5">
                            {pack.annualPrice.toLocaleString()} <span className="text-[9px] font-bold text-gray-400">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex gap-2 border-t border-gray-50 pt-4 justify-end">
                  <button 
                    onClick={() => openEditModal(pack)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-[#EBF2FA] text-gray-500 hover:text-[#15385E] border border-gray-100 hover:border-[#15385E]/10 rounded-xl text-xs font-bold transition-all"
                  >
                    <Edit3 size={13} />
                    <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                  </button>
                  <button 
                    onClick={() => handleDeletePackage(pack)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50/30 hover:bg-red-500 text-red-500 hover:text-white border border-red-100 hover:border-red-500/20 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={13} />
                    <span>{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-50/50 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-[#15385E]" size={18} />
                {editingPackage 
                  ? (lang === 'ar' ? `تعديل باقة: ${editingPackage.name}` : `Edit Package: ${editingPackage.name}`)
                  : (lang === 'ar' ? 'إنشاء باقة اشتراك جديدة' : 'Create New Package')}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingPackage(null);
                }} 
                className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePackage} className="p-6 space-y-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'اسم الباقة' : 'Package Name'}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={lang === 'ar' ? 'مثال: الباقة الاحترافية' : 'e.g. Pro Package'} 
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'عدد الموظفين المسموح' : 'Allowed Employees Count'}</label>
                <input 
                  type="number" 
                  value={employees} 
                  onChange={(e) => setEmployees(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'السعر الشهري (ر.س)' : 'Monthly Price (SAR)'}</label>
                  <input 
                    type="number" 
                    value={monthlyPrice} 
                    onChange={(e) => setMonthlyPrice(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'السعر السنوي (ر.س)' : 'Annual Price (SAR)'}</label>
                  <input 
                    type="number" 
                    value={annualPrice} 
                    onChange={(e) => setAnnualPrice(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-50 flex gap-3 justify-end">
                <button type="submit" className="px-6 py-3 bg-[#15385E] text-white rounded-xl text-xs font-bold shadow-lg hover:bg-[#17AE9F] transition-all">
                  {lang === 'ar' ? 'حفظ الباقة' : 'Save Package'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                  }} 
                  className="px-6 py-3 bg-white border border-gray-100 text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
