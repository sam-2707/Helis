# Helis

K–12 classroom signal platform for Indian schools — **phone-first for teachers**, WhatsApp for parents.

**Teacher phone app (PWA):** one-tap templates, homework roll-call, class events, volunteer → WhatsApp  
**Desktop:** digests, Pulse, Kanban, parent chat / reply drafts

Runs in **demo mode** out of the box (in-memory seed data, mock WhatsApp).

## Quick start

```bash
cd ~/Projects/helis
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Install on phone (mobile app)

1. Start the server reachable on your Wi‑Fi (`npm run dev` already binds `0.0.0.0`)
2. On the phone browser open `http://<your-laptop-ip>:3000/teacher/mobile`
3. **Android Chrome:** Menu → Add to Home screen  
   **iPhone Safari:** Share → Add to Home Screen  
4. Helis opens full-screen like an app (PWA)

## Demo paths

| Path | What to try |
|------|-------------|
| `/teacher/mobile` | **Phone app** — pick class → Quick tap / Homework / Event |
| `/teacher/mobile/class-5a` | Homework check: Done vs Missing→WA; Volunteer chip |
| `/teacher` → Grade 5A | Desktop digests, Pulse, Projects, Inbox |
| `/parent` | Parent tablets + grounded chat |

### Phone ritual walkthrough

1. Open `/teacher/mobile` → Grade 5A  
2. **Quick tap** — select Arjun → **Volunteered** (mock WhatsApp if consent on file)  
3. **Homework** — call names → **Missing → WA** or **Done / OK**  
4. **Event** — title + duration → tick volunteers → save (all students get records)

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Optional | Real AI digests/chat; template fallback if missing |
| `WHATSAPP_*` | Optional | Real WhatsApp; mock if missing / `WHATSAPP_MOCK=true` |
| `NEXT_PUBLIC_SUPABASE_*` | Later | Replace demo store with Postgres |

## Structure

```
src/
  app/teacher/mobile/     # Phone PWA entry
  app/api/rituals/        # Template tap + class event
  lib/rituals/templates.ts
  components/mobile-ritual.tsx
public/manifest.webmanifest + sw.js + icons/
```

## License

Private — MVP build.
