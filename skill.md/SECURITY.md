# 🔐 SECURITY.md — What to NEVER push to GitHub

> इस file को ध्यान से पढ़ें। GitHub पर push करने से पहले यह checklist follow करें।

---

## ✅ Push करने से पहले Checklist

```
[ ] brain.md में कोई real API key नहीं है
[ ] brain.md में कोई DB connection string (postgresql://, mongodb+srv://) नहीं है
[ ] brain.md में कोई personal email, phone, या client name नहीं है
[ ] .env file .gitignore में है
[ ] कोई hardcoded password नहीं है किसी भी .md file में
[ ] skills/ folder में कोई real credentials नहीं हैं
```

---

## 🚨 यह चीज़ें कभी GitHub पर मत डालो

| Type | Example | क्या होगा अगर expose हो |
|---|---|---|
| API Keys | `sk-proj-[REDACTED]` | पैसे कट जाएंगे, account ban |
| DB URLs | `db-host://user:[PASSWORD]@host/db` | Database hack हो सकता है |
| JWT Secrets | `SECRET=[REDACTED_SECRET]` | Users का account compromise |
| GitHub Tokens | `ghp_[REDACTED]` | Repo delete हो सकता है |
| Firebase Key | `AIzaSy[REDACTED]` | Firebase project का data exposed |
| Stripe Keys | `sk_live_[REDACTED]` | पैसों का fraud हो सकता है |
| AWS Keys | `AKIA[REDACTED]` | Cloud bill लाखों में आ सकता है |
| Supabase Key | `eyJ[REDACTED]` | Database publicly accessible |

---

## 🧠 brain.md के बारे में

`brain.md` एक project-specific memory file है। **Real project में** यह dangerous हो सकता है।

### Safe तरीका:

**Option 1:** `.gitignore` में `brain.md` uncomment करो:
```
# .gitignore में यह line uncomment करो:
brain.md
```
फिर `brain.template.md` (empty template) commit करो।

**Option 2:** brain.md को push करो लेकिन **पहले scan करो:**
```powershell
# Windows PowerShell में run करो:
Select-String -Path "brain.md" -Pattern "(api.?key|secret|password|token|postgresql|mongodb|mysql|redis|sk-|pk-|ghp_)" -CaseSensitive:$false
```
अगर कोई match नहीं आया → safe to push ✅
अगर match आया → उन lines को हटाओ पहले ❌

---

## 🔧 अगर गलती से Secret push हो गया

### तुरंत यह करो (इस order में):

**Step 1: Secret को revoke/rotate करो** (सबसे ज़रूरी)
```
- GitHub Token → github.com/settings/tokens → Delete
- OpenAI Key → platform.openai.com → API Keys → Revoke
- Stripe → dashboard.stripe.com → Developers → API Keys → Roll
- Supabase → Project Settings → API → New key generate करो
```

**Step 2: Git history से हटाओ**
```bash
# Method 1: BFG Repo Cleaner (आसान)
npx bfg --delete-files .env
git push --force

# Method 2: git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push --force
```

**Step 3: GitHub को notify करो** (अगर public repo था)
```
GitHub automatically scans for secrets.
Agar GitHub ne warning diya → Settings → Code security → Secret scanning alerts
```

---

## 🛡️ git push से पहले Automatic Check (Recommended)

`.git/hooks/pre-commit` file बनाओ:
```bash
#!/bin/sh
# Scan for secrets before every commit
if git diff --cached --name-only | xargs grep -l -E "(api_key|secret|password|sk-|ghp_|AKIA|postgresql://|mongodb\+srv)" 2>/dev/null; then
  echo "🚨 STOP! Possible secret detected in staged files."
  echo "Review the files above before committing."
  exit 1
fi
```

---

## 📋 GitHub Push करते समय Credentials Warning

अगर GitHub credentials माँगे तो:

**Option 1: GitHub CLI (आसान)**
```bash
# Install
winget install GitHub.cli

# Login (browser में होगा, कोई password terminal में नहीं)
gh auth login
```

**Option 2: Personal Access Token**
```
1. github.com → Settings → Developer Settings
2. Personal Access Tokens → Tokens (classic) → Generate new
3. Scope: repo (full), workflow
4. Token copy करो → git push में password की जगह यह token use करो
5. Token को NEVER किसी file में save मत करो
```

**Option 3: SSH Key (सबसे secure)**
```bash
# Generate key
ssh-keygen -t ed25519 -C "your-email@example.com"

# GitHub पर add करो
# github.com → Settings → SSH Keys → New SSH Key
# cat ~/.ssh/id_ed25519.pub → copy करो

# Remote URL change करो
git remote set-url origin git@github.com:SudhirDevOps1/Skill.md.git
```

---

*🔐 Security is not optional — it's the foundation.*

---
**Related Files:** [03_SECURITY_AUDIT.md](03_SECURITY_AUDIT.md) | [09_HACKER_TESTING.md](09_HACKER_TESTING.md) | [07_GIT_COMMITS.md](07_GIT_COMMITS.md) | [MANIFEST.md](MANIFEST.md)
