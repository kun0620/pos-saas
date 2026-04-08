// config กลาง — แก้ที่นี่ที่เดียว
export const PLANS = {
  free: {
    name:           'Free',
    price:          0,
    orderLimit:     50,      // orders ต่อวัน
    userLimit:      1,
    hasReport:      false,
    hasMultiBranch: false,
  },
  pro: {
    name:           'Pro',
    price:          299,     // บาท/เดือน
    orderLimit:     Infinity,
    userLimit:      10,
    hasReport:      true,
    hasMultiBranch: false,   // ไว้ทำ phase ถัดไป
  },
}

// เช็คว่า plan ปัจจุบันอนุญาต feature นี้ไหม
export function canUseFeature(plan, feature) {
  return PLANS[plan]?.[feature] ?? false
}

// เช็ค order limit
export function isOverOrderLimit(plan, todayCount) {
  const limit = PLANS[plan]?.orderLimit ?? 50
  return todayCount >= limit
}