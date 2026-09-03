// Cart overlay controller for the simonespazio theme.
// Runs on every page (layout injects it). Handles: size-selector state on product
// pages, add-to-cart, cart indicator count, and the fixed cart overlay panel.
//
// Sizing / behaviour notes:
// - Limited Run exposes a `window.Store.cart` runtime whose public shape is
//   undocumented beyond `.add(variationId)`. We treat it as the source of truth
//   for submitting purchases (calling `Store.cart.add`) but mirror the cart
//   state locally in sessionStorage so we can render the overlay ourselves
//   without depending on undocumented read APIs.
// - AGENTS.md constraint: this must be a single file. No imports.

interface LineItem {
  variationId: string;
  productId: string;
  name: string;
  size: string;
  unitPrice: number;
  quantity: number;
  thumb: string;
}

interface StoreCartApi {
  add?: (variationId: string | number) => void;
  show?: () => void;
}

declare global {
  interface Window {
    Store?: { cart?: StoreCartApi };
  }
}

const STORAGE_KEY = "smnspz.cart.v1";
const CURRENCY = "EUR";
const LOCALE = "it-IT";

// Format a numeric price as an Italian EUR string (e.g. "€ 25,00").
function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
  }).format(amount);

  return formatted;
}

// Read the local cart mirror from sessionStorage. Returns [] on any failure.
function loadCart(): LineItem[] {
  try {
    // Get the serialised cart
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as LineItem[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Persist the local cart mirror to sessionStorage.
function saveCart(items: LineItem[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or disabled — best effort.
  }
}

// Increment a line item (matching by variationId) or append a new one.
function addLine(items: LineItem[], line: LineItem): LineItem[] {
  const next = items.slice();
  const idx = next.findIndex((i) => i.variationId === line.variationId);

  if (idx >= 0) {
    next[idx] = { ...next[idx], quantity: next[idx].quantity + line.quantity };
  } else {
    next.push(line);
  }

  return next;
}

// Remove a line item by variationId.
function removeLine(items: LineItem[], variationId: string): LineItem[] {
  return items.filter((i) => i.variationId !== variationId);
}

// Sum unit prices × quantities.
function subtotal(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

// Total item count across all lines.
function itemCount(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// Refresh the top-right cart indicator to reflect the current count.
function renderIndicator(items: LineItem[]): void {
  const el = document.querySelector<HTMLElement>("[data-cart-indicator]");

  if (!el) return;

  const count = itemCount(items);
  el.textContent = count > 0 ? `Carrello (${count})` : "Carrello";
}

// Rebuild the cart overlay body (items list + subtotal + checkout link).
function renderOverlay(items: LineItem[]): void {
  const body = document.querySelector<HTMLElement>("[data-cart-body]");

  if (!body) return;

  if (items.length === 0) {
    body.innerHTML = `<p class="cart-empty">Il carrello è vuoto.</p>`;
    return;
  }

  const rows = items
    .map(
      (i) => `
      <div class="cart-item" data-variation-id="${i.variationId}">
        <div class="cart-item__thumb">${i.thumb ? `<img src="${i.thumb}" alt="">` : ""}</div>
        <div class="cart-item__meta">
          <span class="cart-item__name">${i.name}</span>
          <span>Taglia ${i.size} · ${i.quantity} pz</span>
          <a href="#" class="cart-item__remove" data-cart-remove="${i.variationId}">Rimuovi</a>
        </div>
        <span class="cart-item__price">${formatPrice(i.unitPrice * i.quantity)}</span>
      </div>`,
    )
    .join("");

  body.innerHTML = `
    <div class="cart-items">${rows}</div>
    <div class="cart-subtotal"><span>Subtotale</span><span>${formatPrice(subtotal(items))}</span></div>
    <a class="cart-checkout" href="/cart">Vai al checkout</a>
  `;
}

// Show/hide the overlay by toggling data-open and the [hidden] attribute.
function setOverlayOpen(open: boolean): void {
  const overlay = document.querySelector<HTMLElement>("[data-cart-overlay]");

  if (!overlay) return;

  if (open) {
    overlay.hidden = false;
    overlay.dataset.open = "true";
  } else {
    overlay.hidden = true;
    delete overlay.dataset.open;
  }
}

// Rerender everything cart-related from the current storage.
function refresh(): void {
  const items = loadCart();
  renderIndicator(items);
  renderOverlay(items);
}

// Product page: manage the size selector's aria-pressed state and enable/disable
// the "Aggiungi al carrello" button based on whether a size is picked.
function wireSizeSelector(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".size"));
  const buyBtn = document.querySelector<HTMLButtonElement>("[data-add-to-cart]");

  if (buttons.length === 0 || !buyBtn) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;

      buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      buyBtn.disabled = false;
    });
  });
}

// Product page: on buy click, call Store.cart.add (if available), mirror the
// line locally, and open the overlay.
function wireAddToCart(): void {
  const buyBtn = document.querySelector<HTMLButtonElement>("[data-add-to-cart]");

  if (!buyBtn) return;

  buyBtn.addEventListener("click", () => {
    // Get the currently selected size
    const selected = document.querySelector<HTMLButtonElement>('.size[aria-pressed="true"]');
    const article = document.querySelector<HTMLElement>("[data-product-id]");
    const title = document.querySelector<HTMLElement>(".product-title");
    const firstImg = document.querySelector<HTMLImageElement>(".product-images img");

    if (!selected || !article || !title) return;

    const variationId = selected.dataset.variationId ?? "";
    const size = selected.dataset.variationName ?? "";
    const unitPrice = parseFloat(selected.dataset.variationPrice ?? "0");

    // Ask the platform to add the item (undocumented but present per skeleton theme)
    const api = window.Store?.cart;

    if (api?.add) {
      api.add(variationId);
    }

    // Mirror locally so we can render our overlay without reading Store.cart
    const items = loadCart();
    const nextItems = addLine(items, {
      variationId,
      productId: article.dataset.productId ?? "",
      name: title.textContent?.trim() ?? "",
      size,
      unitPrice,
      quantity: 1,
      thumb: firstImg?.src ?? "",
    });

    saveCart(nextItems);
    refresh();
    setOverlayOpen(true);
  });
}

// Header: opening the overlay from the indicator; closing from the panel button
// or the backdrop.
function wireOverlayControls(): void {
  const indicator = document.querySelector<HTMLElement>("[data-cart-indicator]");
  const overlay = document.querySelector<HTMLElement>("[data-cart-overlay]");
  const closeBtn = document.querySelector<HTMLElement>("[data-cart-close]");

  indicator?.addEventListener("click", (e) => {
    e.preventDefault();
    setOverlayOpen(true);
  });

  closeBtn?.addEventListener("click", () => setOverlayOpen(false));

  overlay?.addEventListener("click", (e) => {
    // Only close on backdrop click, not on panel clicks
    if (e.target === overlay) setOverlayOpen(false);
  });

  // Delegate remove-line clicks inside the panel body
  overlay?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    const removeLink = target?.closest<HTMLElement>("[data-cart-remove]");

    if (!removeLink) return;

    e.preventDefault();
    const variationId = removeLink.dataset.cartRemove ?? "";
    const nextItems = removeLine(loadCart(), variationId);
    saveCart(nextItems);
    refresh();
  });
}

// Boot: wire everything after DOM ready.
function boot(): void {
  wireSizeSelector();
  wireAddToCart();
  wireOverlayControls();
  refresh();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
