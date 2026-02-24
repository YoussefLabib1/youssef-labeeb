import { useState, FormEvent } from 'react';
import { useStore, Staff } from '../store/useStore';
import { 
  UserCircle, 
  Plus, 
  ShieldAlert, 
  KeyRound,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const { staff, addStaff } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'cashier',
    pin: '',
  });

  const handleOpenModal = () => {
    setFormData({
      name: '',
      role: 'cashier',
      pin: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pin) {
      toast.error('الرجاء تعبئة الاسم ورمز الدخول');
      return;
    }

    if (formData.pin.length < 4) {
      toast.error('رمز الدخول يجب أن يكون 4 أرقام على الأقل');
      return;
    }

    addStaff({
      ...formData,
      id: Date.now().toString(),
    } as Staff);
    
    toast.success('تم إضافة الموظف بنجاح');
    setIsModalOpen(false);
  };

  const roleColors = {
    admin: 'bg-rose-100 text-rose-700 border-rose-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    cashier: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const roleLabels = {
    admin: 'مدير النظام',
    manager: 'مشرف',
    cashier: 'كاشير',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-rose-600" />
            إدارة الموظفين والصلاحيات
          </h1>
          <p className="text-lg text-slate-500">
            إجمالي الموظفين: <span className="font-bold text-rose-600">{staff.length}</span>
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center shadow-sm"
        >
          <Plus className="w-6 h-6" />
          إضافة موظف جديد
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <div 
            key={member.id} 
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:bg-rose-100 transition-colors"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-bold text-2xl">
                {member.name.charAt(0)}
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${roleColors[member.role]}`}>
                {roleLabels[member.role]}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{member.name}</h3>
            
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600 text-lg">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span>رمز الدخول: <strong className="font-mono tracking-widest text-slate-800">****</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-8 h-8 text-rose-600" />
                إضافة موظف جديد
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-bold text-slate-700">اسم الموظف *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="الاسم الكامل"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg font-bold text-slate-700">الدور والصلاحية *</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Staff['role']})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                  >
                    <option value="cashier">كاشير (مبيعات فقط)</option>
                    <option value="manager">مشرف (مبيعات ومخزون)</option>
                    <option value="admin">مدير النظام (صلاحيات كاملة)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-bold text-slate-700">رمز الدخول (PIN) *</label>
                  <input 
                    type="password" 
                    required
                    maxLength={6}
                    pattern="\d*"
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="أرقام فقط (مثال: 1234)"
                  />
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
                    <ShieldAlert className="w-4 h-4" />
                    يستخدم هذا الرمز لتسجيل الدخول
                  </p>
                </div>
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
                form="staff-form"
                className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-sm transition-colors"
              >
                حفظ الموظف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
