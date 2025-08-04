// You.com Auto-Config Script - Auto Click and Model Selection
// Automatically clicks Auto button and selects Claude Sonnet 4 (Extended)

(function() {
    'use strict';

    let isProcessingModelSelection = false;
    let autoButtonClicked = false;

    // Function to automatically click the Auto button
    function clickAutoButton() {
        if (autoButtonClicked) return;
        
        // Look for the Auto button with sparkles icon
        const autoButton = document.querySelector('button[type="button"] span.n6zur96');
        const autoButtonParent = autoButton ? autoButton.closest('button') : null;
        
        if (autoButtonParent && !autoButtonParent.hasAttribute('data-auto-clicked')) {
            autoButtonClicked = true;
            autoButtonParent.setAttribute('data-auto-clicked', 'true');
            
            console.log('You.com Auto-Config: Automatically clicking Auto button...');
            autoButtonParent.click();
            console.log('You.com Auto-Config: Auto button clicked automatically');
            
            // Reset the flag after a delay to allow for future clicks
            setTimeout(() => {
                autoButtonClicked = false;
            }, 2000);
        }
    }

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
            
            // Reset processing flag after a delay
            setTimeout(() => {
                isProcessingModelSelection = false;
            }, 500);
        }
    }

    // Function to wait for Auto button and click it
    function waitForAutoButtonAndClick(maxAttempts = 30) {
        let attempts = 0;
        
        const checkForAutoButton = () => {
            attempts++;
            const autoButton = document.querySelector('button[type="button"] span.n6zur96');
            const autoButtonParent = autoButton ? autoButton.closest('button') : null;
            
            if (autoButtonParent) {
                // Auto button found, click it
                setTimeout(clickAutoButton, 100);
                setTimeout(clickAutoButton, 300);
                setTimeout(clickAutoButton, 500);
            } else if (attempts < maxAttempts) {
                // Auto button not found yet, try again
                setTimeout(checkForAutoButton, 200);
            }
        };
        
        checkForAutoButton();
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

    // Function to set up Auto button click handler for model selection
    function setupAutoButtonHandler() {
        // Look for the Auto button with sparkles icon
        const autoButton = document.querySelector('button[type="button"] span.n6zur96');
        const autoButtonParent = autoButton ? autoButton.closest('button') : null;
        
        if (autoButtonParent && !autoButtonParent.hasAttribute('data-auto-model-handler')) {
            autoButtonParent.setAttribute('data-auto-model-handler', 'true');
            
            autoButtonParent.addEventListener('click', function() {
                console.log('You.com Auto-Config: Auto button clicked, waiting for model popup...');
                waitForModelPopupAndSelect();
            });
            
            console.log('You.com Auto-Config: Handler attached to Auto button');
        }
    }

    // Observer for dynamic content
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldCheckForAutoButton = false;
            let shouldCheckForModelPopup = false;
            let shouldClickAutoButton = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if Auto button was added
                            if (node.querySelector && node.querySelector('span.n6zur96')) {
                                shouldCheckForAutoButton = true;
                                shouldClickAutoButton = true;
                            }
                            
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
            
            if (shouldCheckForAutoButton) {
                setTimeout(setupAutoButtonHandler, 50);
            }
            
            if (shouldClickAutoButton) {
                setTimeout(clickAutoButton, 100);
                setTimeout(clickAutoButton, 300);
            }
            
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
        console.log('You.com Auto-Config: Initializing auto-click and model selection...');
        
        // Try to set up button handlers immediately
        setupAutoButtonHandler();
        
        // Click Auto button automatically
        waitForAutoButtonAndClick();
        
        // Set up observer for dynamic content
        setupObserver();
        
        // Retry finding the buttons periodically
        const retryIntervals = [500, 1000, 2000, 5000];
        retryIntervals.forEach(delay => {
            setTimeout(() => {
                setupAutoButtonHandler();
                waitForAutoButtonAndClick(); // Retry clicking Auto button
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
            console.log('You.com Auto-Config: Page navigation detected, reinitializing auto-click...');
            autoButtonClicked = false; // Reset auto button click state
            setTimeout(init, 1000);
        }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });
    
    console.log('You.com Auto-Config: Auto-click and model selection script loaded');
})(); 