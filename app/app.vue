<script setup lang="ts">
const { data: health } = await useFetch('/api/health')
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <main style="font-family: system-ui, sans-serif; padding: 2rem">
      <h1>BumpDemo</h1>
      <p>Nuxt: фронтенд и бэкенд (server/api) в одном проекте, данные — Supabase.</p>
      <pre>{{ health }}</pre>
    </main>
  </div>
</template>
