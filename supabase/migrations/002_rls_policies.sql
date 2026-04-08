-- เปิด RLS ทุก table
alter table shops         enable row level security;
alter table shop_members  enable row level security;
alter table categories    enable row level security;
alter table products      enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;

-- ===========================
-- HELPER FUNCTION
-- ===========================
-- แทนที่จะเขียน subquery ซ้ำทุก policy
-- สร้าง function ไว้ใช้ร่วมกัน

create or replace function is_shop_member(shop_id uuid)
returns boolean as $$
  select exists (
    select 1 from shop_members
    where shop_members.shop_id = $1
      and shop_members.user_id = auth.uid()
  );
$$ language sql security definer stable;

create or replace function is_shop_owner(shop_id uuid)
returns boolean as $$
  select exists (
    select 1 from shops
    where shops.id = $1
      and shops.owner_id = auth.uid()
  );
$$ language sql security definer stable;

-- ===========================
-- SHOPS policies
-- ===========================
create policy "owner can do anything with their shop"
  on shops for all
  using (owner_id = auth.uid());

create policy "members can view shop"
  on shops for select
  using (is_shop_member(id));

-- ===========================
-- SHOP_MEMBERS policies
-- ===========================
create policy "members can view other members"
  on shop_members for select
  using (is_shop_member(shop_id));

create policy "owner can manage members"
  on shop_members for all
  using (is_shop_owner(shop_id));

-- ===========================
-- CATEGORIES policies
-- ===========================
create policy "members can view categories"
  on categories for select
  using (is_shop_member(shop_id));

create policy "owner can manage categories"
  on categories for all
  using (is_shop_owner(shop_id));

-- ===========================
-- PRODUCTS policies
-- ===========================
create policy "members can view products"
  on products for select
  using (is_shop_member(shop_id));

create policy "owner/manager can manage products"
  on products for all
  using (
    is_shop_owner(shop_id) or
    exists (
      select 1 from shop_members
      where shop_id = products.shop_id
        and user_id = auth.uid()
        and role in ('owner', 'manager')
    )
  );

-- ===========================
-- ORDERS policies
-- ===========================
create policy "members can view orders"
  on orders for select
  using (is_shop_member(shop_id));

create policy "members can create orders"
  on orders for insert
  with check (is_shop_member(shop_id));

create policy "owner/manager can update/delete orders"
  on orders for update
  using (is_shop_owner(shop_id));

-- ===========================
-- ORDER_ITEMS policies
-- ===========================
create policy "members can view order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and is_shop_member(orders.shop_id)
    )
  );

create policy "members can insert order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and is_shop_member(orders.shop_id)
    )
  );