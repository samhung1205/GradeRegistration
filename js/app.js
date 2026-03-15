/**
 * =============================================
 * 微積分助教成績登記系統 - 共用工具函式
 * js/app.js
 * =============================================
 * 說明：
 * 這個檔案包含所有頁面共用的工具函式，包含：
 *   1. API 呼叫封裝（對內建 RESTful Table API）
 *   2. Toast 通知
 *   3. 確認對話框
 *   4. 助教識別（儲存在 localStorage）
 *   5. 導覽列高亮
 *   6. CSV 匯出工具
 *   7. 格式化工具
 * =============================================
 */

// =============================================
// § 1. API 基礎設定
// =============================================

/** 所有 API 呼叫都用此函式，自動處理 JSON 解析與錯誤 */
async function apiGet(table, params = {}) {
  // 將參數物件轉為 URL query string
  const qs = new URLSearchParams(params).toString();
  const url = `tables/${table}${qs ? '?' + qs : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} 失敗：${res.status}`);
  return res.json();
}

async function apiGetOne(table, id) {
  const res = await fetch(`tables/${table}/${id}`);
  if (!res.ok) throw new Error(`GET ${table}/${id} 失敗：${res.status}`);
  return res.json();
}

async function apiPost(table, data) {
  const res = await fetch(`tables/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`POST ${table} 失敗：${res.status} ${errText}`);
  }
  return res.json();
}

async function apiPut(table, id, data) {
  const res = await fetch(`tables/${table}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT ${table}/${id} 失敗：${res.status}`);
  return res.json();
}

async function apiPatch(table, id, data) {
  const res = await fetch(`tables/${table}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PATCH ${table}/${id} 失敗：${res.status}`);
  return res.json();
}

async function apiDelete(table, id) {
  const res = await fetch(`tables/${table}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${table}/${id} 失敗：${res.status}`);
  // 204 No Content，不解析 JSON
}

// =============================================
// § 2. Toast 通知
// =============================================
// 用法：showToast('訊息內容', 'success' | 'error' | 'info' | 'warning')

(function initToastContainer() {
  if (!document.getElementById('toast-container')) {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
  }
})();

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);
  // 自動消失
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// =============================================
// § 3. 確認對話框
// =============================================
// 用法：const ok = await confirmDialog('確定要刪除嗎？')

function confirmDialog(message, title = '確認操作') {
  return new Promise((resolve) => {
    // 找到頁面上的 #confirm-modal（每頁都需要放這個 modal HTML）
    const overlay = document.getElementById('confirm-modal');
    if (!overlay) {
      // 如果沒有 modal，退回瀏覽器原生 confirm
      resolve(window.confirm(message));
      return;
    }
    overlay.querySelector('.confirm-message').textContent = message;
    overlay.querySelector('.modal-header span').textContent = title;
    overlay.classList.add('open');

    const btnOk     = overlay.querySelector('.confirm-ok');
    const btnCancel = overlay.querySelector('.confirm-cancel');

    function cleanup(result) {
      overlay.classList.remove('open');
      btnOk.removeEventListener('click', onOk);
      btnCancel.removeEventListener('click', onCancel);
      resolve(result);
    }
    const onOk     = () => cleanup(true);
    const onCancel = () => cleanup(false);

    btnOk.addEventListener('click', onOk);
    btnCancel.addEventListener('click', onCancel);
  });
}

// =============================================
// § 4. 助教識別（localStorage）
// =============================================
// 兩位助教選擇自己的名稱後，存在 localStorage。
// 這是簡單的「識別」機制，不是完整帳號系統。

const TA_KEY = 'calcTA_currentUser';

/** 取得目前助教名稱（若未設定，回傳 null） */
function getCurrentTA() {
  return localStorage.getItem(TA_KEY) || null;
}

/** 設定目前助教名稱 */
function setCurrentTA(name) {
  localStorage.setItem(TA_KEY, name);
}

/**
 * 初始化頂部的助教選單
 * 頁面載入後呼叫此函式，會自動同步 select 的選項與 localStorage
 */
function initTASelector() {
  const sel = document.getElementById('ta-select');
  if (!sel) return;
  // 從 localStorage 還原上次選的助教
  const saved = getCurrentTA();
  if (saved) sel.value = saved;

  // 監聽改變事件
  sel.addEventListener('change', () => {
    setCurrentTA(sel.value);
    showToast(`已切換為助教：${sel.value}`, 'info');
    updateTABadge();
  });
  updateTABadge();
}

/** 更新頂部顯示的助教徽章 */
function updateTABadge() {
  const badge = document.getElementById('ta-badge');
  if (!badge) return;
  const ta = getCurrentTA();
  badge.textContent = ta ? `${ta}` : '未選擇';
}

// =============================================
// § 5. 導覽列高亮
// =============================================
// 根據目前頁面 URL，在側欄連結加上 .active class

function initNavHighlight() {
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar .nav-item a').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop() || '';
    if (href === currentPath) link.classList.add('active');
  });
}

// =============================================
// § 6. CSV 匯出工具
// =============================================

/**
 * 將二維陣列轉為 CSV 字串並觸發下載
 * @param {string[][]} rows  - 第一列為表頭，之後是資料
 * @param {string} filename  - 下載的檔案名稱（不含 .csv）
 */
function exportCSV(rows, filename = 'export') {
  // 處理欄位中含有逗號、換行、引號的情況
  const escape = (val) => {
    const s = String(val === null || val === undefined ? '' : val);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = rows.map(row => row.map(escape).join(',')).join('\r\n');
  // 加上 BOM，讓 Excel 正確顯示中文
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

// =============================================
// § 7. 格式化工具
// =============================================

/** 將 ISO 日期字串格式化為 YYYY-MM-DD */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
           .replace(/\//g, '-');
}

/** 將毫秒時間戳格式化 */
function formatTimestamp(ms) {
  if (!ms) return '—';
  const d = new Date(Number(ms));
  return d.toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' });
}

/** 空值顯示為 '—' */
function dash(val) {
  return (val === null || val === undefined || val === '') ? '—' : val;
}

/**
 * 高亮關鍵字（回傳含 <mark> 標籤的 HTML 字串）
 * @param {string} text - 原始文字
 * @param {string} kw   - 關鍵字
 */
function highlight(text, kw) {
  if (!kw || !text) return text || '';
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text).replace(new RegExp(escaped, 'gi'), m => `<mark>${m}</mark>`);
}

// =============================================
// § 8. 分頁工具
// =============================================

/**
 * 渲染分頁按鈕到指定容器
 * @param {HTMLElement} container  - 放置分頁的 DOM 元素
 * @param {number} total           - 總筆數
 * @param {number} page            - 目前頁碼（1-based）
 * @param {number} limit           - 每頁筆數
 * @param {Function} onPageChange  - 換頁回呼函式，參數為新頁碼
 */
function renderPagination(container, total, page, limit, onPageChange) {
  container.innerHTML = '';
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return;

  // 上一頁
  const prev = document.createElement('button');
  prev.textContent = '‹';
  prev.disabled = page <= 1;
  prev.onclick = () => onPageChange(page - 1);
  container.appendChild(prev);

  // 頁碼（最多顯示 7 頁）
  let start = Math.max(1, page - 3);
  let end   = Math.min(totalPages, start + 6);
  if (end - start < 6) start = Math.max(1, end - 6);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === page) btn.classList.add('active');
    btn.onclick = () => onPageChange(i);
    container.appendChild(btn);
  }

  // 下一頁
  const next = document.createElement('button');
  next.textContent = '›';
  next.disabled = page >= totalPages;
  next.onclick = () => onPageChange(page + 1);
  container.appendChild(next);

  // 頁數說明
  const info = document.createElement('span');
  info.style.cssText = 'font-size:0.8rem;color:#888;margin-left:6px;';
  info.textContent = `共 ${total} 筆`;
  container.appendChild(info);
}

// =============================================
// § 9. 頁面初始化（每頁載入後呼叫）
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initTASelector();
  initNavHighlight();
});
