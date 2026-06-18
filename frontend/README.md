# SmartSwap Frontend

React 19 + Vite 8 single-page application for the SmartSwap pre-consumption optimization engine.

**Live:** [https://smartswap-8yvv.onrender.com](https://smartswap-8yvv.onrender.com)

---

## Structure

```
src/
├── components/
│   ├── LandingPage.jsx       # Mission page (/)
│   ├── LoginPage.jsx         # Email login (/login)
│   ├── DashboardPage.jsx     # Main workspace (/dashboard)
│   ├── SharedSwapPage.jsx    # Public share view (/share/:id)
│   ├── Navbar.jsx            # Primary navigation
│   └── OptimizationResult.jsx # Shared result display
├── hooks/
│   └── useDocumentTitle.js   # Sets document.title per route
├── test/
│   └── setup.js              # Vitest + jest-dom setup
├── App.jsx                   # Router shell, auth state, lazy routes
├── config.js                 # apiUrl() — same-origin aware API helper
├── index.css                 # Global styles, focus rings, skip link
└── main.jsx                  # Entry point
```

---

## Scripts

```bash
npm run dev      # Vite dev server (proxies /api → localhost:5000)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint
npm test         # Vitest — 16 tests (components, hooks, axe a11y)
```

---

## API Configuration

`src/config.js` resolves the API base URL:

| Environment | `API_BASE` | Behavior |
|-------------|-----------|----------|
| Development | `http://localhost:5000` | Direct backend calls |
| Production (same-origin) | `''` (empty) | Relative `/api/...` paths |
| Split deploy | Set `VITE_API_URL` at build time | Points to external backend |

Vite dev proxy (in `vite.config.js`):

```javascript
server: {
  proxy: { '/api': 'http://localhost:5000' }
}
```

---

## Routing

| Path | Component | Lazy loaded | Auth |
|------|-----------|-------------|------|
| `/` | `LandingPage` | Yes | No |
| `/login` | `LoginPage` | Yes | No |
| `/dashboard` | `DashboardPage` | Yes | Yes (redirects to login) |
| `/share/:id` | `SharedSwapPage` | Yes | No |

`App.jsx` uses `React.lazy` + `Suspense` in production. Vitest preloads components synchronously via `import.meta.env.VITEST`.

---

## Accessibility

- Skip link to `#main-content`
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`
- Form labels tied with `htmlFor` / `id`
- `aria-live` for errors and loading states
- `aria-hidden` on decorative icons
- Keyboard-accessible history buttons (`<button>` not `<div onClick>`)
- Per-route document titles via `useDocumentTitle`
- Automated axe-core audits in `src/a11y.test.jsx`

---

## Testing

```bash
npm test
```

| File | Tests |
|------|-------|
| `App.test.jsx` | App shell, navigation, landmarks |
| `a11y.test.jsx` | axe violations on key pages |
| `components/*.test.jsx` | Component behavior |
| `hooks/useDocumentTitle.test.jsx` | Title hook |
| `config.test.js` | API URL helper |

---

## Build Output

Production build emits code-split chunks:

```
dist/
├── index.html
└── assets/
    ├── index-*.js          # Main bundle
    ├── LandingPage-*.js    # Lazy chunk
    ├── DashboardPage-*.js  # Lazy chunk
    └── ...
```

The backend Docker image copies `dist/` and serves it alongside the API.