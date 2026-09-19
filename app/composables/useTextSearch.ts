// Запрос обычными словами: сервер разбирает его на условия (моделью), условия уходят в адрес выдачи.
// Новый запрос заменяет прежние условия целиком
export function useTextSearch() {
  const pending = ref(false)
  const error = ref('')
  // true — модель не ответила и запрос разобран правилами; выдача об этом предупреждает
  const roughParse = useState('rough-parse', () => false)

  async function search(text: string) {
    const q = text.trim()
    if (!q) return navigateTo('/search')

    pending.value = true
    error.value = ''
    try {
      const { filters, parser } = await $fetch('/api/parse-query', { method: 'POST', body: { q } })
      roughParse.value = parser === 'rules'
      await navigateTo({ path: '/search', query: { q, ...filtersToQuery(filters) } })
    }
    catch {
      error.value = 'Не получилось разобрать запрос. Попробуйте ещё раз или выберите условия в фильтрах.'
    }
    finally {
      pending.value = false
    }
  }

  return { search, pending, error, roughParse }
}
