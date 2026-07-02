# Inventory ERP — Angular Project Guide

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21.2 (standalone, signals, new control flow) |
| Styling | Tailwind CSS v4 + custom design tokens |
| Icons | Material Icons (`<span class="material-icons">`) |
| Testing | vitest |
| Formatting | Prettier (printWidth 100, singleQuote) |

## Quick Start

```bash
npm start        # ng serve
npm run build    # ng build
npm test         # ng test (vitest)
```

## Project Structure

```
src/app/
├── core/               # Singletons: auth guards, interceptors, global services
│   ├── auth/           #   auth-guard, feature-guard, auth-interceptor
│   ├── interfaces/     #   Branch model, User model
│   └── services/       #   theme.service, branch-context-service
├── features/           # Domain modules
│   ├── auth/           #   login/, services/, models/
│   ├── inventory/      #   pages/, components/, services/, dtos/, models/
│   └── sales/          #   pages/, components/, services/, dtos/, models/
├── shared/             # Reusable UI, models, types
│   ├── components/     #   searchable-select, navigate-button, date-range-filter, etc.
│   ├── ui/             #   skeleton-list, page-header
│   ├── models/         #   select-option.model
│   └── types/          #   GUID (type alias for string)
└── layout/             # App shell
    ├── maint-layout/   #   main-layout (sidebar + topbar + router-outlet)
    ├── sidebar/        #   sidebar, side-menu-option
    ├── topbar/         #   topbar, branch-selector, user-menu
    └── services/       #   side-bar-service
```

## Naming Conventions

| What | Convention | Examples |
|------|-----------|----------|
| Files | `kebab-case.ts` | `product-list.ts`, `auth-service.ts` |
| Components | `export default class PascalCase` | `export default class ProductList` |
| Services | named export, `@Injectable({ providedIn: 'root' })` | `export class ProductService` |
| DTOs / Models / Interfaces | named export | `export interface CreateSaleDto` |
| Selectors | `app-` prefix + kebab-case | `app-product-list`, `app-searchable-select` |

## Routing & Guards

- Root guard: `authGuard` — checks JWT token, restores branch context on reload.
- Feature guard: `featureGuard` — checks module + feature permissions from branch data.
- Route data shape:
  ```typescript
  data: { module: 'inventory', feature: 'products', permission?: 'create' | 'update' | 'delete' }
  ```
- All feature routes are lazy-loaded via `loadComponent`.
- Layout: empty path `''` loads `MainLayout` with children.

## State Management

Angular Signals everywhere — no NgRx, no RxJS subjects for state.

```typescript
// Mutable state
items = signal<ListProductDto[]>([]);
loading = signal(false);

// Derived state
hasItems = computed(() => this.items().length > 0);

// Component inputs / outputs
label = input.required<string>();
selected = output<GUID | null>();
```

## Dependency Injection

Use `inject()` exclusively (never constructor injection):

```typescript
private http = inject(HttpClient);
private readonly router = inject(Router);
readonly authService = inject(AuthService);
```

## Services & HTTP

- All services use `@Injectable({ providedIn: 'root' })`.
- Base URL from `environment.BACKEND_URL`.
- Query parameters built with `HttpParams`.
- HTTP calls return `Observable<T>`, subscribed with `.subscribe({ next, error })`.
- Paged endpoints return `PagedResult<T>` (`{ items, totalCount, page, pageSize, totalPages }`).

## Styling — Design Tokens

Use the CSS custom properties mapped via `@theme inline` in `styles.css`.

### Token categories (see `.agents/rules/template-style-coding.md` for full reference):

| Category | Prefixes |
|----------|----------|
| Surfaces | `bg-bg-main`, `bg-bg-surface`, `bg-bg-elevated`, `bg-bg-muted` |
| Text | `text-text-main`, `text-text-muted`, `text-text-soft` |
| Borders | `border-border`, `border-border-strong` |
| Buttons | `bg-btn-primary-bg`, `bg-btn-secondary-bg` |
| Feedback | `bg-feedback-{success,error,warning,info}` + `text-feedback-*-text` |
| Layout | `bg-layout-sidebar`, `bg-layout-topbar` |

**Rules:**
- Never use raw hex values in templates.
- Never use `dark:` variants — `ThemeService` toggles `.dark` on `<html>`.
- Follow Concentric CSS order: position → display → spacing → typography → visuals → interactivity.

## Path Aliases (tsconfig.json)

```typescript
import { x } from '@core/...';       // src/app/core/
import { x } from '@shared/...';     // src/app/shared/
import { x } from '@features/...';   // src/app/features/
import { x } from '@layout/...';     // src/app/layout/
```

## Testing

- `vitest` with `@angular/build:unit-test` builder.
- Only component-level tests exist (minimal setup).
- Test pattern: `TestBed.configureTestingModule({ imports: [Component] })`.

## Existing Skills & Rules

- **`.agents/skills/angular-forms/`** — Signal Forms API (`@angular/forms/signals`) with `form()`, `applyEach()`, `min()`, `validate()`.
- **`.agents/rules/template-style-coding.md`** — Full Tailwind token reference and class ordering guide.
