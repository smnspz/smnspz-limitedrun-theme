# simonespazio storefront — MVP spec

## Problem Statement

Simone (the artist behind **simonespazio**) needs a public storefront to sell
merch and grow a mailing list of fans. He has a Limited Run store but no
theme that reflects the project: the default themes look generic, are not in
Italian, and bury the newsletter signup. He is starting from one T-shirt and
wants the site to still feel considered — not like a placeholder waiting for a
catalog to fill in.

## Solution

A minimal, editorial Limited Run theme, entirely in Italian, cream-on-near-black
with IBM Plex Sans throughout. The homepage is a two-column split that keeps
the mailing-list form visible at all times on the left and shows the current
**Merch** on the right, so a first-time visitor can either subscribe or buy
without scrolling or hunting. The **Carrello** is a custom minimal overlay,
not the default Limited Run drawer. Every other page (product, category,
order, 404) inherits the same restrained visual system. When more merch ships,
the layout scales without redesign.

## User Stories

1. As a first-time visitor, I want to land on the homepage and immediately understand what simonespazio is, so that I can decide whether to stay.
2. As a first-time visitor, I want the newsletter signup visible without scrolling, so that I can subscribe even if I don't buy today.
3. As a fan, I want to enter my email and hit "Iscriviti", so that I get notified about future drops.
4. As a fan submitting the newsletter form, I want a clear confirmation that my email was accepted, so that I don't submit it again.
5. As a shopper, I want to see the current **Merch** on the homepage, so that I can start browsing without clicking through a menu.
6. As a shopper, I want to click a merch item and see a product page with clear photos, size options, and price in Euro, so that I can decide to buy.
7. As a shopper on desktop, I want the product info and buy button to stay in view while I scroll through product images, so that I don't lose my place.
8. As a shopper on mobile, I want the same product page to stack vertically with images first and buy panel last, so that it's readable on my phone.
9. As a shopper, I want to see which sizes are **Esaurito** (with the size struck through and labelled "Esaurito"), so that I don't waste time trying to buy something unavailable.
10. As a shopper, I want to pick a size and add the item to the **Carrello**, so that I can check out.
11. As a shopper, I want a small "Carrello (n)" indicator in the corner that updates when I add an item, so that I have feedback my action worked.
12. As a shopper, I want to click the cart indicator and see a minimal overlay listing my items, quantities, and subtotal in Euro, so that I can review before checkout.
13. As a shopper, I want a "Vai al checkout" button in the cart overlay, so that I can complete my purchase through Limited Run's checkout.
14. As a shopper, I want to be able to close the cart overlay and keep browsing, so that I can add more items.
15. As a shopper who has completed an order, I want the order confirmation page to reflect the same visual language, so that the experience doesn't break at the last step.
16. As a shopper who mistyped a URL, I want the 404 page to look intentional and give me a link back home, so that I don't feel lost.
17. As any visitor, I want the wordmark "simonespazio" in the top-left of every page linking back home, so that navigation is obvious.
18. As any visitor, I want the footer to show email, Instagram, and a newsletter link, so that I can reach the artist without a dedicated contact page.
19. As any visitor, I want prices shown as `€ 25,00` (Italian formatting), so that the store reads as local.
20. As any visitor, I want every UI string in Italian (buttons, labels, states), so that the site reads consistently.
21. As the artist, I want to add a second, third, tenth merch item later without redesign, so that the theme grows with the project.
22. As the artist, I want new subscribers to land in the Limited Run mailing list I already manage in the admin, so that I don't juggle a third-party provider.
23. As the artist, I want the theme to build to a zip with `npm run build` and upload cleanly to Limited Run admin, so that shipping updates is trivial.
24. As the artist, I want the theme to validate `store.json` on every dev/build, so that I catch broken mock data before it becomes broken production data.

## Implementation Decisions

### Scope

- **Templates in v1**: `layouts/default.html`, `templates/index.html`, `templates/product.html`, `templates/category.html`, `templates/order.html`, `templates/404.html`. Every other stub template is removed from the zip (deleted from the repo).
- **Removed pages**: `contact.html`, `news*.html`, `history.html`, `roster*.html`, `gallery.html`, `events*.html`, `event.html`, `search.html`, `maintenance.html` (defer the last to a future spec if needed).

### Visual system

- **Palette**: background cream `#F5F1EA`, foreground near-black `#111111`, hairline rule `#111111` at 1px, no accent color. Interactive state = underline or inversion, never a new hue.
- **Typography**: IBM Plex Sans (SIL OFL), self-hosted from `stylesheets/`, WOFF2 only, weights **400** and **500**. Body 16px, line-height 1.45. All headings use the same 16px body size except the wordmark (24px, weight 400, lowercase). No display font — the wordmark is a signature, not a logotype.
- **Grid**: 12-column desktop with generous outer margins; two-column split on `index` and `product` pages; single column ≤768px.
- **Motion**: none for v1 (no scroll animations, no hover transitions beyond native browser defaults).

### Language & localization

- All strings hardcoded in Italian in the templates. No `_strings.html` snippet, no `config.locale`. If English is ever needed, that becomes a new spec.
- Prices formatted via `{{ price | money }}` (Limited Run's filter, currency comes from the store settings — store must be configured to EUR in Limited Run admin).

### Mailing list

- Native Limited Run endpoint. Form posts to `//newsletters.limitedrun.com/subscribe?store={{ store.subdomain }}` with a single `email` field and `target="_blank"` (Limited Run opens a confirmation tab). No third-party provider, no double-opt-in beyond what Limited Run provides.
- The form lives in a snippet (`snippets/newsletter.html`) so it can be included both in the homepage left column and the footer.

### Cart (Carrello)

- Custom TypeScript module `javascripts/cart.ts` (type-stripped only, no bundling — must be a single file with no cross-file imports, per AGENTS.md).
- Reads and mutates the platform's `window.Store.cart` global. Renders a minimal fixed overlay panel: line items (thumbnail, name, size, quantity, unit price, remove), subtotal, "Vai al checkout" link.
- A persistent "Carrello (n)" indicator in the layout top-right updates when `Store.cart` changes. On zero items, indicator reads "Carrello".
- On product pages, the "Aggiungi al carrello" button calls `Store.cart.add({ variation_id, quantity: 1 })` and opens the overlay.
- The default Limited Run cart drawer (`Store.cart.show()`) is never invoked.

### Product page

- Two-column desktop: left = image column (all product images stacked, no carousel), right = sticky buy panel (title, price, size selector, "Aggiungi al carrello" button, short description via `simple_format`).
- Mobile: single column, images first, buy panel last (non-sticky).
- Size selector: horizontal row of segmented buttons, one per `variation`. Selected size = inverted (near-black bg, cream fg). **Esaurito** sizes (via `variation.available?`) are struck through and non-clickable; the price row for that variation replaces the amount with "Esaurito".

### Homepage

- Two-column split: left column (persistent) = wordmark, ~2-paragraph Italian bio, newsletter signup, footer contact links. Right column = merch — one product today, an ordered list of products as more are added. Each row: thumbnail + name + price + link to product page.
- No hero image, no carousel, no "featured" state.

### Category page

- Reused as a filtered merch index. Same right-column layout as the homepage merch list; left column shows the category name and description.
- Only one category expected (`merch`) for v1; the template must still handle N.

### Order page

- Minimal: order number, state, items, totals. Same type and palette. No custom illustration.

### 404

- Wordmark, one line ("Pagina non trovata."), link back home.

### Configs

- `configs/default.json` `settings` for v1:
  - `bio_paragraph` (text) — the homepage bio paragraph
  - `instagram_url` (text) — footer link target
- No other merchant-configurable settings. Colors, fonts, and layout are code, not config.

### Stylesheet organization

- Convert `stylesheets/default.css` to `stylesheets/default.scss` (compiled automatically). Partials: `_tokens.scss` (colors, type scale, spacing), `_reset.scss`, `_layout.scss`, `_components.scss` (wordmark, size selector, cart overlay, newsletter form), `_pages.scss` (page-specific overrides).
- Any Liquid-interpolated value stays in a small plain `.css` file exposing CSS custom properties (per AGENTS.md constraint). None expected in v1 — bio and Instagram URL are content, not style.

### Meta & assets

- `<title>` = `simonespazio — {page-specific}`. Description hardcoded per template.
- Favicon: an in-repo SVG of the lowercase letter `s` on the cream background, no PNG raster.
- No OG image, no analytics, no cookie banner.

## Testing Decisions

Good tests here verify **rendered behavior**, not template implementation. Templates are declarative; asserting on their internals (that a `{% for %}` exists in a file) tells us nothing. What matters is: does the page render correctly against `store.json`, does the cart mutate `Store.cart` and reflect it in the DOM, and does the build produce a shippable zip.

### Seams to test at

1. **Data seam (`store.json` ↔ `store.schema.json`)** — validated automatically by `npm run dev` and `npm run build`. Every change to `store.json` must keep it schema-valid; every template addition must render against the fixture without throwing.
2. **Packaging seam (`npm run build`)** — must produce `dist/smnspz-limitedrun-theme.zip` with no errors. Failure = broken Liquid, missing snippet, or invalid config.
3. **Behavior seam (Playwright against `http://localhost:4567`)** — the only end-to-end surface for the cart overlay and the newsletter form.

### What we test

- **Cart overlay (Playwright)**: from product page, click size → click "Aggiungi al carrello" → assert overlay opens, contains the item with correct size and price, cart indicator shows `(1)`. Add a second item, assert subtotal. Remove an item, assert it disappears and subtotal updates. Close overlay, assert it hides. This is the only module with real logic worth testing.
- **Newsletter form (Playwright, DOM-only)**: assert the form's `action` attribute is the LR mailing list endpoint interpolated with `store.subdomain`, `method="post"`, has an `email` input marked `required`. We do NOT hit the real endpoint from tests — Limited Run will confirm-tab open in production.
- **Visual/layout (Playwright screenshots)**: full-page screenshots of `/`, `/products/:slug`, `/categories/:slug`, `/order/:key`, `/404`, at desktop (1280) and mobile (390) widths. Compared by eye, not diffed automatically.
- **Sold-out state**: with a variation whose `available?` is false in `store.json`, assert the size button is struck-through and non-clickable.

### Prior art

None in-repo — this is the first spec. The above seams are chosen to match how Limited Run themes are actually shipped (upload a zip; the platform runs the Liquid) rather than inventing an abstraction the platform doesn't have.

## Out of Scope

- News, roster, history, gallery, events, calendar module pages.
- English (or any non-Italian) copy.
- Music products (vinyl, cassette, digital). Store is merch-only at MVP.
- Restock notifications ("email me when back in stock").
- Search page.
- Custom maintenance page (default admin behavior is acceptable).
- Analytics, cookie banner, GDPR notice beyond what Limited Run already provides.
- Third-party newsletter integration (Mailchimp, Buttondown, Substack).
- OG images, dynamic per-product social cards.
- Any custom logo/wordmark artwork — text-only wordmark for v1.
- Motion, scroll animations, page transitions.
- Multiple color themes / dark mode toggle.
- Bundled JavaScript or npm-installed frontend libraries — the platform does not support bundling.

## Further Notes

- **Undocumented platform facts** the theme depends on: `store.subdomain` (used by the mailing-list form action), `{% contact_form %}` (not used in v1 but noted), and `Store.cart` JS globals (add/remove/get). These are not in the official articles but are present in Limited Run's own `hyde` reference theme. If Limited Run changes them, the newsletter form or cart will break silently — worth a smoke check after any platform update.
- **Local renderer caveats** (per AGENTS.md): some filters (`link_to*`, `money_without_currency`, `capitalize`) may render empty or unchanged in `npm run dev` but work in production. Do not "fix" apparent bugs in these filters locally — verify in the real store after upload.
- **Growth path**: adding merch items #2+ requires only new products in the admin (and new entries in `store.json` for local preview). No template changes. Adding a music release will require reintroducing product-type differentiation (`product.custom['type']` or a `music` category) — deferred until it's real.
