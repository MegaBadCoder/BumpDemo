// Форматирование для карточек и строки «почему подходит». Общее для сервера и страниц,
// часовой пояс задан явно, поэтому SSR и браузер пишут одно и то же.

const dayMonth = new Intl.DateTimeFormat('ru-RU', { timeZone: PERM_TIME_ZONE, day: 'numeric', month: 'long' })
const weekdayShort = new Intl.DateTimeFormat('ru-RU', { timeZone: PERM_TIME_ZONE, weekday: 'short' })
const hourMinute = new Intl.DateTimeFormat('ru-RU', { timeZone: PERM_TIME_ZONE, hour: '2-digit', minute: '2-digit' })

export function pluralRu(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

export function formatRub(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₽`
}

/** «сегодня», «завтра» или «сб, 26 сентября» */
export function formatDay(date: Date, now = new Date()): string {
  const day = permDay(date)
  const today = permDay(now)
  if (day === today) return 'сегодня'
  if (day === shiftDay(today, 1)) return 'завтра'
  return `${weekdayShort.format(date)}, ${dayMonth.format(date)}`
}

export function formatTime(date: Date): string {
  return hourMinute.format(date)
}

/** «сегодня в 14:05» — для отметки «обновлено» */
export function formatMoment(iso: string, now = new Date()): string {
  const date = new Date(iso)
  return `${formatDay(date, now)} в ${formatTime(date)}`
}

/** Когда идёт сеанс: «завтра, 19:00», «идёт сейчас, до 20:00», у выставки на много дней «до 29 октября» */
export function formatSessionWhen(session: EventSession, now = new Date()): string {
  const start = new Date(session.startsAt)
  const end = session.endsAt ? new Date(session.endsAt) : null
  if (end && permDay(end) !== permDay(start)) {
    return start > now
      ? `с ${dayMonth.format(start)} по ${dayMonth.format(end)}`
      : `до ${dayMonth.format(end)}`
  }
  if (end && start <= now && now < end) return `идёт сейчас, до ${formatTime(end)}`
  return `${formatDay(start, now)}, ${formatTime(start)}`
}

/** null — цены нет в источнике, её не додумываем */
export function formatPrice(session: EventSession): string | null {
  if (session.isFree) return 'бесплатно'
  const { priceMin, priceMax } = session
  if (priceMin !== null && priceMax !== null && priceMax > priceMin) {
    return `${priceMin.toLocaleString('ru-RU')}–${formatRub(priceMax)}`
  }
  if (priceMin !== null) return formatRub(priceMin)
  return session.priceText
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours && `${hours} ч`, rest && `${rest} мин`].filter(Boolean).join(' ')
}

export function formatVenue(venue: Venue | null): string {
  if (!venue) return 'онлайн'
  const place = venue.locality === 'Пермь' ? venue.district && `${venue.district} район` : venue.locality
  return [venue.name, place].filter(Boolean).join(' · ')
}
