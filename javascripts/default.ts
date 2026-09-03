// Product page controller for the simonespazio theme.
// Handles size-selector state on the product page and hands cart operations
// off to Limited Run's built-in `window.Store.cart` runtime (which owns the
// cart drawer UI, count, and checkout flow).

interface StoreCartApi {
  add?: (variationId: string | number) => void;
  show?: () => void;
}

declare global {
  interface Window {
    Store?: { cart?: StoreCartApi };
  }
}

// Product page: manage the size selector's aria-pressed state and enable the
// "Aggiungi al carrello" button once a size is picked.
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

// Product page: on buy click, hand the selected variation to Store.cart.add
// and open Limited Run's default cart drawer.
function wireAddToCart(): void {
  const buyBtn = document.querySelector<HTMLButtonElement>("[data-add-to-cart]");

  if (!buyBtn) return;

  buyBtn.addEventListener("click", () => {
    // Get the currently selected size
    const selected = document.querySelector<HTMLButtonElement>('.size[aria-pressed="true"]');

    if (!selected) return;

    const variationId = selected.dataset.variationId ?? "";
    const api = window.Store?.cart;

    // Add to Limited Run's cart
    if (api?.add) api.add(variationId);

    // Open Limited Run's cart drawer
    if (api?.show) api.show();
  });
}

// Header: clicking the cart indicator opens the LR default cart drawer.
function wireCartIndicator(): void {
  const indicator = document.querySelector<HTMLElement>("[data-cart-indicator]");

  indicator?.addEventListener("click", (e) => {
    e.preventDefault();
    window.Store?.cart?.show?.();
  });
}

// Boot: wire everything after DOM ready.
function boot(): void {
  wireSizeSelector();
  wireAddToCart();
  wireCartIndicator();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
