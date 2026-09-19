import { serverSupabaseUser } from '#supabase/server'

// Запрос обычными словами → условия поиска. Разбирает модель; если она недоступна —
// запасной разбор правилами, и страница честно об этом скажет (parser: 'rules')
export default defineEventHandler(async (event) => {
  // Каждый вызов модели стоит денег, поэтому только для вошедших
  if (!await serverSupabaseUser(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ q?: unknown }>(event)
  const query = typeof body?.q === 'string' ? body.q.trim().slice(0, 500) : ''
  if (!query) return { filters: {}, parser: 'rules' as const }

  try {
    return { filters: await parseQueryWithAi(query), parser: 'ai' as const }
  }
  catch (error) {
    console.warn('[parse-query] модель не ответила, разбираем правилами:', error instanceof Error ? error.message : error)
    return { filters: parseQueryByRules(query), parser: 'rules' as const }
  }
})
