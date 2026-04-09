import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ReceiptPublicPage() {
  const { orderId } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!orderId) {
        setError('ไม่พบหมายเลขใบเสร็จ')
        setLoading(false)
        return
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f-]{36}$/i
      if (!uuidRegex.test(orderId)) {
        setError('รูปแบบหมายเลขใบเสร็จไม่ถูกต้อง')
        setLoading(false)
        return
      }

      try {
        const { data, error: rpcError } = await supabase.rpc('get_public_receipt', {
          p_order_id: orderId
        })

        if (rpcError) {
          setError('ไม่สามารถโหลดใบเสร็จได้')
          console.error('RPC error:', rpcError)
        } else if (!data) {
          setError('ไม่พบใบเสร็จ')
        } else {
          setReceipt(data)
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาด')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReceipt()
  }, [orderId])

  const formatTime = (isoStr) => {
    return new Date(isoStr).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const PAYMENT_LABEL = {
    cash: 'เงินสด',
    transfer: 'โอนเงิน',
    card: 'บัตรเครดิต',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[rgba(16,26,42,0.98)] dark:to-[rgba(12,20,32,0.98)]">
        <div className="text-center">
          <p className="text-4xl mb-4">🧾</p>
          <p className="text-slate-500 dark:text-slate-400">กำลังโหลดใบเสร็จ...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[rgba(16,26,42,0.98)] dark:to-[rgba(12,20,32,0.98)] p-4">
        <div className="w-full max-w-md rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(18,28,40,0.22)] dark:bg-[rgba(16,26,42,0.98)] dark:shadow-[0_30px_80px_rgba(2,8,20,0.58)] p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-slate-600 dark:text-slate-300">{error}</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[rgba(16,26,42,0.98)] dark:to-[rgba(12,20,32,0.98)]">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูล</p>
        </div>
      </div>
    )
  }

  const items = receipt.items || []
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[rgba(16,26,42,0.98)] dark:to-[rgba(12,20,32,0.98)] p-4 py-8">
      <div className="w-full max-w-md mx-auto overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(18,28,40,0.22)] dark:bg-[rgba(16,26,42,0.98)] dark:shadow-[0_30px_80px_rgba(2,8,20,0.58)]">
        <div className="bg-[linear-gradient(135deg,_#0f9f5c,_#22c55e)] px-6 py-6 text-center text-white">
          <p className="text-3xl">🧾</p>
          <h1 className="mt-2 font-display text-xl font-semibold">ใบเสร็จ</h1>
          <p className="mt-1 text-sm text-emerald-100">{receipt.shop_name}</p>
          <p className="mt-2 text-xs text-emerald-100">{formatTime(receipt.created_at)}</p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-slate-500 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-300">
              {totalQuantity} ชิ้น
            </span>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-slate-500 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-300">
              {items.length} รายการ
            </span>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="py-2 text-center text-sm text-slate-400">ไม่มีรายการสินค้า</p>
            ) : (
              items.map((item, i) => {
                const addonTotal = (item.addons || []).reduce((sum, a) => sum + Number(a.price || 0), 0)
                const unitPrice = item.unit_price + addonTotal

                return (
                  <div key={i} className="flex items-start justify-between gap-4 rounded-[1.25rem] bg-surface px-4 py-3 text-sm dark:bg-[rgba(22,34,53,0.95)]">
                    <div>
                      <p className="font-medium text-on-surface">{item.product_name}</p>
                      {item.addons && item.addons.length > 0 && (
                         <p className="text-xs text-slate-500 mt-0.5">{item.addons.map(a => a.name).join(', ')}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">จำนวน {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-on-surface">
                      ฿{(unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4 dark:bg-[rgba(22,34,53,0.95)]">
            {receipt.discount_amount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">ราคาก่อนลด</span>
                  <span className="text-on-surface">฿{(receipt.total + receipt.discount_amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    ส่วนลด{receipt.discount_type === 'percent' ? ` (${receipt.discount_value}%)` : ''}
                  </span>
                  <span className="font-semibold text-rose-500">-฿{receipt.discount_amount.toFixed(2)}</span>
                </div>
                <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-2 dark:border-[rgba(120,144,184,0.14)]">
                  <span className="text-sm text-slate-500">ยอดสุทธิ</span>
                  <span className="font-display text-[2rem] font-semibold tracking-tight text-on-surface">
                    ฿{receipt.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-slate-500">ยอดรวมสุทธิ</span>
                <span className="font-display text-[2rem] font-semibold tracking-tight text-on-surface">
                  ฿{receipt.total.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">วิธีชำระเงิน</span>
            <span className="font-semibold text-on-surface">
              {PAYMENT_LABEL[receipt.payment_method] || receipt.payment_method}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 pb-6 pt-4 dark:border-[rgba(120,144,184,0.14)]">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            หมายเลขใบเสร็จ: {receipt.id}
          </p>
        </div>
      </div>
    </div>
  )
}
