<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const socialLinks = [
  { label: 'Rutube', href: 'https://rutube.ru/shorts/e7929d5c105345556124fbcb87bfe1b1/' },
  { label: 'Дзен', href: 'https://dzen.ru/id/6aae68e81f92461355c6ed0c' },
  { label: 'ВКонтакте', href: 'https://vk.ru/club241603191' }
]

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="shell">
    <header class="site-header">
      <div class="container header-row">
        <NuxtLink to="/" class="brand">
          BumpDemo <span class="brand-note">афиша Перми и края</span>
        </NuxtLink>
        <nav class="nav" aria-label="Разделы">
          <NuxtLink to="/events">События</NuxtLink>
          <NuxtLink to="/search">Поиск</NuxtLink>
          <NuxtLink to="/quiz">Квиз</NuxtLink>
          <NuxtLink to="/sources">Источники</NuxtLink>
        </nav>
        <div class="account">
          <span v-if="user" class="email">{{ user.email }}</span>
          <button type="button" class="link-button" @click="signOut">Выйти</button>
        </div>
      </div>
    </header>

    <!-- Требование к демо: заглушки названы явно -->
    <p class="demo-strip">
      Демо: события и источники пока заглушки, данные не настоящие
    </p>

    <main class="container page">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container footer-row">
        <NuxtLink to="/sources">Источники событий</NuxtLink>
        <NuxtLink to="/submit">Добавить событие</NuxtLink>
        <NuxtLink to="/promote">Организаторам</NuxtLink>
        <nav class="social" aria-labelledby="social-title">
          <span id="social-title" class="social-title">Мы в соцсетях:</span>
          <a
            v-for="link in socialLinks"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
          >{{ link.label }}</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.site-header {
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}
.header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  padding-block: 0.75rem;
}
.brand {
  font-weight: 800;
  font-size: 1.15rem;
  text-decoration: none;
}
.brand-note {
  display: none;
  margin-left: 0.35rem;
  color: var(--muted);
  font-weight: 400;
  font-size: 0.85rem;
}
.nav {
  display: flex;
  gap: 1rem;
  order: 3;
  width: 100%;
}
.nav a {
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
}
.nav a.router-link-active {
  color: var(--ink);
  box-shadow: inset 0 -2px 0 var(--accent);
}
.account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  font-size: 0.9rem;
}
.email {
  display: none;
  color: var(--muted);
}
.demo-strip {
  margin: 0;
  padding: 0.4rem 16px;
  background: var(--warn-bg);
  color: var(--warn-ink);
  font-size: 0.8rem;
  text-align: center;
}
.page {
  flex: 1;
  padding-block: 1.5rem 3rem;
}
.site-footer {
  border-top: 1px solid var(--line);
  background: var(--surface);
  font-size: 0.9rem;
}
.footer-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  padding-block: 1.25rem;
}
.footer-row a {
  color: var(--muted);
}
/* Соцсети — отдельный блок: на узком экране своей строкой, на широком справа */
.social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  width: 100%;
}
.social-title {
  color: var(--ink);
  font-weight: 500;
}

@media (min-width: 720px) {
  .brand-note,
  .email {
    display: inline;
  }
  .nav {
    order: 0;
    width: auto;
  }
  .social {
    width: auto;
    margin-left: auto;
  }
}
</style>
