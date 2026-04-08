import { useState } from 'react'
import clsx from 'clsx'
import { useAuthContext } from '../hooks/useAuthContext'
import { useProductManager } from '../hooks/useProductManager'
import AppLayout from '../components/AppLayout'
import ProductForm from '../components/ProductForm'
import AddonManagerModal from '../components/AddonManagerModal'
import CategoryManagerModal from '../components/CategoryManagerModal'
import { ProductRowSkeleton } from '../components/Skeleton'

export default function ProductsPage() {
  const { shop } = useAuthContext()
  const {
    products,
    categories,
    addonGroups,
    loading,
    saveProduct,
    deleteProduct,
    saveCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
    saveCategoryAddonGroups,
  } = useProductManager(shop?.id)

  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showAddonManager, setShowAddonManager] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleEdit(product) {
    setEditing(product)
    setShowForm(true)
  }

  function handleAdd() {
    setEditing(null)
    setShowForm(true)
  }

  function handleCancel() {
    setEditing(null)
    setShowForm(false)
  }

  async function handleSave(form, id) {
    await saveProduct(form, id)
    setShowForm(false)
    setEditing(null)
  }

  async function handleDelete(id) {
    await deleteProduct(id)
    setConfirmId(null)
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col overflow-hidden xl:flex-row">
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">รายการสินค้าทั้งหมด</p>
              <h1 className="mt-1 font-display text-[1.9rem] font-semibold tracking-tight text-on-surface">
                คลังสินค้า ({filtered.length} รายการ)
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3 rounded-[1.35rem] bg-surface px-4 py-3">
                <span className="text-slate-400">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาสินค้าหรือรหัส SKU..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={() => setShowCategoryManager(true)}
                className="rounded-[1.2rem] bg-amber-50 border border-amber-100 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300"
              >
                📂 จัดการหมวดหมู่
              </button>
              <button
                onClick={() => setShowAddonManager(true)}
                className="rounded-[1.2rem] bg-indigo-50 border border-indigo-100 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
              >
                ⚙ จัดการ Topping
              </button>
              <button
                onClick={handleAdd}
                className="rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.25)] transition hover:shadow-[0_22px_40px_rgba(37,99,235,0.32)]"
              >
                + เพิ่มสินค้าใหม่
              </button>
            </div>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto pb-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <ProductRowSkeleton key={index} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center rounded-[2rem] bg-white/70 text-slate-400 shadow-[0_18px_40px_rgba(18,28,40,0.05)]">
                <p className="text-5xl">📦</p>
                <p className="mt-3 text-sm font-medium">
                  {search ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้า กดเพิ่มสินค้าใหม่เพื่อเริ่มต้น'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className={clsx(
                      'grid gap-4 rounded-[2rem] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(18,28,40,0.06)] transition sm:grid-cols-[88px_1.2fr_0.8fr_auto_auto]',
                      editing?.id === product.id && 'ring-2 ring-primary'
                    )}
                  >
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.4rem] bg-surface-low text-3xl">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        : '🛍️'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-on-surface">{product.name}</p>
                        {product.track_stock && (
                          <span className={clsx(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            product.stock_quantity > product.low_stock_threshold
                              ? 'bg-emerald-50 text-emerald-700'
                              : product.stock_quantity > 0
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-red-50 text-red-700'
                          )}>
                            {product.stock_quantity === 0
                              ? 'หมดแล้ว'
                              : product.stock_quantity <= product.low_stock_threshold
                                ? `ใกล้หมด ${product.stock_quantity}`
                                : `เหลือ ${product.stock_quantity}`}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-surface px-3 py-1 text-primary">
                          {product.categories?.name || 'ไม่ระบุหมวดหมู่'}
                        </span>
                        <span className="rounded-full bg-surface px-3 py-1 text-slate-500">
                          SKU: {product.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className="text-xs text-slate-400">ราคาขาย</p>
                      <p className="mt-1 font-display text-[1.9rem] font-semibold tracking-tight text-on-surface">
                        ฿{product.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <span className={clsx(
                        'rounded-full px-4 py-2 text-xs font-semibold',
                        product.is_available
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      )}>
                        {product.is_available ? 'พร้อมขาย' : 'ซ่อนจาก POS'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-[1rem] bg-surface px-4 py-3 text-sm font-medium text-primary transition hover:bg-surface-low"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => setConfirmId(product.id)}
                        className="rounded-[1rem] bg-red-50 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-100"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {showForm && (
          <aside className="w-full shrink-0 border-t border-white/50 bg-[linear-gradient(180deg,_rgba(237,243,255,0.9),_rgba(248,250,255,0.96))] xl:w-[380px] xl:border-l xl:border-t-0">
            <ProductForm
              product={editing}
              categories={categories}
              addonGroups={addonGroups}
              onSave={handleSave}
              onAddCategory={saveCategory}
              onCancel={handleCancel}
            />
          </aside>
        )}

        {confirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,28,40,0.3)] p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(18,28,40,0.2)]">
              <p className="text-center text-4xl">🗑️</p>
              <h3 className="mt-3 text-center font-display text-xl font-semibold text-on-surface">ลบสินค้านี้หรือไม่</h3>
              <p className="mt-2 text-center text-sm text-slate-400">การลบจะไม่กระทบประวัติออเดอร์เดิมในระบบ</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 rounded-[1.2rem] bg-surface px-4 py-3 text-sm font-semibold text-slate-500"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleDelete(confirmId)}
                  className="flex-1 rounded-[1.2rem] bg-red-500 px-4 py-3 text-sm font-semibold text-white"
                >
                  ลบเลย
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddonManager && (
          <AddonManagerModal
            shopId={shop?.id}
            onClose={() => setShowAddonManager(false)}
          />
        )}

        {showCategoryManager && (
          <CategoryManagerModal
            categories={categories}
            addonGroups={addonGroups}
            onClose={() => setShowCategoryManager(false)}
            onSave={saveCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            onReorder={updateCategoryOrder}
            onSaveAddonGroups={saveCategoryAddonGroups}
          />
        )}
      </div>
    </AppLayout>
  )
}
