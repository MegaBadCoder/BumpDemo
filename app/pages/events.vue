<script setup lang="ts">
useHead({ title: 'Все события' })

const { data: events, error, refresh } = await useFetch('/api/events')

// Группы по дню ближайшего сеанса. Выставка, которая уже идёт, попадает в «сегодня»
const days = computed(() => {
  const now = new Date()
  const groups = new Map<string, { title: string, events: EventSummary[] }>()
  for (const event of events.value ?? []) {
    const start = new Date(event.nextSession.startsAt)
    const date = start > now ? start : now
    const key = permDay(date)
    if (!groups.has(key)) groups.set(key, { title: formatDay(date, now), events: [] })
    groups.get(key)!.events.push(event)
  }
  return [...groups.values()]
})
</script>

<template>
  <div>
    <h1>Все события</h1>
    <p class="muted">Предстоящие события из всех источников, по дате ближайшего сеанса.</p>

    <div v-if="error" class="notice notice-danger">
      Не удалось загрузить события.
      <button type="button" class="link-button" @click="() => refresh()">Попробовать ещё раз</button>
    </div>

    <p v-else-if="!days.length" class="panel">Предстоящих событий пока нет.</p>

    <section v-for="day in days" :key="day.title" class="day">
      <h2>{{ day.title }}</h2>
      <ul class="cards">
        <li v-for="event in day.events" :key="event.id">
          <EventCard :event="event" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
h1 {
  margin: 0 0 0.25rem;
}
.day {
  margin-top: 1.5rem;
}
h2 {
  margin: 0 0 0.6rem;
  font-size: 1.1rem;
}
h2::first-letter {
  text-transform: uppercase;
}
</style>
