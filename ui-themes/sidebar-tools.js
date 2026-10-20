/* ==========================================================================
   側邊欄工具（只在電腦寬度 ≥1024px 啟用；手機／平板維持原本的抽屜式側邊欄）
   1. 收合／展開：側邊欄頂端「操作流程」右側的「«」；收合後左邊留一條窄邊條，點一下即展開
   2. 拖曳調整寬度：拖曳側邊欄右側邊界；雙擊邊界可恢復預設寬度；
      用鍵盤聚焦邊界後也可以用 ← → 調整
   兩項設定都會記在瀏覽器，下次打開維持一樣
   ========================================================================== */
(function () {
  var KEY_W = "sapguide-sidebar-width", KEY_C = "sapguide-sidebar-collapsed";
  var DEF = 286, MIN = 220, MAX = 360, STEP = 16;  // 範圍收斂：主要用途是「拉窄」讓內容更寬
  var root = document.documentElement;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function clamp(w) { return Math.max(MIN, Math.min(MAX, Math.round(w))); }

  var width = clamp(parseInt(get(KEY_W), 10) || DEF);
  var collapsed = get(KEY_C) === "1";
  // 盡早套用，避免頁面先以預設寬度出現再跳動
  root.style.setProperty("--sb-w", width + "px");
  if (collapsed) root.classList.add("sb-collapsed");

  function init() {
    var shell = document.querySelector(".shell");
    var sidebar = document.getElementById("sidebar");
    var left = document.querySelector(".topbar-left");
    if (!shell || !sidebar || !left) return;

    var CHEV_L = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg>';
    var CHEV_R = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></svg>';

    function setCollapsed(v) {
      collapsed = v;
      root.classList.toggle("sb-collapsed", collapsed);
      set(KEY_C, collapsed ? "1" : "0");
      rail.setAttribute("aria-expanded", collapsed ? "false" : "true");
      if (collapsed) rail.focus({ preventScroll: true });
    }

    /* ---- 收合鈕：放在側邊欄頂端「操作流程」那一行的右側 ----
       側邊欄內容會被頁面程式重新產生，所以每次重繪後自動補回 */
    function ensureCollapseBtn() {
      var head = sidebar.firstElementChild;
      if (!head || head.querySelector(".sb-collapse")) return;
      head.classList.add("sb-head");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sb-collapse";
      b.setAttribute("aria-controls", "sidebar");
      b.setAttribute("aria-label", "收合側邊欄");
      b.title = "收合側邊欄";
      b.innerHTML = CHEV_L;
      b.addEventListener("click", function () { setCollapsed(true); });
      head.appendChild(b);
    }
    new MutationObserver(ensureCollapseBtn).observe(sidebar, { childList: true });

    /* ---- 收合後的窄邊條：整條都可以點，展開側邊欄 ---- */
    var rail = document.createElement("button");
    rail.type = "button";
    rail.className = "sb-rail";
    rail.setAttribute("aria-controls", "sidebar");
    rail.setAttribute("aria-label", "展開側邊欄");
    rail.title = "展開側邊欄";
    rail.innerHTML = '<span class="sb-rail-ico">' + CHEV_R + '</span>';
    rail.addEventListener("click", function () { setCollapsed(false); });
    shell.insertBefore(rail, shell.firstChild);
    rail.setAttribute("aria-expanded", collapsed ? "false" : "true");
    ensureCollapseBtn();

    /* ---- 拖曳邊界 ---- */
    var handle = document.createElement("div");
    handle.className = "sb-resizer";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-controls", "sidebar");
    handle.setAttribute("aria-label", "調整側邊欄寬度");
    handle.setAttribute("aria-valuemin", MIN);
    handle.setAttribute("aria-valuemax", MAX);
    handle.title = "拖曳調整寬度（雙擊恢復預設）";
    handle.tabIndex = 0;
    shell.appendChild(handle);

    function apply(w, save) {
      width = clamp(w);
      root.style.setProperty("--sb-w", width + "px");
      handle.setAttribute("aria-valuenow", width);
      if (save) set(KEY_W, String(width));
    }
    apply(width, false);

    var startX = 0, startW = 0;
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      startX = e.clientX; startW = width;
      handle.setPointerCapture(e.pointerId);
      root.classList.add("sb-dragging");
    });
    handle.addEventListener("pointermove", function (e) {
      if (!root.classList.contains("sb-dragging")) return;
      apply(startW + (e.clientX - startX), false);
    });
    function end(e) {
      if (!root.classList.contains("sb-dragging")) return;
      root.classList.remove("sb-dragging");
      try { handle.releasePointerCapture(e.pointerId); } catch (x) {}
      apply(width, true);
    }
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    handle.addEventListener("dblclick", function () { apply(DEF, true); });
    handle.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      // 不要同時觸發頁面的「切換步驟」
      e.preventDefault(); e.stopPropagation();
      apply(width + (e.key === "ArrowRight" ? STEP : -STEP), true);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
