<script setup lang="ts">
const props = defineProps<{ event: EventSummary }>()

const session = computed(() => props.event.nextSession)
const price = computed(() => formatPrice(session.value))
const moreSessions = computed(() => props.event.sessionsCount - 1)
</script>

<template>
  <NuxtLink :to="`/event/${event.id}`" class="event-card">
    <EventCover :image="event.image" :category="event.categories[0]" compact />
    <div class="body">
      <p class="meta">
        <span>{{ event.categories.join(' · ') }}</span>
        <span v-if="event.isPromo" class="badge badge-promo">Реклама</span>
      </p>
      <h3>{{ event.title }}</h3>
      <p class="when">
        {{ formatSessionWhen(session) }}
        <span v-if="session.status === 'moved'" class="badge badge-warn">перенесено</span>
        <span v-if="moreSessions > 0" class="muted">
          · ещё {{ moreSessions }} {{ pluralRu(moreSessions, ['сеанс', 'сеанса', 'сеансов']) }}
        </span>
      </p>
      <p class="muted">{{ formatVenue(session.venue) }}</p>
      <p class="facts">
        <span v-if="price">{{ price }}</span>
        <span v-if="event.ageMin !== null">{{ event.ageMin }}+</span>
      </p>
      <p v-if="event.reason" class="reason">Подходит: {{ event.reason }}</p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.event-card {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 12px;
  height: 100%;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  text-decoration: none;
  transition: border-color 0.15s;
}
.event-card:hover {
  border-color: var(--muted);
}
.body {
  min-width: 0;
}
p {
  margin: 0 0 0.2rem;
  font-size: 0.9rem;
}
.meta {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--muted);
  font-size: 0.8rem;
}
h3 {
  margin: 0 0 0.3rem;
  font-size: 1.05rem;
}
.when {
  font-weight: 600;
}
.facts {
  display: flex;
  gap: 0.75rem;
}
.reason {
  margin-top: 0.4rem;
  padding: 0.3rem 0.5rem;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent-hover);
  font-size: 0.85rem;
}
</style>
