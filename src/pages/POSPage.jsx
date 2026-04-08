import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { useCartStore } from '../store/cartStore'
import { useProducts } from '../hooks/useProducts'
import { usePlan } from '../hooks/usePlan'
import AppLayout from '../components/AppLayout'
import ProductCard from '../components/ProductCard'
import CartItem from '../components/CartItem'
import PaymentModal from '../components/PaymentModal'
import ReceiptModal from '../components/ReceiptModal'
import UpgradeModal from '../components/UpgradeModal'
import AddonSelectorModal from '../components/AddonSelectorModal'
import { ProductCardSkeleton } from '../components/Skeleton'

export default function POSPage() {
  const { shop } = useAuthContext()
  const { products, categories, loading } = useProducts(shop?.id)
  const { items, getTotal, clearCart, addItem } = useCartStore()
  const {
    effectivePlan,
    planConfig,
    todayCount,
    isOverLimit,
    refetchCount,
  } = usePlan(shop)

  const [activeCat, setActiveCat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [selectedProductForAddon, setSelectedProductForAddon] = useState(null)

  function handleProductClick(product) {
    const productGroups = product.product_addon_groups
      ?.map(pag => pag.addon_groups).filter(Boolean) || []

    const categoryGroups = product.categories?.category_addon_groups
      ?.map(cag => cag.addon_groups).filter(Boolean) || []

    // ใช้เฉพาะ groups ที่ผูกไว้จริงๆ (product หรือ category)
    // ไม่ใช้ shop-wide fallback เพราะจะทำให้สินค้าที่ไม่ต้องการ addon ก็โดน popup
    const groupsToShow = productGroups.length > 0
      ? productGroups
      : categoryGroups

    if (groupsToShow.length > 0) {
      setSelectedProductForAddon({ product, groups: groupsToShow })
    } else {
      addItem(product, [])
    }
  }

  const total = getTotal()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const isNearLimit = Number.isFinite(planConfig.orderLimit)
    && effectivePlan === 'free'
    && todayCount >= planConfig.orderLimit * 0.8

  const filtered = products.filter((product) => {
    const categoryMatch = !activeCat || product.category_id === activeCat
    const searchMatch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  function handleCheckout() {
    if (isOverLimit) {
      setShowPayment(false)
      setShowUpgrade(true)
      return
    }

    setReceiptOrder(null)
    setShowPayment(true)
  }

  function handlePaymentSuccess(order) {
    setShowPayment(false)
    setReceiptOrder(order)
    void refetchCount()
  }

  function handleReceiptClose() {
    setReceiptOrder(null)
  }

  return (
    <AppLayout>
      <div className="bg-app-pos-canvas flex h-full flex-col overflow-hidden rounded-[2rem]">
        <div className="flex flex-1 flex-col overflow-auto xl:flex-row xl:overflow-hidden">
          <section className="bg-app-panel-soft flex min-w-0 flex-1 flex-col overflow-visible px-4 py-4 sm:px-6 sm:py-5 xl:overflow-hidden">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-app-subtle text-sm font-medium">Point of Sale</p>
                  <h1 className="mt-1 font-display text-[1.9rem] font-semibold tracking-tight text-on-surface">พร้อมขายในรอบนี้</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-app-card text-app-muted rounded-full px-3 py-2 text-xs font-medium shadow-[0_12px_24px_rgba(18,28,40,0.05)] dark:shadow-[0_12px_24px_rgba(2,8,20,0.28)]">
                    {filtered.length} สินค้าที่แสดง
                  </span>
                  <span className="bg-app-card text-app-muted rounded-full px-3 py-2 text-xs font-medium shadow-[0_12px_24px_rgba(18,28,40,0.05)] dark:shadow-[0_12px_24px_rgba(2,8,20,0.28)]">
                    แพลน {effectivePlan === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="bg-app-card-soft flex min-w-0 flex-1 items-center gap-3 rounded-[1.35rem] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(120,144,184,0.12)]">
                  <span className="text-app-subtle">⌕</span>
                  <input
                    type="text"
                    placeholder="ค้นหาสินค้าหรือสแกนบาร์โค้ด..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="text-app min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-app-subtle"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-app-card rounded-full px-3 py-1 text-xs font-medium text-app-muted transition hover:text-app"
                    >
                      ล้าง
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button className="bg-app-card-soft text-app flex h-12 w-12 items-center justify-center rounded-2xl text-lg shadow-[0_12px_20px_rgba(18,28,40,0.05)] transition hover:bg-app-card-elevated dark:shadow-[0_12px_20px_rgba(2,8,20,0.3)]">
                    🔔
                  </button>
                  <button className="bg-app-card-soft text-app flex h-12 w-12 items-center justify-center rounded-2xl text-lg shadow-[0_12px_20px_rgba(18,28,40,0.05)] transition hover:bg-app-card-elevated dark:shadow-[0_12px_20px_rgba(2,8,20,0.3)]">
                    ⚙
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCat(null)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    !activeCat
                      ? 'bg-primary text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)]'
                      : 'bg-app-card-soft text-app-muted hover:bg-app-card-elevated hover:text-app'
                  }`}
                >
                  ทั้งหมด
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCat(category.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeCat === category.id
                        ? 'bg-primary text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)]'
                        : 'bg-app-card-soft text-app-muted hover:bg-app-card-elevated hover:text-app'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto pb-4">
              {loading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-app-card text-app-subtle flex h-72 flex-col items-center justify-center rounded-[2rem] shadow-[0_18px_40px_rgba(18,28,40,0.05)] dark:shadow-[0_18px_40px_rgba(2,8,20,0.3)]">
                  <p className="text-5xl">📦</p>
                  <p className="mt-3 text-sm font-medium">ยังไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((product) => <ProductCard key={product.id} product={product} onClick={handleProductClick} />)}
                </div>
              )}
            </div>
          </section>

          <aside className="bg-app-panel flex w-full shrink-0 flex-col px-5 py-5 shadow-[0_-12px_30px_rgba(18,28,40,0.04)] dark:shadow-[0_-14px_34px_rgba(1,6,16,0.34)] xl:max-w-[26rem] xl:shadow-[-12px_0_30px_rgba(18,28,40,0.04)] dark:xl:shadow-[-14px_0_34px_rgba(1,6,16,0.34)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[1.65rem] font-semibold tracking-tight text-on-surface">รายการสั่งซื้อ</h2>
                <p className="text-app-subtle mt-1 text-sm">
                  {itemCount > 0 ? `${itemCount} ชิ้นในตะกร้า` : 'ยังไม่มีรายการในตะกร้า'}
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="rounded-full px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  ล้างทั้งหมด
                </button>
              )}
            </div>

            <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
              {items.length === 0 ? (
                <div className="bg-app-card text-app-subtle flex h-64 flex-col items-center justify-center rounded-[2rem] shadow-[0_14px_34px_rgba(18,28,40,0.05)] dark:shadow-[0_14px_34px_rgba(2,8,20,0.28)]">
                  <p className="text-5xl">🛒</p>
                  <p className="mt-3 text-sm font-medium">เลือกสินค้าเพื่อเริ่มขายได้เลย</p>
                </div>
              ) : (
                items.map((item) => <CartItem key={item.cartItemId} item={item} />)
              )}
            </div>

            <div className="bg-app-card mt-5 space-y-4 rounded-[2rem] px-5 py-5 shadow-[0_20px_50px_rgba(18,28,40,0.08)] dark:shadow-[0_20px_50px_rgba(2,8,20,0.42)]">
              {isNearLimit && (
                <p className="rounded-[1.25rem] bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                  ใช้ไปแล้ว {todayCount}/{planConfig.orderLimit} ออเดอร์ในวันนี้
                </p>
              )}

              <div className="space-y-3 text-sm">
                <div className="text-app-muted flex items-center justify-between">
                  <span>จำนวนสินค้า</span>
                  <span>{itemCount} ชิ้น</span>
                </div>
                <div className="text-app-muted flex items-center justify-between">
                  <span>แพลนปัจจุบัน</span>
                  <span className="font-medium text-on-surface">{effectivePlan === 'pro' ? 'Pro' : 'Free'}</span>
                </div>
                <div className="border-app-strong flex items-end justify-between border-t pt-3">
                  <div>
                    <p className="text-app-muted">ยอดรวมสุทธิ</p>
                    <p className="text-app-subtle mt-1 text-xs">บันทึกออเดอร์ตามยอดรวมของสินค้า</p>
                  </div>
                  <p className="font-display text-[2rem] font-semibold tracking-tight text-primary">
                    ฿{total.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full rounded-[1.35rem] bg-gradient-to-r from-primary to-primary-dark py-4 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.28)] transition hover:shadow-[0_20px_40px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:disabled:from-[rgba(92,108,135,0.7)] dark:disabled:to-[rgba(92,108,135,0.7)]"
              >
                {isOverLimit ? 'เกินลิมิตวันนี้ - อัปเกรดแพลน' : 'ชำระเงิน (Checkout) →'}
              </button>
            </div>
          </aside>
        </div>

        {showPayment && (
          <PaymentModal
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {receiptOrder && (
          <ReceiptModal
            order={receiptOrder}
            onClose={handleReceiptClose}
          />
        )}

        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            reason={isOverLimit
              ? `ใช้ครบ ${planConfig.orderLimit} order/วันแล้ว`
              : null
            }
          />
        )}
        
        {selectedProductForAddon && (
          <AddonSelectorModal
            product={selectedProductForAddon.product}
            groups={selectedProductForAddon.groups}
            onClose={() => setSelectedProductForAddon(null)}
            onAddToCart={addItem}
          />
        )}
      </div>
    </AppLayout>
  )
}
