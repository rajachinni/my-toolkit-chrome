// You.com Auto-Config Script - Model Selection
// Automatically selects Claude Sonnet 4 (Extended) when model popup appears

(function() {
    'use strict';



    let isProcessingModelSelection = false;

    // Function to select Claude Sonnet 4 (Extended)
    function selectClaudeSonnet4Extended() {
        if (isProcessingModelSelection) return;
        
        // Look for the model selection popup
        const popup = document.querySelector('div[role="tooltip"][aria-label="Select agent"]');
        if (!popup) return;

        // Find Claude Sonnet 4 (Extended) button
        const claudeButton = Array.from(popup.querySelectorAll('button[role="menuitem"]'))
            .find(button => button.textContent.includes('Claude Sonnet 4 (Extended)'));
        
        if (claudeButton && claudeButton.getAttribute('data-selected') !== 'true') {
            isProcessingModelSelection = true;
            console.log('You.com Auto-Config: Found Claude Sonnet 4 (Extended), selecting...');
            
            claudeButton.click();
            console.log('You.com Auto-Config: Claude Sonnet 4 (Extended) selected');
            
            // Click outside to close popup after selection
            setTimeout(() => {
                document.body.click();
                console.log('You.com Auto-Config: Clicked outside to close model selection popup');
                
                // Focus on the textarea after model selection
                setTimeout(() => {
                    focusTextarea();
                }, 200);
            }, 300);
            
            // Reset processing flag after a delay
            setTimeout(() => {
                isProcessingModelSelection = false;
            }, 500);
        }
    }

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



    // Function to wait for model selection popup and then select Claude
    function waitForModelPopupAndSelect(maxAttempts = 20) {
        let attempts = 0;
        
        const checkForPopup = () => {
            attempts++;
            const popup = document.querySelector('div[role="tooltip"][aria-label="Select agent"]');
            
            if (popup) {
                // Popup found, wait a bit more for content to load, then select
                setTimeout(selectClaudeSonnet4Extended, 50);
                setTimeout(selectClaudeSonnet4Extended, 150);
                setTimeout(selectClaudeSonnet4Extended, 300);
            } else if (attempts < maxAttempts) {
                // Popup not found yet, try again
                setTimeout(checkForPopup, 100);
            }
        };
        
        checkForPopup();
    }



    // Observer for dynamic content
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldCheckForModelPopup = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if model selection popup was added
                            if (node.matches && node.matches('div[role="tooltip"][aria-label="Select agent"]')) {
                                shouldCheckForModelPopup = true;
                            } else if (node.querySelector && node.querySelector('div[role="tooltip"][aria-label="Select agent"]')) {
                                shouldCheckForModelPopup = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheckForModelPopup) {
                setTimeout(selectClaudeSonnet4Extended, 50);
                setTimeout(selectClaudeSonnet4Extended, 150);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // Initialize everything
    function init() {
        console.log('You.com Auto-Config: Initializing model selection...');
        
        // Set up observer for dynamic content
        setupObserver();
        
        // Retry finding the model popup periodically
        const retryIntervals = [500, 1000, 2000, 5000];
        retryIntervals.forEach(delay => {
            setTimeout(() => {
                // Check if model popup is already open
                const popup = document.querySelector('div[role="tooltip"][aria-label="Select agent"]');
                if (popup) {
                    selectClaudeSonnet4Extended();
                }
            }, delay);
        });
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
            console.log('You.com Auto-Config: Page navigation detected, reinitializing model selection...');
            setTimeout(init, 1000);
        }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });
    
    console.log('You.com Auto-Config: Model selection script loaded');
})(); 