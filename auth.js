/* ============================================================
   CyberDork OSINT Suite v7.0
   auth.js - LocalStorage Authentication & Session Manager
   ============================================================ */

const AUTH_KEY = 'cdos_users_v7';
const SESSION_KEY = 'cdos_session_v7';
const HISTORY_KEY = 'cdos_history_v7';
const VISIT_KEY = 'cdos_visits_v7';

const _memStore = {};
const safeStorage = {
    getItem(k) { try { return localStorage.getItem(k); } catch (e) { return _memStore[k] || null; } },
    setItem(k, v) { try { localStorage.setItem(k, v); } catch (e) { _memStore[k] = v; } },
    removeItem(k) { try { localStorage.removeItem(k); } catch (e) { delete _memStore[k]; } }
};

function getUsers() {
    try { return JSON.parse(safeStorage.getItem(AUTH_KEY) || '{}'); }
    catch (e) { return {}; }
}
function saveUsers(u) { safeStorage.setItem(AUTH_KEY, JSON.stringify(u)); }

function getSession() {
    try { return JSON.parse(safeStorage.getItem(SESSION_KEY) || 'null'); }
    catch (e) { return null; }
}
function setSession(s) { safeStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { safeStorage.removeItem(SESSION_KEY); }

function isLoggedIn() { return !!getSession(); }

function getCurrentUser() {
    const s = getSession();
    if (!s) return null;
    const users = getUsers();
    return users[s.username] || null;
}

function getHistory() {
    const s = getSession();
    if (!s) return [];
    try { return JSON.parse(safeStorage.getItem(HISTORY_KEY + '_' + s.username) || '[]'); }
    catch (e) { return []; }
}

function saveHistory(list) {
    const s = getSession();
    if (!s) return;
    safeStorage.setItem(HISTORY_KEY + '_' + s.username, JSON.stringify(list.slice(0, 200)));
}

function addToHistory(query, type) {
    if (!query) return;
    const s = getSession();
    if (!s) return;
    const item = { query: String(query).slice(0, 300), type: type || 'search', time: Date.now() };
    let list = getHistory().filter(h => h.query !== item.query);
    list.unshift(item);
    saveHistory(list);
}

function clearHistory() {
    const s = getSession();
    if (!s) return;
    safeStorage.removeItem(HISTORY_KEY + '_' + s.username);
    renderHistory();
    if (window.toast) toast('History cleared', 'ok');
}

function hashPassword(pw) {
    let h = 5381;
    for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(16) + pw.length;
}

/* ---------- Auth UI ---------- */
function toggleAuth(showSignup) {
    document.getElementById('loginBox').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signupBox').style.display = showSignup ? 'block' : 'none';
    playClick();
}

function handleSignup() {
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value.trim();
    if (!u || !p) return alert('Please enter username and password.');
    if (p.length < 4) return alert('Password must be at least 4 characters.');
    const users = getUsers();
    if (users[u]) return alert('Username already exists. Please login.');
    users[u] = { username: u, hash: hashPassword(p), created: Date.now() };
    saveUsers(users);
    alert('Registration successful. You can now login.');
    toggleAuth(false);
}

function handleLogin() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value.trim();
    const users = getUsers();
    const stored = users[u];
    if (stored && stored.hash === hashPassword(p)) {
        setSession({ username: u, loginTime: Date.now() });
        enterApp();
    } else {
        alert('Incorrect username or password.');
    }
}

function handleGuestLogin() {
    setSession({ username: 'guest-' + Math.random().toString(36).slice(2, 8), loginTime: Date.now() });
    enterApp();
}

function handleLogout() {
    clearSession();
    location.reload();
}

function enterApp() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('appShell').style.display = 'block';
    incrementVisitCount();
    updateUserUI();
    renderHistory();
    initSessionTimer();
    if (window.bootApp) bootApp();
}

/* ---------- Profile / session ---------- */
function updateUserUI() {
    const s = getSession();
    const el = document.getElementById('sessionUser');
    if (el) el.textContent = s ? s.username : 'guest';
    const av = document.getElementById('profileAvatar');
    if (av) av.textContent = s ? s.username.slice(0, 1).toUpperCase() : 'G';
    const full = document.getElementById('profileUsername');
    if (full) full.textContent = s ? s.username : 'guest';
    const created = document.getElementById('profileCreated');
    if (created) created.textContent = s ? new Date(s.loginTime).toLocaleString() : '-';
}

function initSessionTimer() {
    const s = getSession();
    if (!s) return;
    const start = s.loginTime;
    const el = document.getElementById('sessionUptime');
    if (el) {
        setInterval(() => {
            const secs = Math.floor((Date.now() - start) / 1000);
            const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s2 = secs % 60;
            el.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s2).padStart(2, '0');
        }, 1000);
    }
}

/* ---------- Visitor counter ---------- */
function incrementVisitCount() {
    let count = parseInt(safeStorage.getItem(VISIT_KEY) || '0', 10) + 1;
    safeStorage.setItem(VISIT_KEY, String(count));
    const el = document.getElementById('visitCount');
    if (el) el.textContent = count;
}

/* ---------- History rendering ---------- */
function renderHistory() {
    const list = getHistory();
    const el = document.getElementById('historyList');
    if (!el) return;
    if (!list.length) {
        el.innerHTML = '<div class="history-item" style="color:rgba(0,255,0,0.3);cursor:default;">No saved targets yet.</div>';
        return;
    }
    el.innerHTML = list.map(h => `
        <div class="history-item">
            <span style="cursor:pointer" onclick="useHistoryItem(${list.indexOf(h)})">${escapeHtml(h.query)} <span style="color:rgba(0,188,255,0.6);font-size:10px">[${h.type}]</span></span>
            <span class="h-time">${new Date(h.time).toLocaleTimeString()}</span>
        </div>`).join('');
}

function useHistoryItem(idx) {
    const list = getHistory();
    if (!list[idx]) return;
    const el = document.getElementById('historyQuery');
    if (el) el.value = list[idx].query;
    renderHistory();
}

function exportHistoryJSON() {
    const list = getHistory();
    downloadFile('cyberdork_history.json', JSON.stringify({ exported: new Date().toISOString(), entries: list }, null, 2));
    playClick();
}
function exportHistoryCSV() {
    const list = getHistory();
    const rows = [['query', 'type', 'time']].concat(list.map(h => [h.query, h.type, new Date(h.time).toISOString()]));
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    downloadFile('cyberdork_history.csv', csv);
    playClick();
}
function exportTargets() {
    addToHistory(document.getElementById('historyQuery').value || '', 'export');
    exportHistoryJSON();
}

function downloadFile(name, content) {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- Export dork / report generators ---------- */
function exportDorksJSON() {
    const data = { exported: new Date().toISOString(), count: DORKS_DB.length, dorks: DORKS_DB };
    downloadFile('cyberdork_dorks.json', JSON.stringify(data, null, 2));
    playClick();
}
function exportExtensionsJSON() {
    const data = { exported: new Date().toISOString(), categories: EXTENSION_CATEGORIES };
    downloadFile('cyberdork_extensions.json', JSON.stringify(data, null, 2));
    playClick();
}
function exportDorksCSV() {
    const rows = [['title', 'category', 'dork']].concat(DORKS_DB.map(d => [d.title, d.category, d.dork]));
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    downloadFile('cyberdork_dorks.csv', csv);
    playClick();
}

function generateReport() {
    const target = document.getElementById('reportTarget').value || window.DEFAULT_TARGET;
    const type = document.getElementById('reportType').value;
    let lines = [];
    const now = new Date().toLocaleString();
    lines.push('==============================================');
    lines.push('  CYBERDORK OSINT SUITE v7.0 - REPORT');
    lines.push('  Generated: ' + now);
    lines.push('  Target: ' + target);
    lines.push('==============================================');
    if (type === 'dorks') {
        const sample = DORKS_DB.slice(0, 120);
        for (const d of sample) lines.push(`[${d.category}] ${d.title}\n  ${d.dork}`);
        lines.push('...');
    } else if (type === 'extensions') {
        for (const [cat, exts] of Object.entries(EXTENSION_CATEGORIES)) {
            lines.push(`[${cat}] (${exts.length})`);
            lines.push('  ' + exts.slice(0, 60).join(' '));
        }
    } else {
        const engines = ['Google', 'Bing', 'DuckDuckGo', 'Yandex', 'Shodan', 'Ecosia', 'Startpage'];
        lines.push('Quick Search Matrix for target:');
        for (const e of engines) lines.push(`  ${e}: https://www.google.com/search?q=${encodeURIComponent(target)}`);
    }
    lines.push('==============================================');
    const text = lines.join('\n');
    downloadFile('cyberdork_report_' + Date.now() + '.txt', text);
    toast('Report generated', 'ok');
    playClick();
}

/* ---------- Import custom dorks ---------- */
function importDorksFromText() {
    const raw = document.getElementById('customDorkInput').value.trim();
    if (!raw) return alert('Paste a JSON array of dorks first.');
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return alert('Invalid JSON: ' + e.message); }
    if (!Array.isArray(parsed)) return alert('Expected a JSON array.');
    const existing = JSON.parse(safeStorage.getItem('cdos_custom_dorks') || '[]');
    const all = existing.concat(parsed);
    safeStorage.setItem('cdos_custom_dorks', JSON.stringify(all));
    document.getElementById('customDorkInput').value = '';
    if (window.refreshCustomDorks) window.refreshCustomDorks();
    toast('Imported ' + parsed.length + ' custom dorks', 'ok');
    playClick();
}

function exportCustomDorks() {
    const all = JSON.parse(safeStorage.getItem('cdos_custom_dorks') || '[]');
    downloadFile('cyberdork_custom_dorks.json', JSON.stringify(all, null, 2));
    playClick();
}

function clearCustomDorks() {
    if (!confirm('Clear all imported custom dorks?')) return;
    safeStorage.removeItem('cdos_custom_dorks');
    if (window.refreshCustomDorks) window.refreshCustomDorks();
    toast('Custom dorks cleared', 'ok');
}
