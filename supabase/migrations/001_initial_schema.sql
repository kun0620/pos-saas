-- ===========================
-- EXTENSION
-- ===========================
create extension if not exists "uuid-ossp";

-- ===========================
-- SHOPS (tenant หลัก)
-- ===========================
create table shops (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  slug        text unique not null,        -- สำหรับ URL เช่น pos.app/my-cafe
  plan        text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  created_at  timestamptz default now()
);

-- ===========================
-- SHOP MEMBERS (multi-user)
-- ===========================
create table shop_members (
  id       uuid primary key default uuid_generate_v4(),
  shop_id  uuid references shops(id) on delete cascade not null,
  user_id  uuid references auth.users(id) on delete cascade not null,
  role     text not null default 'cashier' check (role in ('owner', 'manager', 'cashier')),
  unique(shop_id, user_id)   -- 1 คน มีได้แค่ 1 role ต่อร้าน
);

-- ===========================
-- CATEGORIES
-- ===========================
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  shop_id    uuid references shops(id) on delete cascade not null,
  name       text not null,
  sort_order int default 0
);

-- ===========================
-- PRODUCTS
-- ===========================
create table products (
  id           uuid primary key default uuid_generate_v4(),
  shop_id      uuid references shops(id) on delete cascade not null,
  category_id  uuid references categories(id) on delete set null,
  name         text not null,
  price        numeric(10,2) not null check (price >= 0),
  image_url    text,
  is_available bool default true,
  created_at   timestamptz default now()
);

-- ===========================
-- ORDERS
-- ===========================
create table orders (
  id             uuid primary key default uuid_generate_v4(),
  shop_id        uuid references shops(id) on delete cascade not null,
  created_by     uuid references auth.users(id) not null,
  status         text not null default 'completed' check (status in ('pending', 'completed', 'cancelled')),
  total          numeric(10,2) not null,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'transfer', 'card')),
  note           text,
  created_at     timestamptz default now()
);

-- ===========================
-- ORDER ITEMS
-- ===========================
create table order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid references orders(id) on delete cascade not null,
  product_id  uuid references products(id) on delete set null,
  quantity    int not null check (quantity > 0),
  unit_price  numeric(10,2) not null   -- snapshot ราคา ณ เวลาขาย
);

-- ===========================
-- INDEXES (query performance)
-- ===========================
create index on products(shop_id);
create index on orders(shop_id, created_at desc);
create index on order_items(order_id);
create index on shop_members(user_id);