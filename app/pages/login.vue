<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { demoEmail, demoPassword } = useRuntimeConfig().public

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

// Пользователь появляется после входа (или уже вошёл) — уводим на главную
watch(user, (value) => {
  if (value) navigateTo('/')
}, { immediate: true })

async function signIn() {
  loading.value = true
  errorMessage.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (error) errorMessage.value = error.message
}

function signInAsDemo() {
  email.value = demoEmail
  password.value = demoPassword
  signIn()
}
</script>

<template>
  <main class="card">
    <h1>Вход в BumpDemo</h1>

    <form @submit.prevent="signIn">
      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" required>
      </label>
      <label>
        Пароль
        <input v-model="password" type="password" autocomplete="current-password" required>
      </label>
      <button type="submit" :disabled="loading">Войти</button>
    </form>

    <div class="demo">
      <p>Тестовый аккаунт для всех: <code>{{ demoEmail }}</code> / <code>{{ demoPassword }}</code></p>
      <button type="button" class="secondary" :disabled="loading" @click="signInAsDemo">
        Войти тестовым аккаунтом
      </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </main>
</template>

<style scoped>
.card {
  max-width: 360px;
  margin: 10vh auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}
h1 {
  margin-top: 0;
  font-size: 1.4rem;
}
form {
  display: grid;
  gap: 0.75rem;
}
label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
}
input {
  padding: 0.6rem;
  border: 1px solid #d0d4da;
  border-radius: 8px;
  font: inherit;
}
button {
  padding: 0.65rem;
  border: 0;
  border-radius: 8px;
  background: #3ecf8e;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
button.secondary {
  width: 100%;
  background: #1a1d21;
}
.demo {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eceef1;
  font-size: 0.85rem;
}
.error {
  color: #d64545;
  font-size: 0.9rem;
}
</style>
