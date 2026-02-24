import { useState, useMemo, FormEvent } from 'react';
import { useStore, Product, SaleItem, Sale } from '../store/useStore';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  Receipt,
  Package,
  ShoppingCart,
  Image as ImageIcon,
  FileText,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import InvoiceHistoryPanel from '../components/InvoiceHistoryPanel';
import InvoicePreviewModal from '../components/InvoicePreviewModal';

export default function POS() {
  const { products, sales, addSale, currency, invoiceSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.barcode.includes(search)
    );
  }, [products, search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('الكمية غير متوفرة في المخزون');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, total: product.price }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ < 1) return item;
        const product = products.find(p => p.id === id);
        if (product && newQ > product.stock) {
          toast.error('الكمية غير متوفرة في المخزون');
          return item;
        }
        return { ...item, quantity: newQ, total: newQ * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleBarcodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      toast.error('المنتج غير موجود');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  
  const tax = cart.reduce((sum, item) => {
    const taxRate = item.tax || 0;
    if (taxRate > 0) {
      const taxAmount = item.total - (item.total / (1 + (taxRate / 100)));
      return sum + taxAmount;
    }
    return sum;
  }, 0);

  const total = subtotal;

  const generateInvoiceNumber = () => {
    const nextNumber = sales.length + 1;
    const year = new Date().getFullYear();
    const branchCode = 'B01'; // Example branch code
    return `${invoiceSettings.invoicePrefix}${branchCode}-${year}-${nextNumber.toString().padStart(4, '0')}${invoiceSettings.invoiceSuffix}`;
  };

  const handleCheckout = (method: 'cash' | 'card') => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      items: cart,
      total,
      subtotal: subtotal - tax,
      discount: 0,
      tax,
      paymentMethod: method,
      status: 'paid',
      branch: 'الفرع الرئيسي'
    };

    addSale(newSale);
    setLastSale(newSale);
    setShowPreview(true);
    toast.success('تمت عملية البيع بنجاح!');
    setCart([]);
  };

  const handleSaveDraft = () => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      items: cart,
      total,
      subtotal: subtotal - tax,
      discount: 0,
      tax,
      paymentMethod: 'cash',
      status: 'pending',
      branch: 'الفرع الرئيسي'
    };

    addSale(newSale);
    toast.success('تم حفظ الفاتورة كمسودة');
    setCart([]);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Tabs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-indigo-600" />
          نقاط البيع
        </h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'pos' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            نقطة البيع
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            سجل الفواتير
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Cart */}
          <div className="w-full lg:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
                سلة المشتريات
              </h2>
              <button 
                onClick={handleSaveDraft}
                disabled={cart.length === 0}
                className="text-slate-500 hover:text-indigo-600 disabled:opacity-50 transition-colors flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
              >
                <Save className="w-4 h-4" />
                حفظ كمسودة
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-xl font-bold">السلة فارغة</p>
                  <p>قم بإضافة منتجات للبدء</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-xl w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-rose-600 hover:bg-rose-50"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-500">{item.price} {currency} / حبة</p>
                        <p className="font-bold text-xl text-slate-800">{item.total.toFixed(2)} {currency}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold">{(subtotal - tax).toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الضريبة (مشمولة)</span>
                  <span className="font-bold">{tax.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-slate-800 pt-2 border-t border-slate-200">
                  <span>الإجمالي</span>
                  <span className="text-indigo-600">{total.toFixed(2)} {currency}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => handleCheckout('cash')}
                  disabled={cart.length === 0}
                  className="flex flex-col items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white p-4 rounded-2xl font-bold text-xl transition-colors shadow-sm"
                >
                  <Banknote className="w-8 h-8" />
                  دفع نقدي
                </button>
                <button 
                  onClick={() => handleCheckout('card')}
                  disabled={cart.length === 0}
                  className="flex flex-col items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white p-4 rounded-2xl font-bold text-xl transition-colors shadow-sm"
                >
                  <CreditCard className="w-8 h-8" />
                  شبكة / بطاقة
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Products */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                <input 
                  type="text" 
                  placeholder="ابحث عن منتج..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:max-w-xs">
                <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                <input 
                  type="text" 
                  placeholder="مسح الباركود..." 
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  autoFocus
                />
                <button type="submit" className="hidden">إضافة</button>
              </form>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pb-24 lg:pb-0">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center text-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-indigo-600 font-bold text-xl mt-1">{product.price} {currency}</p>
                    <p className="text-sm text-slate-500 mt-1">المتبقي: {product.stock}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <InvoiceHistoryPanel />
      )}

      {showPreview && lastSale && (
        <InvoicePreviewModal 
          invoice={lastSale} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
}

