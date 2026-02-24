import { useState, FormEvent } from 'react';
import { useStore, Customer } from '../store/useStore';
import { 
  Users, 
  Search, 
  Plus, 
  Star, 
  Phone, 
  ShoppingBag,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, currency } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    points: 0,
    totalSpent: 0,
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        points: 0,
        totalSpent: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('الرجاء تعبئة الاسم ورقم الجوال');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData as Customer);
      toast.success('تم تحديث بيانات العميل');
    } else {
      addCustomer({
        ...formData,
        id: Date.now().toString(),
      } as Customer);
      toast.success('تم إضافة العميل بنجاح');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            إدارة العملاء
          </h1>
          <p className="text-lg text-slate-500">
            إجمالي العملاء: <span className="font-bold text-purple-600">{customers.length}</span>
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center shadow-sm"
        >
          <Plus className="w-6 h-6" />
          إضافة عميل جديد
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو رقم الجوال..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id} 
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
              onClick={() => handleOpenModal(customer)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:bg-purple-100 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl">
                  {customer.name.charAt(0)}
                </div>
                {customer.totalSpent > 1000 && (
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500" />
                    عميل مميز
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{customer.name}</h3>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-slate-600 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span dir="ltr" className="font-mono">{customer.phone}</span>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span>إجمالي المشتريات: <strong className="text-emerald-600">{customer.totalSpent} {currency}</strong></span>
                </div>

                <div className="flex items-center gap-3 text-slate-600 text-lg">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Star className="w-5 h-5" />
                  </div>
                  <span>نقاط الولاء: <strong className="text-amber-600">{customer.points} نقطة</strong></span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 flex flex-col items-center">
              <Users className="w-20 h-20 text-slate-300 mb-4" />
              <p className="text-2xl font-bold text-slate-600">لا يوجد عملاء مطابقين للبحث</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-50/50">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-8 h-8 text-purple-600" />
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-bold text-slate-700">اسم العميل *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-lg font-bold text-slate-700">رقم الجوال *</label>
                  <input 
                    type="tel" 
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono text-right focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="05xxxxxxxx"
                  />
                </div>
                
                {editingCustomer && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-lg font-bold text-slate-700">نقاط الولاء</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.points}
                        onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-lg font-bold text-slate-700">إجمالي المشتريات ({currency})</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={formData.totalSpent}
                        onChange={e => setFormData({...formData, totalSpent: parseFloat(e.target.value)})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-lg text-slate-600 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                form="customer-form"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-sm transition-colors"
              >
                حفظ العميل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
