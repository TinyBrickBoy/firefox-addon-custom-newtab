const form = document.getElementById("form");
const input = document.getElementById("url");
const status = document.getElementById("status");

function setStatus(messageName, isError = false) {
  status.textContent = browser.i18n.getMessage(messageName);
  status.classList.toggle("error", isError);
}

// Without a scheme https:// is assumed, so "example.com" works.
function normalize(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withScheme);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RangeError("unsupported scheme");
  }
  return url.href;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  let url;
  try {
    url = normalize(input.value);
  } catch (error) {
    setStatus(error instanceof RangeError ? "errorScheme" : "errorInvalidUrl", true);
    return;
  }

  const mode = form.elements.mode.value;
  const focusPage = form.elements.focusPage.checked;

  // Must run before any other await, otherwise Firefox no longer treats it as a user action.
  if (url && mode === "embed") {
    const granted = await browser.permissions.request({ origins: [`*://*.${siteDomain(url)}/*`] });
    if (!granted) {
      setStatus("errorPermission", true);
      return;
    }
  }

  await browser.storage.local.set({ url, mode, focusPage });
  input.value = url;
  setStatus(url ? "saved" : "removed");
});

translatePage();
loadSettings().then(({ url, mode, focusPage }) => {
  input.value = url;
  form.elements.mode.value = mode;
  form.elements.focusPage.checked = focusPage;
});
