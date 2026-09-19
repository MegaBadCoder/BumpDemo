// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' }
    }
  },
  runtimeConfig: {
    // Модель для разбора запроса обычными словами, через Polza.ai (OpenAI-совместимый API).
    // Только на сервере. Переопределяется через NUXT_AI_API_KEY, NUXT_AI_MODEL, NUXT_AI_BASE_URL
    ai: {
      // Демо-ключ: владелец проекта разрешил держать его в репозитории
      apiKey: 'pza_20MKXRG5geAvylPkNZUUJYw1IVF3vt7S',
      baseUrl: 'https://polza.ai/api/v1',
      model: 'anthropic/claude-sonnet-5'
    },
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
