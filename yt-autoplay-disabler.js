console.log("YouTube Autoplay Disabler: content script loaded");

class YouTubeAutoplayDisabler {
  constructor() {
    this.autoplayDisabled = false;
    this.currentUrl = location.href;
    this.isPlaylist = this.checkIsPlaylist();
    this.observer = null;
    this.checkTimeout = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    
    // Cache DOM queries
    this.playlistManagerCache = null;
    this.lastCacheTime = 0;
    this.cacheValidityMs = 5000; // 5 seconds
  }

  checkIsPlaylist(url = location.href) {
    return url.includes('list=') && !url.includes('list=WL'); // Exclude "Watch Later"
  }

  getCachedPlaylistManager() {
    const now = Date.now();
    if (this.playlistManagerCache && (now - this.lastCacheTime) < this.cacheValidityMs) {
      return this.playlistManagerCache;
    }
    
    this.playlistManagerCache = document.getElementsByTagName('yt-playlist-manager')[0] || null;
    this.lastCacheTime = now;
    return this.playlistManagerCache;
  }

  disableAutoplay() {
    try {
      const ypm = this.getCachedPlaylistManager();
      if (!ypm) return false;

      // Method 1: Try polymerController (most common)
      if (ypm.polymerController?.canAutoAdvance_ !== undefined) {
        ypm.polymerController.canAutoAdvance_ = false;
        return true;
      }

      // Method 2: Try TEST_ONLY.setCanAutoAdvance
      if (typeof ypm.TEST_ONLY?.setCanAutoAdvance === 'function') {
        ypm.TEST_ONLY.setCanAutoAdvance(false);
        return true;
      }

      // Method 3: Try direct property
      if ('canAutoAdvance_' in ypm) {
        ypm.canAutoAdvance_ = false;
        return true;
      }

      // Method 4: Optimized property search (only if needed)
      const autoAdvanceKeys = Object.keys(ypm).filter(key => 
        key.toLowerCase().includes('autoadvance') || 
        key.toLowerCase().includes('advance')
      );
      
      for (const key of autoAdvanceKeys) {
        try {
          if (typeof ypm[key] === 'boolean' || typeof ypm[key] === 'function') {
            ypm[key] = false;
            return true;
          }
        } catch (e) {
          // Continue to next key
        }
      }

      return false;
    } catch (error) {
      console.warn('YouTube Autoplay Disabler: Error in disableAutoplay:', error);
      return false;
    }
  }

  // Debounced check function
  scheduleCheck(delay = 100) {
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }
    
    this.checkTimeout = setTimeout(() => {
      this.checkAndDisableAutoplay();
      this.checkTimeout = null;
    }, delay);
  }

  checkAndDisableAutoplay() {
    if (!this.isPlaylist) {
      this.autoplayDisabled = false;
      this.retryCount = 0;
      return;
    }

    if (!this.autoplayDisabled && this.retryCount < this.maxRetries) {
      this.autoplayDisabled = this.disableAutoplay();
      
      if (!this.autoplayDisabled) {
        this.retryCount++;
        // Exponential backoff for retries
        this.scheduleCheck(200 * this.retryCount);
      } else {
        this.retryCount = 0;
      }
    }
  }

  handleUrlChange() {
    const newUrl = location.href;
    if (newUrl !== this.currentUrl) {
      this.currentUrl = newUrl;
      this.isPlaylist = this.checkIsPlaylist(newUrl);
      this.autoplayDisabled = false;
      this.retryCount = 0;
      this.playlistManagerCache = null; // Invalidate cache
      
      if (this.isPlaylist) {
        this.scheduleCheck();
      }
    }
  }

  setupOptimizedObserver() {
    // Only observe when we're on a playlist page
    if (!this.isPlaylist) return;

    this.observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      // More efficient mutation checking
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'YT-PLAYLIST-MANAGER') {
                shouldCheck = true;
                break;
              }
              // Only check for nested playlist manager if we haven't found one yet
              if (node.children?.length > 0 && node.querySelector('yt-playlist-manager')) {
                shouldCheck = true;
                break;
              }
            }
          }
          if (shouldCheck) break;
        }
      }
      
      if (shouldCheck && !this.autoplayDisabled) {
        this.playlistManagerCache = null; // Invalidate cache
        this.scheduleCheck();
      }
    });
    
    // Observe more selectively - focus on the main content area
    const mainContent = document.querySelector('#content') || document.body;
    this.observer.observe(mainContent, { 
      childList: true, 
      subtree: true 
    });
  }

  disconnectObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  setupNavigationListeners() {
    // History API hooking with debouncing
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleUrlChange();
    };
    
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleUrlChange();
    };
    
    // Standard navigation events
    window.addEventListener('popstate', () => this.handleUrlChange());
    
    // YouTube-specific events (most reliable)
    document.addEventListener('yt-navigate-finish', () => this.handleUrlChange());
  }

  initialize() {
    this.setupNavigationListeners();
    this.checkAndDisableAutoplay();
    this.setupOptimizedObserver();
  }

  cleanup() {
    this.disconnectObserver();
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }
  }
}

// Global instance
let autoplayDisabler;

function initializeAutoplayDisabler() {
  if (autoplayDisabler) {
    autoplayDisabler.cleanup();
  }
  
  autoplayDisabler = new YouTubeAutoplayDisabler();
  autoplayDisabler.initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (autoplayDisabler) {
    autoplayDisabler.cleanup();
  }
});

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAutoplayDisabler);
} else {
  initializeAutoplayDisabler();
}