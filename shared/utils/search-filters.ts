// Условия поиска живут в адресе /search: ?date=tomorrow&company=kids&budget=1500.
// Отсюда их читают и страница (чипы, фильтры), и сервер (подбор), поэтому словари общие.

export const DATE_LABELS: Record<DatePreset, string> = {
  today: 'сегодня',
  tonight: 'сегодня вечером',
  tomorrow: 'завтра',
  weekend: 'на выходных'
}

export const SETTING_LABELS: Record<Setting, string> = {
  indoor: 'в помещении',
  outdoor: 'на улице',
  online: 'онлайн'
}

export const COMPANY_LABELS: Record<Company, string> = {
  kids: 'с ребёнком',
  friends: 'с друзьями',
  couple: 'вдвоём',
  solo: 'одному'
}

export const AUDIENCE_LABELS: Record<Audience, string> = {
  parents: 'Родителям',
  friends: 'Друзьям',
  tourists: 'Туристам'
}

export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  api: 'API',
  jsonld: 'JSON-LD',
  html: 'HTML',
  telegram: 'Telegram',
  vk: 'ВКонтакте',
  form: 'Форма'
}

export const CITIES = ['Пермь', 'Кунгур', 'Соликамск', 'Чусовой', 'Березники']
export const PERM_DISTRICTS = [
  'Ленинский', 'Свердловский', 'Мотовилихинский', 'Дзержинский',
  'Индустриальный', 'Кировский', 'Орджоникидзевский'
]
export const CATEGORIES = [
  'концерт', 'спектакль', 'выставка', 'кино', 'лекция',
  'детям', 'фестиваль', 'стендап', 'экскурсия', 'спорт'
]
/** Готовые варианты в выпадающих списках фильтров */
export const FILTER_PRESETS = {
  budget: [0, 500, 1000, 1500, 3000],
  age: [3, 6, 12, 16, 18],
  duration: [60, 90, 120, 180]
}

export const FILTER_KEYS: FilterKey[] = [
  'date', 'city', 'district', 'budget', 'age', 'duration', 'setting', 'company', 'category'
]

/** Разбирает условия из адреса. Незнакомые значения молча отбрасываются */
export function filtersFromQuery(query: Record<string, unknown>): SearchFilters {
  const text = (key: FilterKey) => {
    const value = query[key]
    return typeof value === 'string' && value !== '' ? value : undefined
  }
  const oneOf = <T extends string>(key: FilterKey, allowed: readonly T[]) => {
    const value = text(key)
    return allowed.includes(value as T) ? value as T : undefined
  }
  const int = (key: FilterKey, max: number) => {
    const value = text(key)
    if (!value || !/^\d+$/.test(value)) return undefined
    const n = Number(value)
    return n <= max ? n : undefined
  }

  const filters: SearchFilters = {
    date: oneOf('date', Object.keys(DATE_LABELS) as DatePreset[]),
    city: oneOf('city', CITIES),
    district: oneOf('district', PERM_DISTRICTS),
    budget: int('budget', 1_000_000),
    age: int('age', 99),
    duration: int('duration', 24 * 60),
    setting: oneOf('setting', Object.keys(SETTING_LABELS) as Setting[]),
    company: oneOf('company', Object.keys(COMPANY_LABELS) as Company[]),
    category: oneOf('category', CATEGORIES)
  }
  return withoutEmpty(filters)
}

export function filtersToQuery(filters: SearchFilters): Record<string, string> {
  return Object.fromEntries(
    Object.entries(withoutEmpty(filters)).map(([key, value]) => [key, String(value)])
  )
}

export function activeFilterKeys(filters: SearchFilters): FilterKey[] {
  return FILTER_KEYS.filter(key => filters[key] !== undefined)
}

/** Подпись чипа: «завтра», «до 1 500 ₽», «младшему 6 лет» */
export function filterLabel(key: FilterKey, filters: SearchFilters): string {
  const { date, city, district, budget, age, duration, setting, company, category } = filters
  switch (key) {
    case 'date': return date ? DATE_LABELS[date] : ''
    case 'city': return city ?? ''
    case 'district': return district ? `${district} район` : ''
    case 'budget': return budget === undefined ? '' : budget === 0 ? 'бесплатно' : `до ${formatRub(budget)}`
    case 'age': return age === undefined ? '' : `младшему ${age} ${pluralRu(age, ['год', 'года', 'лет'])}`
    case 'duration': return duration ? `до ${formatDuration(duration)}` : ''
    case 'setting': return setting ? SETTING_LABELS[setting] : ''
    case 'company': return company ? COMPANY_LABELS[company] : ''
    case 'category': return category ?? ''
  }
}

function withoutEmpty(filters: SearchFilters): SearchFilters {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined))
}
