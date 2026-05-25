# YouTube Stream Scheduler

Auto-creates a weekly YouTube live broadcast by cloning settings (description, privacy, content details, thumbnail) from a template stream and overriding the title + start time.

- **Template broadcast ID:** `OrMZkhsdeE4`
- **Schedule:** Sundays 10:45 America/Montevideo
- **Title:** `Servicio Dominical - DD/MM/YYYY`
- **Runs:** GitHub Actions (Mondays 12:00 UTC, 6 days before target Sunday)

## One-time setup

### 1. Google Cloud OAuth credentials

1. https://console.cloud.google.com → New project
2. APIs & Services → Library → enable **YouTube Data API v3**
3. APIs & Services → OAuth consent screen → External → add your YouTube account as a test user, scope `https://www.googleapis.com/auth/youtube`
4. Credentials → Create OAuth client ID → **Desktop app** → save Client ID and Client Secret

### 2. Generate refresh token (run locally once)

```bash
pnpm install   # or npm install
GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-refresh-token.mjs
```

Open the URL it prints, log in with the YouTube account that owns the channel, approve. Copy the printed refresh token.

### 3. Push to GitHub and add secrets

Create a new GitHub repo, push this folder, then in repo Settings → Secrets → Actions add:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

### 4. Test

Actions tab → "Schedule weekly YouTube stream" → **Run workflow** → check YouTube Studio for the new scheduled broadcast.

## Going live each Sunday

Open OBS, use your persistent stream key (YouTube Studio → Stream → reusable key), start streaming a few minutes before 10:45. YouTube auto-binds the live feed to the scheduled broadcast.

## Changing the template

Edit `TEMPLATE_BROADCAST_ID` in `.github/workflows/schedule-stream.yml`.
