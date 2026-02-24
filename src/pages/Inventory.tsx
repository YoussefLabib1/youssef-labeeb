import { useState, FormEvent, useRef } from 'react';
import { useStore, Product } from '../store/useStore';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  PackagePlus,
  Image as ImageIcon,
  Lock,
  Unlock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, currency, adminPassword } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [showHiddenInfo, setShowHiddenInfo] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    category: '',
    image: '',
    tax: 0,
    profitMargin: 0,
    profitAmount: 0,
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        barcode: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
        category: '',
        image: '',
        tax: 0,
        profitMargin: 0,
        profitAmount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePrice = (cost: number, margin: number, amount: number, tax: number) => {
    let basePrice = cost;
    if (margin > 0) {
      basePrice = cost + (cost * (margin / 100));
    } else if (amount > 0) {
      basePrice = cost + amount;
    }
    
    if (tax > 0) {
      basePrice = basePrice + (basePrice * (tax / 100));
    }
    
    return parseFloat(basePrice.toFixed(2));
  };

  const handleCostChange = (cost: number) => {
    const newPrice = calculatePrice(cost, formData.profitMargin || 0, formData.profitAmount || 0, formData.tax || 0);
    setFormData(prev => ({ ...prev, cost, price: newPrice }));
  };

  const handleProfitMarginChange = (margin: number) => {
    const newPrice = calculatePrice(formData.cost || 0, margin, 0, formData.tax || 0);
    setFormData(prev => ({ ...prev, profitMargin: margin, profitAmount: 0, price: newPrice }));
  };

  const handleProfitAmountChange = (amount: number) => {
    const newPrice = calculatePrice(formData.cost || 0, 0, amount, formData.tax || 0);
    setFormData(prev => ({ ...prev, profitAmount: amount, profitMargin: 0, price: newPrice }));
  };

  const handleTaxChange = (tax: number) => {
    const newPrice = calculatePrice(formData.cost || 0, formData.profitMargin || 0, formData.profitAmount || 0, tax);
    setFormData(prev => ({ ...prev, tax, price: newPrice }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.price || !formData.cost) {
      toast.error('الرجاء تعبئة الحقول الأساسية');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData as Product);
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      addProduct({
        ...formData,
        id: Date.now().toString(),
      } as Product);
      toast.success('تم إضافة المنتج بنجاح');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
      toast.success('تم حذف المنتج');
    }
  };

  const handleUnlock = () => {
    if (passwordInput === adminPassword) {
      setShowHiddenInfo(true);
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      toast.success('تم إظهار البيانات المخفية');
    } else {
      toast.error('كلمة السر غير صحيحة');
    }
  };

  const toggleHiddenInfo = () => {
    if (showHiddenInfo) {
      setShowHiddenInfo(false);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">إدارة المخزون</h1>
          <p className="text-lg text-slate-500">
            إجمالي المنتجات: <span className="font-bold text-indigo-600">{products.length}</span>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={toggleHiddenInfo}
            className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors justify-center shadow-sm ${showHiddenInfo ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {showHiddenInfo ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            {showHiddenInfo ? 'إخفاء التكلفة والمخزون' : 'إظهار التكلفة والمخزون'}
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors justify-center shadow-sm flex-1 md:flex-none"
          >
            <Plus className="w-6 h-6" />
            إضافة منتج جديد
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الباركود، أو التصنيف..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold text-lg border-b border-slate-200">
              <tr>
                <th className="p-4 w-16">صورة</th>
                <th className="p-4">المنتج</th>
                <th className="p-4">الباركود</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">السعر</th>
                <th className="p-4">التكلفة</th>
                <th className="p-4">المخزون</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors text-lg">
                  <td className="p-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-800">{product.name}</td>
                  <td className="p-4 font-mono text-slate-500">{product.barcode}</td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">
                      {product.category || 'غير مصنف'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">{product.price} {currency}</td>
                  <td className="p-4 text-slate-500 cursor-pointer" onClick={!showHiddenInfo ? toggleHiddenInfo : undefined}>
                    {showHiddenInfo ? `${product.cost} ${currency}` : '****'}
                  </td>
                  <td className="p-4 cursor-pointer" onClick={!showHiddenInfo ? toggleHiddenInfo : undefined}>
                    {showHiddenInfo ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xl ${product.stock <= product.minStock ? 'text-red-600' : 'text-slate-800'}`}>
                          {product.stock}
                        </span>
                        {product.stock <= product.minStock && (
                          <span title="مخزون منخفض">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-bold">****</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-lg">
                    لا توجد منتجات مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-6 h-6 text-slate-600" />
                أدخل كلمة السر
              </h2>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest"
                placeholder="••••••••"
                autoFocus
              />
              <button
                onClick={handleUnlock}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <PackagePlus className="w-8 h-8 text-indigo-600" />
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Image Upload Section */}
                <div className="flex flex-col items-center justify-center space-y-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-sm" />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-sm font-bold">أضف صورة</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-sm text-slate-500 text-center">
                    انقر لاختيار صورة للمنتج (اختياري)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-bold text-slate-700">اسم المنتج *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-lg font-bold text-slate-700">الباركود *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.barcode}
                      onChange={e => setFormData({...formData, barcode: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  
                  {/* Pricing Section */}
                  <div className="space-y-2 md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      التسعير والأرباح
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-md font-bold text-slate-700">التكلفة الأساسية ({currency}) *</label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          step="0.01"
                          value={formData.cost}
                          onChange={e => handleCostChange(parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-md font-bold text-slate-700">الضريبة (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.1"
                          value={formData.tax || ''}
                          onChange={e => handleTaxChange(parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="مثال: 15"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-md font-bold text-slate-700">نسبة الربح (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.1"
                          value={formData.profitMargin || ''}
                          onChange={e => handleProfitMarginChange(parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="النسبة المئوية للربح"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-md font-bold text-slate-700">أو مبلغ الربح الثابت ({currency})</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={formData.profitAmount || ''}
                          onChange={e => handleProfitAmountChange(parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="مبلغ الربح الثابت"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-200">
                        <label className="block text-lg font-bold text-slate-800">سعر البيع النهائي ({currency}) *</label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                          className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                          يتم حسابه تلقائياً بناءً على التكلفة والضريبة والربح، أو يمكنك إدخاله يدوياً.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-bold text-slate-700">الكمية الحالية *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-lg font-bold text-slate-700">الحد الأدنى للتنبيه *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.minStock}
                      onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-lg font-bold text-slate-700">التصنيف</label>
                    <input 
                      type="text" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="مثال: مواد غذائية، مشروبات، منظفات..."
                    />
                  </div>
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
                form="product-form"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-sm transition-colors"
              >
                حفظ المنتج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
