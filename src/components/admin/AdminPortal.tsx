// ==============================================================================
// TAAZI TOKARI (ताज़ी टोकरी) - PROTECTED ADMIN CONTROL CENTER
// 4 Prominent actions: Add Product, Record Purchase, Record Sale, Add Expense.
// Weighted-average costing (Gross Profit = Revenue - COGS), Net Operating Profit,
// Orders management, Inventory ledger, Notifications, Delivery Settings,
// Customer Feedback, Date filtering, and CSV export.
// ==============================================================================

import React, { useState, useMemo } from 'react';
import {
  ProductItem,
  ProductCategory,
  PurchaseRecord,
  ManualSaleRecord,
  ExpenseRecord,
  CustomerOrder,
  NotificationOffer,
  DeliveryZone,
  CustomerFeedback,
  AuditLogRecord,
  UserProfile,
  appStore,
} from '../../services/store';
import { TaaziTokariEmblem } from '../BrandLogo';

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'sales'
  | 'expenses'
  | 'notifications'
  | 'orders'
  | 'delivery-settings'
  | 'feedback'
  | 'audit-logs';

interface AdminPortalProps {
  currentUser: UserProfile | null;
  onSwitchToCustomer: () => void;
  onSignOut: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onSwitchToCustomer,
  onSignOut,
}) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live state from appStore
  const [products, setProducts] = useState<ProductItem[]>(appStore.getProducts());
  const [categories, setCategories] = useState<ProductCategory[]>(appStore.getCategories());
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(appStore.getPurchases());
  const [manualSales, setManualSales] = useState<ManualSaleRecord[]>(appStore.getManualSales());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(appStore.getExpenses());
  const [orders, setOrders] = useState<CustomerOrder[]>(appStore.getOrders());
  const [notifications, setNotifications] = useState<NotificationOffer[]>(appStore.getNotifications());
  const [zones, setZones] = useState<DeliveryZone[]>(appStore.getDeliveryZones());
  const [feedback, setFeedback] = useState<CustomerFeedback[]>(appStore.getFeedback());
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(appStore.getAuditLogs());

  // Modal / Drawer states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<CustomerOrder | null>(null);

  // --- Form States for Quick Actions ---

  // 1. Product Form
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameHi, setProdNameHi] = useState('');
  const [prodCategory, setProdCategory] = useState('vegetables');
  const [prodUnit, setProdUnit] = useState('1 kg');
  const [prodPrice, setProdPrice] = useState(30);
  const [prodMrp, setProdMrp] = useState(40);
  const [prodStock, setProdStock] = useState(50);
  const [prodOrigin, setProdOrigin] = useState('Sitapur Belt');
  const [prodImage, setProdImage] = useState(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  );
  const [prodDesc, setProdDesc] = useState('');
  const [prodIsNew, setProdIsNew] = useState(false);
  const [prodIsPopular, setProdIsPopular] = useState(false);
  const [prodIsBestPrice, setProdIsBestPrice] = useState(false);

  // 2. Purchase Entry Form
  const [purProductId, setPurProductId] = useState(products[0]?.id || '');
  const [purQuantity, setPurQuantity] = useState(20);
  const [purTotalCost, setPurTotalCost] = useState(400);
  const [purSupplier, setPurSupplier] = useState('Dubagga Mandi Arhatiya');
  const [purNotes, setPurNotes] = useState('Dawn mandi grade A lot');

  // 3. Manual Sale Entry Form
  const [saleProductId, setSaleProductId] = useState(products[0]?.id || '');
  const [saleQuantity, setSaleQuantity] = useState(5);
  const [salePrice, setSalePrice] = useState(30);
  const [saleNotes, setSaleNotes] = useState('Counter walk-in customer');

  // 4. Expense Entry Form
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('TRANSPORT');
  const [expAmount, setExpAmount] = useState(350);
  const [expNotes, setExpNotes] = useState('Transport fuel for dawn mandi van');

  // 5. Notification Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<NotificationOffer['type']>('ANNOUNCEMENT');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-fetch all data from store
  const refreshData = () => {
    setProducts(appStore.getProducts());
    setCategories(appStore.getCategories());
    setPurchases(appStore.getPurchases());
    setManualSales(appStore.getManualSales());
    setExpenses(appStore.getExpenses());
    setOrders(appStore.getOrders());
    setNotifications(appStore.getNotifications());
    setZones(appStore.getDeliveryZones());
    setFeedback(appStore.getFeedback());
    setAuditLogs(appStore.getAuditLogs());
  };

  // Financial Metrics computed from store
  const metrics = useMemo(() => {
    return appStore.getBusinessMetrics(dateFilter);
  }, [purchases, manualSales, expenses, orders, products, dateFilter]);

  // Security Check: If user is not admin, block rendering
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f2fcf1] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-red-200 shadow-xl">
          <span className="text-5xl block">🛡️</span>
          <h2 className="text-xl font-bold text-gray-900">Admin Authorization Required</h2>
          <p className="text-xs text-gray-600">
            Access to the Taazi Tokari Control Center is restricted to verified administrators. Customer accounts cannot access business records.
          </p>
          <button
            onClick={onSwitchToCustomer}
            className="w-full py-3 bg-[#072917] text-white font-bold text-xs rounded-2xl"
          >
            Return to Customer Store
          </button>
        </div>
      </div>
    );
  }

  // --- Handlers for 4 Core Actions ---

  // Action 1: Add or Edit Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameEn.trim()) {
      showToast('Please provide an English name for the produce.');
      return;
    }

    const payload: ProductItem = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      nameEn: prodNameEn.trim(),
      nameHi: prodNameHi.trim() || prodNameEn.trim(),
      categorySlug: prodCategory,
      unit: prodUnit.trim(),
      price: Number(prodPrice),
      mrp: Number(prodMrp),
      stockQty: Number(prodStock),
      weightedCost: editingProduct?.weightedCost || Number(prodPrice) * 0.7,
      lowStockThreshold: 10,
      isAvailable: true,
      isNewArrival: prodIsNew,
      isPopular: prodIsPopular,
      isBestPrice: prodIsBestPrice,
      origin: prodOrigin.trim() || 'Lucknow Farm Lot',
      description: prodDesc.trim(),
      imageUrl: prodImage.trim(),
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    appStore.saveProduct(payload);
    refreshData();
    setIsAddProductOpen(false);
    setEditingProduct(null);
    showToast(`Product ${payload.nameEn} saved successfully.`);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setProdNameEn(prod.nameEn);
    setProdNameHi(prod.nameHi);
    setProdCategory(prod.categorySlug);
    setProdUnit(prod.unit);
    setProdPrice(prod.price);
    setProdMrp(prod.mrp);
    setProdStock(prod.stockQty);
    setProdOrigin(prod.origin);
    setProdImage(prod.imageUrl);
    setProdDesc(prod.description);
    setProdIsNew(prod.isNewArrival);
    setProdIsPopular(prod.isPopular);
    setProdIsBestPrice(prod.isBestPrice);
    setIsAddProductOpen(true);
  };

  // Action 2: Record Purchase (Increments stock & updates weighted cost)
  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === purProductId);
    if (!prod) {
      showToast('Please select a valid product.');
      return;
    }

    appStore.recordPurchase({
      date: dateFilter,
      productId: prod.id,
      productName: prod.nameEn,
      quantity: Number(purQuantity),
      unit: prod.unit,
      totalCost: Number(purTotalCost),
      supplierName: purSupplier.trim(),
      notes: purNotes.trim(),
      recordedBy: currentUser.fullName,
    });

    refreshData();
    setIsPurchaseModalOpen(false);
    showToast(`Recorded purchase of ${purQuantity} ${prod.unit} of ${prod.nameEn}. Stock updated!`);
  };

  // Action 3: Record Manual Sale (Decrements stock & updates revenue)
  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === saleProductId);
    if (!prod) {
      showToast('Please select a valid product.');
      return;
    }

    appStore.recordManualSale({
      date: dateFilter,
      productId: prod.id,
      productName: prod.nameEn,
      quantity: Number(saleQuantity),
      unit: prod.unit,
      sellingPrice: Number(salePrice),
      notes: saleNotes.trim(),
      recordedBy: currentUser.fullName,
    });

    refreshData();
    setIsSaleModalOpen(false);
    showToast(`Recorded sale of ${saleQuantity} ${prod.unit} of ${prod.nameEn}. Stock updated!`);
  };

  // Action 4: Add Expense
  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.recordExpense({
      date: dateFilter,
      category: expCategory,
      amount: Number(expAmount),
      notes: expNotes.trim(),
      recordedBy: currentUser.fullName,
    });

    refreshData();
    setIsExpenseModalOpen(false);
    showToast(`Recorded ${expCategory} expense of ₹${expAmount}.`);
  };

  // Notification creation
  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    appStore.saveNotification({
      id: `notif-${Date.now()}`,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      isActive: true,
      priority: 1,
      createdAt: new Date().toISOString(),
    });

    refreshData();
    setIsNotificationModalOpen(false);
    setNotifTitle('');
    setNotifMessage('');
    showToast('Published announcement to customer store.');
  };

  // Order status transition
  const handleUpdateOrderStatus = (orderId: string, newStatus: CustomerOrder['orderStatus']) => {
    appStore.updateOrderStatus(orderId, newStatus);
    refreshData();
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder({ ...viewingOrder, orderStatus: newStatus });
    }
    showToast(`Order status updated to ${newStatus}`);
  };

  // CSV Export utility
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      showToast('No records available to export.');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-[#151e17] flex flex-col font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#072917] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ADMIN SINGLE HEADER */}
      <header className="bg-[#072917] text-white sticky top-0 z-40 border-b border-[#14482a] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <TaaziTokariEmblem size={40} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-lg sm:text-xl font-bold tracking-tight text-white">
                  Taazi Tokari Admin
                </span>
                <span className="bg-[#bdeecd] text-[#002111] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Control Center
                </span>
              </div>
              <p className="text-[11px] text-[#8bba9b]">
                Verified Admin: {currentUser.fullName} ({currentUser.email})
              </p>
            </div>
          </div>

          {/* Quick Date Picker Filter */}
          <div className="hidden md:flex items-center gap-2 bg-[#031d10] px-3 py-1.5 rounded-xl border border-[#18482d]">
            <span className="text-xs text-[#8bba9b] font-bold">Business Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none"
            />
          </div>

          {/* Actions: Customer Store switch, Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToCustomer}
              className="bg-[#f4a62a] hover:bg-[#e0951e] text-[#072917] font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>🛒</span>
              <span>Customer Shop</span>
            </button>
            <button
              onClick={onSignOut}
              className="bg-[#0e3b23] hover:bg-[#155030] border border-[#236841] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ADMIN HORIZONTAL NAVIGATION TABS (One clean bar) */}
        <div className="bg-[#031d10] border-t border-[#124b2f] px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'products', label: '🥦 Products' },
              { id: 'inventory', label: '📦 Inventory' },
              { id: 'purchases', label: '🚚 Purchases' },
              { id: 'sales', label: '🏷️ Sales Ledger' },
              { id: 'expenses', label: '💸 Expenses' },
              { id: 'orders', label: '🛍️ Orders & Exceptions' },
              { id: 'notifications', label: '📢 Notifications' },
              { id: 'delivery-settings', label: '📍 Delivery Zones' },
              { id: 'feedback', label: '⭐ Customer Feedback' },
              { id: 'audit-logs', label: '📜 Audit Logs' },
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as AdminSection)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#bdeecd] text-[#002111] shadow-sm'
                      : 'text-[#8bba9b] hover:text-white hover:bg-[#0c3920]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 4 PROMINENT ACTION BUTTONS (Always accessible at top of Admin Portal) */}
      <div className="bg-white border-b border-gray-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 hidden sm:inline">
              Daily Actions:
            </span>
            <div className="flex flex-wrap gap-2">
              {/* 1. Add Product */}
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdNameEn('');
                  setProdNameHi('');
                  setProdPrice(30);
                  setProdMrp(40);
                  setProdStock(50);
                  setIsAddProductOpen(true);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>+</span>
                <span>Add Product</span>
              </button>

              {/* 2. Record Purchase */}
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="bg-[#0b3b24] hover:bg-[#124b2f] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📦</span>
                <span>Record Purchase</span>
              </button>

              {/* 3. Record Sale */}
              <button
                onClick={() => setIsSaleModalOpen(true)}
                className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>🏷️</span>
                <span>Record Sale</span>
              </button>

              {/* 4. Add Expense */}
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-gray-800 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>💸</span>
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-semibold">Active Date:</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
              {dateFilter}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* VIEW 1: DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 1. Today's Sales */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Today&apos;s Sales Revenue
                </span>
                <div className="text-2xl font-black text-gray-900">
                  ₹{metrics.totalSalesRevenue}
                </div>
                <div className="text-[11px] text-gray-500 flex justify-between pt-1">
                  <span>Online: ₹{metrics.onlineSalesRevenue}</span>
                  <span>Manual: ₹{metrics.manualSalesRevenue}</span>
                </div>
              </div>

              {/* 2. Today's Purchase Spending */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Purchase Spending (Mandi)
                </span>
                <div className="text-2xl font-black text-amber-900">
                  ₹{metrics.totalPurchaseSpending}
                </div>
                <p className="text-[11px] text-gray-500 pt-1">
                  Increases stock & updates weighted cost
                </p>
              </div>

              {/* 3. Today's Operating Expenses */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Recorded Expenses
                </span>
                <div className="text-2xl font-black text-gray-700">
                  ₹{metrics.totalOperatingExpenses}
                </div>
                <p className="text-[11px] text-gray-500 pt-1">
                  Transport, packaging & wastage
                </p>
              </div>

              {/* 4. Estimated Gross Profit & Net Profit */}
              <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-1">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                  Est. Gross Profit (Rev - COGS)
                </span>
                <div className="text-2xl font-black text-emerald-800">
                  ₹{metrics.estimatedGrossProfit}
                </div>
                <div className="text-[11px] font-bold text-emerald-950 pt-1 flex justify-between">
                  <span>Net Op Profit:</span>
                  <span className="font-black text-emerald-900">₹{metrics.estimatedNetOperatingProfit}</span>
                </div>
              </div>
            </div>

            {/* Inventory Valuation & Alerts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase block">
                  Active Inventory Valuation
                </span>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">
                  ₹{metrics.totalInventoryValue}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Across {products.length} live SKUs based on weighted cost
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase block">
                  Low Stock Warnings
                </span>
                <div className={`text-2xl font-extrabold mt-1 ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {metrics.lowStockCount} SKUs
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Threshold alerts requiring dawn mandi replenishment
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase block">
                    Today&apos;s Customer Orders
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                    {metrics.orderCount} Orders
                  </div>
                </div>
                <button
                  onClick={() => setActiveSection('orders')}
                  className="text-xs font-bold text-emerald-700 hover:underline text-left mt-2"
                >
                  View Order Fulfilment Queue →
                </button>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Table */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  Recent Orders & Fulfilment Status
                </h3>
                <button
                  onClick={() => setActiveSection('orders')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  All Orders ({orders.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Address</th>
                      <th className="py-2.5 px-3">Slot</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-bold text-gray-900">#{o.orderNumber}</td>
                        <td className="py-2.5 px-3">{o.customerName}</td>
                        <td className="py-2.5 px-3 text-gray-500 truncate max-w-[180px]">
                          {o.deliveryAddress.blockBuilding}, {o.deliveryAddress.flatNumber}
                        </td>
                        <td className="py-2.5 px-3">{o.deliverySlot.title}</td>
                        <td className="py-2.5 px-3 font-bold">₹{o.grandTotal}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PRODUCTS MANAGEMENT */}
        {activeSection === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Catalogue & Produce Management ({products.length} SKUs)
                </h3>
                <p className="text-xs text-gray-500">
                  Manage produce names, pricing, units, discounts, and availability.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportCSV(products, 'products_catalogue')}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProdNameEn('');
                    setProdNameHi('');
                    setProdPrice(30);
                    setProdMrp(40);
                    setProdStock(50);
                    setIsAddProductOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                >
                  + Add New Produce
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Produce Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">MRP</th>
                    <th className="py-2.5 px-3">Weighted Cost</th>
                    <th className="py-2.5 px-3">Live Stock</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <img src={p.imageUrl} alt={p.nameEn} className="w-8 h-8 rounded-lg object-cover border" />
                        <div>
                          <strong className="block text-gray-900">{p.nameEn}</strong>
                          <span className="text-[10px] text-gray-400">{p.nameHi}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 capitalize">{p.categorySlug}</td>
                      <td className="py-2.5 px-3">{p.unit}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">₹{p.price}</td>
                      <td className="py-2.5 px-3 text-gray-400">₹{p.mrp}</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-bold">₹{p.weightedCost}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${p.stockQty <= p.lowStockThreshold ? 'text-amber-600' : 'text-gray-900'}`}>
                          {p.stockQty}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isAvailable ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-200 text-gray-600'}`}>
                          {p.isAvailable ? 'Available' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="text-emerald-700 hover:underline font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Archive ${p.nameEn}?`)) {
                              appStore.deleteProduct(p.id);
                              refreshData();
                              showToast(`Archived ${p.nameEn}`);
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: INVENTORY MOVEMENTS LEDGER */}
        {activeSection === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Live Inventory & Movement Ledger
                </h3>
                <p className="text-xs text-gray-500">
                  Audit trail of all purchases, customer orders, manual sales, and restocks.
                </p>
              </div>
              <button
                onClick={() => handleExportCSV(appStore.getInventoryMovements(), 'inventory_movements')}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                📥 Export Ledger CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Produce Item</th>
                    <th className="py-2.5 px-3">Change (Qty)</th>
                    <th className="py-2.5 px-3">Balance After</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Reference / Notes</th>
                    <th className="py-2.5 px-3">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appStore.getInventoryMovements().slice(0, 50).map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-500">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{m.productName}</td>
                      <td className="py-2.5 px-3 font-black">
                        <span className={m.changeQty > 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">{m.balanceQtyAfter}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md font-mono text-[10px]">
                          {m.reason}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">{m.notes || m.referenceId}</td>
                      <td className="py-2.5 px-3 text-gray-500">{m.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: PURCHASES */}
        {activeSection === 'purchases' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Purchase Records (Mandi & Farm Procurement)
                </h3>
                <p className="text-xs text-gray-500">
                  Purchases automatically update inventory balance and calculate weighted-average unit cost.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportCSV(purchases, 'mandi_purchases')}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0b3b24] text-white rounded-xl text-xs font-bold"
                >
                  + Record Purchase
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Produce Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Total Cost</th>
                    <th className="py-2.5 px-3">Unit Cost</th>
                    <th className="py-2.5 px-3">Supplier / Mandi Lot</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold">{p.date}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{p.productName}</td>
                      <td className="py-2.5 px-3 font-bold">{p.quantity} {p.unit}</td>
                      <td className="py-2.5 px-3 font-black text-gray-900">₹{p.totalCost}</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-bold">₹{p.unitCost}/{p.unit}</td>
                      <td className="py-2.5 px-3 text-gray-600">{p.supplierName}</td>
                      <td className="py-2.5 px-3 text-gray-500 max-w-xs truncate">{p.notes}</td>
                      <td className="py-2.5 px-3 text-gray-500">{p.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: SALES */}
        {activeSection === 'sales' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Sales Ledger (Manual Sales & Online Orders)
                </h3>
                <p className="text-xs text-gray-500">
                  Online customer orders appear automatically and are never counted twice.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportCSV(manualSales, 'sales_ledger')}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => setIsSaleModalOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  + Record Manual Sale
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Produce Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Selling Price</th>
                    <th className="py-2.5 px-3">Total Revenue</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {manualSales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold">{s.date}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{s.productName}</td>
                      <td className="py-2.5 px-3">{s.quantity} {s.unit}</td>
                      <td className="py-2.5 px-3">₹{s.sellingPrice}/{s.unit}</td>
                      <td className="py-2.5 px-3 font-black text-emerald-800">₹{s.totalRevenue}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Manual Sale
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{s.notes}</td>
                    </tr>
                  ))}
                  {/* Also show online customer orders as verified sales */}
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 bg-emerald-50/40">
                      <td className="py-2.5 px-3 font-semibold">{o.createdAt.split('T')[0]}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        Online Order #{o.orderNumber} ({o.items.length} items)
                      </td>
                      <td className="py-2.5 px-3">{o.items.reduce((s, it) => s + it.quantity, 0)} units</td>
                      <td className="py-2.5 px-3">-</td>
                      <td className="py-2.5 px-3 font-black text-emerald-900">₹{o.subtotal}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Online Order
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{o.customerName} ({o.orderStatus})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 6: EXPENSES */}
        {activeSection === 'expenses' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Business Operating Expenses
                </h3>
                <p className="text-xs text-gray-500">
                  Records for transport fuel, packaging bags, market travel, and wastage costs.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportCSV(expenses, 'business_expenses')}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold"
                >
                  + Add Expense
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Notes & Reason</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold">{e.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-black text-gray-900">₹{e.amount}</td>
                      <td className="py-2.5 px-3 text-gray-700">{e.notes}</td>
                      <td className="py-2.5 px-3 text-gray-500">{e.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 7: ORDERS & FULFILMENT */}
        {activeSection === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Customer Orders Management ({orders.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Fulfilment workflow: Placed → Confirmed → Packed → Out for Delivery → Delivered.
                </p>
              </div>
              <button
                onClick={() => handleExportCSV(orders, 'orders_export')}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                📥 Export Orders CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Address</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Fulfilment Status</th>
                    <th className="py-2.5 px-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        <button
                          onClick={() => setViewingOrder(o)}
                          className="hover:underline text-emerald-800"
                        >
                          #{o.orderNumber}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{o.customerName}</td>
                      <td className="py-2.5 px-3">{o.customerPhone}</td>
                      <td className="py-2.5 px-3 text-gray-500 truncate max-w-[180px]">
                        {o.deliveryAddress.blockBuilding}, {o.deliveryAddress.flatNumber}
                      </td>
                      <td className="py-2.5 px-3 font-black">₹{o.grandTotal}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                          {o.paymentMethod} ({o.paymentStatus})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : o.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-800 focus:outline-none"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 8: NOTIFICATIONS & OFFERS */}
        {activeSection === 'notifications' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  In-App Notifications & Promotional Offers
                </h3>
                <p className="text-xs text-gray-500">
                  Announcements, morning cut-off banners, and promotional codes displayed to customers.
                </p>
              </div>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                + New Announcement
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        {n.type}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">{n.title}</h4>
                    <p className="text-xs text-gray-600">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        n.isActive = !n.isActive;
                        appStore.saveNotification(n);
                        refreshData();
                        showToast(`Announcement ${n.isActive ? 'activated' : 'paused'}`);
                      }}
                      className={`text-xs font-bold px-3 py-1 rounded-xl ${n.isActive ? 'bg-emerald-700 text-white' : 'bg-gray-300 text-gray-700'}`}
                    >
                      {n.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => {
                        appStore.deleteNotification(n.id);
                        refreshData();
                        showToast('Deleted announcement');
                      }}
                      className="text-red-600 text-xs hover:underline font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 9: DELIVERY ZONES */}
        {activeSection === 'delivery-settings' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Active Lucknow Delivery Zones & Serviceability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map((z) => (
                <div key={z.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{z.name}</h4>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      Active Zone
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Serviceable Pincodes: <strong>{z.pincodes.join(', ')}</strong>
                  </p>
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                    <span>Base Fee: ₹{z.deliveryFee}</span>
                    <span className="font-bold text-emerald-800">
                      Free Above ₹{z.minOrderFreeDelivery}
                    </span>
                    <span>Cutoff: {z.cutoffTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 10: CUSTOMER FEEDBACK */}
        {activeSection === 'feedback' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Customer Produce Ratings & Feedback ({feedback.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Unobtrusive post-delivery feedback ratings submitted by verified customers.
                </p>
              </div>
              <button
                onClick={() => handleExportCSV(feedback, 'customer_feedback')}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                📥 Export Feedback CSV
              </button>
            </div>

            {feedback.length === 0 ? (
              <p className="text-xs text-gray-500 py-8 text-center">
                No customer feedback submitted yet. Ratings appear here after customers rate delivered produce.
              </p>
            ) : (
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        {f.customerName} • Order #{f.orderNumber}
                      </span>
                      <span className="text-amber-500 text-sm">
                        {'★'.repeat(f.rating) + '☆'.repeat(5 - f.rating)}
                      </span>
                    </div>
                    {f.comment && <p className="text-xs text-gray-700 italic">&quot;{f.comment}&quot;</p>}
                    <span className="text-[10px] text-gray-400 block pt-1">
                      Submitted on {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 11: AUDIT LOGS */}
        {activeSection === 'audit-logs' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                System & Admin Audit Logs ({auditLogs.length})
              </h3>
              <button
                onClick={() => handleExportCSV(auditLogs, 'admin_audit_logs')}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                📥 Export Audit Trail CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {auditLogs.slice(0, 100).map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-bold text-emerald-900">{l.action}</td>
                      <td className="py-2 px-3">{l.entityType}</td>
                      <td className="py-2 px-3 font-sans text-gray-700">{l.actor}</td>
                      <td className="py-2 px-3 font-sans text-gray-600 max-w-md truncate">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Edit Produce Item' : 'Add New Produce to Catalogue'}
              </h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={prodNameEn}
                    onChange={(e) => setProdNameEn(e.target.value)}
                    placeholder="e.g. Desi Tomato"
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Name (Hindi)</label>
                  <input
                    type="text"
                    value={prodNameHi}
                    onChange={(e) => setProdNameHi(e.target.value)}
                    placeholder="e.g. देसी टमाटर"
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 capitalize"
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="daily-essentials">Daily Essentials</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="1 kg"
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodMrp}
                    onChange={(e) => setProdMrp(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Origin / Farm</label>
                  <input
                    type="text"
                    value={prodOrigin}
                    onChange={(e) => setProdOrigin(e.target.value)}
                    placeholder="Sitapur Belt"
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Photograph URL</label>
                <input
                  type="url"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Fresh farm harvest details..."
                />
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsNew}
                    onChange={(e) => setProdIsNew(e.target.checked)}
                  />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsPopular}
                    onChange={(e) => setProdIsPopular(e.target.checked)}
                  />
                  <span>Popular Product</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold">
                  <input
                    type="checkbox"
                    checked={prodIsBestPrice}
                    onChange={(e) => setProdIsBestPrice(e.target.checked)}
                  />
                  <span>Best Price Deal</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl mt-2"
              >
                Save Produce Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PURCHASE */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-gray-900">
                📦 Record Mandi / Farm Purchase
              </h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Purchases increment stock balance and automatically compute the weighted-average cost per unit.
            </p>

            <form onSubmit={handleRecordPurchase} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Produce SKU</label>
                <select
                  value={purProductId}
                  onChange={(e) => setPurProductId(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} (Current stock: {p.stockQty} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity Purchased</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={purQuantity}
                    onChange={(e) => setPurQuantity(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Cost Paid (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={purTotalCost}
                    onChange={(e) => setPurTotalCost(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Calculated unit cost indicator */}
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 flex justify-between font-bold">
                <span>Calculated Unit Cost:</span>
                <span>₹{(purTotalCost / (purQuantity || 1)).toFixed(2)} per unit</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier / Mandi Arhatiya</label>
                <input
                  type="text"
                  value={purSupplier}
                  onChange={(e) => setPurSupplier(e.target.value)}
                  placeholder="Dubagga Mandi Arhatiya Lot #4"
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={purNotes}
                  onChange={(e) => setPurNotes(e.target.value)}
                  placeholder="Grade A harvest lot"
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0b3b24] hover:bg-[#124b2f] text-white font-bold rounded-2xl mt-2"
              >
                Record Purchase & Increment Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD MANUAL SALE */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-gray-900">
                🏷️ Record Counter / Physical Sale
              </h3>
              <button onClick={() => setIsSaleModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Manual sales record cash/counter revenue and automatically deduct stock.
            </p>

            <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Produce SKU</label>
                <select
                  value={saleProductId}
                  onChange={(e) => setSaleProductId(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} (Stock: {p.stockQty} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity Sold</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price per Unit (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Total revenue preview */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950 flex justify-between font-bold">
                <span>Total Revenue:</span>
                <span>₹{(saleQuantity * salePrice).toFixed(2)}</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Counter customer / spot purchase"
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl mt-2"
              >
                Record Sale & Reduce Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-gray-900">
                💸 Record Business Expense
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full border rounded-xl px-3 py-2 font-bold"
                >
                  <option value="TRANSPORT">Transport & Fuel</option>
                  <option value="PACKAGING">Packaging & Bags</option>
                  <option value="MARKET_TRAVEL">Mandi Travel</option>
                  <option value="WASTAGE">Wastage / Discard</option>
                  <option value="UTILITIES">Cooling & Electricity</option>
                  <option value="OTHER">Other Operational Cost</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes / Description</label>
                <textarea
                  required
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="e.g. Dawn mandi transport diesel"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl mt-2"
              >
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: NEW NOTIFICATION */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-gray-900">
                📢 Publish In-App Announcement
              </h3>
              <button onClick={() => setIsNotificationModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Type</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value as any)}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  <option value="ANNOUNCEMENT">General Announcement</option>
                  <option value="HARVEST_ALERT">Dawn Harvest Alert</option>
                  <option value="OFFER">Promotional Discount Offer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. 🌾 Dawn Mandi Lot Arrived"
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  rows={3}
                  placeholder="Order before 10 PM for fresh morning delivery..."
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 text-white font-bold rounded-2xl"
              >
                Publish to Customer Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ORDER DETAILS */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Order #{viewingOrder.orderNumber}
                </h3>
                <span className="text-xs text-gray-500">
                  Customer: {viewingOrder.customerName} ({viewingOrder.customerPhone})
                </span>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1">
              <p><strong>Address:</strong> {viewingOrder.deliveryAddress.addressLine}, {viewingOrder.deliveryAddress.flatNumber}</p>
              <p><strong>Slot:</strong> {viewingOrder.deliverySlot.title}</p>
              <p><strong>Payment:</strong> {viewingOrder.paymentMethod} ({viewingOrder.paymentStatus})</p>
              {viewingOrder.deliveryNotes && (
                <p><strong>Notes:</strong> {viewingOrder.deliveryNotes}</p>
              )}
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <span className="font-bold text-gray-700 block pb-1">Items Ordered:</span>
              {viewingOrder.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <span>{it.quantity} × {it.nameEn} ({it.unit})</span>
                  <span className="font-bold">₹{it.itemTotal}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-black text-sm text-gray-900">
                <span>Grand Total:</span>
                <span>₹{viewingOrder.grandTotal}</span>
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end gap-2">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
