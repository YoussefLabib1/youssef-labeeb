import { useStore } from '../store/useStore';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Package, 
  DollarSign 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Reports() {
  const { sales, products, currency } = useStore();

  // Calculate last 7 days sales
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'yyyy-MM-dd');
  });

  const salesData = last7Days.map(date => {
    const daySales = sales.filter(s => s.date.startsWith(date));
    const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
    return {
      name: format(parseISO(date), 'EEEE', { locale: ar }),
      total,
      count: daySales.length
    };
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = sales.reduce((sum, sale) => {
    const cost = sale.items.reduce((c, item) => c + (item.cost * item.quantity), 0);
    return sum + (sale.total - sale.tax - cost);
  }, 0);

  // Top selling products
  const productSales = new Map<string, number>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      productSales.set(item.name, (productSales.get(item.name) || 0) + item.quantity);
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            التقارير والتحليلات
          </h1>
          <p className="text-lg text-slate-500">
            نظرة عامة على أداء المحل
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          <span>آخر 7 أيام</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">إجمالي الإيرادات</p>
            <h2 className="text-3xl font-bold text-slate-800">{totalRevenue.toFixed(2)} {currency}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">صافي الأرباح (التقديري)</p>
            <h2 className="text-3xl font-bold text-slate-800">{totalProfit.toFixed(2)} {currency}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-lg mb-1">إجمالي العمليات</p>
            <h2 className="text-3xl font-bold text-slate-800">{sales.length} عملية</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            المبيعات (آخر 7 أيام)
          </h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} name={`المبيعات (${currency})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-500" />
            المنتجات الأكثر مبيعاً
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                        index === 1 ? 'bg-slate-200 text-slate-600' : 
                        index === 2 ? 'bg-orange-100 text-orange-600' : 
                        'bg-slate-100 text-slate-500'}`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-bold text-lg text-slate-800">{product.name}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-emerald-600 text-xl">{product.quantity}</span>
                    <span className="text-slate-500 text-sm mr-1">حبة</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Package className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl font-bold">لا توجد بيانات كافية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
