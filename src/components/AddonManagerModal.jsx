import { useState } from 'react'
import { useAddonManager } from '../hooks/useAddonManager'

export default function AddonManagerModal({ shopId, onClose }) {
  const { addonGroups, loading, saveGroup, deleteGroup, saveAddon, deleteAddon, createSweetnessPreset } = useAddonManager(shopId)
  
  const [editingGroup, setEditingGroup] = useState(null)
  const [creatingPreset, setCreatingPreset] = useState(false)
  
  // Group Form Form State
  const [groupName, setGroupName] = useState('')
  const [isRequired, setIsRequired] = useState(false)
  const [maxSelections, setMaxSelections] = useState(1)
  
  // Addon Form State (linked to a group)
  const [addingAddonTo, setAddingAddonTo] = useState(null)
  const [addonName, setAddonName] = useState('')
  const [addonPrice, setAddonPrice] = useState('0')

  function openNewGroup() {
    setEditingGroup('new')
    setGroupName('')
    setIsRequired(false)
    setMaxSelections(1)
  }

  async function handleSaveGroup() {
    if (!groupName.trim()) return
    await saveGroup(groupName, isRequired, Number(maxSelections), editingGroup === 'new' ? null : editingGroup.id)
    setEditingGroup(null)
  }

  async function handleSaveAddon(groupId) {
    if (!addonName.trim()) return
    await saveAddon(groupId, addonName, Number(addonPrice))
    setAddingAddonTo(null)
    setAddonName('')
    setAddonPrice('0')
  }

  async function handleCreateSweetnessPreset() {
    setCreatingPreset(true)
    try {
      await createSweetnessPreset()
    } finally {
      setCreatingPreset(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">จัดการกลุ่ม Topping / Add-ons</h2>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          {editingGroup && (
            <div className="mb-8 p-5 bg-white border border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">
                {editingGroup === 'new' ? 'สร้างกลุ่มตัวเลือกใหม่' : 'แก้ไขกลุ่มตัวเลือก'}
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className="block text-sm text-slate-500 mb-1">ชื่อกลุ่ม (เช่น ความหวาน, ท็อปปิ้ง)</label>
                  <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">สถานะบังคับเลือก</label>
                  <select value={isRequired} onChange={e => setIsRequired(e.target.value === 'true')} className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700">
                    <option value={false}>ไม่บังคับ (เลือกหรือไม่ก็ได้)</option>
                    <option value={true}>บังคับเลือกอย่างน้อย 1 รายการ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">เลือกได้สูงสุดกี่รายการ (ตัวเลข)</label>
                  <input type="number" min="1" value={maxSelections} onChange={e => setMaxSelections(e.target.value)} className="w-full rounded-xl border p-2.5 dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={handleSaveGroup} className="w-full rounded-xl bg-primary text-white py-2.5 font-medium hover:bg-primary-dark">บันทึก</button>
                  <button onClick={() => setEditingGroup(null)} className="w-full rounded-xl bg-slate-200 text-slate-700 py-2.5 font-medium hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300">ยกเลิก</button>
                </div>
              </div>
            </div>
          )}

          {!editingGroup && (
            <div className="mb-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={handleCreateSweetnessPreset}
                disabled={creatingPreset}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingPreset ? 'กำลังสร้าง preset...' : 'สร้าง preset ความหวาน'}
              </button>
              <button onClick={openNewGroup} className="bg-primary text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:brightness-105">+ เพิ่มกลุ่มตัวเลือกใหม่</button>
            </div>
          )}

          {loading ? (
             <p className="text-center text-slate-400">กำลังโหลด...</p>
          ) : addonGroups.length === 0 ? (
             <p className="text-center text-slate-500 my-10">ยังไม่มีกลุ่มตัวเลือก</p>
          ) : (
            <div className="space-y-6">
              {addonGroups.map(group => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm dark:bg-[rgba(22,34,53,0.95)] dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{group.name}</h3>
                      <p className="text-sm text-slate-500">
                        {group.is_required ? <span className="text-rose-500 font-medium">บังคับเลือก</span> : 'ตัวเลือกเสริม'} • เลือกได้สูงสุด {group.max_selections} อย่าง
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => deleteGroup(group.id)} className="text-red-500 text-sm hover:underline">ลบกลุ่ม</button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {group.addons?.map(addon => (
                      <div key={addon.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{addon.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">+฿{Number(addon.price).toFixed(2)}</span>
                          <button onClick={() => deleteAddon(addon.id)} className="text-slate-400 hover:text-red-500">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {addingAddonTo === group.id ? (
                     <div className="flex gap-2 items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <input type="text" placeholder="ชื่อตัวเลือก เช่น ไข่มุก" value={addonName} onChange={e => setAddonName(e.target.value)} className="flex-1 rounded p-2 text-sm bg-white dark:bg-slate-900" />
                        <input type="number" placeholder="ราคา" value={addonPrice} onChange={e => setAddonPrice(e.target.value)} className="w-24 rounded p-2 text-sm bg-white dark:bg-slate-900" />
                        <button onClick={() => handleSaveAddon(group.id)} className="bg-primary text-white px-3 py-2 rounded text-sm font-medium">เพิ่ม</button>
                        <button onClick={() => setAddingAddonTo(null)} className="text-slate-500 text-sm px-2">ยกเลิก</button>
                     </div>
                  ) : (
                     <button onClick={() => { setAddingAddonTo(group.id); setAddonPrice('0'); setAddonName(''); }} className="text-primary font-medium text-sm hover:underline">+ เพิ่มตัวเลือกย่อยลงกลุ่มนี้</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
