# Contributing to SmartSwap

Thank you for improving SmartSwap. This guide covers setup, conventions, testing requirements, and the pull request process.

---

## Code of Conduct

- Be respectful and constructive
- Keep changes focused and well-tested
- Prioritize security, accessibility, and the existing user experience

---

## Quick Setup

See [SETUP.md](./SETUP.md) for the full checklist. Minimum steps:

```bash
# Backend
cd backend
cp .env.example .env   # Add GEMINI_API_KEY
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Tests (from project root)
cd ..
npm test
```

---

## Project Philosophy

SmartSwap is an **educational full-stack example** that is also **production-deployed**. When contributing:

- **Security should feel real but smooth** — real JWTs, no password friction
- **AI output must stay reliable** — prompt/schema changes need test verification
- **Both DB modes must work** — MongoDB Atlas and `history_db.json` fallback
- **Tests are required** — new features and bug fixes should include or update tests
- **Accessibility matters** — follow existing ARIA patterns; run `npm test` (includes axe checks)
- **Docker deploy must keep working** — do not switch Render to native Node without a full migration plan

---

## Project Structure (Current)

```
frontend/src/
  components/     # Page and UI components (one file per concern)
  hooks/          # Shared React hooks
  test/           # Vitest setup
  App.jsx         # Router shell only — keep it thin

backend/
  lib/            # Extracted, unit-tested modules
  tests/          # API + unit tests
  server.js       # Express app — routes and orchestration
```

**Do not** put new page components back into a monolithic `App.jsx`.

---

## Areas Welcome for Contribution

### High value
- AI prompt and schema improvements (with test updates)
- Additional API or component test coverage
- Accessibility enhancements (keyboard nav, contrast, screen reader support)
- Error states and loading UX
- Performance (caching, debouncing, bundle size)
- Export history (CSV/PDF)

### Nice to have
- Dark mode
- Internationalization
- Email verification / magic links
- Additional AI model support

---

## Development Guidelines

### Backend

- Extract reusable logic into `backend/lib/` with unit tests
- Always return JSON from API routes (never HTML)
- Use the existing request logging pattern for new routes
- Add ownership checks for any user-scoped mutation
- New routes should be covered in `backend/tests/api.test.js`
- Keep `module.exports = { app }` pattern for testability

### Frontend

- One component per file in `frontend/src/components/`
- Use `useDocumentTitle` on new pages
- Use `apiUrl()` from `config.js` for all API calls
- Check `Content-Type` before calling `.json()` on fetch responses
- Handle 401/403 by clearing auth and prompting re-login
- Add component tests in `*.test.jsx` alongside the component
- Run axe audit for new pages (see `src/a11y.test.jsx`)

### AI / Prompts

- Changes to `systemInstruction` are high impact — test with varied plans
- Document any new fields in the output schema
- Ensure offline fallback still produces valid schema-shaped data

### Database

- Must work with both MongoDB and local JSON fallback
- Test the fallback path when `MONGODB_URI` is unset

### Deployment

- Keep `runtime: docker` in `render.yaml`
- Do not commit secrets or `.env` files
- Verify `npm run build` succeeds after frontend changes

---

## Running Tests

```bash
# From project root
npm test                  # All 41 tests
npm run test:backend      # Backend only (25)
npm run test:frontend     # Frontend only (16)
npm run test:ci           # Tests + production build

# Individual
cd backend && npm test
cd frontend && npm test
cd frontend && npm run lint
```

All tests must pass before opening a PR. CI runs the same suite on GitHub Actions.

---

## Making Changes

1. Fork or clone the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make changes following the guidelines above
4. Add or update tests for your changes
5. Run `npm test` and `npm run lint` (frontend)
6. Update documentation if behavior, setup, or structure changed
7. Commit with a clear message
8. Open a Pull Request

---

## Pull Request Checklist

- [ ] `npm test` passes (41/41)
- [ ] `npm run lint` passes (frontend)
- [ ] `npm run build` succeeds (frontend)
- [ ] New logic has corresponding tests
- [ ] Both MongoDB and JSON fallback paths considered
- [ ] Security-sensitive changes reviewed (auth, CORS, env vars)
- [ ] API responses remain JSON
- [ ] Frontend handles non-JSON errors gracefully
- [ ] Accessibility not regressed (axe tests pass)
- [ ] Documentation updated (README, SETUP, ARCHITECTURE, or this file)
- [ ] Manual test: login → optimize → history → share → delete
- [ ] Docker deploy not broken (`render.yaml` still `runtime: docker`)

---

## Questions?

Open an issue describing what you'd like to work on. Architecture, security, prompt engineering, and deployment questions are welcome.

Thanks for helping make SmartSwap better!