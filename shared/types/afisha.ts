// Типы афиши. Повторяют ER-модель из Miro (фрейм «ER-модель событий»),
// но в том виде, в каком их получают страницы: сеанс уже с площадкой, источник уже с названием.

export type Setting = 'indoor' | 'outdoor' | 'online'
export type EventStatus = 'active' | 'cancelled'
export type SessionStatus = 'scheduled' | 'cancelled' | 'moved'
export type SourceKind = 'api' | 'jsonld' | 'html' | 'telegram' | 'vk' | 'form'
export type FetchStatus = 'ok' | 'partial' | 'failed'
export type Audience = 'parents' | 'friends' | 'tourists'

/** Поля, которых нет в источнике или которые ИИ вытащил из поста. В карточке помечаются «не проверено» */
export type VerifiableField = 'ageMin' | 'durationMin' | 'setting' | 'price' | 'address'

export interface Venue {
  name: string
  address: string | null
  locality: string
  district: string | null
}

export interface EventSession {
  id: number
  startsAt: string
  endsAt: string | null
  /** null у онлайн-событий */
  venue: Venue | null
  priceMin: number | null
  priceMax: number | null
  /** Цена как в источнике, если числа вытащить не удалось */
  priceText: string | null
  isFree: boolean
  ticketUrl: string | null
  status: SessionStatus
  movedFrom: string | null
}

export interface EventSourceRef {
  sourceId: number
  sourceName: string
  kind: SourceKind
  url: string
  /** Ссылка из карточки ведёт на основной источник */
  isPrimary: boolean
  /** Рубрика, как её назвал источник */
  categoryRaw: string | null
  lastSeenAt: string
}

export interface EventImage {
  url: string
  /** photo — из источника, illustration — сгенерирована, подписываем «не фото события» */
  kind: 'photo' | 'illustration'
  credit: string | null
}

export interface Presentation {
  audience: Audience
  /** Подача от ИИ. Факты (дата, цена, возраст) в неё не входят, они только из источника */
  body: string
}

export interface EventDetails {
  id: number
  title: string
  description: string | null
  categories: string[]
  ageMin: number | null
  durationMin: number | null
  setting: Setting | null
  status: EventStatus
  unverifiedFields: VerifiableField[]
  /** Продвижение от организатора, в выдаче с пометкой «Реклама» */
  isPromo: boolean
  image: EventImage | null
  sessions: EventSession[]
  sources: EventSourceRef[]
  presentations: Presentation[]
}

export interface EventPage extends EventDetails {
  /** Не осталось будущих сеансов: событие открывается по ссылке, но в выдачу не попадает */
  isPast: boolean
}

export interface EventSummary {
  id: number
  title: string
  categories: string[]
  ageMin: number | null
  setting: Setting | null
  isPromo: boolean
  image: EventImage | null
  /** Ближайший сеанс, подходящий под условия */
  nextSession: EventSession
  /** Сколько всего сеансов подходит под условия */
  sessionsCount: number
  /** Строка «почему подходит», есть только когда заданы условия */
  reason: string | null
}

export interface SourceInfo {
  id: number
  name: string
  kind: SourceKind
  url: string
  coverage: string
  schedule: string
  eventsCount: number
  lastRun: {
    startedAt: string
    status: FetchStatus
    error: string | null
  }
}

export interface SourcesResponse {
  sources: SourceInfo[]
  /** Уникальных событий: одно событие из трёх источников считается один раз */
  eventsTotal: number
}

export type DatePreset = 'today' | 'tonight' | 'tomorrow' | 'weekend'
export type Company = 'kids' | 'friends' | 'couple' | 'solo'

/** Условия поиска. Одни и те же и для чипов распознанного запроса, и для фильтров */
export interface SearchFilters {
  date?: DatePreset
  city?: string
  district?: string
  /** Потолок цены в рублях, 0 — только бесплатные */
  budget?: number
  /** Возраст самого младшего в компании */
  age?: number
  /** Максимальная длительность в минутах */
  duration?: number
  setting?: Setting
  company?: Company
  category?: string
}

export type FilterKey = keyof SearchFilters

export interface Relaxation {
  key: FilterKey
  label: string
  /** Сколько событий найдётся без этого условия */
  count: number
}

export interface SearchResponse {
  events: EventSummary[]
  /** Советы ослабить условие, только для пустой выдачи */
  relaxations: Relaxation[]
  /** Источники, чей последний сбор упал: часть событий может отсутствовать */
  failedSources: SourceInfo[]
}

export interface QuizOption {
  value: string
  label: string
  /** Сколько событий останется, если выбрать этот ответ */
  count: number
}

export interface QuizQuestion {
  key: FilterKey
  text: string
  options: QuizOption[]
}

export interface QuizStep {
  /** Сколько событий подходит под ответы */
  remaining: number
  /** Следующий вопрос; null — спрашивать больше нечего */
  question: QuizQuestion | null
}
