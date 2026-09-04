# Changelog

All notable changes to this theme are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-09-04

### Added
- Two-column desktop home: sticky left column with ASCII-art hero and
  native Limited Run newsletter signup; scrollable right column with a
  merch grid (image + `name > price`). Collapses to a single stack on
  mobile.
- Sticky site header (wordmark left, `Carrello` right) and fixed footer
  (contact links) — both with opaque backgrounds so scrolling content
  passes cleanly beneath. iOS `text-size-adjust` guard to keep the
  ASCII portrait from stretching on Safari.
- Merchant-configurable settings (Storefront → Options): contact email,
  Instagram URL, Musica URL, favicon, custom webfont family + URL.
  Font is loaded via a Liquid-processed `stylesheets/font.css` that
  exposes the family name as a CSS custom property to SCSS.
- Product detail page: stacked images left with viewport-capped
  `max-height`, sticky info panel right (title, price, size buttons,
  add-to-cart, description). Single column on mobile.
- Cart integration via Limited Run's default drawer
  (`Store.cart.add()` / `Store.cart.show()`); no custom overlay.
- Mock `store.json` with six sample products for local preview.

[Unreleased]: https://github.com/smnspz/smnspz-limitedrun-theme/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/smnspz/smnspz-limitedrun-theme/releases/tag/v1.0.0
