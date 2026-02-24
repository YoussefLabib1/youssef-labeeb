import React, { useState } from 'react';
import { useStore, InvoiceSettings } from '../store/useStore';
import { 
  Layout, 
  Type, 
  AlignVerticalSpaceAround, 
  AlignVerticalJustifyStart, 
  Hash, 
  DollarSign,
  Save,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceSettingsPanel() {
  const { invoiceSettings, updateInvoiceSettings } = useStore();
  const [localSettings, setLocalSettings] = useState<InvoiceSettings>(invoiceSettings);
  const [activeSection, setActiveSection] = useState<'layout' | 'typography' | 'header' | 'footer' | 'numbering' | 'tax'>('layout');

  const handleSave = () => {
    updateInvoiceSettings(localSettings);
    toast.success('تم حفظ إعدادات الفاتورة بنجاح');
  };

  const handleChange = (key: keyof InvoiceSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Settings Form */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[800px]">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <TabButton 
            active={activeSection === 'layout'} 
            onClick={() => setActiveSection('layout')} 
            icon={<Layout className="w-4 h-4" />} 
            label="التخطيط" 
          />
          <TabButton 
            active={activeSection === 'typography'} 
            onClick={() => setActiveSection('typography')} 
            icon={<Type className="w-4 h-4" />} 
            label="الخطوط" 
          />
          <TabButton 
            active={activeSection === 'header'} 
            onClick={() => setActiveSection('header')} 
            icon={<AlignVerticalSpaceAround className="w-4 h-4" />} 
            label="الترويسة" 
          />
          <TabButton 
            active={activeSection === 'footer'} 
            onClick={() => setActiveSection('footer')} 
            icon={<AlignVerticalJustifyStart className="w-4 h-4" />} 
            label="التذييل" 
          />
          <TabButton 
            active={activeSection === 'numbering'} 
            onClick={() => setActiveSection('numbering')} 
            icon={<Hash className="w-4 h-4" />} 
            label="الترقيم" 
          />
          <TabButton 
            active={activeSection === 'tax'} 
            onClick={() => setActiveSection('tax')} 
            icon={<DollarSign className="w-4 h-4" />} 
            label="الضرائب والعملة" 
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'layout' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نمط الفاتورة</label>
                  <select 
                    value={localSettings.templateStyle}
                    onChange={(e) => handleChange('templateStyle', e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
                  >
                    <option value="classic">كلاسيكي</option>
                    <option value="modern">حديث</option>
                    <option value="minimal">بسيط</option>
                    <option value="detailed">مفصل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">حجم الورق</label>
                  <select 
                    value={localSettings.paperSize}
                    onChange={(e) => handleChange('paperSize', e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
                  >
                    <option value="80mm">إيصال حراري (80mm)</option>
                    <option value="a4">ورق A4</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 border-b pb-2">إظهار / إخفاء العناصر</h3>
                <Checkbox label="إظهار الشعار" checked={localSettings.showLogo} onChange={(v) => handleChange('showLogo', v)} />
                <Checkbox label="إظهار الرقم الضريبي" checked={localSettings.showTaxNumber} onChange={(v) => handleChange('showTaxNumber', v)} />
                <Checkbox label="إظهار عنوان العميل" checked={localSettings.showCustomerAddress} onChange={(v) => handleChange('showCustomerAddress', v)} />
                <Checkbox label="إظهار كود الصنف (SKU)" checked={localSettings.showItemSKU} onChange={(v) => handleChange('showItemSKU', v)} />
                <Checkbox label="إظهار عمود الخصم" checked={localSettings.showDiscountColumn} onChange={(v) => handleChange('showDiscountColumn', v)} />
                <Checkbox label="إظهار قسم الملاحظات" checked={localSettings.showNotesSection} onChange={(v) => handleChange('showNotesSection', v)} />
                <Checkbox label="إظهار رمز الاستجابة السريعة (QR)" checked={localSettings.showQRCode} onChange={(v) => handleChange('showQRCode', v)} />
                <Checkbox label="إظهار منطقة التوقيع" checked={localSettings.showSignatureArea} onChange={(v) => handleChange('showSignatureArea', v)} />
              </div>
            </div>
          )}

          {activeSection === 'typography' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نوع الخط</label>
                <select 
                  value={localSettings.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
                >
                  <option value="Cairo">Cairo</option>
                  <option value="Tajawal">Tajawal</option>
                  <option value="Almarai">Almarai</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NumberInput label="حجم خط الترويسة" value={localSettings.headerFontSize} onChange={(v) => handleChange('headerFontSize', v)} />
                <NumberInput label="حجم خط المحتوى" value={localSettings.bodyFontSize} onChange={(v) => handleChange('bodyFontSize', v)} />
                <NumberInput label="حجم خط التذييل" value={localSettings.footerFontSize} onChange={(v) => handleChange('footerFontSize', v)} />
              </div>
              <div className="flex gap-4">
                <Checkbox label="خط عريض (Bold)" checked={localSettings.isBold} onChange={(v) => handleChange('isBold', v)} />
                <Checkbox label="من اليمين لليسار (RTL)" checked={localSettings.isRTL} onChange={(v) => handleChange('isRTL', v)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اللون الأساسي</label>
                <input 
                  type="color" 
                  value={localSettings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSection === 'header' && (
            <div className="space-y-4">
              <TextInput label="اسم الشركة / المحل" value={localSettings.storeName} onChange={(v) => handleChange('storeName', v)} />
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رابط الشعار (URL) أو رفع صورة</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={localSettings.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
                  />
                  <label className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-center whitespace-nowrap">
                    رفع صورة
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            handleChange('logoUrl', event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              <TextInput label="رقم السجل التجاري" value={localSettings.commercialRegistrationNumber} onChange={(v) => handleChange('commercialRegistrationNumber', v)} />
              <TextInput label="الرقم الضريبي" value={localSettings.taxNumber} onChange={(v) => handleChange('taxNumber', v)} />
              <TextInput label="العنوان" value={localSettings.storeAddress} onChange={(v) => handleChange('storeAddress', v)} />
              <TextInput label="رقم الهاتف" value={localSettings.storePhone} onChange={(v) => handleChange('storePhone', v)} />
              <TextInput label="البريد الإلكتروني" value={localSettings.storeEmail} onChange={(v) => handleChange('storeEmail', v)} />
              <TextInput label="الشعار اللفظي (Tagline)" value={localSettings.tagline} onChange={(v) => handleChange('tagline', v)} />
            </div>
          )}

          {activeSection === 'footer' && (
            <div className="space-y-4">
              <TextArea label="رسالة الشكر" value={localSettings.footerText} onChange={(v) => handleChange('footerText', v)} />
              <TextArea label="سياسة الاسترجاع" value={localSettings.returnPolicy} onChange={(v) => handleChange('returnPolicy', v)} />
              <TextArea label="ملاحظات قانونية" value={localSettings.legalNotes} onChange={(v) => handleChange('legalNotes', v)} />
              <TextArea label="روابط التواصل الاجتماعي" value={localSettings.socialMediaLinks} onChange={(v) => handleChange('socialMediaLinks', v)} />
            </div>
          )}

          {activeSection === 'numbering' && (
            <div className="space-y-4">
              <TextInput label="بادئة الفاتورة (Prefix)" value={localSettings.invoicePrefix} onChange={(v) => handleChange('invoicePrefix', v)} />
              <TextInput label="لاحقة الفاتورة (Suffix)" value={localSettings.invoiceSuffix} onChange={(v) => handleChange('invoiceSuffix', v)} />
              <Checkbox label="إعادة تعيين الترقيم سنوياً" checked={localSettings.resetYearly} onChange={(v) => handleChange('resetYearly', v)} />
            </div>
          )}

          {activeSection === 'tax' && (
            <div className="space-y-4">
              <Checkbox label="تفعيل ضريبة القيمة المضافة (VAT)" checked={localSettings.enableVAT} onChange={(v) => handleChange('enableVAT', v)} />
              {localSettings.enableVAT && (
                <NumberInput label="نسبة الضريبة (%)" value={localSettings.vatRate} onChange={(v) => handleChange('vatRate', v)} />
              )}
              <TextInput label="العملة" value={localSettings.currency} onChange={(v) => handleChange('currency', v)} />
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">موضع رمز العملة</label>
                <select 
                  value={localSettings.currencySymbolPosition}
                  onChange={(e) => handleChange('currencySymbolPosition', e.target.value as 'before' | 'after')}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
                >
                  <option value="before">قبل المبلغ</option>
                  <option value="after">بعد المبلغ</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-full lg:w-[400px] xl:w-[500px] bg-slate-200 rounded-2xl p-6 flex flex-col items-center overflow-y-auto h-[800px]">
        <div className="flex items-center gap-2 mb-4 text-slate-600 font-bold">
          <Eye className="w-5 h-5" />
          معاينة حية
        </div>
        
        <div 
          className="bg-white shadow-lg w-full transition-all duration-300 relative"
          style={{
            fontFamily: localSettings.fontFamily,
            direction: localSettings.isRTL ? 'rtl' : 'ltr',
            padding: `${localSettings.margin}px`,
            minHeight: localSettings.paperSize === 'a4' ? '842px' : 'auto',
            width: localSettings.paperSize === 'a4' ? '100%' : '300px',
          }}
        >
          {/* Preview Content */}
          <div className="text-center border-b pb-4 mb-4" style={{ borderColor: localSettings.primaryColor }}>
            {localSettings.showLogo && localSettings.logoUrl ? (
              <img src={localSettings.logoUrl} alt="Logo" className="h-16 mx-auto mb-2 object-contain" />
            ) : localSettings.showLogo ? (
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-2 flex items-center justify-center text-slate-400">شعار</div>
            ) : null}
            
            <h1 style={{ fontSize: `${localSettings.headerFontSize}px`, fontWeight: localSettings.isBold ? 'bold' : 'normal', color: localSettings.primaryColor }}>
              {localSettings.storeName || 'اسم المحل'}
            </h1>
            {localSettings.tagline && <p className="text-sm text-slate-500 mt-1">{localSettings.tagline}</p>}
            
            <div className="mt-2 text-sm space-y-1" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>
              {localSettings.storeAddress && <p>{localSettings.storeAddress}</p>}
              {localSettings.storePhone && <p>هاتف: {localSettings.storePhone}</p>}
              {localSettings.showTaxNumber && localSettings.taxNumber && <p>الرقم الضريبي: {localSettings.taxNumber}</p>}
              {localSettings.commercialRegistrationNumber && <p>س.ت: {localSettings.commercialRegistrationNumber}</p>}
            </div>
          </div>

          <div className="mb-4 text-sm" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>
            <div className="flex justify-between mb-1">
              <span>رقم الفاتورة:</span>
              <span className="font-bold">{localSettings.invoicePrefix}1001{localSettings.invoiceSuffix}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>التاريخ:</span>
              <span>{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
            {localSettings.showCustomerAddress && (
              <div className="flex justify-between mb-1">
                <span>العميل:</span>
                <span>عميل نقدي</span>
              </div>
            )}
          </div>

          <table className="w-full text-sm mb-4" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>
            <thead className="border-b-2" style={{ borderColor: localSettings.primaryColor }}>
              <tr>
                <th className="text-right py-2">الصنف</th>
                <th className="text-center py-2">الكمية</th>
                <th className="text-left py-2">السعر</th>
              </tr>
            </thead>
            <tbody className="border-b">
              <tr>
                <td className="py-2">
                  منتج تجريبي 1
                  {localSettings.showItemSKU && <div className="text-xs text-slate-400">SKU: 12345</div>}
                </td>
                <td className="text-center py-2">2</td>
                <td className="text-left py-2">
                  {localSettings.currencySymbolPosition === 'before' ? `${localSettings.currency} 50` : `50 ${localSettings.currency}`}
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  منتج تجريبي 2
                  {localSettings.showItemSKU && <div className="text-xs text-slate-400">SKU: 67890</div>}
                </td>
                <td className="text-center py-2">1</td>
                <td className="text-left py-2">
                  {localSettings.currencySymbolPosition === 'before' ? `${localSettings.currency} 100` : `100 ${localSettings.currency}`}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="space-y-1 text-sm font-bold" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{localSettings.currencySymbolPosition === 'before' ? `${localSettings.currency} 200` : `200 ${localSettings.currency}`}</span>
            </div>
            {localSettings.enableVAT && (
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة ({localSettings.vatRate}%):</span>
                <span>{localSettings.currencySymbolPosition === 'before' ? `${localSettings.currency} 30` : `30 ${localSettings.currency}`}</span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-2 border-t" style={{ color: localSettings.primaryColor }}>
              <span>الإجمالي:</span>
              <span>{localSettings.currencySymbolPosition === 'before' ? `${localSettings.currency} 230` : `230 ${localSettings.currency}`}</span>
            </div>
          </div>

          {localSettings.showNotesSection && (
            <div className="mt-6 border-t pt-4 border-dashed">
              <p className="font-bold mb-1" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>ملاحظات:</p>
              <p className="text-slate-500" style={{ fontSize: `${localSettings.bodyFontSize - 2}px` }}>لا توجد ملاحظات إضافية.</p>
            </div>
          )}

          <div className="mt-8 text-center space-y-2" style={{ fontSize: `${localSettings.footerFontSize}px` }}>
            {localSettings.showQRCode && (
              <div className="w-24 h-24 bg-slate-100 mx-auto mb-4 flex items-center justify-center border">
                <span className="text-xs text-slate-400">QR Code</span>
              </div>
            )}
            
            {localSettings.footerText && <p className="font-bold">{localSettings.footerText}</p>}
            {localSettings.returnPolicy && <p className="text-slate-500">{localSettings.returnPolicy}</p>}
            {localSettings.legalNotes && <p className="text-slate-400 text-xs mt-4">{localSettings.legalNotes}</p>}
          </div>

          {localSettings.showSignatureArea && (
            <div className="mt-12 flex justify-between px-4" style={{ fontSize: `${localSettings.bodyFontSize}px` }}>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-2"></div>
                <p>توقيع المستلم</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-2"></div>
                <p>توقيع البائع</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${
        active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TextInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none resize-none"
      />
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
      <div className="relative flex items-center">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <span className="text-slate-700 font-medium">{label}</span>
    </label>
  );
}
