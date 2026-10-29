# git-practice-web 🚀

โปรเจกต์ฝึก **git flow + CI (GitHub Actions) + Docker + Self-hosted Runner (auto deploy)** แบบครบวงจร
เว็บ Express โง่ ๆ 1 หน้า + test 3 ตัว ไว้ให้ CI รัน แล้ว auto deploy ด้วย Docker บนเครื่องตัวเอง

---

## ภาพรวมระบบ

```
         เขียนโค้ดใน branch ที่แตกจาก develop (เช่น test)
                              │
          PR: develop ← test  │  → CI รัน test บน GitHub (ubuntu-latest)
                              ▼
          PR: release ← develop  → merge = push เข้า release
                              │
                              ▼
          Deploy workflow ทำงานบน "เครื่องเรา" (self-hosted runner)
          → docker build → docker run → เว็บขึ้นที่ http://localhost:3000
```

Workflow 2 ตัว รันคนละที่:

| Workflow | ไฟล์ | รันที่ไหน | ทำงานตอน |
|---|---|---|---|
| **CI** (รัน test) | `.github/workflows/ci.yml` | `ubuntu-latest` = เซิร์ฟเวอร์ GitHub | เปิด PR เข้า develop/release |
| **Deploy** (build+run docker) | `.github/workflows/deploy.yml` | `self-hosted` = เครื่องเรา | push/merge เข้า release |

> 💡 runner **ไม่ได้จับ PR** — มันแค่นั่งรอ "job deploy" ที่เกิดตอน merge เข้า release เท่านั้น
> ส่วน CI ตอน PR รันบนเซิร์ฟเวอร์ GitHub ไม่เกี่ยวกับ runner ของเรา

---

## 0. เตรียมของ (ทำครั้งเดียว)

```bash
npm install        # ติดตั้ง express + jest + supertest
npm test           # ลองรัน test ดูว่าเขียว 3 อัน
npm start          # เปิดเว็บที่ http://localhost:3000
```

ลอง Docker (ต้องเปิด Docker Desktop ก่อน):

```bash
docker build -t git-practice-web .
docker run -p 3000:3000 git-practice-web
```

---

## 1. ตั้ง repo + branch โครงสร้าง

สร้าง **private repo** บน GitHub แล้ว:

```bash
git init
git add .
git commit -m "init: project scaffold"
git branch -M main

# ใช้ HTTPS (ง่ายสุด ไม่ต้องตั้ง SSH key)
git remote add origin https://github.com/<ชื่อคุณ>/git-practice-web.git
git push -u origin main

# สร้าง branch สายงาน
git checkout -b develop && git push -u origin develop
git checkout -b release && git push -u origin release
git checkout develop        # กลับมายืนที่ develop เป็นฐานทำงาน
```

3 branch: `main` (ตั้งต้น) · `develop` (รวมงาน) · `release` (ตัวที่ deploy)

> ⚠️ ถ้า push แล้วเจอ `git@github.com: Permission denied (publickey)` = คุณใช้ URL แบบ SSH แต่ยังไม่ได้ตั้ง key
> แก้ด้วยการเปลี่ยนเป็น HTTPS: `git remote set-url origin https://github.com/<ชื่อคุณ>/git-practice-web.git`

---

## 2. โฟลว์จริง: แก้ฟีเจอร์ → PR → deploy

### 2.1 แตก branch จาก develop

```bash
git checkout develop
git pull origin develop         # ดึงล่าสุดก่อนเสมอ
git checkout -b test            # branch งานของเรา
```

### 2.2 แก้โค้ด แล้ว commit + push

```bash
git add .
git commit -m "feat: แก้ข้อความหน้าแรก"
git push -u origin test
```

### 2.3 เปิด PR: `develop ← test`

GitHub → Pull requests → New → base=`develop`, compare=`test` → Create
➡️ CI รัน `npm test` อัตโนมัติ (บนเซิร์ฟเวอร์ GitHub) → เขียว → **Merge**

### 2.4 เปิด PR: `release ← develop`

base=`release`, compare=`develop` → **Merge**
➡️ merge = push เข้า release → **Deploy workflow เด้งรับงานบนเครื่องเรา**

---

## 3. ตั้ง Self-hosted Runner (ให้เครื่องเรา auto deploy)

### 3.1 ติดตั้ง runner

GitHub → repo → **Settings → Actions → Runners → New self-hosted runner** → เลือก **Windows**
ทำตามคำสั่งที่หน้าเว็บให้ (มี token ติดมา) ประมาณ:

```powershell
./config.cmd --url https://github.com/<ชื่อคุณ>/git-practice-web --token XXXX
./run.cmd      # เปิด runner ให้คอยฟังงาน
```

เมื่อขึ้น `√ Connected to GitHub` และ `Listening for Jobs` = พร้อมรับงาน

> ⚠️ **ห้ามปิด terminal ที่รัน `run.cmd`** — runner ทำงานได้เฉพาะตอนที่มันรันค้างอยู่
> และ **ต้องเปิด Docker Desktop** ไว้ด้วย (deploy มีขั้น docker build/run)

### 3.2 กันไฟล์ runner ไม่ให้ขึ้น git (สำคัญมาก!)

ถ้าติดตั้ง runner ในโฟลเดอร์ repo จะมีไฟล์ `.credentials` (ความลับ!) โผล่มา
ต้องใส่ใน `.gitignore` ไม่งั้นเผลอ push ความลับขึ้น GitHub:

```gitignore
# GitHub Actions self-hosted runner
.credentials
.credentials_rsaparams
.runner
_diag/
_work/
bin/
externals/
run.cmd
config.cmd
actions-runner-*.zip
```

> 💡 งานจริงเขา**ไม่วาง runner ในโฟลเดอร์ repo** แต่แยกไว้คนละที่ เช่น `C:\actions-runner\`
> runner ตัวเดียวรับงานได้หลาย repo

---

## 4. จุดที่ Windows มักพัง (เจอมาแล้ว แก้ไว้แล้วใน deploy.yml)

| อาการใน log | สาเหตุ | วิธีแก้ |
|---|---|---|
| `execvpe(/bin/bash) failed` | `shell: bash` ชี้ไป WSL ที่ไม่ได้ติดตั้ง | เอา `shell: bash` ออก |
| `running scripts is disabled` (PSSecurityException) | PowerShell Execution Policy = Restricted | ใช้ `shell: cmd` แทน |
| `cannot connect to the Docker daemon` | Docker Desktop ไม่ได้เปิด | เปิด Docker Desktop รอ "Engine running" |

เพราะงั้น `deploy.yml` เลยตั้ง `defaults: run: shell: cmd` และใช้ `continue-on-error: true`
แทน `|| true` (ซึ่งเป็น syntax ของ bash ที่ cmd ไม่รู้จัก)

---

## 5. ตรวจผลหลัง deploy

```bash
docker ps          # ต้องเห็น container git-practice-web รันอยู่ port 3000
```

แล้วเปิด `http://localhost:3000` → เห็นเว็บที่ deploy อัตโนมัติจากการ merge ✨

**ดูสถานะงานบน GitHub:** repo → แท็บ **Actions** → คลิก workflow run
- job `test` รันบน `ubuntu-latest`
- job `deploy` รันบน `self-hosted` (เครื่องเรา)

---

## 6. วิธี debug เมื่อ CI/CD แดง

1. เข้าแท็บ **Actions** → คลิก run ที่แดง → คลิก job ที่ fail
2. หาบรรทัด `##[error]` แล้ว**ไล่ขึ้นไปดูบรรทัดก่อนหน้า** ว่าขั้นไหนพัง เพราะอะไร
3. แก้ → commit → push → ดันผ่านโฟลว์ใหม่ → CI/CD รันซ้ำเอง

---

## 7. โจทย์ท้าทาย (ทำเพิ่มเพื่อให้เก่งขึ้น)

1. **ทำ CI แดงให้ดู** — แก้ `add(a,b)` ให้คืน `a - b` แล้วเปิด PR → ดู test fail ใน PR → แก้กลับ → เขียว
2. **ฝึก merge conflict** — แก้บรรทัดเดียวกันใน 2 branch แล้วลอง merge
3. **ฝึก hotfix** — แตก `hotfix/xxx` จาก `release` แก้บั๊กด่วน แล้ว PR กลับเข้า release
4. **stash** — แก้ค้างใน test แล้ว `git stash` สลับไป branch อื่น กลับมา `git stash pop`

---

## ไฟล์ในโปรเจกต์

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/app.js` | เว็บ Express + endpoint + ฟังก์ชัน add |
| `src/server.js` | ตัวเปิด server |
| `src/app.test.js` | test 3 ตัว (ให้ CI รัน) |
| `Dockerfile` | สร้าง image |
| `.github/workflows/ci.yml` | รัน test เมื่อมี PR เข้า develop/release |
| `.github/workflows/deploy.yml` | build + run docker บน self-hosted runner เมื่อ push เข้า release |
| `.gitignore` | กัน node_modules + ไฟล์ runner ไม่ให้ขึ้น git |
