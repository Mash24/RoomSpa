# Ask RoomSpa — chat & care team

Guest-facing concierge on every public page (hidden on `/admin`).

## Guest flow

1. **Ask RoomSpa** float (above WhatsApp) opens the panel  
2. Answers from site knowledge (+ OpenAI when `OPENAI_API_KEY` is set)  
3. **Talk to care team** → short form → live thread (reference code + guest token in `sessionStorage`)  
4. Guest and admin can message until admin or guest **ends** the chat  
5. Optional star rating + comment; long comments may seed a pending review  

## Admin

- **Care chats** at `/admin/tickets`  
- Reply, end chat, see ratings  
- New tickets also notify `EMAIL_OPS_NOTIFY` (and email fallback if DB write fails)

## APIs

| Route | Role |
| --- | --- |
| `POST /api/chat` | Concierge reply |
| `POST /api/chat/ticket` | Open care ticket |
| `GET/POST /api/chat/ticket/[code]` | Guest thread fetch / message / end |
| Admin ticket routes under `/api/admin/tickets` | Staff reply / list / close |

## Knowledge & pricing

- Site index: `src/lib/chat/site-index.ts`  
- Static knowledge: `src/content/chat-knowledge.ts`  
- Price questions use **catalog tiers** (not guessed FAQ numbers)

## Env

| Variable | Effect |
| --- | --- |
| `OPENAI_API_KEY` | GPT layer on top of site RAG; without it, knowledge-only replies |
| `OPENAI_CHAT_MODEL` | Optional; default `gpt-4o-mini` |
| `EMAIL_OPS_NOTIFY` | Ops alert when a care chat opens |

## Migrations

```text
supabase/migrations/20260810144039_support_tickets.sql
supabase/migrations/20260810_ticket_messaging_ratings.sql
```

Must be applied on the production Supabase project before care threads work end-to-end.

## Mobile notes

- Panel is near full-width on small phones  
- Main + footer padding clears chat + WhatsApp floats (`page-bottom-clearance`)
