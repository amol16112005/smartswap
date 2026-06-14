# Contributing to SmartSwap

Thank you for your interest in improving SmartSwap! This document explains how to contribute effectively.

---

## Code of Conduct

- Be respectful and constructive.
- Focus on the architecture, security, AI integration, and user experience.
- Keep changes small and focused when possible.

---

## How to Set Up Your Environment

See the main [README.md](./README.md) for detailed setup instructions and the Environment Setup Checklist.

Quick version:

```bash
# Backend
cd backend
cp .env.example .env   # Add your GEMINI_API_KEY
npm install
node server.js

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

---

## Project Philosophy

SmartSwap is intentionally designed as an **educational full-stack example**. When contributing, please keep these principles in mind:

- **Security should feel real but smooth** — we use real JWTs, but avoid password friction.
- **AI output must stay reliable** — changes to the system prompt or schema need careful testing.
- **The app must remain easy to run locally** — prefer graceful fallbacks over hard requirements.
- **Observability helps everyone** — new features should ideally produce useful logs.
- **Defensive programming on the client** is encouraged.

---

## Areas Where Contributions Are Welcome

### High Value
- Improving the AI system prompt or output schema
- Adding better error states and loading indicators in the UI
- Enhancing security (e.g., refresh token strategy, rate limit per user, etc.)
- Improving the share experience (copy success state, QR code, etc.)
- Adding unit tests for critical backend logic (auth, history ownership)
- Making the frontend more accessible

### Nice to Have
- Better visual design (while keeping it simple)
- Support for more AI models
- Export history as CSV / PDF
- Dark mode
- Internationalization

---

## Development Guidelines

### Backend
- Keep routes in `server.js` for now (the project is intentionally compact).
- Always return JSON from API endpoints (never HTML).
- Use the existing request logging pattern for new routes.
- Add ownership checks for any new user-scoped operations.
- Prefer small, focused middleware functions.

### Frontend
- The app is currently in a single `App.jsx` for simplicity.
- Use the same defensive JSON parsing pattern we established (check Content-Type).
- When adding new API calls, handle 401/403 by clearing auth and reloading when appropriate.
- Keep inline styles consistent with the existing aesthetic unless doing a full redesign.

### AI / Prompts
- Changes to the `systemInstruction` are high impact.
- Test thoroughly with different types of user plans.
- Document any new fields added to the output schema.

### Database
- Any change must continue to work with both MongoDB **and** the local `history_db.json` fallback.
- Test the fallback path.

---

## Making Changes

1. **Fork or clone** the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the guidelines above.
4. Test manually:
   - Login flow
   - Submit a few different plans
   - Check history appears correctly
   - Test delete (should only work for owner)
   - Test share link (should work without login)
   - Verify request logs appear
5. Update documentation if needed (especially README, ARCHITECTURE, or this file).
6. Commit with a clear message.
7. Open a Pull Request with a good description of what and why.

---

## Pull Request Checklist

- [ ] The app still runs easily with just `npm install` + API key
- [ ] New features do not break the local JSON fallback
- [ ] Security-sensitive changes have been thought through
- [ ] New API responses are JSON
- [ ] Frontend handles non-JSON errors gracefully
- [ ] Documentation updated (if behavior or setup changed)
- [ ] Manual testing done on login → optimize → history → share → delete flow

---

## Questions?

Feel free to open an issue describing what you'd like to work on. We're happy to discuss architecture decisions, security trade-offs, or prompt engineering approaches.

---

Thanks again for helping make SmartSwap better!