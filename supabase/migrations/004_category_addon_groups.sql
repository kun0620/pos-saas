-- ===========================
-- CATEGORY ADDON GROUPS
-- ===========================
create table category_addon_groups (
  category_id uuid references categories(id) on delete cascade not null,
  group_id    uuid references addon_groups(id) on delete cascade not null,
  primary key (category_id, group_id)
);
create index on category_addon_groups(category_id);

-- ===========================
-- RLS POLICIES
-- ===========================
alter table category_addon_groups enable row level security;

create policy "members can view category_addon_groups"
  on category_addon_groups for select
  using (
    exists (
      select 1 from categories
      join shops on shops.id = categories.shop_id
      where categories.id = category_addon_groups.category_id
        and is_shop_member(shops.id)
    )
  );

create policy "owner/manager can manage category_addon_groups"
  on category_addon_groups for all
  using (
    exists (
      select 1 from categories
      where categories.id = category_addon_groups.category_id
        and (
          is_shop_owner(categories.shop_id) or
          exists (
            select 1 from shop_members
            where shop_id = categories.shop_id
              and user_id = auth.uid()
              and role in ('owner', 'manager')
          )
        )
    )
  );
