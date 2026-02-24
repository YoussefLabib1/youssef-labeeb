import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Product = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  image?: string;
  tax?: number;
  profitMargin?: number;
  profitAmount?: number;
};

export type SaleItem = Product & { quantity: number; total: number };

export type Sale = {
  id: string;
  invoiceNumber: string;
  date: string;
  items: SaleItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  paymentMethod: 'cash' | 'card';
  customerId?: string;
  status: 'paid' | 'pending' | 'returned' | 'cancelled';
  branch: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
};

export type Staff = {
  id: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  pin: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

export type InvoiceSettings = {
  // Layout Settings
  templateStyle: 'classic' | 'modern' | 'minimal' | 'detailed';
  paperSize: '80mm' | 'a4' | 'custom';
  margin: number;
  showLogo: boolean;
  showTaxNumber: boolean;
  showCustomerAddress: boolean;
  showItemSKU: boolean;
  showDiscountColumn: boolean;
  showNotesSection: boolean;
  showQRCode: boolean;
  showSignatureArea: boolean;

  // Typography
  fontFamily: string;
  headerFontSize: number;
  bodyFontSize: number;
  footerFontSize: number;
  isBold: boolean;
  isRTL: boolean;

  // Header Customization
  storeName: string;
  commercialRegistrationNumber: string;
  taxNumber: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  tagline: string;
  logoUrl: string;

  // Footer Customization
  footerText: string;
  returnPolicy: string;
  legalNotes: string;
  socialMediaLinks: string;

  // Numbering Rules
  invoicePrefix: string;
  invoiceSuffix: string;
  resetYearly: boolean;

  // Tax & Currency
  enableVAT: boolean;
  vatRate: number;
  currency: string;
  currencySymbolPosition: 'before' | 'after';
  
  primaryColor: string;
};

interface AppState {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  staff: Staff[];
  tasks: Task[];
  currency: 'EGP' | 'USD';
  adminPassword: string;
  invoiceSettings: InvoiceSettings;
  
  // Actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addSale: (sale: Sale) => void;
  updateSale: (id: string, updated: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  addStaff: (staffMember: Staff) => void;
  
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  setCurrency: (currency: 'EGP' | 'USD') => void;
  setAdminPassword: (password: string) => void;
  updateInvoiceSettings: (settings: Partial<InvoiceSettings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      products: [
        { id: '1', name: 'سكر الأسرة 1 كجم', barcode: '123456789', price: 5, cost: 4, stock: 50, minStock: 10, category: 'مواد غذائية' },
        { id: '2', name: 'زيت عافية 1.5 لتر', barcode: '987654321', price: 15, cost: 12, stock: 20, minStock: 5, category: 'مواد غذائية' },
        { id: '3', name: 'شاي ليبتون 100 كيس', barcode: '112233445', price: 12, cost: 10, stock: 30, minStock: 10, category: 'مشروبات' },
      ],
      sales: [],
      customers: [
        { id: '1', name: 'أحمد محمد', phone: '0501234567', points: 150, totalSpent: 1500 },
        { id: '2', name: 'خالد عبدالله', phone: '0509876543', points: 50, totalSpent: 500 },
      ],
      staff: [
        { id: '1', name: 'المدير العام', role: 'admin', pin: '1234' },
      ],
      tasks: [
        { id: '1', title: 'جرد قسم المشروبات', completed: false },
        { id: '2', title: 'دفع فاتورة الكهرباء', completed: true },
      ],
      currency: 'EGP',
      adminPassword: 'admin',
      invoiceSettings: {
        templateStyle: 'classic',
        paperSize: '80mm',
        margin: 10,
        showLogo: true,
        showTaxNumber: true,
        showCustomerAddress: true,
        showItemSKU: true,
        showDiscountColumn: true,
        showNotesSection: true,
        showQRCode: true,
        showSignatureArea: false,
        fontFamily: 'Cairo',
        headerFontSize: 16,
        bodyFontSize: 12,
        footerFontSize: 10,
        isBold: false,
        isRTL: true,
        storeName: 'إدارة المحل الذكية',
        commercialRegistrationNumber: '1234567890',
        taxNumber: '300000000000003',
        storeAddress: 'الرياض، المملكة العربية السعودية',
        storePhone: '0500000000',
        storeEmail: 'info@store.com',
        tagline: 'أفضل المنتجات بأفضل الأسعار',
        logoUrl: '',
        footerText: 'شكراً لتسوقكم معنا',
        returnPolicy: 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً',
        legalNotes: '',
        socialMediaLinks: '',
        invoicePrefix: 'INV-',
        invoiceSuffix: '',
        resetYearly: true,
        enableVAT: true,
        vatRate: 15,
        currency: 'SAR',
        currencySymbolPosition: 'after',
        primaryColor: '#0f172a',
      },

      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updated) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),

      addSale: (sale) => set((state) => {
        // Update stock
        const updatedProducts = state.products.map(p => {
          const soldItem = sale.items.find(i => i.id === p.id);
          if (soldItem) {
            return { ...p, stock: p.stock - soldItem.quantity };
          }
          return p;
        });
        
        // Update customer points
        const updatedCustomers = state.customers.map(c => {
          if (c.id === sale.customerId) {
            return { 
              ...c, 
              points: c.points + Math.floor(sale.total / 10), // 1 point per 10 currency
              totalSpent: c.totalSpent + sale.total
            };
          }
          return c;
        });

        return {
          sales: [sale, ...state.sales],
          products: updatedProducts,
          customers: updatedCustomers,
        };
      }),

      updateSale: (id, updated) => set((state) => ({
        sales: state.sales.map((s) => (s.id === id ? { ...s, ...updated } : s)),
      })),

      deleteSale: (id) => set((state) => ({
        sales: state.sales.filter((s) => s.id !== id),
      })),

      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, updated) => set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      })),

      addStaff: (staffMember) => set((state) => ({ staff: [...state.staff, staffMember] })),

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),

      setCurrency: (currency) => set({ currency }),
      setAdminPassword: (adminPassword) => set({ adminPassword }),
      updateInvoiceSettings: (settings) => set((state) => ({
        invoiceSettings: { ...state.invoiceSettings, ...settings }
      })),
    }),
    {
      name: 'store-management-storage',
    }
  )
);
