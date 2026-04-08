// import { useCartStore } from '../store/cartStore' // Removed

export default function ProductCard({ product, onClick }) {
  const categoryName = product.categories?.name
  const isOutOfStock = product.track_stock && product.stock_quantity === 0
  const isLowStock = product.track_stock && product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold

  return (
    <button
      onClick={() => onClick(product)}
      disabled={isOutOfStock}
      className="bg-app-card group w-full overflow-hidden rounded-[1.8rem] p-3 text-left
                 shadow-[0_14px_34px_rgba(18,28,40,0.07)] transition-all duration-150
                 dark:shadow-[0_14px_34px_rgba(2,8,20,0.38)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]
                 dark:hover:shadow-[0_18px_40px_rgba(2,8,20,0.55)]
                 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="bg-app-card-soft relative mb-4 flex aspect-[0.92] w-full items-center justify-center overflow-hidden rounded-[1.45rem] text-3xl">
        {product.image_url
          ? <img src={product.image_url} alt={product.name}
                 className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
          : '🛍️'
        }
        <span className="absolute left-3 top-3 rounded-full bg-emerald-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          พร้อมขาย
        </span>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-center text-sm font-semibold text-white">หมดแล้ว</span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="absolute bottom-3 right-3 rounded-full bg-yellow-100 px-2.5 py-1 text-[0.65rem] font-semibold text-yellow-700">
            เหลือ {product.stock_quantity}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="truncate text-[0.95rem] font-semibold text-on-surface">{product.name}</p>
        <p className="text-app-subtle truncate text-xs">
          หมวดหมู่: {categoryName || 'ทั่วไป'}
        </p>
        <p className="pt-1 font-display text-[1.65rem] font-semibold tracking-tight text-primary">
          ฿{product.price.toFixed(2)}
        </p>
      </div>
    </button>
  )
}
