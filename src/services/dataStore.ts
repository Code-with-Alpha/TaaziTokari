import { RESIDENT_PRODUCE_ITEMS, INITIAL_ADMIN_CATALOGUE, INITIAL_GOVERNOR_SKUS } from '../data/mockData';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  society: string;
  flat: string;
  status: 'PLACED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalPaise: number;
  savingsPaise: number;
  items: { productId: string; name: string; quantity: number; price: number }[];
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entity: string;
  actor: string;
  details: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  ORDERS: 'taazi_tokari_orders_v1',
  MANDI_RATES: 'taazi_tokari_mandi_rates_v1',
  INVENTORY: 'taazi_tokari_inventory_v1',
  AUDIT_LOGS: 'taazi_tokari_audit_logs_v1',
};

// Initial Seed Orders
const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-LKO-20261010-84920',
    customerName: 'Priya Sharma',
    phone: '+91 98765 43210',
    society: 'Eldeco Elegance',
    flat: 'Tower B - Flat 402',
    status: 'PLACED',
    totalPaise: 12900,
    savingsPaise: 4200,
    items: [
      { productId: 'desi-tomato', name: 'Desi Tomato (Tamatar)', quantity: 1, price: 38 },
      { productId: 'pahadi-aloo', name: 'Pahadi Aloo (Potato)', quantity: 2, price: 28 },
      { productId: 'desi-kheera', name: 'Desi Kheera (Cucumber)', quantity: 1, price: 35 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-LKO-20261010-84921',
    customerName: 'Vikram Singh',
    phone: '+91 98111 22233',
    society: 'Eldeco Elegance',
    flat: 'Tower B - Flat 405',
    status: 'PACKED',
    totalPaise: 9400,
    savingsPaise: 2800,
    items: [
      { productId: 'desi-palak', name: 'Desi Palak', quantity: 2, price: 22 },
      { productId: 'bhindi-okra', name: 'Bhindi', quantity: 1, price: 45 },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'log-001',
    action: 'CUTOFF_TRIGGERED',
    entity: 'Society: Eldeco Elegance',
    actor: 'System Auto-Governor',
    details: 'Midnight cut-off triggered. Aggregated 184 kg total demand for Sitapur Tamatar & Pahadi Aloo.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'log-002',
    action: 'PRICE_MODIFICATION',
    entity: 'SKU: Desi Tomato',
    actor: 'Amit Sharma (Admin)',
    details: 'Updated Mandi procurement target rate to ₹28/kg. Consumer retail capped at ₹38/kg.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const dataStore = {
  getOrders: (): OrderRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  createOrder: (order: Omit<OrderRecord, 'id' | 'createdAt'>): OrderRecord => {
    const orders = dataStore.getOrders();
    const newRecord: OrderRecord = {
      ...order,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...orders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

    // Create Audit Log
    dataStore.addAuditLog({
      action: 'ORDER_PLACED',
      entity: `Order #${newRecord.orderNumber}`,
      actor: newRecord.customerName,
      details: `Placed order for ${newRecord.items.length} SKUs worth ₹${(newRecord.totalPaise / 100).toFixed(2)}`,
    });

    return newRecord;
  },

  updateOrderStatus: (orderId: string, status: OrderRecord['status']) => {
    const orders = dataStore.getOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

    dataStore.addAuditLog({
      action: 'ORDER_STATUS_CHANGED',
      entity: `Order ID ${orderId}`,
      actor: 'Ops Team / System',
      details: `Status updated to ${status}`,
    });
  },

  getAuditLogs: (): AuditLogRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  addAuditLog: (log: Omit<AuditLogRecord, 'id' | 'timestamp'>) => {
    const logs = dataStore.getAuditLogs();
    const newRecord: AuditLogRecord = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...logs];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  },
};
