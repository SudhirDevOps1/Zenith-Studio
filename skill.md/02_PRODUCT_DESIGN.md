<!-- MEGAPORTAL: 02 PRODUCT DESIGN -->
# 📝 01_PRD_TEMPLATE

As an AI Vibe Coder, use this format to define what you are building BEFORE writing any code.

## 1. Problem Statement
* Who hurts and why?

## 2. Target User & Personas
* Persona 1: 
* Persona 2:

## 3. Goals and Non-Goals
* What is in scope?
* What is strictly OUT of scope for now?

## 4. User Stories (MVP)
* "As a [user], I want [action] so that [benefit]."

## 5. Functional Requirements
* Detailed breakdown of the MVP features.

## 6. Data Model Sketch
* Entities, key fields, and relationships. (Ensure compatibility with the modern tech stack chosen in `brain.md`).

## 7. Edge Cases & Failure States
* What happens when the network fails?
* What happens on bad input?

## 8. Success Metrics
* How do we know this feature worked?

## 9. Open Questions for User
* (Flag ambiguous requirements here. Do not invent them).

---

# 🎨 02_DESIGN_BRIEF (2027 Web Standards)

Before you code the UI, produce this brief based on the PRD.

## 1. Design Principles (2027 Edition)
* Principle 1: Utilize native browser capabilities (e.g., Popover API, native dialogs) over bloated JS libraries.
* Principle 2: Interaction to Next Paint (INP) must be near zero. Prioritize CSS animations over JS.
* Principle 3: Adopt Glassmorphism, scroll-driven reveals, and fluid typography.

## 2. Design Tokens
* **Colors:** Hex codes for Primary, Secondary, Background, Surface, Error, Success. (Include Dark Mode equivalents).
* **Typography:** Modern Google Fonts (e.g., Inter, Outfit). Define scales using `clamp()` for fluid sizing.
* **Spacing & Shadows:** Base spacing unit (e.g., 4px/8px system).

## 3. Screen Inventory & Flow
* List every screen, its primary action, and the user journey between them.

## 4. Component Library
* Define the reusable components needed (Buttons, Cards, Modals).
* Define states: Default, Hover, Active, Disabled, Loading.

## 5. Responsive & Accessibility (a11y)
* Container Queries over Media Queries where applicable.
* Ensure minimum 4.5:1 contrast ratios. 
* Keyboard navigation and ARIA attributes are mandatory.

---

# 🎨 14_BRANDING_GUIDE (Autonomous Design System)

> The user just gives an idea. YOU must design the entire brand identity BEFORE coding any UI.

## Step 1: Brand Personality Matrix
First, define the emotional identity:
| Dimension | Options | Choose One |
|---|---|---|
| Energy | High-energy vs. Calm | ? |
| Trust | Playful vs. Professional | ? |
| Style | Minimal vs. Bold | ? |
| Audience | Consumer vs. Developer | ? |

## Step 2: Color System (HSL-based, Not Hex)
Use HSL for theme flexibility and dark mode auto-generation:
```css
--color-primary:    hsl(220, 90%, 56%);   /* Electric Blue */
--color-secondary:  hsl(260, 80%, 60%);   /* Deep Purple */
--color-accent:     hsl(145, 70%, 50%);   /* Mint Green */
--color-bg:         hsl(220, 20%, 8%);    /* Near Black */
--color-surface:    hsl(220, 15%, 14%);   /* Card surface */
--color-text:       hsl(220, 10%, 92%);   /* Off-white */
--color-error:      hsl(0, 85%, 60%);
--color-success:    hsl(145, 70%, 45%);
```
* **Rule:** Primary color Hue must be ≥40° apart from Secondary to avoid muddiness.
* **Contrast:** Text on surface must meet 4.5:1 WCAG AA minimum.
* **Dark Mode:** Flip `--color-bg` and `--color-text` hsl L values; keep Hue/Saturation.

## Step 3: Typography Stack
```css
/* Import from Google Fonts */
font-family: 'Outfit', sans-serif;    /* Headers: geometric, modern */
font-family: 'Inter', sans-serif;     /* Body: humanist, readable */
font-family: 'JetBrains Mono', mono; /* Code blocks */

/* Fluid Type Scale (clamp: min, ideal, max) */
--text-xs:   clamp(0.75rem, 1.5vw, 0.875rem);
--text-sm:   clamp(0.875rem, 2vw, 1rem);
--text-base: clamp(1rem, 2.5vw, 1.125rem);
--text-lg:   clamp(1.125rem, 3vw, 1.25rem);
--text-xl:   clamp(1.5rem, 4vw, 2rem);
--text-2xl:  clamp(2rem, 5vw, 3rem);
--text-hero: clamp(3rem, 8vw, 5rem);
```

## Step 4: Logo Assets to Generate
1. **Primary Logo:** Full lockup — icon + wordmark side-by-side. SVG with viewBox="0 0 200 60".
2. **Secondary Logo / Icon:** Icon only (32x32, 64x64). Used for favicon, app icon.
3. **Wordmark:** Text-only. Font: Outfit Bold. Letter-spacing: -0.02em.
4. **Dark / Light variants** of all three above.

### SVG Logo Template:
```svg
<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Icon: geometric shape representing brand concept -->
  <g id="icon"><!-- shape here --></g>
  <!-- Wordmark -->
  <text x="52" y="38" font-family="Outfit" font-weight="700"
        font-size="24" fill="var(--color-primary)">AppName</text>
</svg>
```

## Step 5: Spacing & Shadow System
```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;

--shadow-sm: 0 1px 3px hsl(220 40% 0% / 0.3);
--shadow-md: 0 4px 16px hsl(220 40% 0% / 0.4);
--shadow-lg: 0 8px 32px hsl(220 40% 0% / 0.5);
--shadow-glow: 0 0 24px hsl(var(--primary-hue) 90% 60% / 0.4); /* Brand glow */
```

**Linked Files:** [02_DESIGN_BRIEF.md](02_DESIGN_BRIEF.md) | [00_SYSTEM_INSTRUCTIONS.md](00_SYSTEM_INSTRUCTIONS.md)

---

# 🎨 20_UI_COMPONENTS_GUIDE (The Consistency Enforcer)

> **Goal:** Ensure the AI builds a highly consistent, premium, and reusable UI system without reinventing the wheel for every new component.

## 1. 🏗️ The Golden Rule of UI
**NEVER write custom CSS or inline styles if a utility class or component library can do the job.**
- **Default Stack:** Tailwind CSS + Shadcn UI (Radix Primitives) + Framer Motion.
- **Why?** It guarantees 100% design consistency, accessibility (a11y), and zero CSS bloat.

## 2. 🧩 Component Library Rules (e.g., Shadcn UI)
When asked to build a UI element (Button, Modal, Dropdown, Table):
1. **Check First:** Does this component exist in Shadcn UI? (e.g., `npx shadcn-ui@latest add button`).
2. **Do Not Recreate:** Do not build a custom dropdown from scratch if a robust, accessible one already exists in the library.
3. **Extend, Don't Override:** If a component needs a specific look, use Tailwind `cn()` utility to merge classes safely without breaking the base component.

## 3. 🎨 Tailwind CSS Best Practices
- **Use Tokens, Not Magic Numbers:** Use `gap-4`, `p-6`, `text-lg`. NEVER use arbitrary values like `w-[237px]` unless absolutely necessary for pixel-perfect edge cases.
- **Color System:** Use CSS variables (e.g., `bg-background`, `text-primary`) to support automatic Light/Dark mode switching. Do not hardcode `bg-white` or `text-black`.
- **Responsive First:** Always write mobile-first classes (`flex flex-col md:flex-row`).

## 4. ♻️ Component Reusability (DRY)
- **Container vs Presentational:** Separate logic (data fetching) from UI. Pass data as props to dumb UI components.
- **The "Rule of 3":** If you build the same UI structure (like a card or a badge) more than twice, immediately refactor it into a reusable `<Component />` in the `components/ui/` folder.

## 5. ✨ Micro-Interactions & Animations
- Always add hover states (`hover:bg-accent`, `hover:text-accent-foreground`).
- Always add focus rings for accessibility (`focus-visible:ring-2 focus-visible:ring-ring`).
- Use `framer-motion` for page transitions and complex animations, but keep them subtle. Do not over-animate.

---



---
**Related Files:** [01_SYSTEM_CORE.md](01_SYSTEM_CORE.md) | [03_ENGINEERING_STANDARDS.md](03_ENGINEERING_STANDARDS.md) | [04_SECURITY_TESTING.md](04_SECURITY_TESTING.md) | [05_DEPLOYMENT_MAINTAIN.md](05_DEPLOYMENT_MAINTAIN.md) | [MANIFEST.md](MANIFEST.md) | [brain.md](brain.md)
