-- ==============================================================================
-- TAAZI TOKARI (ताज़ी टोकरी) - COMPLETE PRODUCTION DATABASE SCHEMA
-- PostgreSQL 16 + Supabase Auth + Row-Level Security (RLS) + Atomic Procedures
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status_enum AS ENUM (
    'PLACED',
    'CONFIRMED',
    'PACKED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM ('COD', 'ONLINE_RAZORPAY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'PAID', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE inventory_movement_reason AS ENUM (
    'PURCHASE',
    'MANUAL_SALE',
    'ONLINE_ORDER',
    'WASTAGE',
    'ADJUSTMENT',
    'INITIAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category_enum AS ENUM (
    'TRANSPORT',
    'PACKAGING',
    'MARKET_TRAVEL',
    'WASTAGE',
    'UTILITIES',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES & ROLES
-- Profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- User roles table: Roles assigned and verified server-side only
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL DEFAULT 'customer',
  granted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, role)
);

-- 4. DELIVERY ZONES & SLOTS
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Lucknow',
  pincodes TEXT[] NOT NULL,
  min_order_free_delivery NUMERIC(10,2) NOT NULL DEFAULT 199.00,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 25.00,
  cutoff_time TIME NOT NULL DEFAULT '22:00:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  time_range TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address_line TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  block_building TEXT NOT NULL,
  landmark TEXT,
  zone_id UUID REFERENCES public.delivery_zones(id),
  pincode TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CATEGORIES & PRODUCTS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'storefront',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  unit TEXT NOT NULL, -- e.g. '1 kg', '500 g', '250 g bunch'
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  mrp NUMERIC(10,2) NOT NULL CHECK (mrp >= price),
  stock_qty NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  weighted_cost NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (weighted_cost >= 0),
  low_stock_threshold NUMERIC(10,2) NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_best_price BOOLEAN NOT NULL DEFAULT false,
  origin TEXT NOT NULL DEFAULT 'Lucknow Direct Farm Lot',
  top_badge TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. INVENTORY MOVEMENTS AUDIT LEDGER
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change_qty NUMERIC(10,2) NOT NULL, -- Positive for increase, Negative for decrease
  balance_qty_after NUMERIC(10,2) NOT NULL,
  reason inventory_movement_reason NOT NULL,
  reference_id TEXT, -- Order number, Purchase ID, or Manual Sale ID
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PURCHASES (Mandi & Farm Procurement)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL CHECK (total_cost >= 0),
  unit_cost NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0),
  supplier_name TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. MANUAL SALES (Direct Counter & Physical Sales)
CREATE TABLE IF NOT EXISTS public.manual_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price >= 0),
  total_revenue NUMERIC(10,2) NOT NULL CHECK (total_revenue >= 0),
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. EXPENSES (Operational, Transport, Packaging)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category expense_category_enum NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  notes TEXT NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address_json JSONB NOT NULL,
  delivery_slot_json JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  savings_total NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (savings_total >= 0),
  grand_total NUMERIC(10,2) NOT NULL CHECK (grand_total >= 0),
  payment_method payment_method_enum NOT NULL DEFAULT 'COD',
  payment_status payment_status_enum NOT NULL DEFAULT 'PENDING',
  order_status order_status_enum NOT NULL DEFAULT 'PLACED',
  delivery_notes TEXT,
  feedback_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  unit TEXT NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  mrp_at_purchase NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  item_total NUMERIC(10,2) NOT NULL CHECK (item_total >= 0),
  image_url TEXT
);

-- 12. NOTIFICATIONS & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ANNOUNCEMENT',
  banner_image_url TEXT,
  action_text TEXT,
  action_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. CUSTOMER FEEDBACK
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  actor TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. INDEXES FOR HIGH QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON public.purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_manual_sales_date ON public.manual_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_prod ON public.inventory_movements(product_id);

-- 16. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is caller an authorized admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read policies
CREATE POLICY "Public can view active delivery zones"
  ON public.delivery_zones FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active delivery slots"
  ON public.delivery_slots FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view available products"
  ON public.products FOR SELECT USING (is_available = true);

CREATE POLICY "Public can view active notifications"
  ON public.notifications FOR SELECT USING (is_active = true);

-- Customer profile policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own addresses"
  ON public.customer_addresses FOR ALL USING (auth.uid() = user_id);

-- Order policies
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert their own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can view their order items"
  ON public.order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Feedback policies
CREATE POLICY "Customers can submit feedback"
  ON public.customer_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Super Administrator full access policies
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to categories"
  ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to zones"
  ON public.delivery_zones FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to slots"
  ON public.delivery_slots FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to purchases"
  ON public.purchases FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to manual sales"
  ON public.manual_sales FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to expenses"
  ON public.expenses FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to inventory movements"
  ON public.inventory_movements FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to orders"
  ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to notifications"
  ON public.notifications FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to feedback"
  ON public.customer_feedback FOR ALL USING (public.is_admin());

CREATE POLICY "Admins have full access to audit logs"
  ON public.admin_audit_logs FOR ALL USING (public.is_admin());

-- 17. ATOMIC TRANSACTION PROCEDURES

-- Atomic purchase recording with weighted-average cost update
CREATE OR REPLACE FUNCTION public.record_purchase_atomic(
  p_product_id UUID,
  p_quantity NUMERIC,
  p_unit TEXT,
  p_total_cost NUMERIC,
  p_supplier_name TEXT,
  p_notes TEXT,
  p_recorded_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_unit_cost NUMERIC;
  v_prev_stock NUMERIC;
  v_prev_cost NUMERIC;
  v_new_stock NUMERIC;
  v_new_cost NUMERIC;
BEGIN
  v_unit_cost := ROUND(p_total_cost / p_quantity, 2);

  -- 1. Insert purchase record
  INSERT INTO public.purchases (
    product_id, quantity, unit, total_cost, unit_cost, supplier_name, notes, recorded_by
  ) VALUES (
    p_product_id, p_quantity, p_unit, p_total_cost, v_unit_cost, p_supplier_name, p_notes, p_recorded_by
  ) RETURNING id INTO v_purchase_id;

  -- 2. Lock product row and calculate weighted average cost
  SELECT stock_qty, weighted_cost INTO v_prev_stock, v_prev_cost
  FROM public.products WHERE id = p_product_id FOR UPDATE;

  v_new_stock := v_prev_stock + p_quantity;
  IF v_new_stock > 0 THEN
    v_new_cost := ROUND(((v_prev_stock * v_prev_cost) + (p_quantity * v_unit_cost)) / v_new_stock, 2);
  ELSE
    v_new_cost := v_unit_cost;
  END IF;

  -- 3. Update product
  UPDATE public.products
  SET stock_qty = v_new_stock, weighted_cost = v_new_cost, updated_at = now()
  WHERE id = p_product_id;

  -- 4. Record movement
  INSERT INTO public.inventory_movements (
    product_id, change_qty, balance_qty_after, reason, reference_id, notes, recorded_by
  ) VALUES (
    p_product_id, p_quantity, v_new_stock, 'PURCHASE', v_purchase_id::text, p_notes, p_recorded_by
  );

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
