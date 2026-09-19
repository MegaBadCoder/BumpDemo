// Данные афиши для API. Сейчас берутся из заглушек в server/mock.
// Когда в Supabase появятся сеансы, площадки и источники, меняются только эти функции,
// а API и страницы остаются как есть.
import { buildMockEvents } from '../mock/events'
import { buildMockSources } from '../mock/sources'

/** «С ребёнком» без указанного возраста: берём события, куда пускают с шести лет */
const KIDS_DEFAULT_AGE = 6

export function findEvent(id: number, now = new Date()): EventPage | null {
  const event = buildMockEvents(now).find(item => item.id === id)
  if (!event) return null

  const future = event.sessions.filter(session => sessionEnd(session, event) > now)
  return {
    ...event,
    // У прошедшего события показываем все сеансы, чтобы было видно, когда оно шло
    sessions: future.length ? future : event.sessions,
    isPast: !future.some(session => session.status !== 'cancelled')
  }
}

export function listSources(now = new Date()): SourcesResponse {
  const events = buildMockEvents(now)
  const sources = buildMockSources(now).map(source => ({
    ...source,
    eventsCount: events.filter(event => event.sources.some(ref => ref.sourceId === source.id)).length
  }))
  return { sources, eventsTotal: events.length }
}

export function searchEvents(filters: SearchFilters, now = new Date()): SearchResponse {
  const events = buildMockEvents(now)
  const found = findMatches(events, filters, now)

  const relaxations = found.length
    ? []
    : activeFilterKeys(filters)
        .map(key => {
          const rest = { ...filters }
          delete rest[key]
          return { key, label: filterLabel(key, filters), count: findMatches(events, rest, now).length }
        })
        .filter(relaxation => relaxation.count > 0)
        .sort((a, b) => b.count - a.count)

  const hasFilters = activeFilterKeys(filters).length > 0
  return {
    events: found
      // Промо поднимается наверх, но только если само подошло под условия
      .sort((a, b) => Number(b.event.isPromo) - Number(a.event.isPromo))
      .map(match => toSummary(match, hasFilters ? buildReason(match.event, match.sessions[0]!, filters, now) : null)),
    relaxations,
    failedSources: listSources(now).sources.filter(source => source.lastRun.status === 'failed')
  }
}

/** Все предстоящие события по порядку, без условий и без подъёма промо */
export function listUpcomingEvents(now = new Date()): EventSummary[] {
  return findMatches(buildMockEvents(now), {}, now).map(match => toSummary(match, null))
}

interface Match {
  event: EventDetails
  sessions: EventSession[]
}

/** События с подходящими сеансами, по времени ближайшего сеанса */
function findMatches(events: EventDetails[], filters: SearchFilters, now: Date): Match[] {
  return events
    .map(event => ({ event, sessions: matchingSessions(event, filters, now) }))
    .filter(match => match.sessions.length > 0)
    .sort((a, b) => Date.parse(a.sessions[0]!.startsAt) - Date.parse(b.sessions[0]!.startsAt))
}

function toSummary({ event, sessions }: Match, reason: string | null): EventSummary {
  return {
    id: event.id,
    title: event.title,
    categories: event.categories,
    ageMin: event.ageMin,
    setting: event.setting,
    isPromo: event.isPromo,
    image: event.image,
    nextSession: sessions[0]!,
    sessionsCount: sessions.length,
    reason
  }
}

/**
 * Сеансы события, подходящие под условия. Неизвестное значение условию не удовлетворяет:
 * если в источнике нет цены, мы не обещаем, что событие уложится в бюджет.
 */
function matchingSessions(event: EventDetails, filters: SearchFilters, now: Date): EventSession[] {
  if (event.status === 'cancelled') return []

  if (filters.age !== undefined || filters.company === 'kids') {
    const youngest = filters.age ?? KIDS_DEFAULT_AGE
    if (event.ageMin === null || event.ageMin > youngest) return []
  }
  if (filters.company && filters.company !== 'kids' && event.categories.includes('детям')) return []
  if (filters.duration !== undefined && (event.durationMin === null || event.durationMin > filters.duration)) return []
  if (filters.setting && event.setting !== filters.setting) return []
  if (filters.category && !event.categories.includes(filters.category)) return []

  const range = filters.date ? dateRange(filters.date, now) : null
  return event.sessions
    .filter(session => session.status !== 'cancelled' && sessionEnd(session, event) > now)
    .filter((session) => {
      if (range && !(Date.parse(session.startsAt) < range.to.getTime() && sessionEnd(session, event) > range.from)) {
        return false
      }
      const { budget, city, district } = filters
      if (budget !== undefined && !session.isFree && (session.priceMin === null || session.priceMin > budget)) return false
      if (budget === 0 && !session.isFree) return false
      if (city && session.venue?.locality !== city) return false
      if (district && session.venue?.district !== district) return false
      return true
    })
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}

function sessionEnd(session: EventSession, event: EventDetails): Date {
  if (session.endsAt) return new Date(session.endsAt)
  return new Date(Date.parse(session.startsAt) + (event.durationMin ?? 0) * 60_000)
}

function dateRange(preset: DatePreset, now: Date): { from: Date, to: Date } {
  const today = permDay(now)
  const tomorrow = shiftDay(today, 1)
  const notBefore = (date: Date) => (date > now ? date : now)

  switch (preset) {
    case 'today':
      return { from: now, to: permTime(tomorrow) }
    case 'tonight':
      return { from: notBefore(permTime(today, '17:00')), to: permTime(tomorrow) }
    case 'tomorrow':
      return { from: permTime(tomorrow), to: permTime(shiftDay(today, 2)) }
    case 'weekend': {
      const weekday = weekdayOf(today)
      const saturday = weekday === 0 ? shiftDay(today, -1) : shiftDay(today, 6 - weekday)
      return { from: notBefore(permTime(saturday)), to: permTime(shiftDay(saturday, 2)) }
    }
  }
}

/** «завтра, 11:00, для 0+, в помещении, 400–600 ₽»: только то, о чём спрашивали */
function buildReason(event: EventDetails, session: EventSession, filters: SearchFilters, now: Date): string | null {
  const parts: (string | null)[] = []
  if (filters.date) parts.push(formatSessionWhen(session, now))
  if (filters.district) parts.push(session.venue?.district ? `${session.venue.district} район` : null)
  else if (filters.city) parts.push(session.venue?.locality ?? null)
  if (filters.age !== undefined || filters.company === 'kids') parts.push(`для ${event.ageMin}+`)
  if (filters.setting) parts.push(SETTING_LABELS[filters.setting])
  if (filters.duration !== undefined && event.durationMin) parts.push(formatDuration(event.durationMin))
  if (filters.category) parts.push(filters.category)
  if (filters.budget !== undefined) parts.push(formatPrice(session))
  return parts.filter(Boolean).join(', ') || null
}
