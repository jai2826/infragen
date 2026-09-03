# Infragen

AI agent that turns a plain-English (or file/code) description of an app into
validated, production-ready Docker & Kubernetes configs — with dev/prod
variants, plain-language explanations of key decisions, and a rough monthly
cost estimate.

## Stack

Next.js 14 (App Router, TS) · Prisma + PostgreSQL · Gemini (`@google/generative-ai`)
· better-auth · Pino · Vitest · Monaco Editor · Tailwind

## Architecture

```
InputPanel --(POST /api/generate, SSE)--> agent pipeline
                                             ├─ 1. parse   (Gemini, structured JSON)
                                             ├─ 2. generate (Gemini, per artifact)
                                             ├─ 3. validate (static checks now;
                                             │      hadolint/kubeconform later)
                                             │      -- retries 2 <-> 3, max 3 attempts --
                                             └─ 4. explain + cost estimate (Gemini)
```

Every step emits an `AgentEvent` over Server-Sent Events so the frontend's
`StepTracker` can show live progress, including retries.

See `src/lib/agent/validators.ts` for why validation is currently mocked and
exactly what real `hadolint`/`kubeconform` integration would replace — the
call signature is already shaped for that swap.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and GEMINI_API_KEY
npx prisma migrate dev --name init
npm run dev
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey.

## Testing

```bash
npm test
```

Current tests cover the validation layer and cost-estimation logic (the
deterministic, interview-defensible parts of the pipeline). LLM-calling code
is intentionally kept thin and separate so it doesn't need mocking to test
the logic that matters most.

## Roadmap (see `/docs/spec.md` if present)

- [ ] Swap mocked validation for real `hadolint` / `kubeconform` child processes
      (requires deploying this route on Render/Railway/a VPS, not serverless)
- [ ] Generation history page (list past runs, re-open in editor)
- [ ] Terraform output as a third target
