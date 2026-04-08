export function getDateRange(period) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (period === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (period === '7days') {
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  } else if (period === '30days') {
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  }

  return {
    start,
    end,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}

export function getPreviousPeriodStart(start, end) {
  const previousStart = new Date(start)
  const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24))
  previousStart.setDate(previousStart.getDate() - (daysDiff + 1))
  return previousStart
}
