// Runs inside the embedded site. It reports the site's title and icon to the new
// tab page around it, so the tab shows them instead of a generic title, and it
// opens links and forms in the whole tab instead of inside the frame.
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

  // Targets that would load the next page inside the frame. Named targets and
  // "_blank" already open elsewhere and are left alone.
  const staysInFrame = (target) => ["", "_self", "_parent"].includes(target.toLowerCase());

  // Capturing on window runs before the site's own handlers. A site that handles
  // the click itself (preventDefault) is not affected.
  window.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href], area[href]");
    if (link && staysInFrame(link.target)) {
      link.target = "_top";
    }
  }, true);

  window.addEventListener("submit", (event) => {
    const form = event.target;
    const submitter = event.submitter;
    if (submitter?.hasAttribute("formtarget")) {
      if (staysInFrame(submitter.formTarget)) {
        submitter.formTarget = "_top";
      }
    } else if (staysInFrame(form.target)) {
      form.target = "_top";
    }
  }, true);
}
