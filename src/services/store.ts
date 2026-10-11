// ==============================================================================
// TAAZI TOKARI (ताज़ी टोकरी) - PRODUCTION DATA STORE & REPOSITORY
// Persistent, typed storage with offline-first support, Supabase compatibility,
// weighted-average costing, inventory ledger, and order orchestration.
// ==============================================================================

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string[];
  minOrderFreeDelivery: number;
  deliveryFee: number;
  cutoffTime: string; // e.g. "22:00"
  isActive: boolean;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  flatNumber: string;
  blockBuilding: string;
  landmark?: string;
  zoneId: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  title: string;
  timeRange: string;
  description: string;
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  nameEn: string;
  nameHi: string;
  categorySlug: string;
  unit: string;
  price: number; // in INR
  mrp: number; // in INR
  stockQty: number; // in units/kg
  weightedCost: number; // weighted average cost per unit
  lowStockThreshold: number;
  isAvailable: boolean;
  isNewArrival: boolean;
  isPopular: boolean;
  isBestPrice: boolean;
  origin: string;
  topBadge?: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  changeQty: number; // positive for purchases, negative for sales
  balanceQtyAfter: number;
  reason: 'PURCHASE' | 'MANUAL_SALE' | 'ONLINE_ORDER' | 'WASTAGE' | 'ADJUSTMENT' | 'INITIAL';
  referenceId?: string;
  notes?: string;
  recordedBy: string;
  timestamp: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  totalCost: number; // INR
  unitCost: number; // INR auto-calculated
  supplierName?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface ManualSaleRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  sellingPrice: number; // INR per unit
  totalRevenue: number; // INR
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'TRANSPORT' | 'PACKAGING' | 'MARKET_TRAVEL' | 'WASTAGE' | 'UTILITIES' | 'OTHER';
  amount: number; // INR
  notes: string;
  recordedBy: string;
  createdAt: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  nameEn: string;
  nameHi: string;
  unit: string;
  price: number;
  mrp: number;
  quantity: number;
  itemTotal: number;
  imageUrl: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: CustomerAddress;
  deliverySlot: DeliverySlot;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  savingsTotal: number;
  grandTotal: number;
  paymentMethod: 'COD' | 'ONLINE_RAZORPAY';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  orderStatus: OrderStatus;
  deliveryNotes?: string;
  feedbackSubmitted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationOffer {
  id: string;
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'OFFER' | 'HARVEST_ALERT';
  bannerImageUrl?: string;
  actionText?: string;
  actionUrl?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export interface CustomerFeedback {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actor: string;
  details: string;
  timestamp: string;
}

// ==============================================================================
// STORAGE KEYS
// ==============================================================================
const STORAGE_KEYS = {
  CURRENT_USER: 'taazi_tokari_current_user_v2',
  CATEGORIES: 'taazi_tokari_categories_v2',
  PRODUCTS: 'taazi_tokari_products_v2',
  ZONES: 'taazi_tokari_zones_v2',
  SLOTS: 'taazi_tokari_slots_v2',
  ADDRESSES: 'taazi_tokari_addresses_v2',
  ACTIVE_ADDRESS: 'taazi_tokari_active_address_v2',
  CART: 'taazi_tokari_cart_v2',
  ORDERS: 'taazi_tokari_orders_v2',
  PURCHASES: 'taazi_tokari_purchases_v2',
  MANUAL_SALES: 'taazi_tokari_manual_sales_v2',
  EXPENSES: 'taazi_tokari_expenses_v2',
  INVENTORY_MOVEMENTS: 'taazi_tokari_inv_movements_v2',
  NOTIFICATIONS: 'taazi_tokari_notifications_v2',
  FEEDBACK: 'taazi_tokari_feedback_v2',
  AUDIT_LOGS: 'taazi_tokari_audit_logs_v2',
  LOCATION_SETUP_DONE: 'taazi_tokari_location_setup_v2',
};

// ==============================================================================
// INITIAL SEED DATA
// ==============================================================================
export const INITIAL_ZONES: DeliveryZone[] = [
  {
    id: 'zone-gomti-nagar',
    name: 'Gomti Nagar & Extension (गोमती नगर)',
    pincodes: ['226010', '226028', '226027'],
    minOrderFreeDelivery: 199,
    deliveryFee: 25,
    cutoffTime: '22:00',
    isActive: true,
  },
  {
    id: 'zone-indira-nagar',
    name: 'Indira Nagar & Kalyanpur (इंदिरा नगर)',
    pincodes: ['226016', '226022'],
    minOrderFreeDelivery: 199,
    deliveryFee: 25,
    cutoffTime: '22:00',
    isActive: true,
  },
  {
    id: 'zone-hazratganj',
    name: 'Hazratganj & Butler Colony (हज़रतगंज)',
    pincodes: ['226001'],
    minOrderFreeDelivery: 249,
    deliveryFee: 30,
    cutoffTime: '21:30',
    isActive: true,
  },
  {
    id: 'zone-aliganj',
    name: 'Aliganj & Mahanagar (अलीगंज एवं महानगर)',
    pincodes: ['226024', '226006'],
    minOrderFreeDelivery: 199,
    deliveryFee: 25,
    cutoffTime: '22:00',
    isActive: true,
  },
  {
    id: 'zone-sushant-golf-city',
    name: 'Sushant Golf City & Shaheed Path (सुशांत गोल्फ सिटी)',
    pincodes: ['226030'],
    minOrderFreeDelivery: 249,
    deliveryFee: 35,
    cutoffTime: '21:30',
    isActive: true,
  },
];

export const INITIAL_SLOTS: DeliverySlot[] = [
  {
    id: 'slot-dawn',
    title: 'Dawn Fresh Harvest (सुबह 6:00 - 8:30)',
    timeRange: '6:00 AM – 8:30 AM',
    description: 'Harvested at dawn, packed in ozone crates, delivered before breakfast.',
    isActive: true,
  },
  {
    id: 'slot-morning',
    title: 'Morning Batch (सुबह 8:30 - 10:30)',
    timeRange: '8:30 AM – 10:30 AM',
    description: 'Convenient morning slot for daily cooking.',
    isActive: true,
  },
];

export const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-all',
    slug: 'all',
    nameEn: 'All Fresh Produce',
    nameHi: 'सभी ताज़ा उत्पाद',
    iconName: 'storefront',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-vegetables',
    slug: 'vegetables',
    nameEn: 'Farm Vegetables',
    nameHi: 'ताज़ी सब्ज़ियाँ',
    iconName: 'nutrition',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-fruits',
    slug: 'fruits',
    nameEn: 'Fresh Fruits',
    nameHi: 'मौसमी फल',
    iconName: 'apple',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-daily',
    slug: 'daily-essentials',
    nameEn: 'Daily Essentials',
    nameHi: 'दैनिक ज़रूरतें',
    iconName: 'egg',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-new',
    slug: 'new-arrivals',
    nameEn: 'New Arrivals',
    nameHi: 'नई फसलें',
    iconName: 'sparkles',
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-popular',
    slug: 'popular',
    nameEn: 'Popular Products',
    nameHi: 'लोकप्रिय',
    iconName: 'trending_up',
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'cat-best',
    slug: 'best-prices',
    nameEn: 'Best Prices',
    nameHi: 'किफ़ायती दाम',
    iconName: 'percent',
    displayOrder: 7,
    isActive: true,
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-desi-tomato',
    nameEn: 'Desi Tomato (Tamatar)',
    nameHi: 'देसी टमाटर (सीतापुर बेल्ट)',
    categorySlug: 'vegetables',
    unit: '1 kg',
    price: 38,
    mrp: 48,
    stockQty: 85,
    weightedCost: 26,
    lowStockThreshold: 15,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: true,
    origin: 'Sitapur Belt (Dawn Harvest)',
    topBadge: 'Farm Fresh',
    description: 'Juicy desi variety tomatoes with natural acidity, perfect for Indian gravies and dal tadka.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-pahadi-aloo',
    nameEn: 'Pahadi Aloo (Grade A)',
    nameHi: 'पहाड़ी आलू (हल्द्वानी रूट)',
    categorySlug: 'vegetables',
    unit: '1 kg',
    price: 28,
    mrp: 34,
    stockQty: 120,
    weightedCost: 19,
    lowStockThreshold: 20,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: true,
    origin: 'Haldwani Mountain Route',
    topBadge: 'Non-Sugary',
    description: 'Firm mountain crop potatoes with low sugar content. Crisp frying and fluffy boiling.',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-red-onion',
    nameEn: 'Nashik Red Onion (Pyaaz)',
    nameHi: 'नासिक लाल प्याज़ (ग्रेड ए)',
    categorySlug: 'vegetables',
    unit: '1 kg',
    price: 32,
    mrp: 42,
    stockQty: 95,
    weightedCost: 22,
    lowStockThreshold: 20,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: false,
    origin: 'Nashik Direct Rail Lot',
    topBadge: 'Grade A Dry',
    description: 'Tight-skinned pungent red onions with low moisture for longer shelf life in kitchen baskets.',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-desi-palak',
    nameEn: 'Desi Palak (Tender Spinach)',
    nameHi: 'देसी पालक (मलिहाबाद पेरी)',
    categorySlug: 'vegetables',
    unit: '250 g bunch',
    price: 22,
    mrp: 30,
    stockQty: 40,
    weightedCost: 14,
    lowStockThreshold: 10,
    isAvailable: true,
    isNewArrival: true,
    isPopular: true,
    isBestPrice: true,
    origin: 'Malihabad Peri (4:00 AM Harvest)',
    topBadge: '4 AM Harvest',
    description: 'Tender baby spinach leaves harvested at dawn. Washed in ozone water, zero bitter taste.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-desi-kheera',
    nameEn: 'Desi Kheera (Crisp Cucumber)',
    nameHi: 'देसी खीरा (मोहनलालगंज पॉलीहाउस)',
    categorySlug: 'vegetables',
    unit: '500 g',
    price: 35,
    mrp: 45,
    stockQty: 35,
    weightedCost: 24,
    lowStockThreshold: 8,
    isAvailable: true,
    isNewArrival: false,
    isPopular: false,
    isBestPrice: true,
    origin: 'Mohanlalganj Polyhouse',
    topBadge: 'Zero Bitter',
    description: 'Crunchy field cucumbers with thin edible skin and zero bitterness. Great for cooling salads.',
    imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-bhindi',
    nameEn: 'Fresh Bhindi (Ladyfinger / Okra)',
    nameHi: 'हरी भिंडी (बीकेटी फार्म्स)',
    categorySlug: 'vegetables',
    unit: '500 g',
    price: 45,
    mrp: 55,
    stockQty: 28,
    weightedCost: 31,
    lowStockThreshold: 8,
    isAvailable: true,
    isNewArrival: true,
    isPopular: true,
    isBestPrice: false,
    origin: 'BKT Farms (Lucknow)',
    topBadge: 'Tender Snappy',
    description: 'Bright green, tender snappy okra with zero fibrous strings. Perfect for crispy kurkuri bhindi.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-shimla-mirch',
    nameEn: 'Green Shimla Mirch (Capsicum)',
    nameHi: 'शिमला मिर्च (क्रंची हरी)',
    categorySlug: 'vegetables',
    unit: '500 g',
    price: 42,
    mrp: 52,
    stockQty: 30,
    weightedCost: 28,
    lowStockThreshold: 6,
    isAvailable: true,
    isNewArrival: false,
    isPopular: false,
    isBestPrice: true,
    origin: 'Polyhouse Cold-Chain',
    topBadge: 'Thick Wall',
    description: 'Glossy thick-walled green bell peppers with sweet crunchy flavor. Ideal for stir-fry and bharwa.',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-gobhi',
    nameEn: 'Snow White Gobhi (Cauliflower)',
    nameHi: 'फूलगोभी (चिनहट बेल्ट)',
    categorySlug: 'vegetables',
    unit: '1 piece (~700g)',
    price: 34,
    mrp: 45,
    stockQty: 25,
    weightedCost: 22,
    lowStockThreshold: 5,
    isAvailable: true,
    isNewArrival: true,
    isPopular: true,
    isBestPrice: false,
    origin: 'Chinhat Peri-urban Belt',
    topBadge: 'Tight Curds',
    description: 'Compact snow-white curds protected by green leaves. Freshly cut before dawn dispatch.',
    imageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-shimla-apple',
    nameEn: 'Royal Delicious Apple (Kinnaur/Shimla)',
    nameHi: 'रॉयल सेब (हिमाचल प्रदेश)',
    categorySlug: 'fruits',
    unit: '1 kg (4-5 pcs)',
    price: 155,
    mrp: 185,
    stockQty: 45,
    weightedCost: 118,
    lowStockThreshold: 10,
    isAvailable: true,
    isNewArrival: true,
    isPopular: true,
    isBestPrice: false,
    origin: 'Himachal Orchard Cold-Chain',
    topBadge: 'Wax-Free',
    description: 'Naturally sweet and aromatic Royal Delicious apples. 100% natural and wax-free skin.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-robusta-banana',
    nameEn: 'Robusta Golden Banana (Kela)',
    nameHi: 'रोबस्टा केला (दर्जन)',
    categorySlug: 'fruits',
    unit: '1 dozen (12 pcs)',
    price: 58,
    mrp: 70,
    stockQty: 50,
    weightedCost: 40,
    lowStockThreshold: 12,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: true,
    origin: 'Jalgaon Direct Farm Lot',
    topBadge: 'Chemical-Free Ripened',
    description: 'Naturally ethylene ripened sweet bananas, never dipped in harmful calcium carbide.',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-nagpur-orange',
    nameEn: 'Juicy Nagpur Santra (Orange)',
    nameHi: 'नागपुर संतरा (रसदार)',
    categorySlug: 'fruits',
    unit: '1 kg',
    price: 85,
    mrp: 105,
    stockQty: 32,
    weightedCost: 62,
    lowStockThreshold: 8,
    isAvailable: true,
    isNewArrival: true,
    isPopular: false,
    isBestPrice: false,
    origin: 'Nagpur Mandi Lot',
    topBadge: 'High Juice',
    description: 'Thin-skinned, fragrant and full of vitamin C. Great for morning breakfast juice.',
    imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-pomegranate',
    nameEn: 'Bhagwa Anar (Pomegranate)',
    nameHi: 'भगवा अनार (रूबी दाने)',
    categorySlug: 'fruits',
    unit: '500 g (2-3 pcs)',
    price: 95,
    mrp: 120,
    stockQty: 24,
    weightedCost: 72,
    lowStockThreshold: 6,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: false,
    origin: 'Solapur Bhagwa Orchards',
    topBadge: 'Ruby Pearls',
    description: 'Deep red pearls with soft chewable seeds. Rich in polyphenols and antioxidants.',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-dhaniya-mirchi',
    nameEn: 'Dhaniya-Mirchi-Adrak Daily Trio',
    nameHi: 'धनिया-मिर्ची-अदरक ट्रियो पैक',
    categorySlug: 'daily-essentials',
    unit: '250 g combo pack',
    price: 32,
    mrp: 45,
    stockQty: 60,
    weightedCost: 19,
    lowStockThreshold: 15,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: true,
    origin: 'Lucknow Mandi Clean Lot',
    topBadge: 'Kitchen Daily',
    description: 'Fresh aromatic coriander bunch (100g), sharp spicy green chillies (75g), and ginger (75g).',
    imageUrl: 'https://images.unsplash.com/photo-1588879462719-71578f1925b3?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-lemon',
    nameEn: 'Kagzi Nimbu (Juicy Lemons)',
    nameHi: 'कागज़ी नींबू (रसदार)',
    categorySlug: 'daily-essentials',
    unit: '250 g (5-6 pcs)',
    price: 28,
    mrp: 38,
    stockQty: 40,
    weightedCost: 18,
    lowStockThreshold: 10,
    isAvailable: true,
    isNewArrival: false,
    isPopular: true,
    isBestPrice: false,
    origin: 'Barabanki Citrus Belts',
    topBadge: 'Paper Skin',
    description: 'Thin-skinned yellow lemons with maximum juice extraction. Essential for daily digestion.',
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: NotificationOffer[] = [
  {
    id: 'notif-1',
    title: '🌾 Dawn Harvest Pre-Ordering Active',
    message: 'Place orders before 10:00 PM tonight for 6:00 AM Fresh Doorstep Delivery in Gomti Nagar & Lucknow zones.',
    type: 'HARVEST_ALERT',
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    title: '🎉 Flat ₹50 OFF On First Order',
    message: 'Welcome to Taazi Tokari! Enjoy farm-direct prices with code TAAZI50 on orders above ₹249.',
    type: 'OFFER',
    isActive: true,
    priority: 2,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_PURCHASES: PurchaseRecord[] = [
  {
    id: 'pur-101',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    productId: 'prod-desi-tomato',
    productName: 'Desi Tomato (Tamatar)',
    quantity: 100,
    unit: 'kg',
    totalCost: 2600,
    unitCost: 26,
    supplierName: 'Dubagga Mandi Arhatiya (#Lot-44)',
    notes: 'Grade A Sitapur Lot delivered at 5:30 AM',
    recordedBy: 'Amit Sharma (Admin)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pur-102',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    productId: 'prod-pahadi-aloo',
    productName: 'Pahadi Aloo (Grade A)',
    quantity: 150,
    unit: 'kg',
    totalCost: 2850,
    unitCost: 19,
    supplierName: 'Haldwani Mandi Truck Direct',
    notes: 'Firm mountain crop batch',
    recordedBy: 'Amit Sharma (Admin)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-101',
    date: new Date().toISOString().split('T')[0],
    category: 'TRANSPORT',
    amount: 650,
    notes: 'Dawn mandi to Gomti Nagar distribution hub transport fuel',
    recordedBy: 'Amit Sharma (Admin)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-102',
    date: new Date().toISOString().split('T')[0],
    category: 'PACKAGING',
    amount: 420,
    notes: 'Eco-friendly breathable cotton crates & sanitized produce bags',
    recordedBy: 'Amit Sharma (Admin)',
    createdAt: new Date().toISOString(),
  },
];

// Seed Admin User
export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-admin-001',
  email: 'admin@taazitokari.in',
  fullName: 'Amit Sharma (Founder & Ops)',
  phoneNumber: '+91 99999 88888',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  createdAt: new Date().toISOString(),
};

// Seed Customer User
export const DEFAULT_CUSTOMER_USER: UserProfile = {
  id: 'usr-cust-101',
  email: 'priya.sharma@example.com',
  fullName: 'Priya Sharma',
  phoneNumber: '+91 98765 43210',
  role: 'customer',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  createdAt: new Date().toISOString(),
};

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-84920',
    orderNumber: 'ORD-LKO-20261011-84920',
    userId: 'usr-cust-101',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    deliveryAddress: {
      id: 'addr-default-1',
      userId: 'usr-cust-101',
      recipientName: 'Priya Sharma',
      phoneNumber: '+91 98765 43210',
      addressLine: 'Tower B, Flat 402, Eldeco Elegance, Gomti Nagar Phase 2',
      flatNumber: 'Flat 402',
      blockBuilding: 'Tower B, Eldeco Elegance',
      landmark: 'Near Central Club House',
      zoneId: 'zone-gomti-nagar',
      pincode: '226010',
      isDefault: true,
    },
    deliverySlot: INITIAL_SLOTS[0],
    items: [
      {
        productId: 'prod-desi-tomato',
        nameEn: 'Desi Tomato (Tamatar)',
        nameHi: 'देसी टमाटर (सीतापुर बेल्ट)',
        unit: '1 kg',
        price: 38,
        mrp: 48,
        quantity: 2,
        itemTotal: 76,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-pahadi-aloo',
        nameEn: 'Pahadi Aloo (Grade A)',
        nameHi: 'पहाड़ी आलू (हल्द्वानी रूट)',
        unit: '1 kg',
        price: 28,
        mrp: 34,
        quantity: 2,
        itemTotal: 56,
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      },
      {
        productId: 'prod-desi-palak',
        nameEn: 'Desi Palak (Tender Spinach)',
        nameHi: 'देसी पालक (मलिहाबाद पेरी)',
        unit: '250 g bunch',
        price: 22,
        mrp: 30,
        quantity: 2,
        itemTotal: 44,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      },
    ],
    subtotal: 176,
    deliveryFee: 25,
    savingsTotal: 48,
    grandTotal: 201,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'PACKED',
    deliveryNotes: 'Please ring bell, do not leave on mat.',
    feedbackSubmitted: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ==============================================================================
// DATA STORE REPOSITORY SINGLETON
// ==============================================================================
class AppDataStore {
  // --- Current Auth User ---
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // --- Location & Zones ---
  isLocationSetupDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.LOCATION_SETUP_DONE) === 'true';
  }

  setLocationSetupDone(done: boolean): void {
    localStorage.setItem(STORAGE_KEYS.LOCATION_SETUP_DONE, done ? 'true' : 'false');
  }

  getDeliveryZones(): DeliveryZone[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ZONES);
      return data ? JSON.parse(data) : INITIAL_ZONES;
    } catch {
      return INITIAL_ZONES;
    }
  }

  saveDeliveryZone(zone: DeliveryZone): void {
    const zones = this.getDeliveryZones();
    const index = zones.findIndex((z) => z.id === zone.id);
    if (index >= 0) {
      zones[index] = zone;
    } else {
      zones.push(zone);
    }
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    this.addAuditLog('ZONE_UPDATED', 'DeliveryZone', zone.id, `Zone ${zone.name} updated`);
  }

  getDeliverySlots(): DeliverySlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SLOTS);
      return data ? JSON.parse(data) : INITIAL_SLOTS;
    } catch {
      return INITIAL_SLOTS;
    }
  }

  getActiveAddress(): CustomerAddress | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ADDRESS);
      if (data) return JSON.parse(data);
      const user = this.getCurrentUser();
      if (user) {
        const addresses = this.getUserAddresses(user.id);
        return addresses[0] || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  setActiveAddress(address: CustomerAddress): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ADDRESS, JSON.stringify(address));
    this.setLocationSetupDone(true);
  }

  getUserAddresses(userId: string): CustomerAddress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      const all: CustomerAddress[] = data ? JSON.parse(data) : [];
      return all.filter((a) => a.userId === userId);
    } catch {
      return [];
    }
  }

  saveUserAddress(address: CustomerAddress): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      const all: CustomerAddress[] = data ? JSON.parse(data) : [];
      const index = all.findIndex((a) => a.id === address.id);
      if (index >= 0) {
        all[index] = address;
      } else {
        all.unshift(address);
      }
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(all));
      this.setActiveAddress(address);
    } catch (e) {
      console.error('Failed to save address', e);
    }
  }

  // --- Categories & Products ---
  getCategories(): ProductCategory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  saveCategory(cat: ProductCategory): void {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === cat.id);
    if (idx >= 0) cats[idx] = cat;
    else cats.push(cat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
    this.addAuditLog('CATEGORY_SAVED', 'Category', cat.id, `Saved category ${cat.nameEn}`);
  }

  getProducts(): ProductItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  saveProduct(product: ProductItem): void {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    product.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      products[idx] = product;
    } else {
      product.createdAt = new Date().toISOString();
      products.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.addAuditLog('PRODUCT_SAVED', 'Product', product.id, `Saved product ${product.nameEn}`);
  }

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.addAuditLog('PRODUCT_DELETED', 'Product', productId, `Deleted product ${productId}`);
  }

  // --- Cart Management ---
  getCart(): Record<string, number> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveCart(cart: Record<string, number>): void {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }

  clearCart(): void {
    localStorage.removeItem(STORAGE_KEYS.CART);
  }

  // --- Purchases (Increases Stock & Updates Weighted Average Cost) ---
  getPurchases(): PurchaseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return data ? JSON.parse(data) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  }

  recordPurchase(purchase: Omit<PurchaseRecord, 'id' | 'unitCost' | 'createdAt'>): PurchaseRecord {
    const unitCost = Math.round((purchase.totalCost / (purchase.quantity || 1)) * 100) / 100;
    const newRecord: PurchaseRecord = {
      ...purchase,
      id: `pur-${Date.now()}`,
      unitCost,
      createdAt: new Date().toISOString(),
    };

    const purchases = this.getPurchases();
    purchases.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));

    // Update Product Stock & Weighted Average Cost
    const products = this.getProducts();
    const prod = products.find((p) => p.id === purchase.productId);
    if (prod) {
      const prevStock = prod.stockQty;
      const prevCost = prod.weightedCost || prod.price * 0.7;
      const newStock = prevStock + purchase.quantity;

      // Weighted Average Cost Formula: (prevStock * prevCost + addedStock * newCost) / (prevStock + addedStock)
      const newWeightedCost =
        newStock > 0
          ? Math.round(((prevStock * prevCost + purchase.quantity * unitCost) / newStock) * 100) / 100
          : unitCost;

      prod.stockQty = newStock;
      prod.weightedCost = newWeightedCost;
      prod.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      // Record Inventory Movement
      this.addInventoryMovement({
        productId: prod.id,
        productName: prod.nameEn,
        changeQty: purchase.quantity,
        balanceQtyAfter: newStock,
        reason: 'PURCHASE',
        referenceId: newRecord.id,
        notes: `Purchase from ${purchase.supplierName || 'Mandi'}: ${purchase.quantity} ${purchase.unit} @ ₹${unitCost}/${purchase.unit}`,
        recordedBy: purchase.recordedBy,
      });
    }

    this.addAuditLog(
      'RECORD_PURCHASE',
      'PurchaseRecord',
      newRecord.id,
      `Purchased ${purchase.quantity} ${purchase.unit} of ${purchase.productName} for ₹${purchase.totalCost}`
    );

    return newRecord;
  }

  // --- Manual Sales (Decreases Stock & Records Revenue) ---
  getManualSales(): ManualSaleRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MANUAL_SALES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  recordManualSale(sale: Omit<ManualSaleRecord, 'id' | 'totalRevenue' | 'createdAt'>): ManualSaleRecord {
    const totalRevenue = Math.round(sale.quantity * sale.sellingPrice * 100) / 100;
    const newRecord: ManualSaleRecord = {
      ...sale,
      id: `msale-${Date.now()}`,
      totalRevenue,
      createdAt: new Date().toISOString(),
    };

    const sales = this.getManualSales();
    sales.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.MANUAL_SALES, JSON.stringify(sales));

    // Update Product Stock
    const products = this.getProducts();
    const prod = products.find((p) => p.id === sale.productId);
    if (prod) {
      const newStock = Math.max(0, prod.stockQty - sale.quantity);
      prod.stockQty = newStock;
      prod.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      // Record Inventory Movement
      this.addInventoryMovement({
        productId: prod.id,
        productName: prod.nameEn,
        changeQty: -sale.quantity,
        balanceQtyAfter: newStock,
        reason: 'MANUAL_SALE',
        referenceId: newRecord.id,
        notes: `Manual counter sale: ${sale.quantity} ${sale.unit} @ ₹${sale.sellingPrice}`,
        recordedBy: sale.recordedBy,
      });
    }

    this.addAuditLog(
      'RECORD_MANUAL_SALE',
      'ManualSaleRecord',
      newRecord.id,
      `Manual sale: ${sale.quantity} ${sale.unit} of ${sale.productName} for ₹${totalRevenue}`
    );

    return newRecord;
  }

  // --- Expenses ---
  getExpenses(): ExpenseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  recordExpense(expense: Omit<ExpenseRecord, 'id' | 'createdAt'>): ExpenseRecord {
    const newRecord: ExpenseRecord = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const expenses = this.getExpenses();
    expenses.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

    this.addAuditLog(
      'RECORD_EXPENSE',
      'ExpenseRecord',
      newRecord.id,
      `Recorded ${expense.category} expense of ₹${expense.amount}: ${expense.notes}`
    );

    return newRecord;
  }

  // --- Inventory Movements Ledger ---
  getInventoryMovements(): InventoryMovement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addInventoryMovement(m: Omit<InventoryMovement, 'id' | 'timestamp'>): void {
    const record: InventoryMovement = {
      ...m,
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    const list = this.getInventoryMovements();
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify(list));
  }

  // --- Orders & Checkout ---
  getOrders(): CustomerOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  createOrder(orderData: Omit<CustomerOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): CustomerOrder {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-LKO-${dateStr}-${randSuffix}`;

    const newOrder: CustomerOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Deduct stock for each line item and record inventory movement
    const products = this.getProducts();
    newOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQty = Math.max(0, prod.stockQty - item.quantity);
        prod.updatedAt = new Date().toISOString();

        this.addInventoryMovement({
          productId: prod.id,
          productName: prod.nameEn,
          changeQty: -item.quantity,
          balanceQtyAfter: prod.stockQty,
          reason: 'ONLINE_ORDER',
          referenceId: newOrder.orderNumber,
          notes: `Customer Order #${newOrder.orderNumber} placed by ${newOrder.customerName}`,
          recordedBy: 'Customer Online Store',
        });
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Clear cart
    this.clearCart();

    this.addAuditLog(
      'ORDER_CREATED',
      'CustomerOrder',
      newOrder.id,
      `Order #${newOrder.orderNumber} placed for ₹${newOrder.grandTotal} by ${newOrder.customerName}`
    );

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const prevStatus = order.orderStatus;
      order.orderStatus = status;
      order.updatedAt = new Date().toISOString();

      // If cancelling an order, restore stock
      if (status === 'CANCELLED' && prevStatus !== 'CANCELLED') {
        const products = this.getProducts();
        order.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            prod.stockQty += item.quantity;
            this.addInventoryMovement({
              productId: prod.id,
              productName: prod.nameEn,
              changeQty: item.quantity,
              balanceQtyAfter: prod.stockQty,
              reason: 'ADJUSTMENT',
              referenceId: order.orderNumber,
              notes: `Order #${order.orderNumber} cancelled. Restocked ${item.quantity} units.`,
              recordedBy: 'Admin Ops',
            });
          }
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.addAuditLog(
        'ORDER_STATUS_CHANGED',
        'CustomerOrder',
        orderId,
        `Order #${order.orderNumber} status changed from ${prevStatus} to ${status}`
      );
    }
  }

  // --- Notifications & Offers ---
  getNotifications(): NotificationOffer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  saveNotification(notif: NotificationOffer): void {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === notif.id);
    if (idx >= 0) list[idx] = notif;
    else list.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.addAuditLog('NOTIFICATION_SAVED', 'Notification', notif.id, `Saved announcement: ${notif.title}`);
  }

  deleteNotification(id: string): void {
    const list = this.getNotifications().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.addAuditLog('NOTIFICATION_DELETED', 'Notification', id, `Deleted announcement ID ${id}`);
  }

  // --- Customer Feedback ---
  getFeedback(): CustomerFeedback[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  submitFeedback(feedback: Omit<CustomerFeedback, 'id' | 'createdAt'>): CustomerFeedback {
    const newRecord: CustomerFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const list = this.getFeedback();
    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(list));

    // Mark order as feedback submitted
    const orders = this.getOrders();
    const ord = orders.find((o) => o.id === feedback.orderId);
    if (ord) {
      ord.feedbackSubmitted = true;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }

    this.addAuditLog(
      'FEEDBACK_SUBMITTED',
      'CustomerFeedback',
      newRecord.id,
      `Feedback received for Order #${feedback.orderNumber}: ${feedback.rating} stars`
    );

    return newRecord;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLogRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addAuditLog(action: string, entityType: string, entityId: string, details: string): void {
    const user = this.getCurrentUser();
    const actor = user ? `${user.fullName} (${user.role})` : 'System / Guest';
    const log: AuditLogRecord = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entityType,
      entityId,
      actor,
      details,
      timestamp: new Date().toISOString(),
    };
    const logs = this.getAuditLogs();
    logs.unshift(log);
    // Keep max 500 logs locally
    if (logs.length > 500) logs.length = 500;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  // --- Financial & Business Records KPI Computations ---
  getBusinessMetrics(dateFilter?: string) {
    const orders = this.getOrders();
    const purchases = this.getPurchases();
    const manualSales = this.getManualSales();
    const expenses = this.getExpenses();
    const products = this.getProducts();

    const targetDate = dateFilter || new Date().toISOString().split('T')[0];

    // Filter by date
    const todayOrders = orders.filter(
      (o) => o.createdAt.startsWith(targetDate) && o.orderStatus !== 'CANCELLED'
    );
    const todayPurchases = purchases.filter((p) => p.date === targetDate);
    const todayManualSales = manualSales.filter((s) => s.date === targetDate);
    const todayExpenses = expenses.filter((e) => e.date === targetDate);

    // Sales Revenue (Online orders + Manual sales, without double counting)
    const onlineSalesRevenue = todayOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const manualSalesRevenue = todayManualSales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalSalesRevenue = onlineSalesRevenue + manualSalesRevenue;

    // Purchase Spending
    const totalPurchaseSpending = todayPurchases.reduce((sum, p) => sum + p.totalCost, 0);

    // Operating Expenses
    const totalOperatingExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Cost of Goods Sold (COGS) calculation based on weighted average cost
    let totalCogs = 0;
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const costPerUnit = prod?.weightedCost || item.price * 0.7;
        totalCogs += costPerUnit * item.quantity;
      });
    });
    todayManualSales.forEach((sale) => {
      const prod = products.find((p) => p.id === sale.productId);
      const costPerUnit = prod?.weightedCost || sale.sellingPrice * 0.7;
      totalCogs += costPerUnit * sale.quantity;
    });

    // Gross Profit = Sales Revenue - Cost of Goods Sold
    const estimatedGrossProfit = Math.round((totalSalesRevenue - totalCogs) * 100) / 100;

    // Net Operating Profit = Gross Profit - Operating Expenses
    const estimatedNetOperatingProfit = Math.round((estimatedGrossProfit - totalOperatingExpenses) * 100) / 100;

    // Current Inventory Valuation & Low Stock
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.stockQty * (p.weightedCost || p.price * 0.7),
      0
    );
    const lowStockCount = products.filter((p) => p.stockQty <= p.lowStockThreshold).length;

    return {
      targetDate,
      totalSalesRevenue,
      onlineSalesRevenue,
      manualSalesRevenue,
      totalPurchaseSpending,
      totalOperatingExpenses,
      cogs: Math.round(totalCogs * 100) / 100,
      estimatedGrossProfit,
      estimatedNetOperatingProfit,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      lowStockCount,
      orderCount: todayOrders.length,
    };
  }
}

export const appStore = new AppDataStore();
