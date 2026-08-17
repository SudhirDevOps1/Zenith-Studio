<!-- MEGAPORTAL: 05 DEPLOYMENT MAINTAIN -->
# 🚀 18_DEPLOYMENT_GUIDE (Ship It Right)

> Code that isn't deployed is just homework. Ship with confidence.

## Decision Matrix: Where to Deploy?
| App Type | Platform | Command |
|---|---|---|
| Next.js / React | **Vercel** (first choice) | `npx vercel --prod` |
| Static Site / SPA | **Cloudflare Pages** | `npx wrangler pages deploy ./dist` |
| API / Worker | **Cloudflare Workers** | `npx wrangler deploy` |
| Full-stack Docker | **Railway / Render** | Push to `main` (auto-deploy) |
| Mobile (PWA) | Vercel + manifest.json | Same as Next.js |

## Vercel Deployment (Step-by-Step)
```bash
# 1. Install Vercel CLI (first time only)
npm i -g vercel

# 2. Link project (first time only)
vercel link

# 3. Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production

# 4. Deploy to preview
vercel

# 5. Promote to production (after testing preview URL)
vercel --prod
```

## Cloudflare Workers (Step-by-Step)
```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Init (first time)
wrangler init my-worker

# 4. Deploy
wrangler deploy
```

## Environment Variables Checklist
Before EVERY deployment, verify:
- [ ] No hardcoded secrets in client bundle (`NEXT_PUBLIC_` prefix only for public keys)
- [ ] `.env.local` is in `.gitignore`
- [ ] Production env vars set in platform dashboard (Vercel/CF)
- [ ] `NODE_ENV=production` is set

## Post-Deploy Verification
After every deployment:
1. Open the live URL in an **incognito window**.
2. Check the Network tab: any 404 errors on assets?
3. Check console: any runtime errors?
4. Run Lighthouse on the live URL.
5. Test the critical user journey (auth → core action → logout).

## Rollback Protocol
```bash
# Vercel: instant rollback to previous deployment
vercel rollback

# Cloudflare: rollback via dashboard
# Workers > your-worker > Deployments > previous > Rollback
## NPM / PyPI Publishing (Open-Source Packages)
If the project is a Library or CLI tool, do NOT publish manually from the terminal. Use GitHub Actions for automated publishing.

### 1. Semantic Versioning (SemVer)
Always increment versions based on these strict rules (`MAJOR.MINOR.PATCH`):
- **Patch (`1.0.1`)**: Small bug fixes or typo corrections.
- **Minor (`1.1.0`)**: New features that do NOT break existing code (backward compatible).
- **Major (`2.0.0`)**: Breaking changes that will require users to update their code.

### 2. GitHub Actions (Automated CI/CD)
Create `.github/workflows/release.yml` so the package is published automatically when a new release tag is pushed.
```yaml
name: Publish Package
on:
  release:
    types: [published]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
**Rule:** The AI must instruct the user to generate an NPM Token (or PyPI token) and save it in GitHub Secrets.

---

# ⚡ 08_SKILL_CREATION

When a complex task is completed successfully and might need to be repeated in the future (or in another project), convert it into a reusable Skill. Save the output in the `skills/` directory.

## Skill Production Format:
1. **Name:** Short, action-oriented.
2. **Trigger Description:** Exactly when this Skill should and should NOT be used.
3. **Instructions:** Numbered, step-by-step. Assume the model reading this has zero prior context about the project.
4. **Rules & Constraints:** Hard requirements (what MUST NOT happen).
5. **Output Format:** Expected result template.
6. **Worked Example:** One full input-to-output example.
7. **Failure Modes:** 3-5 ways this commonly goes wrong and how to avoid them.

---

# 🔍 12_AUTONOMOUS_RESEARCH (The "Chalak" AI Protocol)

> **RULE:** AI must NEVER guess syntax, API endpoints, or modern 2027 best practices if it is unsure. AI must do its own research.

## Trigger Conditions
You MUST use a web search tool or read documentation files autonomously when:
1. You encounter a library, framework version, or API that was released after your training cutoff (e.g., specific React 19/20 hooks, Next.js App Router updates, WebGPU native APIs).
2. You face a compiler error or runtime error that you do not instantly know the exact root cause for.
3. The user asks for a specific design pattern you aren't 100% confident about.

## Execution Steps
1. **Pause Coding:** Do not write any implementation code.
2. **Search:** Use your web search or documentation reading tools (e.g., `search_web`, `read_url_content`). 
3. **Synthesize:** Read the official docs, GitHub issues, or StackOverflow.
4. **Apply:** Once you have the EXACT syntax, proceed to write the code. 
5. **Log:** Document the researched solution in `CHANGELOG.md` so the user knows you verified it.

---



---
**Related Files:** [01_SYSTEM_CORE.md](01_SYSTEM_CORE.md) | [02_PRODUCT_DESIGN.md](02_PRODUCT_DESIGN.md) | [03_ENGINEERING_STANDARDS.md](03_ENGINEERING_STANDARDS.md) | [04_SECURITY_TESTING.md](04_SECURITY_TESTING.md) | [MANIFEST.md](MANIFEST.md) | [brain.md](brain.md)
