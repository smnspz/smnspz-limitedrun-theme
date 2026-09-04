/# smnspz-limitedrun-theme — agent guide

This is a [Limited Run](https://limitedrun.com/) storefront theme: Liquid
templates plus CSS and JavaScript. It is built and previewed locally with
@limitedrun/cli; there is no theme *deployment* API, so shipping means uploading
a zip by hand in the Limited Run admin. (The Liquid templating API is documented
in the reference at the end of this file.)

## Commands

    npm run dev      # preview server on http://localhost:4567, live-reloads on save
    npm run build    # writes dist/smnspz-limitedrun-theme.zip in the platform's export layout

Run "npm install" first if node_modules/ is missing.

## Layout — do not rename these directories

    configs/default.json   theme settings schema (name, description, settings.*)
    layouts/default.html   the wrapper; page templates render into {{ content }}
    templates/*.html       one file per page type (see the table below)
    snippets/*             partials pulled in with {% include 'file.html' %}
    stylesheets/*.css      run through Liquid on serve/build (see below)
    stylesheets/*.scss     compiled to .css automatically (optional, see below)
    javascripts/*.js       served verbatim
    javascripts/*.ts       transpiled to .js automatically (optional, see below)
    store.json             LOCAL MOCK DATA — never shipped, edit freely
    store.schema.json      JSON Schema for store.json (validated on dev + build)

## Editing rules

- Keep layouts/default.html as the single wrapper; every non-standalone template
  is injected as {{ content }}.
- store.json must stay valid against store.schema.json — "npm run dev" fails
  loudly with the offending paths otherwise. Add fields freely, but match the
  shapes real templates read (product.price_range, store.roster.items, …).
- Stylesheets are Liquid-processed with only "config" in scope. Use
  {% assign x = config['some_setting'] %} then {{ x }}; add a matching key under
  "settings" in configs/default.json so it appears in the admin.
- After any change, run "npm run build" — it re-validates and produces the
  uploadable zip. Fix anything it reports before handing back.

## SCSS and TypeScript (optional)

Drop a ".scss" file in stylesheets/ or a ".ts" file in javascripts/ and it is
compiled to plain ".css"/".js" on both "npm run dev" and "npm run build" — the
zip only ever contains ".css"/".js". No config, no extra install.

- Sass files starting with "_" are partials (not emitted); "@use"/"@import"
  resolve against the file's directory.
- ".ts" is type-erased only — one file in, one file out. No bundling, no
  imports across files.
- Sass is not Liquid-aware. Keep "{{ config[...] }}" out of ".scss"; put those
  values in a plain ".css" file (":root { --x: {{ config['x'] }} }") and read
  them in Sass with "var(--x)".

## Deploy

"npm run build", then upload dist/smnspz-limitedrun-theme.zip in the Limited Run admin under
Storefront → Themes. store.json and store.schema.json are excluded from the zip
automatically. A versioned copy dist/smnspz-limitedrun-theme-<version>.zip is
emitted alongside for archival.

Every build also writes snippets/version.html (gitignored) containing an HTML
comment with the version, ISO date, and short git SHA. layouts/default.html
includes it as the first line inside <head>, so "view-source" on the live
storefront reveals which build is running.

## Releasing

Versioning is SemVer, tagged in git, documented in CHANGELOG.md
(Keep a Changelog format). Bumps happen at release moments, not per upload.

    # 1. Curate CHANGELOG.md from commits since the last tag.
    git log v<last>..HEAD --oneline
    # Move [Unreleased] entries under a new "## [x.y.z] — YYYY-MM-DD" heading;
    # add a fresh empty [Unreleased] above; update compare/tag link refs.

    # 2. Bump, tag, and push in one shot.
    npm version <patch|minor|major>
    # → "version" hook: git add CHANGELOG.md (lands in the version commit)
    # → npm: commit + tag v<x.y.z>
    # → "postversion" hook: git push --follow-tags

    # 3. Build and upload the versioned zip.
    npm run build
    # → dist/smnspz-limitedrun-theme.zip
    # → dist/smnspz-limitedrun-theme-<x.y.z>.zip

Upload the zip in the LR admin and click "Use This Theme" on the new card.

Pushing a v*.*.* tag also triggers .github/workflows/release.yml, which builds
the theme in CI, extracts the matching section from CHANGELOG.md as the release
body, and publishes a GitHub Release with the versioned zip attached.

No pre-releases (no rc/beta). SemVer contract: MAJOR = breaking
layout/settings requiring re-configuration; MINOR = new features/settings;
PATCH = fixes with no merchant-visible change.

---

## Limited Run Theme API — reference

Templating is **Ruby Liquid**, ~2.6-era (2013), **not Shopify Liquid**: no
{% render %}, no {%- whitespace control -%}, no map/where/default filters.
Standard {{ output }} / {% tag %} plus the Limited Run objects and filters below.
Official docs are the only authority and are thin:

- https://help.limitedrun.com/articles/4-theme-api-custom-html  (objects, filters, tags)
- https://help.limitedrun.com/articles/3-anatomy-of-a-theme     (files, configs/default.json)

Everything marked (unofficial) below comes from Limited Run's own "Skeleton"
theme, not the articles — real, but undocumented.

### Standard tags (Liquid 2.6 built-ins)

    {% if %} {% elsif %} {% else %} {% unless %} {% for x in y limit:5 %}
    {% assign %} {% capture %} {% case %} {% cycle %} {% comment %} {% raw %} {% tablerow %}
    forloop.first / forloop.last / forloop.index

### Objects (official; "store" is available in every asset)

    store        .name .url
                 .products .categories .events .pages .mailbox
                 .news(.items) .history(.items) .gallery(.items)
                 .calendar(.events) .roster(.items)
    category     .name .slug .url .custom['k']  |  .products
    product      .state .name .slug .description .url .price_range
                 .music_catalog_number .music_pressing_information .custom['k']
                 .categories .images .variations .music_track_listings
                 predicates: .available? .announced? .unavailable? .unlisted?
    event        like product + (unofficial) .starts_at .venue .images .variations
    image        .url .v075_url .v150_url .v200_url .v300_url .v600_url
    variation    .name .description .price .weight .requires_exact_payment .available?
    order        .key .number .state .status .transaction_id .item_count .digital
                 .subtotal .shipping .total_price .total_weight .attempted?
                 .items .downloads .customer .shipping_address
    order item   .name .digital .unit_price .quantity .total_price .total_weight
    customer     .email .first_name .last_name
    address      .first_name .last_name .street_address_1 .street_address_2
                 .city .state .postal_code .country
    page         .title .path .url .body
    news item    .title .slug .url .body .published_at .custom['k']
    history item .released_on .released_by .catalog_number .name .description
                 .release_information .images .links
    roster item  .name .slug .description .url .custom['k']
                 .history_items .images .links .products
    link         .name .url
    config       config['setting_key']  (also usable inside stylesheets)

Module-gated: news / history / roster / gallery / calendar objects exist only if
that paid module is enabled on the store.

### Custom filters (official — article #4)

    asset_url            {{ 'default.css' | asset_url | stylesheet_tag: 'screen' }}
    stylesheet_tag[: media]   script_tag   img_tag[: 'class']   favicon_tag (unofficial)
    link_to: url    link_to_javascript: js
    link_to_category  link_to_product  link_to_page  link_to_news_item
    link_to_download  link_to_roster_item (unofficial)
    money   money_with_currency   money_without_currency
    ordinalize   simple_format
    capitalize (title-cases EVERY word — differs from standard Liquid)  downcase  upcase
    first  last  join: sep  size
    standard Liquid: date  escape  strip_html  strip_newlines  replace  strip

### Custom tags

    {% include 'snippet.html' %}                              (official — Anatomy)
    {% paginate store.products by 30 %}                        (official)
      … {{ store.products_pagination }} …
    {% endpaginate %}
      pagination vars seen: store.products_pagination, store.events_pagination,
      category.products_pagination, news.items_pagination,
      history.items_pagination, gallery.items_pagination
    {% contact_form %} … {% endcontact_form %}                 (unofficial)
      required fields: message[name] message[email] message[body]  (+ opt message[subject])
    {% captcha clean %}   themes: red white blackglass clean    (unofficial)
    {{ store_script_tag }}   REQUIRED once per page — loads store.js cart JS  (unofficial)

### Template → page (files official unless noted; routes are unverified guesses)

    default.html      layout, wraps every page ({{ content }})        official
    index.html        home / product grid                             official   /
    category.html     a category (vars: category, category.products)  official   /categories/:slug
    product.html      a product (var: product)                        official   /products/:slug
    order.html        order status (var: order)                       official
    maintenance.html  store-closed page (own <!DOCTYPE>, config only) official
    404.html          not found                                       official
    news.html / news-item.html    news index / post (var: item)       official
    history.html / gallery.html   module index pages                  official
    contact.html      contact form (vars: message, store.mailbox)     official
    event.html / events.html      a show / shows listing              unofficial
    roster.html / roster-item.html   artists / one artist             unofficial (roster-item takes ?section=products)
    search.html       product search (vars: products, query)          unofficial   /products/search?q=

### configs/default.json (official — Anatomy)

    root:    name, description, author{name,website},
             images[{thumbnail,original}], settings{}
             (Skeleton also uses: sort <number>)
    setting: REQUIRED  key, format, label, position (number)
             OPTIONAL  default, help, placeholder
             format:   "image" | "color" | "text" | "boolean"
             (Skeleton also uses "content_type": true — undocumented)

### Not supported / unknown (no official statement either way)

- No "cart" Liquid object — the cart is JavaScript only (Store.cart.add /
  Store.cart.show).
- No multiple layouts, sections, metafields, i18n, or configs other than
  default.json.
- No documented output size or loop limits.

This local renderer is a best-effort approximation: some filters above
(link_to, link_to_javascript, link_to_product, money_without_currency,
capitalize) may render empty or unchanged in preview but work in production.
