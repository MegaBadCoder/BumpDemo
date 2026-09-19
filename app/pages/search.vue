<script setup lang="ts">
useHead({ title: 'Выдача' })

const route = useRoute()

// Условия живут в адресе: чипы и фильтры читают и меняют одно и то же
const filters = computed(() => filtersFromQuery(route.query))
const activeKeys = computed(() => activeFilterKeys(filters.value))

const { data, error, status, refresh } = await useFetch('/api/search', {
  query: computed(() => filtersToQuery(filters.value))
})

const text = ref('')
watch(() => route.query.q, (q) => {
  text.value = typeof q === 'string' ? q : ''
}, { immediate: true })
const { search, pending: parsing, error: parseError, roughParse } = useTextSearch()

function setFilter(key: FilterKey, value: string) {
  const query = { ...route.query }
  if (value === '') delete query[key]
  else query[key] = value
  // Районы есть только у Перми
  if (key === 'city' && value !== 'Пермь') delete query.district
  return navigateTo({ query })
}

function resetFilters() {
  return navigateTo({ query: {} })
}

// Клик по чипу открывает фильтры на этом условии, чтобы его поправить
const filtersOpen = ref(false)
async function editFilter(key: FilterKey) {
  filtersOpen.value = true
  await nextTick()
  document.getElementById(`filter-${key}`)?.focus()
}

type Option = { value: string, label: string }
const options = (entries: [string | number, string][]): Option[] =>
  entries.map(([value, label]) => ({ value: String(value), label }))
// Значение из запроса может не совпасть с готовыми вариантами, например «до 1 200 ₽»
const withCurrent = (values: number[], current: number | undefined) =>
  current === undefined || values.includes(current) ? values : [...values, current].sort((a, b) => a - b)

const fields = computed(() => {
  const f = filters.value
  return [
    { key: 'date', label: 'Когда', any: 'Любой день', options: options(Object.entries(DATE_LABELS)) },
    { key: 'city', label: 'Город', any: 'Весь край', options: options(CITIES.map(city => [city, city])) },
    {
      key: 'district', label: 'Район Перми', any: 'Любой',
      options: options(PERM_DISTRICTS.map(district => [district, district])),
      disabled: Boolean(f.city && f.city !== 'Пермь')
    },
    {
      key: 'budget', label: 'Бюджет', any: 'Любой',
      options: options(withCurrent(FILTER_PRESETS.budget, f.budget).map(n => [n, n === 0 ? 'бесплатно' : `до ${formatRub(n)}`]))
    },
    {
      key: 'age', label: 'Возраст младшего', any: 'Не важно',
      options: options(withCurrent(FILTER_PRESETS.age, f.age).map(n => [n, `${n} ${pluralRu(n, ['год', 'года', 'лет'])}`]))
    },
    {
      key: 'duration', label: 'Длительность', any: 'Любая',
      options: options(withCurrent(FILTER_PRESETS.duration, f.duration).map(n => [n, `до ${formatDuration(n)}`]))
    },
    { key: 'setting', label: 'Формат', any: 'Любой', options: options(Object.entries(SETTING_LABELS)) },
    { key: 'company', label: 'Компания', any: 'Любая', options: options(Object.entries(COMPANY_LABELS)) },
    { key: 'category', label: 'Рубрика', any: 'Любая', options: options(CATEGORIES.map(c => [c, c])) }
  ] satisfies { key: FilterKey, label: string, any: string, options: Option[], disabled?: boolean }[]
})

const found = computed(() => data.value?.events.length ?? 0)
</script>

<template>
  <div>
    <form class="query-form" role="search" @submit.prevent="search(text)">
      <input v-model="text" type="search" name="q" aria-label="Что ищем" placeholder="Что хочется? Например: завтра с друзьями, до 1000 ₽" enterkeyhint="search">
      <button class="btn btn-primary" type="submit" :disabled="parsing">{{ parsing ? 'Разбираем…' : 'Найти' }}</button>
    </form>
    <p v-if="parseError" class="notice notice-danger">{{ parseError }}</p>
    <p v-else-if="roughParse && route.query.q" class="notice">
      Модель сейчас недоступна, запрос разобран упрощённо. Проверьте условия ниже.
    </p>

    <div v-if="activeKeys.length" class="chips" aria-label="Условия поиска">
      <span v-for="key in activeKeys" :key="key" class="chip">
        <button type="button" class="chip-label" title="Изменить" @click="editFilter(key)">
          {{ filterLabel(key, filters) }}
        </button>
        <button type="button" class="chip-remove" :aria-label="`Убрать «${filterLabel(key, filters)}»`" @click="setFilter(key, '')">×</button>
      </span>
      <button type="button" class="link-button reset" @click="resetFilters">Сбросить всё</button>
    </div>

    <details class="filters panel" :open="filtersOpen" @toggle="filtersOpen = ($event.target as HTMLDetailsElement).open">
      <summary>Фильтры<span v-if="activeKeys.length" class="muted"> · {{ activeKeys.length }}</span></summary>
      <div class="fields">
        <label v-for="field in fields" :key="field.key">
          <span>{{ field.label }}</span>
          <select
            :id="`filter-${field.key}`"
            :value="filters[field.key] ?? ''"
            :disabled="field.disabled"
            @change="setFilter(field.key, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ field.any }}</option>
            <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
      </div>
    </details>

    <div v-if="error" class="notice notice-danger">
      Не удалось загрузить выдачу.
      <button type="button" class="link-button" @click="() => refresh()">Попробовать ещё раз</button>
    </div>

    <template v-else-if="data">
      <p v-for="source in data.failedSources" :key="source.id" class="notice">
        {{ source.name }} не ответил при последнем сборе ({{ formatMoment(source.lastRun.startedAt) }}),
        часть событий может не показываться.
      </p>

      <div :class="{ loading: status === 'pending' }">
        <template v-if="found">
          <p class="count">
            {{ found }} {{ pluralRu(found, ['событие', 'события', 'событий']) }}
          </p>
          <ul class="cards">
            <li v-for="event in data.events" :key="event.id">
              <EventCard :event="event" />
            </li>
          </ul>
        </template>

        <div v-else class="empty panel">
          <h2>Под все условия ничего не подошло</h2>
          <template v-if="data.relaxations.length">
            <p>Попробуйте ослабить одно условие:</p>
            <ul>
              <li v-for="relaxation in data.relaxations" :key="relaxation.key">
                <button type="button" class="link-button" @click="setFilter(relaxation.key, '')">
                  Убрать «{{ relaxation.label }}»
                </button>
                <span class="muted">
                  — найдётся {{ relaxation.count }} {{ pluralRu(relaxation.count, ['событие', 'события', 'событий']) }}
                </span>
              </li>
            </ul>
          </template>
          <p v-else-if="activeKeys.length">
            <button type="button" class="link-button" @click="resetFilters">Сбросить все условия</button>
          </p>
          <p v-else>Предстоящих событий пока нет.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.query-form input {
  flex: 1 1 14rem;
  min-height: 48px;
  padding: 0 0.9rem;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: var(--surface);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 0.9rem;
}
.chip {
  display: inline-flex;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font-size: 0.9rem;
}
.chip button {
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}
.chip-label {
  padding: 0.35rem 0.25rem 0.35rem 0.8rem;
}
.chip-remove {
  padding: 0.35rem 0.7rem 0.35rem 0.35rem;
  font-size: 1.05rem;
  line-height: 1;
  opacity: 0.7;
}
.chip-remove:hover {
  opacity: 1;
}
.reset {
  margin-left: 0.25rem;
  font-size: 0.9rem;
}
.filters {
  margin-block: 0.9rem 1rem;
  padding-block: 0.75rem;
}
summary {
  font-weight: 600;
  cursor: pointer;
}
.fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 0.75rem;
}
label {
  display: grid;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: var(--muted);
}
select {
  min-height: 40px;
  padding: 0 0.5rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.9rem;
}
select:disabled {
  opacity: 0.5;
}
.count {
  margin: 0 0 0.6rem;
  color: var(--muted);
}
.loading {
  opacity: 0.55;
  transition: opacity 0.15s;
}
.empty h2 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}
.empty ul {
  padding-left: 1.2rem;
}
.empty li {
  margin-bottom: 0.3rem;
}
</style>
