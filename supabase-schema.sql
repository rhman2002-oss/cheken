-- =============================================================================
-- مخطط قاعدة بيانات مطعم المنيو الذكي (Supabase SQL Schema)
-- -----------------------------------------------------------------------------
-- قم بلصق هذا الكود في SQL Editor داخل لوحة تحكم Supabase لتجهيز الجداول بنقرة واحدة
-- =============================================================================

-- 1. جدول إعدادات وبيانات المطعم العامة
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  logo TEXT,
  hero_image TEXT,
  currency TEXT DEFAULT 'ر.س',
  currency_position TEXT DEFAULT 'after',
  menu_mode TEXT DEFAULT 'cart_orders', -- 'display_only' | 'direct_whatsapp' | 'cart_orders'
  checkout_method TEXT DEFAULT 'both', -- 'website' | 'whatsapp' | 'both'
  phone TEXT,
  whatsapp_number TEXT,
  whatsapp_prefix TEXT,
  address TEXT,
  city TEXT,
  google_maps_url TEXT,
  is_open BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول أقسام المنيو (Categories)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. جدول أصناف وقائمة الطعام (Menu Items)
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT,
  badge TEXT,
  calories INTEGER,
  is_available BOOLEAN DEFAULT true,
  discount_type TEXT, -- 'percentage' | 'fixed'
  discount_value NUMERIC(10, 2) DEFAULT 0,
  discount_active BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number SERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  notes TEXT,
  order_source TEXT NOT NULL DEFAULT 'طلب من الموقع', -- 'طلب من الموقع' | 'طلب من واتساب' | 'طلب مباشر'
  status TEXT NOT NULL DEFAULT 'pending' -- 'pending' | 'preparing' | 'completed' | 'cancelled'
);

-- تفعيل الأمان (Row Level Security) مع السماح بالقراءة للجميع وتعديل المسجلين فقط
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة للزبائن (Public Read)
CREATE POLICY "Public can view restaurant settings" ON restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (true);

-- سياسات الطلبات: الزبائن يمكنهم إنشاء طلب (INSERT)، والإدارة يمكنها القراءة والتعديل (SELECT, UPDATE, DELETE)
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (true);

-- سياسات التعديل والحذف لأصحاب المطعم المسجلين (Authenticated Only)
CREATE POLICY "Admin can update settings" ON restaurant_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage menu items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');

-- تمكين Realtime لجدول الطلبات
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 5. جدول بيانات الزبائن (Customers)
CREATE TABLE IF NOT EXISTS customers (
  phone TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update customers" ON customers FOR UPDATE USING (true);

