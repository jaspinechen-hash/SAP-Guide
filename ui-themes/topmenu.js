/* 「常用連結」選單：滑鼠移到「常用表單」「常用參考資料」上就自動展開，移開就收合。
   只在有滑鼠的裝置啟用；手機／平板觸控時維持原本的點擊展開。 */
(function () {
  /* 右上角選單按鈕：拿掉「🔗 常用連結 ⌄」，改成單純的 ☰（三條橫線）。
     手機／平板寬度時，左上角已經有一個 ☰ 用來開啟流程側邊欄，
     為了不讓畫面上出現兩個一模一樣的按鈕，右邊改顯示「⋯」（更多）。 */
  function swapTrigger() {
    var t = document.querySelector(".topbar-right .dropdown > .topbar-link");
    if (!t || t.classList.contains("menu-trigger")) return;
    t.classList.add("menu-trigger");
    t.setAttribute("aria-label", "選單：常用連結與配色");
    t.setAttribute("title", "常用連結與配色");
    t.innerHTML =
      '<svg class="menu-ico menu-ico-bars" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>' +
      '<svg class="menu-ico menu-ico-more" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>';
  }

  function init() {
    swapTrigger();
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var panel = document.querySelector(".topmenu-panel");
    if (!panel) return;
    panel.querySelectorAll("details").forEach(function (d) {
      var li = d.closest("li") || d;
      var closeTimer = null;
      li.addEventListener("mouseenter", function () {
        clearTimeout(closeTimer);
        // 同一時間只展開一組，避免選單一路拉長
        panel.querySelectorAll("details[open]").forEach(function (o) { if (o !== d) o.removeAttribute("open"); });
        d.setAttribute("open", "");
      });
      // 已經因為滑鼠移入而展開了，再點一下標題不要反而把它收起來
      var sum = d.querySelector("summary");
      if (sum) sum.addEventListener("click", function (e) { if (d.hasAttribute("open")) e.preventDefault(); });
      li.addEventListener("mouseleave", function () {
        // 稍微延遲再收合，滑鼠斜著移動經過縫隙時不會一閃一閃
        closeTimer = setTimeout(function () { d.removeAttribute("open"); }, 180);
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
