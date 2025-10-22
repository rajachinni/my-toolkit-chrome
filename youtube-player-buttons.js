console.log("YouTube Player Buttons: content script loaded");

let lastUrl = location.href;

function detectUrlChange() {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    console.log('[YouTube Player Buttons] Navigation detected');
    lastUrl = currentUrl;
    
    if (currentUrl.includes('/watch')) {
      setTimeout(() => {
        addCustomButtons();
      }, 1000);
    }
    
    return true;
  }
  return false;
}

function createWatchLaterButton() {
  const watchLaterBtn = document.createElement('button');
  watchLaterBtn.id = 'ytp-custom-watch-later-btn';
  watchLaterBtn.className = 'ytp-button';
  watchLaterBtn.title = 'Add to Watch Later';
  watchLaterBtn.setAttribute('aria-label', 'Add to Watch Later');
  watchLaterBtn.setAttribute('data-priority', '4');
  watchLaterBtn.setAttribute('data-tooltip-title', 'Add to Watch Later');
  
  watchLaterBtn.innerHTML = `
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%" style="transform: scale(0.8);">
      <use class="ytp-svg-shadow" xlink:href="#ytp-watch-later-icon"></use>
      <path class="ytp-svg-fill" d="M18,8 C12.47,8 8,12.47 8,18 C8,23.52 12.47,28 18,28 C23.52,28 28,23.52 28,18 C28,12.47 23.52,8 18,8 L18,8 Z M16,19.02 L16,12.00 L18,12.00 L18,17.86 L23.10,20.81 L22.10,22.54 L16,19.02 Z" fill="#fff" id="ytp-watch-later-icon"></path>
    </svg>
  `;

  watchLaterBtn.onclick = (e) => {
    e.stopPropagation();
    console.log('[YouTube Player Buttons] Watch later button clicked');
    // Dispatch custom event for playlist functionality
    window.dispatchEvent(new CustomEvent('youtube-plus-watch-later', { detail: { action: 'add-to-watch-later' } }));
  };

  return watchLaterBtn;
}

function createSaveButton() {
  const saveBtn = document.createElement('button');
  saveBtn.id = 'ytp-custom-save-btn';
  saveBtn.className = 'ytp-button';
  saveBtn.title = 'Save to playlist';
  saveBtn.setAttribute('aria-label', 'Save to playlist');
  saveBtn.setAttribute('data-priority', '4');
  saveBtn.setAttribute('data-tooltip-title', 'Save to playlist');
  
  saveBtn.innerHTML = `
    <svg height="100%" version="1.1" viewBox="-4 0 30 30" width="100%" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; transform: scale(0.4);">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-419.000000, -153.000000)" fill="#ffffff">
          <path d="M437,153 L423,153 C420.791,153 419,154.791 419,157 L419,179 C419,181.209 420.791,183 423,183 L430,176 L437,183 C439.209,183 441,181.209 441,179 L441,157 C441,154.791 439.209,153 437,153"></path>
        </g>
      </g>
    </svg>
  `;

  saveBtn.onclick = (e) => {
    e.stopPropagation();
    console.log('[YouTube Player Buttons] Save button clicked');
    triggerSaveToPlaylist();
  };

  return saveBtn;
}

function triggerSaveToPlaylist() {
  try {
    // Try multiple selectors for the save button in the new UI
    const saveButton = document.querySelector('button[title="Save"][aria-label="Save to playlist"]') ||
                      document.querySelector('button[aria-label="Save to playlist"]') ||
                      document.querySelector('button[title="Save"]') ||
                      Array.from(document.querySelectorAll('button.yt-spec-button-shape-next')).find(
                        btn => btn.title === 'Save' || btn.getAttribute('aria-label') === 'Save to playlist'
                      ) ||
                      Array.from(document.querySelectorAll('button')).find(
                        btn => btn.getAttribute('aria-label')?.includes('Save') || 
                               btn.title?.includes('Save') ||
                               btn.textContent?.includes('Save')
                      );
    
    if (saveButton) {
      saveButton.click();
      console.log('[YouTube Player Buttons] Clicked Save to playlist button');
    } else {
      console.warn('[YouTube Player Buttons] Save to playlist button not found');
      // Try to find and click the save button in the video description area
      const descriptionSaveButton = document.querySelector('#top-level-buttons-computed button[aria-label*="Save"]') ||
                                  document.querySelector('#top-level-buttons-computed button[title*="Save"]');
      if (descriptionSaveButton) {
        descriptionSaveButton.click();
        console.log('[YouTube Player Buttons] Clicked description area save button');
      }
    }
    
  } catch (error) {
    console.error('[YouTube Player Buttons] Error triggering save to playlist:', error);
  }
}

function addCustomButtons() {
  try {
    console.log('[YouTube Player Buttons] Attempting to add custom buttons...');
    
    // Try multiple selectors for the right controls
    let rightControls = document.querySelector('.ytp-right-controls') || 
                       document.querySelector('.ytp-chrome-bottom .ytp-right-controls') ||
                       document.querySelector('.html5-video-player .ytp-right-controls');
    
    // If still not found, try to find it in the chrome bottom area
    if (!rightControls) {
      const chromeBottom = document.querySelector('.ytp-chrome-bottom');
      if (chromeBottom) {
        rightControls = chromeBottom.querySelector('.ytp-right-controls');
      }
    }
    
    // Last resort: look for any controls container
    if (!rightControls) {
      const controlsContainer = document.querySelector('.ytp-chrome-controls') || 
                               document.querySelector('.ytp-chrome-bottom');
      if (controlsContainer) {
        // Create our own right controls section if it doesn't exist
        rightControls = document.createElement('div');
        rightControls.className = 'ytp-right-controls';
        controlsContainer.appendChild(rightControls);
        console.log('[YouTube Player Buttons] Created custom right controls container');
      }
    }
    
    if (!rightControls) {
      console.log('[YouTube Player Buttons] Right controls not found');
      return false;
    }

    console.log('[YouTube Player Buttons] Found right controls:', rightControls);

    // Check if buttons already exist
    const existingWatchLaterBtn = rightControls.querySelector('#ytp-custom-watch-later-btn');
    const existingSaveBtn = rightControls.querySelector('#ytp-custom-save-btn');
    
    if (existingWatchLaterBtn && existingSaveBtn) {
      console.log('[YouTube Player Buttons] Buttons already exist');
      return true;
    }

    // Look for existing buttons in the new UI structure
    const subtitlesButton = rightControls.querySelector('.ytp-subtitles-button');
    const settingsButton = rightControls.querySelector('.ytp-settings-button');
    const sizeButton = rightControls.querySelector('.ytp-size-button');
    const fullscreenButton = rightControls.querySelector('.ytp-fullscreen-button');
    
    console.log('[YouTube Player Buttons] Found reference buttons:', {
      subtitles: !!subtitlesButton,
      settings: !!settingsButton,
      size: !!sizeButton,
      fullscreen: !!fullscreenButton
    });
    
    const referenceButton = subtitlesButton || settingsButton || sizeButton || fullscreenButton;

    if (!existingWatchLaterBtn) {
      const watchLaterBtn = createWatchLaterButton();
      console.log('[YouTube Player Buttons] Created watch later button');
      
      // Insert at the beginning of the controls
      const firstChild = rightControls.firstChild;
      if (firstChild) {
        rightControls.insertBefore(watchLaterBtn, firstChild);
        console.log('[YouTube Player Buttons] Inserted watch later button at start');
      } else {
        rightControls.appendChild(watchLaterBtn);
        console.log('[YouTube Player Buttons] Appended watch later button');
      }
    }

    if (!existingSaveBtn) {
      const saveBtn = createSaveButton();
      console.log('[YouTube Player Buttons] Created save button');
      
      // Insert at the beginning of the controls
      const firstChild = rightControls.firstChild;
      if (firstChild) {
        rightControls.insertBefore(saveBtn, firstChild);
        console.log('[YouTube Player Buttons] Inserted save button at start');
      } else {
        rightControls.appendChild(saveBtn);
        console.log('[YouTube Player Buttons] Appended save button');
      }
    }
    
    console.log('[YouTube Player Buttons] Successfully added custom buttons');
    return true;

  } catch (err) {
    console.error('[YouTube Player Buttons] Error adding custom buttons:', err);
    return false;
  }
}

// Fallback method to add buttons directly to chrome bottom
function addCustomButtonsFallback() {
  try {
    console.log('[YouTube Player Buttons] Trying fallback method...');
    
    const chromeBottom = document.querySelector('.ytp-chrome-bottom');
    if (!chromeBottom) {
      console.log('[YouTube Player Buttons] Chrome bottom not found for fallback');
      return false;
    }

    // Check if buttons already exist
    const existingWatchLaterBtn = chromeBottom.querySelector('#ytp-custom-watch-later-btn');
    const existingSaveBtn = chromeBottom.querySelector('#ytp-custom-save-btn');
    
    if (existingWatchLaterBtn && existingSaveBtn) {
      console.log('[YouTube Player Buttons] Fallback buttons already exist');
      return true;
    }

    // Find a good insertion point
    const leftControls = chromeBottom.querySelector('.ytp-left-controls');
    const rightControls = chromeBottom.querySelector('.ytp-right-controls');
    
    let insertionPoint = rightControls || leftControls;
    
    if (!insertionPoint) {
      // Create a container for our buttons
      insertionPoint = document.createElement('div');
      insertionPoint.className = 'ytp-custom-buttons-container';
      insertionPoint.style.cssText = 'display: flex; align-items: center; margin-left: auto;';
      chromeBottom.appendChild(insertionPoint);
    }

    if (!existingWatchLaterBtn) {
      const watchLaterBtn = createWatchLaterButton();
      // Insert at the beginning of the container
      const firstChild = insertionPoint.firstChild;
      if (firstChild) {
        insertionPoint.insertBefore(watchLaterBtn, firstChild);
      } else {
        insertionPoint.appendChild(watchLaterBtn);
      }
      console.log('[YouTube Player Buttons] Added watch later button via fallback');
    }

    if (!existingSaveBtn) {
      const saveBtn = createSaveButton();
      // Insert at the beginning of the container
      const firstChild = insertionPoint.firstChild;
      if (firstChild) {
        insertionPoint.insertBefore(saveBtn, firstChild);
      } else {
        insertionPoint.appendChild(saveBtn);
      }
      console.log('[YouTube Player Buttons] Added save button via fallback');
    }
    
    return true;
  } catch (err) {
    console.error('[YouTube Player Buttons] Error in fallback method:', err);
    return false;
  }
}

// MutationObserver for player changes
const playerObserver = new MutationObserver((mutations) => {
  if (detectUrlChange()) return;
  
  if (!location.href.includes('/watch')) return;
  
  let shouldCheck = false;
  mutations.forEach(mutation => {
    if (mutation.target.closest('.ytp-right-controls') ||
        mutation.target.closest('.html5-video-player') ||
        mutation.target.closest('.ytp-chrome-bottom') ||
        mutation.target.closest('.ytd-player') ||
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === 1 && (
            node.querySelector && (
              node.querySelector('.ytp-right-controls') ||
              node.querySelector('.ytp-subtitles-button') ||
              node.querySelector('.ytp-settings-button') ||
              node.querySelector('.ytp-size-button') ||
              node.querySelector('.ytp-fullscreen-button') ||
              node.closest('.ytp-right-controls')
            )
          )
        )) {
      shouldCheck = true;
    }
  });
  
  if (shouldCheck && location.href.includes('/watch')) {
    setTimeout(() => {
      if (!addCustomButtons()) {
        addCustomButtonsFallback();
      }
    }, 100);
  }
});

playerObserver.observe(document.body, { childList: true, subtree: true });

// Navigation listeners
window.addEventListener('popstate', () => {
  detectUrlChange();
});

const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  setTimeout(() => detectUrlChange(), 100);
};

// Initial setup
if (location.href.includes('/watch')) {
  setTimeout(() => {
    if (!addCustomButtons()) {
      addCustomButtonsFallback();
    }
  }, 1000);
  // Try again after a longer delay to ensure UI is fully loaded
  setTimeout(() => {
    if (!addCustomButtons()) {
      addCustomButtonsFallback();
    }
  }, 3000);
}

// CSS styles
const style = document.createElement('style');
style.textContent = `
  #ytp-custom-watch-later-btn, #ytp-custom-save-btn {
    margin-right: 8px;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.2s ease;
    position: relative;
    z-index: 1000;
  }
  #ytp-custom-watch-later-btn:hover, #ytp-custom-save-btn:hover {
    opacity: 0.8;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  #ytp-custom-watch-later-btn svg, #ytp-custom-save-btn svg {
    width: 24px;
    height: 24px;
    fill: #fff;
  }
  .ytp-custom-buttons-container {
    display: flex !important;
    align-items: center;
    margin-left: auto;
    gap: 8px;
  }
`;
document.head.appendChild(style);
