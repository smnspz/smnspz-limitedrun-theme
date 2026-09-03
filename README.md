# smnspz-limitedrun-theme

A [Limited Run](https://limitedrun.com/) storefront theme for
**simonespazio**, in Italian. Minimal, monospace, editorial.

## Layout

Two-column on desktop:

- **Left column** (sticky, fills viewport height): ASCII-art hero +
  newsletter signup (native LR mailing list endpoint).
- **Right column** (scrolls): merch grid — image, then `name > price`.

On mobile the columns collapse into a single stack: ASCII → newsletter →
merch. The site header (wordmark left, `Carrello` right) is sticky at the
top, the footer (contact links) is fixed at the bottom. Both have opaque
backgrounds so scrolling content passes cleanly beneath.

Cart is Limited Run's default drawer (`Store.cart.show()` / `.add()`); this
theme adds no custom cart UI on top.

## Develop

```sh
npm run dev      # preview at http://localhost:4567, live-reloads on save
npm run build    # produce dist/smnspz-limitedrun-theme.zip
```

Edit `store.json` to change the mock data the preview renders against;
`store.json` is a local mock only and is never shipped in the zip.

## SCSS / TypeScript

`.scss` and `.ts` files under `stylesheets/` and `javascripts/` are compiled
to plain `.css`/`.js` on `dev` and `build` — no config, no extra install.
Sass partials are `_name.scss`; `.ts` is type-stripped only (no bundling).

Merchant-configurable values (font URL, contact email, etc.) go through a
Liquid-processed `stylesheets/font.css`, which sets CSS custom properties
that the SCSS consumes with `var(--…)`. This sidesteps the fact that SCSS
is not Liquid-aware.

## Merchant settings (Storefront → Options)

| Setting | Purpose |
| ------- | ------- |
| Email di contatto | `mailto:` target for the footer email link |
| URL Instagram | Footer Instagram link |
| URL Musica | Footer Musica link (Bandcamp / Spotify / etc.) |
| Favicon | Favicon image (upload via HTML/CSS panel) |
| Font — nome famiglia | CSS family name (e.g. `Berkeley Mono`); empty = system mono |
| Font — URL del file | URL returned by HTML/CSS → Upload font |

All settings default to empty; templates render blank links (or a system
mono fallback) until values are supplied.

## Deploy

`npm run build`, then upload `dist/smnspz-limitedrun-theme.zip` in the LR
admin under Storefront → Themes. Every upload creates a **new** "Imported
…" theme card — you must click **"Use This Theme"** on the newest one to
activate it.

See [`docs/limited-run-quirks.md`](./docs/limited-run-quirks.md) — if it
exists in your fork — or the upstream `AGENTS.md` production-quirks section
for the full list of undocumented LR gotchas we hit while shipping v1.
