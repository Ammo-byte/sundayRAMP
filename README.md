# Sunday

Sunday is a personal AI assistant for email, calendar, and voice notes. It watches Gmail, turns relevant emails into calendar events, estimates travel time, transcribes voice recordings, and sends summaries through iMessage, Telegram, or WhatsApp.

The project has two parts:

- `backend/`: a FastAPI server that talks to Gmail, Google Calendar, your LLM, transcription, and messaging channels
- `sunday-app/`: an Expo app that runs on iPhone, Android, and web

## What Sunday does

- Email -> Calendar: reads Gmail, extracts events and tasks, writes to Google Calendar, and sends a concise summary
- Voice notes: records in the app, uploads audio, transcribes it, titles it, and saves it to Alerts
- Today view: shows upcoming calendar items with travel or prep context
- Messaging: sends summaries through Telegram, WhatsApp, or iMessage
- Agent mode: can add deeper AI follow-up through the built-in agent or OpenClaw

## Table of contents

1. [How Sunday is split](#how-sunday-is-split)
2. [How the app works](#how-the-app-works)
3. [Choose a setup path](#choose-a-setup-path)
4. [Project layout](#project-layout)
5. [Quick start demo](#quick-start-demo)
6. [Hosted deployment](#hosted-deployment)
7. [Expo Go](#expo-go)
8. [Tailscale remote access](#tailscale-remote-access)
9. [Self-hosted local setup](#self-hosted-local-setup)
10. [Messaging channels](#messaging-channels)
11. [LLM providers](#llm-providers)
12. [OpenClaw integration](#openclaw-integration)
13. [Agent mode](#agent-mode)
14. [Configuration guide](#configuration-guide)
15. [API endpoints](#api-endpoints)
16. [Troubleshooting](#troubleshooting)

---

## How Sunday is split

This is the part that trips people up most often:

- Frontend: the Expo app, including the web build you can deploy to Vercel
- Backend API: the FastAPI server, usually deployed to Railway or run locally on your Mac
- `Hosted` in the app means "use a deployed backend URL", which is usually your Railway URL
- `Self-hosted` in the app means "use my own Mac/local backend", such as `http://192.168.x.x:8000`

Important:

- Your `*.vercel.app` URL is the web frontend, not the calendar/transcription API
- The app's `Hosted backend URL` should point to Railway, not to Vercel
- iMessage only works when the backend is running locally on macOS
- Telegram and WhatsApp work on both Hosted and Self-hosted backends

---

## How the app works

### Main screens

- `Today`: shows upcoming events, travel timing, and scheduling context
- `Record`: records a voice note and sends it to `/api/transcribe`
- `Alerts`: stores summaries, transcripts, and playable recordings
- `Settings`: chooses `Hosted` vs `Self-hosted`, messaging channel, Google connection, home/work locations, and model settings

### Email flow

```text
Gmail inbox
  -> Sunday reads new mail
  -> AI decides whether it matters
  -> event details are extracted
  -> Google Maps estimates travel or prep time
  -> Google Calendar is updated
  -> summary is sent to Telegram / WhatsApp / iMessage
  -> optional agent mode adds deeper follow-up
```

### Voice note flow

```text
Record in app or browser
  -> audio is uploaded to the backend
  -> Groq Whisper API or a local transcription model creates the transcript
  -> Sunday generates a short title
  -> entry appears in Alerts
  -> optional actions are extracted from the transcript
```

---

## Choose a setup path

| I want to... | Use this | Notes |
|---|---|---|
| Click around the UI only | Hosted web demo | No personal Gmail or backend setup required |
| Use Sunday from web or Expo Go with a deployed backend | Railway backend + Vercel web or Expo Go in `Hosted` mode | Best default for most people |
| Use iMessage, local tools, or a Mac-only workflow | Local Mac backend in `Self-hosted` mode | Required for iMessage |

---

## Project layout

```text
sunday/
├── backend/             Python backend (Gmail, LLM, calendar, transcription, messaging)
├── sunday-app/          Expo app (iOS, Android, web)
├── models/              Local model files (ignored by git)
├── config.env           Your local backend config (ignored by git)
├── config.env.example   Backend config template
├── Procfile             Railway deployment entry
└── vercel.json          Root Vercel config (legacy)

sunday-app/
├── src/
│   ├── screens/         Today, Record, Alerts, Settings, Auth
│   ├── lib/             API client, connection prefs, recorder, transcription
│   └── stubs/           Web platform stubs
├── .env.example         App env template
├── vercel.json          Vercel config for Expo web
└── metro.config.js      Metro config
```

---

## Quick start demo

If someone already deployed the web app, this is the fastest way to see Sunday without setting up keys.

1. Open the deployed web URL
2. Click `Try Demo`
3. Browse the sample Alerts, Today, and Settings screens

The demo is for UI exploration. Real Gmail watching, transcription, and messaging need a live backend.

---

## Hosted deployment

This is the recommended setup when you want a shareable web app or want Expo Go to talk to a deployed backend.

### 1. Deploy the backend to Railway

1. Fork this repo
2. In Railway, create a new project from your fork
3. Railway will detect the `Procfile`
4. Add the backend environment variables below
5. Generate a public Railway domain and copy it

Recommended minimum Railway variables:

```env
BACKEND_TARGET=Hosted
# Legacy variable name; this should still be your Railway backend URL.
VERCEL_BASE_URL=https://your-app.railway.app

ACTIVE_LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant

JWT_SECRET=replace-with-a-random-32-char-secret
SUNDAY_API_KEY=replace-with-a-random-api-token

MESSAGE_CHANNEL=Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

AGENT_MODE=off
```

Notes:

- `Hosted` means Railway in this project
- `VERCEL_BASE_URL` is a legacy setting name, but it should contain your Railway backend URL
- `SUNDAY_API_KEY` is optional locally, but recommended on deployed backends
- If you set `SUNDAY_API_KEY` on the backend, set the same value as `EXPO_PUBLIC_API_TOKEN` in the app/frontend env
- When `GROQ_API_KEY` is set, Sunday uses Groq's hosted Whisper transcription and does not need local transcription models on Railway

### 2. Put Google credentials on Railway

The least painful hosted path is to authorize Google once locally, then copy the resulting credentials into Railway.

1. In Google Cloud, enable Gmail API, Calendar API, and Maps APIs
2. Download your OAuth `credentials.json`
3. Run Sunday locally once so it creates `token.json`
4. Base64-encode both files:

```bash
python3 -c "import base64; print(base64.b64encode(open('credentials.json','rb').read()).decode())"
python3 -c "import base64; print(base64.b64encode(open('token.json','rb').read()).decode())"
```

5. Add these Railway variables:

```env
GOOGLE_CREDENTIALS_JSON=<base64 credentials.json>
GOOGLE_TOKEN_JSON=<base64 token.json>
GOOGLE_MAPS_API_KEY=<your maps key>
```

This avoids trying to do an interactive OAuth browser flow on a hosted backend.

### 3. Deploy the web frontend to Vercel

1. Import the repo into Vercel
2. Set the project root to `sunday-app`
3. Add frontend env vars:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-app.railway.app
EXPO_PUBLIC_API_TOKEN=the-same-value-as-SUNDAY_API_KEY
```

4. Deploy

Notes:

- Vercel hosts the web UI
- Railway hosts the API
- The frontend should never use the `*.vercel.app` URL as its backend API base

---

## Expo Go

Expo Go is the fastest way to run the mobile app without making a full native build.

### Expo Go with a hosted Railway backend

Use this if you want your phone to talk to the deployed backend.

```bash
cd sunday-app
cp .env.example .env
npm install
npm run start
```

In `sunday-app/.env` set:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-app.railway.app
EXPO_PUBLIC_API_TOKEN=the-same-value-as-SUNDAY_API_KEY
```

Then scan the QR code in Expo Go.

### Expo Go with a local Mac backend

Use this if you want `Self-hosted` mode or iMessage.

1. Find your Mac's IP:

```bash
ipconfig getifaddr en0
```

2. Set:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
EXPO_PUBLIC_API_FALLBACK_URLS=http://your-mac.local:8000,http://100.x.y.z:8000
```

3. Run the backend with:

```bash
uv run uvicorn backend.server:app --host 0.0.0.0 --port 8000
```

4. Start Expo:

```bash
cd sunday-app
npm run start
```

### Tunnel mode

If the QR code does not connect on your network:

```bash
npm run start -- --tunnel
```

### Expo Go feature limits

| Feature | Expo Go | Full build |
|---|---|---|
| Record / Alerts / Settings | Yes | Yes |
| Hosted backend access | Yes | Yes |
| Local backend access | Yes | Yes |
| Push notifications | No | Yes |
| Background behavior | No | Yes |
| Widgets / native extras | No | Yes |

---

## Tailscale remote access

Tailscale is useful when your backend is running on your Mac but your phone is away from the same Wi-Fi.

1. Install Tailscale on your Mac
2. Sign in
3. Get your Tailscale IPv4 address:

```bash
tailscale ip -4
```

4. Use that IP in the app:

```env
EXPO_PUBLIC_API_BASE_URL=http://100.x.y.z:8000
```

This is also useful for OpenClaw webhooks that need to reach your Mac from a hosted backend.

---

## Self-hosted local setup

Use this path if you want the backend on your Mac, especially for iMessage.

### Requirements

- Python 3.10+
- Node.js 18+
- `uv` package manager
- A Google Cloud project with Gmail API, Calendar API, and Maps APIs enabled
- One LLM provider key, or a local Ollama setup
- macOS if you want iMessage

### 1. Install dependencies

```bash
git clone https://github.com/aryan-cs/sunday.git
cd sunday
uv sync --extra dev
cd sunday-app && npm install && cd ..
```

### 2. Create backend config

```bash
cp config.env.example config.env
```

Minimum useful local backend config:

```env
BACKEND_TARGET=Self-hosted
ACTIVE_LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.1-8b-instant

GOOGLE_CREDENTIALS_FILE=credentials.json
GOOGLE_TOKEN_FILE=token.json
GOOGLE_MAPS_API_KEY=

MESSAGE_CHANNEL=Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

DEFAULT_HOME_LOCATION=Your City, State
TIMEZONE=America/Chicago
```

If you want to protect local API routes too:

```env
SUNDAY_API_KEY=replace-with-a-random-api-token
```

### 3. Connect Google locally

1. Put your Google OAuth `credentials.json` in the repo root
2. Start the backend once:

```bash
uv run uvicorn backend.server:app --host 0.0.0.0 --port 8000
```

3. The first Gmail/Calendar request will trigger a browser OAuth flow
4. Sunday will save the result to `token.json`

### 4. Create the app env

```bash
cd sunday-app
cp .env.example .env
```

Use your Mac's IP in `sunday-app/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
EXPO_PUBLIC_API_FALLBACK_URLS=http://your-mac.local:8000,http://100.x.y.z:8000
EXPO_PUBLIC_API_TOKEN=the-same-value-as-SUNDAY_API_KEY
```

### 5. Run the app

```bash
cd sunday-app
npm run start
```

---

## Messaging channels

Sunday can send summaries through Telegram, WhatsApp, or iMessage.

### Telegram

Telegram is the easiest messaging path for both Hosted and Self-hosted backends.

1. Install Telegram and sign in
2. Message `@BotFather`
3. Run `/newbot`
4. Copy the bot token
5. Send at least one message to your new bot from the account that should receive Sunday alerts
6. Open:

```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

7. Copy the numeric `chat.id` from the response
8. Set:

```env
MESSAGE_CHANNEL=Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### WhatsApp

Sunday uses Meta's WhatsApp Cloud API, not Twilio.

1. Create a Meta developer app
2. Add the WhatsApp product
3. Open the WhatsApp API setup page
4. Copy:
   - access token
   - phone number ID
5. Add your recipient/test number in the Meta dashboard if you are still in test mode
6. Set:

```env
MESSAGE_CHANNEL=WhatsApp
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_RECIPIENT=12175551234
WHATSAPP_GRAPH_API_VERSION=v23.0
```

Notes:

- `WHATSAPP_RECIPIENT` should be digits only, with country code, no spaces or `+`
- WhatsApp works on Hosted and Self-hosted backends
- If messages fail in test mode, make sure the destination number is added as an allowed recipient in Meta

### iMessage

iMessage is for local macOS backends only.

1. Install the helper:

```bash
brew install steipete/tap/imsg
```

2. Grant Terminal or your shell app Full Disk Access in macOS privacy settings
3. Set:

```env
MESSAGE_CHANNEL=iMessage
IMESSAGE_ENABLED=true
IMESSAGE_RECIPIENT=+12175551234
TEXT_EMAIL_LINKS=true
```

Important:

- iMessage does not work on Hosted backends
- iMessage requires macOS

---

## LLM providers

Set `ACTIVE_LLM_PROVIDER` to one of the supported providers.

| Provider | Key env var | Notes |
|---|---|---|
| `groq` | `GROQ_API_KEY` | Recommended hosted default; also powers hosted transcription |
| `gemini` | `GEMINI_API_KEY` | Good free tier |
| `openrouter` | `OPENROUTER_API_KEY` | Good for model experimentation |
| `ollama` | none | Best for fully local/self-hosted |
| `mistral` | `MISTRAL_API_KEY` | Cloud option |
| `cerebras` | `CEREBRAS_API_KEY` | Cloud option |
| `together` | `TOGETHER_API_KEY` | Cloud option |
| `custom` | `CUSTOM_LLM_BASE_URL`, `CUSTOM_LLM_API_KEY`, `CUSTOM_LLM_MODEL` | OpenAI-compatible endpoint |

If you want the least setup on Railway, use Groq.

---

## OpenClaw integration

OpenClaw is optional. When enabled, Sunday can hand action items from emails or voice notes to your local agent.

### How it works

```text
Sunday processes an email or voice note
  -> action items are extracted
  -> Sunday POSTs a wake hook to OpenClaw
  -> OpenClaw runs locally on your Mac
  -> OpenClaw responds through your configured channel
```

### Setup

1. Install OpenClaw on your Mac
2. Configure your preferred model inside OpenClaw
3. Enable Tailscale if Railway needs to reach it remotely
4. Set:

```env
AGENT_MODE=openclaw
OPENCLAW_ENABLED=true
OPENCLAW_BASE_URL=https://your-mac.tailnet.ts.net:18789
OPENCLAW_TOKEN=your-openclaw-hook-token
```

If you do not need OpenClaw, leave `AGENT_MODE=off` or use `AGENT_MODE=builtin`.

---

## Agent mode

`AGENT_MODE` controls what Sunday does after processing an email or voice note.

```env
AGENT_MODE=off
AGENT_MODE=builtin
AGENT_MODE=openclaw
```

What each mode means:

- `off`: send the normal summary only
- `builtin`: Sunday calls the active LLM directly and can add deeper follow-up
- `openclaw`: Sunday forwards action items to your OpenClaw agent

---

## Configuration guide

The most important settings are editable in `config.env` and through the app's Settings screen.

| Key | What it controls |
|---|---|
| `BACKEND_TARGET` | `Hosted` for Railway, `Self-hosted` for your Mac |
| `VERCEL_BASE_URL` | Legacy setting name for the hosted backend URL; use your Railway URL here |
| `SUNDAY_API_KEY` | Shared bearer token for app-to-backend requests |
| `ACTIVE_LLM_PROVIDER` | Which LLM Sunday uses |
| `GOOGLE_MAPS_API_KEY` | Travel time estimation |
| `TARGET_CALENDAR_ID` | Which Google Calendar Sunday writes to |
| `MESSAGE_CHANNEL` | `Telegram`, `WhatsApp`, or `iMessage` |
| `GMAIL_LABELS` | Which Gmail labels/categories Sunday watches |
| `DEFAULT_HOME_LOCATION` | Used for travel estimates and planning |
| `WORK_DAYS` | Comma-separated workdays such as `mon,tue,wed,thu,fri` |
| `WORKDAY_START_TIME` | Start of the workday |
| `WORKDAY_END_TIME` | End of the workday |
| `TRAVEL_TYPE` | `driving`, `walking`, `bicycling`, or `transit` |
| `PREP_TIME_MINUTES` | Buffer before in-person events |
| `ONLINE_PREP_MINUTES` | Buffer before online events |
| `AUTO_CLEANUP_HOURS` | When Sunday cleans up old managed events |
| `TIMEZONE` | IANA timezone such as `America/Chicago` |
| `AGENT_MODE` | `off`, `builtin`, or `openclaw` |

Frontend env keys in `sunday-app/.env`:

| Key | What it controls |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Primary backend URL the app should call |
| `EXPO_PUBLIC_API_FALLBACK_URLS` | Optional extra backend candidates |
| `EXPO_PUBLIC_API_TOKEN` | Should match `SUNDAY_API_KEY` when the backend is protected |

---

## API endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create an account |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/demo` | Demo login |
| `GET` | `/auth/google` | Start Google auth |
| `GET` | `/auth/google/callback` | Google auth callback |

### App

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/status` | Backend status |
| `GET` | `/api/settings` | Current app/backend settings |
| `PUT` | `/api/settings` | Save settings |
| `GET` | `/api/events` | Upcoming events with travel |
| `POST` | `/api/transcribe` | Upload audio for transcription |
| `POST` | `/api/plan-day` | Generate a day plan |
| `POST` | `/api/location` | Update location |
| `POST` | `/api/process` | Trigger manual processing |

---

## Troubleshooting

### The web app or Expo Go shows `405` when transcribing

- Your Hosted backend URL is probably pointing at the web frontend instead of the backend API
- In Sunday, `Hosted backend URL` should be your Railway URL, not your `*.vercel.app` URL

### Expo Go cannot reach the backend

- Do not use `localhost` from your phone
- Use your Railway URL for `Hosted`, or your Mac's IP for `Self-hosted`
- Make sure the backend is started with `--host 0.0.0.0`
- If the phone is off-network, use Tailscale or Expo tunnel mode

### Hosted transcription fails

- Set `GROQ_API_KEY` on Railway
- Set `EXPO_PUBLIC_API_TOKEN` to match `SUNDAY_API_KEY` if the backend is protected
- Make sure the frontend is calling Railway, not the Vercel web URL

### Telegram messages do not arrive

- Make sure you sent at least one message to the bot first
- Make sure `TELEGRAM_CHAT_ID` came from the same Telegram account you want to receive alerts on
- Re-check `https://api.telegram.org/bot<token>/getUpdates`

### WhatsApp messages do not arrive

- Make sure the destination number is added as a test recipient in Meta if you are still in test mode
- Make sure `WHATSAPP_RECIPIENT` is digits only with country code
- Re-check `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN`

### iMessage is configured but fails on Railway

- That is expected: iMessage is local-macOS-only
- Switch `MESSAGE_CHANNEL` to `Telegram` or `WhatsApp` for Hosted backends

### Google auth on a hosted backend is flaky

- Do the Google OAuth flow locally once
- Copy `credentials.json` and `token.json` into `GOOGLE_CREDENTIALS_JSON` and `GOOGLE_TOKEN_JSON`
- Hosted backends are much more reliable with pre-generated Google tokens than with interactive OAuth

### Sunday processes too many newsletters or promos

- Set `GMAIL_LABELS=CATEGORY_PRIMARY`
- That is the strongest filter if you only want primary-inbox mail
