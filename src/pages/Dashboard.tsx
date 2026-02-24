import { useStore } from '../store/useStore';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  CheckSquare,
  Users, 
  Package, 
  ShoppingCart 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Dashboard() {
  const { products, sales, customers, tasks, currency } = useStore();

  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date.startsWith(today));
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">مرحباً بك يا مدير 👋</h1>
          <p className="text-lg text-slate-500">
            {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            <span>يوم موفق!</span>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">مبيعات اليوم</p>
            <h2 className="text-3xl font-bold text-slate-800">{todaysRevenue} {currency}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">إجمالي المنتجات</p>
            <h2 className="text-3xl font-bold text-slate-800">{products.length}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">العملاء المسجلين</p>
            <h2 className="text-3xl font-bold text-slate-800">{customers.length}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">تنبيهات المخزون</p>
            <h2 className="text-3xl font-bold text-amber-600">{lowStockProducts.length}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-red-50/50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              نواقص المخزون
            </h3>
            <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-sm font-bold">
              {lowStockProducts.length} منتجات
            </span>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-4">
                {lowStockProducts.map(product => (
                  <li key={product.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-lg text-slate-800">{product.name}</p>
                      <p className="text-slate-500">الباركود: {product.barcode}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 font-bold text-2xl">{product.stock}</p>
                      <p className="text-xs text-slate-500 font-semibold">المتبقي</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <p className="text-xl font-bold text-slate-700">المخزون ممتاز!</p>
                <p>لا توجد منتجات ناقصة حالياً.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-cyan-50/50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-cyan-500" />
              مهام اليوم
            </h3>
            <span className="bg-cyan-100 text-cyan-700 py-1 px-3 rounded-full text-sm font-bold">
              {pendingTasks.length} متبقية
            </span>
          </div>
          <div className="p-6">
            {pendingTasks.length > 0 ? (
              <ul className="space-y-4">
                {pendingTasks.map(task => (
                  <li key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                    <p className="font-bold text-lg text-slate-800">{task.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                <p className="text-xl font-bold text-slate-700">أنجزت كل المهام!</p>
                <p>عمل رائع، استمر هكذا.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
