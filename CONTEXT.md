# smnspz storefront

The Limited Run storefront theme for **simonespazio**, an Italian solo music
project. The site is merch-first and treats mailing-list signup as a
first-class conversion goal alongside purchases.

## Language

**simonespazio**:
The music project this store belongs to. Also the site's wordmark, rendered
lowercase in the body typeface — there is no separate logo.
_Avoid_: smnspz (repo slug only), Simone, "the artist"

**Merch**:
A physical item sold through the store (e.g. a T-shirt). Every merch item is
a Limited Run `product` with one or more size `variation`s.
_Avoid_: Product (reserved for the Liquid object), item, good

**Release**:
Recorded music by simonespazio. Out of scope for the store today; may become a
merch category later (vinyl, cassette).
_Avoid_: Album, record, drop

**Iscritto** (subscribers):
An email address captured through the native Limited Run mailing-list
endpoint at `newsletters.limitedrun.com/subscribe`. The store's newsletter
audience.
_Avoid_: Follower, lead, contact, member

**Carrello**:
The shopping cart. JavaScript-only (Limited Run exposes no `cart` Liquid
object); rendered as a custom minimal overlay driven by `Store.cart`.
_Avoid_: Bag, basket, cart drawer

**Esaurito**:
The sold-out state of a size `variation`. Rendered as a struck-through size
button with the label "Esaurito" replacing the price.
_Avoid_: Out of stock, unavailable, sold out
