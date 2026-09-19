<script setup lang="ts">
useHead({ title: 'Куда сходить в Перми' })

const EXAMPLE = 'Завтра с ребёнком, в центре, до 1 500 ₽, в помещении'

const query = ref('')
const { search, pending, error } = useTextSearch()

const scenarios = [
  { title: 'Сегодня вечером', note: 'начало после 17:00', query: { date: 'tonight' } },
  { title: 'С ребёнком', note: 'можно с 6 лет', query: { company: 'kids' } },
  { title: 'Бесплатно', note: 'вход свободный', query: { budget: '0' } }
]

const more = [
  {
    title: 'Не знаю, чего хочу',
    note: 'Пара простых вопросов — и сервис сам сузит выбор',
    to: '/quiz',
    soon: false
  },
  {
    title: 'Собери мне вечер',
    note: 'Событие, ужин и прогулка рядом: маршрут с временем на дорогу и общей суммой',
    to: '/evening',
    soon: true
  },
  {
    title: 'Пермь, которую ты не знаешь',
    note: 'Необычные площадки и районные инициативы',
    to: '/collection/neznakomaya-perm',
    soon: true
  },
  {
    title: 'На выходные',
    note: 'Подборка на ближайшие субботу и воскресенье',
    to: '/collection/na-vyhodnye',
    soon: true
  }
]
</script>

<template>
  <div>
    <section class="hero">
      <h1>Куда сходить в Перми?</h1>
      <p class="lead">
        Напишите, что хочется, обычными словами. Подберём события из театров, филармонии,
        билетных касс и городских каналов.
      </p>
      <form class="query-form" role="search" @submit.prevent="search(query)">
        <input
          v-model="query"
          type="search"
          name="q"
          :placeholder="EXAMPLE"
          aria-label="Что ищем"
          enterkeyhint="search"
        >
        <button class="btn btn-primary" type="submit" :disabled="pending">{{ pending ? 'Разбираем…' : 'Найти' }}</button>
      </form>
      <p class="hint muted">
        Например:
        <button type="button" class="link-button" @click="query = EXAMPLE">{{ EXAMPLE }}</button>
      </p>
      <p v-if="error" class="notice notice-danger">{{ error }}</p>
    </section>

    <section class="section">
      <h2>Быстрый выбор</h2>
      <div class="grid">
        <NuxtLink
          v-for="item in scenarios"
          :key="item.title"
          :to="{ path: '/search', query: item.query }"
          class="tile"
        >
          <strong>{{ item.title }}</strong>
          <span class="muted">{{ item.note }}</span>
        </NuxtLink>
      </div>
      <p><NuxtLink to="/events">Все события по датам →</NuxtLink></p>
    </section>

    <section class="section">
      <h2>Ещё способы выбрать</h2>
      <div class="grid">
        <NuxtLink v-for="item in more" :key="item.to" :to="item.to" class="tile">
          <span v-if="item.soon" class="badge badge-stub">скоро</span>
          <strong>{{ item.title }}</strong>
          <span class="muted">{{ item.note }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding-block: 1rem 0.5rem;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.9rem, 6vw, 2.8rem);
}
.lead {
  max-width: 36rem;
  margin: 0 0 1.25rem;
  color: var(--muted);
  font-size: 1.05rem;
}
.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.query-form input {
  flex: 1 1 16rem;
  min-height: 52px;
  padding: 0 1rem;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: var(--surface);
  font-size: 1rem;
}
.query-form .btn {
  min-height: 52px;
  padding-inline: 1.5rem;
}
.hint {
  font-size: 0.9rem;
}
.hint .link-button {
  text-align: left;
}
.section {
  margin-top: 2.25rem;
}
h2 {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}
.grid {
  display: grid;
  gap: 10px;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  text-decoration: none;
}
.tile:hover {
  border-color: var(--muted);
}
.tile strong {
  font-size: 1.05rem;
}
.tile .muted {
  font-size: 0.9rem;
}

@media (min-width: 720px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
