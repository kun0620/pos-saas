import { PLANS } from '../lib/plans'
import { useAuthContext } from '../hooks/useAuthContext'

const PRO_FEATURES = [
  'ไม่จำกัดจำนวน order ต่อวัน',
  'Dashboard & รายงานยอดขาย',
  'จัดการ user หลายคน (สูงสุด 10 คน)',
  'Export รายงาน (เร็วๆ นี้)',
  'Multi-branch (เร็วๆ นี้)',
]

export default function UpgradeModal({ onClose, reason }) {
  const { shop } = useAuthContext();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,28,40,0.32)] p-4 backdrop-blur-sm dark:bg-[rgba(3,8,17,0.72)]">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(18,28,40,0.22)] dark:bg-[rgba(16,26,42,0.98)] dark:shadow-[0_30px_80px_rgba(2,8,20,0.58)]">
        <div className="bg-[linear-gradient(135deg,_#2563eb,_#004ac6)] px-6 py-6 text-center text-white">
          <p className="text-3xl">⚡</p>
          <h2 className="mt-2 font-display text-xl font-semibold">อัปเกรดเป็น Pro</h2>
          {reason && (
            <p className="mt-2 text-sm text-blue-100">{reason}</p>
          )}
        </div>

        <div className="border-b border-slate-100 py-5 text-center dark:border-[rgba(120,144,184,0.14)]">
          <span className="font-display text-[2.2rem] font-semibold tracking-tight text-on-surface dark:text-slate-100">
            ฿{PLANS.pro.price}
          </span>
          <span className="text-sm text-slate-400 dark:text-slate-400"> / เดือน</span>
        </div>

        <div className="space-y-3 px-6 py-5">
          {PRO_FEATURES.map(f => (
            <div key={f} className="flex items-start gap-3 rounded-[1.2rem] bg-surface px-4 py-3 dark:bg-[rgba(22,34,53,0.95)]">
              <span className="mt-0.5 text-sm text-emerald-600">✓</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{f}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 px-6 pb-6">
          <button
            onClick={() => {
              // สมมติว่านี่คือ Stripe Payment Link สำหรับอัปเกรด
              // ควรเปลี่ยนเป็น URL จริงจาก Stripe Dashboard ของคุณ
              const stripePaymentLink = 'https://buy.stripe.com/test_YOUR_LINK_ID_HERE';
              // ส่ง shop_id ไปใน URL เพื่อใช้กับ Webhook ยืนยันการชำระเงิน
              const shopId = shop?.id || 'unknown';
              window.open(`${stripePaymentLink}?client_reference_id=${shopId}`, '_blank');
            }}
            className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.28)] transition hover:brightness-105"
          >
            ชำระเงินด้วย Stripe →
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-slate-500 transition hover:text-on-surface dark:text-slate-400 dark:hover:text-slate-100"
          >
            ไว้ทีหลัง
          </button>
        </div>
      </div>
    </div>
  )
}
