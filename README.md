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

## Development

```sh
npx web-ext run    # start Firefox with the add-on loaded
npx web-ext lint   # validate
```

## Releases

Publishing a GitHub release submits the version to addons.mozilla.org through
[`.github/workflows/main.yml`](.github/workflows/main.yml) and attaches the built
`.zip` to the release.

1. Bump `version` in `manifest.json`.
2. Create a release with the tag `1.2.3` or `v1.2.3`, matching that version.

The repository needs the secrets `AMO_API_KEY` and `AMO_API_SECRET`
(created at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/developers/addon/api/key/)).

## License

[MIT](LICENSE)
