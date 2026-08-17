<!-- MEGAPORTAL: 03 ENGINEERING STANDARDS -->
# 🌐 11_2027_WEB_ECOSYSTEM (Deep Tech Spec)

When building applications in this ecosystem, you are targeting the modern 2027 web stack. Do NOT use outdated 2023-2024 patterns.

## 1. AI-Native Architecture
* **Local Inference First:** For any AI feature, attempt to run it locally in the browser using the WebNN API or WebGPU. Only fallback to cloud APIs (OpenAI/Anthropic) for heavy reasoning tasks.
* **On-Device Embedding:** Use Wasm-compiled models to handle semantic search and embeddings directly on the client.

## 2. Ultra-Performance (Zero-JS & Edge)
* **Zero-JS Hydration:** Avoid heavy React/SPA hydration. Use frameworks that support partial hydration or island architecture (e.g., Astro, React Server Components, Nuxt). 
* **Edge Compute:** Deploy middleware and API routes to the Edge (Vercel Edge/Cloudflare Workers). Latency must be < 50ms.
* **WebAssembly (Wasm):** Use Rust/Go compiled to Wasm for any intensive client-side data processing, image manipulation, or cryptography. Do NOT do heavy math in JavaScript.

## 3. Next-Gen UI/UX
* **View Transitions API:** All page navigations and state changes must use native View Transitions for fluid, app-like feeling without complex Framer Motion overhead.
* **Scroll-Driven Animations:** Use CSS `animation-timeline: scroll()` instead of JS intersection observers.
* **Native Popovers & Dialogs:** Use the HTML `<dialog>` and Popover APIs. Do not build custom Z-index heavy modals.
* **CSS:** Use CSS nesting, `color-mix()`, relative colors, and `@container` queries natively.

## 4. Default Stack (Unless overridden in `brain.md`)
* **Frontend:** Next.js (App Router) or Vite (React/Vue) + Tailwind V4 / Native CSS.
* **Backend/DB:** Edge Functions + Serverless PostgreSQL (Neon/Supabase) or SQLite (Turso).
* **Testing:** Vitest (unit) + Playwright (E2E).
* **Deployment:** Vercel / Cloudflare.

## 5. PWA & Offline-First (2027 Default)
* Every web app MUST work offline for at least read operations. Use Service Workers + Cache API.
* Use the **Background Sync API** for queuing writes made offline.
* Implement a Web App Manifest (`manifest.json`) with all icon sizes (72px → 512px).
* Target: **Lighthouse PWA score ≥ 90** on every deploy.

## 6. Real-Time & AI Integration Patterns
### Real-Time:
* **WebSockets:** Use for bidirectional, low-latency features (chat, collaborative editing, live dashboards). Use Ably, Pusher, or Supabase Realtime.
* **Server-Sent Events (SSE):** Use for unidirectional server push (AI token streaming, notifications). Prefer SSE over WebSockets when the client never sends data back.

### AI/LLM Integration:
* **Streaming:** Always stream LLM responses via SSE/ReadableStream. Never block the UI waiting for a full response.
* **Local-First AI:** For classification, embedding, sentiment — run `transformers.js` (Xenova) in a Web Worker. Never block the main thread.
* **Cloud Fallback:** Only route to OpenAI/Anthropic/Gemini APIs when the task requires heavy reasoning that local models can’t handle.
* **Prompt Security:** Always sanitize user input before injecting into prompts. Implement server-side prompt injection detection.

---

# ⚡ 17_PERFORMANCE_GUIDE (Speed is a Feature)

> A slow app is a broken app. Performance is non-negotiable.

## 1. Core Web Vitals Targets (2027 Standard)
| Metric | Target | Tool |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse, PageSpeed |
| INP (Interaction to Next Paint) | < 200ms | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTFB (Time to First Byte) | < 800ms | WebPageTest |
| Bundle Size (JS) | < 150KB (gzipped) | `npx bundle-buddy` or `@next/bundle-analyzer` |

## 2. Lighthouse CI (Automated Performance Gating)
Add to your CI pipeline (`.github/workflows/perf.yml`):
```yaml
- name: Lighthouse CI
  run: npx lhci autorun
```
```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```
**Rule:** A PR that drops Lighthouse performance below 90 MUST NOT merge.

## 3. Error Monitoring (Sentry)
```bash
npx @sentry/wizard@latest -i nextjs
```
* Capture unhandled errors + performance transactions automatically.
* Set `tracesSampleRate: 0.1` in production (10% of requests traced).
* Set up **Sentry Alerts** for error spike > 10/min.

## 4. Image Optimization Rules
* NEVER serve raw JPG/PNG. Always use `<Image>` (Next.js) or `<picture>` with AVIF/WebP fallback.
* Use `loading="lazy"` for below-fold images, `fetchpriority="high"` for hero/LCP image.
* Max image width: serve appropriately sized variants (320w, 640w, 1280w).

## 5. Code Splitting & Lazy Loading
```js
// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
// Dynamic import in Next.js
const Map = dynamic(() => import('./Map'), { ssr: false });
```
* Any component > 50KB that is below-fold MUST be lazy loaded.

## 6. End-of-Task Performance Check
Before declaring any feature "done":
- [ ] Run `npx lighthouse http://localhost:3000 --output html`
- [ ] Check Network tab: any render-blocking scripts? (`async`/`defer` them)
- [ ] Check bundle size: `npx next build && npx next analyze`

**Linked Files:** [09_HACKER_TESTING.md](09_HACKER_TESTING.md) | [11_2027_WEB_ECOSYSTEM.md](11_2027_WEB_ECOSYSTEM.md) | [05_TESTING_GUIDE.md](05_TESTING_GUIDE.md)

---

# 🔌 19_API_DESIGN_GUIDE (Contract-First APIs)

> Never build a UI before you've designed the API contract. The contract is the truth.

## Decision Matrix: Which API Style?
| Scenario | Use | Why |
|---|---|---|
| Full-stack Next.js / same team | **tRPC** | End-to-end type safety, no codegen, no schema drift |
| Public API / third-party consumers | **REST** | Universal compatibility, easy to document with OpenAPI |
| Complex data requirements / multiple clients | **GraphQL** | Client queries exactly what it needs, no over-fetching |
| Real-time data | **WebSockets / SSE** | See `11_2027_WEB_ECOSYSTEM.md` |
| Simple CRUD, small team | **REST** | Lowest overhead |

## tRPC Setup (Recommended for Full-Stack)
```ts
// server/trpc.ts
import { initTRPC } from '@trpc/server';
const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed); // middleware

// routers/user.ts
export const userRouter = router({
  getProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.user.findUnique({ where: { id: input.userId } });
    }),
});
```

## REST API Rules
1. **Versioning:** Always prefix with `/api/v1/`. Breaking changes → bump to `v2`.
2. **Naming:** Plural nouns only. `/api/v1/users`, NOT `/api/v1/getUser`.
3. **HTTP Verbs:** `GET` (read), `POST` (create), `PUT` (full replace), `PATCH` (partial update), `DELETE`.
4. **Status Codes (Strict):**
   * `200` OK, `201` Created, `204` No Content (for DELETE)
   * `400` Bad Request (validation error), `401` Unauthenticated, `403` Forbidden
   * `404` Not Found, `409` Conflict (duplicate), `429` Rate Limited
   * `500` Server Error (never expose stack trace to client)
5. **Response Format:**
```json
{
  "success": true,
  "data": { "id": "123", "name": "Rohit" },
  "meta": { "page": 1, "totalPages": 10 }
}
```
Error format:
```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Token expired" } }
```

## Input Validation (Mandatory)
* Use **Zod** for all API inputs. No raw `req.body` access without parsing first.
```ts
const schema = z.object({ email: z.string().email(), age: z.number().min(18) });
const result = schema.safeParse(req.body);
if (!result.success) return res.status(400).json({ error: result.error.flatten() });
```

## Rate Limiting (All Public Routes)
```ts
import { Ratelimit } from '@upstash/ratelimit';
const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10s') });
// 10 requests per 10 seconds per IP
```

**Linked Files:** [03_SECURITY_AUDIT.md](03_SECURITY_AUDIT.md) | [09_HACKER_TESTING.md](09_HACKER_TESTING.md) | [11_2027_WEB_ECOSYSTEM.md](11_2027_WEB_ECOSYSTEM.md)

---

# 📦 07_GIT_COMMITS

Your history is your documentation. Keep it pristine.

## Branch Strategy
* `main` — Production only. **Protected.** Direct push NEVER allowed.
* `dev` — Integration branch. All features merge here first.
* `feature/[ticket-name]` — One branch per feature/fix.
* `hotfix/[issue]` — Critical prod bugs only. Merges to both `main` + `dev`.
* PR Rule: Minimum 1 approval before merge. No self-merging.

## Commit Rules:
1. Split work into atomic commits. One logical change = one commit. Never mix a fix and a refactor in the same commit.
2. Use Conventional Commits format:
   `type(scope): short imperative summary under 60 chars`
   *(Types: feat, fix, refactor, perf, docs, test, chore, style, build, ci)*
3. Add a blank line and a body explaining WHY the change was needed and any tradeoffs.
4. Mark breaking changes with `BREAKING CHANGE:`.
5. Never write vague messages like "update", "fix stuff", or "wip".

---

# 🧹 06_CLEANUP_RULES

Vibe coding leaves a mess. A smaller codebase makes your future AI responses smarter. Run this pass periodically.

## PHASE 1: Audit (Make zero changes)
Identify and list with evidence:
* Unused files, components, hooks, utils.
* Unused imports, variables, functions.
* Unused dependencies in `package.json`.
* Logic duplicated in 2+ places.
* Files that have grown >300 lines and should be split.

Present a table with a risk level for each deletion. Stop and wait for user approval.

## PHASE 2: Execute
* Delete ONLY what the user approved.
* Extract duplicated logic into shared utilities.
* Split oversized files strictly along responsibility lines.
* **Rule:** System behavior must remain identical. No new dependencies. No renaming public APIs.

---

# 📖 20_DOCUMENTATION_STANDARDS (Developer-Friendly)

> A great package with bad documentation will never be used. README is your product's landing page.

## 1. Mandatory README Structure
If you are building an Open-Source Package, Library, or CLI tool, your `README.md` MUST include the following sections:

### 🚀 Installation Command
Always provide the exact command to install the package at the very top.
```bash
npm install my-awesome-package
# or
pip install my-awesome-package
```

### ⚡ Quick Start Code
Provide a minimal code snippet showing how to import and use the package immediately.
```javascript
import { doSomething } from "my-awesome-package";

// Quick setup
const result = doSomething({ option: true });
console.log(result);
```

### 📚 API Reference
List all exported functions/classes. For each, specify:
* What it does.
* Arguments it takes (with types).
* What it returns.

## 2. Code Comments & JSDoc
* Do not write obvious comments like `// adds two numbers`.
* Use JSDoc (`/** ... */`) for all exported functions in libraries so developers get autocomplete in VS Code.

---
**Related Files:** [01_SYSTEM_CORE.md](01_SYSTEM_CORE.md) | [02_PRODUCT_DESIGN.md](02_PRODUCT_DESIGN.md) | [04_SECURITY_TESTING.md](04_SECURITY_TESTING.md) | [05_DEPLOYMENT_MAINTAIN.md](05_DEPLOYMENT_MAINTAIN.md) | [MANIFEST.md](MANIFEST.md) | [brain.md](brain.md)
