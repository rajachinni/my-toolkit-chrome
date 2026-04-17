// Domain Blocker Popup Script
class DomainBlocker {
    constructor() {
        this.toggle = document.getElementById('toggle');
        this.domainInput = document.getElementById('domainInput');
        this.domainList = document.getElementById('domainList');
        this.domainSection = document.getElementById('domainSection');
        this.domainControls = document.getElementById('domainControls');
        this.customNewTabUrlInput = document.getElementById('customNewTabUrlInput');
        this.saveCustomNewTabUrlButton = document.getElementById('saveCustomNewTabUrlButton');
        this.customNewTabUrlFeedback = document.getElementById('customNewTabUrlFeedback');
        this.customNewTabUrlStorageKey = 'customNewTabUrl';
        this.defaultCustomNewTabUrl = 'https://www.google.com/';
        
        this.init();
    }
    
    async init() {
        // Load saved settings
        const settings = await this.loadSettings();
        
        // Set toggle state
        this.toggle.classList.toggle('active', settings.enabled);
        this.updateUI(settings.enabled);
        
        // Load blocked domains
        await this.loadBlockedDomains();
        
        // Add event listeners
        this.toggle.addEventListener('click', () => this.toggleFeature());
        this.domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addDomain();
            }
        });

        this.customNewTabUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveCustomNewTabUrl();
            }
        });
        this.saveCustomNewTabUrlButton.addEventListener('click', () => this.saveCustomNewTabUrl());
        await this.loadCustomNewTabUrl();
    }
    
    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['domainBlockerEnabled'], (result) => {
                resolve({
                    enabled: result.domainBlockerEnabled !== false // Default to true
                });
            });
        });
    }
    
    async saveSettings(enabled) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ domainBlockerEnabled: enabled }, () => {
                resolve();
            });
        });
    }
    
    async loadBlockedDomains() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['blockedDomains'], (result) => {
                const domains = result.blockedDomains || [];
                this.renderDomainList(domains);
                resolve(domains);
            });
        });
    }
    
    async saveBlockedDomains(domains) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ blockedDomains: domains }, () => {
                resolve();
            });
        });
    }

    normalizeCustomNewTabUrl(rawUrl) {
        if (typeof rawUrl !== 'string') {
            return null;
        }

        const trimmedUrl = rawUrl.trim();
        if (!trimmedUrl) {
            return null;
        }

        const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedUrl);
        const candidateUrl = hasScheme ? trimmedUrl : `https://${trimmedUrl}`;

        try {
            const parsedUrl = new URL(candidateUrl);
            if (parsedUrl.protocol === 'chrome:' && parsedUrl.hostname === 'newtab') {
                return null;
            }

            return parsedUrl.toString();
        } catch (error) {
            return null;
        }
    }

    async loadCustomNewTabUrl() {
        const result = await new Promise((resolve) => {
            chrome.storage.sync.get([this.customNewTabUrlStorageKey], resolve);
        });

        const savedUrl = result[this.customNewTabUrlStorageKey];
        this.customNewTabUrlInput.value = savedUrl || this.defaultCustomNewTabUrl;
    }

    async saveCustomNewTabUrl() {
        const normalizedUrl = this.normalizeCustomNewTabUrl(this.customNewTabUrlInput.value);
        if (!normalizedUrl) {
            this.setCustomUrlFeedback('Enter a valid URL (not chrome://newtab).', true);
            return;
        }

        await new Promise((resolve) => {
            chrome.storage.sync.set({ [this.customNewTabUrlStorageKey]: normalizedUrl }, resolve);
        });

        this.customNewTabUrlInput.value = normalizedUrl;
        this.setCustomUrlFeedback('Custom URL saved.', false);
    }

    setCustomUrlFeedback(message, isError) {
        this.customNewTabUrlFeedback.textContent = message;
        this.customNewTabUrlFeedback.classList.toggle('error', isError);
    }
    
    async toggleFeature() {
        const isEnabled = this.toggle.classList.contains('active');
        const newState = !isEnabled;
        
        this.toggle.classList.toggle('active', newState);
        this.updateUI(newState);
        await this.saveSettings(newState);
        
        // Notify content scripts about the change
        this.notifyContentScripts();
    }
    
    updateUI(enabled) {
        this.domainControls.style.display = enabled ? 'block' : 'none';
    }
    
    async addDomain() {
        const domain = this.domainInput.value.trim();
        
        if (!domain) {
            return;
        }
        
        if (!this.isValidDomain(domain)) {
            return;
        }
        
        // Get current blocked domains
        const result = await new Promise((resolve) => {
            chrome.storage.sync.get(['blockedDomains'], resolve);
        });
        
        const domains = result.blockedDomains || [];
        
        if (domains.includes(domain)) {
            return;
        }
        
        // Add domain to list
        domains.push(domain);
        await this.saveBlockedDomains(domains);
        
        // Update UI
        this.renderDomainList(domains);
        this.domainInput.value = '';
        
        // Notify content scripts
        this.notifyContentScripts();
    }
    
    async removeDomain(domain) {
        const result = await new Promise((resolve) => {
            chrome.storage.sync.get(['blockedDomains'], resolve);
        });
        
        const domains = result.blockedDomains || [];
        const updatedDomains = domains.filter(d => d !== domain);
        
        await this.saveBlockedDomains(updatedDomains);
        this.renderDomainList(updatedDomains);
        
        // Notify content scripts
        this.notifyContentScripts();
    }
    
    renderDomainList(domains) {
        if (domains.length === 0) {
            this.domainList.innerHTML = '<div class="empty-state">No domains blocked yet</div>';
            return;
        }
        
        this.domainList.innerHTML = domains.map(domain => `
            <div class="domain-item">
                <span class="domain-text">${this.escapeHtml(domain)}</span>
                <button class="remove-button" data-domain="${this.escapeHtml(domain)}"> ❌ </button>
            </div>
        `).join('');
        
        // Add event listeners to remove buttons
        this.domainList.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const domain = e.target.getAttribute('data-domain');
                this.removeDomain(domain);
            });
        });
    }
    
    
    isValidDomain(domain) {
        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain) && domain.length > 0 && domain.length < 253;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    
    notifyContentScripts() {
        // Send message to all tabs to update domain blocking
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'updateDomainBlocking' }).catch(() => {
                    // Ignore errors for tabs that don't have our content script
                });
            });
        });
    }
}

// Initialize the domain blocker when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new DomainBlocker();
});
