# LunchPick 🍽️

**Smart group lunch ordering — match everyone's preferences, dietary needs, and budget.**

## Quick Start — no database setup needed

```bash
npm install
npm run dev
```

Open **http://localhost:3000** and click **"Load Demo Event"** to instantly see 18 participants, 12 restaurants, and live recommendations.

> Data is stored in-memory and resets on server restart — perfect for demos.

---

## How It Works

1. **Create** — organizer sets date, location, headcount, budget, fulfillment methods → gets a 6-char code
2. **Respond** — participants visit `/survey/[id]`, rate dietary needs and cuisines
3. **Recommend** — scoring engine ranks all restaurants, explains why each one ranked as it did
4. **Select** — organizer picks the winner; optionally logs leftover donation

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS · Lucide icons
- **No database** — in-memory store (`lib/store.ts`)
- Scoring algorithm: `lib/recommendation.ts`

## Pages

| Page | Route |
|------|-------|
| Landing | `/` |
| Create Event | `/create` |
| Join Event | `/join` |
| Preference Survey | `/survey/[eventId]` |
| Organizer Dashboard | `/dashboard/[eventId]` |
| Recommendations | `/recommendations/[eventId]` |
| Restaurant Detail | `/restaurant/[id]?eventId=...` |
| Leftover Donation | `/leftovers/[eventId]` |
