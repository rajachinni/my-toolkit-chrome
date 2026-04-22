const ENGINES = [
    { id: 'google',     alias: 'ggl', name: 'Google',     homeUrl: 'https://www.google.com/',            url: 'https://www.google.com/search?q=%s',            color: '#4285F4' },
    { id: 'aimode',     alias: 'gai', name: 'AI Mode',    homeUrl: 'https://www.google.com/',            externalUrl: 'https://www.google.com/search?q=&udm=50', url: 'https://www.google.com/search?q=%s&udm=50',     color: '#34A853' },
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

const CHATGPT_LOGO_SVG = `<svg class="engine-btn-icon" viewBox="0 0 320 320" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z"/></svg>`;

const CLAUDE_LOGO_SVG = `<svg class="engine-btn-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="#D97757" d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"/></svg>`;

const GROK_LOGO_SVG = `<svg class="engine-btn-icon" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true" focusable="false" fill="none"><path fill="currentColor" fill-rule="nonzero" d="M18.542 30.532l15.956-11.776c.783-.576 1.902-.354 2.274.545 1.962 4.728 1.084 10.411-2.819 14.315-3.903 3.901-9.333 4.756-14.299 2.808l-5.423 2.511c7.778 5.315 17.224 4 23.125-1.903 4.682-4.679 6.131-11.058 4.775-16.812l.011.011c-1.966-8.452.482-11.829 5.501-18.735C47.759 1.332 47.88 1.166 48 1l-6.602 6.599V7.577l-22.86 22.958M15.248 33.392c-5.582-5.329-4.619-13.579.142-18.339 3.521-3.522 9.294-4.958 14.331-2.847l5.412-2.497c-.974-.704-2.224-1.46-3.659-1.994-6.478-2.666-14.238-1.34-19.505 3.922C6.904 16.701 5.31 24.488 8.045 31.133c2.044 4.965-1.307 8.48-4.682 12.023C2.164 44.411.967 45.67 0 47l15.241-13.608"/></svg>`;

const GOOGLE_LOGO_SVG = `<svg class="engine-btn-icon engine-btn-icon--google" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;

const AI_MODE_LOGO_HTML = '<img class="engine-btn-icon engine-btn-icon--img" src="assets/ai-mode.png" width="20" height="20" alt="" />';

const EXTERNAL_LINK_SVG = `<svg class="engine-external-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;

const PERPLEXITY_LOGO_SVG = `<svg class="engine-btn-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="#22B8CD" fill-rule="nonzero" d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"/></svg>`;

const ENGINE_LOGO_HTML = {
    chatgpt: CHATGPT_LOGO_SVG,
    claude: CLAUDE_LOGO_SVG,
    grok: GROK_LOGO_SVG,
    google: GOOGLE_LOGO_SVG,
    aimode: AI_MODE_LOGO_HTML,
    perplexity: PERPLEXITY_LOGO_SVG,
};

function getEngineLogoHtml(engineId) {
    return ENGINE_LOGO_HTML[engineId] || '';
}

const STORAGE_KEY = 'selectedSearchEngine';

let activeEngineId = VISIBLE_ENGINES[0].id;

function getActiveEngine() {
    return ENGINES.find(e => e.id === activeEngineId) || VISIBLE_ENGINES[0];
}

function applyEngineTheme(engine) {
    document.documentElement.style.setProperty('--engine-color', engine.color);
}

function updateEnginePrefix(engine) {
    const prefix = document.getElementById('enginePrefix');
    if (!prefix) {
        return;
    }

    const name = engine?.name || '';
    prefix.title = name;
    const logoHtml = getEngineLogoHtml(engine?.id);
    if (logoHtml) {
        prefix.innerHTML = logoHtml;
    } else {
        const initial = name.trim().charAt(0).toUpperCase() || '?';
        prefix.textContent = initial;
    }
}

function homeUrlWithoutQuery(homeUrl) {
    try {
        const u = new URL(homeUrl);
        u.search = '';
        return u.href;
    } catch {
        return homeUrl;
    }
}

function renderEngines() {
    const container = document.getElementById('engineButtons');
    container.innerHTML = VISIBLE_ENGINES.map(engine => {
        const logo = getEngineLogoHtml(engine.id);
        const openUrl = engine.externalUrl || homeUrlWithoutQuery(engine.homeUrl);
        return `
        <div class="engine-cell" data-engine="${engine.id}">
            <button
                type="button"
                class="engine-btn"
                data-engine="${engine.id}"
                title="${engine.name}"
            >
                ${logo}
                <span class="engine-btn-text">${engine.name}</span>
            </button>
            <a
                class="engine-external"
                href="${openUrl}"
                title="Open ${engine.name}"
                aria-label="Open ${engine.name}"
            >${EXTERNAL_LINK_SVG}</a>
        </div>
    `;
    }).join('');

    container.querySelectorAll('.engine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.engine;
            if (VISIBLE_ENGINES.some(eng => eng.id === id)) {
                setActiveEngine(id);
            }
        });
    });
}

function setActiveEngine(id, persist = true) {
    const nextEngine = ENGINES.find(engine => engine.id === id) || VISIBLE_ENGINES[0];
    activeEngineId = nextEngine.id;
    renderEngines();
    applyEngineTheme(getActiveEngine());
    updateEnginePrefix(getActiveEngine());

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

function parseLeadingAlias(rawQuery) {
    const trimmedStartQuery = rawQuery.trimStart();
    if (!trimmedStartQuery) {
        return null;
    }

    const [firstPart, ...rest] = trimmedStartQuery.split(/\s+/);
    const engine = ALIAS_TO_ENGINE.get(firstPart.toLowerCase());
    if (!engine) {
        return null;
    }

    return {
        engine,
        query: rest.join(' ').trim(),
    };
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

function getGreetingByTime() {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'Good Morning';
    }
    if (hour < 18) {
        return 'Good Afternoon';
    }
    return 'Good Evening';
}

function renderGreeting() {
    const greetingText = document.getElementById('greetingText');
    if (!greetingText) {
        return;
    }
    greetingText.textContent = `${getGreetingByTime()}, Teja!`;
}

async function loadSavedEngine() {
    try {
        const result = await chrome.storage.sync.get([STORAGE_KEY]);
        const saved = result[STORAGE_KEY];
        if (saved && ENGINES.find(e => e.id === saved)) {
            activeEngineId = saved;
        }
    } catch {
        // storage not available — use default
    }
}

async function init() {
    await loadSavedEngine();

    renderGreeting();
    renderEngines();
    applyEngineTheme(getActiveEngine());
    updateEnginePrefix(getActiveEngine());

    const input = document.getElementById('searchInput');

    input.addEventListener('input', () => {
        autoGrow(input);
        const leadingAlias = parseLeadingAlias(input.value);
        if (leadingAlias) {
            setActiveEngine(leadingAlias.engine.id);
            input.value = leadingAlias.query;
            autoGrow(input);
            return;
        }

        if (shouldAutoSearchOnAlias(input.value)) {
            performSearch(input.value);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            performSearch(input.value);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const idx = VISIBLE_ENGINES.findIndex(e => e.id === activeEngineId);
            if (e.shiftKey) {
                const prev = idx === -1
                    ? VISIBLE_ENGINES[VISIBLE_ENGINES.length - 1]
                    : VISIBLE_ENGINES[(idx - 1 + VISIBLE_ENGINES.length) % VISIBLE_ENGINES.length];
                setActiveEngine(prev.id);
            } else {
                const next = idx === -1
                    ? VISIBLE_ENGINES[0]
                    : VISIBLE_ENGINES[(idx + 1) % VISIBLE_ENGINES.length];
                setActiveEngine(next.id);
            }
        }
    });

    input.focus();
}

document.addEventListener('DOMContentLoaded', init);
