// ЗАГЛУШКА. Подключённые источники из исследования в Miro (фрейм «Источники», решение «MVP»).
// Сборщиков пока нет: время и статус последнего сбора выдуманы и отсчитываются от текущего момента.

export type MockSource = Omit<SourceInfo, 'eventsCount'>

export function buildMockSources(now: Date): MockSource[] {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString()
  const ok = (minutes: number) => ({ startedAt: ago(minutes), status: 'ok' as const, error: null })

  return [
    {
      id: 1, name: 'Ticketland', kind: 'jsonld', url: 'https://perm.ticketland.ru/afisha/',
      coverage: 'Пермь', schedule: 'каждые 6 часов', lastRun: ok(35)
    },
    {
      id: 2, name: 'Kassir.ru', kind: 'jsonld', url: 'https://perm.kassir.ru',
      coverage: 'Пермь', schedule: 'каждые 6 часов', lastRun: ok(40)
    },
    {
      id: 3, name: 'PRO.Культура.РФ', kind: 'api', url: 'https://pro.culture.ru',
      coverage: 'Пермский край', schedule: 'раз в сутки', lastRun: ok(9 * 60)
    },
    {
      id: 4, name: 'Пермская филармония', kind: 'jsonld', url: 'https://filarmonia.online/afisha/',
      coverage: 'Пермь', schedule: 'каждые 6 часов', lastRun: ok(50)
    },
    {
      id: 5, name: 'Telegram «Афиша Пермь | Куда Сходить»', kind: 'telegram', url: 'https://t.me/s/afisha_perm_afisha',
      coverage: 'Пермь', schedule: 'каждый час',
      lastRun: { startedAt: ago(12), status: 'partial', error: 'В 3 постах нет даты, такие события не публикуем' }
    },
    {
      id: 6, name: 'fest59.ru', kind: 'html', url: 'https://fest59.ru',
      coverage: 'Пермский край', schedule: 'раз в сутки',
      lastRun: { startedAt: ago(5 * 60), status: 'failed', error: 'Сайт не ответил за 30 секунд' }
    },
    {
      id: 7, name: 'Афиши городов края', kind: 'html', url: 'https://berkultura.ru/afisha-meroprijatij',
      coverage: 'Березники, Соликамск, Чусовой', schedule: 'раз в сутки', lastRun: ok(7 * 60)
    }
  ]
}
