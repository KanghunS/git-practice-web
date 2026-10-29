# git-practice-web 🚀

โปรเจกต์ฝึก **git flow + CI (GitHub Actions) + Docker** แบบครบวงจร
เว็บ Express โง่ ๆ 1 หน้า + 3 test ไว้ให้ CI รัน

---

## 0. เตรียมของ (ทำครั้งเดียว)

```bash
npm install        # ติดตั้ง express + jest + supertest
npm test           # ลองรัน test ดูว่าเขียว 3 อัน
npm start          # เปิดเว็บที่ http://localhost:3000
```

ลอง Docker:

```bash
docker build -t git-practice-web .
docker run -p 3000:3000 git-practice-web
# เปิด http://localhost:3000
```

---

## 1. ตั้ง repo + branch โครงสร้าง

สร้าง **private repo** บน GitHub ชื่ออะไรก็ได้ แล้ว:

```bash
git init
git add .
git commit -m "init: project scaffold"

git branch -M main
git remote add origin git@github.com:<ชื่อคุณ>/git-practice-web.git
git push -u origin main

# สร้าง branch สายงานตามที่คุยกัน
git checkout -b develop
git push -u origin develop

git checkout -b release
git push -u origin release

git checkout develop        # กลับมายืนที่ develop เป็นฐานทำงาน
```

ตอนนี้มี 3 branch: `main` (โค้ดตั้งต้น) · `develop` (รวมงาน) · `release` (ตัวที่จะ deploy)

> 💡 ไปที่ GitHub → Settings → Branches → ตั้ง **branch protection** ให้ `develop` กับ `release`
> บังคับว่าต้องผ่าน PR + CI เขียวก่อนถึง merge ได้ = จำลองกฎทีมจริง

---

## 2. โฟลว์จริง: แก้ฟีเจอร์ → PR → deploy

### 2.1 แตก branch จาก develop

```bash
git checkout develop
git pull origin develop         # ดึงล่าสุดก่อนเสมอ
git checkout -b test            # branch งานของเรา (จะชื่อ feature/xxx ก็ได้)
```

### 2.2 แก้โค้ด แล้ว commit + push

ลองแก้อะไรก็ได้ เช่นเปลี่ยนข้อความในหน้าเว็บ (`src/app.js`) หรือเพิ่ม endpoint ใหม่

```bash
git add .
git commit -m "feat: แก้ข้อความหน้าแรก"
git push -u origin test
```

### 2.3 เปิด PR: `develop ← test`

เข้า GitHub → กด **Compare & pull request** → ตั้ง base = `develop`, compare = `test`

➡️ พอเปิด PR **GitHub Actions (CI) จะรัน `npm test` อัตโนมัติ** เห็นเครื่องหมายเขียว/แดงใน PR เลย
ถ้าเขียว → กด **Merge** / ถ้าแดง → แก้โค้ด commit push ใหม่ CI รันซ้ำเอง

### 2.4 เปิด PR: `release ← develop` (ตอนถึงรอบ deploy)

พอ `develop` พร้อมปล่อย → เปิด PR อีกอัน base = `release`, compare = `develop` → merge

➡️ พอ merge เข้า `release` **workflow `Deploy` จะทำงานเอง** (build Docker image = จำลอง deploy)

---

## 3. สรุปเส้นทาง

```
test ──PR──> develop ──PR──> release ──> (Deploy workflow รันเอง)
        ↑CI รัน test        ↑CI รัน test   ↑build docker image
```

---

## 4. โจทย์ท้าทาย (ลองทำเพิ่มเพื่อให้เก่งขึ้น)

1. **ทำ CI แดงให้ดู** — แก้ `add(a,b)` ให้คืน `a - b` แล้วเปิด PR → ดู test fail ใน PR → แก้กลับ → เขียว
2. **ฝึก merge conflict** — แก้บรรทัดเดียวกันใน 2 branch แล้วลอง merge ดูวิธีแก้ conflict
3. **ฝึก hotfix** — จำลองบั๊กด่วนบน release: แตก `hotfix/xxx` จาก `release` แก้ แล้ว PR กลับเข้า release
4. **stash** — แก้ค้างใน test แล้วลอง `git stash` สลับไป branch อื่น กลับมา `git stash pop`

---

## ไฟล์ในโปรเจกต์

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/app.js` | เว็บ Express + endpoint + ฟังก์ชัน add |
| `src/server.js` | ตัวเปิด server |
| `src/app.test.js` | test 3 ตัว (ให้ CI รัน) |
| `Dockerfile` | สร้าง image |
| `.github/workflows/ci.yml` | รัน test เมื่อมี PR เข้า develop/release |
| `.github/workflows/deploy.yml` | build image เมื่อ push เข้า release |
