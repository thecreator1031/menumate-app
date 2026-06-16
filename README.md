# MenuMate

A crowdsourced campus mess menu app. Students spend a weekly token budget to
vote on next week's dishes, check in to meals with a QR-style coupon, and
rate every plate. Admins manage the menu and see turnout, waste, cost, and
satisfaction KPIs.

This is a full-stack rebuild:

- **backend/** — FastAPI + SQLite REST API
- **frontend/** — React (Vite) + Tailwind CSS

## Demo accounts

| ID      | Role    | Notes                          |
|---------|---------|--------------------------------|
| S1001–S1006 | Student | Different dietary preferences (veg/non-veg/Jain) |
| ADMIN1  | Admin   | Menu setup + dashboard         |

No password — just enter the ID on the login page.

---

## 1. Run it locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

This creates `menumate.db` (SQLite) and seeds it with demo data on first run.
The API is now at `http://localhost:8000` (docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). It talks to the
backend at `http://localhost:8000` by default — see `.env.example` if you
need to change that.

---

## 2. Run it in GitHub Codespaces

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2 — frontend
cd frontend
npm install
echo "VITE_API_URL=https://<your-codespace-8000-url>" > .env
npm run dev -- --host
```

Codespaces will pop up a "ports" notification for 8000 and 5173 — make both
**Public** (Ports tab → right-click → Port Visibility) so the frontend can
reach the backend and you can open the app in a browser.

The `<your-codespace-8000-url>` is the forwarded URL for port 8000, shown in
the Ports tab (something like
`https://yourname-menumate-xxxx-8000.app.github.dev`).

---

## 3. Deploy it live (for demos / showing professors)

### Backend → Render (free tier)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Web Service** → connect your repo.
3. Render will detect `backend/render.yaml`. If asked manually, set:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy. You'll get a URL like `https://menumate-api.onrender.com`.

> Note: Render's free tier uses an ephemeral filesystem, so the SQLite
> database resets (re-seeds with demo data) whenever the service restarts or
> spins down from inactivity. That's fine for demos.

### Frontend → Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **New Project** → import the same repo.
2. Set **Root Directory** to `frontend`.
3. Add an environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://menumate-api.onrender.com`)
4. Deploy. You'll get a live URL like `https://menumate.vercel.app`.

That's it — share the Vercel URL. The frontend calls the Render API directly,
both free and both live.

---

## Project structure

```
menumate-app/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── seed.py            # Demo data
│   ├── config.py          # Week numbers
│   ├── requirements.txt
│   ├── render.yaml
│   └── Procfile
└── frontend/
    ├── src/
    │   ├── pages/          # Landing, Login, Vote, CheckIn, AdminMenu, AdminDashboard
    │   ├── components/     # Navbar, TokenMeter, VoteCard, CheckInCard, DietBadge
    │   ├── api.js           # API client
    │   └── AuthContext.jsx  # Login/session state
    ├── tailwind.config.js
    └── vercel.json
```

## How the demo flow works

1. **Log in** as a student (e.g. `S1002`) and go to **Vote**. Allocate your
   100-token budget across next week's candidate dishes. Tokens spent on a
   "rotation-locked" (crowd favorite) dish are blocked — that dish is
   guaranteed a spot regardless of votes.
2. Go to **Check-in** to simulate collecting today's meal and rating it
   (with an option to flag leftovers/waste).
3. Log in as `ADMIN1` to see **Menu setup** (add/lock/remove dishes for
   either week) and the **Dashboard** (turnout, waste %, cost per plate,
   satisfaction index, and live vote totals for next week).
