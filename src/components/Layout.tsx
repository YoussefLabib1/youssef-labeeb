import { Outlet, NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserCircle, 
  BarChart3, 
  CheckSquare, 
  Settings,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'الرئيسية', color: 'text-blue-500', bg: 'bg-blue-50' },
  { to: '/pos', icon: ShoppingCart, label: 'نقطة البيع', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { to: '/inventory', icon: Package, label: 'المخزون', color: 'text-amber-500', bg: 'bg-amber-50' },
  { to: '/customers', icon: Users, label: 'العملاء', color: 'text-purple-500', bg: 'bg-purple-50' },
  { to: '/staff', icon: UserCircle, label: 'الموظفين', color: 'text-rose-500', bg: 'bg-rose-50' },
  { to: '/reports', icon: BarChart3, label: 'التقارير', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { to: '/tasks', icon: CheckSquare, label: 'المهام', color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { to: '/ai-tools', icon: Sparkles, label: 'الذكاء الاصطناعي', color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  { to: '/settings', icon: Settings, label: 'الإعدادات', color: 'text-slate-500', bg: 'bg-slate-50' },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-200 shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            م
          </div>
          <h1 className="text-xl font-bold text-slate-800">إدارة المحل</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-lg',
                  isActive 
                    ? `bg-slate-100 text-slate-900 shadow-sm border border-slate-200` 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className={clsx("w-6 h-6", item.color)} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 px-2 py-2 pb-safe">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all',
                  isActive ? item.bg : 'transparent'
                )
              }
            >
              <item.icon className={clsx("w-6 h-6 mb-1", item.color)} />
              <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
