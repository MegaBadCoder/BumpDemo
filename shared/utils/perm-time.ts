// Все даты афиши считаем по Перми, где бы ни работал сервер и браузер.
// В России нет перехода на летнее время, поэтому смещение постоянное.
export const PERM_TIME_ZONE = 'Asia/Yekaterinburg'
const PERM_OFFSET = '+05:00'

const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: PERM_TIME_ZONE })

/** Календарный день в Перми: '2026-09-19' */
export function permDay(date: Date): string {
  return dayFormat.format(date)
}

export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Момент времени по пермским часам: permTime('2026-09-19', '19:00') */
export function permTime(day: string, time = '00:00'): Date {
  return new Date(`${day}T${time}:00${PERM_OFFSET}`)
}

/** День недели: 0 — воскресенье, 6 — суббота */
export function weekdayOf(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay()
}
