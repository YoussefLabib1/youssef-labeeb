import React, { useRef, useState } from 'react';
import { useStore, Sale } from '../store/useStore';
import { X, Printer, Download, Share2, Copy, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

interface InvoicePreviewModalProps {
  invoice: Sale;
  onClose: () => void;
}

export default function InvoicePreviewModal({ invoice, onClose }: InvoicePreviewModalProps) {
  const { invoiceSettings, currency, customers } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const customer = customers.find(c => c.id === invoice.customerId);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React bindings
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingPDF(true);
    toast.loading('جاري تجهيز ملف PDF...', { id: 'pdf-toast' });
    
    try {
      const element = printRef.current;
      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `invoice-${invoice.invoiceNumber || invoice.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: invoiceSettings.paperSize === 'a4' ? 'a4' : [80, 200], orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('تم تحميل الفاتورة بنجاح', { id: 'pdf-toast' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF', { id: 'pdf-toast' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `فاتورة رقم ${invoice.invoiceNumber || invoice.id}`,
        text: `فاتورة من ${invoiceSettings.storeName} بقيمة ${invoice.total} ${currency}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      toast.success('تم نسخ رابط الفاتورة');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            فاتورة رقم {invoice.invoiceNumber || invoice.id}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 text-slate-600 hover:bg-white rounded-xl transition-colors shadow-sm border border-slate-200" title="طباعة">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={handleDownloadPDF} className="p-2 text-emerald-600 hover:bg-white rounded-xl transition-colors shadow-sm border border-slate-200" title="تحميل PDF">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={handleShare} className="p-2 text-blue-600 hover:bg-white rounded-xl transition-colors shadow-sm border border-slate-200" title="مشاركة">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-4">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          {/* Invoice Paper */}
          <div 
            ref={printRef}
            className="bg-white shadow-lg relative"
            style={{
              fontFamily: invoiceSettings.fontFamily,
              direction: invoiceSettings.isRTL ? 'rtl' : 'ltr',
              padding: `${invoiceSettings.margin}px`,
              minHeight: invoiceSettings.paperSize === 'a4' ? '1122px' : 'auto', // A4 height at 96dpi
              width: invoiceSettings.paperSize === 'a4' ? '794px' : '300px', // A4 width at 96dpi or 80mm
              margin: '0 auto',
            }}
          >
            {/* Watermark */}
            {invoice.status === 'paid' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
                <span className="text-9xl font-black transform -rotate-45 text-emerald-500">PAID</span>
              </div>
            )}
            {invoice.status === 'cancelled' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
                <span className="text-9xl font-black transform -rotate-45 text-rose-500">CANCELLED</span>
              </div>
            )}

            {/* Header */}
            <div className="text-center border-b pb-6 mb-6" style={{ borderColor: invoiceSettings.primaryColor }}>
              {invoiceSettings.showLogo && invoiceSettings.logoUrl ? (
                <img src={invoiceSettings.logoUrl} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
              ) : invoiceSettings.showLogo ? (
                <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">شعار</div>
              ) : null}
              
              <h1 style={{ fontSize: `${invoiceSettings.headerFontSize}px`, fontWeight: invoiceSettings.isBold ? 'bold' : 'normal', color: invoiceSettings.primaryColor }}>
                {invoiceSettings.storeName || 'اسم المحل'}
              </h1>
              {invoiceSettings.tagline && <p className="text-slate-500 mt-2">{invoiceSettings.tagline}</p>}
              
              <div className="mt-4 space-y-1" style={{ fontSize: `${invoiceSettings.bodyFontSize}px` }}>
                {invoiceSettings.storeAddress && <p>{invoiceSettings.storeAddress}</p>}
                {invoiceSettings.storePhone && <p>هاتف: {invoiceSettings.storePhone}</p>}
                {invoiceSettings.showTaxNumber && invoiceSettings.taxNumber && <p>الرقم الضريبي: {invoiceSettings.taxNumber}</p>}
                {invoiceSettings.commercialRegistrationNumber && <p>س.ت: {invoiceSettings.commercialRegistrationNumber}</p>}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="mb-6 grid grid-cols-2 gap-4" style={{ fontSize: `${invoiceSettings.bodyFontSize}px` }}>
              <div>
                <div className="mb-2">
                  <span className="text-slate-500">رقم الفاتورة: </span>
                  <span className="font-bold">{invoice.invoiceNumber || invoice.id}</span>
                </div>
                <div className="mb-2">
                  <span className="text-slate-500">التاريخ: </span>
                  <span className="font-bold">{new Date(invoice.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div>
                  <span className="text-slate-500">الوقت: </span>
                  <span className="font-bold">{new Date(invoice.date).toLocaleTimeString('ar-EG')}</span>
                </div>
              </div>
              <div className="text-left">
                {invoiceSettings.showCustomerAddress && (
                  <>
                    <div className="mb-2">
                      <span className="text-slate-500">العميل: </span>
                      <span className="font-bold">{customer ? customer.name : 'عميل نقدي'}</span>
                    </div>
                    {customer && customer.phone && (
                      <div>
                        <span className="text-slate-500">رقم الهاتف: </span>
                        <span className="font-bold">{customer.phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-6" style={{ fontSize: `${invoiceSettings.bodyFontSize}px` }}>
              <thead className="border-b-2" style={{ borderColor: invoiceSettings.primaryColor }}>
                <tr>
                  <th className="text-right py-3">الصنف</th>
                  <th className="text-center py-3">الكمية</th>
                  <th className="text-center py-3">سعر الوحدة</th>
                  {invoiceSettings.showDiscountColumn && <th className="text-center py-3">الخصم</th>}
                  <th className="text-left py-3">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="border-b">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="font-bold">{item.name}</div>
                      {invoiceSettings.showItemSKU && <div className="text-sm text-slate-400">SKU: {item.barcode}</div>}
                    </td>
                    <td className="text-center py-3">{item.quantity}</td>
                    <td className="text-center py-3">
                      {invoiceSettings.currencySymbolPosition === 'before' ? `${currency} ${item.price}` : `${item.price} ${currency}`}
                    </td>
                    {invoiceSettings.showDiscountColumn && <td className="text-center py-3 text-rose-500">0</td>}
                    <td className="text-left py-3 font-bold">
                      {invoiceSettings.currencySymbolPosition === 'before' ? `${currency} ${item.total}` : `${item.total} ${currency}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8" style={{ fontSize: `${invoiceSettings.bodyFontSize}px` }}>
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold">
                    {invoiceSettings.currencySymbolPosition === 'before' ? `${currency} ${(invoice.subtotal || invoice.total).toFixed(2)}` : `${(invoice.subtotal || invoice.total).toFixed(2)} ${currency}`}
                  </span>
                </div>
                {invoiceSettings.showDiscountColumn && invoice.discount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>الخصم:</span>
                    <span className="font-bold">
                      {invoiceSettings.currencySymbolPosition === 'before' ? `${currency} -${invoice.discount.toFixed(2)}` : `-${invoice.discount.toFixed(2)} ${currency}`}
                    </span>
                  </div>
                )}
                {invoiceSettings.enableVAT && (
                  <div className="flex justify-between text-slate-600">
                    <span>ضريبة القيمة المضافة ({invoiceSettings.vatRate}%):</span>
                    <span className="font-bold">
                      {invoiceSettings.currencySymbolPosition === 'before' ? `${currency} ${invoice.tax.toFixed(2)}` : `${invoice.tax.toFixed(2)} ${currency}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl pt-4 border-t-2 font-bold" style={{ color: invoiceSettings.primaryColor, borderColor: invoiceSettings.primaryColor }}>
                  <span>الإجمالي:</span>
                  <span>
                    {invoiceSettings.currencySymbolPosition === 'before' ? `${currency} ${invoice.total.toFixed(2)}` : `${invoice.total.toFixed(2)} ${currency}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoiceSettings.showNotesSection && (
              <div className="mb-8 border-t pt-4 border-dashed">
                <p className="font-bold mb-2" style={{ fontSize: `${invoiceSettings.bodyFontSize}px` }}>ملاحظات:</p>
                <p className="text-slate-500" style={{ fontSize: `${invoiceSettings.bodyFontSize - 2}px` }}>لا توجد ملاحظات إضافية.</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center space-y-4" style={{ fontSize: `${invoiceSettings.footerFontSize}px` }}>
              {invoiceSettings.showQRCode && (
                <div className="w-32 h-32 bg-slate-100 mx-auto mb-6 flex items-center justify-center border border-slate-200 rounded-xl">
                  {/* Placeholder for real QR code */}
                  <span className="text-sm text-slate-400">QR Code</span>
                </div>
              )}
              
              {invoiceSettings.footerText && <p className="font-bold text-lg">{invoiceSettings.footerText}</p>}
              {invoiceSettings.returnPolicy && <p className="text-slate-500 max-w-md mx-auto">{invoiceSettings.returnPolicy}</p>}
              {invoiceSettings.legalNotes && <p className="text-slate-400 mt-6">{invoiceSettings.legalNotes}</p>}
            </div>

            {/* Signatures */}
            {invoiceSettings.showSignatureArea && (
              <div className="mt-16 flex justify-between px-8" style={{ fontSize: `${invoiceSettings.bodyFontSize}px` }}>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-300 mb-4"></div>
                  <p className="font-bold text-slate-600">توقيع المستلم</p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-300 mb-4"></div>
                  <p className="font-bold text-slate-600">توقيع البائع</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
