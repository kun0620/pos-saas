-- ===========================
-- ADDON GROUPS
-- ===========================
create table addon_groups (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  name text not null,
  is_required boolean default false,
  max_selections int default 1
);
create index on addon_groups(shop_id);

-- ===========================
-- ADDONS
-- ===========================
create table addons (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references addon_groups(id) on delete cascade not null,
  name text not null,
  price numeric(10,2) default 0 check(price >= 0)
);
create index on addons(group_id);

-- ===========================
-- PRODUCT ADDON GROUPS
-- ===========================
create table product_addon_groups (
  product_id uuid references products(id) on delete cascade not null,
  group_id uuid references addon_groups(id) on delete cascade not null,
  primary key (product_id, group_id)
);
create index on product_addon_groups(product_id);
create index on product_addon_groups(group_id);

-- ===========================
-- UPDATE ORDER ITEMS
-- ===========================
alter table order_items
add column addons jsonb default '[]'::jsonb;

-- ===========================
-- RLS POLICIES
-- ===========================
alter table addon_groups enable row level security;
alter table addons enable row level security;
alter table product_addon_groups enable row level security;

-- addon_groups
create policy "members can view addon_groups"
  on addon_groups for select
  using (is_shop_member(shop_id));

create policy "owner/manager can manage addon_groups"
  on addon_groups for all
  using (
    is_shop_owner(shop_id) or
    exists (
      select 1 from shop_members
      where shop_id = addon_groups.shop_id
        and user_id = auth.uid()
        and role in ('owner', 'manager')
    )
  );

-- addons
create policy "members can view addons"
  on addons for select
  using (
    exists (
      select 1 from addon_groups
      where addon_groups.id = addons.group_id
        and is_shop_member(addon_groups.shop_id)
    )
  );

create policy "owner/manager can manage addons"
  on addons for all
  using (
    exists (
      select 1 from addon_groups
      where addon_groups.id = addons.group_id
        and (
          is_shop_owner(addon_groups.shop_id) or
          exists (
            select 1 from shop_members
            where shop_id = addon_groups.shop_id
              and user_id = auth.uid()
              and role in ('owner', 'manager')
          )
        )
    )
  );

-- product_addon_groups
create policy "members can view product_addon_groups"
  on product_addon_groups for select
  using (
    exists (
      select 1 from products
      where products.id = product_addon_groups.product_id
        and is_shop_member(products.shop_id)
    )
  );

create policy "owner/manager can manage product_addon_groups"
  on product_addon_groups for all
  using (
    exists (
      select 1 from products
      where products.id = product_addon_groups.product_id
        and (
          is_shop_owner(products.shop_id) or
          exists (
            select 1 from shop_members
            where shop_id = products.shop_id
              and user_id = auth.uid()
              and role in ('owner', 'manager')
          )
        )
    )
  );
