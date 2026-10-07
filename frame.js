// Runs inside the embedded site and reports its title and icon to the new tab
// page around it, so the tab shows them instead of a generic title.
if (window !== window.top && window.parent === window.top) {
  // postMessage only delivers this if the parent really is this extension's page.
  const extensionOrigin = browser.runtime.getURL("").replace(/\/$/, "");
  let lastReport = "";

  const report = () => {
    const icon = document.querySelector('link[rel~="icon"]')?.href ?? new URL("/favicon.ico", location.href).href;
    const message = { type: "frameInfo", title: document.title, icon };
    const serialized = JSON.stringify(message);
    if (serialized !== lastReport) {
      lastReport = serialized;
      window.parent.postMessage(message, extensionOrigin);
    }
  };

  new MutationObserver(report).observe(document.head ?? document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
  report();
}
