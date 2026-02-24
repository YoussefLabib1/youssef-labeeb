import React, { useState } from 'react';
import { useStore, Sale } from '../store/useStore';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditInvoiceModalProps {
  invoice: Sale;
  onClose: () => void;
}

export default function EditInvoiceModal({ invoice, onClose }: EditInvoiceModalProps) {
  const { updateSale } = useStore();
  const [status, setStatus] = useState(invoice.status);
  const [paymentMethod, setPaymentMethod] = useState(invoice.paymentMethod);

  const handleSave = () => {
    updateSale(invoice.id, { status, paymentMethod });
    toast.success('تم تحديث الفاتورة بنجاح');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">تعديل الفاتورة #{invoice.invoiceNumber || invoice.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">حالة الفاتورة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
            >
              <option value="paid">مدفوعة</option>
              <option value="pending">معلقة</option>
              <option value="returned">مسترجعة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">طريقة الدفع</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
            >
              <option value="cash">نقدي</option>
              <option value="card">بطاقة / شبكة</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}
