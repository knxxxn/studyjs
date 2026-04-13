export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDDayText(targetDateStr) {
  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [ty, tm, td] = targetDateStr.split('-').map(Number)
  const target = new Date(ty, tm - 1, td)

  const diffTime = target - current
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) return `D-${diffDays}`
  if (diffDays === 0) return `D-Day`
  return `D+${Math.abs(diffDays)}`
}

export function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
