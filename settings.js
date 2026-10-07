// Shared by background, new tab and options page.
const DEFAULT_SETTINGS = {
  url: "",
  mode: "embed", // "embed" keeps the address bar empty, "redirect" navigates the tab
  focusPage: true, // put the cursor into the page instead of the address bar
};

function loadSettings() {
  return browser.storage.local.get(DEFAULT_SETTINGS);
}

// "www.example.com" and "example.com" should share one rule and one permission.
function siteDomain(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function translatePage() {
  document.documentElement.lang = browser.i18n.getUILanguage();
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = browser.i18n.getMessage(element.dataset.i18n);
  }
}
