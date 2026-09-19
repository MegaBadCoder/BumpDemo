<script setup lang="ts">
const route = useRoute()

const TITLES: Record<string, string> = {
  'neznakomaya-perm': 'Пермь, которую ты не знаешь',
  'na-vyhodnye': 'На выходные'
}
const title = computed(() => TITLES[String(route.params.slug)] ?? 'Подборка')
</script>

<template>
  <StubPage
    :title="title"
    priority="Если успеем"
    :plans="[
      'Тематическая подборка событий из локальных источников',
      'Кнопка «Сюрприз»: одно случайное событие под ваши условия',
      'Сюда будут вести посты из Telegram-канала и сообщества ВКонтакте'
    ]"
  />
</template>
