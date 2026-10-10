import React, { useState, useEffect } from 'react';
import {
  HOTLINKED_IMAGES,
  INITIAL_ADMIN_CATALOGUE,
  INITIAL_GOVERNOR_SKUS,
  AdminCatalogueItem,
  GovernorSkuRow,
} from '../data/mockData';
import { TaaziTokariEmblem } from './BrandLogo';

export type AdminView =
  | 'overview-dashboard'
  | 'catalogue-inventory'
  | 'daily-mandi-rate-manipulation'
  | 'payment-gateway-settlement'
  | 'societies-cut-off-config'
  | 'orders-exceptions';

interface AdminConsoleProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ activeView, setActiveView }) => {
  // Global Admin Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSocietyFilter, setActiveSocietyFilter] = useState('Eldeco Elegance (#LKO-24)');

  // Live countdown timer for header & Daily Mandi screen
  const [secondsLeft, setSecondsLeft] = useState(3 * 3600 + 41 * 60 + 53);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (sec: number) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  // ============================================================================
  // STATE FOR VIEW 1: CATALOGUE & INVENTORY
  // ============================================================================
  const [catalogueItems, setCatalogueItems] = useState<AdminCatalogueItem[]>(
    INITIAL_ADMIN_CATALOGUE
  );
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [catalogueCategory, setCatalogueCategory] = useState<
    'all' | 'vegetables' | 'leafy' | 'tubers' | 'exotic' | 'bundles'
  >('all');
  const [syncingMandi, setSyncingMandi] = useState(false);

  // Slide-over Drawer for Catalogue Add/Edit
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('edit');
  const [formNameEn, setFormNameEn] = useState('Pahadi Aloo (Grade A)');
  const [formNameHi, setFormNameHi] = useState('पहाड़ी आलू');
  const [formSku, setFormSku] = useState('SKU-AL-02');
  const [formCategory, setFormCategory] = useState<AdminCatalogueItem['category']>('tubers');
  const [formUnit, setFormUnit] = useState('kg');
  const [formBuffer, setFormBuffer] = useState('10');
  const [formMaxLimit, setFormMaxLimit] = useState('4');
  const [formCost, setFormCost] = useState('19');
  const [formPrice, setFormPrice] = useState('28');

  const openAddDrawer = () => {
    setDrawerMode('add');
    setFormNameEn('');
    setFormNameHi('');
    setFormSku(`SKU-NEW-${Math.floor(10 + Math.random() * 89)}`);
    setFormCategory('vegetables');
    setFormUnit('kg');
    setFormBuffer('15');
    setFormCost('20');
    setFormPrice('30');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: AdminCatalogueItem) => {
    setDrawerMode('edit');
    setFormNameEn(item.nameEn);
    setFormNameHi(item.nameHi);
    setFormSku(item.sku);
    setFormCategory(item.category);
    setFormUnit(item.unit);
    setFormBuffer(String(item.bufferPct));
    setFormCost(String(item.mandiCost));
    setFormPrice(String(item.retailPrice));
    setDrawerOpen(true);
  };

  const saveDrawerItem = () => {
    const costNum = parseFloat(formCost) || 20;
    const priceNum = parseFloat(formPrice) || 30;
    const bufferNum = parseInt(formBuffer, 10) || 12;

    if (drawerMode === 'add') {
      const newItem: AdminCatalogueItem = {
        id: String(Date.now()),
        nameEn: formNameEn || 'New Farm Produce',
        nameHi: formNameHi || 'ताज़ी सब्ज़ी',
        originBadge: 'Direct Lot',
        originBadgeStyle: 'primary-fixed',
        unitSubtitle: `${formNameHi || 'ताज़ी सब्ज़ी'} • 1 ${formUnit}`,
        sku: formSku,
        category: formCategory,
        categoryLabel:
          formCategory === 'leafy'
            ? 'Leafy Greens'
            : formCategory === 'tubers'
            ? 'Tubers & Roots'
            : formCategory === 'bundles'
            ? 'Bundles'
            : 'Vegetables',
        mandiCost: costNum,
        retailPrice: priceNum,
        unit: formUnit,
        bufferPct: bufferNum,
        active: true,
        image: HOTLINKED_IMAGES.pahadiAlooDrawer,
      };
      setCatalogueItems((prev) => [newItem, ...prev]);
      showToast(`Added ${newItem.nameEn} (${newItem.sku}) to Tonight's Pre-Order Batch!`);
    } else {
      setCatalogueItems((prev) =>
        prev.map((it) =>
          it.sku === formSku
            ? {
                ...it,
                nameEn: formNameEn,
                nameHi: formNameHi,
                category: formCategory,
                unit: formUnit,
                bufferPct: bufferNum,
                mandiCost: costNum,
                retailPrice: priceNum,
              }
            : it
        )
      );
      showToast('SKU Updated & Dispatched to Midnight Cut-off Queue');
    }
    setDrawerOpen(false);
  };

  const toggleCatalogueStatus = (id: string) => {
    setCatalogueItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.active;
          showToast(
            nextState
              ? `${item.nameEn} activated for Tonight Pre-Order batch!`
              : `${item.nameEn} set to Resting (hidden from resident order screen)`
          );
          return { ...item, active: nextState };
        }
        return item;
      })
    );
  };

  const filteredCatalogue = catalogueItems.filter((item) => {
    const matchesCat = catalogueCategory === 'all' || item.category === catalogueCategory;
    const q = catalogueSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.nameEn.toLowerCase().includes(q) ||
      item.nameHi.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.originBadge.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // ============================================================================
  // STATE FOR VIEW 2: DAILY MANDI & RATE MANIPULATION ENGINE
  // ============================================================================
  const [governorSkus, setGovernorSkus] = useState<GovernorSkuRow[]>(INITIAL_GOVERNOR_SKUS);
  const [governorSearch, setGovernorSearch] = useState('');
  const [governorCategory, setGovernorCategory] = useState<'all' | 'leafy' | 'gourds' | 'roots'>(
    'all'
  );
  const [auditLogs, setAuditLogs] = useState([
    {
      time: '08:14 PM',
      sku: 'Desi Palak',
      oldPrice: 24,
      newPrice: 28,
      operator: 'Ashutosh V.',
      reason: 'Mandi Auction Spike',
      reasonStyle: 'secondary',
    },
    {
      time: '07:22 PM',
      sku: 'Safeda Mango',
      oldPrice: 68,
      newPrice: 62,
      operator: 'Ashutosh V.',
      reason: 'Bulk Orchard Volume Drop',
      reasonStyle: 'primary',
    },
    {
      time: '06:05 PM',
      sku: 'Bhindi (Okra)',
      oldPrice: 36,
      newPrice: 38,
      operator: 'Karan S. (QC)',
      reason: 'Grading Standard #1 Shift',
      reasonStyle: 'neutral',
    },
    {
      time: '04:32 PM',
      sku: 'Tamatar Desi',
      oldPrice: 40,
      newPrice: 44,
      operator: 'Ashutosh V.',
      reason: 'Sitapur Transport Logistics',
      reasonStyle: 'secondary',
    },
  ]);

  const updateGovernorPrice = (skuCode: string, nextPrice: number) => {
    if (nextPrice <= 0) return;
    setGovernorSkus((prev) =>
      prev.map((row) => {
        if (row.sku === skuCode) {
          const oldP = row.sellingPrice;
          if (oldP !== nextPrice) {
            setAuditLogs((logs) => [
              {
                time: 'Just now',
                sku: row.name.split(' (')[0],
                oldPrice: oldP,
                newPrice: nextPrice,
                operator: 'Ashutosh V.',
                reason: 'Live Governor Override',
                reasonStyle: 'primary',
              },
              ...logs.slice(0, 5),
            ]);
          }
          return { ...row, sellingPrice: nextPrice };
        }
        return row;
      })
    );
    showToast(`Updated price for ${skuCode} to ₹${nextPrice}`);
  };

  const toggleGovernorLock = (skuCode: string) => {
    setGovernorSkus((prev) =>
      prev.map((row) => {
        if (row.sku === skuCode) {
          const nextLock = !row.locked;
          showToast(
            nextLock
              ? `SKU ${row.name} rate locked for Eldeco Elegance midnight dispatch`
              : `SKU ${row.name} unlocked for auto-sync`
          );
          return { ...row, locked: nextLock };
        }
        return row;
      })
    );
  };

  const applyMonsoonBufferMacro = () => {
    setGovernorSkus((prev) =>
      prev.map((row) => ({
        ...row,
        sellingPrice: Math.round(row.sellingPrice * 1.05),
      }))
    );
    showToast('Applied +5% Monsoon Sourcing Buffer across all catalogue items.');
  };

  const applyMatchInstamartMacro = () => {
    setGovernorSkus((prev) =>
      prev.map((row) => ({
        ...row,
        sellingPrice: Math.round(row.benchmarkPrice * 0.85),
      }))
    );
    showToast('Aligned catalog to 15% discount vs Quick-Commerce benchmarks.');
  };

  const applyResetFormulaMacro = () => {
    setGovernorSkus(INITIAL_GOVERNOR_SKUS);
    showToast('Formulas reset: Defaulting to base Dubagga & Sitapur Mandi sourcing rates.');
  };

  const lockAllGovernorRates = () => {
    setGovernorSkus((prev) => prev.map((row) => ({ ...row, locked: true })));
    showToast('All 42 active SKUs locked for batch cut-off tonight (Eldeco Elegance #LKO-24).');
  };

  const filteredGovernorSkus = governorSkus.filter((row) => {
    const matchesCat = governorCategory === 'all' || row.category === governorCategory;
    const q = governorSearch.toLowerCase().trim();
    const matchesQ =
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.originSubtitle.toLowerCase().includes(q) ||
      row.sku.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  // ============================================================================
  // STATE FOR VIEW 3: PAYMENT GATEWAY & FINANCIAL SETTLEMENT
  // ============================================================================
  const [dateRangeTab, setDateRangeTab] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [gatewaySpinning, setGatewaySpinning] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [verifiedPendingOrder, setVerifiedPendingOrder] = useState(false);
  const [webhookPayloadJson, setWebhookPayloadJson] = useState(
    JSON.stringify(
      {
        entity: 'event',
        account_id: 'acc_LkoTokariLive',
        event: 'order.paid',
        contains: ['payment', 'order'],
        payload: {
          payment: {
            entity: {
              id: 'pay_Ox9a18k2b9',
              amount: 34200,
              currency: 'INR',
              status: 'captured',
              order_id: 'order_LKO_2041',
              method: 'upi',
              vpa: 'amit.verma@oksbi',
              society_code: 'ELDECO_ELEGANCE_LKO',
              flat_no: 'T1-804',
            },
          },
        },
        created_at: 1725200530,
      },
      null,
      2
    )
  );

  const openWebhookDrawerWithPayload = (txnId: string, eventType: string, amount: number) => {
    setWebhookPayloadJson(
      JSON.stringify(
        {
          entity: 'event',
          account_id: 'acc_LkoTokariLive',
          event: eventType,
          contains: ['payment'],
          payload: {
            payment: {
              entity: {
                id: txnId,
                amount: Math.round(amount * 100),
                currency: 'INR',
                status: eventType === 'order.paid' ? 'captured' : 'refunded',
                society: 'Eldeco Elegance (#LKO-24)',
              },
            },
          },
          verified_timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
    setAuditDrawerOpen(true);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(webhookPayloadJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  // Calculate drawer spread
  const drawerCostNum = parseFloat(formCost) || 0;
  const drawerPriceNum = parseFloat(formPrice) || 0;
  const drawerSpreadVal = drawerPriceNum - drawerCostNum;
  const drawerSpreadPct =
    drawerPriceNum > 0 ? ((drawerSpreadVal / drawerPriceNum) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex">
      {/* ===================================================================== */}
      {/* FIXED LEFT SIDEBAR (Exact match to HTML 1, 2, 3)                      */}
      {/* ===================================================================== */}
      <aside className="fixed left-0 top-12 bottom-0 w-72 bg-surface-container-low z-40 hidden lg:flex flex-col justify-between py-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#dbe5da]">
        <div className="flex flex-col gap-space-md">
          {/* Brand Lockup */}
          <div className="px-space-md flex items-center gap-space-sm">
            <TaaziTokariEmblem size={38} />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">
                Taazi Tokari
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
                Admin Console • Lucknow Pilot
              </span>
            </div>
          </div>

          {/* Hub Routing Status */}
          <div className="px-space-md">
            <div className="bg-surface-container rounded-lg p-space-sm flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-title-md">
                  swap_calls
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Hub Routing
                  </span>
                  <span className="font-title-md text-title-md text-on-surface">
                    Lucknow East Gate
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full">
                LIVE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-space-sm">
            {[
              {
                id: 'overview-dashboard' as AdminView,
                icon: 'space_dashboard',
                label: 'Overview / Dashboard',
              },
              {
                id: 'catalogue-inventory' as AdminView,
                icon: 'nutrition',
                label: 'Catalogue & Inventory',
              },
              {
                id: 'daily-mandi-rate-manipulation' as AdminView,
                icon: 'trending_up',
                label: 'Daily Mandi & Rates',
              },
              {
                id: 'payment-gateway-settlement' as AdminView,
                icon: 'account_balance_wallet',
                label: 'Payment & Settlements',
              },
              {
                id: 'societies-cut-off-config' as AdminView,
                icon: 'apartment',
                label: 'Societies & Cut-offs',
              },
              {
                id: 'orders-exceptions' as AdminView,
                icon: 'fact_check',
                label: 'Orders & Exceptions',
              },
            ].map((navItem) => {
              const isActive = activeView === navItem.id;
              return (
                <button
                  key={navItem.id}
                  onClick={() => setActiveView(navItem.id)}
                  className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg transition-all font-body-md text-body-md text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-bold shadow-[0_2px_8px_-2px_rgba(26,35,28,0.12)]'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-title-lg">{navItem.icon}</span>
                  <span>{navItem.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Mandi Sync */}
        <div className="px-space-md flex flex-col gap-space-sm">
          <div className="bg-surface-container-high rounded-xl p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-title-md">
                cloud_sync
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Mandi Sync
                </span>
                <span className="font-label-md text-label-md text-on-surface">04:15 AM Fresh</span>
              </div>
            </div>
            <button
              onClick={() =>
                showToast('Synced Dubagga Mandi Terminal #01 • 42 SKU dawn auction lots verified.')
              }
              className="px-2 py-1 bg-surface rounded-lg text-primary font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors"
            >
              Pull
            </button>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span>Node: Dubagga-Mandi-01</span>
            <span>v2.4.1</span>
          </div>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* MAIN CONTENT SHELL                                                    */}
      {/* ===================================================================== */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="sticky top-12 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl z-30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e1ebe0]">
          <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              {/* Society Filter Selector */}
              <button
                onClick={() => {
                  const next =
                    activeSocietyFilter === 'Eldeco Elegance (#LKO-24)'
                      ? 'Omaxe Residency (#LKO-12)'
                      : 'Eldeco Elegance (#LKO-24)';
                  setActiveSocietyFilter(next);
                  showToast(`Switched Active Society Filter to ${next}`);
                }}
                className="flex items-center gap-space-xs bg-surface-container-low hover:bg-surface-container px-space-sm py-1.5 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] text-left transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-title-md">
                  location_city
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Active Society Filter
                  </span>
                  <span className="font-title-md text-title-md text-on-surface">
                    {activeSocietyFilter}
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-body-md ml-1">
                  expand_more
                </span>
              </button>

              {/* Batch Cut-off Timer */}
              <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1.5 rounded-xl bg-surface-container tabular-nums">
                <span className="material-symbols-outlined text-secondary text-title-md">
                  timer
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Batch Cut-off (23:59):
                  </span>
                  <span className="font-label-lg text-label-lg text-secondary">04h 22m 18s</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-md">
              <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high">
                <span className="w-2 h-2 rounded-full bg-primary-fixed-dim ring-2 ring-primary"></span>
                <span className="font-label-sm text-label-sm text-on-surface">
                  Dispatches: Punctual
                </span>
              </div>

              <button
                onClick={() =>
                  showToast('3 active operational notifications: Sitapur Tomato lot arrived early.')
                }
                className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-title-lg">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
              </button>

              <div className="flex items-center gap-space-xs pl-space-xs">
                <img
                  alt="Ashutosh Verma"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/20"
                  src={HOTLINKED_IMAGES.profileAvatar}
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-title-md text-title-md text-on-surface leading-tight">
                    Ashutosh Verma
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">
                    Super Admin • LKO
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN VIEWPORT */}
        <main className="relative w-full px-space-lg bg-surface flex-1">
          <div className="flex flex-col w-full pb-margin-lg">
            {/* =============================================================== */}
            {/* ADMIN VIEW 1: CATALOGUE & INVENTORY (Image 19.png / HTML 1)     */}
            {/* =============================================================== */}
            {activeView === 'catalogue-inventory' && (
              <>
                {/* Top Stats & Operational Context */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md py-space-md mb-space-md">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-space-xs text-secondary">
                      <span className="material-symbols-outlined text-title-md">inventory_2</span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                        Consolidated Sourcing Matrix
                      </span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                      Catalogue & Produce Management
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-space-xs tabular-nums">
                      <span>
                        Active SKUs: <strong className="text-on-surface font-semibold">42</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Live for Tonight Pre-Order:{' '}
                        <strong className="text-primary font-semibold">
                          {30 + catalogueItems.filter((i) => i.active).length}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Out of Stock / Rested:{' '}
                        <strong className="text-tertiary font-semibold">
                          {3 + catalogueItems.filter((i) => !i.active).length}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-on-surface-variant">
                        Hub: Dubagga Sourcing Terminal
                      </span>
                    </p>
                  </div>

                  {/* Bulk Actions & Primary CTA */}
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <button
                      onClick={() => {
                        setSyncingMandi(true);
                        setTimeout(() => {
                          setSyncingMandi(false);
                          showToast(
                            'Dubagga Mandi Early Bids successfully synchronized (+3 updates)'
                          );
                        }, 600);
                      }}
                      className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary transition-all text-label-lg font-label-lg shadow-sm ${
                        syncingMandi ? 'animate-pulse' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-title-md text-secondary">
                        sync_saved_locally
                      </span>
                      <span>Sync Mandi Benchmark</span>
                    </button>

                    <button
                      onClick={() =>
                        showToast('Exported Lucknow Pilot Price Master (42 SKUs) to CSV.')
                      }
                      className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant transition-all text-label-lg font-label-lg shadow-sm"
                    >
                      <span className="material-symbols-outlined text-title-md">table_view</span>
                      <span>Export Price Master CSV</span>
                    </button>

                    <button
                      onClick={openAddDrawer}
                      className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all text-label-lg font-label-lg shadow-md"
                    >
                      <span className="material-symbols-outlined text-title-md">add_circle</span>
                      <span>+ Add New Produce / SKU</span>
                    </button>
                  </div>
                </div>

                {/* Operational Filter Strip & Bento Key Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
                  {/* Bento Tile 1 */}
                  <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-title-lg">
                            monitoring
                          </span>
                        </div>
                        <div>
                          <h2 className="font-title-md text-title-md text-on-surface">
                            Tonight's Society Fulfillment Index
                          </h2>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            Live benchmarked vs. Dubagga Mandi Early Bids
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-space-sm py-1 bg-surface-container-low rounded-full">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-label-sm text-label-sm text-primary font-semibold tabular-nums">
                          Batch Closes in 04h 21m
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs tabular-nums">
                      <div className="bg-surface-container-low/70 rounded-lg p-space-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          Avg Blended Margin
                        </span>
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">
                          32.4%
                        </span>
                        <span className="font-label-sm text-label-sm text-primary flex items-center mt-0.5">
                          <span className="material-symbols-outlined text-body-md">
                            arrow_upward
                          </span>{' '}
                          +2.1% target
                        </span>
                      </div>

                      <div className="bg-surface-container-low/70 rounded-lg p-space-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          Aggregate Buffer
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          14.8%
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 block">
                          Safety margin applied
                        </span>
                      </div>

                      <div className="bg-surface-container-low/70 rounded-lg p-space-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          Pre-Allocated Vol
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          840 kg
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-medium mt-0.5 block">
                          14 Societies
                        </span>
                      </div>

                      <div className="bg-surface-container-low/70 rounded-lg p-space-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          Mandi Spread Deficit
                        </span>
                        <span className="font-headline-sm text-headline-sm text-tertiary font-bold">
                          1 SKU
                        </span>
                        <span className="font-label-sm text-label-sm text-tertiary mt-0.5 block">
                          Cauliflower tight
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bento Tile 2 */}
                  <div className="lg:col-span-4 bg-surface-container-high rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-space-xs">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-title-md">
                          eco
                        </span>
                        <span className="font-title-md text-title-md text-on-surface">
                          Sitapur & Malihabad Belt
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                        DIRECT
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Fresh tomato arrivals from Sitapur clusters showing higher firmness index
                      today. Recommended to keep pre-order buffer at 15%.
                    </p>
                    <div className="flex items-center justify-between pt-space-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Last Audit: 18:40 IST by Verma
                      </span>
                      <button
                        onClick={() => setActiveView('daily-mandi-rate-manipulation')}
                        className="font-label-sm text-label-sm text-primary hover:text-primary-container font-bold flex items-center gap-0.5"
                      >
                        Audit Log{' '}
                        <span className="material-symbols-outlined text-body-md">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search, Filter Bar & Pill Categories */}
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
                    <div className="relative flex-1 max-w-md">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-title-md">
                        search
                      </span>
                      <input
                        value={catalogueSearch}
                        onChange={(e) => setCatalogueSearch(e.target.value)}
                        className="w-full bg-surface-container-low pl-10 pr-space-md py-2.5 rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface font-body-md text-body-md transition-all shadow-inner"
                        placeholder="Search Produce (e.g. Tamatar, Aloo, Palak or SKU-08)..."
                        type="text"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: 'all', label: 'All (42)' },
                        { id: 'vegetables', label: 'Vegetables (19)' },
                        { id: 'leafy', label: 'Leafy Greens (7)' },
                        { id: 'tubers', label: 'Tubers & Roots (6)' },
                        { id: 'exotic', label: 'Exotic (5)' },
                        { id: 'bundles', label: 'Bundles (5)' },
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          onClick={() => setCatalogueCategory(pill.id as any)}
                          className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap ${
                            catalogueCategory === pill.id
                              ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm justify-end">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-label-sm font-label-sm bg-surface-container-low px-space-sm py-1.5 rounded-lg">
                      <span className="material-symbols-outlined text-title-md">tune</span>
                      <span>View: Sourcing Default</span>
                    </div>
                    <button
                      onClick={() => {
                        setCatalogueSearch('');
                        setCatalogueCategory('all');
                        showToast('Catalogue filters reset.');
                      }}
                      className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors"
                      title="Reload Catalogue"
                    >
                      <span className="material-symbols-outlined text-title-md">refresh</span>
                    </button>
                  </div>
                </div>

                {/* Master Catalogue Data Table Section */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="px-space-md py-space-sm bg-surface-container-low/50 flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-body-md text-primary">
                        verified
                      </span>
                      <span>Showing {filteredCatalogue.length} of 42 Lucknow Pilot Items</span>
                      <span>•</span>
                      <span className="text-secondary font-medium">
                        Auto-synced with Eldeco Elegance & Omaxe Residency batches
                      </span>
                    </div>
                    <div className="text-on-surface-variant font-label-sm text-label-sm">
                      Sort: <span className="font-bold text-on-surface">Highest Margin First</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse tabular-nums">
                      <thead>
                        <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                          <th className="py-3 px-space-md font-semibold">Produce Item</th>
                          <th className="py-3 px-space-sm font-semibold">SKU Code</th>
                          <th className="py-3 px-space-sm font-semibold">Category</th>
                          <th className="py-3 px-space-sm font-semibold">Est Mandi Cost</th>
                          <th className="py-3 px-space-sm font-semibold">Retail Price</th>
                          <th className="py-3 px-space-sm font-semibold">Margin Spread</th>
                          <th className="py-3 px-space-sm font-semibold">Procurement Buffer</th>
                          <th className="py-3 px-space-sm font-semibold text-center">
                            Tonight Cut-Off
                          </th>
                          <th className="py-3 px-space-md font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-body-md font-body-md divide-y divide-[#ecf6eb]">
                        {filteredCatalogue.map((item) => {
                          const spreadPct = (
                            ((item.retailPrice - item.mandiCost) / item.retailPrice) *
                            100
                          ).toFixed(1);

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-surface-container-low/60 transition-colors"
                            >
                              <td className="py-3.5 px-space-md">
                                <div className="flex items-center gap-space-sm">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container shrink-0 shadow-sm relative">
                                    <img
                                      src={item.image}
                                      alt={item.nameEn}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                    {item.lowArrival && (
                                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full ring-2 ring-surface" />
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                                        {item.nameEn}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                          item.originBadgeStyle === 'primary-fixed'
                                            ? 'bg-primary-fixed text-on-primary-fixed'
                                            : item.originBadgeStyle === 'primary-container'
                                            ? 'bg-primary-container text-on-primary'
                                            : item.originBadgeStyle === 'secondary-fixed'
                                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                                            : item.originBadgeStyle === 'error'
                                            ? 'bg-error-container text-on-error-container'
                                            : 'bg-surface-container-highest text-on-surface-variant'
                                        }`}
                                      >
                                        {item.originBadge}
                                      </span>
                                    </div>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                      {item.unitSubtitle}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-space-sm">
                                <span className="font-label-md text-label-md text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded">
                                  {item.sku}
                                </span>
                              </td>

                              <td className="py-3.5 px-space-sm">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-surface-container-low font-medium ${
                                    item.category === 'tubers' || item.category === 'bundles'
                                      ? 'text-secondary'
                                      : 'text-primary'
                                  }`}
                                >
                                  {item.categoryLabel}
                                </span>
                              </td>

                              <td className="py-3.5 px-space-sm">
                                <span className="font-title-md text-title-md text-on-surface">
                                  ₹{item.mandiCost}
                                  <span className="text-label-sm text-on-surface-variant font-normal">
                                    /{item.unit}
                                  </span>
                                </span>
                              </td>

                              <td className="py-3.5 px-space-sm">
                                <span className="font-title-md text-title-md text-primary font-bold">
                                  ₹{item.retailPrice}
                                  <span className="text-label-sm text-on-surface-variant font-normal">
                                    /{item.unit}
                                  </span>
                                </span>
                              </td>

                              <td className="py-3.5 px-space-sm">
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                                      parseFloat(spreadPct) >= 35
                                        ? 'bg-primary-fixed text-on-primary-fixed'
                                        : parseFloat(spreadPct) <= 22
                                        ? 'bg-surface-container text-tertiary'
                                        : 'bg-surface-container-high text-primary'
                                    }`}
                                  >
                                    +{spreadPct}%
                                  </span>
                                  <span
                                    className={`material-symbols-outlined text-body-md ${
                                      parseFloat(spreadPct) <= 22
                                        ? 'text-secondary'
                                        : 'text-primary'
                                    }`}
                                  >
                                    {parseFloat(spreadPct) <= 22 ? 'trending_flat' : 'trending_up'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-space-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-surface-container rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        item.bufferPct <= 6 ? 'bg-secondary' : 'bg-primary'
                                      }`}
                                      style={{ width: `${Math.min(100, item.bufferPct * 5)}%` }}
                                    />
                                  </div>
                                  <span
                                    className={`font-label-sm text-label-sm font-semibold ${
                                      item.bufferPct <= 6 ? 'text-secondary' : 'text-on-surface'
                                    }`}
                                  >
                                    {item.bufferPct}%
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-space-sm text-center">
                                <button
                                  onClick={() => toggleCatalogueStatus(item.id)}
                                  className={`px-3 py-1 rounded-full text-label-sm font-label-sm font-bold shadow-sm transition-all inline-flex items-center gap-1 ${
                                    item.active
                                      ? 'bg-primary-fixed text-on-primary-fixed'
                                      : 'bg-surface-container-highest text-on-surface-variant'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      item.active ? 'bg-primary' : 'bg-outline'
                                    }`}
                                  />
                                  <span>{item.active ? 'Active' : 'Resting'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-space-md text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEditDrawer(item)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors"
                                    title="Edit Produce Item"
                                  >
                                    <span className="material-symbols-outlined text-title-md">
                                      edit
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => setActiveView('daily-mandi-rate-manipulation')}
                                    className="p-1.5 rounded-lg hover:bg-surface-container text-secondary transition-colors"
                                    title="Quick Price Adjustment"
                                  >
                                    <span className="material-symbols-outlined text-title-md">
                                      price_change
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => openEditDrawer(item)}
                                    className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                                    title="More Options"
                                  >
                                    <span className="material-symbols-outlined text-title-md">
                                      more_vert
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Pagination & Audit Footer */}
                  <div className="px-space-md py-space-sm bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-body-md text-secondary">
                        history
                      </span>
                      <span>
                        Audit Stamp: Last edited by Admin (A. Verma) 2 hrs ago • Batch locked at
                        23:59 IST
                      </span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span className="text-on-surface-variant font-label-sm text-label-sm">
                        Page 1 of 6
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 rounded-lg bg-surface-container text-on-surface-variant opacity-50"
                          disabled
                        >
                          <span className="material-symbols-outlined text-title-md">
                            chevron_left
                          </span>
                        </button>
                        <button className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">
                          1
                        </button>
                        <button
                          onClick={() => showToast('Loaded Catalogue Page 2')}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm"
                        >
                          2
                        </button>
                        <button
                          onClick={() => showToast('Loaded Catalogue Page 3')}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm"
                        >
                          3
                        </button>
                        <button
                          onClick={() => showToast('Loaded Catalogue Page 2')}
                          className="p-1 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-title-md">
                            chevron_right
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* =============================================================== */}
            {/* ADMIN VIEW 2: DAILY MANDI & RATES (Image 21.png / HTML 2)       */}
            {/* =============================================================== */}
            {activeView === 'daily-mandi-rate-manipulation' && (
              <>
                {/* Top Context Header & Countdown Strip */}
                <div className="flex flex-col gap-space-sm pt-space-md mb-space-lg">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
                    <div>
                      <div className="flex items-center gap-space-xs mb-1">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                          Price Governor • Regional Mandi Engine
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Hub: Dubagga Terminal 01
                        </span>
                      </div>
                      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                        Daily Mandi & Rate Manipulation Engine
                      </h1>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                        Dynamic Price Overrides, Margin Guardrails & Society-Wise Rate Locks
                      </p>
                    </div>

                    <div className="flex items-center gap-space-xs self-start lg:self-auto">
                      <button
                        onClick={() =>
                          showToast(
                            'Polling Dubagga & Sitapur Mandi API... Latest wholesale lots verified at 04:30 AM.'
                          )
                        }
                        className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-title-md text-title-md transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-title-md text-primary">
                          sync_alt
                        </span>
                        <span>Pull Mandi Feed</span>
                      </button>

                      <button
                        onClick={lockAllGovernorRates}
                        className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-title-md transition-all shadow-md hover:bg-primary-container"
                      >
                        <span className="material-symbols-outlined text-title-md">lock_clock</span>
                        <span>Lock Batch Cut-off Rates</span>
                      </button>
                    </div>
                  </div>

                  {/* Cut-off Status Ambient Strip */}
                  <div className="mt-space-xs bg-surface-container rounded-xl p-space-sm px-space-md flex flex-wrap items-center justify-between gap-space-sm shadow-sm">
                    <div className="flex items-center gap-space-sm">
                      <span className="inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-label-md text-label-md text-on-surface font-bold">
                          Tonight Cut-off: 12:00 AM
                        </span>
                        <span className="text-on-surface-variant font-body-md text-body-md">•</span>
                        <span className="font-body-md text-body-md text-on-surface-variant">
                          Eldeco Elegance Pilot (#LKO-24)
                        </span>
                        <span className="text-on-surface-variant font-body-md text-body-md">•</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                          OPEN FOR EDITING
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-xs text-on-surface tabular-nums">
                      <span className="material-symbols-outlined text-secondary text-title-md">
                        timelapse
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Editing auto-locks in:
                      </span>
                      <span className="font-label-lg text-label-lg text-secondary">
                        {formatCountdown(secondsLeft)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Bento Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl tabular-nums">
                  {/* Card 1 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                          Projected Society Demand
                        </span>
                        <div className="flex items-baseline gap-space-xs mt-1">
                          <span className="font-headline-lg text-headline-lg text-primary tracking-tight">
                            248.5
                          </span>
                          <span className="font-title-md text-title-md text-on-surface-variant">
                            kg
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-title-lg">
                          shopping_basket
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                      <span className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-label-md">
                          check_circle
                        </span>{' '}
                        78 orders pooled
                      </span>
                      <span className="bg-surface-container px-2 py-0.5 rounded-full text-on-surface font-medium">
                        Avg 3.18 kg / basket
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                          Target Gross Margin
                        </span>
                        <div className="flex items-baseline gap-space-xs mt-1">
                          <span className="font-headline-lg text-headline-lg text-primary tracking-tight">
                            33.4%
                          </span>
                          <span className="font-label-sm text-label-sm text-primary font-bold bg-primary-fixed px-1.5 py-0.5 rounded-md">
                            +2.1% vs yest
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-title-lg">pie_chart</span>
                      </div>
                    </div>
                    <div className="mt-space-md pt-space-xs flex flex-col gap-1">
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                        <div className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
                      </div>
                      <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm">
                        <span>Min Guardrail: 25.0%</span>
                        <span className="text-primary font-bold">Safety buffer: 8.4%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                          Sourcing Benchmark
                        </span>
                        <div className="flex items-baseline gap-space-xs mt-1">
                          <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
                            Dubagga & Sitapur
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-title-lg">storefront</span>
                      </div>
                    </div>
                    <div className="mt-space-md pt-space-xs flex items-center justify-between font-label-sm text-label-sm">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span> Live
                        Synced: 04:30 AM
                      </span>
                      <span className="text-secondary font-bold">Auction Verified</span>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                          Price Overrides Active
                        </span>
                        <div className="flex items-baseline gap-space-xs mt-1">
                          <span className="font-headline-lg text-headline-lg text-secondary tracking-tight">
                            6
                          </span>
                          <span className="font-title-md text-title-md text-on-surface-variant">
                            SKUs updated today
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-title-lg">tune</span>
                      </div>
                    </div>
                    <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                      <span>Total catalogue: 42 items</span>
                      <span className="font-bold text-on-surface">36 on Auto-Formula</span>
                    </div>
                  </div>
                </div>

                {/* Rate Manipulation & Bulk Override Matrix */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md mb-space-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">
                        Live SKU Price Governor
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Adjust customer-facing rates per kg/bunch. Auto-calculates society landed
                        cost and margin guardrail alert.
                      </p>
                    </div>

                    {/* Quick Global Macros */}
                    <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl">
                      <span className="font-label-sm text-label-sm text-on-surface-variant px-2 uppercase font-bold">
                        Bulk Macros:
                      </span>
                      <button
                        onClick={applyMonsoonBufferMacro}
                        className="px-space-sm py-1.5 rounded-lg bg-surface hover:bg-surface-container text-primary font-title-md text-title-md transition-all shadow-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-label-md">umbrella</span>
                        <span>+5% Monsoon Buffer</span>
                      </button>
                      <button
                        onClick={applyMatchInstamartMacro}
                        className="px-space-sm py-1.5 rounded-lg bg-surface hover:bg-surface-container text-primary font-title-md text-title-md transition-all shadow-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-label-md">equalizer</span>
                        <span>Match Instamart -15%</span>
                      </button>
                      <button
                        onClick={applyResetFormulaMacro}
                        className="px-space-sm py-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant font-title-md text-title-md transition-all shadow-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-label-md">restart_alt</span>
                        <span>Reset to Base Sourcing</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters & Search Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
                    <div className="flex items-center gap-space-xs flex-1 max-w-md bg-surface px-space-sm py-1.5 rounded-lg shadow-sm">
                      <span className="material-symbols-outlined text-on-surface-variant text-title-md">
                        search
                      </span>
                      <input
                        value={governorSearch}
                        onChange={(e) => setGovernorSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
                        placeholder="Search produce (e.g. Desi Palak, Safeda, Bhindi, Tamatar)..."
                        type="text"
                      />
                    </div>

                    <div className="flex items-center gap-space-xs">
                      {[
                        { id: 'all', label: 'All Produce (8)' },
                        { id: 'leafy', label: 'Leafy Greens (Desi)' },
                        { id: 'gourds', label: 'Gourds & Okra' },
                        { id: 'roots', label: 'Roots & Tubers' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setGovernorCategory(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors ${
                            governorCategory === tab.id
                              ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                              : 'bg-surface hover:bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Price Table */}
                  <div className="overflow-x-auto -mx-space-lg px-space-lg">
                    <table className="w-full text-left min-w-[1040px] tabular-nums">
                      <thead>
                        <tr className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                          <th className="py-space-sm px-space-md rounded-l-lg">
                            Item / Origin Belt
                          </th>
                          <th className="py-space-sm px-space-sm">Mandi Rate (₹/kg)</th>
                          <th className="py-space-sm px-space-sm">Wastage / Sort %</th>
                          <th className="py-space-sm px-space-sm">Cost to Society</th>
                          <th className="py-space-sm px-space-md text-primary font-bold">
                            Selling Price (₹)
                          </th>
                          <th className="py-space-sm px-space-sm">Gross Margin</th>
                          <th className="py-space-sm px-space-sm">Quick-Com Benchmark</th>
                          <th className="py-space-sm px-space-sm">Society Benefit</th>
                          <th className="py-space-sm px-space-md text-right rounded-r-lg">
                            Lock / Sync Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md divide-y divide-surface-container">
                        {filteredGovernorSkus.map((row) => {
                          const effectiveCost = row.mandiRate * (1 + row.wastagePct / 100);
                          const grossMargin =
                            row.sellingPrice > 0
                              ? ((row.sellingPrice - effectiveCost) / row.sellingPrice) * 100
                              : 0;
                          const savingsAmt = Math.round(row.benchmarkPrice - row.sellingPrice);
                          const savingsPct = Math.round(
                            ((row.benchmarkPrice - row.sellingPrice) / row.benchmarkPrice) * 100
                          );

                          return (
                            <tr
                              key={row.sku}
                              className="hover:bg-surface-container-low transition-colors"
                            >
                              <td className="py-space-md px-space-md">
                                <div className="flex items-center gap-space-sm">
                                  <div
                                    className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${
                                      row.iconStyle === 'secondary'
                                        ? 'bg-secondary-container/30 text-secondary'
                                        : row.iconStyle === 'tertiary'
                                        ? 'bg-surface-container text-tertiary'
                                        : 'bg-surface-container text-primary'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-headline-sm">
                                      {row.icon}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-title-md text-title-md text-on-surface leading-tight font-bold">
                                      {row.name}
                                    </span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                      {row.originSubtitle}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-space-md px-space-sm">
                                <div className="flex flex-col">
                                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                                    ₹{row.mandiRate.toFixed(2)}
                                  </span>
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    {row.mandiLotNote}
                                  </span>
                                </div>
                              </td>

                              <td className="py-space-md px-space-sm">
                                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                                  {row.wastageLabel}
                                </span>
                              </td>

                              <td className="py-space-md px-space-sm font-mono text-on-surface font-medium">
                                ₹{effectiveCost.toFixed(2)}
                              </td>

                              <td className="py-space-md px-space-md">
                                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl max-w-[140px] shadow-sm">
                                  <button
                                    onClick={() =>
                                      updateGovernorPrice(row.sku, row.sellingPrice - row.step)
                                    }
                                    className="w-7 h-7 rounded-lg bg-surface hover:bg-surface-container flex items-center justify-center text-primary font-bold shadow-sm transition-all"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={row.sellingPrice}
                                    onChange={(e) =>
                                      updateGovernorPrice(row.sku, parseFloat(e.target.value) || 1)
                                    }
                                    className="w-12 text-center bg-transparent border-0 outline-none font-title-lg text-title-lg text-primary font-bold"
                                  />
                                  <button
                                    onClick={() =>
                                      updateGovernorPrice(row.sku, row.sellingPrice + row.step)
                                    }
                                    className="w-7 h-7 rounded-lg bg-surface hover:bg-surface-container flex items-center justify-center text-primary font-bold shadow-sm transition-all"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="py-space-md px-space-sm">
                                {grossMargin >= 28 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                                    <span className="material-symbols-outlined text-label-sm">
                                      trending_up
                                    </span>{' '}
                                    {grossMargin.toFixed(1)}%
                                  </span>
                                ) : grossMargin >= 15 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                                    <span className="material-symbols-outlined text-label-sm">
                                      warning
                                    </span>{' '}
                                    {grossMargin.toFixed(1)}% (Tight)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                                    <span className="material-symbols-outlined text-label-sm">
                                      error
                                    </span>{' '}
                                    {grossMargin.toFixed(1)}% (Low)
                                  </span>
                                )}
                              </td>

                              <td className="py-space-md px-space-sm">
                                <div className="flex flex-col">
                                  <span className="font-title-md text-title-md text-on-surface-variant font-semibold">
                                    ₹{row.benchmarkPrice.toFixed(2)} / {row.benchmarkUnit}
                                  </span>
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    {row.benchmarkStore}
                                  </span>
                                </div>
                              </td>

                              <td className="py-space-md px-space-sm">
                                <div className="flex flex-col">
                                  <span
                                    className={`font-title-md text-title-md font-bold ${
                                      savingsAmt > 0 ? 'text-primary' : 'text-secondary'
                                    }`}
                                  >
                                    {savingsAmt > 0
                                      ? `Save ₹${savingsAmt} (${savingsPct}%)`
                                      : `At Par (+₹${Math.abs(savingsAmt)})`}
                                  </span>
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    {row.benefitNote}
                                  </span>
                                </div>
                              </td>

                              <td className="py-space-md px-space-md text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => toggleGovernorLock(row.sku)}
                                    className="p-2 rounded-lg bg-surface hover:bg-surface-container text-primary transition-all shadow-sm"
                                    title="Toggle Rate Lock"
                                  >
                                    <span
                                      className={`material-symbols-outlined text-title-md ${
                                        row.locked ? 'text-secondary font-bold' : 'text-primary'
                                      }`}
                                    >
                                      {row.locked ? 'lock' : 'lock_open'}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      showToast(
                                        `Push alert sent for ${row.name}: In-cart pre-orders notified.`
                                      )
                                    }
                                    className="p-2 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface transition-all shadow-sm"
                                    title="Push in-cart price update"
                                  >
                                    <span className="material-symbols-outlined text-title-md">
                                      send
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Safety Safeguard Banner & Audit Trail Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mb-space-lg">
                  {/* Left Guardrail Card */}
                  <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
                    <div className="flex flex-col gap-space-sm">
                      <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                        <span className="material-symbols-outlined text-title-lg">
                          shield_with_heart
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                        Post-9:00 PM Safety Guardrail
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Taazi Tokari guarantees resident transparent trust. Any rate adjustments
                        submitted after{' '}
                        <span className="font-bold text-on-surface">09:00 PM IST</span>{' '}
                        automatically push an in-cart notification prompting residents to
                        acknowledge price differences before midnight lock.
                      </p>
                      <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-1 text-on-surface-variant font-label-sm text-label-sm mt-space-xs tabular-nums">
                        <div className="flex items-center justify-between">
                          <span className="text-on-surface font-semibold">
                            Active Pre-order Carts:
                          </span>
                          <span className="font-mono text-primary font-bold">54 carts locked</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-on-surface font-semibold">
                            Auto-Approval Ceiling:
                          </span>
                          <span className="font-mono text-on-surface">± ₹6.00 / kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-on-surface font-semibold">Audit Mandatory:</span>
                          <span className="text-secondary font-bold">Yes • OTP SuperAdmin</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-space-md pt-space-xs">
                      <button
                        onClick={() =>
                          showToast('Opened Dubagga Mandi Auction Receipts (#LOT-24-0901).')
                        }
                        className="w-full py-2.5 px-space-md rounded-xl bg-surface hover:bg-surface-container-low text-primary font-title-md text-title-md flex items-center justify-center gap-space-xs transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-title-md">
                          receipt_long
                        </span>
                        <span>View Sourcing Mandi Receipts</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Audit Log */}
                  <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-space-md pb-space-xs">
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                          Mandi Price Audit Log
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Real-time ledger of today's rate adjustments and mandate reasoning
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                        Last {auditLogs.length} logged edits
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left tabular-nums">
                        <thead>
                          <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                            <th className="py-2.5 px-space-sm rounded-l-lg">Time (IST)</th>
                            <th className="py-2.5 px-space-sm">Produce SKU</th>
                            <th className="py-2.5 px-space-sm">Shift</th>
                            <th className="py-2.5 px-space-sm">Operator</th>
                            <th className="py-2.5 px-space-sm rounded-r-lg">Mandate Reason</th>
                          </tr>
                        </thead>
                        <tbody className="font-body-md text-body-md divide-y divide-surface-container">
                          {auditLogs.map((log, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-surface-container-low/50 transition-colors"
                            >
                              <td className="py-2.5 px-space-sm font-mono text-label-sm text-on-surface-variant">
                                {log.time}
                              </td>
                              <td className="py-2.5 px-space-sm font-bold text-on-surface">
                                {log.sku}
                              </td>
                              <td className="py-2.5 px-space-sm">
                                <span className="text-on-surface-variant line-through text-label-sm">
                                  ₹{log.oldPrice}
                                </span>
                                <span className="text-primary font-bold ml-1">
                                  → ₹{log.newPrice}
                                </span>
                              </td>
                              <td className="py-2.5 px-space-sm text-on-surface font-medium">
                                {log.operator}
                              </td>
                              <td className="py-2.5 px-space-sm">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                                    log.reasonStyle === 'primary'
                                      ? 'bg-primary-fixed text-on-primary-fixed'
                                      : log.reasonStyle === 'secondary'
                                      ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                                      : 'bg-surface-container text-on-surface-variant'
                                  }`}
                                >
                                  {log.reason}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* =============================================================== */}
            {/* ADMIN VIEW 3: PAYMENT & SETTLEMENTS (Image 23.png / HTML 3)     */}
            {/* =============================================================== */}
            {activeView === 'payment-gateway-settlement' && (
              <>
                <section className="flex flex-col gap-space-sm pt-space-md pb-space-lg">
                  <div className="flex flex-wrap items-center justify-between gap-space-md">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                        <span>Settlements & Treasury</span>
                        <span>•</span>
                        <span className="text-primary font-bold">Node #LKO-EAST-01</span>
                      </div>
                      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                        Payment Gateway & Financial Settlement
                      </h1>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Razorpay / Cashfree Webhook Ingestion, UPI Settlement & Auto-Refund Ledger
                      </p>
                    </div>

                    {/* Live Webhook & Health Pill Badge */}
                    <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        <div className="flex flex-col">
                          <span className="font-title-md text-title-md text-on-surface leading-tight">
                            Razorpay Production
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Operational (Latency 142ms)
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-surface-container-highest mx-1"></div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-primary">
                          <span className="material-symbols-outlined text-title-md">verified</span>
                          <span className="font-label-lg text-label-lg">100% Ingestion</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          0 drops (Last 24h)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setGatewaySpinning(true);
                          setTimeout(() => {
                            setGatewaySpinning(false);
                            showToast(
                              'Gateway Synced: 0 new unacknowledged webhooks found in Razorpay event queue.'
                            );
                          }, 600);
                        }}
                        className="ml-space-xs p-2 rounded-lg bg-surface hover:bg-surface-container text-on-surface transition-all flex items-center justify-center"
                      >
                        <span
                          className={`material-symbols-outlined text-title-lg text-primary ${
                            gatewaySpinning ? 'animate-spin' : ''
                          }`}
                        >
                          sync
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* FILTER BAR */}
                  <div className="mt-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <div className="flex items-center bg-surface-container p-0.5 rounded-lg">
                        {(['today', 'yesterday', 'custom'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setDateRangeTab(t)}
                            className={`px-space-sm py-1.5 rounded-md font-label-md text-label-md capitalize transition-colors flex items-center gap-1 ${
                              dateRangeTab === t
                                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                                : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            <span>{t}</span>
                            {t === 'custom' && (
                              <span className="material-symbols-outlined text-sm">
                                calendar_month
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="h-6 w-px bg-surface-container mx-1"></div>

                      <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface">
                        <span className="material-symbols-outlined text-primary text-title-md mr-1.5">
                          apartment
                        </span>
                        <span className="font-label-md text-label-md font-medium mr-1 text-on-surface-variant">
                          Society:
                        </span>
                        <span className="font-label-lg text-label-lg">
                          Eldeco Elegance (#LKO-24)
                        </span>
                        <span className="material-symbols-outlined text-body-md ml-1 text-on-surface-variant">
                          arrow_drop_down
                        </span>
                      </div>

                      <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-title-md mr-1.5">
                          check_circle
                        </span>
                        <span className="font-label-md text-label-md font-medium mr-1 text-on-surface-variant">
                          Status:
                        </span>
                        <span className="font-label-lg text-label-lg">All Statuses</span>
                        <span className="material-symbols-outlined text-body-md ml-1 text-on-surface-variant">
                          arrow_drop_down
                        </span>
                      </div>

                      <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface">
                        <span className="material-symbols-outlined text-on-surface-variant text-title-md mr-1.5">
                          payments
                        </span>
                        <span className="font-label-md text-label-md font-medium mr-1 text-on-surface-variant">
                          Mode:
                        </span>
                        <span className="font-label-lg text-label-lg">UPI & Gateway</span>
                        <span className="material-symbols-outlined text-body-md ml-1 text-on-surface-variant">
                          arrow_drop_down
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={() =>
                          showToast('Downloaded T+1 Bank Settlement Ledger (ICICI #ICICR24090123).')
                        }
                        className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-title-md">
                          file_download
                        </span>
                        <span>Export T+1 Ledger</span>
                      </button>
                      <button
                        onClick={() => setAuditDrawerOpen(true)}
                        className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-title-md">terminal</span>
                        <span>Live Webhooks</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* FINANCIAL KPI SUMMARY CARDS */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-sm mb-space-lg tabular-nums">
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wide">
                        Total Collected (Today)
                      </span>
                      <span className="p-1.5 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-title-md">
                          account_balance_wallet
                        </span>
                      </span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="font-headline-md text-headline-md text-primary font-bold">
                        ₹18,450.00
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-primary">
                        <span className="material-symbols-outlined text-label-sm">
                          verified_user
                        </span>
                        <span className="font-label-sm text-label-sm">
                          100% Prepaid via UPI/Gateway
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs bg-surface-container-low rounded-lg p-1.5 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Batches: 2 morning drop</span>
                      <span className="text-on-surface font-semibold">48 txns</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wide">
                        Settled to Bank
                      </span>
                      <span className="p-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                        <span className="material-symbols-outlined text-title-md">
                          account_balance
                        </span>
                      </span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="font-headline-md text-headline-md text-on-surface font-bold">
                        ₹14,210.00
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-label-sm">schedule</span>
                        <span className="font-label-sm text-label-sm">
                          ICICI Current A/c (T+1 08:00 AM)
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs bg-surface-container-low rounded-lg p-1.5 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>UTR: #ICICR24090123</span>
                      <span className="text-primary font-semibold">Clearing</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wide">
                        Gateway Processing Fee
                      </span>
                      <span className="p-1.5 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center">
                        <span className="material-symbols-outlined text-title-md">
                          price_change
                        </span>
                      </span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="font-headline-md text-headline-md text-on-surface font-bold">
                        ₹369.00
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                        <span className="font-label-sm text-label-sm">
                          2.0% Effective GST inclusive
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs bg-surface-container-low rounded-lg p-1.5 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>UPI: ₹0 fee Tier</span>
                      <span className="text-secondary font-semibold">Cards: 1.8%</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wide">
                        Pending / Reconciling
                      </span>
                      <span className="p-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                        <span className="material-symbols-outlined text-title-md">
                          hourglass_top
                        </span>
                      </span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="font-headline-md text-headline-md text-secondary font-bold">
                        {verifiedPendingOrder ? '₹0.00' : '₹420.00'}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-secondary">
                        <span className="material-symbols-outlined text-label-sm">
                          sync_problem
                        </span>
                        <span className="font-label-sm text-label-sm">
                          {verifiedPendingOrder ? '0 pending' : '1 pending confirmation'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs bg-secondary-fixed/40 rounded-lg p-1.5 flex items-center justify-between font-label-sm text-label-sm text-on-secondary-container">
                      <span>Poll retry in: 02m 14s</span>
                      <button
                        onClick={() =>
                          showToast(
                            'Inspecting #LKO-ORD-2037 (₹420.00): BHIM UPI callback verified.'
                          )
                        }
                        className="font-semibold underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm uppercase tracking-wide">
                        QC Shortage Refunds
                      </span>
                      <span className="p-1.5 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-title-md">
                          published_with_changes
                        </span>
                      </span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="font-headline-md text-headline-md text-on-surface font-bold">
                        ₹185.00
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                        <span className="font-label-sm text-label-sm">
                          2 QC shortage adjustments
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs bg-surface-container-low rounded-lg p-1.5 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Instant UPI route</span>
                      <span className="text-primary font-semibold">100% Settled</span>
                    </div>
                  </div>
                </section>

                {/* MIDDLE SECTION: GATEWAY CONFIG & BATCH LIQUIDITY VISUALIZATION */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
                  <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-space-sm">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-primary text-headline-sm">
                            security
                          </span>
                          <h2 className="font-title-lg text-title-lg text-on-surface">
                            Payment Gateway Engine & Webhook Guard
                          </h2>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                          HMAC-SHA256 Enforced
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                        Incoming payments are ingested via webhook endpoints. Auto-refund rules
                        compensate residents instantly for warehouse scale discrepancies during
                        04:00 AM sorting.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm mb-space-md">
                        <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                              Primary Gateway
                            </span>
                            <span className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Primary
                              Live
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="font-title-md text-title-md text-on-surface font-mono">
                              rzp_live_...92a1
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                              Razorpay Custom Routing
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              Webhook Secret:
                            </span>
                            <span className="font-label-sm text-label-sm text-primary font-mono bg-surface px-1.5 py-0.5 rounded">
                              active_v2_9f
                            </span>
                          </div>
                        </div>

                        <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                              Backup Gateway
                            </span>
                            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Warm
                              Standby
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="font-title-md text-title-md text-on-surface font-mono">
                              cf_app_...84c0
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                              Cashfree Auto-Failover
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              Failover Threshold:
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold bg-surface px-1.5 py-0.5 rounded">
                              &gt; 3 timeouts/min
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-space-sm rounded-xl bg-surface-container flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-title-lg mt-0.5">
                          scale
                        </span>
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-title-md text-title-md text-on-surface font-semibold">
                              Autonomous Weight Shortage Refund Rule
                            </span>
                            <span className="font-label-sm text-label-sm text-primary font-bold">
                              ENABLED
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                            If weighed produce at Lucknow Hub varies by &gt;50g under target lot,
                            system issues an instant partial UPI credit back to the resident's VPA
                            within 120 seconds of bin packing.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-space-md pt-space-sm flex items-center justify-between font-label-md text-label-md">
                      <span className="text-on-surface-variant">
                        Last signature rotation: 12 Aug 2024
                      </span>
                      <button
                        onClick={() =>
                          showToast(
                            'Auto-Refund Tolerance Policy: >50g variance triggers instant Razorpay UPI reversal.'
                          )
                        }
                        className="text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Edit Policy Parameters</span>
                        <span className="material-symbols-outlined text-title-md">tune</span>
                      </button>
                    </div>
                  </div>

                  {/* Right 5 Cols: Sourcing Cashflow & Settlement Timeline Sparkline */}
                  <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-space-xs">
                        <h2 className="font-title-lg text-title-lg text-on-surface">
                          Mandi vs Residential Sourcing Flow
                        </h2>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Today's Aggregation
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                        Settlement pipeline against Dubagga Mandi wholesale payout schedule
                      </p>

                      <div className="bg-surface-container-low p-space-sm rounded-xl mb-space-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            Pre-order Settlement Ratio
                          </span>
                          <span className="font-label-lg text-label-lg text-primary font-mono">
                            92.4% Liquid
                          </span>
                        </div>
                        <svg className="w-full h-20 text-primary" viewBox="0 0 360 85">
                          <line
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            strokeOpacity="0.1"
                            x1="10"
                            x2="350"
                            y1="20"
                            y2="20"
                          />
                          <line
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            strokeOpacity="0.1"
                            x1="10"
                            x2="350"
                            y1="50"
                            y2="50"
                          />
                          <line
                            stroke="currentColor"
                            strokeDasharray="3 3"
                            strokeOpacity="0.1"
                            x1="10"
                            x2="350"
                            y1="80"
                            y2="80"
                          />
                          <path
                            d="M 15 70 Q 60 62 100 45 T 190 35 T 270 20 T 345 12 L 345 80 L 15 80 Z"
                            fill="currentColor"
                            fillOpacity="0.15"
                          />
                          <path
                            d="M 15 70 Q 60 62 100 45 T 190 35 T 270 20 T 345 12"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                          />
                          <circle cx="15" cy="70" fill="#1e4b33" r="3" />
                          <circle cx="100" cy="45" fill="#1e4b33" r="3" />
                          <circle cx="190" cy="35" fill="#1e4b33" r="3" />
                          <circle cx="270" cy="20" fill="#1e4b33" r="3" />
                          <circle cx="345" cy="12" fill="#835400" r="4" />
                        </svg>
                        <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant mt-1">
                          <span>04:00 AM (Mandi Open)</span>
                          <span>12:00 PM (Midday)</span>
                          <span>20:00 PM (Cut-off Peak)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-space-xs mt-space-sm font-label-md text-label-md tabular-nums">
                        <div className="p-space-xs rounded-lg bg-surface-container flex flex-col">
                          <span className="text-on-surface-variant font-label-sm text-label-sm">
                            Farmer Direct Payout:
                          </span>
                          <span className="text-on-surface font-bold text-title-md mt-0.5">
                            ₹11,820.00
                          </span>
                        </div>
                        <div className="p-space-xs rounded-lg bg-surface-container flex flex-col">
                          <span className="text-on-surface-variant font-label-sm text-label-sm">
                            Society Margin Pool:
                          </span>
                          <span className="text-primary font-bold text-title-md mt-0.5">
                            ₹6,261.00
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                      <span>Verified by Taazi Tokari Automated Reconciliation Worker</span>
                      <span className="text-primary font-semibold">T+1 Compliant</span>
                    </div>
                  </div>
                </section>

                {/* LIVE TRANSACTIONS & SETTLEMENT LEDGER TABLE */}
                <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-space-md bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-title-lg">
                        receipt_long
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">
                        Live Ingestion & Transaction Ledger
                      </h2>
                      <span className="ml-space-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                        5 Transactions Shown
                      </span>
                    </div>

                    <div className="flex items-center gap-space-xs">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-title-md">
                          search
                        </span>
                        <input
                          value={ledgerSearch}
                          onChange={(e) => setLedgerSearch(e.target.value)}
                          className="pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-surface focus:outline-none transition-all w-64"
                          placeholder="Search Order ID, Flat or Txn..."
                          type="text"
                        />
                      </div>
                      <button
                        onClick={() => setLedgerSearch('')}
                        className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-title-md">
                          filter_list
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left font-body-md text-body-md border-collapse tabular-nums">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                          <th className="py-space-sm px-space-md font-semibold">Order ID</th>
                          <th className="py-space-sm px-space-md font-semibold">Gateway Txn ID</th>
                          <th className="py-space-sm px-space-md font-semibold">
                            Customer & Society Flat
                          </th>
                          <th className="py-space-sm px-space-md font-semibold">Order Amount</th>
                          <th className="py-space-sm px-space-md font-semibold">Payment Mode</th>
                          <th className="py-space-sm px-space-md font-semibold">Gateway Status</th>
                          <th className="py-space-sm px-space-md font-semibold">
                            Webhook Timestamp
                          </th>
                          <th className="py-space-sm px-space-md font-semibold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ecf6eb]">
                        {/* Row 1: Amit Verma */}
                        <tr className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-space-md px-space-md">
                            <span className="font-label-lg text-label-lg text-primary font-mono font-bold">
                              #LKO-ORD-2041
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Batch #24-MORNING
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-mono text-label-md text-label-md text-on-surface font-medium">
                              pay_Ox9a18k2b9
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Razorpay Direct
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-title-md text-title-md text-on-surface">
                              Amit Verma
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Eldeco Elegance • Flat T1-804
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-title-lg text-title-lg text-on-surface font-semibold">
                              ₹342.00
                            </span>
                            <div className="font-label-sm text-label-sm text-primary">
                              Prepaid (Full)
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2 py-1 rounded-md bg-surface-container font-label-md text-label-md text-on-surface inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-primary">
                                smartphone
                              </span>
                              UPI (GPay)
                            </span>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              Succeeded
                            </span>
                          </td>
                          <td className="py-space-md px-space-md font-label-sm text-label-sm text-on-surface-variant">
                            <div>19:42:10 IST</div>
                            <div className="font-mono text-xs">2024-09-01</div>
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload('pay_Ox9a18k2b9', 'order.paid', 342)
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                                title="View Webhook Payload"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  code
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload('pay_Ox9a18k2b9', 'order.paid', 342)
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                                title="Audit Log"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  history
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 2: Priya Mishra */}
                        <tr className="bg-surface-container-low/20 hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-space-md px-space-md">
                            <span className="font-label-lg text-label-lg text-primary font-mono font-bold">
                              #LKO-ORD-2040
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Batch #24-MORNING
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-mono text-label-md text-label-md text-on-surface font-medium">
                              pay_Ox9a14j1a7
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Razorpay Direct
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-title-md text-title-md text-on-surface">
                              Priya Mishra
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Eldeco Elegance • Flat T3-201
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-title-lg text-title-lg text-on-surface font-semibold">
                              ₹510.00
                            </span>
                            <div className="font-label-sm text-label-sm text-primary">
                              Prepaid (Full)
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2 py-1 rounded-md bg-surface-container font-label-md text-label-md text-on-surface inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-primary">
                                smartphone
                              </span>
                              UPI (PhonePe)
                            </span>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              Succeeded
                            </span>
                          </td>
                          <td className="py-space-md px-space-md font-label-sm text-label-sm text-on-surface-variant">
                            <div>19:38:05 IST</div>
                            <div className="font-mono text-xs">2024-09-01</div>
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload('pay_Ox9a14j1a7', 'order.paid', 510)
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  code
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload('pay_Ox9a14j1a7', 'order.paid', 510)
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  history
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 3: Dr. Rastogi */}
                        <tr className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-space-md px-space-md">
                            <span className="font-label-lg text-label-lg text-primary font-mono font-bold">
                              #LKO-ORD-2039
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Batch #24-MORNING
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-mono text-label-md text-label-md text-on-surface font-medium">
                              pay_Ox9a09m8d2
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Visa ICICI Platinum
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-title-md text-title-md text-on-surface">
                              Dr. Rastogi
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Eldeco Elegance • Flat T2-603
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-title-lg text-title-lg text-on-surface font-semibold">
                              ₹285.00
                            </span>
                            <div className="font-label-sm text-label-sm text-primary">
                              Prepaid (Card)
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2 py-1 rounded-md bg-surface-container font-label-md text-label-md text-on-surface inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                                credit_card
                              </span>
                              Card (Visa)
                            </span>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              Succeeded
                            </span>
                          </td>
                          <td className="py-space-md px-space-md font-label-sm text-label-sm text-on-surface-variant">
                            <div>19:25:44 IST</div>
                            <div className="font-mono text-xs">2024-09-01</div>
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload('pay_Ox9a09m8d2', 'order.paid', 285)
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  code
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload('pay_Ox9a09m8d2', 'order.paid', 285)
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  history
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 4: Neha Gupta */}
                        <tr className="bg-surface-container-low/40 hover:bg-surface-container-low/70 transition-colors">
                          <td className="py-space-md px-space-md">
                            <span className="font-label-lg text-label-lg text-primary font-mono font-bold">
                              #LKO-ORD-2038
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Batch #24-MORNING
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-mono text-label-md text-label-md text-on-surface font-medium">
                              pay_Ox9a02z4k1
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Refund #rfnd_81729a
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-title-md text-title-md text-on-surface">
                              Neha Gupta
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Eldeco Elegance • Flat T4-102
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-title-lg text-title-lg text-on-surface font-semibold">
                              ₹185.00
                            </div>
                            <div className="font-label-sm text-label-sm text-tertiary">
                              ₹35 QC Shortage Refunded
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2 py-1 rounded-md bg-surface-container font-label-md text-label-md text-on-surface inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-primary">
                                smartphone
                              </span>
                              UPI (Direct)
                            </span>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                              Partial Refund
                            </span>
                          </td>
                          <td className="py-space-md px-space-md font-label-sm text-label-sm text-on-surface-variant">
                            <div>19:12:12 IST</div>
                            <div className="font-mono text-xs">2024-09-01</div>
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openWebhookDrawerWithPayload(
                                    'pay_Ox9a02z4k1',
                                    'refund.processed',
                                    35
                                  )
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  code
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  showToast(
                                    'Auto-Refund Audit: Neha Gupta (T4-102) refunded ₹35.00 for Desi Palak 70g shortage.'
                                  )
                                }
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface"
                              >
                                <span className="material-symbols-outlined text-title-md">
                                  receipt
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Row 5: Vivek Sharma */}
                        <tr className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-space-md px-space-md">
                            <span className="font-label-lg text-label-lg text-primary font-mono font-bold">
                              #LKO-ORD-2037
                            </span>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Batch #24-MORNING
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-mono text-label-md text-label-md text-on-surface font-medium">
                              pay_Ox8999q3b1
                            </span>
                            <div className="font-label-sm text-label-sm text-secondary">
                              {verifiedPendingOrder ? 'Razorpay Direct' : 'Awaiting Gateway Ping'}
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <div className="font-title-md text-title-md text-on-surface">
                              Vivek Sharma
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                              Eldeco Elegance • Flat T1-1102
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="font-title-lg text-title-lg text-on-surface font-semibold">
                              ₹420.00
                            </span>
                            <div className="font-label-sm text-label-sm text-secondary">
                              {verifiedPendingOrder ? 'Prepaid (Full)' : 'Verification in flight'}
                            </div>
                          </td>
                          <td className="py-space-md px-space-md">
                            <span className="px-2 py-1 rounded-md bg-surface-container font-label-md text-label-md text-on-surface inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm text-primary">
                                smartphone
                              </span>
                              UPI (BHIM)
                            </span>
                          </td>
                          <td className="py-space-md px-space-md">
                            {verifiedPendingOrder ? (
                              <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                Succeeded
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-space-md px-space-md font-label-sm text-label-sm text-on-surface-variant">
                            <div>18:59:22 IST</div>
                            <div className="font-mono text-xs">2024-09-01</div>
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setVerifiedPendingOrder(true);
                                  showToast(
                                    'Triggered Razorpay Fetch API check for pay_Ox8999q3b1: Captured!'
                                  );
                                }}
                                className="px-2.5 py-1 rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm hover:opacity-90 transition-opacity"
                              >
                                {verifiedPendingOrder ? 'Verified ✓' : 'Verify API'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm font-label-md text-label-md">
                    <div className="text-on-surface-variant">
                      Showing 1 to 5 of 48 orders settled today • Society:{' '}
                      <span className="text-on-surface font-semibold">Eldeco Elegance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant opacity-40"
                        disabled
                      >
                        Previous
                      </button>
                      <button className="px-3 py-1 rounded-lg bg-primary-container text-on-primary font-bold">
                        1
                      </button>
                      <button
                        onClick={() => showToast('Loaded Ledger Page 2')}
                        className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                      >
                        2
                      </button>
                      <button
                        onClick={() => showToast('Loaded Ledger Page 3')}
                        className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                      >
                        3
                      </button>
                      <button
                        onClick={() => showToast('Loaded Ledger Page 2')}
                        className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* =============================================================== */}
            {/* ADDITIONAL SIDEBAR VIEWS (Overview, Societies, Orders)          */}
            {/* =============================================================== */}
            {(activeView === 'overview-dashboard' ||
              activeView === 'societies-cut-off-config' ||
              activeView === 'orders-exceptions') && (
              <div className="pt-space-md flex flex-col gap-space-lg">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                      Lucknow Pilot Control Plane • Hub #LKO-EAST-01
                    </span>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-0.5">
                      {activeView === 'overview-dashboard'
                        ? 'Lucknow Pilot Operations Overview'
                        : activeView === 'societies-cut-off-config'
                        ? 'Residential Societies & Midnight Cut-offs'
                        : 'Live Society Orders & Delivery Exceptions'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveView('catalogue-inventory')}
                      className="px-4 py-2 rounded-xl bg-surface-container-high text-primary font-bold text-sm"
                    >
                      Open Catalogue Matrix
                    </button>
                    <button
                      onClick={() => setActiveView('daily-mandi-rate-manipulation')}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm"
                    >
                      Open Price Governor
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md tabular-nums">
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-[#e1ebe0]">
                    <span className="text-xs font-bold uppercase text-on-surface-variant">
                      Eldeco Elegance (#LKO-24)
                    </span>
                    <div className="text-2xl font-extrabold text-primary mt-1">
                      184 kg / 200 kg Pool
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">
                      62 flats pooled • Tier 2 Rebate (₹4.20/kg) Unlocked • Cut-off: 12:00 AM
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-[#e1ebe0]">
                    <span className="text-xs font-bold uppercase text-on-surface-variant">
                      Omaxe Residency 1 & 2 (#LKO-12)
                    </span>
                    <div className="text-2xl font-extrabold text-primary mt-1">
                      312 kg / 300 kg Pool
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">
                      94 flats pooled • Tier 3 Priority Drop Unlocked • Drop-off: 06:45 AM
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-[#e1ebe0]">
                    <span className="text-xs font-bold uppercase text-on-surface-variant">
                      Active Delivery Exception (#AM-84912)
                    </span>
                    <div className="text-2xl font-extrabold text-tertiary mt-1">
                      Tower B – Flat 204
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">
                      Rahul Verma • Door locked & intercom unreachable; held at Ground Lobby guard
                      desk.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===================================================================== */}
      {/* SLIDE-OVER DRAWER 1: CATALOGUE ADD / EDIT SKU                         */}
      {/* ===================================================================== */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-surface-container-lowest shadow-2xl flex flex-col justify-between h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-space-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-title-lg">edit_note</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {drawerMode === 'add'
                      ? 'Add New Produce SKU'
                      : `Edit Produce SKU: ${formSku}`}
                  </h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Taazi Tokari Daily Cut-off Configuration
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-title-lg">close</span>
              </button>
            </div>

            <div className="p-space-lg flex-1 overflow-y-auto flex flex-col gap-space-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Produce Name (English) *
                  </label>
                  <input
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                    placeholder="e.g. Desi Palak"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Local Hindi Vernacular *
                  </label>
                  <input
                    value={formNameHi}
                    onChange={(e) => setFormNameHi(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                    placeholder="e.g. देसी पालक"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    SKU Identifier
                  </label>
                  <input
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2 rounded-lg text-on-surface font-label-md text-label-md font-mono"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Category Segment
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  >
                    <option value="vegetables">Fresh Vegetables</option>
                    <option value="leafy">Leafy Greens</option>
                    <option value="tubers">Tubers & Roots</option>
                    <option value="exotic">Exotic Farm Specials</option>
                    <option value="bundles">Daily Kitchen Bundles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Base Sale Unit
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                  >
                    <option value="kg">1 kg</option>
                    <option value="500g">500 grams</option>
                    <option value="250g">250 grams</option>
                    <option value="bunch">Per Bunch</option>
                    <option value="pc">Per Piece (pc)</option>
                    <option value="pack">Custom Pack</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Procurement Buffer %
                  </label>
                  <div className="relative">
                    <input
                      value={formBuffer}
                      onChange={(e) => setFormBuffer(e.target.value)}
                      className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                      type="number"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-label-sm font-label-sm">
                      %
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    Max Flat Limit
                  </label>
                  <input
                    value={formMaxLimit}
                    onChange={(e) => setFormMaxLimit(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                    type="number"
                  />
                </div>
              </div>

              {/* Financial Real-Time Spread Calculator */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    Unit Pricing & Mandi Benchmarking
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded">
                    Mandi Auto-Synced
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Est Mandi Cost (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-title-md">
                        ₹
                      </span>
                      <input
                        value={formCost}
                        onChange={(e) => setFormCost(e.target.value)}
                        className="w-full bg-surface pl-8 pr-3 py-2 rounded-lg text-on-surface font-title-md text-title-md font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Consumer Pre-Order Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-title-md">
                        ₹
                      </span>
                      <input
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-surface pl-8 pr-3 py-2 rounded-lg text-primary font-title-md text-title-md font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-space-sm rounded-lg bg-surface flex items-center justify-between mt-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-title-md">
                      calculate
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Calculated Society Spread:
                    </span>
                  </div>
                  <span className="font-title-md text-title-md text-primary font-bold">
                    +{drawerSpreadPct}% (₹{drawerSpreadVal.toFixed(2)} / unit)
                  </span>
                </div>
              </div>

              {/* Photo & Harvest Stamp */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  Produce Asset & Origin Tag
                </label>
                <div className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low">
                  <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                    <img
                      src={HOTLINKED_IMAGES.pahadiAlooDrawer}
                      alt="Produce preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-primary font-bold">
                      Studio High-Res Asset Linked
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      800x800px studio agricultural finish
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-space-lg bg-surface-container-low flex items-center justify-between gap-space-md">
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-space-md py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest font-label-lg text-label-lg transition-colors"
              >
                Cancel & Discard
              </button>
              <button
                onClick={saveDrawerItem}
                className="flex-1 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-title-md">check_circle</span>
                <span>Save Produce & Push to Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SLIDE-OVER DRAWER 2: WEBHOOK STREAM & HMAC AUDIT LOG                  */}
      {/* ===================================================================== */}
      {auditDrawerOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setAuditDrawerOpen(false)}
        >
          <aside
            className="w-full max-w-xl bg-surface-container-lowest shadow-2xl h-full flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-space-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-headline-sm">
                  terminal
                </span>
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-surface leading-tight">
                    Webhook Stream & Audit Log
                  </h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    HMAC Signature Verification Real-time Stream
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditDrawerOpen(false)}
                className="p-2 rounded-lg bg-surface hover:bg-surface-container text-on-surface"
              >
                <span className="material-symbols-outlined text-title-md">close</span>
              </button>
            </div>

            <div className="p-space-lg overflow-y-auto flex-1 flex flex-col gap-space-md">
              <div className="bg-primary-fixed/30 p-space-sm rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <div>
                    <div className="font-title-md text-title-md text-primary font-bold">
                      HTTP 200 OK — Signature Matched
                    </div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">
                      Payload ingested in 38ms (Hash: sha256_3b7a90f...)
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-mono text-label-sm">
                  OK
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">
                    Latest Ingested Payload
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedJson ? 'done' : 'content_copy'}
                    </span>
                    <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-space-md rounded-xl bg-surface-container-highest font-mono text-label-md text-on-surface overflow-x-auto leading-relaxed">
                  {webhookPayloadJson}
                </pre>
              </div>

              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase">
                  Verification Checklist
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low font-label-md text-label-md">
                    <span className="text-on-surface">Header 'X-Razorpay-Signature'</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check</span> Present
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low font-label-md text-label-md">
                    <span className="text-on-surface">
                      Secret Verification ('rzp_live_...92a1')
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check</span> Valid Match
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-low font-label-md text-label-md">
                    <span className="text-on-surface">Idempotency Key Verification</span>
                    <span className="text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check</span> Unique Txn
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-space-md bg-surface-container-low flex items-center justify-between">
              <button
                onClick={() =>
                  showToast(
                    'Simulated Razorpay test ping to /api/webhooks/razorpay: HTTP 200 OK (31ms).'
                  )
                }
                className="px-space-md py-2 rounded-lg bg-surface hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-title-md">send</span>
                <span>Simulate Test Ping</span>
              </button>
              <button
                onClick={() => setAuditDrawerOpen(false)}
                className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-space-md py-3 rounded-xl shadow-xl flex items-center gap-space-sm z-50">
          <span className="material-symbols-outlined text-primary-fixed-dim text-title-lg">
            task_alt
          </span>
          <span className="font-title-md text-title-md">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
