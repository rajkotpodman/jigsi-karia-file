/* ============================================================
   CyberDork OSINT Suite v7.0
   app.js - Router, Multi-Engine Runner, UI Handlers
   ============================================================ */

const DEFAULT_TARGET = '9898048483';

const SEARCH_ENGINES = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    yandex: 'https://yandex.com/search/?text=',
    shodan: 'https://www.shodan.io/search?query=',
    ecosia: 'https://www.ecosia.org/search?q=',
    startpage: 'https://www.startpage.com/sp/search?query='
};

let selectedEngine = 'google';
let activeDorkCategory = 'all';
let dorkFavorites = [];

const CUSTOM_DORKS_KEY = 'cdos_custom_dorks';
let CUSTOM_DORKS = [];

/* ---------- SPA Router ---------- */
const PAGE_IDS = ['page-dashboard', 'page-dorks', 'page-extensions', 'page-builder', 'page-terminal', 'page-pro', 'page-auth'];

function showPage(id) {
    PAGE_IDS.forEach(p => {
        document.getElementById(p).classList.toggle('active', p === id);
    });
    document.querySelectorAll('.top-nav a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('data-page') === id);
    });
    playClick();
    if (id === 'page-terminal' && typeof Terminal !== 'undefined') {
        setTimeout(() => document.getElementById('termInput').focus(), 60);
    }
}

/* ---------- Search execution ---------- */
function runSearch(query, engine) {
    const url = (SEARCH_ENGINES[engine] || SEARCH_ENGINES.google) + encodeURIComponent(query);
    window.open(url, '_blank');
    playSuccess();
}

function multiEngineRun(query) {
    const engines = ['google', 'bing', 'duckduckgo', 'yandex', 'shodan'];
    engines.forEach(e => {
        setTimeout(() => {
            const url = SEARCH_ENGINES[e] + encodeURIComponent(query);
            window.open(url, '_blank');
        }, 120);
    });
    toast('Launched 5-engine matrix', 'ok');
    playSuccess();
}

function runFullMatrix() {
    const target = document.getElementById('superMultiInput').value.trim() || DEFAULT_TARGET;
    multiEngineRun(target);
    addToHistory(target, 'super-multi');
}

/* ---------- Dork page ---------- */
function initDorks() {
    dorkFavorites = JSON.parse(safeStorage.getItem('cdos_dork_favs') || '[]');
    const saved = JSON.parse(safeStorage.getItem(CUSTOM_DORKS_KEY) || '[]');
    CUSTOM_DORKS = saved;
    renderDorkCategories();
    renderDorks();
}

function allDorks() {
    return CUSTOM_DORKS.concat(DORKS_DB);
}

function renderDorkCategories() {
    const container = document.getElementById('dorkCategoryTabs');
    if (!container) return;
    const cats = DORK_CATEGORIES.concat(CUSTOM_DORKS.length ? [{ id: 'custom', name: '✨ Custom Import' }] : []);
    container.innerHTML = cats.map(cat =>
        `<button class="tab-btn ${cat.id === activeDorkCategory ? 'active' : ''}" onclick="filterDorkCategory('${cat.id}')">${cat.name}</button>`
    ).join('');
}

function filterDorkCategory(catId) {
    activeDorkCategory = catId;
    renderDorkCategories();
    renderDorks();
}

function renderDorks() {
    const grid = document.getElementById('dorkGrid');
    const counter = document.getElementById('dorkStats');
    if (!grid) return;
    const keyword = (document.getElementById('dorkSearch').value || '').toLowerCase().trim();
    const target = document.getElementById('dorkTarget').value || DEFAULT_TARGET;

    let filtered = allDorks();
    if (activeDorkCategory === 'fav') filtered = filtered.filter(d => dorkFavorites.includes(d.title));
    else if (activeDorkCategory === 'custom') filtered = CUSTOM_DORKS;
    else if (activeDorkCategory !== 'all') filtered = filtered.filter(d => d.category === activeDorkCategory);

    if (keyword) {
        filtered = filtered.filter(d =>
            (d.title || '').toLowerCase().includes(keyword) ||
            (d.dork || '').toLowerCase().includes(keyword) ||
            (d.category || '').toLowerCase().includes(keyword)
        );
    }

    if (counter) counter.textContent = `Showing ${filtered.length} of ${allDorks().length} dork commands`;

    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state">No dorks matched your filter.</div>';
        return;
    }

    grid.innerHTML = filtered.map((item) => {
        const isFav = dorkFavorites.includes(item.title);
        const isCustom = CUSTOM_DORKS.some(c => c.title === item.title && c.dork === item.dork);
        const enc = encodeURIComponent(JSON.stringify(item));
        const encTitle = encodeURIComponent(item.title);
        return `
        <div class="dork-btn">
            <div class="d-title" title="${escapeHtml(item.dork)}">${escapeHtml(item.title)}</div>
            <div class="d-tag">${escapeHtml(item.dork)}</div>
            <div class="d-actions">
                <button onclick="runDorkItem('${enc}')">▶ Run</button>
                <button onclick="runDorkMultiItem('${enc}')">🚀 Multi</button>
                <button class="fav-btn ${isFav ? 'faved' : ''}" onclick="toggleDorkFav('${encTitle}')">${isFav ? '★' : '☆'}</button>
                ${isCustom ? '<button class="fav-btn" onclick="removeCustomDork(\'' + encTitle + '\')" title="Delete">✕</button>' : ''}
            </div>
        </div>`;
    }).join('');
}

function dorkFromEnc(enc) {
    try { return JSON.parse(decodeURIComponent(enc)); }
    catch (e) { return null; }
}

function runDorkItem(enc) {
    const item = dorkFromEnc(enc);
    if (!item) return;
    const target = document.getElementById('dorkTarget').value || DEFAULT_TARGET;
    const query = `${target} ${item.dork}`;
    runSearch(query, selectedEngine);
    addToHistory(query, 'dork');
}

function runDorkMultiItem(enc) {
    const item = dorkFromEnc(enc);
    if (!item) return;
    const target = document.getElementById('dorkTarget').value || DEFAULT_TARGET;
    const query = `${target} ${item.dork}`;
    multiEngineRun(query);
    addToHistory(query, 'dork-multi');
}

function toggleDorkFav(encTitle) {
    const title = decodeURIComponent(encTitle);
    if (dorkFavorites.includes(title)) {
        dorkFavorites = dorkFavorites.filter(t => t !== title);
    } else {
        dorkFavorites.push(title);
    }
    safeStorage.setItem('cdos_dork_favs', JSON.stringify(dorkFavorites));
    renderDorks();
    playClick();
}

function removeCustomDork(encTitle) {
    const title = decodeURIComponent(encTitle);
    const idx = CUSTOM_DORKS.findIndex(c => c.title === title);
    if (idx === -1) return;
    CUSTOM_DORKS.splice(idx, 1);
    safeStorage.setItem(CUSTOM_DORKS_KEY, JSON.stringify(CUSTOM_DORKS));
    renderDorkCategories();
    renderDorks();
}

function refreshCustomDorks() {
    CUSTOM_DORKS = JSON.parse(safeStorage.getItem(CUSTOM_DORKS_KEY) || '[]');
    renderDorkCategories();
    renderDorks();
}
window.refreshCustomDorks = refreshCustomDorks;

function setEngine(engine, el) {
    selectedEngine = engine;
    document.querySelectorAll('.engine-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    playClick();
}

function clearDorkFilters() {
    document.getElementById('dorkSearch').value = '';
    activeDorkCategory = 'all';
    renderDorkCategories();
    renderDorks();
}

/* ---------- Extension page ---------- */
function renderExtensions() {
    const container = document.getElementById('extCategories');
    if (!container) return;
    let html = '';
    let count = 0;
    for (const [cat, exts] of Object.entries(EXTENSION_CATEGORIES)) {
        html += `<div class="category-section">
            <div class="category-title">${escapeHtml(cat)} (${exts.length})</div>
            <div class="buttons-grid">`;
        exts.forEach(e => {
            count++;
            html += `<button class="ext-btn" data-ext="${e}" onclick="triggerExtSearch('${e}')">.${e}</button>`;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html;
    const counter = document.getElementById('extStats');
    if (counter) counter.textContent = `Loaded ${EXTENSION_TOTAL}+ unique file extensions across ${Object.keys(EXTENSION_CATEGORIES).length} categories`;
}

function filterExtensions() {
    const filter = (document.getElementById('extFilter').value || '').toLowerCase().trim();
    document.querySelectorAll('.ext-btn').forEach(btn => {
        btn.style.display = btn.getAttribute('data-ext').includes(filter) ? 'inline-block' : 'none';
    });
}

function triggerExtSearch(ext) {
    const keyword = document.getElementById('extSearchKeyword').value.trim() || DEFAULT_TARGET;
    const query = `${keyword} filetype:${ext}`;
    runSearch(query, selectedEngine);
    addToHistory(query, 'ext');
    playSuccess();
}

function findExtInHub() {
    const ext = document.getElementById('extQuickSearch').value.trim().replace(/^\./, '').toLowerCase();
    if (!ext) return;
    const input = document.getElementById('extFilter');
    input.value = ext;
    filterExtensions();
    addToHistory(ext, 'ext-hunt');
    toast('Filtering for .' + ext, 'ok');
    playClick();
}

/* ---------- Dashboard ---------- */
function initDashboard() {
    document.getElementById('dashTarget').value = DEFAULT_TARGET;
    document.getElementById('dorkTarget').value = DEFAULT_TARGET;
    document.getElementById('superMultiInput').value = DEFAULT_TARGET;
    document.getElementById('extSearchKeyword').value = DEFAULT_TARGET;
    document.getElementById('builderTarget').value = DEFAULT_TARGET;
    document.getElementById('reportTarget').value = DEFAULT_TARGET;

    const el = document.getElementById('statDorks');
    if (el) el.textContent = DORKS_DB.length + '+';
    const el2 = document.getElementById('statExts');
    if (el2) el2.textContent = EXTENSION_TOTAL + '+';
    const el3 = document.getElementById('statCats');
    if (el3) el3.textContent = Object.keys(EXTENSION_CATEGORIES).length;
}

function radarSearch(kind) {
    const target = document.getElementById('dashTarget').value.trim() || DEFAULT_TARGET;
    const map = {
        phone: { engine: 'google', query: `"${target}"` },
        domain: { engine: 'google', query: `site:${target}` },
        social: { engine: 'google', query: `"${target}" instagram OR twitter OR facebook OR linkedin` },
        leak: { engine: 'google', query: `"${target}" password OR email OR dump` }
    };
    const cfg = map[kind];
    runSearch(cfg.query, cfg.engine);
    addToHistory(cfg.query, 'radar:' + kind);
}

/* ---------- Quick Links ---------- */
const QUICK_LINKS = {
    virustotal: t => `https://www.virustotal.com/gui/search/${encodeURIComponent(t)}`,
    censys: t => `https://search.censys.io/search?resource=hosts&sort=RELEVANCE&per_page=25&virtual_hosts=EXCLUDE&q=${encodeURIComponent(t)}`,
    securitytrails: t => `https://securitytrails.com/domain/${encodeURIComponent(t)}/dns`,
    wayback: t => `https://web.archive.org/web/*/${encodeURIComponent(t)}`,
    ipvoid: t => `https://www.ipvoid.com/ip-blacklist-check/${encodeURIComponent(t)}/`,
    centralops: t => `https://centralops.net/co/DomainDossier.aspx?dom_whois=True&dom_dns=True&addr=${encodeURIComponent(t)}`,
    whois: t => `https://who.is/whois/${encodeURIComponent(t)}`,
    shodan: t => `https://www.shodan.io/search?query=${encodeURIComponent(t)}`,
    dnsdumpster: t => `https://dnsdumpster.com/`,
    hunterio: t => `https://hunter.io/search/${encodeURIComponent(t)}`,
    intelx: t => `https://intelx.io/?s=${encodeURIComponent(t)}`,
    haveibeenpwned: t => `https://haveibeenpwned.com/`,
    dehashed: t => `https://dehashed.com/`,
    google: t => `https://www.google.com/search?q=${encodeURIComponent(t)}`
};

function openQuickLink(kind, customTarget) {
    const target = (customTarget || document.getElementById('builderTarget').value || DEFAULT_TARGET);
    const fn = QUICK_LINKS[kind];
    if (!fn) return;
    window.open(fn(target), '_blank');
    addToHistory(target, 'link:' + kind);
    playClick();
}

function whoisLookup() {
    const target = document.getElementById('whoisInput').value.trim() || DEFAULT_TARGET;
    openQuickLink('whois', target);
}

/* ---------- Threat feed ticker ---------- */
const THREAT_FEED = [
    '⚠️ Simulated feed: New OSINT training course from SANS announced',
    '🛡️ Patch Tuesday: 87 CVEs released - check your exposure surface',
    '📡 Credential stuffing attacks up 40% YoY per simulated report',
    '🔒 CISA simulated advisory: harden remote access portals',
    '💻 Ransomware simulation: 2026 trends show supply-chain focus',
    '🕵️ Phishing kits simulating login pages of major cloud providers',
    '🌐 Open DNS resolvers still exposing internal service topologies',
    '🧠 Simulated threat intel: IoT camera firmware signatures updated',
    '🚨 Fake data breach reports are rising - always verify leaks',
    '🛰️ OSINT professionals: Wayback Machine API now rate-limited',
];
let feedIdx = 0;
function renderTicker() {
    const inner = document.getElementById('tickerInner');
    if (!inner) return;
    const chunk = THREAT_FEED.slice(feedIdx, feedIdx + 5).concat(THREAT_FEED.slice(0, Math.max(0, 5 - (THREAT_FEED.length - feedIdx))));
    feedIdx = (feedIdx + 5) % THREAT_FEED.length;
    inner.innerHTML = chunk.map(s => `<span>⚡ ${s}</span>`).join('');
}
setInterval(renderTicker, 8000);

/* ---------- Matrix Canvas Control ---------- */
const MatrixControl = (function () {
    let raf = null;
    let paused = false;
    let speed = 'normal';
    let lastDraw = 0;
    let canvas, ctx, w, h, cols, drops;
    const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';

    function setup() {
        canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        run();
    }
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        cols = Math.floor(w / 18);
        drops = Array(cols).fill(1);
    }
    function draw() {
        if (paused) return;
        if (!ctx) return;
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#00ff66';
        ctx.font = '18px monospace';
        for (let i = 0; i < cols; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 18;
            const y = drops[i] * 18;
            ctx.fillText(text, x, y);
            if (y > h && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    function frame(ts) {
        const interval = speed === 'fast' ? 20 : speed === 'slow' ? 80 : 35;
        if (ts - lastDraw >= interval) {
            draw();
            lastDraw = ts;
        }
        raf = requestAnimationFrame(frame);
    }
    function run() {
        if (!raf) raf = requestAnimationFrame(frame);
    }
    return {
        init: setup,
        setPaused(p) {
            paused = p;
            const el = document.getElementById('matrixPause');
            if (el) el.textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
        },
        setSpeed(s) { speed = s; },
        togglePause() { this.setPaused(!paused); },
        get speed() { return speed; }
    };
})();

function matrixTogglePause() {
    MatrixControl.togglePause();
    playClick();
}
function matrixCycleSpeed() {
    const order = ['normal', 'fast', 'slow', 'normal'];
    const cur = MatrixControl.speed;
    const next = order[(order.indexOf(cur) + 1) % 3];
    MatrixControl.setSpeed(next);
    const el = document.getElementById('matrixSpeed');
    if (el) el.textContent = 'SPEED: ' + next.toUpperCase();
    playClick();
}

/* ---------- Theme ---------- */
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const btn = document.getElementById('themeToggle');
    btn.textContent = document.body.classList.contains('light-mode') ? '🌙 DARK' : '☀ LIGHT';
    playClick();
}

function acknowledgeNotice() {
    const b = document.getElementById('noticeBanner');
    if (b) b.style.display = 'none';
    playClick();
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ---------- Boot ---------- */
function bootApp() {
    initDashboard();
    initDorks();
    renderExtensions();
    MatrixControl.init();
    initSFX();
    if (typeof Terminal !== 'undefined') Terminal.init();
    renderTicker();
    renderHistory();
    setInterval(() => {
        const el = document.getElementById('liveSession');
        if (el) el.textContent = Math.floor(Math.random() * 9000) + 1000;
    }, 3000);
    playSuccess();
}

window.DEFAULT_TARGET = DEFAULT_TARGET;
window.SEARCH_ENGINES = SEARCH_ENGINES;
window.MatrixControl = MatrixControl;
window.CUSTOM_DORKS = CUSTOM_DORKS;
window.bootApp = bootApp;
