# Helis

K–12 classroom signal platform.

**MVP-0:** teachers log events → bilingual digests → WhatsApp (consent gate)  
**Phase 2:** Class Pulse, group project Kanbans, parent dashboard + grounded chat, teacher reply drafts

Runs in **demo mode** out of the box (in-memory seed data, mock WhatsApp).

## Quick start

```bash
cd ~/Projects/helis
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo paths

| Path | What to try |
|------|-------------|
| `/teacher` → Grade 5A | Log events, digests, Pulse / Projects / Inbox tabs |
| `/teacher/projects/proj-1` | All-groups Kanban overview |
| `/teacher/boards/board-a` | Drag cards; Done → emits StudentEvent |
| `/student/boards/board-a?as=stu-1` | Student sees own group only |
| `/parent` | Charts, timeline, ask grounded chat (Rajesh / Arjun) |

### MVP-0 walkthrough

1. Log an event for Arjun → Generate digest → Approve → Send WhatsApp (mock)
2. Try Rohan for send — blocked without ConsentRecord

### Phase 2 walkthrough

1. **Pulse** tab — Rohan should rank elevated (attendance + homework concerns)
2. **Projects** → Science Fair overview → open Group A board → drag "Build prototype" or mark overdue cards
3. **Parent** → ask *"How has homework been this week?"* — cites events; refuse out-of-scope questions
4. **Inbox** tab — open Arjun thread → **AI draft reply** → insert → send

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Optional | Real AI digests/chat; template fallback if missing |
| `WHATSAPP_*` | Optional | Real WhatsApp; mock if missing |
| `NEXT_PUBLIC_SUPABASE_*` | Later | Replace demo store with Postgres |

## Structure

```
src/
  app/
    api/events|digest|pulse|projects|kanban|chat|parent/
    teacher/  parent/  student/
  components/  # composer, pulse, kanban, parent dashboard, inbox
  lib/
    demo-store.ts
    pulse/score.ts
    ai/  whatsapp/  offline/
supabase/schema.sql  # MVP-0 + Phase 2 tables
```

## License

Private — MVP build.
