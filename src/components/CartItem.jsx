import { useCartStore } from '../store/cartStore'

export default function CartItem({ item }) {
  const updateQty = useCartStore(s => s.updateQty)
  const { product, quantity, addons, cartItemId } = item
  
  const addonTotal = (addons || []).reduce((sum, a) => sum + Number(a.price || 0), 0)
  const unitPrice = product.price + addonTotal
  const lineTotal = unitPrice * quantity

  return (
    <div className="bg-app-card flex items-center gap-3 rounded-[1.6rem] px-3 py-3 shadow-[0_12px_30px_rgba(18,28,40,0.06)] ring-1 ring-app dark:shadow-[0_12px_30px_rgba(2,8,20,0.35)]">
      <div className="bg-app-card-soft flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] text-2xl">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          : '🛍️'}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-surface">{product.name}</p>
        
        {addons && addons.length > 0 && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {addons.map(a => a.name).join(', ')}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-primary">฿{unitPrice.toFixed(2)} / ชิ้น</span>
          <span className="bg-app-card-soft text-app-muted rounded-full px-2 py-1">รวม ฿{lineTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-app-card-soft flex items-center gap-2 rounded-full px-2 py-1">
        <button
          onClick={() => updateQty(cartItemId, -1)}
          className="text-app-muted hover:bg-app-card flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold transition hover:text-app"
        >−</button>
        <span className="w-5 text-center text-sm font-semibold text-on-surface">{quantity}</span>
        <button
          onClick={() => updateQty(cartItemId, +1)}
          className="text-app-muted hover:bg-app-card flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold transition hover:text-app"
        >+</button>
      </div>
    </div>
  )
}
