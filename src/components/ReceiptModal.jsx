export default function ReceiptModal({ order, onClose }) {
  if (!order) return null

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

  const items = order.order_items || []
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,28,40,0.3)] p-4 backdrop-blur-sm dark:bg-[rgba(3,8,17,0.72)]">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(18,28,40,0.22)] dark:bg-[rgba(16,26,42,0.98)] dark:shadow-[0_30px_80px_rgba(2,8,20,0.58)]">
        <div className="bg-[linear-gradient(135deg,_#0f9f5c,_#22c55e)] px-6 py-6 text-center text-white">
          <p className="text-3xl">🧾</p>
          <h2 className="mt-2 font-display text-xl font-semibold">ใบเสร็จพร้อมใช้งาน</h2>
          <p className="mt-2 text-xs text-emerald-100">{formatTime(order.created_at)}</p>
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
                      <p className="font-medium text-on-surface">{item.products?.name}</p>
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

          {order.note && (
            <div className="rounded-[1.25rem] bg-blue-50 p-4 dark:bg-blue-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">หมายเหตุ</p>
              <p className="mt-2 text-sm text-blue-900">{order.note}</p>
            </div>
          )}

          <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4 dark:bg-[rgba(22,34,53,0.95)]">
            {order.discount_amount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">ราคาก่อนลด</span>
                  <span className="text-on-surface">฿{(order.total + order.discount_amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    ส่วนลด{order.discount_type === 'percent' ? ` (${order.discount_value}%)` : ''}
                  </span>
                  <span className="font-semibold text-rose-500">-฿{order.discount_amount.toFixed(2)}</span>
                </div>
                <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-2 dark:border-[rgba(120,144,184,0.14)]">
                  <span className="text-sm text-slate-500">ยอดสุทธิ</span>
                  <span className="font-display text-[2rem] font-semibold tracking-tight text-on-surface">
                    ฿{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-slate-500">ยอดรวมสุทธิ</span>
                <span className="font-display text-[2rem] font-semibold tracking-tight text-on-surface">
                  ฿{order.total.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">วิธีชำระเงิน</span>
            <span className="font-semibold text-on-surface">
              {PAYMENT_LABEL[order.payment_method]}
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 px-6 pb-6 pt-4 dark:border-[rgba(120,144,184,0.14)]">
          <button
            onClick={() => window.print()}
            className="w-full rounded-[1.25rem] bg-[linear-gradient(135deg,_#0f9f5c,_#22c55e)] py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            พิมพ์ใบเสร็จ
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-500 transition hover:text-on-surface dark:text-slate-400 dark:hover:text-slate-100"
          >
            ปิด
          </button>
        </div>

      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto; /* Thermal printer width 80mm */
          }
          body {
            margin: 0;
            padding: 2mm;
            background: white !important;
            color: black !important;
            font-size: 12px;
            font-family: monospace, sans-serif;
          }
          /* Hide the modal overlay since we are printing the modal itself */
          .fixed {
            position: relative !important;
            background: transparent !important;
            inset: auto !important;
            display: block !important;
          }
          .w-full.max-w-md {
            box-shadow: none !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            background: transparent !important;
          }
          /* Hide non-printable elements */
          button, .bg-black\\/40, .dark\\:bg-\\[rgba\\(3\\,8\\,17\\,0\\.72\\)\\] {
            display: none !important;
          }
          /* Override background colors and text colors for high contrast thermal printing */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .bg-\\[linear-gradient\\(135deg\\,_\\#0f9f5c\\,_\\#22c55e\\)\\] {
            background: transparent !important;
            color: black !important;
            border-bottom: 1px dashed black;
            padding-bottom: 10px;
          }
          .text-emerald-100, .text-white {
            color: black !important;
          }
          .bg-surface, .bg-blue-50, .bg-slate-50 {
            background: transparent !important;
            border-bottom: 1px dashed #ccc;
          }
          .rounded-\\[1\\.25rem\\], .rounded-\\[1\\.4rem\\], .rounded-full {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
