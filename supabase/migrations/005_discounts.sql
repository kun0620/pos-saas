alter table orders
  add column if not exists discount_type  text check (discount_type in ('percent', 'fixed')),
  add column if not exists discount_value numeric(10,2) default 0,
  add column if not exists discount_amount numeric(10,2) default 0;
