// Квиз «Акинатор»: следующим задаём вопрос, после которого в среднем останется меньше всего событий.
// Считать совпадения умеет вызывающий (afisha.ts), поэтому логика не зависит от того, откуда данные.

interface QuestionConfig {
  key: FilterKey
  text: string
  options: [value: string, label: string][]
  /** Много вариантов (рубрики, города): показываем самые частые, а не все подряд */
  byCount?: boolean
  /**
   * Варианты вложены друг в друга («до 500 ₽» ⊂ «до 1 000 ₽»): вариант с тем же числом событий,
   * что у предыдущего, даёт тот же набор, а вариант со всеми событиями ничего не отсекает
   */
  nested?: boolean
}

const QUESTIONS: QuestionConfig[] = [
  { key: 'date', text: 'Когда хотите пойти?', options: Object.entries(DATE_LABELS) },
  { key: 'company', text: 'С кем идёте?', options: Object.entries(COMPANY_LABELS) },
  { key: 'category', text: 'Что по душе?', options: CATEGORIES.map(category => [category, category]), byCount: true },
  { key: 'setting', text: 'В помещении или на улице?', options: Object.entries(SETTING_LABELS) },
  {
    key: 'budget',
    text: 'Сколько готовы потратить на человека?',
    options: FILTER_PRESETS.budget.map(n => [String(n), n === 0 ? 'бесплатно' : `до ${formatRub(n)}`]),
    nested: true
  },
  {
    key: 'duration',
    text: 'Сколько есть времени?',
    options: FILTER_PRESETS.duration.map(n => [String(n), `до ${formatDuration(n)}`]),
    nested: true
  },
  { key: 'city', text: 'В каком городе?', options: CITIES.map(city => [city, city]), byCount: true }
]

/** Вопрос задаём, только если он заметно сужает выбор: в среднем по ответам остаётся не больше 90% */
const MAX_SHARE_LEFT = 0.9
const MAX_OPTIONS = 6

export function nextQuizStep(
  filters: SearchFilters,
  skipped: FilterKey[],
  count: (filters: SearchFilters) => number
): QuizStep {
  const remaining = count(filters)
  if (remaining <= 1) return { remaining, question: null }

  let best: { question: QuizQuestion, shareLeft: number } | null = null
  for (const config of QUESTIONS) {
    if (filters[config.key] !== undefined || skipped.includes(config.key)) continue

    let options = config.options
      .map(([value, label]) => ({ value, label, count: count(withAnswer(filters, config.key, value)) }))
      .filter(option => option.count > 0)
    if (config.nested) {
      options = options.filter((option, i) => option.count < remaining && option.count !== options[i - 1]?.count)
    }
    if (config.byCount) options = options.sort((a, b) => b.count - a.count).slice(0, MAX_OPTIONS)
    if (options.length < 2) continue

    const shareLeft = options.reduce((sum, option) => sum + option.count, 0) / options.length / remaining
    if (shareLeft > MAX_SHARE_LEFT) continue
    if (!best || shareLeft < best.shareLeft) {
      best = { question: { key: config.key, text: config.text, options }, shareLeft }
    }
  }

  return { remaining, question: best?.question ?? null }
}

function withAnswer(filters: SearchFilters, key: FilterKey, value: string): SearchFilters {
  return filtersFromQuery({ ...filtersToQuery(filters), [key]: value })
}
