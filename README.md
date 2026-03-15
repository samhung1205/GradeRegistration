# 微積分助教成績系統

> 專為兩位助教設計的輕量成績登記 SPA（Single-Page Application），完全在瀏覽器端運行，無需登入。

---

## 🗂 專案結構

```
index.html            ← 唯一入口，所有功能內嵌（SPA）；頂部可設定 Supabase URL/Key
supabase-schema.sql   ← 發布用：在 Supabase SQL Editor 執行以建立資料表
vercel.json           ← 發布用：Vercel 部署設定（可留空）
README.md             ← 說明與發布步驟
```

> ⚡ 所有 CSS / JavaScript 已內嵌在 `index.html`。發布時需設定 Supabase 並用 Vercel 取得網址（見下方）。

---

## ✅ 已完成功能

### 🏠 首頁 (Home)
- 顯示系統名稱、今日日期
- 四格統計卡：學生人數、作業/測驗數、已登記成績、平均分數
- 快速導覽卡（點擊跳至各功能頁）
- 最近 5 筆作業/測驗列表，附「直接登記」按鈕

### 👥 學生名單管理 (Students)
- 新增 / 編輯 / 刪除學生（學號、姓名、班級）
- 關鍵字搜尋（學號、姓名、班級）
- 班級篩選下拉
- 分頁顯示
- **📂 匯入 .xlsx / .xls / .csv 學生名單**
  - 拖曳或點擊上傳
  - 自動偵測欄位（學號/姓名/班級）
  - 預覽前 5 筆、手動調整欄位對應
  - 重複學號自動略過
- 匯出 CSV

### 📋 作業/測驗管理 (Assignments)
- 新增 / 編輯 / 刪除（測驗ID、名稱、類型、日期、滿分、描述）
- 類型：作業 / 小考 / 期中期末
- 關鍵字搜尋 + 類型篩選

### ✏️ 成績登記 (Grades)
- 選擇作業/測驗 → 顯示所有學生
- 班級篩選
- 進度條（已登記 N / 總計）
- 按 **Enter** 自動存檔並跳至下一位
- 「全部儲存」批次存檔
- 色彩標示：未儲存（黃）/ 已儲存（綠）/ 未登記（灰）
- 記錄登記人（右上角助教身份）
- 匯出 CSV

### 🔍 成績查詢 (Query)
- **Tab 1 – 依學生查詢**：輸入學號/姓名，顯示所有成績 + 得分率長條圖
- **Tab 2 – 依作業查詢**：選擇作業，顯示全班成績 + 統計（平均/最高/最低）+ 分佈直方圖
- **Tab 3 – 成績矩陣**：學生 × 作業完整矩陣，色彩標示（≥90% 綠 / 60-89% 黃 / <60% 紅）
- 三種 Tab 均可匯出 CSV

### ⚙️ 系統設定 (Settings)
- 修改系統顯示名稱（左上角 & 瀏覽器標題）
- **修改助教名稱**：可新增/刪除/重命名（最多 5 位），儲存後立即生效
- 設定存於 `localStorage`

---

## 🔑 助教識別

右上角下拉選單切換「助教 A / 助教 B」（或自訂名稱）。
選擇後自動存入 `localStorage`，每次成績登記自動帶入登記人欄位。

---

## 📡 API 端點

| 功能 | 端點 |
|------|------|
| 學生 CRUD | `tables/students` |
| 作業/測驗 CRUD | `tables/assignments` |
| 成績 CRUD | `tables/grades` |

---

## 🗄 資料結構

### students
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | text | 系統自動生成 UUID |
| student_id | text | 學號 |
| name | text | 姓名 |
| class_name | text | 班級 |

### assignments
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | text | UUID |
| test_id | text | 測驗代號（如 HW01） |
| name | text | 名稱 |
| type | text | homework/quiz/exam |
| date | datetime | 日期 |
| max_score | number | 滿分 |
| description | text | 描述 |

### grades
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | text | UUID |
| student_id | text | 關聯 students.id |
| assignment_id | text | 關聯 assignments.id |
| score | number | 分數 |
| note | text | 備註 |
| ta | text | 登記助教名稱 |

---

## 🚀 如何使用（本機）

1. 若有後端（見下方「發布取得網址」），用瀏覽器打開發布後的網址即可。
2. 先至「學生名單」上傳 .xlsx 匯入名單。
3. 至「作業/測驗」建立評分項目。
4. 至「成績登記」選擇項目並開始登記。
5. 至「成績查詢」查看統計並匯出 CSV。

---

## 🌐 發布取得網址：讓另一位助教也能用

目標：**取得一個公開網址 → 把網址傳給助教 → 對方用瀏覽器打開就能用**（不需安裝 Cursor）。

本系統已內建 **Supabase** 後端支援，用 **Vercel** 免費託管即可得到網址。**只需做一次設定**。

### 一、建立 Supabase 後端（約 5 分鐘，免費）

1. 前往 [supabase.com](https://supabase.com) → 註冊／登入 → **New project**。
2. 建立專案（名稱、密碼自訂，Region 選近的即可）→ 等專案就緒。
3. 左側 **SQL Editor** → **New query** → 開啟專案裡的 `supabase-schema.sql`，**整段複製貼上** → **Run**。
4. 左側 **Settings** → **API**，複製：
   - **Project URL**（例如 `https://xxxxx.supabase.co`）
   - **anon public** key（一長串 JWT）

### 二、把網址與金鑰寫進網站

1. 用編輯器打開專案中的 **`index.html`**。
2. 搜尋 `window.SUPABASE_URL`，會看到兩行：
   - `window.SUPABASE_URL = '';`
   - `window.SUPABASE_ANON_KEY = '';`
3. 把剛才複製的 **Project URL** 貼進 `SUPABASE_URL` 的引號裡。
4. 把 **anon public** key 貼進 `SUPABASE_ANON_KEY` 的引號裡。  
   （anon key 可公開、僅供前端使用，權限由 Supabase 的 RLS 控制。）

### 三、部署到 Vercel，取得網址

1. 安裝 Node.js（若尚未安裝）：[nodejs.org](https://nodejs.org)。
2. 在終端機進入本專案資料夾，執行：
   ```bash
   npx vercel
   ```
3. 依提示登入 Vercel（可用 GitHub 登入），專案名稱直接 Enter 即可。
4. 完成後終端機會給一個網址，例如：`https://calculus-score-xxx.vercel.app`。
5. **複製這個網址**，用 LINE / Email 傳給另一位助教即可。對方用瀏覽器打開就能用，兩人共用同一份資料。

### 四、之後你改網站內容

- 改完 `index.html` 後，在專案資料夾再執行一次 **`npx vercel`**，會**更新同一個網址**的內容。
- 另一位助教**不用換網址**，重新整理頁面（F5）就會看到最新版。

### 注意

- 兩位助教都要從**同一個 Vercel 網址**進入，資料才會同步。
- 若用本機直接開 `index.html`（file://），且未設定 Supabase，則無法存資料（需依上述步驟設定並用 Vercel 網址）。

---

## 🔧 常見修改

| 需求 | 方法 |
|------|------|
| 修改助教名稱 | 進入「系統設定」頁面直接修改，不需改程式碼 |
| 修改系統名稱 | 同上 |
| 修改主色調 | 編輯 `index.html` 頂部 `:root` 中的 `--primary` 等 CSS 變數 |

---

## ⏳ 待實作（下一階段）

- [ ] Google Sheets 同步（需後端或 Apps Script）
- [ ] 兩位助教衝突避免（樂觀鎖定或 last-write-wins 提示）
- [ ] AI 學號辨識（圖片上傳辨識學號）
- [ ] 相片 / 掃描名單自動辨識
