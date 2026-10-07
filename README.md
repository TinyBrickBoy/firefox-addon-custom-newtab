[![Install](https://img.shields.io/badge/Install-Firefox_Addon-FF7139?style=for-the-badge&logo=firefox)](https://addons.mozilla.org/firefox/addon/custom-new-tab-url/)

# Custom New Tab URL

Firefox add-on that opens any website in new tabs. It shows up as an extra choice
in the Firefox settings under **Home → New tabs**.

- **Address bar stays empty:** the site is embedded into the new tab, so you can
  search from the address bar as usual.
- **Cursor goes into the page,** not into the address bar (can be turned off).
- **Tab shows the site's title and icon.**
- **Redirect mode** as a fallback for sites that do not work embedded.
- English and German.

## Need a start page?

Try [**Startpage**](https://github.com/TinyBrickBoy/startpage), a minimal,
customizable start page with clock, weather, smart search, bookmarks, news feeds
and notes. It is a single HTML file with no build step or dependencies. Set
<https://tinybrickboy.github.io/startpage> as your new tab URL and it opens in
every new tab.

[![Startpage](https://raw.githubusercontent.com/TinyBrickBoy/startpage/main/screenshots/dark.png)](https://github.com/TinyBrickBoy/startpage)

## Usage

1. Install the add-on.
2. Enter a URL in the add-on settings (opens automatically after installing).
3. In the Firefox settings under **Home → New tabs**, select **Custom New Tab URL**.

### Embed or redirect?

| Mode | Address bar | Notes |
| --- | --- | --- |
| Embed (default) | empty | Some sites show you as signed out, because Firefox restricts cookies in embedded pages. |
| Redirect | shows the URL | The site behaves exactly like when opened normally. |

To embed a site, the add-on removes the `X-Frame-Options` and
`Content-Security-Policy` headers, but only for the configured site and only
when it is loaded inside the new tab. Firefox asks for permission for that site
when you save.

Only `http://` and `https://` URLs are supported. Firefox does not let add-ons
open `about:` or `file:` pages.

## License

[MIT](LICENSE)
