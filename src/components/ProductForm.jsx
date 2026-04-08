import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'

const EMPTY_FORM = {
  name: '',
  price: '',
  category_id: '',
  image_url: '',
  is_available: true,
  selected_addon_group_ids: [],
  track_stock: false,
  stock_quantity: '',
  low_stock_threshold: '',
}

export default function ProductForm({ product, categories, addonGroups = [], onSave, onCancel, onAddCategory }) {
  const { shop } = useAuthContext()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [showNewCat, setShowNewCat] = useState(false)

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (product) {
        setForm({
          name: product.name,
          price: product.price.toString(),
          category_id: product.category_id || '',
          image_url: product.image_url || '',
          is_available: product.is_available,
          selected_addon_group_ids: (product.product_addon_groups || []).map((pag) => pag.group_id),
          track_stock: product.track_stock || false,
          stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : '',
          low_stock_threshold: product.low_stock_threshold ? product.low_stock_threshold.toString() : '',
        })
      } else {
        setForm(EMPTY_FORM)
      }

      setError('')
    })
  }, [product])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function toggleAddonGroup(groupId) {
    setForm((previous) => {
      const current = previous.selected_addon_group_ids || []
      const exists = current.includes(groupId)
      return {
        ...previous,
        selected_addon_group_ids: exists
          ? current.filter((id) => id !== groupId)
          : [...current, groupId],
      }
    })
  }

  async function handleImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('รูปภาพต้องมีขนาดไม่เกิน 2MB')
      return
    }

    setUploading(true)
    const extension = file.name.split('.').pop()
    const filePath = `${shop.id}/${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError('อัปโหลดรูปไม่สำเร็จ')
    } else {
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      setForm((previous) => ({ ...previous, image_url: data.publicUrl }))
    }

    setUploading(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) return setError('กรุณากรอกชื่อสินค้า')
    if (!form.price || isNaN(form.price)) return setError('กรุณากรอกราคาที่ถูกต้อง')

    if (form.track_stock) {
      if (form.stock_quantity === '' || isNaN(form.stock_quantity)) return setError('กรุณากรอกจำนวนคงเหลือ')
      if (form.low_stock_threshold === '' || isNaN(form.low_stock_threshold)) return setError('กรุณากรอกค่าเตือน')
    }

    setLoading(true)
    setError('')

    try {
      await onSave(form, product?.id)
    } catch (submissionError) {
      console.error('ProductForm save failed', submissionError)
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="border-b border-white/60 px-5 py-5 dark:border-[rgba(120,144,184,0.14)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400 dark:text-slate-400">{product ? 'แก้ไขข้อมูลสินค้า' : 'สร้างรายการใหม่'}</p>
            <h2 className="mt-1 font-display text-[1.65rem] font-semibold tracking-tight text-on-surface">
              {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-white/70 px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-on-surface dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-400 dark:hover:text-slate-100"
          >
            ปิด
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {error && (
          <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">รูปสินค้า</label>
          {form.image_url ? (
            <div className="relative overflow-hidden rounded-[1.6rem] bg-white shadow-[0_12px_32px_rgba(18,28,40,0.08)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_12px_32px_rgba(2,8,20,0.42)]">
              <img
                src={form.image_url}
                alt="preview"
                className="h-44 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setForm((previous) => ({ ...previous, image_url: '' }))}
                className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-[rgba(16,26,42,0.95)] dark:text-slate-300"
              >
                ลบรูป
              </button>
            </div>
          ) : (
            <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-slate-300 bg-white/70 px-5 text-center transition hover:border-primary hover:bg-white dark:border-[rgba(120,144,184,0.18)] dark:bg-[rgba(16,26,42,0.88)] dark:hover:bg-[rgba(22,34,53,0.95)]">
              <span className="text-4xl">🖼️</span>
              <span className="mt-3 text-sm font-semibold text-on-surface">
                {uploading ? 'กำลังอัปโหลดรูป...' : 'คลิกเพื่ออัปโหลดรูปภาพสินค้า'}
              </span>
              <span className="mt-2 text-xs text-slate-400 dark:text-slate-400">รองรับ JPG, PNG ไม่เกิน 2MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">
            ชื่อสินค้า <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="ระบุชื่อสินค้า"
            className="w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-primary dark:bg-[rgba(16,26,42,0.92)] dark:text-slate-100 dark:ring-[rgba(120,144,184,0.14)] dark:placeholder:text-slate-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              ราคา (฿) <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.50"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-primary dark:bg-[rgba(16,26,42,0.92)] dark:text-slate-100 dark:ring-[rgba(120,144,184,0.14)] dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">หมวดหมู่</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-primary dark:bg-[rgba(16,26,42,0.92)] dark:text-slate-100 dark:ring-[rgba(120,144,184,0.14)]"
            >
              <option value="">ไม่ระบุ</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {!showNewCat ? (
          <button
            type="button"
            onClick={() => setShowNewCat(true)}
            className="rounded-[1rem] bg-surface px-4 py-3 text-sm font-semibold text-primary"
          >
            + เพิ่มหมวดหมู่ใหม่
          </button>
        ) : (
          <div className="space-y-3 rounded-[1.4rem] bg-white p-4 shadow-[0_10px_24px_rgba(18,28,40,0.05)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_10px_24px_rgba(2,8,20,0.35)]">
            <input
              value={newCatName}
              onChange={(event) => setNewCatName(event.target.value)}
              placeholder="ชื่อหมวดหมู่"
              className="w-full rounded-[1rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!newCatName.trim()) return
                  if (onAddCategory) await onAddCategory(newCatName)
                  setNewCatName('')
                  setShowNewCat(false)
                }}
                className="flex-1 rounded-[1rem] bg-primary px-4 py-3 text-sm font-semibold text-white"
              >
                เพิ่มหมวดหมู่
              </button>
              <button
                type="button"
                onClick={() => setShowNewCat(false)}
                className="rounded-[1rem] bg-surface px-4 py-3 text-sm font-semibold text-slate-500 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-300"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(18,28,40,0.05)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_10px_24px_rgba(2,8,20,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">เปิดขายในหน้า POS</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">ถ้าปิดไว้ สินค้าจะยังอยู่ในระบบแต่จะไม่แสดงให้เลือกขาย</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((previous) => ({ ...previous, is_available: !previous.is_available }))}
              className={`relative h-8 w-14 rounded-full p-1 transition ${
                form.is_available ? 'bg-primary dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transition ${
                  form.is_available ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(18,28,40,0.05)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_10px_24px_rgba(2,8,20,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">ติดตามสต็อค</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">เปิดใช้เพื่อติดตามจำนวนสินค้าในคลังสินค้า</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((previous) => ({ ...previous, track_stock: !previous.track_stock }))}
              className={`relative h-8 w-14 rounded-full p-1 transition ${
                form.track_stock ? 'bg-primary dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transition ${
                  form.track_stock ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {form.track_stock && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">จำนวนคงเหลือ</label>
                <input
                  type="number"
                  name="stock_quantity"
                  min="0"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:ring-[rgba(120,144,184,0.14)] dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">แจ้งเตือนเมื่อเหลือไม่ถึง</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  min="0"
                  value={form.low_stock_threshold}
                  onChange={handleChange}
                  placeholder="5"
                  className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-slate-100 transition focus:ring-2 focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:ring-[rgba(120,144,184,0.14)] dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(18,28,40,0.05)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_10px_24px_rgba(2,8,20,0.35)]">
          <p className="text-sm font-semibold text-on-surface">กลุ่มตัวเลือกเสริม (Topping/Add-on)</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">เลือกกลุ่มที่ต้องการให้สินค้านี้ใช้งาน เช่น ความหวาน</p>

          {addonGroups.length === 0 ? (
            <p className="mt-3 rounded-[1rem] bg-surface px-3 py-2 text-xs text-slate-500 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-400">
              ยังไม่มีกลุ่มตัวเลือก กรุณาไปที่ “จัดการ Topping” ก่อน
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {addonGroups.map((group) => {
                const checked = (form.selected_addon_group_ids || []).includes(group.id)
                return (
                  <label
                    key={group.id}
                    className="flex items-start gap-3 rounded-[1rem] bg-surface px-3 py-2 text-sm dark:bg-[rgba(22,34,53,0.95)]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddonGroup(group.id)}
                      className="mt-0.5 h-4 w-4"
                    />
                    <div>
                      <p className="font-medium text-on-surface">{group.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-400">
                        {group.is_required ? 'บังคับเลือกอย่างน้อย 1' : 'ไม่บังคับ'} • สูงสุด {group.max_selections} อย่าง
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 border-t border-white/60 px-5 py-5 dark:border-[rgba(120,144,184,0.14)]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold text-slate-500 dark:bg-[rgba(16,26,42,0.92)] dark:text-slate-300"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
        </button>
      </div>
    </form>
  )
}
