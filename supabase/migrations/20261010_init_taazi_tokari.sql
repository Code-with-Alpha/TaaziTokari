-- ==============================================================================
-- TAAZI TOKARI: SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Residential Society Fresh Produce Engine (Lucknow #LKO-24)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & ENUMS
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STORE_MANAGER', 'FIELD_OPERATOR', 'WAREHOUSE_OPERATOR', 'ADMIN', 'ARCHITECT');
CREATE TYPE order_status AS ENUM ('PLACED', 'PROCESSING_QC', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
CREATE TYPE audit_action AS ENUM ('ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'PRICE_MODIFICATION', 'CUTOFF_TRIGGERED', 'USER_ROLE_SWITCHED');

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role user_role DEFAULT 'CUSTOMER'::user_role NOT NULL,
    society_id VARCHAR(50) DEFAULT 'ELDECO_ELEGANCE_LKO',
    flat_number VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PRODUCTS CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    hindi_name VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    price_paise INTEGER NOT NULL,
    mrp_paise INTEGER NOT NULL,
    unit_label VARCHAR(30) NOT NULL,
    step_weight_kg NUMERIC(5, 2) DEFAULT 1.0,
    origin VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    society_id VARCHAR(50) NOT NULL,
    flat_number VARCHAR(50) NOT NULL,
    status order_status DEFAULT 'PLACED'::order_status NOT NULL,
    total_paise INTEGER NOT NULL,
    savings_paise INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase INTEGER NOT NULL
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action audit_action NOT NULL,
    entity VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES public.profiles(id),
    actor_name VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Products Policies (Publicly readable by authenticated users)
CREATE POLICY "Anyone authenticated can view active products"
    ON public.products FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Orders Policies
CREATE POLICY "Customers can read their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ops staff & Admins can read all orders"
    ON public.orders FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'WAREHOUSE_OPERATOR', 'FIELD_OPERATOR', 'STORE_MANAGER')));

CREATE POLICY "Ops staff & Admins can update order status"
    ON public.orders FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'WAREHOUSE_OPERATOR', 'FIELD_OPERATOR', 'STORE_MANAGER')));

-- Audit Logs Policies
CREATE POLICY "Admins can read audit logs"
    ON public.audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
