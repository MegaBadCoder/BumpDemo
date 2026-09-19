// ЗАГЛУШКА. Выдуманные события для демо, пока в Supabase нет сеансов, площадок и источников.
// Даты считаются от «сегодня» по Перми, поэтому выдача не пустеет со временем.
// Картинок пока нет (image: null): их принесёт сборщик из источников через Supabase Storage.
import { buildMockSources } from './sources'

type OptionalEventField = 'description' | 'status' | 'unverifiedFields' | 'isPromo' | 'image' | 'presentations'
type EventInput = Omit<EventDetails, OptionalEventField> & Partial<Pick<EventDetails, OptionalEventField>>
type SessionInput = Partial<Omit<EventSession, 'id'>> & Pick<EventSession, 'startsAt'>

const perm = (name: string, address: string | null, district: string): Venue =>
  ({ name, address, locality: 'Пермь', district })

const venues = {
  opera: perm('Театр оперы и балета', 'ул. Петропавловская, 25А', 'Ленинский'),
  organ: perm('Органный концертный зал', 'ул. Ленина, 51', 'Ленинский'),
  puppets: perm('Театр кукол', 'ул. Сибирская, 20', 'Ленинский'),
  teatrTeatr: perm('Театр-Театр', 'ул. Ленина, 53', 'Ленинский'),
  gallery: perm('Пермская художественная галерея', null, 'Ленинский'),
  esplanade: perm('Эспланада', null, 'Ленинский'),
  embankment: perm('Набережная Камы', null, 'Ленинский'),
  standup: perm('Бар «Сказка»', 'ул. Екатерининская, 120', 'Ленинский'),
  permm: perm('Музей PERMM, внутренний двор', 'бульвар Гагарина, 24', 'Мотовилихинский'),
  clay: perm('Арт-студия «Глина»', 'ул. Уральская, 36', 'Мотовилихинский'),
  library: perm('Библиотека-клуб «Книжный двор»', 'ул. Куйбышева, 110', 'Свердловский'),
  kungurCave: { name: 'Кунгурская Ледяная пещера', address: 'с. Филипповка', locality: 'Кунгур', district: null },
  solikamsk: { name: 'Соборная площадь', address: null, locality: 'Соликамск', district: null },
  chusovoy: { name: 'Музей реки Чусовой', address: null, locality: 'Чусовой', district: null }
} satisfies Record<string, Venue>

export function buildMockEvents(now: Date): EventDetails[] {
  const today = permDay(now)
  const at = (days: number, time: string) => permTime(shiftDay(today, days), time).toISOString()
  // Ближайшая суббота, сегодня, если суббота уже наступила
  const saturday = (6 - weekdayOf(today) + 7) % 7

  const sources = new Map(buildMockSources(now).map(source => [source.id, source]))
  const seen = (sourceId: number, minutesAgo: number, extra: Partial<EventSourceRef> = {}): EventSourceRef => {
    const source = sources.get(sourceId)!
    return {
      sourceId,
      sourceName: source.name,
      kind: source.kind,
      url: source.url,
      isPrimary: false,
      categoryRaw: null,
      lastSeenAt: new Date(now.getTime() - minutesAgo * 60_000).toISOString(),
      ...extra
    }
  }

  let lastSessionId = 0
  const session = (input: SessionInput): EventSession => ({
    id: ++lastSessionId,
    endsAt: null,
    venue: null,
    priceMin: null,
    priceMax: null,
    priceText: null,
    isFree: false,
    ticketUrl: null,
    status: 'scheduled',
    movedFrom: null,
    ...input
  })
  const event = (input: EventInput): EventDetails => ({
    description: null,
    status: 'active',
    unverifiedFields: [],
    isPromo: false,
    image: null,
    presentations: [],
    ...input
  })

  const ticketland = 'https://perm.ticketland.ru/afisha/'
  const kassir = 'https://perm.kassir.ru'

  return [
    event({
      id: 1,
      title: 'Щелкунчик',
      description: 'Балет в двух действиях на музыку Чайковского.',
      categories: ['спектакль'],
      ageMin: 6,
      durationMin: 150,
      setting: 'indoor',
      sessions: [
        session({ startsAt: at(2, '19:00'), venue: venues.opera, priceMin: 800, priceMax: 4500, ticketUrl: ticketland }),
        session({ startsAt: at(3, '19:00'), venue: venues.opera, priceMin: 800, priceMax: 4500, ticketUrl: ticketland }),
        session({ startsAt: at(9, '12:00'), venue: venues.opera, priceMin: 600, priceMax: 3500, ticketUrl: ticketland })
      ],
      sources: [
        seen(1, 35, { isPrimary: true, categoryRaw: 'Балет' }),
        seen(2, 40, { categoryRaw: 'Театр' })
      ],
      presentations: [
        { audience: 'parents', body: 'Знакомая сказка для первого похода на балет: два действия с антрактом, в перерыве можно размяться.' },
        { audience: 'friends', body: 'Классика в полном составе: повод нарядиться и выбраться в театр компанией.' },
        { audience: 'tourists', body: 'Пермский балет известен на всю страну, театр стоит в центре, рядом с набережной.' }
      ]
    }),
    event({
      id: 2,
      title: 'Джаз в Органном зале',
      description: 'Вечер джазовых стандартов: квартет и орган.',
      categories: ['концерт'],
      ageMin: 12,
      durationMin: 120,
      setting: 'indoor',
      sessions: [
        session({ startsAt: at(0, '19:00'), venue: venues.organ, priceMin: 600, priceMax: 1500, ticketUrl: 'https://filarmonia.online/afisha/' })
      ],
      sources: [
        seen(4, 50, { isPrimary: true, categoryRaw: 'Джаз' }),
        seen(1, 35, { categoryRaw: 'Концерты' })
      ]
    }),
    event({
      id: 3,
      title: 'Кот в сапогах',
      description: 'Кукольный спектакль для самых маленьких.',
      categories: ['спектакль', 'детям'],
      ageMin: 0,
      durationMin: 60,
      setting: 'indoor',
      sessions: [
        session({ startsAt: at(1, '11:00'), venue: venues.puppets, priceMin: 400, priceMax: 600, ticketUrl: kassir }),
        session({ startsAt: at(1, '14:00'), venue: venues.puppets, priceMin: 400, priceMax: 600, ticketUrl: kassir }),
        session({ startsAt: at(8, '11:00'), venue: venues.puppets, priceMin: 400, priceMax: 600, ticketUrl: kassir })
      ],
      sources: [seen(2, 40, { isPrimary: true, categoryRaw: 'Детям' })],
      presentations: [
        { audience: 'parents', body: 'Спектакль на час, без антракта: подходит даже тем, кто ещё не сидел в зале так долго.' }
      ]
    }),
    event({
      id: 4,
      title: 'Фестиваль уличной еды',
      description: 'Фудкорты, музыка и мастер-классы на эспланаде.',
      categories: ['фестиваль'],
      ageMin: null,
      durationMin: 480,
      setting: 'outdoor',
      unverifiedFields: ['durationMin'],
      sessions: [
        session({ startsAt: at(saturday, '12:00'), endsAt: at(saturday, '20:00'), venue: venues.esplanade, isFree: true })
      ],
      sources: [seen(5, 12, { isPrimary: true })]
    }),
    event({
      id: 5,
      title: 'Стендап: открытый микрофон',
      description: 'Новые комики пробуют материал.',
      categories: ['стендап'],
      ageMin: 18,
      durationMin: null,
      setting: 'indoor',
      unverifiedFields: ['price'],
      sessions: [
        session({ startsAt: at(0, '20:00'), venue: venues.standup, priceMin: 300, priceText: '300 ₽ на входе' })
      ],
      sources: [seen(5, 12, { isPrimary: true })]
    }),
    event({
      id: 6,
      title: 'Пермский звериный стиль',
      description: 'Выставка бронзового литья из фондов галереи.',
      categories: ['выставка'],
      ageMin: 0,
      durationMin: null,
      setting: 'indoor',
      sessions: [
        session({ startsAt: at(-10, '10:00'), endsAt: at(40, '18:00'), venue: venues.gallery, priceMin: 300 })
      ],
      sources: [seen(3, 9 * 60, { isPrimary: true, categoryRaw: 'Выставки' })]
    }),
    event({
      id: 7,
      title: 'Как устроен космос',
      description: 'Онлайн-лекция о чёрных дырах.',
      categories: ['лекция'],
      ageMin: 12,
      durationMin: 90,
      setting: 'online',
      sessions: [session({ startsAt: at(3, '19:00'), isFree: true })],
      sources: [seen(3, 9 * 60, { isPrimary: true, categoryRaw: 'Лекции' })]
    }),
    event({
      id: 8,
      title: 'Симфонический вечер',
      description: 'Оркестр филармонии: Рахманинов и Шостакович.',
      categories: ['концерт'],
      ageMin: 6,
      durationMin: 110,
      setting: 'indoor',
      sessions: [
        session({ startsAt: at(5, '19:00'), venue: venues.organ, priceMin: 700, priceMax: 2500, ticketUrl: 'https://filarmonia.online/afisha/' })
      ],
      sources: [
        seen(4, 50, { isPrimary: true, categoryRaw: 'Симфоническая музыка' }),
        seen(2, 40, { categoryRaw: 'Классика' }),
        seen(1, 35, { categoryRaw: 'Концерты' })
      ]
    }),
    event({
      id: 9,
      title: 'Забег «Пермская осень»',
      description: 'Дистанции 5 и 10 км по набережной Камы.',
      categories: ['спорт'],
      ageMin: 16,
      durationMin: null,
      setting: 'outdoor',
      status: 'cancelled',
      sessions: [
        session({ startsAt: at(2, '09:00'), venue: venues.embankment, priceMin: 500, status: 'cancelled' })
      ],
      sources: [seen(5, 12, { isPrimary: true })]
    }),
    event({
      id: 10,
      title: 'Кино под открытым небом',
      description: 'Показ советской классики во дворе музея.',
      categories: ['кино'],
      ageMin: 12,
      durationMin: 100,
      setting: 'outdoor',
      unverifiedFields: ['ageMin'],
      sessions: [session({ startsAt: at(1, '20:30'), venue: venues.permm, isFree: true })],
      sources: [seen(5, 12, { isPrimary: true })]
    }),
    event({
      id: 11,
      title: 'Кунгурская Ледяная пещера: экскурсия',
      description: 'Маршрут по гротам пещеры с экскурсоводом. Внутри прохладно круглый год.',
      categories: ['экскурсия'],
      ageMin: 6,
      durationMin: 80,
      setting: 'indoor',
      isPromo: true,
      sessions: [
        session({ startsAt: at(1, '10:00'), venue: venues.kungurCave, priceMin: 900, priceMax: 1500 }),
        session({ startsAt: at(1, '13:00'), venue: venues.kungurCave, priceMin: 900, priceMax: 1500 }),
        session({ startsAt: at(2, '10:00'), venue: venues.kungurCave, priceMin: 900, priceMax: 1500 })
      ],
      sources: [seen(3, 9 * 60, { isPrimary: true, categoryRaw: 'Экскурсии' })],
      presentations: [
        { audience: 'tourists', body: 'Главная природная достопримечательность края, на машине от Перми около полутора часов.' },
        { audience: 'parents', body: 'Экскурсия с шести лет. Возьмите тёплую одежду, в пещере холодно даже летом.' }
      ]
    }),
    event({
      id: 12,
      title: 'Праздник соли',
      description: 'Городской фестиваль с ярмаркой ремёсел и концертом.',
      categories: ['фестиваль'],
      ageMin: 0,
      durationMin: 360,
      setting: 'outdoor',
      sessions: [
        session({ startsAt: at(saturday, '11:00'), endsAt: at(saturday, '17:00'), venue: venues.solikamsk, isFree: true })
      ],
      // fest59.ru упал при последнем сборе, поэтому событие давно не подтверждалось
      sources: [seen(6, 30 * 60, { isPrimary: true, categoryRaw: 'Фестивали' })]
    }),
    event({
      id: 13,
      title: 'Музей реки Чусовой: экскурсия',
      description: 'История сплава по Чусовой и железных караванов.',
      categories: ['экскурсия'],
      ageMin: 6,
      durationMin: 60,
      setting: 'indoor',
      sessions: [session({ startsAt: at(4, '16:00'), venue: venues.chusovoy, priceMin: 250 })],
      sources: [seen(7, 7 * 60, { isPrimary: true })]
    }),
    event({
      id: 14,
      title: 'Три сестры',
      description: 'Спектакль по пьесе Чехова.',
      categories: ['спектакль'],
      ageMin: 16,
      durationMin: 180,
      setting: 'indoor',
      sessions: [
        session({ startsAt: at(3, '19:00'), venue: venues.teatrTeatr, priceMin: 1000, priceMax: 3500, ticketUrl: kassir, status: 'moved', movedFrom: at(1, '19:00') }),
        session({ startsAt: at(10, '19:00'), venue: venues.teatrTeatr, priceMin: 1000, priceMax: 3500, ticketUrl: kassir })
      ],
      sources: [
        seen(2, 40, { isPrimary: true, categoryRaw: 'Драма' }),
        seen(1, 35, { categoryRaw: 'Спектакли' })
      ]
    }),
    event({
      id: 15,
      title: 'Керамика для детей',
      description: 'Мастер-класс: лепим и расписываем кружку.',
      categories: ['детям'],
      ageMin: 6,
      durationMin: 90,
      setting: 'indoor',
      unverifiedFields: ['price'],
      sessions: [
        session({ startsAt: at(1, '12:00'), venue: venues.clay, priceMin: 1200 }),
        session({ startsAt: at(saturday + 7, '12:00'), venue: venues.clay, priceMin: 1200 })
      ],
      sources: [seen(5, 12, { isPrimary: true })]
    }),
    event({
      id: 16,
      title: 'Литературный вечер: уральские писатели',
      description: 'Чтения и разговор о Мамине-Сибиряке и Бажове.',
      categories: ['лекция'],
      ageMin: 12,
      durationMin: 90,
      setting: 'indoor',
      sessions: [session({ startsAt: at(0, '18:30'), venue: venues.library, isFree: true })],
      sources: [seen(3, 9 * 60, { isPrimary: true, categoryRaw: 'Литература' })]
    })
  ]
}
