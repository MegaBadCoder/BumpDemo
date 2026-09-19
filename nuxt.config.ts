// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  supabase: {
    // Не редиректить всех неавторизованных на /login — включим, когда появится авторизация
    redirect: false,
    // Типы БД сгенерируем через Supabase MCP, когда появятся таблицы
    types: false
  }
})
