const CLOSE_OTHER_TABS_MENU_ID = 'close-other-tabs';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: CLOSE_OTHER_TABS_MENU_ID,
        title: 'Close Other Tabs',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== CLOSE_OTHER_TABS_MENU_ID || !tab?.id) {
        return;
    }

    const allTabs = await chrome.tabs.query({});
    const tabsToClose = allTabs
        .filter((openTab) => openTab.id && openTab.id !== tab.id)
        .map((openTab) => openTab.id);

    if (tabsToClose.length === 0) {
        return;
    }

    await chrome.tabs.remove(tabsToClose);
});
