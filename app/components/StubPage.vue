<script setup lang="ts">
// Заглушка раздела не из MVP: на него уже ведут ссылки, поэтому вместо 404 честно пишем, что будет
const props = defineProps<{
  title: string
  /** Приоритет с доски в Miro */
  priority: string
  plans: string[]
}>()

useHead({ title: props.title })
</script>

<template>
  <section class="stub panel">
    <p>
      <span class="badge badge-stub">Заглушка</span>
      <span class="muted">приоритет на доске: «{{ priority }}»</span>
    </p>
    <h1>{{ title }}</h1>
    <p>Раздел ещё не сделан. Здесь будет:</p>
    <ul>
      <li v-for="plan in plans" :key="plan">{{ plan }}</li>
    </ul>
    <slot />
    <p class="actions">
      <NuxtLink to="/" class="btn btn-primary">На главную</NuxtLink>
      <NuxtLink to="/events" class="btn">Все события</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.stub {
  max-width: 640px;
  padding: 1.5rem;
}
h1 {
  margin: 0.75rem 0;
}
li {
  margin-bottom: 0.3rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>
