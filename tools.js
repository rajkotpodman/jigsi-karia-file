/* ============================================================
   CyberDork OSINT Suite v7.0
   tools.js - Cyber Terminal CLI, SFX Synthesizer, Dork Builder,
              Hash Identifier
   ============================================================ */

/* ---------- Web Audio Synthesizer (Cyber SFX) ---------- */
const SFX = {
    ctx: null,
    muted: false,
    ensure() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    beep(freq, dur, type, vol) {
        this.ensure();
        if (!this.ctx || this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq || 880;
        gain.gain.setValueAtTime(vol || 0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (dur || 0.08));
        osc.connect(gain).connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + (dur || 0.08));
    },
    click() { this.beep(1200, 0.05, 'square', 0.05); },
    hover() { this.beep(1800, 0.03, 'sine', 0.03); },
    type() { this.beep(900 + Math.random() * 500, 0.02, 'square', 0.02); },
    success() { this.beep(660, 0.12, 'sine', 0.07); setTimeout(() => this.beep(990, 0.14, 'sine', 0.07), 90); },
    error() { this.beep(180, 0.2, 'sawtooth', 0.06); },
    toggle() {
        this.muted = !this.muted;
        const el = document.getElementById('sfxToggle');
        if (el) {
            el.classList.toggle('muted', this.muted);
            el.textContent = this.muted ? '🔇 SFX OFF' : '🔊 SFX ON';
        }
        return this.muted;
    }
};

function playClick() { SFX.click(); }
function playType() { SFX.type(); }
function playSuccess() { SFX.success(); }
function playError() { SFX.error(); }

function initSFX() {
    const el = document.getElementById('sfxToggle');
    if (el) el.addEventListener('click', () => SFX.toggle());
    document.addEventListener('click', (e) => {
        if (e.target.closest('button')) playClick();
    });
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('button, .dork-btn, .ext-btn')) SFX.hover();
    });
}

function toast(msg, kind) {
    let box = document.getElementById('toastBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toastBox';
        box.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10001;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.style.cssText = 'background:rgba(8,14,26,0.95);border:1px solid ' +
        (kind === 'ok' ? '#00ff00' : kind === 'err' ? '#ff0055' : '#00bcff') +
        ';color:' + (kind === 'ok' ? '#00ff00' : kind === 'err' ? '#ff8899' : '#00bcff') +
        ';padding:10px 16px;border-radius:8px;font-family:"Courier New",monospace;font-size:12px;font-weight:700;box-shadow:0 0 12px rgba(0,255,0,0.25);';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

/* ---------- Hash Identifier ---------- */
const HASH_PATTERNS = [
    { name: 'MD5', regex: /^[a-f0-9]{32}$/i, len: 32 },
    { name: 'SHA-1', regex: /^[a-f0-9]{40}$/i, len: 40 },
    { name: 'SHA-224', regex: /^[a-f0-9]{56}$/i, len: 56 },
    { name: 'SHA-256', regex: /^[a-f0-9]{64}$/i, len: 64 },
    { name: 'SHA-384', regex: /^[a-f0-9]{96}$/i, len: 96 },
    { name: 'SHA-512', regex: /^[a-f0-9]{128}$/i, len: 128 },
    { name: 'NTLM', regex: /^[a-f0-9]{32}$/i, len: 32 },
    { name: 'MySQL 4.1', regex: /^[a-f0-9*]{40}$/i, len: 40 },
    { name: 'LM Hash', regex: /^[a-f0-9]{32}$/i, len: 32 },
    { name: 'bcrypt', regex: /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/, len: 60 },
    { name: 'SHA-512crypt', regex: /^\$6\$/, len: 106 },
    { name: 'SHA-256crypt', regex: /^\$5\$/, len: 63 },
    { name: 'JWT Token', regex: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, len: 0 },
    { name: 'Base64', regex: /^[A-Za-z0-9+/]+={0,2}$/, len: 0 },
    { name: 'UUID', regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, len: 36 },
];

function identifyHash() {
    const input = document.getElementById('hashInput').value.trim();
    const out = document.getElementById('hashResult');
    if (!input) { out.innerHTML = '<span style="color:rgba(0,255,0,0.4)">Type a hash or string to analyze.</span>'; return; }
    const matches = HASH_PATTERNS.filter(p => p.regex.test(input));
    let html = 'Length: <b>' + input.length + '</b> chars<br>';
    if (matches.length) {
        html += 'Possible types: ' + matches.map(m => '<span style="color:#00bcff">' + m.name + '</span>').join(', ');
    } else {
        html += 'No known hash pattern matched (could be a custom hash or plain text).';
    }
    out.innerHTML = html;
    playClick();
}

function copyHashResult() {
    const out = document.getElementById('hashResult');
    if (out) {
        navigator.clipboard.writeText(out.innerText);
        toast('Copied analysis', 'ok');
    }
}

/* ---------- Custom Dork Builder ---------- */
const DorkBuilder = {
    build() {
        const target = (document.getElementById('builderTarget').value || window.DEFAULT_TARGET).trim();
        const site = document.getElementById('builderSite').value.trim();
        const filetype = document.getElementById('builderFiletype').value.trim();
        const inurl = document.getElementById('builderInurl').value.trim();
        const intitle = document.getElementById('builderIntitle').value.trim();
        const ext = document.getElementById('builderExt').value.trim();
        const exclude = document.getElementById('builderExclude').value.trim();
        const wildcard = document.getElementById('builderWildcard').value.trim();
        const quoteTarget = document.getElementById('builderQuote').checked;

        let parts = [];
        let targetPart = target || 'target';
        if (quoteTarget) targetPart = '"' + targetPart + '"';
        parts.push(targetPart);
        if (wildcard) parts.push('*' + wildcard + '*');
        if (site) parts.push('site:' + site);
        if (filetype) parts.push('filetype:' + filetype);
        if (ext) parts.push('ext:' + ext);
        if (inurl) parts.push('inurl:' + inurl);
        if (intitle) parts.push('intitle:' + intitle);
        if (exclude) parts.push('-exclude:' + exclude.split(/[,\s]+/).join(' -exclude:'));

        const query = parts.join(' ');
        document.getElementById('builderOutput').value = query;
        const preview = document.getElementById('builderPreview');
        if (preview) preview.textContent = query || '// assembled query appears here';
        return query;
    },
    copy() {
        const val = document.getElementById('builderOutput').value;
        if (!val) return;
        navigator.clipboard.writeText(val);
        toast('Query copied', 'ok');
        playClick();
    },
    run() {
        const q = document.getElementById('builderOutput').value;
        if (!q) return toast('Build a query first', 'err');
        runSearch(q, selectedEngine || 'google');
        addToHistory(q, 'builder');
    },
    runAll() {
        const q = document.getElementById('builderOutput').value;
        if (!q) return toast('Build a query first', 'err');
        multiEngineRun(q);
        addToHistory(q, 'builder');
    }
};

function builderInputChanged() { DorkBuilder.build(); }

/* ---------- Cyber Terminal CLI ---------- */
const Terminal = {
    buffer: [],
    speed: 'normal',
    engine: 'google',
    init() {
        const input = document.getElementById('termInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handle(input.value);
            });
        }
        this.print('CyberDork Terminal v7.0 - type "help" for commands.', 'dim');
        this.print('Target default: ' + window.DEFAULT_TARGET, 'dim');
    },
    print(text, cls) {
        const out = document.getElementById('termOutput');
        if (!out) return;
        const line = document.createElement('div');
        line.className = 'term-line ' + (cls || '');
        line.textContent = text;
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
    },
    printHtml(html, cls) {
        const out = document.getElementById('termOutput');
        if (!out) return;
        const line = document.createElement('div');
        line.className = 'term-line ' + (cls || '');
        line.innerHTML = html;
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
    },
    clear() {
        const out = document.getElementById('termOutput');
        if (out) out.innerHTML = '';
        this.print('-- terminal cleared --', 'dim');
    },
    handle(raw) {
        const input = document.getElementById('termInput');
        const cmd = raw.trim();
        this.print('root@cyberdork:~$ ' + cmd, '');
        if (input) input.value = '';
        playType();
        if (!cmd) return;
        const parts = cmd.split(/\s+/);
        const name = parts[0].toLowerCase();
        const args = {};
        for (let i = 1; i < parts.length; i++) {
            const p = parts[i];
            if (p.startsWith('--')) {
                const key = p.slice(2);
                const val = parts[i + 1] && !parts[i + 1].startsWith('--') ? parts[i + 1] : '';
                args[key] = val;
                if (val) i++;
            }
        }
        switch (name) {
            case 'help':
                this.help();
                break;
            case 'clear':
                this.clear();
                break;
            case 'dork':
                this.cmdDork(args);
                break;
            case 'ext':
                this.cmdExt(args);
                break;
            case 'multi':
                this.cmdMulti(args);
                break;
            case 'matrix':
                this.cmdMatrix(args);
                break;
            case 'whois':
                this.cmdWhois(args);
                break;
            case 'search':
                this.cmdSearch(args);
                break;
            case 'engine':
                if (args.engine) { this.engine = args.engine; this.print('Engine set to: ' + this.engine, 'ok'); }
                else this.print('Usage: engine --engine google|bing|duckduckgo|yandex|shodan', 'warn');
                break;
            case 'stats':
                this.cmdStats();
                break;
            case 'about':
                this.print('CyberDork OSINT Suite v7.0 - Ultimate Matrix Edition', 'ok');
                this.print('Author: jigsi_karia | Data: ' + DORKS_DB.length + ' dorks, ' + EXTENSION_TOTAL + ' extensions', '');
                break;
            case 'export':
                exportDorksJSON();
                this.print('Exported dork database JSON.', 'ok');
                break;
            default:
                this.print('Unknown command: ' + name + ' (try "help")', 'err');
        }
    },
    help() {
        this.printHtml('Commands: <span style="color:#00bcff">dork, ext, multi, search, matrix, whois, engine, stats, export, clear, about, help</span>', '');
        this.printHtml('  <b>dork</b> --target &lt;val&gt; --type &lt;cloud|docs|software|media|security|...&gt;', '');
        this.printHtml('  <b>ext</b> --type &lt;pdf|apk|env|sql|mkv|...&gt; --search &lt;keyword&gt;', '');
        this.printHtml('  <b>multi</b> --query &lt;keyword&gt;', '');
        this.printHtml('  <b>matrix</b> --speed &lt;slow|normal|fast|pause&gt;', '');
        this.printHtml('  <b>search</b> --q &lt;query&gt; --engine &lt;engine&gt;', '');
        this.printHtml('  <b>whois</b> --target &lt;domain&gt;', '');
        this.printHtml('  <b>engine</b> --engine &lt;google|bing|duckduckgo|yandex|shodan|ecosia|startpage&gt;', '');
        this.printHtml('  <b>stats</b> | <b>export</b> | <b>clear</b> | <b>about</b>', '');
    },
    cmdDork(args) {
        const target = args.target || window.DEFAULT_TARGET;
        const type = args.type || 'cloud';
        const dorks = DORKS_DB.filter(d => d.category === type);
        if (!dorks.length) {
            this.print('No dorks found for type "' + type + '". Available: ' + [...new Set(DORKS_DB.map(d => d.category))].join(', '), 'warn');
            return;
        }
        const picked = dorks.slice(0, 6);
        this.print('Executing ' + picked.length + ' dorks for target "' + target + '"...', 'ok');
        picked.forEach((d, i) => {
            setTimeout(() => {
                const query = target + ' ' + d.dork;
                runSearch(query, this.engine);
                this.print('[' + (i + 1) + '/' + picked.length + '] ' + d.title, '');
            }, i * 350);
        });
        addToHistory(target, 'dork:' + type);
    },
    cmdExt(args) {
        const type = args.type;
        const search = args.search || window.DEFAULT_TARGET;
        if (!type) return this.print('Usage: ext --type pdf --search <keyword>', 'warn');
        const query = search + ' filetype:' + type;
        runSearch(query, this.engine);
        this.print('Searching: ' + query, 'ok');
        addToHistory(search, 'ext:' + type);
    },
    cmdMulti(args) {
        const q = args.query || window.DEFAULT_TARGET;
        this.print('Launching multi-engine matrix for: ' + q, 'ok');
        multiEngineRun(q);
        addToHistory(q, 'multi');
    },
    cmdMatrix(args) {
        const sp = (args.speed || 'normal').toLowerCase();
        if (sp === 'pause') {
            window.MatrixControl.setPaused(true);
            this.print('Matrix rain paused.', 'warn');
        } else if (sp === 'slow' || sp === 'normal' || sp === 'fast') {
            window.MatrixControl.setPaused(false);
            window.MatrixControl.setSpeed(sp);
            this.print('Matrix speed set to: ' + sp, 'ok');
        } else {
            this.print('Usage: matrix --speed slow|normal|fast|pause', 'warn');
        }
    },
    cmdWhois(args) {
        const t = args.target || window.DEFAULT_TARGET;
        this.print('Launching WHOIS / IP OSINT stack for: ' + t, 'ok');
        openQuickLink('whois', t);
        addToHistory(t, 'whois');
    },
    cmdSearch(args) {
        const q = args.q || window.DEFAULT_TARGET;
        const eng = args.engine || this.engine;
        runSearch(q, eng);
        this.print('Searching "' + q + '" on ' + eng, 'ok');
        addToHistory(q, 'search');
    },
    cmdStats() {
        this.printHtml('Database stats: ' + DORKS_DB.length + ' dorks | ' + EXTENSION_TOTAL + ' extensions | ' +
            Object.keys(EXTENSION_CATEGORIES).length + ' categories', 'ok');
        this.printHtml('Session: ' + (getSession() ? getSession().username : 'guest'), '');
    }
};

function termInputChanged() { playType(); }
