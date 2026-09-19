<script setup lang="ts">
useHead({ title: 'Источники' })

const { data, error, refresh } = await useFetch('/api/sources')

const STATUS: Record<FetchStatus, { label: string, badge: string }> = {
  ok: { label: 'работает', badge: 'badge-ok' },
  partial: { label: 'частично', badge: 'badge-warn' },
  failed: { label: 'сбой', badge: 'badge-danger' }
}

const lastRun = computed(() => {
  const times = data.value?.sources.map(source => Date.parse(source.lastRun.startedAt)) ?? []
  return times.length ? new Date(Math.max(...times)).toISOString() : null
})
</script>

<template>
  <div>
    <h1>Источники событий</h1>
    <p class="lead muted">
      Откуда берутся события. Сбор автоматический, по расписанию. Если одно событие есть в нескольких
      источниках, в выдаче оно одно, а в карточке видны все источники.
    </p>

    <div v-if="error" class="notice notice-danger">
      Не удалось загрузить источники.
      <button type="button" class="link-button" @click="() => refresh()">Попробовать ещё раз</button>
    </div>

    <template v-else-if="data">
      <dl class="stats">
        <div class="panel">
          <dt>Подключено</dt>
          <dd>{{ data.sources.length }} {{ pluralRu(data.sources.length, ['источник', 'источника', 'источников']) }}</dd>
        </div>
        <div class="panel">
          <dt>В базе</dt>
          <dd>{{ data.eventsTotal }} {{ pluralRu(data.eventsTotal, ['событие', 'события', 'событий']) }}</dd>
        </div>
        <div v-if="lastRun" class="panel">
          <dt>Последний сбор</dt>
          <dd>{{ formatMoment(lastRun) }}</dd>
        </div>
      </dl>

      <ul class="list">
        <li v-for="source in data.sources" :key="source.id" class="panel source">
          <div class="title">
            <a :href="source.url" target="_blank" rel="noopener">{{ source.name }}</a>
            <span class="badge" :class="STATUS[source.lastRun.status].badge">
              {{ STATUS[source.lastRun.status].label }}
            </span>
          </div>
          <dl class="details">
            <div><dt>Тип</dt><dd>{{ SOURCE_KIND_LABELS[source.kind] }}</dd></div>
            <div><dt>Охват</dt><dd>{{ source.coverage }}</dd></div>
            <div><dt>Событий</dt><dd>{{ source.eventsCount }}</dd></div>
            <div><dt>Сбор</dt><dd>{{ source.schedule }}</dd></div>
            <div><dt>Последний сбор</dt><dd>{{ formatMoment(source.lastRun.startedAt) }}</dd></div>
          </dl>
          <p v-if="source.lastRun.error" class="error small">{{ source.lastRun.error }}</p>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
h1 {
  margin: 0 0 0.5rem;
}
.lead {
  max-width: 40rem;
  margin: 0 0 1.25rem;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin: 0 0 1.25rem;
}
.stats dt,
.details dt {
  color: var(--muted);
  font-size: 0.8rem;
}
.stats dd {
  margin: 0.15rem 0 0;
  font-size: 1.2rem;
  font-weight: 700;
}
.list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.title {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-weight: 700;
}
.details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem 1rem;
  margin: 0.75rem 0 0;
}
.details dd {
  margin: 0;
}
.badge-ok {
  background: #e3f4e8;
  color: var(--ok-ink);
}
.error {
  margin: 0.75rem 0 0;
  color: var(--danger-ink);
}
.small {
  font-size: 0.85rem;
}
</style>
