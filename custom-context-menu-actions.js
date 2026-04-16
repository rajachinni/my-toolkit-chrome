const CUSTOM_CONTEXT_MENU_PARENT_ID = 'custom-context-menu-actions';
const CLOSE_OTHER_TABS_MENU_ID = 'close-other-tabs';
const MANAGE_EXTENSIONS_MENU_ID = 'manage-extensions';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: CUSTOM_CONTEXT_MENU_PARENT_ID,
        title: 'My Extension',
        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: CLOSE_OTHER_TABS_MENU_ID,
        parentId: CUSTOM_CONTEXT_MENU_PARENT_ID,
        title: 'Close Other Tabs',
        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: MANAGE_EXTENSIONS_MENU_ID,
        parentId: CUSTOM_CONTEXT_MENU_PARENT_ID,
        title: 'Manage Extensions',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CLOSE_OTHER_TABS_MENU_ID && tab?.id) {
        const allTabs = await chrome.tabs.query({});
        const tabsToClose = allTabs
            .filter((openTab) => openTab.id && openTab.id !== tab.id)
            .map((openTab) => openTab.id);

        if (tabsToClose.length > 0) {
            await chrome.tabs.remove(tabsToClose);
        }

        return;
    }

    if (info.menuItemId === MANAGE_EXTENSIONS_MENU_ID) {
        try {
            if (tab?.id) {
                await chrome.tabs.update(tab.id, { url: 'chrome://extensions' });
                return;
            }
        } catch (error) {
            // Fall back to opening in a new tab when current-tab navigation is blocked.
        }

        await chrome.tabs.create({ url: 'chrome://extensions' });
    }
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.action !== 'closeCurrentTab') {
        return;
    }

    if (!sender.tab?.id) {
        return;
    }

    chrome.tabs.remove(sender.tab.id).catch(() => {
        // Ignore failures if the tab has already been closed.
    });
});
