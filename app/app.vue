<script setup lang="ts">
useHead({
  titleTemplate: title => (title ? `${title} · BumpDemo` : 'BumpDemo')
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
