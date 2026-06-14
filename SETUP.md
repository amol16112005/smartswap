# SmartSwap Environment Setup & Checklist

This guide provides a complete, step-by-step checklist to get SmartSwap running locally.

---

## Prerequisites

- Node.js **18 or newer** (LTS recommended)
- npm (comes bundled with Node.js)
- A modern browser (Chrome, Firefox, Edge, etc.)
- Google Gemini API key (free tier is sufficient)
  - Get one here: https://aistudio.google.com/app/apikey
- (Optional but recommended for production-like setup) MongoDB Atlas free cluster

---

## Step 1: Clone / Open the Project

```bash
cd "C:\Users\amolw\OneDrive\Desktop\carbon foot print\smartswap"
```

Or open the folder in your editor (VS Code recommended).

---

## Step 2: Backend Setup

### 2.1 Navigate and prepare environment file

```bash
cd backend
```

Copy the example environment file:

```bash
# On Windows PowerShell
Copy-Item .env.example .env

# Or manually create .env with the variables below
```

### 2.2 Edit `.env`

Open `.env` and add at minimum:

```env
GEMINI_API_KEY=your_actual_key_here

# Optional but recommended
# JWT_SECRET=a-long-random-string-at-least-32-characters

# Optional - only needed if you want to use MongoDB Atlas
# MONGODB_URI=<paste-your-atlas-connection-string-here>

PORT=5000
```

**Important**: Never commit your real `.env` file.

### 2.3 Install dependencies

```bash
npm install
```

### 2.4 Start the backend

```bash
node server.js
# or
npm start
```

You should see output similar to:

```
◇ injected env (3) from .env
No MONGODB_URI provided in .env. Operating in LOCAL FALLBACK MODE (history_db.json).
⚠️  JWT_SECRET not set in .env — using dev fallback. Set a strong secret before production use.
SmartSwap Backend operating seamlessly on port 5000
```

Leave this terminal running.

---

## Step 3: Frontend Setup

Open a **new terminal** window.

```bash
cd frontend
npm install
npm run dev
```

You should see something like:

```
VITE v8.0.16  ready in 881 ms
➜  Local:   http://localhost:5173/
```

**Note**: If 5173 is busy, Vite will automatically try 5174, 5175, 5176, etc.

---

## Step 4: Verify Everything Works

1. Open the frontend URL in your browser (e.g. http://localhost:5173)
2. Click **"Access Your Personal Space"**
3. Enter any email address (e.g. `test@example.com`)
4. Click **"Authenticate Identity"**
5. You should be taken to the Dashboard
6. Type a sample plan, for example:
   - `buy a new phone from amazon`
   - `plan a trip from mumbai to delhi`
7. Click **Evaluate**
8. You should see structured results with cost comparisons and alternatives
9. Check the left sidebar — your query should now appear in history
10. Try clicking the history item to reload it
11. Click **"Share Link"** and open the link in an incognito window (it should work without logging in)
12. Go back and try deleting the item (only the owner should be able to delete)

You should also see request logs appearing in the backend terminal, for example:

```
[2026-06-14T03:29:01.570Z] POST /api/auth/login
[2026-06-14T03:29:01.730Z] GET /api/history
```

---

## Verification Checklist

Use this to confirm your setup is healthy:

- [ ] Backend starts cleanly on port 5000
- [ ] Frontend starts on a localhost port (5173 or higher)
- [ ] Login with any email succeeds and navigates to dashboard
- [ ] Submitting a plan returns AI-generated suggestions
- [ ] Results include cost in INR and carbonSavedPercent
- [ ] History appears in the left sidebar after optimization
- [ ] Clicking a history item reloads the previous analysis
- [ ] Share link works in a private/incognito browser (no login)
- [ ] Delete only works for items you created
- [ ] Backend logs show the requests (POST /api/auth/login, etc.)
- [ ] No scary "Unexpected token '<'" or CORS errors

---

## Using MongoDB Atlas (Optional)

If you want to use a real database instead of the local file:

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and get the connection string
3. Add it to your backend `.env`:

   ```env
   MONGODB_URI=<paste-your-atlas-connection-string-here>
   ```

4. Restart the backend. You should see:

   ```
   Successfully connected to MongoDB Atlas cloud database.
   ```

All your previous local data will stay in `history_db.json`. New data will go to MongoDB.

---

## Stopping the Servers

- Press `Ctrl + C` in each terminal.
- To fully clean ports (if needed):

  ```powershell
  taskkill /F /IM node.exe
  ```

---

## Common Problems & Fixes

| Problem                              | Likely Cause                              | Fix |
|--------------------------------------|-------------------------------------------|-----|
| "Port 5000 is already in use"        | Old backend still running                 | Kill node processes or change PORT in .env |
| "Unexpected token '<', '<!DOCTYPE'"  | Wrong server (old Vite instance) on 5000  | Kill all node processes, then restart backend first |
| Login does nothing / stays on form   | Backend not running or CORS issue         | Check backend is on 5000, refresh frontend |
| AI calls fail                        | Missing or invalid GEMINI_API_KEY         | Verify key in backend `.env` |
| History not saving                   | No email in token or DB write failure     | Re-login, check backend logs |
| Share link shows nothing             | Using old link after restart              | Create a new share link |
| CORS error in console                | Old code or very unusual port             | Pull latest code, or add your port to allowedOrigins in server.js |

---

## Production Notes

- Set a strong `JWT_SECRET` in `.env`
- Use a real MongoDB connection
- Put the backend behind HTTPS
- Consider adding proper user accounts / email verification later
- Adjust rate limits based on your Gemini quota

---

You should now have a fully working local SmartSwap environment with real authentication, AI integration, and the full feature set.

Happy swapping!