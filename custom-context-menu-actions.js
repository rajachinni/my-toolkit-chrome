const CUSTOM_CONTEXT_MENU_PARENT_ID = 'custom-context-menu-actions';
const CLOSE_OTHER_TABS_MENU_ID = 'close-other-tabs';
const MANAGE_EXTENSIONS_MENU_ID = 'manage-extensions';
const CLOSE_OTHER_TABS_COMMAND_ID = 'close-other-tabs-shortcut';

async function closeOtherTabs(activeTabId) {
    if (!activeTabId) {
        return;
    }

    const allTabs = await chrome.tabs.query({});
    const tabsToClose = allTabs
        .filter((openTab) => openTab.id && openTab.id !== activeTabId)
        .map((openTab) => openTab.id);

    if (tabsToClose.length > 0) {
        await chrome.tabs.remove(tabsToClose);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: CUSTOM_CONTEXT_MENU_PARENT_ID,
        title: 'My Extension',
        contexts: ['all']
    });

    chrome.contextMenus.create({
        id: CLOSE_OTHER_TABS_MENU_ID,
        parentId: CUSTOM_CONTEXT_MENU_PARENT_ID,
        title: 'Close Other Tabs',
        contexts: ['all']
    });

    chrome.contextMenus.create({
        id: MANAGE_EXTENSIONS_MENU_ID,
        parentId: CUSTOM_CONTEXT_MENU_PARENT_ID,
        title: 'Manage Extensions',
        contexts: ['all']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CLOSE_OTHER_TABS_MENU_ID && tab?.id) {
        await closeOtherTabs(tab.id);

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
        return;
    }
});

chrome.commands.onCommand.addListener(async (command) => {
    if (command !== CLOSE_OTHER_TABS_COMMAND_ID) {
        return;
    }

    const [activeTab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    await closeOtherTabs(activeTab?.id);
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.action === 'closeCurrentTab') {
        if (!sender.tab?.id) {
            return;
        }

        chrome.tabs.remove(sender.tab.id).catch(() => {
            // Ignore failures if the tab has already been closed.
        });
        return;
    }

    if (message?.action === 'closeOtherTabs') {
        closeOtherTabs(sender.tab?.id).catch(() => {
            // Ignore failures from stale tab state.
        });
    }
});
