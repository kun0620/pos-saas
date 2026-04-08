import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useAuthContext } from '../hooks/useAuthContext'

const PAYMENT_METHODS = [
  { value: 'cash',     label: 'เงินสด',    icon: '💵' },
  { value: 'transfer', label: 'โอนเงิน',   icon: '📱' },
  { value: 'card',     label: 'บัตรเครดิต', icon: '💳' },
]

export default function PaymentModal({ onClose, onSuccess }) {
  const { shop, user }  = useAuthContext()
  const { items, getTotal, clearCart } = useCartStore()
  const [method, setMethod]   = useState('cash')
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [discount, setDiscount] = useState({ type: 'percent', value: '' })

  const total = getTotal()
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const discountValue = parseFloat(discount.value) || 0
  const discountAmount = discount.type === 'percent'
    ? total * (discountValue / 100)
    : discountValue
  const finalTotal = Math.max(0, total - discountAmount)
  const discountExceedsTotal = discountAmount > total

  async function handleConfirm() {
    if (discountExceedsTotal) {
      setError('ส่วนลดต้องไม่เกินยอดรวม')
      return
    }

    setLoading(true)
    setError('')

    const orderPayload = {
      shop_id:        shop.id,
      created_by:     user.id,
      total:          finalTotal,
      payment_method: method,
      status:         'completed',
      note:           note.trim() || null,
    }

    if (discountAmount > 0) {
      orderPayload.discount_type   = discount.type
      orderPayload.discount_value  = discountValue
      orderPayload.discount_amount = discountAmount
    }

    // 1. สร้าง order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single()

    if (orderError) {
      setError('บันทึก order ไม่สำเร็จ')
      setLoading(false)
      return
    }

    // 2. insert order_items ทั้งหมดพร้อมกัน
    const orderItems = items.map(i => ({
      order_id:   order.id,
      product_id: i.product.id,
      quantity:   i.quantity,
      unit_price: i.product.price,
      addons: (i.addons || []).map((addon) => ({
        id: addon.id,
        group_id: addon.group_id ?? addon.groupId ?? null,
        group_name: addon.group_name ?? addon.groupName ?? null,
        name: addon.name,
        price: Number(addon.price || 0),
      })),
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      setError('บันทึกรายการสินค้าไม่สำเร็จ')
      setLoading(false)
      return
    }

    clearCart()
    const orderWithItems = {
      ...order,
      order_items: items.map(i => ({
        products: { name: i.product.name },
        quantity: i.quantity,
        unit_price: i.product.price,
        addons: (i.addons || []).map((addon) => ({
          id: addon.id,
          group_id: addon.group_id ?? addon.groupId ?? null,
          group_name: addon.group_name ?? addon.groupName ?? null,
          name: addon.name,
          price: Number(addon.price || 0),
        })),
      }))
    }
    onSuccess(orderWithItems)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(221,228,241,0.72)] p-4 backdrop-blur-sm dark:bg-[rgba(3,8,17,0.72)]">
      <div className="bg-app-card w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(18,28,40,0.2)] dark:shadow-[0_30px_80px_rgba(2,8,20,0.58)]">
        <div className="border-app flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-on-surface">ชำระเงิน</h2>
            <p className="text-app-subtle mt-1 text-sm">{shop?.name || 'Boutique POS'}</p>
          </div>
          <button onClick={onClose} className="bg-app-card-soft text-app-subtle hover:text-app flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none transition">×</button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="bg-app-card-soft rounded-[1.5rem] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(120,144,184,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-app-subtle text-sm">ยอดรวมทั้งหมด</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="bg-app-card rounded-full px-3 py-1 text-xs font-medium text-app-muted">
                    {totalQuantity} ชิ้น
                  </span>
                  <span className="bg-app-card rounded-full px-3 py-1 text-xs font-medium text-app-muted">
                    {items.length} รายการ
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-[2rem] font-semibold tracking-tight text-primary">
                  ฿{total.toFixed(2)}
                </p>
                <p className="text-app-subtle mt-3 text-xs">บันทึกเป็นยอดสรุปตามระบบปัจจุบัน</p>
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className="bg-app-card-soft rounded-[1.5rem] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(120,144,184,0.12)]">
            <p className="mb-3 text-sm font-semibold text-on-surface">ส่วนลด</p>
            <div className="flex gap-2">
              <div className="flex overflow-hidden rounded-[1rem] border border-app-strong bg-app-card">
                <button
                  onClick={() => setDiscount(d => ({ ...d, type: 'percent' }))}
                  className={`px-3 py-2 text-sm font-semibold transition ${
                    discount.type === 'percent'
                      ? 'bg-primary text-white'
                      : 'text-app-muted hover:text-app'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setDiscount(d => ({ ...d, type: 'fixed' }))}
                  className={`px-3 py-2 text-sm font-semibold transition ${
                    discount.type === 'fixed'
                      ? 'bg-primary text-white'
                      : 'text-app-muted hover:text-app'
                  }`}
                >
                  ฿
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discount.value}
                onChange={e => setDiscount(d => ({ ...d, value: e.target.value }))}
                placeholder={discount.type === 'percent' ? 'เช่น 10' : 'เช่น 50'}
                className={`bg-app-card text-app placeholder:text-app-subtle flex-1 rounded-[1rem] px-4 py-2 text-sm outline-none ring-2 transition ${
                  discountExceedsTotal ? 'ring-red-400' : 'ring-transparent focus:ring-primary'
                }`}
              />
            </div>
            {discountAmount > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-app-subtle">ลด</span>
                  <span className="font-semibold text-rose-500">-฿{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">ยอดสุทธิ</span>
                  <span className="font-display text-[1.5rem] font-semibold tracking-tight text-primary">
                    ฿{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {discountExceedsTotal && (
              <p className="mt-2 text-xs text-red-500">ส่วนลดต้องไม่เกินยอดรวม</p>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-on-surface">เลือกวิธีการชำระเงิน</p>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`rounded-[1.35rem] border px-3 py-4 text-center text-sm transition-all ${
                    method === m.value
                      ? 'border-primary bg-blue-50 text-primary shadow-[0_10px_24px_rgba(37,99,235,0.15)]'
                      : 'border-app-strong bg-app-card text-app-muted hover:bg-app-card-soft'
                  }`}
                >
                  <span className="block text-2xl">{m.icon}</span>
                  <span className="mt-2 block font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="ระบุรายละเอียดการชำระเงินหรือคำสั่งพิเศษ"
              className="bg-app-card-soft text-app placeholder:text-app-subtle w-full resize-none rounded-[1.35rem] px-4 py-3 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary"
              rows="3"
            />
          </div>

          <div className="flex items-center justify-between rounded-[1.35rem] bg-emerald-50 px-4 py-3 text-sm dark:bg-emerald-950/40">
            <div>
              <p className="font-semibold text-emerald-800">พร้อมออกใบเสร็จทันที</p>
              <p className="mt-1 text-xs text-emerald-700">หลังชำระสำเร็จระบบจะเปิด receipt ให้ตรวจสอบต่อ</p>
            </div>
            <div className="h-7 w-12 rounded-full bg-emerald-500/90 p-1">
              <div className="ml-auto h-5 w-5 rounded-full bg-white dark:bg-slate-100" />
            </div>
          </div>

          {error && (
            <p className="rounded-[1.2rem] bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="text-app-muted hover:bg-app-card-soft flex-1 rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition hover:text-app"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || discountExceedsTotal}
              className="flex-1 rounded-[1.25rem] bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(37,99,235,0.28)] transition hover:shadow-[0_18px_36px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:disabled:from-[rgba(92,108,135,0.7)] dark:disabled:to-[rgba(92,108,135,0.7)]"
            >
              {loading ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
