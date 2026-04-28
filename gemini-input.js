(function () {
    const PENDING_PLAIN_KEY = 'geminiPendingPlain';
    const MAX_RETRIES = 50;
    const RETRY_INTERVAL_MS = 200;

    function isUsablePrompt(el) {
        if (!el || !el.isConnected) return false;
        const r = el.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
    }

    function findInputElement() {
        const selectors = [
            '[aria-label="Enter a prompt here"][contenteditable="true"]',
            '[aria-label="Enter a prompt here"][contenteditable="plaintext-only"]',
            'rich-textarea [contenteditable="true"]',
            '[role="textbox"][contenteditable="true"]',
            '[role="textbox"][contenteditable="plaintext-only"]',
            'div.ql-editor[contenteditable="true"]',
            'textarea',
            '[contenteditable="true"]',
        ];

        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (isUsablePrompt(el)) {
                return el;
            }
        }

        return null;
    }

    function insertTextIntoInput(inputEl, text) {
        inputEl.focus();
        inputEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });

        try {
            if (document.execCommand('insertText', false, text)) {
                return;
            }
        } catch {
            // continue to paste fallback
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', text);
        inputEl.dispatchEvent(
            new ClipboardEvent('paste', {
                clipboardData: dataTransfer,
                bubbles: true,
                cancelable: true,
            })
        );
    }

    function tryInsert(text, attempt = 0) {
        const inputEl = findInputElement();

        if (inputEl) {
            requestAnimationFrame(() => {
                insertTextIntoInput(inputEl, text);
            });
            return;
        }

        if (attempt < MAX_RETRIES) {
            setTimeout(() => tryInsert(text, attempt + 1), RETRY_INTERVAL_MS);
        }
    }

    async function checkForPendingText() {
        const result = await chrome.storage.local.get(PENDING_PLAIN_KEY);
        const text = result[PENDING_PLAIN_KEY];
        if (!text) return;

        await chrome.storage.local.remove(PENDING_PLAIN_KEY);
        tryInsert(text);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForPendingText);
    } else {
        checkForPendingText();
    }
}());
