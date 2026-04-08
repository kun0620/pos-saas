import { useState } from 'react'
import clsx from 'clsx'

export default function AddonSelectorModal({ product, groups: groupsProp, onClose, onAddToCart }) {
  const [selectedAddons, setSelectedAddons] = useState([])

  // Use groups from prop if provided, otherwise extract from product
  const groups = groupsProp?.length > 0
    ? groupsProp
    : product?.product_addon_groups?.map(pag => pag.addon_groups).filter(Boolean) || []

  function toggleAddon(group, addon) {
    if (group.max_selections === 1) {
      // Radio mode (Single selection)
      setSelectedAddons(prev => {
        const others = prev.filter(a => a.groupId !== group.id)
        return [...others, {
          ...addon,
          groupId: group.id,
          group_id: group.id,
          groupName: group.name,
          group_name: group.name,
        }]
      })
    } else {
      // Checkbox mode (Multiple selections)
      setSelectedAddons(prev => {
        const isSelected = prev.some(a => a.id === addon.id)
        if (isSelected) {
          return prev.filter(a => a.id !== addon.id)
        } else {
          const currentInGroup = prev.filter(a => a.groupId === group.id).length
          if (currentInGroup >= group.max_selections) return prev // Reached limit
          return [...prev, {
            ...addon,
            groupId: group.id,
            group_id: group.id,
            groupName: group.name,
            group_name: group.name,
          }]
        }
      })
    }
  }

  // Validate ALL required groups have at least 1 selection
  const isValid = groups.every(g => {
    if (!g.is_required) return true
    const count = selectedAddons.filter(a => a.groupId === g.id).length
    return count > 0 && count <= g.max_selections
  })

  function handleConfirm() {
    if (!isValid) return
    onAddToCart(product, selectedAddons)
    onClose()
  }

  const addonTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0)
  const total = product.price + addonTotal

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-900/70" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-slate-900">
        
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              ตัวเลือกเพิ่มเติม: {product.name}
            </h2>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">เลือกตัวเลือกที่คุณต้องการ</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {groups.map(group => {
            const isSingle = group.max_selections === 1
            const selectedCount = selectedAddons.filter(a => a.groupId === group.id).length
            
            return (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {group.name} 
                    {group.is_required && <span className="text-rose-500 ml-1">*</span>}
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {isSingle ? 'เลือก 1 อย่าง' : `เลือกได้สูงสุด ${group.max_selections} อย่าง`} ({selectedCount}/{group.max_selections})
                  </span>
                </div>
                
                <div className="space-y-2">
                  {group.addons?.map(addon => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id)
                    const disabled = !isSelected && !isSingle && selectedCount >= group.max_selections
                    
                    return (
                      <label 
                        key={addon.id} 
                        onClick={() => !disabled && toggleAddon(group, addon)}
                        className={clsx(
                          "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5 dark:bg-primary/10" 
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "flex items-center justify-center w-5 h-5 rounded border",
                            isSingle && "rounded-full",
                            isSelected ? "border-primary bg-primary" : "border-slate-300 dark:border-slate-600"
                          )}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className={clsx(
                            "text-sm font-medium",
                            isSelected ? "text-primary dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                          )}>
                            {addon.name}
                          </span>
                        </div>
                        {Number(addon.price) > 0 && (
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            +฿{Number(addon.price).toFixed(0)}
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex-shrink-0 p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">ยอดรวม (1 ชิ้น)</span>
            <span className="font-display text-2xl font-bold text-primary">฿{total.toFixed(0)}</span>
          </div>
          <button
            disabled={!isValid}
            onClick={handleConfirm}
            className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isValid ? 'เพิ่มลงตะกร้า' : 'โปรดเลือกที่ระบุ (*) ให้ครบถ้วน'}
          </button>
        </div>

      </div>
    </div>
  )
}
