<script setup lang="ts">
// Картинка события с подписью. Пока картинок нет, рисуем цветную плашку по рубрике
const props = defineProps<{
  image: EventImage | null
  category?: string
  /** Маленький квадрат в карточке выдачи, без подписи */
  compact?: boolean
}>()

const CATEGORY_COLORS: Record<string, string> = {
  концерт: '#3452b4',
  спектакль: '#8a2f9e',
  выставка: '#0b7285',
  кино: '#343a40',
  лекция: '#5f3dc4',
  детям: '#d9650b',
  фестиваль: '#c8401a',
  стендап: '#c2255c',
  экскурсия: '#2b8a3e',
  спорт: '#1864ab'
}

const color = computed(() => CATEGORY_COLORS[props.category ?? ''] ?? '#6f6861')

const caption = computed(() => {
  if (!props.image) return null
  if (props.image.kind === 'illustration') return 'Иллюстрация, не фото события'
  return props.image.credit ? `Фото: ${props.image.credit}` : 'Фото из источника'
})
</script>

<template>
  <figure class="cover" :class="{ compact }">
    <img v-if="image" :src="image.url" :alt="caption ?? ''" loading="lazy">
    <div v-else class="placeholder" :style="{ '--cover': color }" aria-hidden="true">
      <span>{{ category }}</span>
    </div>
    <figcaption v-if="!compact && caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.cover {
  margin: 0;
}
img,
.placeholder {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  object-fit: cover;
}
.placeholder {
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  background:
    radial-gradient(circle at 85% 15%, rgb(255 255 255 / 0.22), transparent 45%),
    linear-gradient(135deg, var(--cover), color-mix(in srgb, var(--cover), #000 35%));
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
}
.compact img,
.compact .placeholder {
  aspect-ratio: 1;
  border-radius: 10px;
}
.compact .placeholder {
  padding: 0.5rem;
  font-size: 0.7rem;
}
figcaption {
  margin-top: 0.35rem;
  color: var(--muted);
  font-size: 0.8rem;
}
</style>
