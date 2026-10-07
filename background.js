const EMBED_RULE_ID = 1;
const FRAME_SCRIPT_ID = "frame-info";

browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.runtime.openOptionsPage();
  }
  syncEmbedding();
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && ("url" in changes || "mode" in changes)) {
    syncEmbedding();
  }
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "reopenWithPageFocus") {
    return reopenWithPageFocus(sender.tab, message.url);
  }
});

// Firefox always puts the cursor into the address bar of a new tab, and the page
// cannot take the focus back. A tab opened by an extension gets page focus, so
// the new tab is replaced by an identical one. This runs here and not in the page,
// because closing the tab would stop the page's script halfway.
async function reopenWithPageFocus(tab, url) {
  const properties = { url, index: tab.index, windowId: tab.windowId, active: tab.active };
  if (tab.openerTabId !== undefined) {
    properties.openerTabId = tab.openerTabId;
  }
  if (tab.cookieStoreId !== "firefox-default") {
    properties.cookieStoreId = tab.cookieStoreId;
  }

  try {
    await browser.tabs.create(properties);
  } catch {
    return false;
  }
  const closedAfter = Date.now();
  await browser.tabs.remove(tab.id);
  await forgetClosedTab(tab.url, closedAfter);
  return true;
}

// Keeps the replaced tab out of "Reopen Closed Tab". Firefox records closed tabs
// with a short delay, so this waits until the entry shows up.
async function forgetClosedTab(url, closedAfter) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const [closed] = await browser.sessions.getRecentlyClosed({ maxResults: 1 });
    if (closed?.tab?.url === url && closed.lastModified >= closedAfter) {
      await browser.sessions.forgetClosedTab(closed.tab.windowId, closed.tab.sessionId);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Many sites forbid framing via X-Frame-Options/CSP. Those headers are removed
// only for the configured site and only when it loads as a frame. A content
// script reports the site's title and icon back to the new tab page.
async function syncEmbedding() {
  const { url, mode } = await loadSettings();
  const embedded = Boolean(url) && mode === "embed";
  const domain = embedded ? siteDomain(url) : "";

  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [EMBED_RULE_ID],
    addRules: embedded
      ? [{
          id: EMBED_RULE_ID,
          condition: { requestDomains: [domain], resourceTypes: ["sub_frame"] },
          action: {
            type: "modifyHeaders",
            responseHeaders: [
              { header: "x-frame-options", operation: "remove" },
              { header: "content-security-policy", operation: "remove" },
            ],
          },
        }]
      : [],
  });

  const registered = await browser.scripting.getRegisteredContentScripts({ ids: [FRAME_SCRIPT_ID] });
  if (registered.length) {
    await browser.scripting.unregisterContentScripts({ ids: [FRAME_SCRIPT_ID] });
  }
  if (embedded) {
    await browser.scripting.registerContentScripts([{
      id: FRAME_SCRIPT_ID,
      matches: [`*://*.${domain}/*`],
      js: ["frame.js"],
      allFrames: true,
      runAt: "document_end",
    }]);
  }
}
