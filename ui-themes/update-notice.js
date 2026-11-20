/* 平台更新：首頁提示視窗＋「更新紀錄」頁面
 * ・UPDATES 由新到舊排列。打開平台時，彈出視窗只顯示最新一筆；關掉後同一筆不會再出現（記在 localStorage）。
 * ・右上角選單的「更新紀錄」、或視窗裡的「看所有更新紀錄」，會在主畫面打開更新紀錄頁，列出所有更新。
 * ・之後有新更新：在 UPDATES 最上面加一筆即可（version 用日期，所有人會再看到一次提示）。
 * ・寫法原則：只寫大家用得到的變化，一句話帶過，不寫技術細節。
 */
(function () {
  var UPDATES = [
    {
      version: "2026-11-20",
      date: "2026/11/20",
      items: [
        { ico: "🔎", html: "<b>搜尋更聰明了</b>：不用打出完整的流程名稱，直接輸入想做的事就找得到。<span class=\"eg\">例如：「高鐵費怎麼報」「買筆電要走哪個流程」「請假要找誰代理」</span>" },
        { ico: "📎", html: "<b>修正無法開啟的檔案</b>：差旅報支 Excel 範本、稅碼對照表、請假流程的截圖，現在都可以正常開啟。" },
        { ico: "🖱️", html: "<b>捲軸換新</b>：捲軸改成嵌在淺溝裡的樣式，滑鼠移上去會變色，顏色跟著配色變換。" }
      ]
    },
    {
      version: "2026-10-20",
      date: "2026/10/20",
      items: [
        { ico: "🎨", html: "<b>介面改版</b>：右上角選單可以切換三種配色（米白、港灣藍、夜讀）。" },
        { ico: "📝", html: "<b>請購與請款改用「答案卷」</b>：直接列出每一格要填的值，不用填的欄位畫成斜線，一眼看出要填哪些。" },
        { ico: "📌", html: "<b>員工請款報支（Z）</b>內容更新。" }
      ]
    }
  ];
  var LATEST = UPDATES[0];
  var KEY = "sapguide-update-seen";

  function seen() { try { return localStorage.getItem(KEY) === LATEST.version; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(KEY, LATEST.version); } catch (e) {} }
  function listHtml(items) {
    return '<ul class="update-notice-list">' + items.map(function (it) {
      return '<li><span class="update-notice-ico" aria-hidden="true">' + it.ico + '</span><span>' + it.html + '</span></li>';
    }).join("") + '</ul>';
  }

  // ---------- 彈出視窗（只放最新一筆） ----------
  var overlay = null, lastFocus = null;
  function build() {
    overlay = document.createElement("div");
    overlay.className = "update-notice-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "updateNoticeTitle");
    overlay.innerHTML = '<div class="update-notice">' +
      '<button type="button" class="update-notice-close" aria-label="關閉">✕</button>' +
      '<div class="update-notice-head"><div class="update-notice-kicker">更新內容 · ' + LATEST.date + '</div>' +
      '<h2 class="update-notice-title" id="updateNoticeTitle">平台更新了！</h2></div>' +
      '<div class="update-notice-body">' + listHtml(LATEST.items) + '</div>' +
      '<div class="update-notice-foot">' +
      (UPDATES.length > 1 ? '<button type="button" class="update-notice-more">看所有更新紀錄 →</button>' : '<span></span>') +
      '<button type="button" class="update-notice-ok">我知道了</button></div></div>';
    overlay.addEventListener("click", function (ev) {
      if (ev.target.closest(".update-notice-more")) { close(); openLog(); return; }
      if (ev.target === overlay || ev.target.closest(".update-notice-close, .update-notice-ok")) close();
    });
    document.body.appendChild(overlay);
  }
  function onKey(ev) { if (ev.key === "Escape") { ev.stopPropagation(); close(); } }
  function open() {
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.style.display = "flex";
    requestAnimationFrame(function () { overlay.classList.add("show"); });
    document.addEventListener("keydown", onKey, true);
  }
  function close() {
    if (!overlay) return;
    markSeen();
    overlay.classList.remove("show");
    document.removeEventListener("keydown", onKey, true);
    setTimeout(function () { overlay.style.display = "none"; }, 200);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  // ---------- 更新紀錄頁（在主畫面顯示，像簡單的部落格，由新到舊） ----------
  function openLog() {
    if (window.sapGuide && window.sapGuide.goHome) window.sapGuide.goHome();
    var content = document.getElementById("content");
    if (!content) return;
    content.setAttribute("data-tone", "");
    var hint = document.getElementById("stepHint");
    if (hint) hint.style.display = "none";
    content.innerHTML = '<div class="update-log">' +
      '<h1 class="update-log-title">更新紀錄</h1>' +
      '<p class="update-log-lead">平台每次更新的重點，最新的在最上面。</p>' +
      UPDATES.map(function (u, n) {
        return '<article class="update-log-entry">' +
          '<div class="update-log-date">' + u.date + (n === 0 ? '<span class="update-log-new">最新</span>' : '') + '</div>' +
          listHtml(u.items) + '</article>';
      }).join("") + '</div>';
    markSeen();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.openUpdateNotice = open;
  window.openUpdateLog = openLog;

  function init() {
    document.querySelectorAll("[data-open-updates]").forEach(function (a) {
      a.addEventListener("click", function (ev) { ev.preventDefault(); if (document.activeElement) document.activeElement.blur(); openLog(); });
    });
    if (!seen()) setTimeout(open, 350);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
