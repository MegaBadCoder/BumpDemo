<script setup lang="ts">
useHead({ title: 'Подберём по вопросам' })

const route = useRoute()

// Ответы — те же условия, что у выдачи, поэтому «Показать варианты» ведёт прямо в /search
const filters = computed(() => filtersFromQuery(route.query))
const skipped = computed(() => quizSkipFromQuery(route.query.skip))
const answered = computed(() => activeFilterKeys(filters.value))

const { data: step, error, status, refresh } = await useFetch('/api/quiz', {
  query: computed(() => ({
    ...filtersToQuery(filters.value),
    ...(skipped.value.length ? { skip: skipped.value.join(',') } : {})
  }))
})

const results = computed(() => ({ path: '/search', query: filtersToQuery(filters.value) }))

function answer(key: FilterKey, value: string) {
  return navigateTo({ query: { ...route.query, [key]: value } })
}

function skip(key: FilterKey) {
  return navigateTo({ query: { ...route.query, skip: [...skipped.value, key].join(',') } })
}

// Снять ответ: вопрос снова может прийти, если он лучший для оставшихся событий
function unanswer(key: FilterKey) {
  const query = { ...route.query }
  delete query[key]
  return navigateTo({ query })
}

const eventsWord = (n: number) => pluralRu(n, ['событие', 'события', 'событий'])
</script>

<template>
  <div class="quiz">
    <h1>Подберём по вопросам</h1>
    <p class="lead muted">Не знаете, чего хочется? Ответьте на пару вопросов — каждый отсекает лишнее.</p>

    <div v-if="error" class="notice notice-danger">
      Не удалось загрузить вопрос.
      <button type="button" class="link-button" @click="() => refresh()">Попробовать ещё раз</button>
    </div>

    <template v-else-if="step">
      <p class="counter" aria-live="polite">
        <strong>{{ step.remaining }}</strong> {{ pluralRu(step.remaining, ['событие подходит', 'события подходят', 'событий подходят']) }}
      </p>

      <div v-if="answered.length" class="chips" aria-label="Ваши ответы">
        <span v-for="key in answered" :key="key" class="chip">
          {{ filterLabel(key, filters) }}
          <button type="button" :aria-label="`Убрать ответ «${filterLabel(key, filters)}»`" @click="unanswer(key)">×</button>
        </span>
        <NuxtLink to="/quiz" class="restart">Начать заново</NuxtLink>
      </div>

      <section v-if="step.question" class="panel question" :class="{ loading: status === 'pending' }">
        <h2>{{ step.question.text }}</h2>
        <div class="options">
          <button
            v-for="option in step.question.options"
            :key="option.value"
            type="button"
            class="option"
            @click="answer(step.question.key, option.value)"
          >
            <span class="option-label">{{ option.label }}</span>
            <span class="muted">{{ option.count }} {{ eventsWord(option.count) }}</span>
          </button>
        </div>
        <div class="actions">
          <button type="button" class="link-button" @click="skip(step.question.key)">Пропустить вопрос</button>
          <NuxtLink :to="results" class="btn btn-primary">Показать {{ step.remaining }} {{ eventsWord(step.remaining) }}</NuxtLink>
        </div>
      </section>

      <section v-else class="panel question">
        <h2 v-if="step.remaining">Больше спрашивать нечего</h2>
        <h2 v-else>Под эти ответы ничего не нашлось</h2>
        <p v-if="step.remaining" class="muted">Оставшиеся варианты уже не разделить вопросами.</p>
        <p v-else class="muted">Уберите один из ответов выше.</p>
        <div class="actions">
          <NuxtLink v-if="step.remaining" :to="results" class="btn btn-primary">
            Показать {{ step.remaining }} {{ eventsWord(step.remaining) }}
          </NuxtLink>
          <NuxtLink to="/quiz" class="btn">Начать заново</NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.quiz {
  max-width: 640px;
}
h1 {
  margin: 0 0 0.5rem;
}
.lead {
  margin: 0 0 1.25rem;
}
.counter {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}
.counter strong {
  font-size: 2.2rem;
  font-variant-numeric: tabular-nums;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 1rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.4rem 0.3rem 0.8rem;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font-size: 0.9rem;
}
.chip button {
  padding: 0 0.3rem;
  border: 0;
  background: none;
  color: inherit;
  font-size: 1.05rem;
  line-height: 1;
  opacity: 0.7;
  cursor: pointer;
}
.restart {
  margin-left: 0.25rem;
  color: var(--accent);
  font-size: 0.9rem;
}
.question {
  padding: 1.25rem;
}
.question.loading {
  opacity: 0.55;
}
h2 {
  margin: 0 0 1rem;
  font-size: 1.3rem;
}
.options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 8px;
}
.option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  min-height: 64px;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  text-align: left;
  cursor: pointer;
}
.option:hover {
  border-color: var(--ink);
}
.option-label {
  font-weight: 600;
}
.option-label::first-letter {
  text-transform: uppercase;
}
.option .muted {
  font-size: 0.85rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
</style>
