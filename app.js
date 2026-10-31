/**
 * 포켓몬 도감 (Pokédex) 메인 애플리케이션 로직
 */

// 타입별 한글 라벨 및 테마 색상 맵
const TYPE_CONFIG = {
  normal:   { ko: '노말',   color: '#94a3b8' },
  fire:     { ko: '불꽃',   color: '#f97316' },
  water:    { ko: '물',     color: '#3b82f6' },
  grass:    { ko: '풀',     color: '#22c55e' },
  electric: { ko: '전기',   color: '#eab308' },
  ice:      { ko: '얼음',   color: '#06b6d4' },
  fighting: { ko: '격투',   color: '#dc2626' },
  poison:   { ko: '독',     color: '#a855f7' },
  ground:   { ko: '땅',     color: '#d97706' },
  flying:   { ko: '비행',   color: '#818cf8' },
  psychic:  { ko: '에스퍼', color: '#ec4899' },
  bug:      { ko: '벌레',   color: '#84cc16' },
  rock:     { ko: '바위',   color: '#78716c' },
  ghost:    { ko: '고스트', color: '#6366f1' },
  dragon:   { ko: '드래곤', color: '#7c3aed' },
  steel:    { ko: '강철',   color: '#64748b' },
  dark:     { ko: '악',     color: '#334155' },
  fairy:    { ko: '페어리', color: '#f472b6' }
};

// 세대별 도감 번호 범위
const GENERATIONS = [
  { gen: 'all', label: '전체 (1~9세대)' },
  { gen: '1', label: '1세대 관동 (#1~151)' },
  { gen: '2', label: '2세대 성도 (#152~251)' },
  { gen: '3', label: '3세대 호연 (#252~386)' },
  { gen: '4', label: '4세대 신오 (#387~493)' },
  { gen: '5', label: '5세대 하나 (#494~649)' },
  { gen: '6', label: '6세대 칼로스 (#650~721)' },
  { gen: '7', label: '7세대 알로라 (#722~809)' },
  { gen: '8', label: '8세대 가라르 (#810~905)' },
  { gen: '9', label: '9세대 팔데아 (#906~1025)' }
];

// 종족값 레이블 번역 및 색상
const STAT_LABELS = {
  hp: { name: '체력', color: '#22c55e' },
  attack: { name: '공격', color: '#f97316' },
  defense: { name: '방어', color: '#eab308' },
  'special-attack': { name: '특수공격', color: '#3b82f6' },
  'special-defense': { name: '특수방어', color: '#6366f1' },
  speed: { name: '스피드', color: '#ec4899' }
};

// 포켓몬 한국어 울음소리(애니메이션 더빙 대사) 텍스트 매핑
const SPECIAL_KO_CRYS = {
  '이상해씨': '이상~ 이상해씨!',
  '이상해풀': '이상~ 풀!',
  '이상해꽃': '이상~ 해꽃!',
  '파이리': '파이, 파이리!',
  '리자드': '리자~드!',
  '리자몽': '크아아앙! 리자몽!',
  '꼬부기': '꼬북! 꼬부기!',
  '어니부기': '어니, 부기!',
  '거북왕': '거북! 거북왕!',
  '캐터피': '캐터, 캐터피!',
  '버터플': '버터~ 플!',
  '피죤투': '피죠오온!',
  '피카츄': '피카, 피카츄!',
  '라이츄': '라이~ 츄!',
  '삐삐': '삐! 삐삐~!',
  '푸린': '푸~ 푸르르 푸린!',
  '고라파덕': '파덕? 골~파덕!',
  '냐옹': '냐~옹이다옹!',
  '발챙이': '발챙! 발챙이!',
  '야돈': '야~~~돈...',
  '팬텀': '팬~ 텀!',
  '탕구리': '탕구, 탕구리!',
  '또가스': '또~가스!',
  '또도가스': '또도~가스!',
  '마임맨': '마임~ 마임!',
  '잉어킹': '파닥파닥! 잉어킹!',
  '이브이': '이~브이!',
  '잠만보': '쿠우우... 잠~만보...',
  '프리져': '프리~져!',
  '썬더': '썬~더!',
  '파이어': '파이~어!',
  '망나뇽': '망나~뇽!',
  '뮤츠': '뮤츠...!',
  '뮤': '뮤~!',
  '치코리타': '치코! 치코리타!',
  '브케인': '브케, 브케인!',
  '리아코': '리아! 리아코!',
  '토게피': '토게토게~ 프리!',
  '마자용': '마~~~~~자용!',
  '루기아': '루기아~!',
  '칠색조': '칠색조~!',
  '세레비': '세레~비!',
  '나무지기': '나무! 지기!',
  '아차모': '아차, 아차모!',
  '물짱이': '물짱, 물짱이!',
  '모부기': '모북! 모부기!',
  '불꽃숭이': '숭이! 불꽃숭이!',
  '팽도리': '팽돌! 팽도리!',
  '따라큐': '따라~ 큐!'
};

function getKoreanPokemonCryText(name) {
  if (SPECIAL_KO_CRYS[name]) return SPECIAL_KO_CRYS[name];
  if (name.length <= 2) return `${name}! ${name}~!`;
  if (name.length === 3) return `${name.slice(0, 2)}! ${name}~!`;
  return `${name.slice(0, 2)}~ ${name}!`;
}

class PokedexApp {
  constructor() {
    this.allPokemon = [];
    this.filteredPokemon = [];
    this.favorites = new Set(JSON.parse(localStorage.getItem('pokedex_favs') || '[]'));
    this.detailsCache = new Map();
    
    // 필터 상태
    this.currentGen = 'all';
    this.currentType = 'all';
    this.searchQuery = '';
    this.sortBy = 'id-asc';
    this.onlyFavorites = false;

    // 렌더링 청크 관리
    this.pageSize = 48;
    this.renderedCount = 0;

    // 사운드 객체
    this.currentAudio = null;
    this.currentPokemonId = null;

    this.init();
  }

  async init() {
    this.initTheme();
    this.bindDomElements();
    this.renderTypeButtons();
    this.renderGenTabs();
    this.bindEvents();
    this.updateFavBadge();

    try {
      this.showLoading(true);
      // 로컬 파일(file://) 실행 시 CORS 제약 없이 동작하도록 window.POKEDEX_DATA 우선 사용
      if (window.POKEDEX_DATA && Array.isArray(window.POKEDEX_DATA)) {
        this.allPokemon = window.POKEDEX_DATA;
      } else {
        const res = await fetch('data/pokedex.json');
        if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
        this.allPokemon = await res.json();
      }
      this.applyFilters();
    } catch (err) {
      console.error(err);
      this.cardGrid.innerHTML = `
        <div class="col-span-full py-20 text-center">
          <p class="text-xl font-bold text-red-500 mb-2">데이터 로드에 실패했습니다.</p>
          <p class="text-sm text-slate-500">네트워크 상태를 확인하거나 페이지를 새로고침 해주세요.</p>
        </div>
      `;
    } finally {
      this.showLoading(false);
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('pokedex_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pokedex_theme', next);
    this.updateThemeButtonIcon();
  }

  bindDomElements() {
    this.cardGrid = document.getElementById('cardGrid');
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.typeFilterContainer = document.getElementById('typeFilters');
    this.genTabContainer = document.getElementById('genTabs');
    this.sortSelect = document.getElementById('sortSelect');
    this.favFilterBtn = document.getElementById('favFilterBtn');
    this.favCountBadge = document.getElementById('favCountBadge');
    this.resultCountEl = document.getElementById('resultCount');
    this.loadMoreContainer = document.getElementById('loadMoreContainer');
    this.loadMoreBtn = document.getElementById('loadMoreBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.scrollTopBtn = document.getElementById('scrollTopBtn');
    
    // 모달 요소들
    this.modalOverlay = document.getElementById('detailModal');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.modalPrevBtn = document.getElementById('modalPrevBtn');
    this.modalNextBtn = document.getElementById('modalNextBtn');
    this.modalBody = document.getElementById('modalBody');
  }

  bindEvents() {
    // 테마 토글
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // 검색 인풋
    let debounceTimer;
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.clearSearchBtn.classList.toggle('hidden', !this.searchQuery);
        this.applyFilters();
      }, 150);
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.classList.add('hidden');
      this.searchInput.focus();
      this.applyFilters();
    });

    // 정렬 선택
    this.sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applyFilters();
    });

    // 즐겨찾기 필터 버튼
    this.favFilterBtn.addEventListener('click', () => {
      this.onlyFavorites = !this.onlyFavorites;
      this.favFilterBtn.classList.toggle('bg-red-500', this.onlyFavorites);
      this.favFilterBtn.classList.toggle('text-white', this.onlyFavorites);
      this.favFilterBtn.classList.toggle('border-red-500', this.onlyFavorites);
      this.applyFilters();
    });

    // 더보기 버튼
    this.loadMoreBtn.addEventListener('click', () => {
      this.renderNextChunk();
    });

    // 무한 스크롤 감지
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        this.scrollTopBtn.classList.remove('opacity-0', 'pointer-events-none');
      } else {
        this.scrollTopBtn.classList.add('opacity-0', 'pointer-events-none');
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (this.renderedCount < this.filteredPokemon.length) {
          this.renderNextChunk();
        }
      }
    });

    // 맨 위로 이동 버튼
    this.scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 카드 클릭 이벤트 (위임)
    this.cardGrid.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.fav-btn');
      if (favBtn) {
        e.stopPropagation();
        const id = parseInt(favBtn.dataset.id, 10);
        this.toggleFavorite(id, favBtn);
        return;
      }

      const card = e.target.closest('.poke-card');
      if (card) {
        const id = parseInt(card.dataset.id, 10);
        this.openDetailModal(id);
      }
    });

    // 모달 닫기
    this.modalCloseBtn.addEventListener('click', () => this.closeDetailModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeDetailModal();
    });

    // 이전/다음 모달 네비게이션
    this.modalPrevBtn.addEventListener('click', () => {
      if (this.currentPokemonId > 1) {
        this.openDetailModal(this.currentPokemonId - 1);
      }
    });

    this.modalNextBtn.addEventListener('click', () => {
      if (this.currentPokemonId < 1025) {
        this.openDetailModal(this.currentPokemonId + 1);
      }
    });

    // 키보드 단축키
    window.addEventListener('keydown', (e) => {
      if (!this.modalOverlay.classList.contains('open')) return;
      if (e.key === 'Escape') this.closeDetailModal();
      if (e.key === 'ArrowLeft' && this.currentPokemonId > 1) {
        this.openDetailModal(this.currentPokemonId - 1);
      }
      if (e.key === 'ArrowRight' && this.currentPokemonId < 1025) {
        this.openDetailModal(this.currentPokemonId + 1);
      }
    });
  }

  renderGenTabs() {
    this.genTabContainer.innerHTML = GENERATIONS.map(g => `
      <button class="gen-tab ${g.gen === this.currentGen ? 'active' : ''}" data-gen="${g.gen}">
        ${g.label}
      </button>
    `).join('');

    this.genTabContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.gen-tab');
      if (!btn) return;
      this.currentGen = btn.dataset.gen;
      this.genTabContainer.querySelectorAll('.gen-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.applyFilters();
    });
  }

  renderTypeButtons() {
    const allBtn = `
      <button class="type-btn active" data-type="all">
        <span>전체 타입</span>
      </button>
    `;

    const typeBtns = Object.entries(TYPE_CONFIG).map(([typeKey, info]) => `
      <button class="type-btn" data-type="${typeKey}" style="--btn-color: ${info.color}">
        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${info.color}"></span>
        <span>${info.ko}</span>
      </button>
    `).join('');

    this.typeFilterContainer.innerHTML = allBtn + typeBtns;

    this.typeFilterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.type-btn');
      if (!btn) return;
      this.currentType = btn.dataset.type;
      this.typeFilterContainer.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.applyFilters();
    });
  }

  applyFilters() {
    let list = [...this.allPokemon];

    // 1. 세대 필터
    if (this.currentGen !== 'all') {
      const genNum = parseInt(this.currentGen, 10);
      list = list.filter(p => p.gen === genNum);
    }

    // 2. 속성(타입) 필터
    if (this.currentType !== 'all') {
      list = list.filter(p => p.types.some(t => t.en === this.currentType));
    }

    // 3. 즐겨찾기 필터
    if (this.onlyFavorites) {
      list = list.filter(p => this.favorites.has(p.id));
    }

    // 4. 검색어 필터 (이름, 영문명, 도감번호)
    if (this.searchQuery) {
      const q = this.searchQuery.replace('#', '');
      list = list.filter(p => {
        const idStr = p.id.toString();
        const padId = idStr.padStart(4, '0');
        const padId3 = idStr.padStart(3, '0');
        return (
          p.name.toLowerCase().includes(q) ||
          p.enName.toLowerCase().includes(q) ||
          idStr === q ||
          padId.includes(q) ||
          padId3.includes(q)
        );
      });
    }

    // 5. 정렬
    if (this.sortBy === 'id-asc') {
      list.sort((a, b) => a.id - b.id);
    } else if (this.sortBy === 'id-desc') {
      list.sort((a, b) => b.id - a.id);
    } else if (this.sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }

    this.filteredPokemon = list;
    this.renderedCount = 0;
    this.cardGrid.innerHTML = '';

    // 결과 수 업데이트
    this.resultCountEl.textContent = `${this.filteredPokemon.length.toLocaleString()}마리`;

    if (this.filteredPokemon.length === 0) {
      this.cardGrid.innerHTML = `
        <div class="col-span-full py-24 text-center">
          <div class="text-5xl mb-4">🔍</div>
          <p class="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">조건에 맞는 포켓몬이 없습니다.</p>
          <p class="text-sm text-slate-400">다른 검색어나 필터를 선택해 보세요.</p>
        </div>
      `;
      this.loadMoreContainer.classList.add('hidden');
      return;
    }

    this.renderNextChunk();
  }

  renderNextChunk() {
    const nextItems = this.filteredPokemon.slice(this.renderedCount, this.renderedCount + this.pageSize);
    if (nextItems.length === 0) return;

    const fragment = document.createDocumentFragment();
    nextItems.forEach(p => {
      const card = this.createCardElement(p);
      fragment.appendChild(card);
    });

    this.cardGrid.appendChild(fragment);
    this.renderedCount += nextItems.length;

    // 더보기 버튼 표시 여부
    if (this.renderedCount < this.filteredPokemon.length) {
      this.loadMoreContainer.classList.remove('hidden');
      this.loadMoreBtn.textContent = `더 보기 (${this.renderedCount} / ${this.filteredPokemon.length})`;
    } else {
      this.loadMoreContainer.classList.add('hidden');
    }
  }

  createCardElement(p) {
    const div = document.createElement('div');
    div.className = 'poke-card';
    div.dataset.id = p.id;

    const primaryType = p.types[0]?.en || 'normal';
    const accentColor = TYPE_CONFIG[primaryType]?.color || '#94a3b8';
    div.style.setProperty('--accent-color', accentColor);

    const isFav = this.favorites.has(p.id);
    const formattedId = `#${p.id.toString().padStart(4, '0')}`;
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;

    const typeBadges = p.types.map(t => `
      <span class="type-badge type-${t.en}">
        ${t.ko || t.en}
      </span>
    `).join('');

    div.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          ${formattedId}
        </span>
        <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${p.id}" title="즐겨찾기">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div class="poke-img-container">
        <img class="poke-img" 
             src="${imgUrl}" 
             alt="${p.name}" 
             loading="lazy"
             onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png'" />
      </div>

      <div class="mt-auto">
        <div class="text-xs text-slate-400 dark:text-slate-500 font-medium truncate mb-0.5">${p.genus || p.enName}</div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white truncate mb-2">${p.name}</h3>
        <div class="flex flex-wrap gap-1.5">
          ${typeBadges}
        </div>
      </div>
    `;

    return div;
  }

  toggleFavorite(id, btnElement) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
      if (btnElement) btnElement.classList.remove('active');
    } else {
      this.favorites.add(id);
      if (btnElement) btnElement.classList.add('active');
    }

    localStorage.setItem('pokedex_favs', JSON.stringify([...this.favorites]));
    this.updateFavBadge();

    // 즐겨찾기 전용 탭 활성화 상태라면 필터 재적용
    if (this.onlyFavorites) {
      this.applyFilters();
    }
  }

  updateFavBadge() {
    const count = this.favorites.size;
    this.favCountBadge.textContent = count;
    this.favCountBadge.classList.toggle('hidden', count === 0);
  }

  showLoading(isLoading) {
    if (isLoading) {
      this.cardGrid.innerHTML = Array.from({ length: 12 }).map(() => `
        <div class="rounded-2xl p-4 bg-slate-100 dark:bg-slate-800 animate-pulse aspect-[3/4]"></div>
      `).join('');
    }
  }

  // ==================== 모달 상세 팝업 ====================
  async openDetailModal(pokemonId) {
    this.currentPokemonId = pokemonId;
    const basic = this.allPokemon.find(p => p.id === pokemonId);
    if (!basic) return;

    this.modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // 이전/다음 버튼 상태 업데이트
    this.modalPrevBtn.disabled = pokemonId <= 1;
    this.modalNextBtn.disabled = pokemonId >= 1025;
    this.modalPrevBtn.classList.toggle('opacity-30', pokemonId <= 1);
    this.modalNextBtn.classList.toggle('opacity-30', pokemonId >= 1025);

    // 모달 초기 로딩 렌더링
    this.renderModalSkeleton(basic);

    // 상세 데이터 패치 (PokeAPI)
    try {
      const details = await this.fetchPokemonDetails(pokemonId);
      this.renderModalContent(basic, details);
    } catch (err) {
      console.error(err);
      this.modalBody.innerHTML = `
        <div class="p-8 text-center">
          <p class="text-red-500 font-bold mb-2">상세 정보를 불러올 수 없습니다.</p>
          <p class="text-xs text-slate-400">네트워크 연결 상태를 확인해 주세요.</p>
        </div>
      `;
    }
  }

  closeDetailModal() {
    this.modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  async fetchPokemonDetails(id) {
    if (this.detailsCache.has(id)) {
      return this.detailsCache.get(id);
    }

    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      ]);

      const pokemon = await pokemonRes.json();
      let species = {};
      try {
        species = await speciesRes.json();
      } catch (e) {
        console.warn('Species parse failed', e);
      }

      // 한국어 도감 설명 추출
      const koFlavors = (species.flavor_text_entries || []).filter(f => f.language?.name === 'ko');
      const flavorText = koFlavors.length > 0 
        ? koFlavors[koFlavors.length - 1].flavor_text.replace(/\n|\f/g, ' ') 
        : '도감 설명 데이터가 준비 중입니다.';

      const data = {
        height: (pokemon.height / 10).toFixed(1), // dm -> m
        weight: (pokemon.weight / 10).toFixed(1), // hg -> kg
        stats: (pokemon.stats || []).map(s => ({
          key: s.stat.name,
          base: s.base_stat
        })),
        flavorText,
        cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
      };

      this.detailsCache.set(id, data);
      return data;
    } catch (err) {
      console.error('Fetch details failed:', err);
      // 오프라인이거나 에러 시 기본 fallback 데이터 반환
      return {
        height: '?',
        weight: '?',
        stats: [
          { key: 'hp', base: 50 },
          { key: 'attack', base: 50 },
          { key: 'defense', base: 50 },
          { key: 'special-attack', base: 50 },
          { key: 'special-defense', base: 50 },
          { key: 'speed', base: 50 }
        ],
        flavorText: '상세 정보(PokeAPI)를 불러오는 중 네트워크 오류가 발생했습니다.',
        cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
      };
    }
  }

  renderModalSkeleton(basic) {
    const formattedId = `#${basic.id.toString().padStart(4, '0')}`;
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${basic.id}.png`;

    this.modalBody.innerHTML = `
      <div class="relative p-6 bg-slate-50 dark:bg-slate-800/60 flex flex-col items-center">
        <span class="font-mono text-xs font-bold text-slate-400 mb-1">${formattedId}</span>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-3">${basic.name}</h2>
        <div class="w-48 h-48 flex items-center justify-center">
          <img src="${imgUrl}" class="w-44 h-44 object-contain animate-pulse" alt="${basic.name}">
        </div>
      </div>
      <div class="p-6 space-y-4">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
        <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      </div>
    `;
  }

  renderModalContent(basic, details) {
    const formattedId = `#${basic.id.toString().padStart(4, '0')}`;
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${basic.id}.png`;
    const primaryType = basic.types[0]?.en || 'normal';
    const accentColor = TYPE_CONFIG[primaryType]?.color || '#94a3b8';

    const typeBadges = basic.types.map(t => `
      <span class="type-badge type-${t.en} px-3 py-1 text-sm font-semibold">
        ${t.ko || t.en}
      </span>
    `).join('');

    // 종족값 총합 계산
    const statTotal = details.stats.reduce((acc, s) => acc + s.base, 0);
    const koCryPhrase = getKoreanPokemonCryText(basic.name);

    const statsHtml = details.stats.map(s => {
      const info = STAT_LABELS[s.key] || { name: s.key, color: '#64748b' };
      const pct = Math.min(100, Math.round((s.base / 255) * 100));
      return `
        <div class="flex items-center text-xs gap-3">
          <span class="w-16 font-semibold text-slate-500 dark:text-slate-400 shrink-0">${info.name}</span>
          <span class="w-9 font-bold text-slate-800 dark:text-slate-100 shrink-0 text-right">${s.base}</span>
          <div class="stat-bar-track flex-1">
            <div class="stat-bar-fill" style="width: ${pct}%; background-color: ${info.color}"></div>
          </div>
        </div>
      `;
    }).join('');

    this.modalBody.innerHTML = `
      <!-- 모달 상단 헤더 및 일러스트 영역 -->
      <div class="relative p-6 flex flex-col items-center overflow-hidden" 
           style="background: radial-gradient(circle at 50% 60%, ${accentColor}25 0%, transparent 75%)">
        
        <div class="flex items-center gap-2 mb-1">
          <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            ${formattedId}
          </span>
          <span class="text-xs text-slate-400 font-medium">${basic.genus || basic.enName}</span>
        </div>

        <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">
          ${basic.name}
          <span class="text-sm font-normal text-slate-400 ml-1">(${basic.enName})</span>
        </h2>

        <!-- 타입 뱃지 -->
        <div class="flex gap-2 mb-2">
          ${typeBadges}
        </div>

        <!-- 메인 고화질 일러스트 및 한국어 말풍선 영역 (터치 인터랙션) -->
        <div id="modalPokemonTouchArea" 
             title="터치해보세요!" 
             class="relative w-56 h-56 flex items-center justify-center cursor-pointer select-none group">
          <!-- 상단 팝업 만화 말풍선 -->
          <div id="modalComicBubble" class="comic-bubble hidden">
            <span class="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 whitespace-nowrap">"${koCryPhrase}"</span>
          </div>
          <img id="modalPokemonImg"
               src="${imgUrl}" 
               class="w-48 h-48 object-contain filter drop-shadow-xl transition-all duration-300 group-hover:scale-105 active:scale-95" 
               alt="${basic.name}" />
        </div>
        <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium -mt-1 select-none">
          포켓몬을 터치해보세요! 👆
        </p>
      </div>
<!-- 모달 본문 상세 내용 -->
      <div class="p-6 space-y-5">
        
        <!-- 도감 설명 -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">도감 설명</h4>
          <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            ${details.flavorText}
          </p>
        </div>

        <!-- 신체 정보 (키, 몸무게) -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <span class="text-xs text-slate-400 block mb-1">신장 (키)</span>
            <span class="text-base font-black text-slate-800 dark:text-slate-100">${details.height} m</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
            <span class="text-xs text-slate-400 block mb-1">체중 (몸무게)</span>
            <span class="text-base font-black text-slate-800 dark:text-slate-100">${details.weight} kg</span>
          </div>
        </div>

        <!-- 종족값 (능력치 스탯) -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">종족값 능력치</h4>
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300">총합: <span class="text-sm font-black text-red-500">${statTotal}</span></span>
          </div>
          <div class="space-y-2.5">
            ${statsHtml}
          </div>
        </div>


      </div>
    `;

    // 포켓몬 캐릭터 클릭(터치) 시 머리 위 만화 말풍선 애니메이션 & 점프 연출
    const touchArea = document.getElementById('modalPokemonTouchArea');
    const comicBubble = document.getElementById('modalComicBubble');
    const pokemonImg = document.getElementById('modalPokemonImg');
    let bubbleTimer = null;

    const triggerPokemonReaction = () => {
      clearTimeout(bubbleTimer);

      // 말풍선 팝 애니메이션 리셋 및 재실행
      comicBubble.classList.remove('hidden');
      comicBubble.style.animation = 'none';
      void comicBubble.offsetWidth;
      comicBubble.style.animation = '';

      // 캐릭터 점프 애니메이션
      if (pokemonImg) {
        pokemonImg.classList.remove('pokemon-jumping');
        void pokemonImg.offsetWidth;
        pokemonImg.classList.add('pokemon-jumping');
      }

      // 3초 후 부드럽게 숨김
      bubbleTimer = setTimeout(() => {
        comicBubble.classList.add('hidden');
        if (pokemonImg) pokemonImg.classList.remove('pokemon-jumping');
      }, 3000);
    };

    if (touchArea) {
      touchArea.addEventListener('click', triggerPokemonReaction);
    }
  }
}

// 앱 실행
document.addEventListener('DOMContentLoaded', () => {
  window.pokedexApp = new PokedexApp();
});
