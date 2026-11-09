// Set a public booking page for each service when the specialist's calendar is ready.
export const profile = {
  demo: true,
  // Links are HTTPS URLs; phone and email are plain values.
  contacts: {
    telegram: '',
    max: '',
    phone: '',
    vk: '',
    email: '',
    instagram: '',
  },
  // Shown in the footer as plain text while demo is true and no real contacts are set.
  demoContacts: {
    phone: '+7 900 000-00-00',
    email: 'hello@example.com',
    telegram: '@username',
    instagram: '@username',
  },
  name: 'Ярослав Племяшов',
  photo: 'portrait.jpg',
  photoAlt: 'Мужчина в синей рубашке в кабинете',
  specialty: 'Психолог-консультант',
  bio: 'Провожу онлайн-консультации для взрослых. На встрече можно обсудить перемены, отношения и то, что сейчас занимает больше всего сил.',
  // Set document to a relative path or HTTPS URL. Set preview for a photo or scan.
  credentials: [
    { year: '2019', name: 'Диплом об образовании', document: '', preview: '' },
    { year: '2022', name: 'Сертификат о повышении квалификации', document: '', preview: '' },
    { year: '2024', name: 'Подтверждение участия в конференции', document: '', preview: '' },
    { year: '2024', demo: true, name: 'Сертификат курса по интервью', document: '', preview: '' },
    { year: '2025', demo: true, name: 'Подтверждение участия в практикуме', document: '', preview: '' },
    { year: '2026', demo: true, name: 'Сертификат участника семинара', document: '', preview: '' },
  ],
  services: [
    { id: 'intro', name: 'Встреча-знакомство', details: 'Обсудим, с чем вы хотите обратиться, и определим, подходит ли вам формат консультаций.', minutes: 25, price: 1500, bookingUrl: '' },
    { id: 'individual', name: 'Индивидуальная консультация', details: 'Разберём конкретную ситуацию, поговорим о ваших переживаниях и наметим следующие шаги.', minutes: 50, price: 3500, bookingUrl: '' },
    { id: 'extended', name: 'Расширенная консультация', details: 'Больше времени для разговора, если важно спокойно обсудить несколько связанных тем.', minutes: 75, price: 4900, bookingUrl: '' },
  ],
  // Footer. Empty values are not shown.
  format: 'Онлайн-консультации из любого города',
  schedule: 'Пн–Пт, 10:00–19:00 МСК',
  // Seller details for an individual entrepreneur: full name, OGRNIP and INN.
  legal: { name: '', ogrnip: '', inn: '' },
  // Relative path or HTTPS URL. Needed once the site collects personal data (forms, analytics).
  privacyUrl: '',
  // Each section below is hidden when its list is empty.
  topics: [
    { name: 'Перемены и неопределённость', details: 'Переезд, смена работы, развод — когда привычная опора уходит из-под ног.' },
    { name: 'Отношения', details: 'Конфликты с партнёром или близкими, трудности в общении, одиночество.' },
    { name: 'Усталость и стресс', details: 'Постоянное напряжение, нехватка сил, ощущение, что всё валится из рук.' },
    { name: 'Самооценка', details: 'Сомнения в себе, сравнение с другими, сложно сказать «нет».' },
  ],
  steps: [
    { name: 'Запись', details: 'Выбираете услугу и удобное время в календаре ниже.' },
    { name: 'Подтверждение', details: 'Я присылаю ссылку на видеозвонок и пару слов о том, как подготовиться.' },
    { name: 'Встреча', details: 'Говорим в спокойном темпе. Всё сказанное остаётся между нами.' },
    { name: 'Дальше', details: 'Вместе решаем, нужна ли следующая встреча и как часто.' },
  ],
  // Reviews marked demo are shown only while demo is true. Real reviews need the client's consent.
  reviews: [
    { demo: true, author: 'Анна, 34 года', text: 'Пришла с ощущением, что всё рушится. После нескольких встреч стало понятно, с чего начать, и стало заметно спокойнее.' },
    { demo: true, author: 'Михаил, 41 год', text: 'Боялся, что будут учить жизни. Ничего подобного: внимательно слушали и помогли самому разобраться.' },
    { demo: true, author: 'Екатерина, 28 лет', text: 'Удобно, что онлайн, — не нужно никуда ехать. Записалась на сайте за минуту.' },
    { demo: true, author: 'Ольга, 46 лет', text: 'Долго откладывала, думала, справлюсь сама. Жалею только о том, что не обратилась раньше.' },
    { demo: true, author: 'Дмитрий, 37 лет', text: 'Помогло разобраться с выгоранием на работе. Получил конкретные шаги, а не общие советы.' },
    { demo: true, author: 'Алина, 25 лет', text: 'Очень бережное отношение. Ни разу не почувствовала, что меня оценивают.' },
  ],
  // Optional HTTPS link to reviews on Yandex Maps, 2GIS or another service.
  reviewsUrl: '',
  faq: [
    { question: 'Как проходит онлайн-консультация?', answer: 'По видеосвязи в удобном вам мессенджере. Нужны наушники и место, где вас никто не потревожит.' },
    { question: 'Что если мне нужно отменить встречу?', answer: 'Напишите не позже чем за 24 часа — перенесём на другое время без оплаты.' },
    { question: 'Сколько встреч понадобится?', answer: 'Иногда достаточно одной-двух. Если запрос глубже, договариваемся о регулярных встречах. Решение всегда за вами.' },
    { question: 'Это конфиденциально?', answer: 'Да. Я не передаю информацию о вас третьим лицам и не записываю встречи.' },
  ],
};
