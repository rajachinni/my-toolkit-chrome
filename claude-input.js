(function () {
    const PENDING_TEXT_KEY = 'claudePendingText';
    const MAX_RETRIES = 30;
    const RETRY_INTERVAL_MS = 300;

    function findInputElement() {
        return (
            document.querySelector('div.ProseMirror[contenteditable="true"]') ||
            document.querySelector('[contenteditable="true"][data-placeholder]') ||
            document.querySelector('[contenteditable="true"]') ||
            document.querySelector('textarea')
        );
    }

    function insertTextIntoInput(inputEl, text) {
        inputEl.focus();

        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', text);

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true,
        });

        inputEl.dispatchEvent(pasteEvent);
    }

    function tryInsert(text, attempt = 0) {
        const inputEl = findInputElement();

        if (inputEl) {
            insertTextIntoInput(inputEl, text);
            return;
        }

        if (attempt < MAX_RETRIES) {
            setTimeout(() => tryInsert(text, attempt + 1), RETRY_INTERVAL_MS);
        }
    }

    const PREFIX_TEXT = 'Rewrite in simple language, no em dashes, Fix grammar & improve structure if needed:\n\n';

    async function checkForPendingText() {
        const result = await chrome.storage.local.get(PENDING_TEXT_KEY);
        const text = result[PENDING_TEXT_KEY];
        if (!text) return;

        await chrome.storage.local.remove(PENDING_TEXT_KEY);
        tryInsert(PREFIX_TEXT + text);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForPendingText);
    } else {
        checkForPendingText();
    }
}());
