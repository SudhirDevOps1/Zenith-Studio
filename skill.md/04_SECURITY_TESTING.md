<!-- MEGAPORTAL: 04 SECURITY TESTING -->
# 🛡️ 03_SECURITY_AUDIT

Run this checklist BEFORE deploying any code. Do NOT modify code during the audit, just list the findings.

## Check For:
1. **Authentication & Session:** Are tokens stored securely? (No localStorage for JWTs, use HttpOnly cookies).
2. **Authorization:** Can User A access User B's data? (IDOR checks).
3. **Secrets:** Are there any hardcoded API keys or tokens in the client bundle?
4. **Injection:** Are all database queries parameterized? Is user input sanitized to prevent XSS?
5. **Rate Limiting:** Are public API routes protected against brute force?
6. **CORS & Headers:** Are security headers set (CSP, Strict-Transport-Security)? Is CORS overly permissive?

## Output Format:
* **Severity:** Critical / High / Medium / Low
* **File & Line:** 
* **Exploit Scenario:** How an attacker would abuse this.
* **Proposed Fix:** The exact code fix (wait for user approval to apply).

---

# 🕵️ 09_HACKER_TESTING (Red Team Protocol)

> **MANDATORY GATE:** You cannot declare a feature "complete" until you have passed this protocol.

Once you have written code that works (happy path), you must immediately switch your persona to a **Malicious Hacker**. Your goal is to break the system you just built.

## 1. Attack Vectors to Simulate
For every new endpoint, UI form, or database query, simulate the following attacks:
* **SQL/NoSQL Injection:** Pass malicious payloads (`' OR 1=1; --`, `{"$gt": ""}`).
* **XSS (Cross-Site Scripting):** Inject `<script>alert(1)</script>` or `javascript:void(0)` in all inputs.
* **IDOR (Insecure Direct Object Reference):** Attempt to access another user's ID (e.g., changing `/api/user/123` to `/api/user/124`).
* **Mass Assignment:** Try sending extra fields in the JSON payload (e.g., `"isAdmin": true`).
* **Rate Limiting & DoS:** Can you crash the server by calling this function 10,000 times a second?
* **CSRF (Cross-Site Request Forgery):** Can a malicious site trigger a state-changing action (e.g., fund transfer) on behalf of a logged-in user? Verify CSRF tokens or SameSite cookie policy exist.
* **Path Traversal:** In any file upload or file-read endpoint, try `../../etc/passwd` or `..\..\windows\system32` as input.
* **Dependency Vulnerabilities:** Run `npm audit --audit-level=high` and `npx better-npm-audit audit`. Block any Critical/High severity packages from being shipped to production.

## 2. Red Team Review Process
* **Analyze:** Actively look for logic flaws. "If I do X then Y out of order, does it crash?"
* **Exploit:** Write down exactly how you would exploit the code you just wrote.
* **Mitigate:** Apply the fix to your own code.

## 3. Approval
Only when you, acting as the Hacker, can no longer find a viable exploit, may you proceed to commit the code. Document the attempted attacks and mitigations in `CHANGELOG.md`.

---

# 🐛 04_DEBUGGING_PROTOCOL

When the user reports a bug, you MUST follow this protocol. DO NOT write any fix immediately.

## Step 1: Restate
Restate the problem in your own words to ensure you understand.

## Step 2: Hypothesis
List the 3-5 most likely root causes, ranked by probability, with reasoning for each.

## Step 3: Test
For each cause, provide the single fastest way to confirm or eliminate it (a log line, a network tab check, a one-line code test).

## Step 4: STOP
Stop and wait for the user to provide the test results.

## Step 5: Fix
Only after confirming the root cause, write the minimal fix. Explain why it works, and tell the user exactly what to test to verify. DO NOT refactor unrelated code.

---

# 🧪 05_TESTING_GUIDE

E2E Testing ensures we don't break features during vibe coding. Default to Playwright for modern web apps.

## Layer 1: Unit Tests (Vitest)
* Use **Vitest** for all utility functions, hooks, and business logic.
* Rule: Any function with >2 code paths MUST have a unit test.
* Run: `npx vitest run` or `npx vitest --ui` for visual dashboard.
* Co-locate test files: `utils/format.ts` → `utils/format.test.ts`
* Mock external dependencies (APIs, DB) — never hit real endpoints in unit tests.

## Layer 2: E2E Tests (Playwright)
1. Identify the critical user journeys (happy paths + realistic failure states).
2. Wait for user approval on the journeys BEFORE writing tests.
3. Use resilient selectors: always prefer `data-testid` or role-based selectors (`getByRole`). Add missing `data-testid` attributes to components as needed.
4. Implement an auth fixture so logged-in tests don't repeat the login flow every run.
5. Seed and clean up test data so tests are isolated.

## Integration:
* Ensure `npm run test:e2e` works locally.
* Add a CI workflow (e.g., GitHub Actions) to run tests on every PR.

---



---
**Related Files:** [01_SYSTEM_CORE.md](01_SYSTEM_CORE.md) | [02_PRODUCT_DESIGN.md](02_PRODUCT_DESIGN.md) | [03_ENGINEERING_STANDARDS.md](03_ENGINEERING_STANDARDS.md) | [05_DEPLOYMENT_MAINTAIN.md](05_DEPLOYMENT_MAINTAIN.md) | [MANIFEST.md](MANIFEST.md) | [brain.md](brain.md)
