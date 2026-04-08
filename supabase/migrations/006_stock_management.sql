alter table products
  add column if not exists track_stock       bool    default false,
  add column if not exists stock_quantity    int,
  add column if not exists low_stock_threshold int   default 5;

-- Auto-deduct stock เมื่อสร้าง order_item
create or replace function deduct_stock_on_order_item()
returns trigger language plpgsql security definer as $$
begin
  update products
  set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id
    and track_stock = true
    and stock_quantity is not null;
  return new;
end;
$$;

create trigger trg_deduct_stock
  after insert on order_items
  for each row execute function deduct_stock_on_order_item();

-- RPC to adjust stock manually
create or replace function adjust_product_stock(p_product_id uuid, p_delta int)
returns void language plpgsql security definer as $$
begin
  update products
  set stock_quantity = stock_quantity + p_delta
  where id = p_product_id
    and track_stock = true
    and stock_quantity is not null;
end;
$$;
