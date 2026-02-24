import React, { useState, useMemo } from 'react';
import { useStore, Sale } from '../store/useStore';
import { 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Download, 
  Copy, 
  RotateCcw, 
  Edit, 
  Trash2,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import InvoicePreviewModal from './InvoicePreviewModal';
import EditInvoiceModal from './EditInvoiceModal';

export default function InvoiceHistoryPanel() {
  const { sales, currency, customers } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Sale | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentFilter, dateFilter]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || 
                            sale.id.includes(search);
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const saleDate = new Date(sale.date);
        const today = new Date();
        if (dateFilter === 'today') {
          matchesDate = saleDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = saleDate >= weekAgo;
        } else if (dateFilter === 'month') {
          matchesDate = saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [sales, search, statusFilter, paymentFilter, dateFilter]);

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePreview = (sale: Sale) => {
    setSelectedInvoice(sale);
    setIsPreviewOpen(true);
    setOpenMenuId(null);
  };

  const handleAction = (action: string, sale: Sale) => {
    setOpenMenuId(null);
    switch (action) {
      case 'duplicate':
        toast.success('تم تكرار الفاتورة');
        break;
      case 'edit':
        setSelectedInvoice(sale);
        setIsEditOpen(true);
        break;
      case 'refund':
        useStore.getState().updateSale(sale.id, { status: 'returned' });
        toast.success('تم استرداد الفاتورة');
        break;
      case 'return':
        useStore.getState().updateSale(sale.id, { status: 'returned' });
        toast.success('تم تحويل الفاتورة إلى مرتجع');
        break;
      case 'delete':
        if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
          useStore.getState().deleteSale(sale.id);
          toast.success('تم حذف الفاتورة');
        }
        break;
      default:
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-4 h-4" /> مدفوعة</span>;
      case 'pending': return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit"><Clock className="w-4 h-4" /> معلقة</span>;
      case 'returned': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit"><RefreshCw className="w-4 h-4" /> مسترجعة</span>;
      case 'cancelled': return <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 w-fit"><XCircle className="w-4 h-4" /> ملغاة</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-bold w-fit">غير معروف</span>;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="بحث برقم الفاتورة..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل الحالات</option>
            <option value="paid">مدفوعة</option>
            <option value="pending">معلقة</option>
            <option value="returned">مسترجعة</option>
            <option value="cancelled">ملغاة</option>
          </select>

          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل طرق الدفع</option>
            <option value="cash">نقدي</option>
            <option value="card">بطاقة / شبكة</option>
          </select>

          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل الأوقات</option>
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
          </select>
        </div>

        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center">
          <p className="text-indigo-200 text-sm font-bold">إجمالي الفواتير المعروضة</p>
          <p className="text-2xl font-bold">{totalSales.toFixed(2)} {currency}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible flex flex-col">
        <div className="overflow-x-auto overflow-y-visible min-h-[400px]">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
              <tr>
                <th className="p-4">رقم الفاتورة</th>
                <th className="p-4">التاريخ والوقت</th>
                <th className="p-4">العميل</th>
                <th className="p-4">طريقة الدفع</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الإجمالي</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    لا توجد فواتير مطابقة للبحث
                  </td>
                </tr>
              ) : (
                paginatedSales.map(sale => {
                  const customer = customers.find(c => c.id === sale.customerId);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{sale.invoiceNumber || sale.id}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(sale.date).toLocaleDateString('ar-EG')} <br/>
                        <span className="text-sm text-slate-400">{new Date(sale.date).toLocaleTimeString('ar-EG')}</span>
                      </td>
                      <td className="p-4 text-slate-700">{customer ? customer.name : 'عميل نقدي'}</td>
                      <td className="p-4">
                        {sale.paymentMethod === 'cash' ? (
                          <span className="flex items-center gap-1 text-emerald-600"><CreditCard className="w-4 h-4" /> نقدي</span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600"><CreditCard className="w-4 h-4" /> بطاقة</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(sale.status || 'paid')}</td>
                      <td className="p-4 font-bold text-lg text-slate-800">{sale.total.toFixed(2)} {currency}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2 relative">
                          <button 
                            onClick={() => handlePreview(sale)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="معاينة"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === sale.id ? null : sale.id)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {openMenuId === sale.id && (
                              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                                <button onClick={() => handlePreview(sale)} className="w-full text-right px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                  <Printer className="w-4 h-4" /> طباعة
                                </button>
                                <button onClick={() => handlePreview(sale)} className="w-full text-right px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                  <Download className="w-4 h-4" /> تحميل PDF
                                </button>
                                <button onClick={() => handleAction('duplicate', sale)} className="w-full text-right px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                  <Copy className="w-4 h-4" /> تكرار الفاتورة
                                </button>
                                <button onClick={() => handleAction('edit', sale)} className="w-full text-right px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                                  <Edit className="w-4 h-4" /> تعديل الفاتورة
                                </button>
                                <button onClick={() => handleAction('refund', sale)} className="w-full text-right px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-amber-600">
                                  <RotateCcw className="w-4 h-4" /> استرداد
                                </button>
                                <button onClick={() => handleAction('return', sale)} className="w-full text-right px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600">
                                  <RefreshCw className="w-4 h-4" /> تحويل لمرتجع
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button onClick={() => handleAction('delete', sale)} className="w-full text-right px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600">
                                  <Trash2 className="w-4 h-4" /> حذف الفاتورة
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
            <p className="text-sm text-slate-600">
              عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredSales.length)} من {filteredSales.length} فاتورة
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {isPreviewOpen && selectedInvoice && (
        <InvoicePreviewModal 
          invoice={selectedInvoice} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}

      {isEditOpen && selectedInvoice && (
        <EditInvoiceModal 
          invoice={selectedInvoice} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </div>
  );
}
