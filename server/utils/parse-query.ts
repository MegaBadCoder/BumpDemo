// Запасной разбор запроса регулярными выражениями, когда модель недоступна (см. ai-parse-query.ts).
// Контракт тот же: текст на входе, SearchFilters на выходе.

// \b в JS не работает с кириллицей, поэтому границы слов пишем явно
const word = (stem: string) => new RegExp(`(^|[^а-я])${stem}`)

const CITY_PATTERNS: [RegExp, string][] = [
  [word('кунгур'), 'Кунгур'],
  [word('соликамск'), 'Соликамск'],
  [word('чусов'), 'Чусовой'],
  [word('березник'), 'Березники'],
  [/(^|[^а-я])перм(ь|и)([^а-я]|$)/, 'Пермь']
]

const DISTRICT_PATTERNS: [RegExp, string][] = [
  [/центр|ленинск/, 'Ленинский'],
  [/свердловск/, 'Свердловский'],
  [/мотовилих/, 'Мотовилихинский'],
  [/дзержинск/, 'Дзержинский'],
  [/индустриальн/, 'Индустриальный'],
  [/кировск/, 'Кировский'],
  [/орджоникидзевск|гайв/, 'Орджоникидзевский']
]

const CATEGORY_PATTERNS: [RegExp, string][] = [
  [/концерт|джаз|оркестр|музык/, 'концерт'],
  [/спектакл|театр|балет|опер/, 'спектакль'],
  [/выставк/, 'выставка'],
  [word('(кино|фильм)'), 'кино'],
  [/лекци/, 'лекция'],
  [/фестивал|ярмарк/, 'фестиваль'],
  [/стендап|стенд-ап|комик/, 'стендап'],
  [/экскурси|пещер/, 'экскурсия'],
  [/забег|спорт/, 'спорт']
]

const COMPANY_PATTERNS: [RegExp, Company][] = [
  [/ребенк|детьми|детей|детям|дочк|сыном/, 'kids'],
  [/друзь|компани/, 'friends'],
  [/вдвоем|свидани|с девушк|с парн|с женой|с мужем/, 'couple'],
  [word('(одн(ому|а)|один)([^а-я]|$)'), 'solo']
]

export function parseQueryByRules(query: string): SearchFilters {
  const text = query.toLowerCase().replaceAll('ё', 'е')
  const filters: SearchFilters = {}
  const first = <T>(patterns: [RegExp, T][]) => patterns.find(([pattern]) => pattern.test(text))?.[1]

  if (/завтра/.test(text)) filters.date = 'tomorrow'
  else if (/выходн|суббот|воскресень/.test(text)) filters.date = 'weekend'
  else if (/вечер/.test(text)) filters.date = 'tonight'
  else if (/сегодня/.test(text)) filters.date = 'today'

  filters.city = first(CITY_PATTERNS)
  filters.district = first(DISTRICT_PATTERNS)
  if (filters.district) filters.city = undefined
  filters.category = first(CATEGORY_PATTERNS)
  filters.company = first(COMPANY_PATTERNS)

  const age = text.match(/(\d{1,2})\s*(\+|год|лет)/)
  if (age) filters.age = Number(age[1])

  if (/бесплатн/.test(text)) {
    filters.budget = 0
  }
  else {
    // «до 1 500 ₽», «не дороже 1000 рублей»; число без валюты считаем ценой, только если оно не меньше 100,
    // иначе «до 2 часов» стало бы бюджетом
    for (const price of text.matchAll(/(до|не дороже|дешевле)\s*(\d[\d\s]*\d|\d)\s*(₽|руб|р(?![а-я]))?/g)) {
      const amount = Number(price[2]!.replace(/\s/g, ''))
      if (price[3] || amount >= 100) {
        filters.budget = amount
        break
      }
    }
  }

  const hours = text.match(/до\s*(\d+)\s*час/)
  const minutes = text.match(/до\s*(\d+)\s*мин/)
  if (hours) filters.duration = Number(hours[1]) * 60
  else if (minutes) filters.duration = Number(minutes[1])
  else if (/полтора час/.test(text)) filters.duration = 90
  else if (/на час|недолго/.test(text)) filters.duration = 60

  if (/помещени|внутри|под крыш|дожд/.test(text)) filters.setting = 'indoor'
  else if (/на улиц|на свеж|под открыт|на природ/.test(text)) filters.setting = 'outdoor'
  else if (/онлайн|из дома/.test(text)) filters.setting = 'online'

  // Прогоняем через тот же разбор, что и адрес: так в фильтры попадают только допустимые значения
  return filtersFromQuery(filtersToQuery(filters))
}
