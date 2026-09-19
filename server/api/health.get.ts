export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    ok: true,
    supabaseConfigured: Boolean(config.public.supabase?.url && config.public.supabase?.key),
    time: new Date().toISOString()
  }
})
