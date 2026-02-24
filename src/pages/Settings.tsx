import { useState, ChangeEvent } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Type, 
  Download, 
  Upload, 
  Bell,
  Palette,
  DollarSign,
  Lock,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import InvoiceSettingsPanel from '../components/InvoiceSettingsPanel';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'invoice'>('general');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('large');
  const [notifications, setNotifications] = useState(true);
  
  const { currency, setCurrency, adminPassword, setAdminPassword } = useStore();
  const [newPassword, setNewPassword] = useState(adminPassword);

  const handleBackup = () => {
    const data = localStorage.getItem('store-management-storage');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
    } else {
      toast.error('لا توجد بيانات للنسخ الاحتياطي');
    }
  };

  const handleRestore = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          JSON.parse(data); // Validate JSON
          localStorage.setItem('store-management-storage', data);
          toast.success('تم استعادة البيانات بنجاح، سيتم إعادة تحميل الصفحة');
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          toast.error('ملف النسخة الاحتياطية غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSavePassword = () => {
    if (newPassword.trim() === '') {
      toast.error('كلمة السر لا يمكن أن تكون فارغة');
      return;
    }
    setAdminPassword(newPassword);
    toast.success('تم تحديث كلمة السر بنجاح');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-slate-600" />
            الإعدادات والتخصيص
          </h1>
          <p className="text-lg text-slate-500">
            تخصيص مظهر التطبيق وإدارة البيانات
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors flex items-center gap-2 ${
              activeTab === 'general' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            عام
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors flex items-center gap-2 ${
              activeTab === 'invoice' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            الفواتير
          </button>
        </div>
      </header>

      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appearance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Palette className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-800">المظهر والخطوط</h2>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-700">الوضع (الثيم)</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <Sun className="w-8 h-8" />
                    <span className="font-bold">فاتح</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-slate-800 text-white' : 'border-slate-200 hover:border-slate-800'}`}
                  >
                    <Moon className="w-8 h-8" />
                    <span className="font-bold">داكن</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-700">حجم الخط</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFontSize('normal')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${fontSize === 'normal' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <Type className="w-6 h-6" />
                    <span className="font-bold">عادي</span>
                  </button>
                  <button 
                    onClick={() => setFontSize('large')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${fontSize === 'large' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <Type className="w-8 h-8" />
                    <span className="font-bold text-lg">كبير (موصى به)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <Bell className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-bold text-slate-800">الإشعارات</h2>
              </div>
              <div className="p-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-lg font-bold text-slate-800">تفعيل الإشعارات</p>
                    <p className="text-slate-500">تنبيهات المخزون والمهام</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${notifications ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${notifications ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <Download className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-800">النسخ الاحتياطي</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-slate-600">
                  قم بحفظ نسخة من بياناتك (المنتجات، المبيعات، العملاء) لاستعادتها لاحقاً.
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleBackup}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors"
                  >
                    <Download className="w-6 h-6" />
                    تحميل نسخة احتياطية
                  </button>
                  
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6" />
                    استعادة من ملف
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={handleRestore}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Currency and Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden md:col-span-2">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800">العملة والأمان</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-700">العملة الافتراضية</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrency('EGP')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${currency === 'EGP' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                  >
                    <span className="text-2xl font-bold">EGP</span>
                    <span className="font-bold">جنيه مصري</span>
                  </button>
                  <button 
                    onClick={() => setCurrency('USD')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${currency === 'USD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                  >
                    <span className="text-2xl font-bold">$</span>
                    <span className="font-bold">دولار أمريكي</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  كلمة سر الإدارة (لإظهار التكلفة والمخزون)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:ring-0 outline-none"
                    placeholder="أدخل كلمة السر الجديدة"
                  />
                  <button
                    onClick={handleSavePassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    حفظ
                  </button>
                </div>
                <p className="text-sm text-slate-500">
                  تستخدم هذه الكلمة لإظهار التكلفة والمخزون المخفيين في صفحة المنتجات.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[800px]">
          <InvoiceSettingsPanel />
        </div>
      )}
    </div>
  );
}
