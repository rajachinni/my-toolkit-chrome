const ENGINES = [
    { id: 'google',     alias: 'ggl', name: 'Google',     homeUrl: 'https://www.google.com/',            url: 'https://www.google.com/search?q=%s',            color: '#4285F4' },
    { id: 'aimode',     alias: 'gai', name: 'AI Mode',    homeUrl: 'https://www.google.com/',            url: 'https://www.google.com/search?q=%s&udm=50',     color: '#34A853' },
    { id: 'chatgpt',    alias: 'gpt', name: 'ChatGPT',    homeUrl: 'https://chatgpt.com/',                url: 'https://chatgpt.com/?prompt=%s',                 color: '#10a37f' },
    { id: 'claude',     alias: 'cld', name: 'Claude',     homeUrl: 'https://claude.ai/new',              url: 'https://claude.ai/new',                          color: '#D97706' },
    { id: 'youtube',    alias: 'ytb', name: 'YouTube',    homeUrl: 'https://www.youtube.com/',            url: 'https://www.youtube.com/results?search_query=%s', color: '#ff0000' },
    { id: 'perplexity', alias: 'ppx', name: 'Perplexity', homeUrl: 'https://www.perplexity.ai/',        url: 'https://www.perplexity.ai/search?q=%s',          color: '#20B2AA' },
    { id: 'grok',       alias: 'grk', name: 'Grok',       homeUrl: 'https://grok.com/',                  url: 'https://grok.com/?q=%s',                         color: '#9ca3af' },
    { id: 'amazon',     alias: 'amz', name: 'Amazon',     homeUrl: 'https://www.amazon.com/',            url: 'https://www.amazon.com/s?k=%s',                  color: '#FF9900' },
    { id: 'reddit',     alias: 'rdt', name: 'Reddit',     homeUrl: 'https://www.reddit.com/',            url: 'https://www.reddit.com/search/?q=%s',            color: '#FF4500' },
];

const ALIAS_TO_ENGINE = new Map(ENGINES.map(engine => [engine.alias, engine]));
const ALIAS_ONLY_ENGINE_IDS = new Set(['youtube', 'amazon', 'reddit']);
const VISIBLE_ENGINES = ENGINES.filter(engine => !ALIAS_ONLY_ENGINE_IDS.has(engine.id));

const STORAGE_KEY = 'selectedSearchEngine';

let activeEngineId = VISIBLE_ENGINES[0].id;

function getActiveEngine() {
    return VISIBLE_ENGINES.find(e => e.id === activeEngineId) || VISIBLE_ENGINES[0];
}

function applyEngineTheme(engine) {
    document.documentElement.style.setProperty('--engine-color', engine.color);
}

function renderEngines() {
    const container = document.getElementById('engineButtons');
    container.innerHTML = VISIBLE_ENGINES.map(engine => `
        <button
            class="engine-btn${engine.id === activeEngineId ? ' active' : ''}"
            data-engine="${engine.id}"
            style="--btn-color: ${engine.color}"
            title="${engine.name}"
        >
            <span class="engine-dot"></span>
            ${engine.name}
        </button>
    `).join('');

    container.querySelectorAll('.engine-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.dataset.engine;
            const engine = VISIBLE_ENGINES.find(eng => eng.id === id);
            if (engine) {
                setActiveEngine(id);
                window.location.href = engine.homeUrl;
            }
        });
    });
}

function setActiveEngine(id, persist = true) {
    const nextEngine = VISIBLE_ENGINES.find(engine => engine.id === id) || VISIBLE_ENGINES[0];
    activeEngineId = nextEngine.id;
    renderEngines();
    applyEngineTheme(getActiveEngine());

    if (persist) {
        chrome.storage.sync.set({ [STORAGE_KEY]: activeEngineId });
    }
}

function parseAliasedQuery(rawQuery) {
    const parts = rawQuery.trim().split(/\s+/);
    if (parts.length < 2) {
        return null;
    }

    const alias = parts[parts.length - 1].toLowerCase();
    const engine = ALIAS_TO_ENGINE.get(alias);
    if (!engine) {
        return null;
    }

    const queryWithoutAlias = parts.slice(0, -1).join(' ').trim();
    if (!queryWithoutAlias) {
        return null;
    }

    return { query: queryWithoutAlias, engine };
}

function shouldAutoSearchOnAlias(rawQuery) {
    return Boolean(parseAliasedQuery(rawQuery));
}

async function performSearch(rawQuery) {
    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) {
        return;
    }

    const aliased = parseAliasedQuery(trimmedQuery);
    const query = aliased ? aliased.query : trimmedQuery;
    const engine = aliased ? aliased.engine : getActiveEngine();

    if (engine.id === 'claude') {
        await chrome.storage.local.set({ claudePendingPlain: query });
        window.location.href = 'https://claude.ai/new';
        return;
    }

    const url = engine.url.replace('%s', encodeURIComponent(query));
    window.location.href = url;
}

function autoGrow(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

async function loadSavedEngine() {
    try {
        const result = await chrome.storage.sync.get([STORAGE_KEY]);
        const saved = result[STORAGE_KEY];
        if (saved && VISIBLE_ENGINES.find(e => e.id === saved)) {
            activeEngineId = saved;
        }
    } catch {
        // storage not available — use default
    }
}

async function init() {
    await loadSavedEngine();

    renderEngines();
    applyEngineTheme(getActiveEngine());

    const input = document.getElementById('searchInput');

    input.addEventListener('input', () => {
        autoGrow(input);
        if (shouldAutoSearchOnAlias(input.value)) {
            performSearch(input.value);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(input.value);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const idx = VISIBLE_ENGINES.findIndex(e => e.id === activeEngineId);
            if (e.shiftKey) {
                const prev = VISIBLE_ENGINES[(idx - 1 + VISIBLE_ENGINES.length) % VISIBLE_ENGINES.length];
                setActiveEngine(prev.id);
            } else {
                const next = VISIBLE_ENGINES[(idx + 1) % VISIBLE_ENGINES.length];
                setActiveEngine(next.id);
            }
        }
    });

    input.focus();
}

document.addEventListener('DOMContentLoaded', init);
