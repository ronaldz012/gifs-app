# Talla — POS for how South America actually sells

> A POS built for the real market conditions in Bolivia and across LatAm: informal SKUs, color/size variants, cash + QR payments. Built for the counter, installable as an app.

<video src="https://github.com/user-attachments/assets/a29fd52c-76a5-440f-a8bc-5888c25d80cc" controls muted playsinline style="width:100%; max-width:800px; border-radius:12px; border:1px solid #E8E8E8;"></video>

> If the video doesn't load here, [watch the .mp4 directly](https://github.com/user-attachments/assets/a29fd52c-76a5-440f-a8bc-5888c25d80cc) or [local fallback `docs/demo.mp4`](docs/demo.mp4).

**Stack:** Angular 21 (standalone + signals) · Tailwind v4 · ASP.NET Core · Auth0 (PKCE)
**Backend:** [Inventory-ERP-API](https://github.com/ronaldz012/DriveCore.System.Monolith)

---

## The problem

Most POS systems are built for barcoded, formal retail. **Talla is built for the market reality in Bolivia and across LatAm** — ferias and corner stores, where a "product" is `Forum Low / 42 / Navy Blue` with a loose SKU like `NIK12-011`, not a global GTIN.

It handles three things a traditional POS doesn't:

- **Merchandise without a rigid catalog** — quick SKUs, size/color variants, loose product names, and manual price/stock adjustments. No formal catalog required to make a sale.
- **How people actually pay** — cash and QR payments (Pago Móvil), with a full cash-register reconciliation (`Cash / QR / Expenses / Expected`) at close.
- **Counter-first design, not office-first** — barcode scanner or phone camera input, permission-gated views (cashiers see stock, managers see cost/margin), mobile-friendly bottom-sheet modals, and a "last view" memory per branch so staff pick up where they left off.

---

## What it does today

**A POS that survives the rush**
Live SKU lookup with stock guard per branch, a signal-driven cart with real-time totals, sale search for returns (full return = void, partial = refund), and a single-click return flow from the register-close view.

**Full cash-register lifecycle**
Open register → live session details → close with reconciliation → detailed closure view showing every sale and return, with stock impact for restocking.

**Inventory that matches the street**
Product list/detail with permission-gated cost & margin visibility, stock receptions from providers, inter-branch transfers (resolve/cancel), and a full stock-movement log (7 movement types, including returns and reception reversals). Includes compact, printable product labels sized for real shelf tags (23×38mm).

**Beyond the register**
Full sales history with return filtering, sale detail with returned-quantity tracking, Auth0 login with PKCE and resilient session recovery (retry backoff on network hiccups), an online/offline connectivity indicator, and a consistent design system across desktop and mobile.

---

## See the backend

The POS is only half the story. The API that powers it lives in a companion repo:

**→ Backend: [Inventory-ERP-API](https://github.com/ronaldz012/DriveCore.System.Monolith)** — ASP.NET Core, handling auth, sales, and inventory with fine-grained, permission-based access control.

---

## Try it

```bash
git clone https://github.com/ronaldz012/inventory_system.git
cd inventory_system
npm install
# src/environments/environment.development.ts
# export const environment = { BACKEND_URL: "https://192.168.100.124:5253", auth0: { domain: "auth.ronalz.work", ... } };
ng serve
# open https://localhost:4200
```

Requires the backend above running at and an Auth0 Tenant config, check enviroment variable `https://localhost:5253` (or `192.168.100.124:5253` for LAN access).

---

## Technical notes

**Frontend:** Angular 21.2 standalone + signals, Tailwind v4, Signal Forms, `provideAuth0` (`/callback` + `handleRedirectCallback` + `last_view` branch+feature + `featureGuard`/`PermissionService`), **PWA** (`provideServiceWorker` + `ConnectivityService` `isOnline | status` with `gstatic.com/generate_204` probe coalesced, banner `wifi_off` / `cloud_off`, `last_view` restores counter position).

**Backend:** companion repo above — `api/Auth/health`, `SaleType Return`, `MovementType` 7 values, `ClosureDetailDto{qrSales}`.

See `docs/qa-permissions-checklist.md` for the manual QA flow (Admin vs Vendedor).

