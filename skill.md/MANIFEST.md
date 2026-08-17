# 🗺️ MANIFEST.md — System Architecture Map

> This document is the master reference for the Vibe Ecosystem system. 
It defines how the AI navigates files, manages tokens, and executes workflows.

---

## 📐 System Flow Diagram

```mermaid
graph TD
    USER([👤 User gives a prompt]) --> ROUTER

    ROUTER{{"🚦 16_TOKEN_OPTIMIZATION_ROUTER\nWhat is the task scope?"}}

    ROUTER -->|"⚫ Tier 0\nFactual Q&A"| DIRECT([✅ Direct Answer\nNo files needed])
    ROUTER -->|"🟢 Tier 1\nSmall Fix / Bug"| T1
    ROUTER -->|"🟡 Tier 2\nNew Feature"| T2
    ROUTER -->|"🔴 Tier 3\nFull App / Refactor"| T3

    subgraph T1["🟢 Tier 1 Context"]
        BRAIN["🧠 brain.md\nProject Memory"]
        RULES["⚖️ 15_MANDATORY_RULES\nUnbreakable Laws"]
        CHANGELOG1["📜 CHANGELOG.md\nLog the fix"]
    end

    subgraph T2["🟡 Tier 2 Context"]
        PRD["📝 01_PRD_TEMPLATE\nDefine scope"]
        DESIGN["🎨 02_DESIGN_BRIEF\nUI/UX rules"]
        SECURITY["🛡️ 03_SECURITY_AUDIT\nSecurity check"]
        BRAND["🎨 14_BRANDING_GUIDE\nColors, fonts, logos"]
    end
graph TD;
    U[User Prompt] --> R(1. 01_SYSTEM_CORE.md);
    R --> D(2. 02_PRODUCT_DESIGN.md);
    R --> C(3. 03_ENGINEERING_STANDARDS.md);
    R --> S(4. 04_SECURITY_TESTING.md);
    R --> M(5. 05_DEPLOYMENT_MAINTAIN.md);
    
    D -.-> B[brain.md / CHANGELOG.md];
    C -.-> B;
    S -.-> B;
    M -.-> B;

    EXECUTE["💻 Execute Task"]
    EXECUTE --> REFLECT["🔁 13_SELF_REFLECTION_LOOP\nLearn from mistakes"]
    EXECUTE --> LOG["📜 CHANGELOG.md\nLog all changes"]
    EXECUTE --> UPDATE["🧠 brain.md\nUpdate memory"]
    EXECUTE --> SKILLS["⚡ skills/\nSave reusable skill"]
```

---

## 📂 V2 Architecture: The 5 Mega Pillars

### 1. The Core Brain
| File | Purpose | Reads Into |
|---|---|---|
| `01_SYSTEM_CORE.md` | Replaces 00_SYSTEM, Rules, Router, Memory, Reflection | → 02_PRODUCT_DESIGN |

### 2. Design & UI
| File | Purpose | Reads Into |
|---|---|---|
| `02_PRODUCT_DESIGN.md` | Replaces PRD, Design Brief, Branding, UI Components | → 03_ENGINEERING_STANDARDS |

### 3. Code & Engineering
| File | Purpose | Reads Into |
|---|---|---|
| `03_ENGINEERING_STANDARDS.md` | Replaces 2027 Ecosystem, Performance, API, Git, Cleanup | → 04_SECURITY_TESTING |

### 4. Security & Testing
| File | Purpose | Reads Into |
|---|---|---|
| `04_SECURITY_TESTING.md` | Replaces Security Audit, Hacker Testing, Debugging, Testing Guide | → 05_DEPLOYMENT_MAINTAIN |

### 5. Deployment & Maintenance
| File | Purpose | Reads Into |
|---|---|---|
| `05_DEPLOYMENT_MAINTAIN.md` | Replaces Deployment Guide, Skills Creation, Autonomous Research | → Execute |

### 📚 Skills Library
| File | Purpose |
|---|---|
| `skills/README.md` | Index of reusable task templates |
| `skills/*.md` | Individual skill files (added over time) |

---

## 🔗 Cross-Reference Quick Guide

> When working on X, also check Y:

| Working on... | Also read... |
|---|---|
| New app idea | `01_PRD` → `14_BRANDING` → `02_DESIGN` |
| API endpoint | `19_API_DESIGN` → `03_SECURITY` → `09_HACKER` |
| Deployment | `07_GIT` → `17_PERFORMANCE` → `18_DEPLOYMENT` |
| Bug fix | `04_DEBUGGING` → `13_SELF_REFLECTION` → `CHANGELOG` |
| UI component | `02_DESIGN` → `14_BRANDING` → `05_TESTING` |
| Database schema | `01_PRD` → `03_SECURITY` → `19_API_DESIGN` |
| Performance issue | `17_PERFORMANCE` → `11_2027_WEB` → `06_CLEANUP` |

---

## 📊 System Stats
| Metric | Value |
|---|---|
| Total Files | 28 (including skills/) |
| Core System Files | 22 |
| Skills Library | Expandable |
| Token Router Tiers | 4 (0, 1, 2, 3) |
| Max Token Savings | 90% (Tier 0) |
| Security Checks | 8 attack vectors |
| 2027 Standards | WebNN, WebGPU, PWA, SSE, Edge |

**Related Files:** [00_SYSTEM_INSTRUCTIONS.md](00_SYSTEM_INSTRUCTIONS.md) | [16_TOKEN_OPTIMIZATION_ROUTER.md](16_TOKEN_OPTIMIZATION_ROUTER.md) | [README.md](README.md)
