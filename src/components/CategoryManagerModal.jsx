import { useState } from 'react'
import clsx from 'clsx'

export default function CategoryManagerModal({
  categories,
  addonGroups,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onReorder,
  onSaveAddonGroups,
}) {
  const [newCatName, setNewCatName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  // Initialize with saved values from DB
  const [selectedAddons, setSelectedAddons] = useState(() => {
    const initial = {}
    categories.forEach(cat => {
      initial[cat.id] = cat.category_addon_groups?.map(cag => cag.group_id) || []
    })
    return initial
  })
  const [orderedIds, setOrderedIds] = useState(categories.map(c => c.id))

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    await onSave(newCatName)
    setNewCatName('')
  }

  const handleUpdateCategory = async (id, name) => {
    if (!name.trim()) return
    await onUpdate(id, name)
    setEditingId(null)
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('ลบหมวดหมู่นี้หรือไม่? สินค้าจะเปลี่ยนเป็น "ไม่ระบุ"')) {
      await onDelete(id)
    }
  }

  const handleReorder = async () => {
    await onReorder(orderedIds)
  }

  const moveUp = (index) => {
    if (index > 0) {
      const newOrder = [...orderedIds]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      setOrderedIds(newOrder)
    }
  }

  const moveDown = (index) => {
    if (index < orderedIds.length - 1) {
      const newOrder = [...orderedIds]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      setOrderedIds(newOrder)
    }
  }

  const handleToggleAddonGroup = (categoryId, groupId) => {
    setSelectedAddons(prev => {
      const key = categoryId
      const current = prev[key] || []
      const isSelected = current.includes(groupId)
      return {
        ...prev,
        [key]: isSelected
          ? current.filter(id => id !== groupId)
          : [...current, groupId],
      }
    })
  }

  const handleSaveAddonGroups = async (categoryId) => {
    const groupIds = selectedAddons[categoryId] || []
    await onSaveAddonGroups(categoryId, groupIds)
    // Keep local state as-is (reflects what was just saved)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-900/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-slate-900">

        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              จัดการหมวดหมู่
            </h2>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">เพิ่ม แก้ไข ลบ และเรียงลำดับหมวดหมู่</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* เพิ่มหมวดหมู่ใหม่ */}
          <div className="rounded-[1.4rem] bg-slate-50 p-4 dark:bg-[rgba(16,26,42,0.92)]">
            <div className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="ชื่อหมวดหมู่ใหม่"
                className="flex-1 rounded-[1rem] bg-white px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:ring-slate-700"
              />
              <button
                onClick={handleAddCategory}
                className="rounded-[1rem] bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105"
              >
                เพิ่ม
              </button>
            </div>
          </div>

          {/* รายชื่อหมวดหมู่ */}
          <div className="space-y-2">
            {orderedIds.map((catId, index) => {
              const cat = categories.find(c => c.id === catId)
              if (!cat) return null
              const isEditingThis = editingId === catId

              return (
                <div key={catId} className="rounded-[1.2rem] border border-slate-200 p-4 dark:border-slate-700">
                  {/* Header: ชื่อและปุ่ม */}
                  <div className="flex items-center justify-between mb-3">
                    {isEditingThis ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-[0.8rem] bg-white px-3 py-2 text-sm text-on-surface outline-none ring-1 ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{cat.name}</span>
                    )}
                    <div className="flex gap-2">
                      {isEditingThis ? (
                        <>
                          <button
                            onClick={() => handleUpdateCategory(catId, editingName)}
                            className="text-xs px-3 py-1.5 rounded-[0.8rem] bg-primary text-white font-medium"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs px-3 py-1.5 rounded-[0.8rem] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          >
                            ยกเลิก
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(catId)
                              setEditingName(cat.name)
                            }}
                            className="text-xs px-3 py-1.5 rounded-[0.8rem] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(catId)}
                            className="text-xs px-3 py-1.5 rounded-[0.8rem] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          >
                            ลบ
                          </button>
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="text-xs px-3 py-1.5 rounded-[0.8rem] bg-slate-200 text-slate-700 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === orderedIds.length - 1}
                            className="text-xs px-3 py-1.5 rounded-[0.8rem] bg-slate-200 text-slate-700 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300"
                          >
                            ▼
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ผูก Addon Groups */}
                  {!isEditingThis && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">กลุ่มตัวเลือกเสริม</div>
                      <div className="space-y-1">
                        {addonGroups.map(group => {
                          const isSelected = (selectedAddons[catId] || []).includes(group.id)
                          return (
                            <label
                              key={group.id}
                              className="flex items-center gap-2 p-2 rounded-[0.8rem] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleAddonGroup(catId, group.id)}
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">{group.name}</span>
                            </label>
                          )
                        })}
                      </div>
                      {(selectedAddons[catId] || []).length > 0 && (
                        <button
                          onClick={() => handleSaveAddonGroups(catId)}
                          className="w-full text-xs px-3 py-2 rounded-[0.8rem] bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-medium"
                        >
                          บันทึกกลุ่มตัวเลือก
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-shrink-0 p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          {orderedIds.toString() !== categories.map(c => c.id).toString() && (
            <button
              onClick={handleReorder}
              className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
            >
              บันทึกลำดับหมวดหมู่
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full mt-2 rounded-[1.2rem] bg-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
