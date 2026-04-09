-- Public receipt viewer (bypasses RLS intentionally — read-only completed orders)
create or replace function get_public_receipt(p_order_id uuid)
returns json language sql security definer stable as $$
  select json_build_object(
    'id', o.id,
    'total', o.total,
    'payment_method', o.payment_method,
    'discount_type', o.discount_type,
    'discount_value', o.discount_value,
    'discount_amount', o.discount_amount,
    'note', o.note,
    'created_at', o.created_at,
    'shop_name', s.name,
    'items', (
      select json_agg(json_build_object(
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'addons', oi.addons,
        'product_name', p.name
      ))
      from order_items oi
      left join products p on p.id = oi.product_id
      where oi.order_id = o.id
    )
  )
  from orders o
  join shops s on s.id = o.shop_id
  where o.id = p_order_id and o.status = 'completed';
$$;

-- Index สำหรับ cashier breakdown queries
create index if not exists idx_orders_created_by on orders(created_by);

-- หา user_id จาก email (auth.users ไม่ accessible โดยตรง)
create or replace function find_user_by_email(p_email text)
returns uuid language sql security definer stable as $$
  select id from auth.users
  where email = lower(trim(p_email))
    and exists (select 1 from shop_members where user_id = auth.uid())
  limit 1;
$$;

-- ดึง member list พร้อม email
create or replace function get_shop_members_with_email(p_shop_id uuid)
returns table(id uuid, user_id uuid, role text, email text) language sql security definer stable as $$
  select sm.id, sm.user_id, sm.role, au.email
  from shop_members sm
  join auth.users au on au.id = sm.user_id
  where sm.shop_id = p_shop_id
  order by case sm.role when 'owner' then 0 when 'manager' then 1 else 2 end, au.email;
$$;

-- ยอดขายแยกตามแคชเชียร์
create or replace function get_cashier_sales(p_shop_id uuid, p_start timestamptz, p_end timestamptz)
returns table(user_id uuid, email text, role text, order_count bigint, total_sales numeric) language sql security definer stable as $$
  select o.created_by, au.email, sm.role,
         count(*)::bigint, sum(o.total)
  from orders o
  join auth.users au on au.id = o.created_by
  join shop_members sm on sm.shop_id = o.shop_id and sm.user_id = o.created_by
  where o.shop_id = p_shop_id
    and o.status = 'completed'
    and o.created_at >= p_start
    and o.created_at <= p_end
  group by o.created_by, au.email, sm.role
  order by sum(o.total) desc;
$$;
