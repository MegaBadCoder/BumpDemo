<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { data: event, error } = await useFetch(() => `/api/events/${route.params.id}`)

useHead({ title: () => event.value?.title ?? 'Событие' })

// Для фактов берём ближайший неотменённый сеанс, у отменённого события — какой есть
const session = computed(() =>
  event.value?.sessions.find(item => item.status !== 'cancelled') ?? event.value?.sessions[0])
const primarySource = computed(() =>
  event.value?.sources.find(source => source.isPrimary) ?? event.value?.sources[0])
const ticketUrl = computed(() => session.value?.ticketUrl ?? primarySource.value?.url)
const canBuy = computed(() => event.value?.status === 'active' && !event.value.isPast)

const facts = computed(() => {
  const item = event.value
  const current = session.value
  if (!item) return []
  const venue = current?.venue
  const place = venue
    ? [venue.district && `${venue.district} район`, venue.locality].filter(Boolean).join(', ')
    : item.setting === 'online' ? 'онлайн' : null
  return [
    { label: 'Когда', value: current ? formatSessionWhen(current) : null },
    { label: 'Где', value: venue ? [venue.name, venue.address].filter(Boolean).join(', ') : place, field: 'address' },
    { label: 'Район', value: place },
    { label: 'Цена', value: current ? formatPrice(current) : null, field: 'price' },
    { label: 'Возраст', value: item.ageMin !== null ? `${item.ageMin}+` : null, field: 'ageMin' },
    { label: 'Длительность', value: item.durationMin ? formatDuration(item.durationMin) : null, field: 'durationMin' },
    { label: 'Формат', value: item.setting ? SETTING_LABELS[item.setting] : null, field: 'setting' }
  ] satisfies { label: string, value: string | null, field?: VerifiableField }[]
})

const audience = ref<Audience>()
const presentation = computed(() => {
  const list = event.value?.presentations ?? []
  return list.find(item => item.audience === audience.value) ?? list[0]
})

// Назад в выдачу с теми же условиями, а если открыли по прямой ссылке — к списку
function goBack() {
  if (window.history.state?.back) router.back()
  else navigateTo('/events')
}
</script>

<template>
  <div>
    <button type="button" class="link-button back" @click="goBack">← Назад</button>

    <div v-if="error" class="panel">
      <h1>Событие не найдено</h1>
      <p class="muted">Возможно, его убрали из источника или ссылка с ошибкой.</p>
      <NuxtLink to="/events" class="btn">Все события</NuxtLink>
    </div>

    <article v-else-if="event" class="event">
      <header class="head">
        <p class="meta">
          <span>{{ event.categories.join(' · ') }}</span>
          <span v-if="event.isPromo" class="badge badge-promo">Реклама</span>
        </p>
        <h1>{{ event.title }}</h1>
      </header>

      <p v-if="event.status === 'cancelled'" class="notice notice-danger">
        Событие отменено. Так сообщил {{ primarySource?.sourceName }},
        обновлено {{ primarySource && formatMoment(primarySource.lastSeenAt) }}.
      </p>
      <p v-else-if="event.isPast" class="notice">Событие уже прошло, новых сеансов нет.</p>

      <div class="layout">
        <div class="main">
          <EventCover :image="event.image" :category="event.categories[0]" />

          <dl class="facts panel">
            <div v-for="fact in facts" :key="fact.label" class="fact">
              <dt>{{ fact.label }}</dt>
              <dd>
                <span v-if="fact.value">{{ fact.value }}</span>
                <span v-else class="muted">нет в источнике</span>
                <span
                  v-if="fact.field && event.unverifiedFields.includes(fact.field)"
                  class="badge badge-warn"
                  title="Этого нет в источнике в явном виде или это вытащено из текста поста. Уточняйте у организатора"
                >не проверено</span>
              </dd>
            </div>
          </dl>

          <div class="actions">
            <a
              class="btn btn-primary"
              :href="ticketUrl"
              target="_blank"
              rel="noopener"
              :aria-disabled="!canBuy || !ticketUrl"
            >Купить билет</a>
            <NuxtLink class="btn" :to="{ path: '/evening', query: { add: event.id } }">Добавить в вечер</NuxtLink>
          </div>

          <section v-if="event.description">
            <h2>Описание</h2>
            <p>{{ event.description }}</p>
            <p class="muted small">Текст из источника, без правок.</p>
          </section>

          <section v-if="presentation">
            <h2>Коротко для вас</h2>
            <div v-if="event.presentations.length > 1" class="tabs" role="group" aria-label="Для кого">
              <button
                v-for="item in event.presentations"
                :key="item.audience"
                type="button"
                :aria-pressed="item.audience === presentation.audience"
                @click="audience = item.audience"
              >
                {{ AUDIENCE_LABELS[item.audience] }}
              </button>
            </div>
            <p>{{ presentation.body }}</p>
            <p class="muted small">Текст написал ИИ. Даты, цены и возраст — только из источника, в блоке выше.</p>
          </section>
        </div>

        <aside class="side">
          <section class="panel">
            <h2>Сеансы</h2>
            <ul class="sessions">
              <li v-for="item in event.sessions" :key="item.id" :class="{ off: item.status === 'cancelled' }">
                <strong>{{ formatSessionWhen(item) }}</strong>
                <span v-if="item.status === 'cancelled'" class="badge badge-danger">отменён</span>
                <span v-if="item.status === 'moved'" class="badge badge-warn">перенесён</span>
                <span class="muted">{{ formatVenue(item.venue) }}</span>
                <span v-if="formatPrice(item)">{{ formatPrice(item) }}</span>
                <span v-if="item.status === 'moved' && item.movedFrom" class="muted small">
                  было: {{ formatMoment(item.movedFrom) }}
                </span>
              </li>
            </ul>
          </section>

          <section class="panel">
            <h2>Источники</h2>
            <p v-if="event.sources.length > 1" class="muted small">
              Одно событие нашлось в {{ event.sources.length }} источниках, показываем его один раз.
            </p>
            <ul class="sources">
              <li v-for="source in event.sources" :key="source.sourceId">
                <a :href="source.url" target="_blank" rel="noopener">{{ source.sourceName }}</a>
                <span v-if="source.isPrimary" class="badge">основной</span>
                <span class="muted small">
                  {{ SOURCE_KIND_LABELS[source.kind] }}<template v-if="source.categoryRaw"> · рубрика «{{ source.categoryRaw }}»</template>
                  · обновлено {{ formatMoment(source.lastSeenAt) }}
                </span>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </article>
  </div>
</template>

<style scoped>
.back {
  margin-bottom: 1rem;
  text-decoration: none;
}
.meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
h1 {
  margin: 0.25rem 0 1rem;
  font-size: clamp(1.6rem, 5vw, 2.2rem);
}
h2 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1.1rem;
}
.panel h2 {
  margin-top: 0;
}
.layout {
  display: grid;
  gap: 1rem;
}
.side {
  display: grid;
  gap: 1rem;
  align-content: start;
}
.facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem 1rem;
  margin: 1rem 0;
}
dt {
  color: var(--muted);
  font-size: 0.8rem;
}
dd {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  margin: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.small {
  font-size: 0.8rem;
}
.tabs {
  display: inline-flex;
  gap: 4px;
  margin-bottom: 0.5rem;
  padding: 3px;
  border-radius: 10px;
  background: var(--line);
}
.tabs button {
  padding: 0.3rem 0.75rem;
  border: 0;
  border-radius: 8px;
  background: none;
  cursor: pointer;
}
.tabs button[aria-pressed='true'] {
  background: var(--surface);
  font-weight: 600;
}
.sessions,
.sources {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sessions li,
.sources li {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.5rem;
  align-items: center;
}
.sessions .muted,
.sources .muted {
  width: 100%;
}
.sessions li.off strong {
  text-decoration: line-through;
  color: var(--muted);
}

@media (min-width: 860px) {
  .layout {
    grid-template-columns: 1fr 320px;
    align-items: start;
  }
}
</style>
