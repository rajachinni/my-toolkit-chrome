// You.com Auto-Config Script
// Automatically unchecks web search

(function() {
    'use strict';

    // Don't run on search pages
    if (window.location.pathname === '/search' || window.location.pathname.includes('/search')) {
        console.log('You.com Auto-Config: Skipping web-search-disabler script on search page');
        return;
    }

    let isProcessingWebSearch = false;

    // Function to automatically click the web search settings button
    function autoClickWebSearchButton() {
        const webButton = document.querySelector('button[aria-label="Open web search settings"]');
        
        if (webButton && !webButton.hasAttribute('data-auto-clicked')) {
            webButton.setAttribute('data-auto-clicked', 'true');
            console.log('You.com Auto-Config: Automatically clicking web search settings button...');
            webButton.click();
            
            // Wait for popup and then uncheck
            setTimeout(() => {
                waitForWebSearchPopupAndUncheck();
            }, 100);
        }
    }

    // Function to click the checkbox to uncheck web search
    function uncheckWebSearch() {
        if (isProcessingWebSearch) return;
        
        // Look for the popup menu first
        const popup = document.querySelector('div[role="menu"][id*="r"]');
        if (!popup) return;

        // Find the checkbox within the popup
        const checkbox = popup.querySelector('input[type="checkbox"][aria-label="Web search toggle"]');
        
        if (checkbox && checkbox.checked) {
            isProcessingWebSearch = true;
            console.log('You.com Auto-Config: Found checked web search toggle, unchecking...');
            
            // Click the parent button instead of just the checkbox for better compatibility
            const toggleButton = checkbox.closest('button');
            if (toggleButton) {
                toggleButton.click();
            } else {
                // Fallback: click the checkbox directly
                checkbox.click();
            }
            
            console.log('You.com Auto-Config: Web search disabled');
            
            // Hide the web search menu after disabling
            setTimeout(() => {
                hideWebSearchMenu();
                hideWebSearchPopup(); // Also hide the specific popup
            }, 100);
            
            // Reset processing flag after a delay
            setTimeout(() => {
                isProcessingWebSearch = false;
            }, 500);
        }
    }

    // Function to hide the web search menu
    function hideWebSearchMenu() {
        const webSearchMenu = document.querySelector('div[role="menu"][id*="r"]');
        if (webSearchMenu) {
            console.log('You.com Auto-Config: Hiding web search menu...');
            webSearchMenu.style.display = 'none';
            webSearchMenu.style.visibility = 'hidden';
            webSearchMenu.style.opacity = '0';
            console.log('You.com Auto-Config: Web search menu hidden');
        }
    }

    // Function to hide the specific web search popup with globe icon
    function hideWebSearchPopup() {
        // Look for the specific popup with the structure you provided
        const webSearchPopup = document.querySelector('div[role="menu"].ab8ju70._12e5ba50._1gccq3g0');
        
        if (webSearchPopup) {
            console.log('You.com Auto-Config: Hiding specific web search popup...');
            webSearchPopup.style.display = 'none';
            webSearchPopup.style.visibility = 'hidden';
            webSearchPopup.style.opacity = '0';
            webSearchPopup.style.pointerEvents = 'none';
            console.log('You.com Auto-Config: Specific web search popup hidden');
        }
    }

    // Function to wait for web search popup and then uncheck
    function waitForWebSearchPopupAndUncheck(maxAttempts = 20) {
        let attempts = 0;
        
        const checkForPopup = () => {
            attempts++;
            const popup = document.querySelector('div[role="menu"][id*="r"]');
            
            if (popup) {
                // Popup found, wait a bit more for content to load, then uncheck
                setTimeout(uncheckWebSearch, 50);
                setTimeout(uncheckWebSearch, 150);
                setTimeout(uncheckWebSearch, 300);
            } else if (attempts < maxAttempts) {
                // Popup not found yet, try again
                setTimeout(checkForPopup, 100);
            }
        };
        
        checkForPopup();
    }

    // Function to set up Web button click handler
    function setupWebButtonHandler() {
        const webButton = document.querySelector('button[aria-label="Open web search settings"]');
        
        if (webButton && !webButton.hasAttribute('data-auto-uncheck-handler')) {
            webButton.setAttribute('data-auto-uncheck-handler', 'true');
            
            webButton.addEventListener('click', function() {
                console.log('You.com Auto-Config: Web button clicked, waiting for popup...');
                waitForWebSearchPopupAndUncheck();
            });
            
            console.log('You.com Auto-Config: Handler attached to Web button');
        }
    }

    // Observer for dynamic content
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldCheckForWebButton = false;
            let shouldCheckForWebPopup = false;
            let shouldAutoClickWebButton = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if Web button was added
                            if (node.matches && node.matches('button[aria-label="Open web search settings"]')) {
                                shouldCheckForWebButton = true;
                                shouldAutoClickWebButton = true;
                            } else if (node.querySelector && node.querySelector('button[aria-label="Open web search settings"]')) {
                                shouldCheckForWebButton = true;
                                shouldAutoClickWebButton = true;
                            }
                            
                            // Check if web search popup was added
                            if (node.matches && node.matches('div[role="menu"]')) {
                                shouldCheckForWebPopup = true;
                            } else if (node.querySelector && node.querySelector('div[role="menu"]')) {
                                shouldCheckForWebPopup = true;
                            }
                            
                            // Check if specific web search popup with globe icon was added
                            if (node.matches && node.matches('div[role="menu"].ab8ju70._12e5ba50._1gccq3g0')) {
                                shouldCheckForWebPopup = true;
                            } else if (node.querySelector && node.querySelector('div[role="menu"].ab8ju70._12e5ba50._1gccq3g0')) {
                                shouldCheckForWebPopup = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheckForWebButton) {
                setTimeout(setupWebButtonHandler, 50);
            }
            
            if (shouldAutoClickWebButton) {
                setTimeout(autoClickWebSearchButton, 100);
            }
            
            if (shouldCheckForWebPopup) {
                setTimeout(uncheckWebSearch, 50);
                setTimeout(uncheckWebSearch, 150);
                setTimeout(hideWebSearchPopup, 200); // Also hide the specific popup
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
        console.log('You.com Auto-Config: Initializing web search disabler...');
        
        // Try to set up button handlers immediately
        setupWebButtonHandler();
        
        // Try to auto-click the web search button immediately
        autoClickWebSearchButton();
        
        // Set up observer for dynamic content
        setupObserver();
        
        // Retry finding the buttons periodically
        const retryIntervals = [500, 1000, 2000, 5000];
        retryIntervals.forEach(delay => {
            setTimeout(() => {
                setupWebButtonHandler();
                autoClickWebSearchButton();
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
            console.log('You.com Auto-Config: Page navigation detected, reinitializing web search disabler...');
            setTimeout(init, 1000);
        }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });
    
    console.log('You.com Auto-Config: Web search disabler script loaded');
})();