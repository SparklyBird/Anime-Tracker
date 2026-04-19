/* ============================================================
   ANIME TRACKER v3 — app.js
   UPDATED WITH: Favorite toggle, Rating sync, Grouped search
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

// ─── PAGINATION STATE ──────────────────────────────────────
let S_page = 0;
let S_loading = false;
let S_lastPage = false;
const PAGE_SIZE = 50;

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
    btn.addEventListener('click', e => {
      document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      F.minRating = parseInt(e.target.dataset.rating);
      applyFilters();
    })
  );
  loadCounts();
  loadSection(S.status);
});

// ─── TABS ─────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.status)));
}

function switchTab(status) {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab[data-status="${status}"]`)?.classList.add('active');
  S.status = status; S.query = ''; S_page = 0; S_loading = false; S_lastPage = false;
  S.list = [];
  document.getElementById('searchInput').value = '';
  window.scrollTo(0, 0);
  loadSection(status);
}

async function loadCounts() {
  try {
    const c = await api('GET', '/api/anime/counts');
    Object.keys(c).forEach(status => {
      const el = document.querySelector(`.tab-count[data-status="${status}"]`);
      if (el) el.textContent = c[status];
    });
  } catch {}
}

async function loadSection(status, append = false) {
  if (S_loading || S_lastPage) return;
  S_loading = true;
  
  // Only show full loading spinner on initial load, not during scroll
  if (!append) {
    showLoading();
  }
  
  try {
    const data = await api('GET', `/api/anime?status=${status}&page=${S_page}&size=${PAGE_SIZE}`);
    if (append) {
      S.list = [...S.list, ...data.content];
      // Remove any existing loading spinner
      const spinner = document.querySelector('.loading-wrap');
      if (spinner) spinner.remove();
      // When noImageOnly is active, only render items without images
      const toRender = S.noImageOnly ? data.content.filter(a => !a.imagePath) : data.content;
      if (toRender.length > 0) {
        // Remove empty state if it's currently showing
        const emptyState = document.querySelector('#listArea .empty-state');
        if (emptyState) emptyState.remove();
        const frag = document.createDocumentFragment();
        toRender.forEach(a => frag.appendChild(createItem(a)));
        document.getElementById('listArea').appendChild(frag);
      }
      // Update count dynamically
      updateResultCount();
    } else {
      S.list = data.content;
      render();
    }
    S_page = data.page + 1;
    S_lastPage = data.last;
    S_loading = false;
  } catch (e) {
    S_loading = false;
    showError('Issue loading anime: ' + (e.message || 'Server error'));
  }
}

async function refreshList() {
  S.list = []; S_page = 0; S_loading = false; S_lastPage = false;
  if (S.query) {
    if (S.status !== 'FAVORITE') {
      searchModeGrouped(S.query);
    } else {
      searchMode(S.query);
    }
  } else if (S.noImageOnly) {
    await loadUntilItemsFound();
  } else {
    loadSection(S.status);
  }
}

// Helper function to keep loading until we have items that pass the filter
async function loadUntilItemsFound() {
  showLoading();
  let attempts = 0;
  const maxAttempts = 20; // Don't loop forever
  
  while (attempts < maxAttempts && !S_lastPage) {
    try {
      const data = await api('GET', `/api/anime?status=${S.status}&page=${S_page}&size=${PAGE_SIZE}`);
      S.list = [...S.list, ...data.content];
      S_page = data.page + 1;
      S_lastPage = data.last;
      
      // Check if we have any items matching the filter
      const filtered = S.list.filter(a => !a.imagePath);
      if (filtered.length > 0 || S_lastPage) {
        // Found some items or reached the end
        render();
        return;
      }
      
      attempts++;
    } catch (e) {
      showError('Failed to load');
      return;
    }
  }
  
  // If we get here, render whatever we have
  render();
}

// Infinite scroll
const obs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !S.query && !S_loading && !S_lastPage) {
    loadSection(S.status, true);
  }
}, { rootMargin: '200px' });
window.addEventListener('load', () => {
  const sentinel = document.getElementById('sentinelItem');
  if (sentinel) obs.observe(sentinel);
});

// ─── API ──────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(res.statusText);
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  return res.json();
}

// ─── SEARCH ───────────────────────────────────────────────
function setupSearch() {
  let t;
  document.getElementById('searchInput').addEventListener('input', e => {
    S.query=e.target.value.trim().toLowerCase();
    clearTimeout(t);
    t = setTimeout(() => {
      if (S.query) {
        // Search with grouped results if NOT in Favorites tab
        if (S.status !== 'FAVORITE') {
          searchModeGrouped(S.query);
        } else {
          searchMode(S.query);
        }
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

// ─── SEARCH MODE (single section) ─────────────────────────
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
  } catch (e) { 
    showError('Search issue: ' + (e.message || 'Try again')); 
  }
}

// ─── SEARCH MODE GROUPED (all sections except FAVORITE) ────
async function searchModeGrouped(q) {
  showLoading();
  try {
    // Search across all statuses
    const allResults = await api('GET', `/api/anime/search?q=${encodeURIComponent(q)}`);
    
    // Group by status (excluding FAVORITE from grouping)
    const grouped = {};
    const statuses = ['WATCHED', 'WATCHING', 'WILL_WATCH', 'DROPPED'];
    statuses.forEach(st => { grouped[st] = []; });
    
    allResults.forEach(anime => {
      if (anime.status !== 'FAVORITE' && grouped[anime.status]) {
        grouped[anime.status].push(anime);
      }
    });
    
    // Remove empty groups
    const nonEmptyGroups = statuses.filter(st => grouped[st].length > 0);
    
    const area = document.getElementById('listArea');
    const totalCount = nonEmptyGroups.reduce((sum, st) => sum + grouped[st].length, 0);
    document.getElementById('resultCount').textContent = `${totalCount} anime`;
    
    if (totalCount === 0) {
      area.innerHTML = '<div class="empty-state"><div class="empty-icon">🎌</div><p>No results</p></div>';
      return;
    }
    
    area.innerHTML = '';
    const frag = document.createDocumentFragment();
    
    nonEmptyGroups.forEach((status, idx) => {
      // Add separator with status label and color
      const separator = document.createElement('div');
      separator.className = `search-group-separator status-${status}`;
      separator.innerHTML = `<h3>${STATUS_CFG[status].label}</h3><hr>`;
      frag.appendChild(separator);
      
      // Add anime items for this group
      filterList(grouped[status]).forEach(a => frag.appendChild(createItem(a)));
    });
    
    area.appendChild(frag);
    S.list = allResults.filter(a => a.status !== 'FAVORITE'); // Store for filtering
  } catch (e) { 
    showError('Search issue: ' + (e.message || 'Try again')); 
  }
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

function updateResultCount() {
  const count = document.getElementById('listArea').querySelectorAll('.anime-item').length;
  document.getElementById('resultCount').textContent = `${count} anime`;
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
    </div>
  `;
  el.onclick=()=>openDetailModal(anime.id);
  return el;
}

// ─── MODALS ───────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function openAddModal() {
  S.editingId=null; clearForm(); clearJikan();
  document.getElementById('editModalTitle').textContent='Add Anime';
  document.getElementById('fStatus').value=S.status;
  document.getElementById('dupeWarning').classList.add('hidden');
  openModal('editModal');
}

async function openEditModalById(id) {
  try {
    const anime=await api('GET',`/api/anime/${id}`);
    openEditModal(anime);
  } catch (e) { 
    showError('Issue loading anime: ' + (e.message || 'Not found')); 
  }
}

function openEditModal(anime) {
  S.editingId=anime.id; clearJikan();
  document.getElementById('editModalTitle').textContent='Edit Anime';
  document.getElementById('fRussianName').value=anime.russianName||'';
  document.getElementById('fJapaneseName').value=anime.japaneseName||'';
  document.getElementById('fStatus').value=anime.status;
  document.getElementById('fYear').value=anime.year||'';
  document.getElementById('fEpisodeCount').value=anime.episodeCount||'';
  document.getElementById('fEpisodesWatched').value=anime.episodesWatched||'';
  document.getElementById('fDescription').value=anime.description||'';
  document.getElementById('fRating').value=anime.rating||0;
  S.selectedRating = anime.rating || 0;
  renderFormStars();
  document.querySelectorAll('.genre-cb').forEach(c=>c.checked=(anime.genres||[]).includes(c.value));
  if (anime.imagePath) {
    if (anime.imagePath.startsWith('http') || anime.imagePath.startsWith('/uploads/')) {
      setImgMode('url'); document.getElementById('imgUrl').value=anime.imagePath; previewUrl(anime.imagePath);
    }
  } else { clearImgPreview(); setImgMode('url'); }
  document.getElementById('dupeWarning').classList.add('hidden');
  openModal('editModal');
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
  const newRating = parseFloat(document.getElementById('fRating').value) || null;
  
  const body = {
    russianName:     name,
    japaneseName:    document.getElementById('fJapaneseName').value.trim() || null,
    status:          document.getElementById('fStatus').value,
    rating:          newRating,
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
    
    // ═══ RATING SYNC: Update FAVORITE entry if it exists ═══
    if (S.editingId && newRating !== null) {
      try {
        const allMatches = await api('GET', `/api/anime/search?q=${encodeURIComponent(name)}`);
        const favoriteEntry = allMatches.find(a => 
          a.status === 'FAVORITE' && 
          a.russianName.toLowerCase() === name.toLowerCase() &&
          a.id !== S.editingId
        );
        
        if (favoriteEntry && favoriteEntry.rating !== newRating) {
          await api('PUT', `/api/anime/${favoriteEntry.id}`, {
            ...buildBody(favoriteEntry),
            rating: newRating
          });
        }
      } catch (e) {
        console.error('Failed to sync rating to favorite:', e);
      }
    }
    
    const scrollPos = window.scrollY;
    closeModal('editModal');
    showToast(S.editingId ? 'Updated!' : 'Added!', 'success');

    if (S.editingId) {
      // ── EDIT: patch in-place, no full reload ─────────────
      // Update S.list entry
      const idx = S.list.findIndex(a => a.id === saved.id);
      if (idx !== -1) S.list[idx] = saved;

      // Update the DOM card in-place
      const editBtn = document.querySelector(`button[onclick*="openEditModalById(${saved.id})"]`);
      if (editBtn) {
        editBtn.closest('.anime-item')?.replaceWith(createItem(saved));
      }

      // Restore scroll immediately (no re-render needed)
      window.scrollTo(0, scrollPos);
      await loadCounts();
    } else {
      // ── NEW: full reload so new item appears at top ───────
      await Promise.all([loadCounts(), refreshList()]);
    }
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
  const p=document.getElementById('imgPreview');
  p.src=url; p.style.display='block';
  document.getElementById('imgFile').value='';
}
function previewFile(input) {
  const file=input.files[0];
  if(!file) return;
  const url=URL.createObjectURL(file);
  const p=document.getElementById('imgPreview');
  p.src=url; p.style.display='block';
  document.getElementById('imgUrl').value='';
}
function clearImgPreview() {
  const p=document.getElementById('imgPreview');
  p.src=''; p.style.display='none';
}

function buildGenreGrid() {
  const grid=document.getElementById('genreGrid');
  grid.innerHTML=GENRES.map(g=>{
    const tip=GENRE_TIPS[g]||'';
    return `<div class="genre-item" title="${esc(tip)}">
      <input type="checkbox" id="g_${g.replace(/\s/g,'_')}" class="genre-cb" value="${g}">
      <label class="genre-label" for="g_${g.replace(/\s/g,'_')}">${g}</label>
    </div>`;
  }).join('');
}

function buildInteractiveStars() {
  const box = document.getElementById('formStars');
  box.innerHTML = '';
  
  for(let i=1; i<=5; i++) {
    const s = document.createElement('span');
    s.style.cssText = 'font-size:1.6rem;cursor:pointer;transition:all 0.15s;user-select:none;display:inline-block;';
    s.textContent = '☆';
    s.dataset.starIndex = i;
    box.appendChild(s);
  }
  
  attachStarListeners();
  
  box.addEventListener('mouseleave', () => {
    renderFormStars();
    Array.from(box.children).forEach(s => s.style.transform = 'scale(1)');
  });
}

function attachStarListeners() {
  const box = document.getElementById('formStars');
  
  Array.from(box.children).forEach((s, idx) => {
    const i = idx + 1;
    
    // Remove old listeners by cloning
    const newStar = s.cloneNode(true);
    s.parentNode.replaceChild(newStar, s);
    
    // Click - detect which half was clicked
    newStar.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if clicked on left or right half
      const rect = newStar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const isLeftHalf = clickX < rect.width / 2;
      
      S.selectedRating = isLeftHalf ? (i - 0.5) : i;
      document.getElementById('fRating').value = S.selectedRating;
      renderFormStars();
    });
    
    // Hover effect
    newStar.addEventListener('mouseenter', () => {
      const box = document.getElementById('formStars');
      for(let j=0; j<5; j++) {
        if (box.children[j]) {
          box.children[j].style.color = (j < i) ? 'var(--star)' : 'var(--star-e)';
          box.children[j].style.transform = (j < i) ? 'scale(1.15)' : 'scale(1)';
        }
      }
    });
  });
}

function renderFormStars() {
  const r = S.selectedRating;
  const box = document.getElementById('formStars');
  
  Array.from(box.children).forEach((s, i) => {
    const val = i + 1;
    
    // Clear any inline HTML
    s.style.color = '';
    
    if (r >= val) {
      s.textContent = '★';
      s.style.color = 'var(--star)';
    } else if (r >= val - 0.5) {
      // Half star using background gradient trick
      s.innerHTML = '<span style="position:relative;display:inline-block;color:var(--star-e);">☆<span style="position:absolute;left:0;top:0;width:50%;overflow:hidden;color:var(--star);">★</span></span>';
    } else {
      s.textContent = '☆';
      s.style.color = 'var(--star-e)';
    }
  });
  
  // Re-attach listeners after innerHTML changes
  attachStarListeners();
}

// ─── JIKAN (MAL) ──────────────────────────────────────────
function clearJikan() {
  document.getElementById('jikanInput').value='';
  document.getElementById('jikanResults').classList.add('hidden');
  document.getElementById('jikanResults').innerHTML='';
  S._russianQuery=null;
}

function isCyrillic(text) {
  return /[а-яё]/i.test(text);
}

async function translateRuToEn(text) {
  try {
    const res = await fetch(`/api/jikan/translate?q=${encodeURIComponent(text)}&langpair=ru|en`);
    const data = await res.json();
    const translated = data.responseData?.translatedText;
    return (translated && translated !== text && !/МАМА МИА/i.test(translated)) ? translated : text;
  } catch { return text; }
}

async function doJikanSearch() {
  const rawQ = document.getElementById('jikanInput').value.trim();
  if (!rawQ) return;
  const btn = document.getElementById('jikanBtn');
  btn.disabled = true;

  if (isCyrillic(rawQ)) {
    try {
      // Step 1: search Shikimori with Russian query → get official Russian title + romaji name
      btn.textContent = '↻ Shikimori…';
      const shikiResult = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(rawQ)}`).then(r => r.json());
      let searchTerm = rawQ;  // fallback
      let shikiMalId = null;
      if (shikiResult && shikiResult.length > 0) {
        const best = shikiResult[0];
        if (best.name) {
          S._russianQuery = best.russian || best.name;
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
      
      // ══ ANILIST FALLBACK if Jikan returned nothing ══
      if (merged.length === 0) {
        btn.textContent = '↻ AniList…';
        try {
          const anilistRes = await fetch(`/api/jikan/anilist/search?q=${encodeURIComponent(searchTerm)}`);
          const anilistData = await anilistRes.json();
          if (anilistData?.data?.Page?.media) {
            const anilistAnime = anilistData.data.Page.media.map(a => ({
              mal_id: a.id,
              title: a.title?.english || a.title?.romaji || '',
              title_english: a.title?.english,
              title_japanese: a.title?.native,
              images: { jpg: { image_url: a.coverImage?.large || '' } },
              synopsis: (a.description || '').replace(/<[^>]+>/g, ''),
              episodes: a.episodes,
              score: a.averageScore ? a.averageScore / 10 : null,
              year: a.seasonYear,
              genres: (a.genres || []).map(g => ({ name: g }))
            }));
            showToast('✓ Found via AniList (Jikan is down)', 'success');
            showJikanResults(anilistAnime);
            btn.textContent = 'Search MAL'; btn.disabled = false;
            return;
          }
        } catch (e) {
          console.error('AniList fallback failed:', e);
        }
      }
      
      showJikanResults(merged);

    } catch { showError('MAL search failed'); }
    finally { btn.textContent = 'Search MAL'; btn.disabled = false; }

  } else {
    // Plain English/romaji search — single query
    btn.textContent = '…';
    try {
      const data = await (await fetch(`/api/jikan/search?q=${encodeURIComponent(rawQ)}`)).json();
      const results = data.data || [];
      
      // ══ ANILIST FALLBACK if Jikan returned nothing ══
      if (results.length === 0) {
        btn.textContent = '↻ AniList…';
        try {
          const anilistRes = await fetch(`/api/jikan/anilist/search?q=${encodeURIComponent(rawQ)}`);
          const anilistData = await anilistRes.json();
          if (anilistData?.data?.Page?.media) {
            const anilistAnime = anilistData.data.Page.media.map(a => ({
              mal_id: a.id,
              title: a.title?.english || a.title?.romaji || '',
              title_english: a.title?.english,
              title_japanese: a.title?.native,
              images: { jpg: { image_url: a.coverImage?.large || '' } },
              synopsis: (a.description || '').replace(/<[^>]+>/g, ''),
              episodes: a.episodes,
              score: a.averageScore ? a.averageScore / 10 : null,
              year: a.seasonYear,
              genres: (a.genres || []).map(g => ({ name: g }))
            }));
            showToast('✓ Found via AniList (Jikan is down)', 'success');
            showJikanResults(anilistAnime);
            btn.textContent = 'Search MAL'; btn.disabled = false;
            return;
          }
        } catch (e) {
          console.error('AniList fallback failed:', e);
        }
      }
      
      showJikanResults(results);
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
async function toggleNoImageFilter() {
  S.noImageOnly = !S.noImageOnly;
  const btn = document.getElementById('noImageBtn');
  btn.classList.toggle('active', S.noImageOnly);
  btn.textContent = S.noImageOnly ? 'All anime' : 'No image';
  
  if (S.noImageOnly) {
    // Reload and keep loading until we find items without images
    S.list = [];
    S_page = 0;
    S_lastPage = false;
    await loadUntilItemsFound();
  } else {
    // Just reload normally
    S.list = [];
    S_page = 0;
    S_lastPage = false;
    loadSection(S.status);
  }
}
function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('hidden');
}
function closeExportMenu() {
  document.getElementById('exportMenu').classList.add('hidden');
}
async function exportList(format) {
  closeExportMenu();
  try {
    const blob=await (await fetch(`/api/anime/export/${format}`)).blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`anime-tracker.${format}`; a.click();
    showToast('Exported!','success');
  } catch { showError('Export failed'); }
}
async function importList(event) {
  const file=event.target.files[0];
  if(!file) return;
  const fd=new FormData(); fd.append('file',file);
  try {
    await fetch('/api/anime/import',{method:'POST',body:fd});
    event.target.value='';
    showToast('Imported!','success');
    await Promise.all([loadCounts(), refreshList()]);
  } catch { showError('Import failed'); }
}

// ─── DETAIL MODAL ─────────────────────────────────────────
async function openDetailModal(id) {
  S.detailId=id;
  document.getElementById('detailMalScore').classList.add('hidden');
  document.getElementById('malPickerWrap').classList.add('hidden');
  document.getElementById('malPickerWrap').innerHTML='';
  try { 
    const anime = await api('GET',`/api/anime/${id}`);
    await populateDetail(anime); 
    openModal('detailModal'); 
  } catch (e) { 
    showError('Issue loading anime details: ' + (e.message || 'Not found')); 
  }
}

async function populateDetail(anime) {
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
  
  // Interactive stars in detail modal
  const starsBox = document.getElementById('detailStars');
  starsBox.innerHTML = '';
  starsBox.style.cssText = 'display:flex;gap:4px;align-items:center;';
  
  let currentRating = anime.rating || 0;
  
  // Create all 5 stars
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.style.cssText = 'font-size:1.4rem;transition:all 0.15s;cursor:pointer;user-select:none;display:inline-block;';
    star.dataset.starIndex = i;
    starsBox.appendChild(star);
  }
  
  function renderDetailStars(rating) {
    currentRating = rating;
    
    for (let i = 1; i <= 5; i++) {
      const star = starsBox.children[i - 1];
      
      // Clear previous content and listeners by cloning
      const newStar = star.cloneNode(false);
      star.parentNode.replaceChild(newStar, star);
      
      newStar.style.cssText = 'font-size:1.4rem;transition:all 0.15s;cursor:pointer;user-select:none;display:inline-block;';
      newStar.dataset.starIndex = i;
      
      if (rating >= i) {
        newStar.textContent = '★';
        newStar.style.color = 'var(--star)';
      } else if (rating >= i - 0.5) {
        newStar.innerHTML = '<span style="position:relative;display:inline-block;color:var(--star-e);">☆<span style="position:absolute;left:0;top:0;width:50%;overflow:hidden;color:var(--star);">★</span></span>';
      } else {
        newStar.textContent = '☆';
        newStar.style.color = 'var(--star-e)';
      }
      
      // Click - detect which half was clicked
      newStar.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if clicked on left or right half
        const rect = newStar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isLeftHalf = clickX < rect.width / 2;
        
        const newRating = isLeftHalf ? (i - 0.5) : i;
        renderDetailStars(newRating);
        await updateAnimeRating(anime.id, newRating);
      });
      
      // Hover preview
      newStar.addEventListener('mouseenter', () => {
        for (let j = 1; j <= 5; j++) {
          const s = starsBox.children[j-1];
          if (s) {
            if (j <= i) {
              s.style.color = 'var(--star)';
              s.style.transform = 'scale(1.1)';
            } else {
              s.style.color = 'var(--star-e)';
              s.style.transform = 'scale(1)';
            }
          }
        }
      });
    }
  }
  
  // Reset hover
  starsBox.addEventListener('mouseleave', () => {
    renderDetailStars(currentRating);
    Array.from(starsBox.children).forEach(s => s.style.transform = 'scale(1)');
  });
  
  renderDetailStars(currentRating);
  
  document.getElementById('detailSynopsis').textContent=anime.description||'';
  document.getElementById('detailGenres').innerHTML=(anime.genres||[]).map(g=>`<span class="detail-genre-tag">${esc(g)}</span>`).join('');
  document.getElementById('detailMoveSelect').value=anime.status;
  document.getElementById('detailEditBtn').onclick=()=>{ closeModal('detailModal'); openEditModal(anime); };
  document.getElementById('detailDeleteBtn').onclick=()=>confirmDelete(anime.id,anime.russianName);
  
  // ═══ FAVORITE TOGGLE BUTTON ═══
  await updateFavoriteButton(anime);
}

// Helper function to update anime rating
async function updateAnimeRating(id, rating) {
  try {
    const anime = await api('GET', `/api/anime/${id}`);
    await api('PUT', `/api/anime/${id}`, { ...buildBody(anime), rating });
    
    // Sync rating to favorite entry if exists
    const allMatches = await api('GET', `/api/anime/search?q=${encodeURIComponent(anime.russianName)}`);
    const favoriteEntry = allMatches.find(a => 
      a.status === 'FAVORITE' && 
      a.russianName.toLowerCase() === anime.russianName.toLowerCase() &&
      a.id !== id
    );
    
    if (favoriteEntry && favoriteEntry.rating !== rating) {
      await api('PUT', `/api/anime/${favoriteEntry.id}`, {
        ...buildBody(favoriteEntry),
        rating: rating
      });
    }
    
    showToast(`Rated ${rating} stars!`, 'success');
  } catch (e) {
    showError('Failed to update rating: ' + (e.message || 'Try again'));
  }
}

async function updateFavoriteButton(anime) {
  const favBtn = document.getElementById('detailFavoriteBtn');
  if (!favBtn) return;
  
  // Check if a favorite entry exists for this anime (by name, different ID)
  try {
    const allMatches = await api('GET', `/api/anime/search?q=${encodeURIComponent(anime.russianName)}`);
    const favoriteEntry = allMatches.find(a => 
      a.status === 'FAVORITE' && 
      a.russianName.toLowerCase() === anime.russianName.toLowerCase()
    );
    
    if (favoriteEntry) {
      favBtn.innerHTML = '<span style="color:var(--star);">★</span> Remove Favorite';
      favBtn.className = 'btn-accent';
      favBtn.onclick = () => removeFavorite(anime, favoriteEntry.id);
    } else {
      favBtn.textContent = '☆ Add to Favorites';
      favBtn.className = 'btn-accent';
      favBtn.onclick = () => addToFavorites(anime);
    }
  } catch (e) {
    console.error('Failed to check favorite status:', e);
  }
}

async function addToFavorites(anime) {
  try {
    // Create a copy of the anime in FAVORITE status
    const body = {
      ...buildBody(anime),
      status: 'FAVORITE'
    };
    
    await api('POST', '/api/anime', body);
    showToast('Added to Favorites!', 'success');
    
    // Reload the button state
    const currentAnime = await api('GET', `/api/anime/${S.detailId}`);
    await updateFavoriteButton(currentAnime);
    await loadCounts();
  } catch (e) {
    showError('Failed to add to favorites: ' + e.message);
  }
}

async function removeFavorite(anime, favoriteId) {
  // Use custom confirmation dialog with better styling
  document.getElementById('confirmMsg').innerHTML = `
    <div style="text-align:center;padding:1rem 0 0.5rem 0;">
      <div style="font-size:2.5rem;margin-bottom:1rem;color:var(--star);">★</div>
      <div style="font-size:1.1rem;font-weight:600;margin-bottom:0.8rem;">
        Remove from Favorites?
      </div>
      <div style="color:var(--text);font-size:0.95rem;margin-bottom:0.5rem;">
        <strong>"${anime.russianName}"</strong>
      </div>
      <div style="color:var(--muted);font-size:0.85rem;line-height:1.5;max-width:320px;margin:0 auto;">
        This will only remove it from Favorites.<br>
        The anime will still exist in ${STATUS_CFG[anime.status].label}.
      </div>
    </div>
  `;
  
  document.getElementById('confirmOkBtn').textContent = 'Remove';
  document.getElementById('confirmOkBtn').onclick = async () => {
    closeModal('confirmDialog');
    
    try {
      // DELETE returns 204 No Content, so don't try to parse JSON
      const res = await fetch(`/api/anime/${favoriteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      showToast('Removed from Favorites!', 'success');
      
      // Reload the button state
      const currentAnime = await api('GET', `/api/anime/${S.detailId}`);
      await updateFavoriteButton(currentAnime);
      await loadCounts();
      
      // Refresh list if we're in Favorites tab
      if (S.status === 'FAVORITE') {
        await refreshList();
      }
    } catch (e) {
      showError('Issue removing from favorites: ' + (e.message || 'Try again'));
    }
  };
  
  openModal('confirmDialog');
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
      results.sort((a,b)=>(b.score||0)-(a.score||0));
    }

    if (!results.length) { showToast('No MAL results — try editing and searching manually', 'error'); return; }
    const scoreBox = document.getElementById('detailMalScore');
    const wrap = document.getElementById('malPickerWrap');
    const first = results[0];
    if (first.score) {
      scoreBox.classList.remove('hidden');
      document.getElementById('detailMalScoreVal').textContent = first.score;
    }
    wrap.classList.remove('hidden');
    wrap.innerHTML = `
      <div style="font-size:.85rem;color:var(--muted);margin-bottom:.6rem">Select best match from MAL:</div>
      ${results.slice(0,5).map((item,i) => {
        const img = item.images?.jpg?.image_url || '';
        const title = item.title_english || item.title || '';
        const year = item.year || item.aired?.prop?.from?.year || '';
        const meta = [year, item.score ? '⭐'+item.score : ''].filter(Boolean).join(' · ');
        return `<div class="mal-match-card" onclick="applyMALUpdate(${i},this)">
          ${img ? `<img src="${esc(img)}" style="width:40px;height:56px;object-fit:cover;border-radius:4px">` : ''}
          <div style="flex:1">
            <div style="font-weight:600">${esc(title)}</div>
            ${meta ? `<div style="font-size:.8rem;color:var(--muted)">${esc(meta)}</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    `;
    S._malResults = results;
    showToast('MAL results loaded — pick the best match below', 'success');
  } catch { showToast('Failed to fetch from MAL', 'error'); }
  finally { btn.textContent = '↻ Fetch from MAL'; btn.disabled = false; }
}

async function applyMALUpdate(idx, cardEl) {
  const selected = S._malResults?.[idx];
  if (!selected || !S.detailId) return;
  const btn = cardEl;
  const origHtml = btn.innerHTML;
  btn.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--muted)">Updating…</div>';
  btn.style.pointerEvents = 'none';

  try {
    const anime = await api('GET', `/api/anime/${S.detailId}`);
    const searchQ = anime.japaneseName || anime.russianName;
    if (!searchQ) { showToast('No name to search with', 'error'); return; }

    let results = [];
    if (isCyrillic(searchQ)) {
      let shikiMalId = null, fetchTerm = searchQ;
      try {
        const shikiItems = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
        if (shikiItems?.length > 0) { fetchTerm = shikiItems[0].name || searchQ; shikiMalId = shikiItems[0].id; }
        else { fetchTerm = await translateRuToEn(searchQ) || searchQ; }
      } catch {}
      const fetches = [ fetch(`/api/jikan/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json()) ];
      if (shikiMalId) fetches.push(fetch(`/api/jikan/details/${shikiMalId}`).then(r=>r.json()).then(d=>({data:d.data?[d.data]:[]})));
      const settled = await Promise.allSettled(fetches);
      const seen = new Set();
      for (const r of settled) {
        if (r.status==='fulfilled') {
          const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json());
          results = data.data || [];
        }
      }
    } else {
      const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
      results = data.data || [];
    }
    
    // If Jikan search returned nothing, try AniList search as fallback
    if (results.length === 0) {
      try {
        const anilistSearchData = await fetch(`/api/jikan/anilist/search?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
        if (anilistSearchData?.data?.Page?.media?.[0]) {
          const anilistItems = anilistSearchData.data.Page.media;
          results = anilistItems.map(a => ({
            mal_id: a.id,
            title: a.title?.english || a.title?.romaji || a.title?.native,
            titles: [{ type: 'Default', title: a.title?.english || a.title?.romaji }],
            images: { jpg: { image_url: a.coverImage?.large } }
          }));
          showToast('✓ Found via AniList (Jikan search failed)', 'success');
        }
      } catch (e) {
        console.error('AniList search fallback failed:', e);
      }
    }
    
    const topItem = results.length > 0 ? results[0] : null;
    if (!topItem) { showToast('No result found for: ' + searchQ, 'error'); return; }

    let fullItem = await fetch(`/api/jikan/details/${topItem.mal_id}`).then(r=>r.json()).then(d=>d.data).catch(() => null);
    
    // Try AniList fallback if Jikan failed - search by NAME
    if (!fullItem) {
      try {
        const animeName = topItem.title || topItem.titles?.[0]?.title || searchQ;
        const anilistSearchData = await fetch(`/api/jikan/anilist/search?q=${encodeURIComponent(animeName)}`).then(r=>r.json());
        if (anilistSearchData?.data?.Page?.media?.[0]) {
          const a = anilistSearchData.data.Page.media[0];
          fullItem = {
            mal_id: topItem.mal_id,  // Keep original MAL ID
            images: { jpg: { large_image_url: a.coverImage?.large, image_url: a.coverImage?.large } },
            titles: [{ type: 'Default', title: a.title?.english || a.title?.romaji }],
            title_synonyms: [a.title?.native],
            genres: (a.genres || []).map(g => ({ name: g })),
            year: a.seasonYear,
            episodes: a.episodes,
            synopsis: (a.description || '').replace(/<[^>]+>/g, '')
          };
          showToast('✓ Auto-filled via AniList', 'success');
        }
      } catch (e) {
        console.error('AniList fallback failed:', e);
      }
    }
    
    if (!fullItem) { 
      showToast('Failed to fetch full details', 'error'); 
      btnEl.textContent = origText; 
      btnEl.disabled = false; 
      return; 
    }

    const imgUrl = fullItem.images?.jpg?.large_image_url || fullItem.images?.jpg?.image_url || '';
    const russianTitle = fullItem.titles?.find(t => /russian/i.test(t.type))?.title ||
                         (fullItem.title_synonyms || []).find(s => /[а-яё]/i.test(s)) ||
                         null;
    const japaneseTitle = fullItem.title || fullItem.titles?.find(t => t.title && !/russian/i.test(t.type))?.title || null;
    const genres = (fullItem.genres || []).map(g => GENRE_MAP[g.name] || g.name).filter(g => GENRES.includes(g));
    const yearVal = fullItem.year || fullItem.aired?.prop?.from?.year || null;
    const episodeCount = fullItem.episodes || null;
    const synopsis = (fullItem.synopsis || '').replace(/\[Written by MAL Rewrite\]/gi, '').trim().substring(0, 1500);

    const body = { ...buildBody(anime) };
    if (!anime.russianName && russianTitle) body.russianName = russianTitle;
    if (!anime.japaneseName && japaneseTitle) body.japaneseName = japaneseTitle;
    if (imgUrl && !anime.imagePath) body.imagePath = imgUrl;
    if (genres.length > 0 && (!anime.genres || anime.genres.length === 0)) body.genres = genres;
    if (yearVal && !anime.year) body.year = yearVal;
    if (episodeCount && !anime.episodeCount) body.episodeCount = episodeCount;
    if (synopsis && !anime.description) body.description = synopsis;

    await api('PUT', `/api/anime/${S.detailId}`, body);
    showToast('Updated from MAL!', 'success');
    closeModal('detailModal');
    await refreshList();
  } catch { showToast('Update failed', 'error'); }
  finally { btn.innerHTML = origHtml; btn.style.pointerEvents = ''; }
}

async function quickAutoFill(id, btnEl) {
  const origText = btnEl.textContent;
  btnEl.textContent = '↻';
  btnEl.disabled = true;
  try {
    const anime = await api('GET', `/api/anime/${id}`);
    const searchQ = anime.japaneseName || anime.russianName;
    if (!searchQ) { showToast('No name to search with', 'error'); return; }

    let results = [];
    let fetchTerm = searchQ;  // Use romaji if Shikimori provides it
    if (isCyrillic(searchQ)) {
      let shikiMalId = null;
      try {
        const shikiItems = await fetch(`/api/jikan/shikimori?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
        if (shikiItems?.length > 0) { fetchTerm = shikiItems[0].name || searchQ; shikiMalId = shikiItems[0].id; }
        else { fetchTerm = await translateRuToEn(searchQ) || searchQ; }
      } catch {}
      const fetches = [ fetch(`/api/jikan/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json()) ];
      if (shikiMalId) fetches.push(fetch(`/api/jikan/details/${shikiMalId}`).then(r=>r.json()).then(d=>({data:d.data?[d.data]:[]})));
      const settled = await Promise.allSettled(fetches);
      const seen = new Set();
      for (const r of settled) {
        if (r.status==='fulfilled') {
          for (const item of (r.value?.data||[])) {
            if (!seen.has(item.mal_id)) { seen.add(item.mal_id); results.push(item); }
          }
        }
      }
    } else {
      const data = await fetch(`/api/jikan/search?q=${encodeURIComponent(searchQ)}`).then(r=>r.json());
      results = data.data || [];
    }
    
    // If Jikan search returned nothing, try AniList search with romaji from Shikimori
    if (results.length === 0) {
      try {
        const anilistSearchData = await fetch(`/api/jikan/anilist/search?q=${encodeURIComponent(fetchTerm)}`).then(r=>r.json());
        if (anilistSearchData?.data?.Page?.media?.[0]) {
          const anilistItems = anilistSearchData.data.Page.media;
          results = anilistItems.map(a => ({
            mal_id: a.id,
            title: a.title?.english || a.title?.romaji || a.title?.native,
            titles: [{ type: 'Default', title: a.title?.english || a.title?.romaji }],
            images: { jpg: { image_url: a.coverImage?.large } }
          }));
          showToast('✓ Found via AniList (Jikan search failed)', 'success');
        }
      } catch (e) {
        console.error('AniList search fallback failed:', e);
      }
    }
    
    const topItem = results.length > 0 ? results[0] : null;
    if (!topItem) { showToast('No result found for: ' + searchQ, 'error'); return; }

    let fullItem = await fetch(`/api/jikan/details/${topItem.mal_id}`).then(r=>r.json()).then(d=>d.data).catch(() => null);
    
    // Try AniList fallback if Jikan failed - search by NAME
    if (!fullItem) {
      try {
        const animeName = topItem.title || topItem.titles?.[0]?.title || searchQ;
        const anilistSearchData = await fetch(`/api/jikan/anilist/search?q=${encodeURIComponent(animeName)}`).then(r=>r.json());
        if (anilistSearchData?.data?.Page?.media?.[0]) {
          const a = anilistSearchData.data.Page.media[0];
          fullItem = {
            mal_id: topItem.mal_id,  // Keep original MAL ID
            images: { jpg: { large_image_url: a.coverImage?.large, image_url: a.coverImage?.large } },
            titles: [{ type: 'Default', title: a.title?.english || a.title?.romaji }],
            title_synonyms: [a.title?.native],
            genres: (a.genres || []).map(g => ({ name: g })),
            year: a.seasonYear,
            episodes: a.episodes,
            synopsis: (a.description || '').replace(/<[^>]+>/g, '')
          };
          showToast('✓ Auto-filled via AniList', 'success');
        }
      } catch (e) {
        console.error('AniList fallback failed:', e);
      }
    }
    
    if (!fullItem) { 
      showToast('Failed to fetch full details', 'error'); 
      btnEl.textContent = origText; 
      btnEl.disabled = false; 
      return; 
    }

    const imgUrl = fullItem.images?.jpg?.large_image_url || fullItem.images?.jpg?.image_url || '';
    const russianTitle = fullItem.titles?.find(t => /russian/i.test(t.type))?.title ||
                         (fullItem.title_synonyms || []).find(s => /[а-яё]/i.test(s)) ||
                         null;
    const japaneseTitle = fullItem.title || fullItem.titles?.find(t => t.title && !/russian/i.test(t.type))?.title || null;
    const genres = (fullItem.genres || []).map(g => GENRE_MAP[g.name] || g.name).filter(g => GENRES.includes(g));
    const yearVal = fullItem.year || fullItem.aired?.prop?.from?.year || null;
    const episodeCount = fullItem.episodes || null;
    const synopsis = (fullItem.synopsis || '').replace(/\[Written by MAL Rewrite\]/gi, '').trim().substring(0, 1500);

    const body = { ...buildBody(anime) };
    if (!anime.russianName && russianTitle) body.russianName = russianTitle;
    if (!anime.japaneseName && japaneseTitle) body.japaneseName = japaneseTitle;
    if (imgUrl && !anime.imagePath) body.imagePath = imgUrl;
    if (genres.length > 0 && (!anime.genres || anime.genres.length === 0)) body.genres = genres;
    if (yearVal && !anime.year) body.year = yearVal;
    if (episodeCount && !anime.episodeCount) body.episodeCount = episodeCount;
    if (synopsis && !anime.description) body.description = synopsis;

    await api('PUT', `/api/anime/${id}`, body);
    
    // Update the item in S.list instead of refreshing everything
    const idx = S.list.findIndex(a => a.id === id);
    if (idx !== -1) {
      // Fetch updated anime data
      const updated = await api('GET', `/api/anime/${id}`);
      S.list[idx] = updated;
      
      // If "No image" filter is active and anime now has image, remove it from view
      if (S.noImageOnly && updated.imagePath) {
        const items = document.querySelectorAll('.anime-item');
        items.forEach(item => {
          const editBtn = item.querySelector(`button[onclick*="openEditModalById(${id})"]`);
          if (editBtn) {
            item.remove();
          }
        });
        updateResultCount();
      } else {
        // Update just this item in the DOM
        const items = document.querySelectorAll('.anime-item');
        items.forEach(item => {
          const editBtn = item.querySelector(`button[onclick*="openEditModalById(${id})"]`);
          if (editBtn) {
            const newItem = createItem(updated);
            item.replaceWith(newItem);
          }
        });
      }
    }
    
    btnEl.textContent = '✓';
    showToast('Auto-filled from MAL!', 'success');
    setTimeout(() => { btnEl.textContent = origText; btnEl.disabled = false; }, 1500);
  } catch { showToast('Auto-fill failed', 'error'); btnEl.textContent = origText; btnEl.disabled = false; }
}

// ─── DELETE ───────────────────────────────────────────────
function confirmDelete(id, name) {
  document.getElementById('confirmMsg').textContent = `Delete "${name}"?`;
  document.getElementById('confirmOkBtn').onclick = async () => {
    try {
      await api('DELETE', `/api/anime/${id}`);
      showToast('Deleted!', 'success');
      closeModal('confirmDialog'); closeModal('detailModal');
      await Promise.all([loadCounts(), refreshList()]);
    } catch { showError('Delete failed'); }
  };
  openModal('confirmDialog');
}

// ─── TOAST / ERROR ────────────────────────────────────────
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => { t.className = 'toast hidden'; }, 3000);
}
function showError(msg) { showToast(msg, 'error'); }

// ─── UTIL ─────────────────────────────────────────────────
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
