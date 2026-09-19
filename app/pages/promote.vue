<script setup lang="ts">
useHead({ title: 'Организаторам' })

// Пример карточки с пометкой «Реклама». Не из базы: показываем, как будет выглядеть событие организатора
const tomorrow = shiftDay(permDay(new Date()), 1)
const example: EventSummary = {
  id: 0,
  title: 'Ваше событие',
  categories: ['концерт'],
  ageMin: 12,
  setting: 'indoor',
  isPromo: true,
  image: null,
  nextSession: {
    id: 0,
    startsAt: permTime(tomorrow, '19:00').toISOString(),
    endsAt: null,
    venue: { name: 'Ваша площадка', address: null, locality: 'Пермь', district: 'Ленинский' },
    priceMin: 500,
    priceMax: 1500,
    priceText: null,
    isFree: false,
    ticketUrl: null,
    status: 'scheduled',
    movedFrom: null
  },
  sessionsCount: 1,
  reason: 'завтра, 19:00, в помещении'
}

type Kind = 'fact' | 'estimate' | 'hypothesis'
const KIND_LABELS: Record<Kind, string> = { fact: 'факт', estimate: 'оценка', hypothesis: 'гипотеза' }

const tariffs = [
  { name: 'Поднять событие', price: 1500, period: 'за 7 дней', what: 'Событие выше в выдаче у тех, чьему запросу оно подходит' },
  { name: 'Площадка месяца', price: 5000, period: 'в месяц', what: 'Все события площадки поднимаются в выдаче' },
  { name: 'Место в подборке', price: 2000, period: 'за подборку', what: 'Событие в подборке на выходные и в посте канала, когда появятся подборки' }
]

// Цены модели — тариф Polza.ai для anthropic/claude-sonnet-5 на 19.09.2026, рубли за миллион токенов
const PRICE_INPUT_PER_MILLION = 235.42
const PRICE_OUTPUT_PER_MILLION = 1177.12
// Токены одного разбора запроса: системная подсказка, JSON-схема и запрос на входе, условия на выходе
const TOKENS_INPUT = 1000
const TOKENS_OUTPUT = 80
const aiCostPerQuery = (TOKENS_INPUT * PRICE_INPUT_PER_MILLION + TOKENS_OUTPUT * PRICE_OUTPUT_PER_MILLION) / 1_000_000

// Входные данные расчёта в месяц. Всё, что не посчитано по тарифам, — гипотезы: меняйте прямо на странице
const inputs = reactive({
  payingOrganizers: 15,
  averageCheck: 3000,
  newOrganizers: 5,
  acquisitionCost: 1000,
  queries: 20000,
  hosting: 1500,
  database: 0
})

const fields: { key: keyof typeof inputs, label: string, unit: string, kind: Kind, note: string }[] = [
  { key: 'payingOrganizers', label: 'Платящих организаторов', unit: 'шт.', kind: 'hypothesis', note: 'Театры, клубы, фестивали Перми и края' },
  { key: 'averageCheck', label: 'Доход с организатора', unit: '₽', kind: 'hypothesis', note: 'Смесь тарифов выше' },
  { key: 'newOrganizers', label: 'Новых организаторов', unit: 'шт.', kind: 'hypothesis', note: 'Сколько приходит за месяц' },
  { key: 'acquisitionCost', label: 'Привлечение одного', unit: '₽', kind: 'hypothesis', note: 'Посты в сообществах, звонки площадкам' },
  { key: 'queries', label: 'Запросов к модели', unit: 'шт.', kind: 'hypothesis', note: 'Разборов запроса обычными словами' },
  { key: 'hosting', label: 'Хостинг приложения', unit: '₽', kind: 'hypothesis', note: 'Сервер под Nuxt, платформа не выбрана' },
  { key: 'database', label: 'Supabase', unit: '₽', kind: 'fact', note: 'Бесплатный тариф, пока укладываемся в его лимиты' }
]

// Стёртое поле v-model.number отдаёт пустую строку: считаем его нулём, иначе суммы склеятся строками
const value = (key: keyof typeof inputs) => Number(inputs[key]) || 0

const revenue = computed(() => value('payingOrganizers') * value('averageCheck'))
const costs = computed(() => [
  { label: 'Инфраструктура', value: value('hosting') + value('database') },
  { label: 'ИИ', value: Math.round(value('queries') * aiCostPerQuery) },
  { label: 'Привлечение', value: value('newOrganizers') * value('acquisitionCost') }
])
const totalCosts = computed(() => costs.value.reduce((sum, item) => sum + item.value, 0))
const profit = computed(() => revenue.value - totalCosts.value)

const rub = (value: number) => formatRub(Math.round(value))
</script>

<template>
  <div class="promote">
    <h1>Организаторам</h1>
    <p class="lead">
      Поднимите своё событие в выдаче. Промо видят только те, чьему запросу оно подходит,
      и всегда с пометкой «Реклама».
    </p>

    <section>
      <h2>Что даёт продвижение</h2>
      <ul class="points">
        <li><strong>Выше в выдаче.</strong> Среди подходящих под запрос событий ваше стоит первым.</li>
        <li><strong>Без показа мимо.</strong> Условия поиска те же, что у всех: если событие не подходит по дате, цене или возрасту, его не покажут.</li>
        <li><strong>Честная пометка.</strong> У промо всегда пометка «Реклама». До запуска нужна маркировка интернет-рекламы по закону о рекламе: сведения о рекламодателе и токен erid.</li>
      </ul>
    </section>

    <section>
      <h2>Как это выглядит</h2>
      <!-- inert: пример не кликается, события с id 0 нет -->
      <div class="example" inert>
        <EventCard :event="example" />
      </div>
    </section>

    <section>
      <h2>Тарифы <span class="badge badge-warn">гипотеза</span></h2>
      <p class="muted">Цены не проверены на организаторах, это стартовая точка для разговора.</p>
      <ul class="tariffs">
        <li v-for="tariff in tariffs" :key="tariff.name" class="panel">
          <strong>{{ tariff.name }}</strong>
          <span class="price">{{ rub(tariff.price) }} <span class="muted">{{ tariff.period }}</span></span>
          <span class="muted">{{ tariff.what }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h2>Экономика в месяц</h2>
      <p class="muted">
        Доход = клиенты × доход с клиента. Прибыль = доход − инфраструктура − ИИ − привлечение.
        Гипотезы можно менять прямо здесь.
      </p>

      <div class="economics">
        <div class="panel inputs">
          <label v-for="field in fields" :key="field.key" class="input-row">
            <span class="input-label">
              {{ field.label }}
              <span class="badge" :class="`badge-${field.kind}`">{{ KIND_LABELS[field.kind] }}</span>
              <span class="muted small">{{ field.note }}</span>
            </span>
            <span class="input-value">
              <input v-model.number="inputs[field.key]" type="number" min="0" step="1" inputmode="numeric">
              <span class="muted">{{ field.unit }}</span>
            </span>
          </label>
          <p class="ai-cost small">
            <span class="badge badge-estimate">оценка</span>
            Один разбор запроса ≈ {{ aiCostPerQuery.toFixed(2).replace('.', ',') }} ₽:
            около {{ TOKENS_INPUT.toLocaleString('ru-RU') }} токенов на входе и {{ TOKENS_OUTPUT }} на выходе
            по тарифу Polza.ai для Claude Sonnet 5 ({{ Math.round(PRICE_INPUT_PER_MILLION) }} ₽ и
            {{ PRICE_OUTPUT_PER_MILLION.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) }} ₽ за миллион токенов, 19.09.2026).
          </p>
        </div>

        <dl class="panel result">
          <div class="line">
            <dt>Доход</dt>
            <dd>{{ rub(revenue) }}</dd>
          </div>
          <div v-for="item in costs" :key="item.label" class="line cost">
            <dt>{{ item.label }}</dt>
            <dd>−{{ rub(item.value) }}</dd>
          </div>
          <div class="line total" :class="{ negative: profit < 0 }">
            <dt>Прибыль</dt>
            <dd>{{ rub(profit) }}</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>

<style scoped>
.promote {
  max-width: 820px;
}
h1 {
  margin: 0 0 0.5rem;
}
.lead {
  max-width: 36rem;
  margin: 0;
  color: var(--muted);
  font-size: 1.05rem;
}
section {
  margin-top: 2rem;
}
h2 {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}
.points {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding-left: 1.2rem;
}
.example {
  max-width: 440px;
}
.tariffs {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tariffs li {
  display: grid;
  gap: 0.2rem;
}
.price {
  font-size: 1.15rem;
  font-weight: 700;
}
.economics {
  display: grid;
  gap: 12px;
  align-items: start;
}
.inputs {
  display: grid;
  gap: 0.75rem;
}
.input-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.25rem 1rem;
}
.input-label {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.4rem;
  align-items: center;
  max-width: 26rem;
}
.input-label .small {
  width: 100%;
}
.input-value {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
input {
  width: 7.5rem;
  min-height: 40px;
  padding: 0 0.5rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  text-align: right;
}
.small {
  font-size: 0.8rem;
}
.ai-cost {
  margin: 0;
  color: var(--muted);
}
.badge-fact {
  background: #e3f4e8;
  color: var(--ok-ink);
}
.badge-estimate {
  background: #e7eefc;
  color: #2f4f9e;
}
.badge-hypothesis {
  background: var(--warn-bg);
  color: var(--warn-ink);
}
.result {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}
.line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.line dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.cost {
  color: var(--muted);
}
.total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--line);
  font-size: 1.2rem;
  font-weight: 700;
}
.total.negative {
  color: var(--danger-ink);
}

@media (min-width: 760px) {
  .tariffs {
    grid-template-columns: repeat(3, 1fr);
  }
  .economics {
    grid-template-columns: 1fr 260px;
  }
}
</style>
