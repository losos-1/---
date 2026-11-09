import { profile } from './profile.js';

const get = id => document.getElementById(id);
const calendar = get('calendar');
const service = get('service');
const confirm = get('confirm');
const status = get('status');
const storageKey = 'praktika.demo-bookings.v1';
const zone = 'Europe/Moscow';
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'full', timeZone: 'UTC' });
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateKey = date => date.toISOString().slice(0, 10);
const todayKey = () => new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeZone: zone }).format();
const tomorrow = () => offsetDate(todayKey(), 1);
const lastDay = () => offsetDate(todayKey(), 45);
const times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const price = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

let month = parseDate(todayKey().slice(0, 7) + '-01');
let selectedDay = '';
let selectedTime = '';
let records = readRecords();

function parseDate(key) {
  return new Date(key + 'T00:00:00Z');
}

function offsetDate(key, offset) {
  const date = parseDate(key);
  date.setUTCDate(date.getUTCDate() + offset);
  return dateKey(date);
}

function element(tag, content = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = content;
  node.className = className;
  if (tag === 'button') node.type = 'button';
  return node;
}

function readRecords() {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(items) ? items.filter(item =>
      item && profile.services.some(entry => entry.id === item.id) &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.day) && Number.isFinite(parseDate(item.day).valueOf()) &&
      times.includes(item.time) && Number.isFinite(item.minutes) && item.minutes > 0
    ) : [];
  } catch {
    return [];
  }
}

function saveRecords(items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
    records = items;
    return true;
  } catch {
    status.textContent = 'Браузер не разрешил сохранить демозапись.';
    return false;
  }
}

function dateLabel(key) {
  return dayFormatter.format(parseDate(key));
}

function serviceLabel(entry) {
  return entry.minutes + ' мин · ' + price.format(entry.price);
}

function currentService() {
  return profile.services.find(entry => entry.id === service.value);
}

function bookingUrl(entry) {
  try {
    const url = new URL(entry.bookingUrl);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function renderContacts() {
  const contacts = profile.contacts;
  for (const link of document.querySelectorAll('[data-contact]')) {
    const type = link.dataset.contact;
    const value = contacts[type].trim();
    if (!value) continue;

    if (type === 'phone') {
      const number = value.replace(/[\s().-]/g, '');
      if (!/^\+?\d{7,15}$/.test(number)) continue;
      link.href = 'tel:' + number;
      const phone = get('header-phone');
      phone.textContent = value;
      phone.href = link.href;
      phone.hidden = false;
    } else {
      if (!URL.canParse(value) || new URL(value).protocol !== 'https:') continue;
      link.href = value;
    }
    link.removeAttribute('aria-disabled');
    link.title = link.getAttribute('aria-label');
  }
}

const contactTypes = [
  { type: 'phone', label: 'Телефон' },
  { type: 'email', label: 'Почта' },
  { type: 'telegram', label: 'Telegram' },
  { type: 'max', label: 'MAX' },
  { type: 'vk', label: 'ВКонтакте' },
  { type: 'instagram', label: 'Instagram*' },
];

function contactLink(type, value) {
  if (type === 'phone') {
    const number = value.replace(/[\s().-]/g, '');
    return /^\+?\d{7,15}$/.test(number) ? 'tel:' + number : '';
  }
  if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'mailto:' + value : '';
  return URL.canParse(value) && new URL(value).protocol === 'https:' ? value : '';
}

function collectFooterContacts() {
  const real = [];
  for (const { type, label } of contactTypes) {
    const value = (profile.contacts[type] || '').trim();
    const href = value && contactLink(type, value);
    if (href) real.push({ type, label, href, text: href.startsWith('https:') ? value.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '') : value });
  }
  if (real.length || !profile.demo) return real;
  return contactTypes
    .filter(({ type }) => profile.demoContacts?.[type])
    .map(({ type, label }) => ({ type, label, text: profile.demoContacts[type] }));
}

function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value, location.href);
    return url.protocol === 'https:' || url.origin === location.origin ? url.href : '';
  } catch {
    return '';
  }
}

function renderFooter() {
  get('footer-name').textContent = profile.name;
  get('footer-specialty').textContent = profile.specialty;
  const format = get('footer-format');
  format.textContent = profile.format || '';
  format.hidden = !profile.format;

  const contactList = get('footer-contacts');
  const contacts = collectFooterContacts();
  for (const item of contacts) {
    const row = element('li', '', 'footer-contact');
    const value = element(item.href ? 'a' : 'span', item.text);
    if (item.href) {
      value.href = item.href;
      if (item.href.startsWith('https:')) {
        value.target = '_blank';
        value.rel = 'noopener noreferrer';
      }
    }
    row.append(element('span', item.label, 'footer-label'), value);
    contactList.append(row);
  }
  get('footer-meta-note').hidden = !contacts.some(item => item.type === 'instagram');
  if (profile.schedule) contactList.append(element('li', profile.schedule, 'footer-muted'));
  get('footer-contacts-col').hidden = contactList.children.length === 0;

  const navList = get('footer-nav');
  for (const source of document.querySelectorAll('.top nav a')) {
    const target = document.querySelector(source.getAttribute('href'));
    if (source.hidden || !target || target.hidden) continue;
    const row = element('li');
    const link = element('a', source.textContent);
    link.href = source.getAttribute('href');
    row.append(link);
    navList.append(row);
  }

  const legal = profile.legal || {};
  const parts = [];
  if (legal.name) parts.push(legal.name);
  if (legal.ogrnip) parts.push('ОГРНИП ' + legal.ogrnip);
  if (legal.inn) parts.push('ИНН ' + legal.inn);
  const year = new Date().getFullYear();
  get('footer-legal').textContent = parts.length
    ? '© ' + year + ' ' + parts.join(' · ')
    : profile.demo ? 'Демонстрационный сайт. Здесь будут реквизиты: ФИО ИП, ОГРНИП и ИНН.' : '© ' + year + ' ' + profile.name;

  const privacy = safeUrl(profile.privacyUrl);
  if (privacy) {
    const link = get('privacy-link');
    link.href = privacy;
    link.hidden = false;
  }
}

function renderProfile() {
  get('person-name').textContent = profile.name;
  get('bio').textContent = profile.bio;
  if (profile.photo) {
    const art = document.querySelector('.hero-art');
    art.removeAttribute('aria-hidden');
    const image = art.querySelector('img');
    image.src = profile.photo;
    image.alt = profile.photoAlt || profile.name;
    image.classList.add('portrait');
  }
  profile.services.forEach(entry => {
    const card = element('article', '', 'service-card');
    const button = element('button', 'Выбрать услугу →');
    button.setAttribute('aria-label', 'Выбрать услугу «' + entry.name + '»');
    button.addEventListener('click', () => {
      service.value = entry.id;
      resetSelection();
      location.hash = 'booking';
      service.focus({ preventScroll: true });
    });
    card.append(element('h3', entry.name), element('p', entry.details), element('strong', serviceLabel(entry)), button);
    get('service-list').append(card);
    service.add(new Option(entry.name, entry.id));
  });
}

function dayAvailable(day) {
  const weekday = parseDate(day).getUTCDay();
  return day >= tomorrow() && day <= lastDay() && weekday !== 0 && weekday !== 6;
}

function minutesAt(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isBusy(day, time, minutes) {
  const start = minutesAt(time);
  return records.some(item => {
    if (item.day !== day) return false;
    const otherStart = minutesAt(item.time);
    return start < otherStart + item.minutes && otherStart < start + minutes;
  });
}

function renderDays() {
  const days = get('days');
  const year = month.getUTCFullYear();
  const index = month.getUTCMonth();
  const firstColumn = (month.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();

  get('month').textContent = monthFormatter.format(month);
  get('prev').disabled = dateKey(month).slice(0, 7) <= todayKey().slice(0, 7);
  get('next').disabled = dateKey(month).slice(0, 7) >= lastDay().slice(0, 7);
  days.replaceChildren();

  for (let i = 0; i < firstColumn; i++) days.append(element('span'));
  for (let number = 1; number <= count; number++) {
    const key = dateKey(new Date(Date.UTC(year, index, number)));
    const button = element('button', number);
    button.disabled = !dayAvailable(key);
    button.setAttribute('aria-label', dateLabel(key));
    button.setAttribute('aria-pressed', String(key === selectedDay));
    button.addEventListener('click', () => {
      selectedDay = key;
      selectedTime = '';
      status.textContent = '';
      for (const day of days.querySelectorAll('button')) day.setAttribute('aria-pressed', String(day === button));
      renderTimes();
    });
    days.append(button);
  }
}

function renderTimes() {
  const list = get('times');
  list.replaceChildren();
  if (!selectedDay) list.append(element('p', 'Доступное время появится после выбора даты.'));
  else {
    const entry = currentService();
    for (const time of times) {
      const button = element('button', time);
      button.disabled = isBusy(selectedDay, time, entry.minutes);
      button.setAttribute('aria-label', time + (button.disabled ? ', занято' : ''));
      button.setAttribute('aria-pressed', String(time === selectedTime));
      button.addEventListener('click', () => {
        selectedTime = time;
        status.textContent = '';
        for (const slot of list.querySelectorAll('button')) slot.setAttribute('aria-pressed', String(slot === button));
        renderSummary();
      });
      list.append(button);
    }
  }
  renderSummary();
}

function renderSummary() {
  const text = selectedDay ? dateLabel(selectedDay) + (selectedTime ? ' · ' + selectedTime + ' МСК' : ' · выберите время') : 'Выберите день и время в календаре.';
  get('summary').textContent = text;
  confirm.disabled = !selectedDay || !selectedTime;
}

function renderRecords() {
  const list = get('record-list');
  list.replaceChildren();
  get('records').hidden = !profile.demo || records.length === 0;
  for (const item of records) {
    const entry = profile.services.find(candidate => candidate.id === item.id);
    const row = element('li');
    const cancel = element('button', 'Отменить');
    cancel.setAttribute('aria-label', 'Отменить демозапись на ' + dateLabel(item.day) + ', ' + item.time);
    cancel.addEventListener('click', () => {
      const latest = readRecords();
      if (!saveRecords(latest.filter(record => record.day !== item.day || record.time !== item.time))) return;
      status.textContent = 'Демозапись отменена.';
      renderRecords();
      if (!calendar.hidden) renderTimes();
      status.setAttribute('tabindex', '-1');
      status.focus();
    });
    row.append(element('span', entry.name + ' · ' + dateLabel(item.day) + ' · ' + item.time + ' МСК'), cancel);
    list.append(row);
  }
}

function resetSelection() {
  const entry = currentService();
  const url = bookingUrl(entry);
  const demo = profile.demo && !url;
  const link = get('real-booking');
  selectedDay = '';
  selectedTime = '';
  get('service-meta').textContent = serviceLabel(entry);
  calendar.hidden = !demo;
  get('summary').hidden = !demo;
  confirm.hidden = !demo;
  get('demo-note').hidden = !demo;
  get('provider-info').hidden = demo;
  get('provider-info').textContent = url ? 'Актуальное время и подтверждение встречи доступны в календаре специалиста.' : 'Онлайн-запись на эту услугу пока недоступна.';
  link.hidden = !url;
  if (url) link.href = url;
  else link.removeAttribute('href');
  if (demo) {
    renderDays();
    renderTimes();
  }
  status.textContent = '';
}

function moveMonth(direction) {
  month = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + direction, 1));
  resetSelection();
  const button = get(direction < 0 ? 'prev' : 'next');
  if (button.disabled) get(direction < 0 ? 'next' : 'prev').focus();
}

function setupCredentials() {
  const items = profile.credentials.filter(item => profile.demo || (!item.demo && (item.document || item.preview)));
  if (!items.length) return;

  const section = get('credentials');
  const grid = get('credential-grid');
  const prev = get('credential-prev');
  const next = get('credential-next');
  const phone = matchMedia('(max-width: 600px)');
  const tablet = matchMedia('(max-width: 900px)');
  const template = get('credential-template');
  let start = 0;

  const cards = items.map(({ name, document: file, preview: thumbnail }) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const url = file || thumbnail;
    const link = card.querySelector('a');
    const preview = card.querySelector('img');
    const icon = card.querySelector('svg');
    card.querySelector('h3').textContent = name;
    const status = card.querySelector('.credential-status');
    status.hidden = Boolean(url);
    if (url) {
      link.href = url;
      link.hidden = false;
      link.setAttribute('aria-label', 'Открыть документ «' + name + '» в новой вкладке');
    } else {
      status.textContent = 'Документ пока не загружен';
    }
    if (thumbnail) {
      preview.addEventListener('error', () => {
        preview.hidden = true;
        icon.removeAttribute('hidden');
      });
      preview.alt = name;
      preview.hidden = false;
      icon.setAttribute('hidden', '');
      preview.src = thumbnail;
    }
    return card;
  });

  const pageSize = () => phone.matches ? 1 : tablet.matches ? 2 : 3;

  function render() {
    const size = pageSize();
    const end = Math.min(start + size, cards.length);
    const canMove = cards.length > size;
    prev.hidden = !canMove;
    next.hidden = !canMove;
    // Stack corresponding cards so every page uses the same row height.
    for (const [index, card] of cards.entries()) {
      card.style.gridColumnStart = index % size + 1;
      card.classList.toggle('credential-card-offstage', index < start || index >= end);
    }
    get('credential-range').textContent = size === 1
      ? 'Документ ' + (start + 1) + ' из ' + cards.length
      : 'Документы с ' + (start + 1) + ' по ' + end + ' из ' + cards.length;
  }

  function move(direction) {
    const size = pageSize();
    const pages = Math.ceil(cards.length / size);
    const page = Math.floor(start / size);
    start = ((page + direction + pages) % pages) * size;
    render();
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  // Swipe on a touch screen to change the page. Mouse users have the arrows.
  let swipe = null;
  let suppressClick = false;
  grid.addEventListener('pointerdown', event => {
    if (prev.hidden || event.pointerType === 'mouse') return;
    swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  grid.addEventListener('pointermove', event => {
    if (!swipe) return;
    const dx = event.clientX - swipe.x;
    if (!grid.classList.contains('dragging')) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(event.clientY - swipe.y)) return;
      grid.classList.add('dragging');
      grid.setPointerCapture(swipe.id);
    }
    grid.style.transform = 'translateX(' + Math.max(-60, Math.min(60, dx * 0.4)) + 'px)';
  });
  const endSwipe = event => {
    if (!swipe) return;
    const dx = event.clientX - swipe.x;
    swipe = null;
    if (!grid.classList.contains('dragging')) return;
    grid.classList.remove('dragging');
    grid.style.transform = '';
    suppressClick = true;
    setTimeout(() => { suppressClick = false; });
    if (event.type === 'pointerup' && Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
  };
  grid.addEventListener('pointerup', endSwipe);
  grid.addEventListener('pointercancel', endSwipe);
  grid.addEventListener('dragstart', event => event.preventDefault());
  grid.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  function resize() {
    start = Math.floor(start / pageSize()) * pageSize();
    render();
  }

  phone.addEventListener('change', resize);
  tablet.addEventListener('change', resize);
  grid.append(...cards);
  section.hidden = false;
  render();
}

function showSection(id, visible) {
  get(id).hidden = !visible;
  const navLink = document.querySelector('[data-nav="' + id + '"]');
  if (navLink) navLink.hidden = !visible;
}

function renderTopics() {
  const items = profile.topics || [];
  for (const item of items) {
    const row = element('li', '', 'topic');
    row.append(element('h3', item.name), element('p', item.details));
    get('topic-list').append(row);
  }
  showSection('topics', items.length > 0);
}

function renderSteps() {
  const items = profile.steps || [];
  for (const item of items) {
    const row = element('li', '', 'step');
    row.append(element('h3', item.name), element('p', item.details));
    get('step-list').append(row);
  }
  showSection('steps', items.length > 0);
}

function renderReviews() {
  const items = (profile.reviews || []).filter(item => profile.demo || !item.demo);
  for (const [index, item] of items.entries()) {
    const card = element('figure', '', 'review');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'отзыв');
    card.setAttribute('aria-label', index + 1 + ' из ' + items.length);
    const quote = element('blockquote', item.text);
    const author = element('figcaption', item.author);
    const initial = element('span', item.author.trim().charAt(0), 'review-initial');
    initial.setAttribute('aria-hidden', 'true');
    author.prepend(initial);
    card.append(quote, author);
    get('review-list').append(card);
  }
  get('reviews-note').hidden = !items.some(item => item.demo);
  const more = get('reviews-more');
  const url = profile.reviewsUrl || '';
  if (URL.canParse(url) && new URL(url).protocol === 'https:') {
    more.href = url;
    more.hidden = false;
  }
  showSection('reviews', items.length > 0 || !more.hidden);
  if (items.length) setupSlider(get('review-list'), get('review-prev'), get('review-next'), get('review-dots'), get('review-controls'));
}

function setupSlider(track, prev, next, dots, controls) {
  const slides = [...track.children];
  let pages = 0;
  let frame = 0;

  const perView = () => Math.max(1, Math.round(track.clientWidth / slides[0].offsetWidth));
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const currentPage = () => {
    if (track.scrollLeft >= maxScroll() - 2) return pages - 1;
    const step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    return Math.min(pages - 1, Math.round(track.scrollLeft / step / perView()));
  };

  function goTo(page) {
    const slide = slides[Math.min(page * perView(), slides.length - 1)];
    track.scrollTo({ left: slide.offsetLeft - slides[0].offsetLeft, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function update() {
    frame = 0;
    const page = currentPage();
    for (const [index, dot] of [...dots.children].entries()) {
      if (index === page) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    }
  }

  function build() {
    const count = Math.ceil(slides.length / perView());
    if (count !== pages) {
      pages = count;
      dots.replaceChildren();
      for (let page = 0; page < pages; page++) {
        const dot = element('button', '', 'slider-dot');
        dot.setAttribute('aria-label', 'Страница ' + (page + 1) + ' из ' + pages);
        dot.addEventListener('click', () => goTo(page));
        dots.append(dot);
      }
    }
    controls.hidden = pages <= 1;
    update();
  }

  // Swiping on touch screens is native scrolling. Arrows wrap around at the ends.
  prev.addEventListener('click', () => {
    const page = currentPage();
    goTo(page === 0 ? pages - 1 : page - 1);
  });
  next.addEventListener('click', () => {
    const page = currentPage();
    goTo(page >= pages - 1 ? 0 : page + 1);
  });
  track.addEventListener('scroll', () => { frame ||= requestAnimationFrame(update); }, { passive: true });
  new ResizeObserver(build).observe(track);
  build();
}

function renderFaq() {
  const items = profile.faq || [];
  for (const item of items) {
    const entry = element('details', '', 'faq-item');
    const summary = element('summary', item.question);
    const answer = element('div', '', 'faq-answer');
    answer.append(element('p', item.answer));
    entry.append(summary, answer);
    animateDetails(entry, summary, answer);
    get('faq-list').append(entry);
  }
  showSection('faq', items.length > 0);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function animateDetails(entry, summary, answer) {
  let animation = null;
  summary.addEventListener('click', event => {
    if (reducedMotion.matches) return;
    event.preventDefault();
    const opening = !entry.open || entry.classList.contains('closing');
    // A closed <details> may still report its content height, so start from zero.
    const startHeight = entry.open ? answer.offsetHeight : 0;
    animation?.cancel();
    entry.classList.toggle('closing', !opening);
    entry.open = true;
    const endHeight = opening ? answer.scrollHeight : 0;
    animation = answer.animate(
      { height: [startHeight + 'px', endHeight + 'px'], opacity: [opening ? 0 : 1, opening ? 1 : 0] },
      { duration: 300, easing: 'cubic-bezier(.4, 0, .2, 1)' },
    );
    animation.onfinish = () => {
      animation = null;
      if (!opening) {
        entry.open = false;
        entry.classList.remove('closing');
      }
    };
  });
}

renderProfile();
renderContacts();
renderTopics();
renderSteps();
renderReviews();
renderFaq();
setupCredentials();
renderFooter();
resetSelection();
renderRecords();
service.addEventListener('change', resetSelection);
get('prev').addEventListener('click', () => moveMonth(-1));
get('next').addEventListener('click', () => moveMonth(1));
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  records = readRecords();
  if (selectedTime && isBusy(selectedDay, selectedTime, currentService().minutes)) selectedTime = '';
  if (!calendar.hidden) renderTimes();
  renderRecords();
});
confirm.addEventListener('click', () => {
  const entry = currentService();
  if (!profile.demo || bookingUrl(entry) || !dayAvailable(selectedDay) || !times.includes(selectedTime)) {
    resetSelection();
    status.textContent = 'Выберите доступный день и время.';
    return;
  }
  records = readRecords();
  if (isBusy(selectedDay, selectedTime, entry.minutes)) {
    selectedTime = '';
    renderTimes();
    status.textContent = 'Это время уже занято. Выберите другое.';
    return;
  }
  const appointment = { id: entry.id, day: selectedDay, time: selectedTime, minutes: entry.minutes };
  if (!saveRecords([...records, appointment])) return;
  selectedTime = '';
  renderTimes();
  renderRecords();
  status.textContent = 'Демозапись сохранена: ' + dateLabel(appointment.day) + ', ' + appointment.time + ' МСК.';
});
