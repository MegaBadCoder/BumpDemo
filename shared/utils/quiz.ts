// Пропущенные вопросы квиза живут в адресе рядом с ответами: ?date=tomorrow&skip=company,budget
export function quizSkipFromQuery(value: unknown): FilterKey[] {
  if (typeof value !== 'string') return []
  return value.split(',').filter((key): key is FilterKey => FILTER_KEYS.includes(key as FilterKey))
}
