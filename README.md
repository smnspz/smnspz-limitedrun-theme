# smnspz-limitedrun-theme

A [Limited Run](https://limitedrun.com/) theme.

## Develop

```sh
npm run dev      # preview at http://localhost:4567, live-reloads on save
npm run build    # produce dist/smnspz-limitedrun-theme.zip
```

Edit `store.json` to change the mock data the preview renders against.
`store.json` is a local mock only — it is never uploaded to Limited Run.

## SCSS / TypeScript (optional)

Rename a stylesheet to `.scss` or a script to `.ts` and it is compiled to
plain `.css`/`.js` on `dev` and `build` automatically — no config, no extra
install. Sass partials are `_name.scss`; `.ts` is type-stripped only (no
bundling). Keep `{{ config[...] }}` out of `.scss` — use a plain `.css` file
with CSS custom properties for merchant-configurable values.

## Deploy

`npm run build`, then upload `dist/smnspz-limitedrun-theme.zip` in the Limited Run admin
under Storefront → Themes.
