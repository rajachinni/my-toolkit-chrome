// You.com Auto-Config Script
// Auto-configuration for You.com

(function() {
    'use strict';




    // Function to focus on the textarea
    function focusTextarea() {
        // First try to find the specific textarea by ID
        let textarea = document.querySelector('#search-input-textarea');
        
        // If not found by ID, try by placeholder
        if (!textarea) {
            textarea = document.querySelector('textarea[placeholder="How can I help?"]');
        }
        
        // Fallback to the original follow-up textarea
        if (!textarea) {
            textarea = document.querySelector('textarea[placeholder="Ask a follow-up..."]');
        }
        
        if (textarea) {
            console.log('You.com Auto-Config: Focusing on textarea...');
            textarea.focus();
            textarea.click();
            console.log('You.com Auto-Config: Textarea focused and clicked');
        } else {
            console.log('You.com Auto-Config: Textarea not found');
        }
    }






    // Observer for dynamic content
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            // Observer setup for future functionality
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // Initialize everything
    function init() {
        console.log('You.com Auto-Config: Initializing...');
        
        // Set up observer for dynamic content
        setupObserver();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle SPA navigation
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('You.com Auto-Config: Page navigation detected, reinitializing...');
            setTimeout(init, 1000);
        }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });
    
    console.log('You.com Auto-Config: Script loaded');
})(); 