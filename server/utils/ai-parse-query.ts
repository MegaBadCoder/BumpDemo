// Разбор запроса обычными словами моделью: текст → SearchFilters по строгой JSON-схеме.
// Модель только извлекает условия, события подбираются по фактам, как и из фильтров.

// Anthropic не принимает type: ['string', 'null'] вместе с enum, поэтому «или null» только через anyOf
const nullableEnum = (values: readonly string[], description?: string) =>
  ({ anyOf: [{ type: 'string', enum: values }, { type: 'null' }], ...(description && { description }) })
const nullableInt = (description: string) => ({ anyOf: [{ type: 'integer' }, { type: 'null' }], description })

const FILTERS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: FILTER_KEYS,
  properties: {
    date: nullableEnum(Object.keys(DATE_LABELS),
      'today — сегодня, tonight — сегодня вечером, tomorrow — завтра, weekend — ближайшие суббота и воскресенье'),
    city: nullableEnum(CITIES, 'Город Пермского края'),
    district: nullableEnum(PERM_DISTRICTS, 'Район Перми. «В центре» — Ленинский'),
    budget: nullableInt('Максимальная цена билета на одного в рублях; 0 — только бесплатные'),
    age: nullableInt('Возраст самого младшего участника, полных лет'),
    duration: nullableInt('Максимальная длительность события в минутах'),
    setting: nullableEnum(Object.keys(SETTING_LABELS), 'indoor — в помещении, outdoor — на улице, online — онлайн'),
    company: nullableEnum(Object.keys(COMPANY_LABELS),
      'kids — с ребёнком, friends — с друзьями, couple — вдвоём, solo — одному'),
    category: nullableEnum(CATEGORIES, 'Вид события')
  }
}

const weekdayLong = new Intl.DateTimeFormat('ru-RU', {
  timeZone: PERM_TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
})

function systemPrompt(now: Date): string {
  return [
    'Ты разбираешь запрос жителя Перми о том, куда сходить, на условия поиска по афише.',
    'Заполняй поле, только если условие есть в запросе явно или однозначно следует из него. Иначе null.',
    'Не додумывай: «хочу развеяться» не задаёт ни дату, ни бюджет.',
    'Вид события выбирай, если запрос на него указывает: «посмеяться» — стендап, «послушать музыку» — концерт, «с малышом на спектакль» — спектакль.',
    'Ребёнок без указанного возраста: company = kids, age = null.',
    'Пермский край целиком — это city = null.',
    `Сейчас в Перми: ${weekdayLong.format(now)}.`
  ].join('\n')
}

interface ChatCompletion {
  choices: { message: { content: string | null } }[]
}

export async function parseQueryWithAi(query: string, now = new Date()): Promise<SearchFilters> {
  const { ai } = useRuntimeConfig()
  if (!ai.apiKey) throw new Error('Не задан ключ модели (NUXT_AI_API_KEY)')

  const response = await $fetch<ChatCompletion>(`${ai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ai.apiKey}` },
    body: {
      model: ai.model,
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt(now) },
        { role: 'user', content: query }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'search_filters', strict: true, schema: FILTERS_SCHEMA }
      }
    },
    timeout: 10_000,
    // Один повтор на сетевой сбой и 5xx: первый запрос после простоя иногда падает на старом соединении
    retry: 1,
    retryDelay: 300
  }).catch((error: { statusCode?: number, data?: unknown, message: string }) => {
    // Без тела ответа в логе видно только «400 Bad Request», а причина — в data
    const details = error.data ? JSON.stringify(error.data).slice(0, 500) : error.message
    throw new Error(`Polza ${error.statusCode ?? ''}: ${details}`)
  })

  const content = response.choices[0]?.message.content
  if (!content) throw new Error('Модель вернула пустой ответ')

  const raw = JSON.parse(content) as Record<string, string | number | null>
  const filled = Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== null))
  // Прогоняем через разбор адреса: недопустимые значения отбрасываются так же, как из URL
  return filtersFromQuery(filtersToQuery(filled as SearchFilters))
}
