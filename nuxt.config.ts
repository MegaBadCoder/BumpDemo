// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  runtimeConfig: {
    public: {
      // Общий тестовый аккаунт — показывается всем на странице входа
      demoEmail: 'demo@example.com',
      demoPassword: 'BumpDemo-2026'
    }
  },
  supabase: {
    // Все страницы, кроме /login, требуют входа (redirect включён по умолчанию)
    // Типы БД сгенерируем через Supabase MCP, когда появятся таблицы
    types: false
  }
})
