<script setup lang="ts">
const supabase = useSupabaseClient()

// Данные о пользователе берём с бэкенда — так видно, что сервер тоже знает о сессии
const { data: me } = await useFetch('/api/me')

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <main class="card">
    <h1>BumpDemo</h1>
    <p>Вы вошли как <strong>{{ me?.email }}</strong></p>
    <p class="muted">Ответ бэкенда <code>GET /api/me</code>:</p>
    <pre>{{ me }}</pre>
    <button type="button" @click="signOut">Выйти</button>
  </main>
</template>

<style scoped>
.card {
  max-width: 480px;
  margin: 10vh auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}
h1 {
  margin-top: 0;
}
.muted {
  color: #6b7280;
  font-size: 0.9rem;
}
pre {
  padding: 0.75rem;
  background: #f6f7f9;
  border-radius: 8px;
  overflow-x: auto;
}
button {
  padding: 0.6rem 1rem;
  border: 1px solid #d0d4da;
  border-radius: 8px;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
</style>
