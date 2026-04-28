(function () {
    const PENDING_TEXT_KEY = 'claudePendingText';
    const PENDING_PLAIN_KEY = 'claudePendingPlain';
    const MAX_RETRIES = 50;
    const RETRY_INTERVAL_MS = 200;

    const PREFIX_TEXT =
        'Rewrite in simple language, no em dashes, Fix grammar & improve structure if needed:\n\n';

    function findInputElement() {
        return (
            document.querySelector('div.ProseMirror[contenteditable="plaintext-only"]') ||
            document.querySelector('div.ProseMirror[contenteditable="true"]') ||
            document.querySelector('[role="textbox"][contenteditable="plaintext-only"]') ||
            document.querySelector('[role="textbox"][contenteditable="true"]') ||
            document.querySelector('[contenteditable="true"][data-placeholder]') ||
            document.querySelector('[contenteditable="true"]') ||
            document.querySelector('textarea')
        );
    }

    function insertTextIntoInput(inputEl, text) {
        inputEl.focus();
        inputEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });

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

    function tryInsert(fullText, storageKeyToClear, attempt = 0) {
        const inputEl = findInputElement();

        if (!inputEl) {
            if (attempt < MAX_RETRIES) {
                setTimeout(() => tryInsert(fullText, storageKeyToClear, attempt + 1), RETRY_INTERVAL_MS);
            }
            return;
        }

        insertTextIntoInput(inputEl, fullText);
        chrome.storage.local.remove(storageKeyToClear);
    }

    async function checkForPendingText() {
        const result = await chrome.storage.local.get([PENDING_PLAIN_KEY, PENDING_TEXT_KEY]);
        const plain = result[PENDING_PLAIN_KEY];
        if (plain) {
            tryInsert(plain, PENDING_PLAIN_KEY);
            return;
        }

        const text = result[PENDING_TEXT_KEY];
        if (!text) return;

        tryInsert(PREFIX_TEXT + text, PENDING_TEXT_KEY);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForPendingText);
    } else {
        checkForPendingText();
    }
}());
