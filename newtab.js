// Marks a tab this extension reopened itself, so it does not reopen it again.
const REOPENED_HASH = "#page";

function showHint(text) {
  if (text) {
    document.getElementById("hint-text").textContent = text;
  }
  document.getElementById("hint").hidden = false;
}

// Embedded, Firefox keeps the address bar empty, so it can be used for searching.
function embed(url) {
  const frame = document.createElement("iframe");
  frame.src = url;
  frame.referrerPolicy = "no-referrer";
  document.body.append(frame);
  frame.focus();

  // Title and icon come from frame.js running inside the embedded site.
  window.addEventListener("message", ({ source, data }) => {
    if (source !== frame.contentWindow || data?.type !== "frameInfo") {
      return;
    }
    document.title = data.title || new URL(url).hostname;
    setIcon(data.icon);
  });
}

function setIcon(href) {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }
  link.href = href;
}

async function redirect(url) {
  try {
    // Replacing the history entry keeps "Back" from returning to this empty page.
    const tab = await browser.tabs.getCurrent();
    await browser.tabs.update(tab.id, { url, loadReplace: true });
  } catch (error) {
    showHint(browser.i18n.getMessage("hintCannotOpen", [url, error.message]));
  }
}

async function main() {
  translatePage();
  document.getElementById("open-options").addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  const { url, mode, focusPage } = await loadSettings();
  if (!url) {
    showHint();
    return;
  }

  if (focusPage && location.hash !== REOPENED_HASH) {
    const target = mode === "embed" ? browser.runtime.getURL(`newtab.html${REOPENED_HASH}`) : url;
    if (await browser.runtime.sendMessage({ type: "reopenWithPageFocus", url: target })) {
      return;
    }
  }

  if (mode === "embed") {
    document.title = new URL(url).hostname;
    embed(url);
  } else {
    redirect(url);
  }
}

main();
