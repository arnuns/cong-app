# Development with `cong-app-legacy`

คู่มือสำหรับ Angular 8 / Electron รุ่นเก่าของ CONG โดยใช้ CLI ที่ตรึง Node **12.22.12 x64**
แทนการใช้ Node รุ่นปัจจุบันของเครื่องโดยตรง

## สิ่งที่ต้องมี

- macOS และ Bash; Apple Silicon ต้องมี Rosetta 2 สำหรับรัน x64
- Git และ NVM
- Google Chrome สำหรับ `ChromeHeadless`
- checkout ของ `cong-app` และ CLI `cong-app-legacy`

Node รุ่นนี้ใช้เพื่อความเข้ากันได้กับโปรเจกต์เก่า ไม่ใช่คำแนะนำสำหรับโปรเจกต์ใหม่
อย่าเปลี่ยน Node หรืออัปเกรด dependencies ระหว่างแก้งานโดยไม่มีการทดสอบแยก

## ติดตั้ง CLI บนเครื่องใหม่

CLI **ยังไม่ได้เก็บอยู่ใน repo นี้** และไม่ใช่ package ที่ติดตั้งได้ด้วย `npm install -g cong-app-legacy`.
ให้ขอไฟล์สคริปต์ที่ทีมใช้อยู่จากผู้ดูแล ตรวจเนื้อหาก่อนติดตั้ง แล้วทำดังนี้:

1. สร้างโฟลเดอร์ `$HOME/.local/bin` หากยังไม่มี และคัดลอกสคริปต์ที่ตรวจแล้วไปเป็น `$HOME/.local/bin/cong-app-legacy`.
2. แก้ค่าคงที่สามตัวในสคริปต์ให้ตรงกับเครื่อง: `REPO_PATH` (checkout), `NVM_SCRIPT` (ไฟล์ `nvm.sh`), `SELF_PATH` (CLI ที่ติดตั้ง).
3. ให้ไฟล์รันได้ด้วย `chmod +x "$HOME/.local/bin/cong-app-legacy"` และเพิ่ม `$HOME/.local/bin` ใน `PATH` ของ shell.
4. ตรวจด้วย `command -v cong-app-legacy` และ `cong-app-legacy help` ก่อนเรียก `setup`.

CLI รุ่นที่ตรวจคู่มือนี้ใช้ checkout `/Users/arnunsae/codes/ubk/cong-app`,
NVM `/Users/arnunsae/.nvm/nvm.sh` และตัว CLI `/Users/arnunsae/.local/bin/cong-app-legacy`.
ค่าเหล่านี้เป็นของเครื่องเดิม ไม่ใช่ค่าที่ใช้ได้กับทุกเครื่อง
CLI จะเปลี่ยนไปยัง `REPO_PATH` เสมอ แม้เรียกจากอีก directory หรือ worktree;
ตรวจให้แน่ใจว่ากำลังทดสอบ checkout ที่ตั้งใจแก้

## เริ่มต้น

```sh
cong-app-legacy help
cong-app-legacy setup
cong-app-legacy start
```

`setup` ติดตั้ง/เลือก Node 12.22.12 ผ่าน NVM แล้วรัน `npm ci` ตาม lockfile
คำสั่งนี้ต้องใช้อินเทอร์เน็ต และ `npm ci` จะติดตั้ง dependencies ใหม่ใน `node_modules`
รวมถึง install scripts ของ packages; ตรวจความน่าเชื่อถือของ repo และ lockfile ก่อนรัน
ไม่ต้องเรียก `setup` ทุกครั้ง ใช้เมื่อเริ่มต้นหรือ dependencies เปลี่ยน

ก่อน test/build/start CLI จะแสดง Node version, npm version และ architecture;
ต้องเห็น Node `v12.22.12` และ `x64`

## คำสั่งประจำวัน

| คำสั่ง | ผลลัพธ์ / ข้อควรระวัง |
| --- | --- |
| `cong-app-legacy start` | build แอปแล้วเปิด Electron; ไม่ใช่เว็บ dev server |
| `cong-app-legacy test` | รัน Karma ครั้งเดียวด้วย ChromeHeadless |
| `cong-app-legacy lint` | รัน TSLint และ Codelyzer |
| `cong-app-legacy build-web` | production web build ลง `dist/`; ไม่สร้าง installer และไม่ publish |
| `cong-app-legacy build-electron` | production build พร้อม relative base URL สำหรับ Electron ลง `dist/`; ไม่ publish |
| `cong-app-legacy package-mac` | build และ package แอป Intel macOS แบบ unsigned; ไม่ใช่ universal/arm64 build |
| `cong-app-legacy shell` | เปิด Bash ที่เลือก Node x64 รุ่นที่กำหนดแล้ว; ใช้ `exit` เพื่อออก |
| `cong-app-legacy deploy` | **build และ publish Windows installer เป็น GitHub release จริง** |

อย่าใช้ `deploy` เพื่อตรวจว่า build ผ่าน ต้องได้รับอนุมัติการ release โดยชัดแจ้ง
และมี `GH_TOKEN` หรือ `GITHUB_TOKEN` ที่ผู้ดูแลจัดเตรียมอย่างปลอดภัย
ห้ามใส่ token ใน repo, คู่มือ, command history หรือภาพหน้าจอ

`build-web` และ `build-electron` ใช้ `dist/` ร่วมกัน; ไม่รันพร้อมกัน
`npm run build` ของโปรเจกต์สร้าง Windows installer ไม่ใช่คำสั่งตรวจ web build

### เว็บ dev server หรือคำสั่งเฉพาะ

CLI รุ่นปัจจุบันไม่ได้ส่ง arguments เพิ่มต่อไปยังคำสั่งย่อย เช่น
`cong-app-legacy test --include=...` จะไม่ได้กรอง tests ตามที่คาด
ให้เข้า shell แล้วเรียกคำสั่งของโปรเจกต์:

```sh
cong-app-legacy shell
npm start
```

เว็บ dev server ใช้ค่าจาก `angular.json` (ปัจจุบันพอร์ต 4211).
สำหรับกรอง test ใช้ภายใน shell เช่น:

```sh
npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/modules/payroll/pages/salary/salary-compensation.component.spec.ts
```

รัน full suite ด้วย `cong-app-legacy test` ด้วยเสมอก่อนส่ง PR;
ผลของ test ที่กรองไม่ใช่ผลของทั้งโปรเจกต์

## ก่อนเปิด PR

1. `cong-app-legacy lint`
2. `cong-app-legacy test`
3. `cong-app-legacy build-web` เมื่อแก้ UI หรือ TypeScript
4. ตรวจหน้าจอ/การพิมพ์ที่เปลี่ยน และรัน E2E เมื่อเปลี่ยน workflow
5. ตรวจ diff ไม่ให้มี `dist/`, `release/`, `node_modules/`, secrets หรือไฟล์ environment ที่ไม่เกี่ยวข้อง

บันทึกคำสั่งและผลตามจริง หาก baseline มี failures ให้ระบุชื่อและสาเหตุแยกจากงานใหม่
ห้ามสรุปว่า tests ผ่านทั้งหมดจากการรันเฉพาะไฟล์

## แก้ปัญหาที่พบบ่อย

- **command not found:** ตรวจว่าไฟล์ CLI มีอยู่, executable และ directory อยู่ใน `PATH`.
- **repository / NVM not found:** ตรวจ `REPO_PATH` และ `NVM_SCRIPT` ใน CLI; ไม่แก้ด้วยการย้าย repo โดยไม่จำเป็น.
- **Node is not installed / dependencies are not installed:** เรียก `cong-app-legacy setup`.
- **expected x64 / Bad CPU type:** ตรวจ Rosetta 2 และ Node x64; อย่าใช้ Node arm64 แทนโดยเงียบ ๆ.
- **ChromeHeadless launch failed:** ตรวจการติดตั้ง Google Chrome และสิทธิ์เปิด browser; ไม่ถือว่าเป็น test ผ่าน.
- **Unknown option:** ตรวจ `./node_modules/.bin/ng test --help` ภายใน legacy shell; CLI รุ่นเก่าอาจไม่มี option ของรุ่นใหม่.
- **Template/provider errors ใน tests:** ตรวจ test module imports/providers; แยก baseline failures จาก regression ไม่แก้ด้วยการข้าม tests.
- **Sandbox ห้ามเขียนหรือเปิดพอร์ต:** ขอสิทธิ์เฉพาะคำสั่ง test/build ที่จำเป็น ไม่ปิดข้อจำกัดทั้งเครื่อง.

## ขอบเขต

คู่มือนี้อธิบาย CLI ภายนอกที่ตรวจจาก `cong-app-legacy help` และสคริปต์จริง
ไม่ได้ติดตั้ง CLI, เปลี่ยนค่าเครื่อง หรือสั่ง deploy ให้อัตโนมัติ
ดูข้อกำหนดการแก้โค้ดเพิ่มเติมใน [AGENTS.md](../AGENTS.md).
