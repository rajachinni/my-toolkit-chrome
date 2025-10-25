// Domain Blocker Content Script
class DomainBlockerContent {
    constructor() {
        this.blockedDomains = [];
        this.isEnabled = true;
        this.init();
    }
    
    async init() {
        // Load settings and blocked domains
        await this.loadSettings();
        await this.loadBlockedDomains();
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'updateDomainBlocking') {
                this.loadSettings().then(() => {
                    this.loadBlockedDomains().then(() => {
                        this.checkCurrentPage();
                    });
                });
            }
        });
        
        // Check current page on load
        this.checkCurrentPage();
    }
    
    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['domainBlockerEnabled'], (result) => {
                this.isEnabled = result.domainBlockerEnabled !== false;
                resolve();
            });
        });
    }
    
    async loadBlockedDomains() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['blockedDomains'], (result) => {
                this.blockedDomains = result.blockedDomains || [];
                resolve();
            });
        });
    }
    
    checkCurrentPage() {
        if (!this.isEnabled) {
            return;
        }
        
        const currentDomain = window.location.hostname;
        
        // Check if current domain is blocked
        const isBlocked = this.blockedDomains.some(blockedDomain => {
            return this.matchesDomain(currentDomain, blockedDomain);
        });
        
        if (isBlocked) {
            this.showBlockedPage();
        }
    }
    
    matchesDomain(currentDomain, blockedDomain) {
        // Remove www. prefix for comparison
        const cleanCurrent = currentDomain.replace(/^www\./, '');
        const cleanBlocked = blockedDomain.replace(/^www\./, '');
        
        return cleanCurrent === cleanBlocked || cleanCurrent.endsWith('.' + cleanBlocked);
    }
    
    showBlockedPage() {
        // Prevent the page from loading further
        document.documentElement.innerHTML = '';
        
        // Create blocked page content
        const blockedPage = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Domain Blocked</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0;
                        padding: 0;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                    }
                    
                    .blocked-container {
                        text-align: center;
                        max-width: 500px;
                        padding: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    
                    .blocked-icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                        opacity: 0.8;
                    }
                    
                    .blocked-title {
                        font-size: 32px;
                        font-weight: 600;
                        margin-bottom: 16px;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    
                    .blocked-message {
                        font-size: 18px;
                        margin-bottom: 30px;
                        opacity: 0.9;
                        line-height: 1.5;
                    }
                    
                    .blocked-domain {
                        font-family: 'Monaco', 'Menlo', monospace;
                        background: rgba(255, 255, 255, 0.2);
                        padding: 8px 16px;
                        border-radius: 8px;
                        display: inline-block;
                        margin: 10px 0;
                        font-size: 16px;
                    }
                    
                    .unblock-button {
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        text-decoration: none;
                        display: inline-block;
                        margin-top: 20px;
                    }
                    
                    .unblock-button:hover {
                        background: rgba(255, 255, 255, 0.3);
                        border-color: rgba(255, 255, 255, 0.5);
                        transform: translateY(-2px);
                    }
                    
                    .extension-info {
                        margin-top: 30px;
                        font-size: 14px;
                        opacity: 0.7;
                    }
                </style>
            </head>
            <body>
                <div class="blocked-container">
                    <div class="blocked-icon">🚫</div>
                    <h1 class="blocked-title">Domain Blocked</h1>
                    <p class="blocked-message">
                        This domain has been blocked by your extension.
                    </p>
                </div>
            </body>
            </html>
        `;
        
        document.documentElement.innerHTML = blockedPage;
        
        // Stop all other scripts from running
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                script.remove();
            }
        });
    }
}

// Initialize domain blocker
if (typeof chrome !== 'undefined' && chrome.storage) {
    new DomainBlockerContent();
}
