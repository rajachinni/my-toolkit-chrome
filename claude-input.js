(function () {
    const PENDING_TEXT_KEY = 'claudePendingText';
    const PENDING_PLAIN_KEY = 'claudePendingPlain';
    const MAX_RETRIES = 50;
    const RETRY_INTERVAL_MS = 200;

    const PREFIX_TEXT =
        'Rewrite in simple language, no em dashes, Fix grammar & improve structure if needed:\n\n';

    function isUsablePrompt(el) {
        if (!el || !el.isConnected) return false;
        const r = el.getBoundingClientRect();
        if (r.width < 48 || r.height < 24) return false;
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') {
            return false;
        }
        return true;
    }

    function findInputElement() {
        const selectors = [
            'div.ProseMirror[contenteditable="plaintext-only"]',
            'div.ProseMirror[contenteditable="true"]',
            '[role="textbox"][contenteditable="plaintext-only"]',
            '[role="textbox"][contenteditable="true"]',
        ];

        let best = null;
        let bestArea = 0;

        for (const sel of selectors) {
            document.querySelectorAll(sel).forEach((el) => {
                if (!isUsablePrompt(el)) return;
                const r = el.getBoundingClientRect();
                const area = r.width * r.height;
                if (area > bestArea) {
                    bestArea = area;
                    best = el;
                }
            });
        }

        if (best) return best;

        document.querySelectorAll('[contenteditable="true"], [contenteditable="plaintext-only"]').forEach((el) => {
            if (!isUsablePrompt(el)) return;
            const r = el.getBoundingClientRect();
            const area = r.width * r.height;
            if (area > bestArea) {
                bestArea = area;
                best = el;
            }
        });

        return best;
    }

    function insertTextIntoInput(inputEl, text) {
        inputEl.focus();
        inputEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });

        try {
            if (document.execCommand('insertText', false, text)) {
                return;
            }
        } catch {
            // continue
        }

        try {
            inputEl.dispatchEvent(
                new InputEvent('beforeinput', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'insertText',
                    data: text,
                })
            );
        } catch {
            // continue
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

    function insertionLooksSuccessful(inputEl, fullText) {
        const body = inputEl.textContent ?? '';
        if (!fullText) return body.length > 0;
        const n = Math.min(40, fullText.length);
        const snippet = fullText.slice(0, n);
        return body.includes(snippet);
    }

    function tryInsertUntilVerified(fullText, storageKeyToClear, attempt = 0) {
        const inputEl = findInputElement();

        if (!inputEl) {
            if (attempt < MAX_RETRIES) {
                setTimeout(() => tryInsertUntilVerified(fullText, storageKeyToClear, attempt + 1), RETRY_INTERVAL_MS);
            }
            return;
        }

        requestAnimationFrame(() => {
            insertTextIntoInput(inputEl, fullText);

            const pauses = [0, 50, 120, 280, 500];
            let i = 0;

            const step = () => {
                if (insertionLooksSuccessful(inputEl, fullText)) {
                    chrome.storage.local.remove(storageKeyToClear);
                    return;
                }
                i += 1;
                if (i >= pauses.length) {
                    chrome.storage.local.remove(storageKeyToClear);
                    return;
                }
                setTimeout(step, pauses[i] - pauses[i - 1]);
            };

            step();
        });
    }

    async function checkForPendingText() {
        const result = await chrome.storage.local.get([PENDING_PLAIN_KEY, PENDING_TEXT_KEY]);
        const plain = result[PENDING_PLAIN_KEY];
        if (plain) {
            tryInsertUntilVerified(plain, PENDING_PLAIN_KEY);
            return;
        }

        const text = result[PENDING_TEXT_KEY];
        if (!text) return;

        tryInsertUntilVerified(PREFIX_TEXT + text, PENDING_TEXT_KEY);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForPendingText);
    } else {
        checkForPendingText();
    }
}());
