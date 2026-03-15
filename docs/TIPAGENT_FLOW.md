# TipAgent - Complete System Flow

> **TipAgent** adalah platform yang secara otomatis memberikan tip USDT kepada kontributor open source ketika mereka merge PR atau close issue di GitHub.

---

## 📋 Daftar Isi

1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Peran Pengguna](#peran-pengguna)
3. [Alur Project Owner](#alur-project-owner)
4. [Alur Contributor](#alur-contributor)
5. [Kapan Agent Bekerja](#kapan-agent-bekerja)
6. [Proses Pembagian Tip](#proses-pembagian-tip)
7. [Diagram Alur Lengkap](#diagram-alur-lengkap)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              TipAgent System                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐   │
│   │   GitHub     │────▶│   Webhook    │────▶│   AI Agent (Gemini)  │   │
│   │   Events     │     │   Handler    │     │   Evaluates Event    │   │
│   └──────────────┘     └──────────────┘     └──────────┬───────────┘   │
│                                                         │               │
│                                                         ▼               │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐   │
│   │  Contributor │◀────│   USDT       │◀────│   HD Wallet Manager  │   │
│   │  Wallet      │     │   Transfer   │     │   (Base Network)     │   │
│   └──────────────┘     └──────────────┘     └──────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Komponen Utama

| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| **Frontend** | React + Vite | Dashboard untuk owner & contributor |
| **Backend API** | Cloudflare Workers + Hono | Handle requests, webhooks, auth |
| **Database** | Cloudflare D1 (SQLite) | Store users, projects, tips history |
| **AI Agent** | Google Gemini API | Evaluasi kontribusi & tentukan tip amount |
| **Blockchain** | Base Network (L2) | Transfer USDT ke contributor |
| **Queue** | Cloudflare Queues | Process tip jobs async |

---

## 👥 Peran Pengguna

### 1. Project Owner (Pemberi Tip)
- Pemilik repository GitHub
- Mendaftarkan repo ke TipAgent
- Mendanai treasury dengan USDT
- Mengatur rules tip (min/max amount, daily cap, cooldown)

### 2. Contributor (Penerima Tip)
- Developer yang berkontribusi ke repo
- Mendaftarkan wallet address di profile
- Menerima tip otomatis saat kontribusi di-approve

---

## 🔧 Alur Project Owner

### Step 1: Login & Setup Project

```
1. Buka /login
2. Klik "Continue with GitHub"
3. Authorize TipAgent app
4. Redirect ke /dashboard
```

### Step 2: Tambah Repository

```
1. Buka /projects
2. Klik "Add Project"
3. Masukkan nama repo (format: owner/repo)
   ⚠️ Anda harus punya admin access ke repo ini
4. Klik "Create Project"
5. ✅ Webhook OTOMATIS dibuat di GitHub!
```

> **Note**: Webhook di-setup otomatis menggunakan GitHub token Anda. 
> Tidak perlu setup manual di GitHub Settings.

### Step 3: Konfigurasi Tip Rules & Task Priorities

Setelah project dibuat, buka halaman detail project untuk mengatur:

**Tip Rules** (klik Edit):
- **Min Tip**: Minimum tip per kontribusi (default: $0.50)
- **Max Tip**: Maximum tip per kontribusi (default: $50)
- **Daily Cap**: Batas total tip per hari (default: $100)
- **Cooldown**: Jeda antar tip untuk user yang sama (default: 1 jam)

**Task Priorities** (klik Edit):
Deskripsikan prioritas pekerjaan agar AI bisa menentukan tip yang tepat:

```
HIGH PRIORITY ($30-50):
- Fix critical security bugs
- Implement new major features
- Performance optimizations

MEDIUM PRIORITY ($10-30):
- Bug fixes
- Documentation improvements
- Test coverage

LOW PRIORITY ($1-10):
- Typo fixes
- Minor UI tweaks
```

> **Tip**: Semakin detail deskripsi task, semakin akurat AI menentukan tip amount.

### Step 4: Fund Treasury

Setiap project memiliki **HD Wallet** unik di Base Network.

```
1. Buka /projects/[id]
2. Copy "Wallet Address"
3. Kirim dari wallet Anda:
   - USDT: Jumlah yang ingin di-tip-kan
   - ETH: 0.001-0.01 untuk gas fees
4. Tunggu konfirmasi (biasanya < 1 menit)
5. Balance akan muncul di dashboard
```

---

## 💰 Alur Contributor

### Step 1: Login & Set Wallet

```
1. Buka /login
2. Login dengan GitHub
3. Klik avatar di navbar → Profile
4. Masukkan wallet address (Base Network)
5. Klik "Save Wallet Address"
```

### Step 2: Explore Projects

```
1. Buka /explore
2. Lihat daftar project yang aktif
3. Perhatikan "Tip Range" (min-max tip)
4. Klik "View" untuk buka repo di GitHub
```

### Step 3: Kontribusi

```
1. Fork repository
2. Buat perubahan (fix bug, add feature, dll)
3. Submit Pull Request
4. Tunggu review dari maintainer
5. Setelah PR di-merge → TIP OTOMATIS DIKIRIM!
```

### Step 4: Track Tips

```
1. Buka /my-tips
2. Lihat semua tips yang diterima
3. Status: Pending → Confirmed
4. Klik "View TX" untuk lihat di BaseScan
```

---

## 🤖 Kapan Agent Bekerja

AI Agent **HANYA** bekerja ketika ada **GitHub Webhook Event**. Agent TIDAK berjalan terus-menerus.

### Trigger Events

| Event | Kapan Terjadi | Agent Action |
|-------|---------------|--------------|
| `pull_request.closed` + `merged=true` | PR di-merge | ✅ Evaluate & Tip |
| `pull_request.closed` + `merged=false` | PR ditutup tanpa merge | ❌ Skip |
| `issues.closed` | Issue ditutup | ✅ Evaluate & Tip |
| `pull_request.opened` | PR baru dibuat | ❌ Skip |
| `issues.opened` | Issue baru dibuat | ❌ Skip |

### Agent Evaluation Process

Ketika event yang valid diterima, AI Agent melakukan:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT EVALUATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INPUT:                                                          │
│  ├── Event type (pr_merged / issue_closed)                      │
│  ├── PR/Issue title & description                               │
│  ├── Changed files & diff (untuk PR)                            │
│  ├── Author GitHub username                                     │
│  └── Project tip rules (min/max/cap)                            │
│                                                                  │
│  EVALUATION CRITERIA:                                            │
│  ├── Complexity of changes                                      │
│  ├── Impact on project                                          │
│  ├── Quality of implementation                                  │
│  ├── Documentation updates                                      │
│  └── Test coverage                                              │
│                                                                  │
│  OUTPUT:                                                         │
│  ├── shouldTip: boolean                                         │
│  ├── amount: number (dalam range min-max)                       │
│  └── reasoning: string (alasan keputusan)                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Decision Examples

**✅ Tip Approved:**
```json
{
  "shouldTip": true,
  "amount": 15.00,
  "reasoning": "PR adds significant feature with proper tests and documentation. 
               Changed 5 files, added 200+ lines of well-structured code."
}
```

**❌ Tip Rejected:**
```json
{
  "shouldTip": false,
  "amount": 0,
  "reasoning": "PR only updates README formatting. 
               Minimal impact, below threshold for tip."
}
```

---

## 💸 Proses Pembagian Tip

### Step-by-Step Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         TIP DISTRIBUTION FLOW                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. WEBHOOK RECEIVED                                                      │
│     └── GitHub sends POST to /webhooks/github                            │
│         └── Verify signature with webhook secret                         │
│                                                                           │
│  2. EVENT VALIDATION                                                      │
│     ├── Is repo registered? ────────────────────────▶ NO → Reject        │
│     ├── Is project active? ─────────────────────────▶ NO → Reject        │
│     ├── Is event type valid (pr_merged/issue_closed)? ▶ NO → Skip        │
│     └── All checks passed ──────────────────────────▶ Continue           │
│                                                                           │
│  3. CONTRIBUTOR CHECK                                                     │
│     ├── Find user by GitHub username                                     │
│     ├── User has wallet address? ───────────────────▶ NO → Queue pending │
│     └── Wallet found ───────────────────────────────▶ Continue           │
│                                                                           │
│  4. RATE LIMIT CHECK                                                      │
│     ├── User tipped within cooldown period? ────────▶ YES → Reject       │
│     ├── Daily cap reached for project? ─────────────▶ YES → Reject       │
│     └── All limits OK ──────────────────────────────▶ Continue           │
│                                                                           │
│  5. AI AGENT EVALUATION                                                   │
│     ├── Send event data to Gemini API                                    │
│     ├── Agent analyzes contribution                                      │
│     ├── Agent decides: shouldTip + amount + reasoning                    │
│     └── shouldTip = false? ─────────────────────────▶ Log & Exit         │
│                                                                           │
│  6. TREASURY CHECK                                                        │
│     ├── Get project treasury balance                                     │
│     ├── Balance >= tip amount? ─────────────────────▶ NO → Reject        │
│     └── Sufficient funds ───────────────────────────▶ Continue           │
│                                                                           │
│  7. QUEUE TIP JOB                                                         │
│     └── Add to Cloudflare Queue for async processing                     │
│                                                                           │
│  8. PROCESS TIP (Queue Worker)                                            │
│     ├── Get project HD wallet private key                                │
│     ├── Build USDT transfer transaction                                  │
│     ├── Sign with project wallet                                         │
│     ├── Broadcast to Base Network                                        │
│     └── Wait for confirmation                                            │
│                                                                           │
│  9. POST-TIP ACTIONS                                                      │
│     ├── Update tip_history status = 'confirmed'                          │
│     ├── Update treasury balance                                          │
│     ├── Post comment on GitHub PR/Issue (optional)                       │
│     └── Send notification to contributor (optional)                      │
│                                                                           │
│  ✅ TIP COMPLETE!                                                         │
│     └── Contributor receives USDT in their wallet                        │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Timeline Example

```
14:00:00  Developer submits PR #42
14:05:00  Maintainer reviews PR
14:10:00  Maintainer clicks "Merge pull request"
14:10:01  GitHub sends webhook to TipAgent
14:10:02  TipAgent validates event & checks rate limits
14:10:03  AI Agent evaluates PR (analyzes diff, title, description)
14:10:05  Agent decides: $12.50 tip for "good feature implementation"
14:10:06  Tip job queued
14:10:07  Queue worker processes job
14:10:08  USDT transfer initiated on Base Network
14:10:15  Transaction confirmed (block mined)
14:10:16  Tip status updated to 'confirmed'
14:10:17  GitHub comment posted: "🎉 @developer received $12.50 tip!"

Total time: ~17 seconds from merge to tip received
```

---

## 📊 Diagram Alur Lengkap

```
                                    ┌─────────────────┐
                                    │   GITHUB REPO   │
                                    └────────┬────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │                             │
                    ┌─────────▼─────────┐       ┌──────────▼──────────┐
                    │  PROJECT OWNER    │       │    CONTRIBUTOR      │
                    │  (Pemberi Tip)    │       │   (Penerima Tip)    │
                    └─────────┬─────────┘       └──────────┬──────────┘
                              │                             │
              ┌───────────────┼───────────────┐             │
              │               │               │             │
              ▼               ▼               ▼             ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Register │   │  Setup   │   │   Fund   │   │   Set    │
        │  Repo    │   │ Webhook  │   │ Treasury │   │  Wallet  │
        └──────────┘   └──────────┘   └──────────┘   └──────────┘
                              │                             │
                              │                             │
                              │         ┌───────────────────┘
                              │         │
                              │         ▼
                              │   ┌──────────┐
                              │   │ Kontribusi│
                              │   │ (PR/Issue)│
                              │   └─────┬────┘
                              │         │
                              │         ▼
                              │   ┌──────────┐
                              │   │  Merge/  │
                              │   │  Close   │
                              │   └─────┬────┘
                              │         │
                              ▼         ▼
                        ┌─────────────────────┐
                        │   GITHUB WEBHOOK    │
                        │   (Event Trigger)   │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   TIPAGENT API      │
                        │   Webhook Handler   │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ Validate │  │  Check   │  │  Check   │
              │  Event   │  │  Limits  │  │ Treasury │
              └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │             │
                   └─────────────┼─────────────┘
                                 │
                                 ▼
                        ┌─────────────────────┐
                        │    AI AGENT         │
                        │  (Gemini API)       │
                        │                     │
                        │  • Analyze PR/Issue │
                        │  • Evaluate impact  │
                        │  • Decide tip amount│
                        └──────────┬──────────┘
                                   │
                          ┌────────┴────────┐
                          │                 │
                    shouldTip=true    shouldTip=false
                          │                 │
                          ▼                 ▼
                   ┌──────────┐       ┌──────────┐
                   │  Queue   │       │   Log    │
                   │ Tip Job  │       │  & Exit  │
                   └────┬─────┘       └──────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ QUEUE WORKER │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  HD WALLET   │
                 │  (Project)   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ USDT TRANSFER│
                 │ Base Network │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ CONTRIBUTOR  │
                 │   WALLET     │
                 │              │
                 │  💰 +$XX.XX  │
                 └──────────────┘
```

---

## 🔐 Security Notes

1. **Webhook Signature**: Setiap webhook di-verify dengan HMAC-SHA256
2. **HD Wallet**: Setiap project punya wallet terpisah (derived from master seed)
3. **Session Auth**: JWT-based authentication dengan httpOnly cookies
4. **Rate Limiting**: Cooldown per user, daily cap per project

---

## 📝 Database Schema (Simplified)

```sql
-- Users (both owners & contributors)
users (id, github_id, github_username, wallet_addr, chain)

-- Projects (repos registered by owners)
projects (id, owner_id, github_repo, webhook_secret, wallet_address, 
          tip_min_usdt, tip_max_usdt, daily_cap, cooldown_hours, is_active)

-- Treasury (balance per project)
project_treasuries (id, project_id, balance_usdt, aave_usdt, 
                    total_deposited, total_tipped)

-- Tip History (all tips sent)
tip_history (id, project_id, event_id, source, event_type, 
             recipient_id, recipient_addr, amount_usdt, reasoning,
             status, tx_hash, created_at, confirmed_at)
```

---

## 🚀 Quick Start

### Untuk Project Owner:
```bash
1. Login di https://tipagent.xyz/login
2. Tambah project di /projects
3. Setup webhook di GitHub repo
4. Fund treasury dengan USDT + ETH
5. Done! Tips akan otomatis dikirim ke contributor
```

### Untuk Contributor:
```bash
1. Login di https://tipagent.xyz/login
2. Set wallet di /profile
3. Explore projects di /explore
4. Kontribusi ke repo yang menarik
5. Terima tip otomatis saat PR merged!
```

---

## ❓ FAQ

**Q: Berapa lama tip sampai ke wallet saya?**
A: Biasanya 10-30 detik setelah PR di-merge.

**Q: Apakah semua PR/issue dapat tip?**
A: Tidak. AI Agent mengevaluasi setiap kontribusi. PR yang terlalu kecil (typo fix, formatting) mungkin tidak mendapat tip.

**Q: Bagaimana jika saya belum set wallet?**
A: Tip akan di-queue sebagai "pending". Setelah Anda set wallet, tip akan dikirim.

**Q: Network apa yang digunakan?**
A: Base Network (Ethereum L2). Gas fees sangat murah (~$0.001 per transfer).

**Q: Apakah ada fee dari TipAgent?**
A: Saat ini tidak ada fee. 100% tip masuk ke contributor.

---

*Last updated: March 2026*
