/* ============================================================
   ANIME TRACKER v3 — app.js
   ============================================================ */

const STATUS_CFG = {
  WATCHING:  { label:'Watching',        color:'#00B4D8' },
  WILL_WATCH:{ label:'Will Watch', color:'#F77F00' },
  WATCHED:   { label:'Finished',   color:'#4CAF50' },
  FAVORITE:  { label:'Favorite',       color:'#FFD60A' },
  DROPPED:   { label:'Dropped',       color:'#EF233C' },
};

const GENRES = [
  'Боевые искусства','Вампиры','Гарем','Демоны','Детектив','Дзёсей',
  'Драма','Игры','Исекай','Исторический','Киберпанк','Комедия',
  'Магия','Меха','Мистика','Музыка','Пародия','Повседневность',
  'Приключения','Психологическое','Романтика','Сверхъестественное',
  'Сёдзе','Сёдзе-ай','Сейнен','Сёнен','Спорт','Супер сила',
  'Триллер','Криминал','Ужасы','Фантастика','Фэнтези','Школа','Экшен','Этти',
  'Юри','Яой'
];

const GENRE_TIPS = {
  'Боевые искусства': 'Бои, единоборства, боевые техники',
  'Вампиры':          'Вампиры как центральный элемент сюжета',
  'Гарем':            'Один персонаж окружён несколькими романтическими интересами',
  'Демоны':           'Демоны, нечисть, потусторонние существа',
  'Детектив':         'Расследования, загадки, поиск преступника',
  'Дзёсей':           'Ориентировано на взрослых женщин (18+)',
  'Драма':            'Эмоциональные, серьёзные истории с внутренними конфликтами',
  'Игры':             'Карточные, видео- или настольные игры как основа сюжета',
  'Исекай':           'Герой попадает в другой мир или реинкарнируется',
  'Исторический':     'События в реальном или вымышленном историческом прошлом',
  'Киберпанк':        'Высокие технологии, антиутопия, корпоративный мир будущего',
  'Комедия':          'Юмор, смешные ситуации, комедийные персонажи',
  'Магия':            'Магические способности, заклинания, волшебный мир',
  'Меха':             'Гигантские боевые роботы, пилотируемые персонажами',
  'Мистика':          'Загадочные события, тайны, необъяснимые явления',
  'Музыка':           'Музыканты, концерты, творческий путь',
  'Пародия':          'Высмеивание клише аниме и поп-культуры',
  'Повседневность':   'Спокойная жизнь без экшена — быт, дружба, мелкие события',
  'Приключения':      'Путешествия, исследования, приключенческий сюжет',
  'Психологическое':  'Глубокий психологизм, игры разума, ненадёжный рассказчик',
  'Романтика':        'Любовные отношения, флирт, романтические линии',
  'Сверхъестественное':'Призраки, духи, магические существа вне обычного мира',
  'Сёдзе':            'Ориентировано на девочек-подростков: чувства, отношения',
  'Сёдзе-ай':         'Романтика между девушками (без явного контента)',
  'Сейнен':           'Ориентировано на взрослых мужчин (18+), зрелые темы',
  'Сёнен':            'Ориентировано на мальчиков: экшен, дружба, рост',
  'Спорт':            'Спортивные соревнования, командный дух, тренировки',
  'Супер сила':       'Персонажи со сверхчеловеческими способностями',
  'Триллер':          'Напряжение, саспенс, опасность на каждом шагу',
  'Криминал':         'Преступный мир, мафия, нелегальная деятельность',
  'Ужасы':            'Страх, монстры, атмосфера ужаса и угрозы',
  'Фантастика':       'Научная фантастика: технологии, космос, будущее',
  'Фэнтези':          'Магические миры, эльфы, драконы, квесты',
  'Школа':            'События разворачиваются в школьной среде',
  'Экшен':            'Динамичные бои, взрывы, высокий темп действия',
  'Этти':             'Лёгкий фансервис, пикантные моменты без явного контента',
};

const GENRE_MAP = {
  Action:'Экшен',Fantasy:'Фэнтези',Romance:'Романтика',Comedy:'Комедия',
  Drama:'Драма',Horror:'Ужасы',Mystery:'Мистика','Sci-Fi':'Фантастика',
  Sports:'Спорт',Supernatural:'Сверхъестественное',Thriller:'Триллер',
  Adventure:'Приключения',Magic:'Магия',Demons:'Демоны',
  Psychological:'Психологическое',School:'Школа',Historical:'Исторический',
  Vampire:'Вампиры','Martial Arts':'Боевые искусства',Mecha:'Меха',
  Ecchi:'Этти',Josei:'Дзёсей',Seinen:'Сейнен',Shounen:'Сёнен',
  Shoujo:'Сёдзе',Isekai:'Исекай',Crime:'Криминал',Game:'Игры',
  Music:'Музыка',Parody:'Пародия','Slice of Life':'Повседневность',
  'Girls Love':'Юри','Boys Love':'Яой',Yuri:'Юри',Yaoi:'Яой',
};

const S = { status:'WATCHING', sort:'date_desc', query:'', list:[], editingId:null, detailId:null, selectedRating:0, noImageOnly:false };
const F = { genres:new Set(), yearFrom:1960, yearTo:2030, minRating:0, active:false };

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildGenreGrid();
  buildFilterGenreList();
  buildInteractiveStars();
  setupTabs();
  setupSearch();
  setupSort();
  document.getElementById('addBtn').addEventListener('click', openAddModal);
  document.getElementById('fRussianName').addEventListener('input', e => { e.target.style.border=''; e.target.title=''; });
  // Close export menu when clicking outside
  document.addEventListener('click', e => {
    const wrap = document.getElementById('exportWrap');
    if (wrap && !wrap.contains(e.target)) closeExportMenu();
  });
  document.querySelectorAll('.modal-backdrop').forEach(el =>
    el.addEventListener('click', e => { if (e.target === el) closeModal(el.id); }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') ['confirmDialog','detailModal','editModal'].forEach(closeModal);
    if (e.key === 'Enter' && document.activeElement.id === 'jikanInput') doJikanSearch();
  });
  // Rating filter buttons
  document.querySelectorAll('.rating-filter-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      F.minRating = parseFloat(btn.dataset.rating);
    }));
  loadCounts();
  loadSection(localStorage.getItem('activeTab') || 'WATCHING');
});

// ─── API ──────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers:{} };
  if (body) { opts.headers['Content-Type']='application/json'; opts.body=JSON.stringify(body); }
  console.log(`[API] ${method} ${path}`, body||'');
  const res = await fetch(path, opts);
  if (!res.ok) {
    const errText = await res.text().catch(()=>'(no body)');
    console.error(`[API] ${method} ${path} → HTTP ${res.status}:`, errText);
    throw new Error(`HTTP ${res.status}: ${errText.substring(0,300)}`);
  }
  if (res.status===204) return null;
  const data = await res.json();
  console.log(`[API] ${method} ${path} → OK`, data);
  return data;
}

// ─── SECTION LOADING ──────────────────────────────────────
const PAGE_SIZE = 50;
let S_page = 0;
let S_loading = false;
let S_lastPage = false;

async function loadSection(status) {
  S.status = status; S.query = ''; S_page = 0; S_loading = false; S_lastPage = false;
  localStorage.setItem('activeTab', status);
  document.getElementById('searchInput').value = '';
  updateActiveTab(status);
  S.list = [];
  document.getElementById('listArea').innerHTML = '';
  document.getElementById('resultCount').textContent = '';
  await fetchNextPage();
}

async function fetchNextPage() {
  if (S_loading || S_lastPage) return;
  S_loading = true;
  showPageLoader(true);
  try {
    const data = await api('GET', `/api/anime?status=${S.status}&page=${S_page}&size=${PAGE_SIZE}`);
    const items = data.content || [];
    S_lastPage = data.last;
    S.list = [...S.list, ...items];
    S_page++;
    appendItems(items, data.totalElements);
  } catch { showError('Failed to load'); }
  finally {
    S_loading = false;
    showPageLoader(false);
    // After each page loads, immediately check if sentinel is still visible → keep going
    if (!S_lastPage) setTimeout(checkSentinel, 150);
  }
}

function checkSentinel() {
  if (S_loading || S_lastPage) return;
  const sentinel = document.getElementById('scroll-sentinel');
  if (!sentinel) return;
  const rect = sentinel.getBoundingClientRect();
  if (rect.top < window.innerHeight + 800) fetchNextPage();
}

function showPageLoader(show) {
  let el = document.getElementById('page-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'page-loader';
    el.innerHTML = '<div class="loader-spinner"></div><span id="loader-text">Loading...</span>';
    document.getElementById('listArea').after(el);
  }
  el.style.display = show ? 'flex' : 'none';
}

function appendItems(items, total) {
  const area = document.getElementById('listArea');
  document.getElementById('resultCount').textContent = `${total} anime`;
  if (!items.length && S_page === 1) {
    area.innerHTML = '<div class="empty-state"><div class="empty-icon">🎌</div><p>No anime here yet</p></div>';
    return;
  }
  const old = document.getElementById('scroll-sentinel');
  if (old) old.remove();
  const frag = document.createDocumentFragment();
  items.forEach(a => frag.appendChild(createItem(a)));
  area.appendChild(frag);
  if (!S_lastPage) {
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    area.appendChild(sentinel);
    scrollObserver.observe(sentinel);
  }
}

const scrollObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    scrollObserver.disconnect();
    fetchNextPage();
  }
}, { rootMargin: '600px' });

// Scroll fallback — fires when user is within 600px of bottom
window.addEventListener('scroll', () => {
  if (S_loading || S_lastPage) return;
  const sentinel = document.getElementById('scroll-sentinel');
  if (!sentinel) return;
  const rect = sentinel.getBoundingClientRect();
  if (rect.top < window.innerHeight + 600) {
    fetchNextPage();
  }
}, { passive: true });

// Refresh without losing scroll — refetch current pages
async function refreshList() {
  const scrollY = window.scrollY;
  const pagesLoaded = S_page;
  S.list = []; S_page = 0; S_loading = false; S_lastPage = false;
  document.getElementById('listArea').innerHTML = '';
  // Re-fetch all pages that were loaded
  for (let i = 0; i < pagesLoaded; i++) {
    if (S_lastPage) break;
    S_loading = true;
    try {
      const data = await api('GET', `/api/anime?status=${S.status}&page=${S_page}&size=${PAGE_SIZE}`);
      const items = data.content || [];
      S_lastPage = data.last;
      S.list = [...S.list, ...items];
      S_page++;
      appendItems(items, data.totalElements);
    } catch {} finally { S_loading = false; }
  }
  showPageLoader(false);
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
}

async function loadCounts() {
  try {
    const c = await api('GET','/api/anime/counts');
    Object.entries(c).forEach(([k,v]) => { const el=document.getElementById(`cnt-${k}`); if(el) el.textContent=v; });
  } catch {}
}

// ─── TABS ─────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => loadSection(t.dataset.status)));
}
function updateActiveTab(s) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.status===s));
}

// ─── SEARCH ───────────────────────────────────────────────
function setupSearch() {
  let t;
  document.getElementById('searchInput').addEventListener('input', e => {
    S.query=e.target.value.trim().toLowerCase();
    clearTimeout(t);
    t = setTimeout(() => {
      if (S.query) {
        // Search across ALL entries in current section via backend
        searchMode(S.query);
      } else {
        // Back to normal paginated view
        S.list = []; S_page = 0; S_loading = false; S_lastPage = false;
        loadSection(S.status);
      }
    }, 300);
  });
}

// ─── SORT ─────────────────────────────────────────────────
function setupSort() {
  document.getElementById('sortSelect').addEventListener('change', e => { S.sort=e.target.value; render(); });
}

function applySort(list) {
  const a=[...list];
  switch(S.sort) {
    case 'name_asc':      return a.sort((x,y)=>(x.russianName||'').localeCompare(y.russianName||''));
    case 'name_desc':     return a.sort((x,y)=>(y.russianName||'').localeCompare(x.russianName||''));
    case 'rating_desc':   return a.sort((x,y)=>(y.rating||0)-(x.rating||0));
    case 'rating_asc':    return a.sort((x,y)=>(x.rating||0)-(y.rating||0));
    case 'date_asc':      return a.sort((x,y)=>x.id-y.id);
    case 'episodes_desc': return a.sort((x,y)=>(y.episodeCount||0)-(x.episodeCount||0));
    case 'episodes_asc':  return a.sort((x,y)=>(x.episodeCount||0)-(y.episodeCount||0));
    default:              return a.sort((x,y)=>y.id-x.id);
  }
}

// ─── FILTER ───────────────────────────────────────────────
function toggleFilter() {
  const sb = document.getElementById('filterSidebar');
  const btn = document.getElementById('filterToggleBtn');
  const isNowOpen = sb.classList.contains('hidden');
  sb.classList.toggle('hidden');
  btn.classList.toggle('active', isNowOpen);
}

// Close filter when clicking outside
document.addEventListener('click', e => {
  const sb = document.getElementById('filterSidebar');
  const btn = document.getElementById('filterToggleBtn');
  if (!sb || sb.classList.contains('hidden')) return;
  if (!sb.contains(e.target) && !btn.contains(e.target)) {
    sb.classList.add('hidden');
    btn.classList.remove('active');
  }
});

function buildFilterGenreList() {
  const list = document.getElementById('genreDropdownList');
  list.innerHTML = GENRES.map(g => `
    <div class="genre-filter-item">
      <input type="checkbox" id="fg_${g.replace(/\s/g,'_')}" value="${g}" onchange="onFilterGenreChange(this)">
      <label for="fg_${g.replace(/\s/g,'_')}">${g}</label>
    </div>`).join('');
}

function toggleGenreDropdown() {
  const list = document.getElementById('genreDropdownList');
  const arrow = document.getElementById('genreTriggerArrow');
  list.classList.toggle('hidden');
  arrow.textContent = list.classList.contains('hidden') ? '▾' : '▴';
}

function onFilterGenreChange(cb) {
  if (cb.checked) F.genres.add(cb.value);
  else F.genres.delete(cb.value);
  const label = document.getElementById('genreTriggerLabel');
  label.textContent = F.genres.size ? `Выбрано: ${F.genres.size}` : 'Укажите жанры';
}

function applyFilters() {
  F.yearFrom = parseInt(document.getElementById('filterYearFrom').value) || 1960;
  F.yearTo   = parseInt(document.getElementById('filterYearTo').value)   || 2030;
  F.active   = F.genres.size > 0 || F.yearFrom > 1960 || F.yearTo < 2030 || F.minRating > 0;
  document.getElementById('filterActiveDot').classList.toggle('hidden', !F.active);
  render();
}

function resetFilters() {
  F.genres.clear(); F.yearFrom=1960; F.yearTo=2030; F.minRating=0; F.active=false;
  document.querySelectorAll('#genreDropdownList input[type=checkbox]').forEach(cb => cb.checked=false);
  document.getElementById('genreTriggerLabel').textContent='Укажите жанры';
  document.getElementById('filterYearFrom').value=1960;
  document.getElementById('filterYearTo').value=2030;
  document.querySelectorAll('.rating-filter-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('.rating-filter-btn[data-rating="0"]').classList.add('active');
  document.getElementById('filterActiveDot').classList.add('hidden');
  render();
}

function filterList(list) {
  return list.filter(a => {
    if (S.query && !(a.russianName||'').toLowerCase().includes(S.query) && !(a.japaneseName||'').toLowerCase().includes(S.query)) return false;
    if (F.genres.size > 0 && !(a.genres||[]).some(g => F.genres.has(g))) return false;
    if (a.year && (a.year < F.yearFrom || a.year > F.yearTo)) return false;
    if (F.minRating > 0 && (a.rating||0) < F.minRating) return false;
    return true;
  });
}

async function searchMode(q) {
  showLoading();
  try {
    const results = await api('GET', `/api/anime/search?q=${encodeURIComponent(q)}&status=${S.status}`);
    S.list = results;
    const area = document.getElementById('listArea');
    document.getElementById('resultCount').textContent = `${results.length} anime`;
    area.innerHTML = '';
    if (!results.length) {
      area.innerHTML = '<div class="empty-state"><div class="empty-icon">🎌</div><p>No results</p></div>';
      return;
    }
    const frag = document.createDocumentFragment();
    filterList(results).forEach(a => frag.appendChild(createItem(a)));
    area.appendChild(frag);
  } catch { showError('Search failed'); }
}

// ─── RENDER ───────────────────────────────────────────────
function showLoading() {
  document.getElementById('listArea').innerHTML='<div class="loading-wrap"><div class="spinner"></div></div>';
  document.getElementById('resultCount').textContent='';
}

// render() is used by filters/sort/noImage — re-renders from in-memory S.list
function render() {
  let filtered = filterList(S.list);
  if (S.noImageOnly) filtered = filtered.filter(a => !a.imagePath);
  const sorted = applySort(filtered);
  const area = document.getElementById('listArea');
  document.getElementById('resultCount').textContent = `${sorted.length} anime`;
  if (!sorted.length) {
    area.innerHTML = '<div class="empty-state"><div class="empty-icon">🎌</div><p>No anime here yet</p></div>';
    return;
  }
  area.innerHTML = '';
  const frag = document.createDocumentFragment();
  sorted.forEach(a => frag.appendChild(createItem(a)));
  area.appendChild(frag);
}

function starsHtml(rating, cls) {
  if (!rating) return '';
  let h='';
  for (let i=1;i<=5;i++) {
    if (rating>=i)       h+=`<span class="${cls}-full">★</span>`;
    else if (rating>=i-.5) h+=`<span class="${cls}-half">★</span>`;
    else                 h+=`<span class="${cls}-empty">☆</span>`;
  }
  return h;
}

function createItem(anime) {
  const el = document.createElement('div');
  el.className='anime-item';

  const poster = anime.imagePath
    ? `<img src="${esc(anime.imagePath)}" alt="" loading="lazy" onerror="this.parentNode.innerHTML='<div class=item-poster-placeholder>🎌</div>'">`
    : `<div class="item-poster-placeholder">🎌</div>`;

  const stars = starsHtml(anime.rating,'istar');
  const genresLine = (anime.genres||[]).map(g=>`<span>${esc(g)}</span>`).join('');
  const metaParts=[];
  if(stars) metaParts.push(`<span class="item-stars">${stars}</span>`);
  if(anime.year) metaParts.push(`<span>${anime.year}</span>`);
  if(anime.episodeCount) metaParts.push(`<span>${anime.episodesWatched!=null?anime.episodesWatched+' / ':''}${anime.episodeCount} ep.</span>`);

  el.innerHTML=`
    <div class="item-poster">${poster}</div>
    <div class="item-info">
      <div class="item-title">${esc(anime.russianName)}</div>
      ${anime.japaneseName?`<div class="item-japanese">${esc(anime.japaneseName)}</div>`:''}
      ${genresLine?`<div class="item-genres-line">${genresLine}</div>`:''}
      ${metaParts.length?`<div class="item-meta-line">${metaParts.join('')}</div>`:''}
      ${anime.description?`<div class="item-synopsis">${esc(anime.description)}</div>`:''}
    </div>
    <div class="item-actions">
      <button class="item-act autofill" onclick="event.stopPropagation();quickAutoFill(${anime.id},this)">⚡</button>
      <button class="item-act" onclick="event.stopPropagation();openEditModalById(${anime.id})">✎ Edit</button>
      <button class="item-act danger" onclick="event.stopPropagation();confirmDelete(${anime.id},'${esc(anime.russianName).replace(/'/g,"\\'")}')">🗑</button>
    </div>`;

  el.addEventListener('click', () => openDetailModal(anime.id));
  return el;
}

// ─── ADD / EDIT MODAL ─────────────────────────────────────
function openAddModal() {
  S.editingId=null; S.selectedRating=0;
  document.getElementById('modalTitle').textContent='Add Anime';
  clearForm(); document.getElementById('fStatus').value=S.status;
  updateInteractiveStars(0); clearJikan(); openModal('editModal');
}

async function openEditModalById(id) {
  console.log('[Edit] openEditModalById id=', id);
  try {
    const anime = await api('GET', `/api/anime/${id}`);
    console.log('[Edit] loaded anime:', anime);
    openEditModal(anime);
  } catch(e) {
    console.error('[Edit] FAILED:', e);
    showError('Load failed: ' + e.message);
  }
}

function openEditModal(anime) {
  S.editingId=anime.id; S.selectedRating=anime.rating||0;
  document.getElementById('modalTitle').textContent='Edit Anime';
  clearJikan();
  document.getElementById('fRussianName').value     = anime.russianName||'';
  document.getElementById('fJapaneseName').value    = anime.japaneseName||'';
  document.getElementById('fStatus').value          = anime.status;
  document.getElementById('fYear').value            = anime.year||'';
  document.getElementById('fEpisodeCount').value    = anime.episodeCount||'';
  document.getElementById('fEpisodesWatched').value = anime.episodesWatched||'';
  document.getElementById('fDescription').value     = anime.description||'';
  document.getElementById('fRating').value          = anime.rating||0;
  document.querySelectorAll('.genre-cb').forEach(cb=>{ cb.checked=(anime.genres||[]).includes(cb.value); });
  if (anime.imagePath) { setImgMode('url'); document.getElementById('imgUrl').value=anime.imagePath; previewUrl(anime.imagePath); }
  else clearImgPreview();
  updateInteractiveStars(anime.rating||0);
  openModal('editModal');
  // Resize textarea AFTER modal is visible so scrollHeight is calculated correctly
  const ta = document.getElementById('fDescription');
  ta.style.height = 'auto';
  requestAnimationFrame(() => { ta.style.height = ta.scrollHeight + 'px'; });
}

async function saveAnime() {
  const name = document.getElementById('fRussianName').value.trim();
  if (!name) { showError('Russian name is required'); return; }

  // ── Duplicate check ───────────────────────────────────
  if (!S.editingId) {
    try {
      const newStatus = document.getElementById('fStatus').value;
      const found = await api('GET', `/api/anime/search?q=${encodeURIComponent(name)}`);
      const exact = found.filter(a => a.russianName.toLowerCase() === name.toLowerCase());

      // If adding to FAVORITE: only block if it's already IN favorites (allow cross-section)
      const relevant = newStatus === 'FAVORITE'
        ? exact.filter(a => a.status === 'FAVORITE')
        : exact;

      if (relevant.length > 0) {
        const sec = STATUS_CFG[relevant[0].status]?.label || relevant[0].status;
        const dupe = document.getElementById('dupeWarning');
        const dupeText = document.getElementById('dupeWarningText');
        dupeText.textContent = `"${name}" уже есть в разделе "${sec}". Сохранить всё равно?`;
        dupe.classList.remove('hidden');
        const footer = dupe.closest('.modal-box').querySelector('.modal-footer');
        footer.innerHTML = `
          <button class="btn-ghost" onclick="hideDupeWarning()">Отмена</button>
          <button class="btn-primary" onclick="confirmSave()">Да, добавить</button>`;
        return;
      }
    } catch {}
  }
  await performSave();
}

function hideDupeWarning() {
  document.getElementById('dupeWarning').classList.add('hidden');
  const footer = document.querySelector('#editModal .modal-footer');
  footer.innerHTML = `
    <button class="btn-ghost" onclick="closeModal('editModal')">Cancel</button>
    <button class="btn-primary" onclick="saveAnime()">Save</button>`;
}

async function confirmSave() {
  hideDupeWarning();
  await performSave();
}

async function performSave() {
  const name = document.getElementById('fRussianName').value.trim();
  const imgMode = document.querySelector('input[name=imgMode]:checked')?.value;
  const imgUrl  = document.getElementById('imgUrl').value.trim();
  const body = {
    russianName:     name,
    japaneseName:    document.getElementById('fJapaneseName').value.trim() || null,
    status:          document.getElementById('fStatus').value,
    rating:          parseFloat(document.getElementById('fRating').value) || null,
    genres:          [...document.querySelectorAll('.genre-cb:checked')].map(c => c.value),
    year:            parseInt(document.getElementById('fYear').value) || null,
    episodeCount:    parseInt(document.getElementById('fEpisodeCount').value) || null,
    episodesWatched: parseInt(document.getElementById('fEpisodesWatched').value) || null,
    description:     document.getElementById('fDescription').value.trim() || null,
    imagePath:       (imgMode === 'url' && imgUrl) ? imgUrl : null,
  };
  try {
    let saved = S.editingId
      ? await api('PUT', `/api/anime/${S.editingId}`, body)
      : await api('POST', '/api/anime', body);
    if (imgMode === 'upload') {
      const file = document.getElementById('imgFile').files[0];
      if (file) await uploadImage(saved.id, file);
    }
    closeModal('editModal');
    showToast(S.editingId ? 'Updated!' : 'Added!', 'success');
    await Promise.all([loadCounts(), refreshList()]);
  } catch (e) { showError('Save failed: ' + e.message); }
}

async function uploadImage(id,file) {
  const fd=new FormData(); fd.append('file',file);
  const res=await fetch(`/api/anime/${id}/image`,{method:'POST',body:fd});
  if(!res.ok) throw new Error('Image upload failed');
  return res.json();
}

// ─── FORM HELPERS ─────────────────────────────────────────
function clearForm() {
  ['fRussianName','fJapaneseName','fYear','fEpisodeCount','fEpisodesWatched','fDescription']
    .forEach(id=>{ document.getElementById(id).value=''; });
  document.getElementById('fRating').value=0;
  document.getElementById('imgUrl').value='';
  document.getElementById('imgFile').value='';
  document.querySelectorAll('.genre-cb').forEach(c=>c.checked=false);
  clearImgPreview(); setImgMode('url');
  hideDupeWarning();
}
function setImgMode(mode) {
  document.querySelectorAll('input[name=imgMode]').forEach(r=>r.checked=r.value===mode);
  document.getElementById('imgUrlWrap').classList.toggle('hidden',mode!=='url');
  document.getElementById('imgUploadWrap').classList.toggle('hidden',mode!=='upload');
}
function previewUrl(url) {
  document.getElementById('imgPreview').innerHTML=url
    ?`<img src="${esc(url)}" alt="" onerror="this.parentNode.innerHTML='<span>Bad URL</span>'">`
    :'<span>No image</span>';
}
function previewFile(input) {
  const f=input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=e=>{ document.getElementById('imgPreview').innerHTML=`<img src="${e.target.result}" alt="">`; };
  r.readAsDataURL(f);
}
function clearImgPreview() { document.getElementById('imgPreview').innerHTML='<span>No image</span>'; }

// ─── GENRE GRID (form) ────────────────────────────────────
function buildGenreGrid() {
  document.getElementById('genreGrid').innerHTML=GENRES.map(g=>{
    const id='g_'+g.replace(/\s/g,'_');
    const tip = GENRE_TIPS[g] ? ` title="${GENRE_TIPS[g]}"` : '';
    return `<input type="checkbox" class="genre-cb" id="${id}" value="${g}"><label class="genre-label" for="${id}"${tip}>${g}</label>`;
  }).join('');
}

// ─── INTERACTIVE STARS ────────────────────────────────────
function buildInteractiveStars() {
  const c=document.getElementById('formStars'); c.innerHTML='';
  for(let i=1;i<=5;i++) {
    const s=document.createElement('span');
    s.className='si-star'; s.textContent='★';
    s.addEventListener('mousemove',e=>{
      const rect=s.getBoundingClientRect();
      lightStars(i - ((e.clientX-rect.left)<rect.width/2 ? 0.5 : 0));
    });
    s.addEventListener('click',e=>{
      const rect=s.getBoundingClientRect();
      const val=i - ((e.clientX-rect.left)<rect.width/2 ? 0.5 : 0);
      S.selectedRating=val; document.getElementById('fRating').value=val;
      updateInteractiveStars(val);
    });
    c.appendChild(s);
  }
  c.addEventListener('mouseleave',()=>updateInteractiveStars(S.selectedRating));
}
function lightStars(val) {
  document.querySelectorAll('.si-star').forEach((s,idx)=>{
    const pos=idx+1;
    s.classList.remove('lit','half-lit');
    if(val>=pos) s.classList.add('lit');
    else if(val>=pos-0.5) s.classList.add('half-lit');
  });
}
function updateInteractiveStars(val) { S.selectedRating=val; lightStars(val); }

// ─── JIKAN ────────────────────────────────────────────────
function clearJikan() {
  document.getElementById('jikanInput').value='';
  document.getElementById('jikanResults').innerHTML='';
  document.getElementById('jikanResults').classList.add('hidden');
  S._russianQuery = null;
}


function isCyrillic(text) { return /[а-яёА-ЯЁ]/.test(text); }

async function translateRuToEn(text) {
  try {
    console.log('[Translate] ru→en:', text);
    const res = await fetch(`/api/jikan/translate?q=${encodeURIComponent(text)}&sl=ru&tl=en`);
    const data = await res.json();
    const translated = data.responseData?.translatedText;
    console.log('[Translate] result:', translated);
    return (translated && translated.toLowerCase() !== text.toLowerCase()) ? translated : text;
  } catch(e) {
    console.error('[Translate] failed:', e);
    return text;
  }
}

async function doJikanSearch() {
  const rawQ = document.getElementById('jikanInput').value.trim();
  if (!rawQ) return;
  const btn = document.getElementById('jikanBtn');
  btn.disabled = true;

  S._russianQuery = null;

  if (isCyrillic(rawQ)) {
    S._russianQuery = rawQ;
    btn.textContent = 'Shikimori…';

    try {
      // Step 1: search Shikimori with Russian query → get official Russian title + romaji name
      const shikiRes = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(rawQ)}`);
      const shikiItems = await shikiRes.json();

      let searchTerm = rawQ;  // fallback
      let shikiMalId = null;  // MAL ID from Shikimori — pin this to top of results
      if (shikiItems && shikiItems.length > 0) {
        const best = shikiItems[0];
        if (best.russian && best.russian !== best.name) S._russianQuery = best.russian;
        if (best.name) {
          searchTerm = best.name;
          shikiMalId = best.id;  // Shikimori ID = MAL ID
          showToast(`Shikimori: «${best.russian || best.name}» → MAL: «${searchTerm}»`, 'success');
        }
      } else {
        // Shikimori found nothing — fall back to Google Translate
        btn.textContent = 'Переводим…';
        searchTerm = await translateRuToEn(rawQ);
        if (searchTerm !== rawQ) showToast(`Переведено: «${searchTerm}»`, 'success');
      }

      btn.textContent = '…';

      // Step 2: search MAL/Jikan with romaji name (+ direct ID fetch if we have shikiMalId)
      const fetches = [
        fetch(`/api/jikan/search?q=${encodeURIComponent(searchTerm)}`).then(r => r.json()),
        searchTerm !== rawQ
          ? fetch(`/api/jikan/search?q=${encodeURIComponent(rawQ)}`).then(r => r.json())
          : Promise.resolve({ data: [] }),
      ];
      // If Shikimori gave us the MAL ID, also fetch that entry directly so it's always present
      if (shikiMalId) {
        fetches.push(fetch(`/api/jikan/details/${shikiMalId}`).then(r => r.json()).then(d => ({ data: d.data ? [d.data] : [] })));
      }

      const settled = await Promise.allSettled(fetches);
      const seen = new Set();
      const merged = [];
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          for (const item of (r.value?.data || [])) {
            if (!seen.has(item.mal_id)) { seen.add(item.mal_id); merged.push(item); }
          }
        }
      }
      // Pin Shikimori-matched entry to position 0
      if (shikiMalId) {
        const idx = merged.findIndex(a => a.mal_id === shikiMalId);
        if (idx > 0) { const [pinned] = merged.splice(idx, 1); merged.unshift(pinned); }
        // sort the rest by score
        const rest = merged.slice(1).sort((a, b) => (b.score || 0) - (a.score || 0));
        merged.splice(1, rest.length, ...rest);
      } else {
        merged.sort((a, b) => (b.score || 0) - (a.score || 0));
      }
      showJikanResults(merged);

    } catch { showError('MAL search failed'); }
    finally { btn.textContent = 'Search MAL'; btn.disabled = false; }

  } else {
    // Plain English/romaji search — single query
    btn.textContent = '…';
    try {
      const data = await (await fetch(`/api/jikan/search?q=${encodeURIComponent(rawQ)}`)).json();
      showJikanResults(data.data || []);
    } catch { showError('MAL search failed'); }
    finally { btn.textContent = 'Search MAL'; btn.disabled = false; }
  }
}

async function translateEnToRu(text) {
  try {
    const res = await fetch(`/api/jikan/translate?q=${encodeURIComponent(text)}&langpair=en|ru`);
    const data = await res.json();
    const translated = data.responseData?.translatedText;
    return (translated && translated !== text && !/МАМА МИА/i.test(translated)) ? translated : null;
  } catch { return null; }
}

function showJikanResults(items) {
  const box = document.getElementById('jikanResults');
  if (!items.length) {
    box.innerHTML = '<span style="color:var(--muted);font-size:.8rem">No results — try the Japanese/English title</span>';
    box.classList.remove('hidden'); return;
  }
  box.classList.remove('hidden');
  box.innerHTML = items.slice(0,8).map((item,i) => {
    const img   = item.images?.jpg?.image_url || '';
    const title = item.title_english || item.title || '';
    const year  = item.year || item.aired?.prop?.from?.year || '';
    const eps   = item.episodes ? item.episodes + ' ep' : '';
    const score = item.score ? '★' + item.score : '';
    const meta  = [year, eps, score].filter(Boolean).join(' · ');
    return `<div class="jikan-card" data-i="${i}">
      ${img ? `<img src="${esc(img)}" alt="">` : '<div style="width:32px;flex-shrink:0"></div>'}
      <div class="jikan-card-info">
        <div class="jikan-title">${esc(title)}</div>
        ${meta ? `<div class="jikan-sub">${esc(meta)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
  box.querySelectorAll('.jikan-card').forEach((card,i) =>
    card.addEventListener('click', () => fillFromJikan(items[i])));
}

async function fillFromJikan(item) {
  const malId   = item.mal_id;
  const romaji  = item.title || '';

  // Fetch FULL details to get all language titles (search endpoint omits some)
  let fullItem = item;
  try {
    const det = await (await fetch(`/api/jikan/details/${malId}`)).json();
    if (det.data) fullItem = det.data;
  } catch {}

  const title   = fullItem.title_english || fullItem.title || '';
  // Store up to 1500 chars of synopsis
  const synopsis = (fullItem.synopsis || '')
    .replace(/\[Written by MAL Rewrite\]/gi, '').trim()
    .substring(0, 1500);
  const imgUrl  = fullItem.images?.jpg?.large_image_url || fullItem.images?.jpg?.image_url || '';
  const genres  = (fullItem.genres || []).map(g => GENRE_MAP[g.name] || g.name).filter(g => GENRES.includes(g));

  // Find Russian title: check titles array (case-insensitive type match),
  // then check synonyms for any Cyrillic text
  const titles = fullItem.titles || [];
  const ruFromMAL =
    titles.find(t => /russian/i.test(t.type))?.title ||
    (fullItem.title_synonyms || []).find(s => /[а-яё]/i.test(s)) ||
    null;

  const russianField = document.getElementById('fRussianName');

  if (S._russianQuery) {
    russianField.value = S._russianQuery;
    russianField.style.border = ''; russianField.title = '';
    S._russianQuery = null;
  } else if (!russianField.value.trim()) {
    if (ruFromMAL) {
      russianField.value = ruFromMAL;
      russianField.style.border = '1px solid #4CAF50';
      russianField.title = 'Official Russian title from MAL';
      setTimeout(() => { russianField.style.border = ''; russianField.title = ''; }, 2500);
    } else {
      // Try translating English title to Russian
      russianField.value = '…'; russianField.disabled = true;
      // First try AI (handles both title + short synopsis in one call)
      let aiDone = false;
      try {
        const res = await fetch('/api/jikan/ai-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, synopsis })
        });
        const ai = await res.json();
        if (ai.ruTitle && ai.ruTitle !== title && ai.ruTitle.length > 0) {
          russianField.value = ai.ruTitle;
          russianField.style.border = '1px solid #4CAF50';
          setTimeout(() => { russianField.style.border = ''; }, 2000);
          if (ai.ruSynopsis && ai.ruSynopsis.length > 5) {
            document.getElementById('fDescription').value = ai.ruSynopsis;
          }
          aiDone = true;
        }
      } catch {}
      russianField.disabled = false;
      if (!aiDone) {
        // Fall back to MyMemory translation
        const ruT = await translateEnToRu(title);
        if (ruT && ruT.toLowerCase() !== title.toLowerCase()) {
          russianField.value = ruT;
          russianField.style.border = '1px solid #4CAF50';
          setTimeout(() => { russianField.style.border = ''; }, 2000);
        } else {
          russianField.value = title;
          russianField.style.border = '1px solid #F77F00';
          russianField.title = 'Replace with Russian title';
        }
      }
    }
  }

  document.getElementById('fJapaneseName').value = romaji;
  const yearVal = fullItem.year || fullItem.aired?.prop?.from?.year || null;
  if (yearVal) document.getElementById('fYear').value = yearVal;
  if (fullItem.episodes) document.getElementById('fEpisodeCount').value = fullItem.episodes;
  if (synopsis)          document.getElementById('fDescription').value  = synopsis;
  if (imgUrl) { setImgMode('url'); document.getElementById('imgUrl').value = imgUrl; previewUrl(imgUrl); }
  genres.forEach(g => { const cb = document.querySelector(`.genre-cb[value="${g}"]`); if (cb) cb.checked = true; });

  clearJikan();
  showToast('Auto-filled from MAL!', 'success');
}

// ─── EXPORT / IMPORT ──────────────────────────────────────
function toggleNoImageFilter() {
  S.noImageOnly = !S.noImageOnly;
  const btn = document.getElementById('noImageBtn');
  btn.classList.toggle('active', S.noImageOnly);
  btn.textContent = S.noImageOnly ? 'All anime' : 'No image';
  render();
}
function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('hidden');
}
function closeExportMenu() {
  document.getElementById('exportMenu').classList.add('hidden');
}
async function exportList(format) {
  try {
    const statuses = ['WATCHING','WILL_WATCH','WATCHED','FAVORITE','DROPPED'];
    const all = [];
    for (const s of statuses) {
      let page = 0, last = false;
      while (!last) {
        const data = await api('GET', `/api/anime?status=${s}&page=${page}&size=200`);
        (data.content || []).forEach(a => all.push(a));
        last = data.last;
        page++;
      }
    }

    if (format === 'csv') {
      const header = 'Russian Name,Japanese Name,Status,Rating,Genres,Year,Episodes,Watched,Synopsis';
      const rows = all.map(a => [
        csvCell(a.russianName), csvCell(a.japaneseName), a.status || '',
        a.rating || '', csvCell((a.genres||[]).join('|')),
        a.year || '', a.episodeCount || '', a.episodesWatched || '',
        csvCell(a.description)
      ].join(','));
      downloadFile('anime_list.csv', 'text/csv', [header, ...rows].join('\n'));
    } else if (format === 'json') {
      const clean = all.map(a => ({
        russianName: a.russianName, japaneseName: a.japaneseName,
        status: a.status, rating: a.rating, genres: a.genres,
        year: a.year, episodeCount: a.episodeCount,
        episodesWatched: a.episodesWatched, description: a.description,
      }));
      downloadFile('anime_list.json', 'application/json', JSON.stringify(clean, null, 2));
    } else {
      const rows = all.map(a =>
        `${a.russianName}${a.japaneseName ? ' / ' + a.japaneseName : ''} [${STATUS_CFG[a.status]?.label || a.status}]`
      );
      downloadFile('anime_list.txt', 'text/plain', rows.join('\n'));
    }
    showToast(`Exported ${all.length} anime as .${format}`, 'success');
  } catch { showError('Export failed'); }
}

function csvCell(val) {
  if (!val) return '';
  const s = String(val).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function downloadFile(name, mime, content) {
  const blob = new Blob(['\uFEFF' + content], { type: mime + ';charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

async function importFromFile(input) {
  const file = input.files[0]; if (!file) return;
  const text = await file.text();
  input.value = '';

  let entries = [];
  if (file.name.endsWith('.json')) {
    entries = JSON.parse(text);
  } else if (file.name.endsWith('.csv')) {
    const lines = text.split('\n').slice(1); // skip header
    entries = lines.filter(l => l.trim()).map(line => {
      const cols = parseCsvLine(line);
      return {
        russianName:     cols[0] || '',
        japaneseName:    cols[1] || null,
        status:          cols[2] || 'WATCHING',
        rating:          cols[3] ? parseFloat(cols[3]) : null,
        genres:          cols[4] ? cols[4].split('|').filter(Boolean) : [],
        year:            cols[5] ? parseInt(cols[5]) : null,
        episodeCount:    cols[6] ? parseInt(cols[6]) : null,
        episodesWatched: cols[7] ? parseInt(cols[7]) : null,
        description:     cols[8] || null,
      };
    }).filter(e => e.russianName);
  } else {
    // plain txt — one anime name per line
    entries = text.split('\n').filter(l => l.trim()).map(l => ({
      russianName: l.trim(), status: 'WATCHING'
    }));
  }

  if (!entries.length) { showError('No entries found in file'); return; }

  // Reverse so that item[0] gets imported last → newest timestamp → appears first
  entries.reverse();

  const BATCH = 50;
  let imported = 0;
  for (let i = 0; i < entries.length; i += BATCH) {
    await api('POST', '/api/anime/bulk', entries.slice(i, i + BATCH));
    imported += Math.min(BATCH, entries.length - i);
    showToast(`Importing… ${imported}/${entries.length}`, 'success');
  }
  showToast(`Imported ${imported} anime!`, 'success');
  // Auto-remove any duplicates created by re-importing
  try {
    const deduped = await api('DELETE', '/api/anime/dedupe');
    if (deduped && deduped.removed > 0) showToast(`Removed ${deduped.removed} duplicates`, 'success');
  } catch {}
  await Promise.all([loadCounts(), loadSection(S.status)]);
}

function parseCsvLine(line) {
  const result = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += c;
  }
  result.push(cur);
  return result;
}

// ─── DETAIL MODAL ─────────────────────────────────────────
async function openDetailModal(id) {
  S.detailId=id;
  document.getElementById('detailMalScore').classList.add('hidden');
  document.getElementById('malPickerWrap').classList.add('hidden');
  document.getElementById('malPickerWrap').innerHTML='';
  try { populateDetail(await api('GET',`/api/anime/${id}`)); openModal('detailModal'); }
  catch { showError('Load failed'); }
}

function populateDetail(anime) {
  document.getElementById('detailRussian').textContent =anime.russianName||'';
  document.getElementById('detailJapanese').textContent=anime.japaneseName||'';
  const img=document.getElementById('detailImg');
  if(anime.imagePath){ img.src=anime.imagePath; img.style.display=''; } else { img.src=''; img.style.display='none'; }
  const badge=document.getElementById('detailStatusBadge');
  badge.textContent=STATUS_CFG[anime.status]?.label||anime.status;
  badge.className=`status-badge badge-${anime.status}`;
  const yr=document.getElementById('detailYear');
  yr.textContent=anime.year?String(anime.year):''; yr.style.display=anime.year?'':'none';
  const ep=document.getElementById('detailEpisodes');
  if(anime.episodeCount){ ep.textContent=anime.episodesWatched!=null?`${anime.episodesWatched} / ${anime.episodeCount} ep.`:`${anime.episodeCount} ep.`; ep.style.display=''; }
  else ep.style.display='none';
  document.getElementById('detailStars').innerHTML=starsHtml(anime.rating,'d-star');
  document.getElementById('detailSynopsis').textContent=anime.description||'';
  document.getElementById('detailGenres').innerHTML=(anime.genres||[]).map(g=>`<span class="detail-genre-tag">${esc(g)}</span>`).join('');
  document.getElementById('detailMoveSelect').value=anime.status;
  document.getElementById('detailEditBtn').onclick=()=>{ closeModal('detailModal'); openEditModal(anime); };
  document.getElementById('detailDeleteBtn').onclick=()=>confirmDelete(anime.id,anime.russianName);
}

async function applyMove() {
  const newStatus=document.getElementById('detailMoveSelect').value;
  if(!S.detailId) return;
  try {
    const anime=await api('GET',`/api/anime/${S.detailId}`);
    await api('PUT',`/api/anime/${S.detailId}`,{...buildBody(anime),status:newStatus});
    showToast(`Moved to ${STATUS_CFG[newStatus].label}!`,'success');
    closeModal('detailModal');
    await Promise.all([loadCounts(), refreshList()]);
  } catch { showError('Move failed'); }
}

function buildBody(a) {
  return { russianName:a.russianName, japaneseName:a.japaneseName, status:a.status,
    rating:a.rating, genres:a.genres, description:a.description, year:a.year,
    episodeCount:a.episodeCount, episodesWatched:a.episodesWatched, imagePath:a.imagePath };
}

// ─── FETCH FROM MAL ───────────────────────────────────────
async function fetchFromMAL() {
  const jaName = document.getElementById('detailJapanese').textContent.trim();
  const ruName = document.getElementById('detailRussian').textContent.trim();
  const btn = document.getElementById('fetchMalBtn');
  btn.disabled = true;

  let searchQ = jaName || ruName;
  if (!searchQ) { btn.disabled = false; return; }

  try {
    let results = [];

    if (isCyrillic(searchQ)) {
      btn.textContent = '↻ Shikimori…';
      // Use Shikimori to get romaji + MAL ID (same logic as the search box)
      let fetchTerm = searchQ;
      let shikiMalId = null;
      try {
        const shikiItems = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
        if (shikiItems && shikiItems.length > 0) {
          const best = shikiItems[0];
          if (best.name) { fetchTerm = best.name; shikiMalId = best.id; }
        } else {
          fetchTerm = await translateRuToEn(searchQ) || searchQ;
        }
      } catch {}

      btn.textContent = '↻ Searching…';
      const fetches = [
        fetch(`/api/jikan/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json()),
      ];
      if (shikiMalId) {
        fetches.push(fetch(`/api/jikan/details/${shikiMalId}`).then(r=>r.json()).then(d=>({data: d.data?[d.data]:[]})));
      }
      const settled = await Promise.allSettled(fetches);
      const seen = new Set();
      for (const r of settled) {
        if (r.status==='fulfilled') {
          for (const item of (r.value?.data||[])) {
            if (!seen.has(item.mal_id)) { seen.add(item.mal_id); results.push(item); }
          }
        }
      }
      // Pin Shikimori match to top
      if (shikiMalId) {
        const idx = results.findIndex(a => a.mal_id === shikiMalId);
        if (idx > 0) { const [p] = results.splice(idx,1); results.unshift(p); }
        const rest = results.slice(1).sort((a,b)=>(b.score||0)-(a.score||0));
        results.splice(1, rest.length, ...rest);
      } else {
        results.sort((a,b)=>(b.score||0)-(a.score||0));
      }
    } else {
      btn.textContent = '↻ Searching…';
      const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
      results = data.data || [];
    }

    const items = results.slice(0, 8);
    console.log('[FetchMAL] Total results:', results.length, '| showing:', items.length);
    if (!items.length) { showToast('No MAL results — try editing and searching manually', 'error'); return; }

    // Show score of top result
    if (items[0].score) {
      document.getElementById('detailMalScoreVal').textContent = items[0].score;
      document.getElementById('detailMalScore').classList.remove('hidden');
    }

    // Always show picker so user can choose the right one
    const wrap = document.getElementById('malPickerWrap');
    wrap.classList.remove('hidden');
    wrap.innerHTML = '<small style="color:var(--muted);width:100%;display:block;margin-bottom:.4rem">Select the correct anime:</small>'
      + items.map((item, i) => {
          const img = item.images?.jpg?.image_url || '';
          const year = item.year || '';
          const eps  = item.episodes ? item.episodes + ' ep' : '';
          const score = item.score ? '★' + item.score : '';
          const sub  = [year, eps, score].filter(Boolean).join(' · ');
          return `<button class="mal-pick-btn" data-i="${i}">
            ${img ? `<img src="${esc(img)}" alt="">` : ''}
            <div><div style="font-weight:600">${esc(item.title_english||item.title)}</div>
            <div style="font-size:.7rem;color:var(--muted)">${esc(sub)}</div></div>
          </button>`;
        }).join('');
    wrap.querySelectorAll('.mal-pick-btn').forEach((b, i) =>
      b.addEventListener('click', () => { wrap.classList.add('hidden'); applyMalToDetail(items[i]); }));

  } catch { showError('MAL fetch failed'); }
  finally { btn.textContent = '↻ Fetch from MAL'; btn.disabled = false; }
}

async function quickAutoFill(animeId, btn) {
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳';
  try {
    const anime = await api('GET', `/api/anime/${animeId}`);
    const searchQ = anime.japaneseName || anime.russianName;
    if (!searchQ) { showToast('No name to search with', 'error'); return; }

    let topItem = null;
    if (isCyrillic(searchQ)) {
      let shikiMalId = null, fetchTerm = searchQ;
      try {
        const shikiItems = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
        if (shikiItems?.length > 0) { fetchTerm = shikiItems[0].name || searchQ; shikiMalId = shikiItems[0].id; }
        else { fetchTerm = await translateRuToEn(searchQ) || searchQ; }
      } catch {}
      if (shikiMalId) {
        const det = await fetch(`/api/jikan/details/${shikiMalId}`).then(r=>r.json());
        topItem = det?.data || null;
      }
      if (!topItem) {
        const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json());
        topItem = data?.data?.[0] || null;
      }
    } else {
      const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
      topItem = data?.data?.[0] || null;
    }

    if (!topItem) { showToast('No result found for: ' + searchQ, 'error'); return; }

    // Apply directly — same logic as applyMalToDetail but using the anime id
    const synopsis = (topItem.synopsis||'').replace(/\[Written by MAL Rewrite\]/gi,'').trim().substring(0,1500);
    const imgUrl = topItem.images?.jpg?.large_image_url || topItem.images?.jpg?.image_url || '';
    const newGenres = (topItem.genres||[]).map(g=>GENRE_MAP[g.name]||g.name).filter(g=>GENRES.includes(g));
    const merged = [...new Set([...(anime.genres||[]),...newGenres])];
    const updated = await api('PUT', `/api/anime/${animeId}`, {
      ...buildBody(anime),
      japaneseName: anime.japaneseName || topItem.title || '',
      year: topItem.year || topItem.aired?.prop?.from?.year || anime.year || null,
      episodeCount: topItem.episodes || anime.episodeCount || null,
      genres: merged,
      description: synopsis || anime.description || '',
      imagePath: imgUrl || anime.imagePath || '',
    });
    // Update S.list in-place so render() reflects new data immediately
    const idx = S.list.findIndex(a => a.id === animeId);
    if (idx >= 0) S.list[idx] = updated;
    btn.textContent = '✅';
    setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 1500);
    showToast(`⚡ ${anime.russianName} — filled`, 'success');
    render();
  } catch(e) {
    showError('Auto-fill failed: ' + e.message);
    btn.textContent = origText; btn.disabled = false;
  }
}

async function autoFillFromMAL() {
  const btn = document.getElementById('detailAutoFillBtn');
  const ruName = document.getElementById('detailRussian').textContent.trim();
  const jaName = document.getElementById('detailJapanese').textContent.trim();
  const searchQ = jaName || ruName;
  if (!searchQ || !S.detailId) return;

  btn.disabled = true;
  btn.textContent = '⚡ …';

  try {
    let topItem = null;

    if (isCyrillic(searchQ)) {
      // Shikimori → pin MAL ID → take top result
      let fetchTerm = searchQ;
      let shikiMalId = null;
      try {
        const shikiItems = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
        if (shikiItems?.length > 0) { fetchTerm = shikiItems[0].name || searchQ; shikiMalId = shikiItems[0].id; }
        else { fetchTerm = await translateRuToEn(searchQ) || searchQ; }
      } catch {}

      if (shikiMalId) {
        // Fetch the exact match directly by ID — no ambiguity
        const det = await fetch(`/api/jikan/details/${shikiMalId}`).then(r=>r.json());
        topItem = det?.data || null;
      }
      if (!topItem) {
        const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json());
        topItem = data?.data?.[0] || null;
      }
    } else {
      const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
      topItem = data?.data?.[0] || null;
    }

    if (!topItem) { showToast('No MAL result found', 'error'); return; }
    await applyMalToDetail(topItem);
    showToast(`⚡ Auto-filled: ${topItem.title_english || topItem.title}`, 'success');
  } catch { showError('Auto-fill failed'); }
  finally { btn.disabled = false; btn.textContent = '⚡ Auto-fill'; }
}

async function applyMalToDetail(item) {
  if(!S.detailId) return;
  try {
    const anime=await api('GET',`/api/anime/${S.detailId}`);
    const synopsis=(item.synopsis||'').replace(/\[Written by MAL Rewrite\]/gi,'').trim().substring(0,1500);
    const imgUrl=item.images?.jpg?.large_image_url||item.images?.jpg?.image_url||'';
    const newGenres=(item.genres||[]).map(g=>GENRE_MAP[g.name]||g.name).filter(g=>GENRES.includes(g));
    const merged=[...new Set([...(anime.genres||[]),...newGenres])];
    const updated=await api('PUT',`/api/anime/${S.detailId}`,{
      ...buildBody(anime),
      japaneseName:anime.japaneseName||item.title,
      description:synopsis||anime.description,
      imagePath:imgUrl||anime.imagePath,
      year:item.year||anime.year,
      episodeCount:item.episodes||anime.episodeCount,
      genres:merged,
    });
    populateDetail(updated);
    document.getElementById('malPickerWrap').classList.add('hidden');
    if(item.score){ document.getElementById('detailMalScoreVal').textContent=item.score; document.getElementById('detailMalScore').classList.remove('hidden'); }
    const idx=S.list.findIndex(a=>a.id===S.detailId); if(idx>=0) S.list[idx]=updated;
    showToast('Updated from MAL!','success');
  } catch { showError('Apply MAL data failed'); }
}

// ─── DELETE ───────────────────────────────────────────────
function confirmDelete(id,name) {
  document.getElementById('confirmMsg').textContent=`Delete "${name}"?`;
  document.getElementById('confirmOkBtn').onclick=async()=>{
    try {
      await api('DELETE',`/api/anime/${id}`);
      closeModal('confirmDialog'); closeModal('detailModal');
      showToast('Deleted','success');
      await Promise.all([loadCounts(), refreshList()]);
    } catch { showError('Delete failed'); }
  };
  openModal('confirmDialog');
}

// ─── MODAL ────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ─── TOAST ────────────────────────────────────────────────
let _tt;
function showToast(msg,type='success') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className=`toast ${type}`;
  clearTimeout(_tt); _tt=setTimeout(()=>t.classList.add('hidden'),2800);
}
function showError(msg) { showToast(msg,'error'); }

// ─── UTIL ─────────────────────────────────────────────────
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
