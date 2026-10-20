/* ==========================================================================
   配色切換器（Palette Switcher）
   - 放在右上角選單（☰）的最下方：一排小色票，點一下即切換
   - 若頁面沒有該選單，才退回成頂欄上的獨立色票按鈕
   - 選擇會記在瀏覽器（localStorage），下次打開自動套用
   - 實際顏色定義在各風格的 CSS 裡：html[data-palette="xxx"] { ...變數... }
   使用方式：<script src="ui-themes/palette-switcher.js" data-theme="storytelling"></script>
   ========================================================================== */
(function () {
  var PALETTES = {
    "storytelling": [
      { id: "",        name: "米白紙本", desc: "預設 · 溫暖的紙張感",   sw: ["#f7f3ea", "#b4532a", "#1f1b16"] },
      { id: "harbor",  name: "港灣藍",   desc: "沉穩的藍灰報刊色",       sw: ["#eef1f5", "#2b4c7e", "#1b2433"] },
      { id: "night",   name: "夜讀",     desc: "炭灰背景 · 適合長時間閱讀", sw: ["#2b2a27", "#e0a36b", "#ece5d8"] }
    ],
    "neo-muted": [
      { id: "",        name: "沙岩",     desc: "預設 · 米白＋大地色",     sw: ["#f5f2ec", "#e9d8a6", "#2b2d33"] },
      { id: "harbor",  name: "霧港藍",   desc: "冷靜的藍灰色調",         sw: ["#eef2f5", "#bcd0e0", "#24303b"] },
      { id: "forest",  name: "苔原綠",   desc: "自然的綠色系",           sw: ["#eff1ea", "#d9dcae", "#26302a"] },
      { id: "plum",    name: "灰莓紫",   desc: "帶點紫調的灰色系",       sw: ["#f3eff3", "#dfc9de", "#2f2833"] },
      { id: "night",   name: "夜間",     desc: "炭灰背景 · 淺色框線",     sw: ["#2c2e33", "#8f7d4c", "#e6e1d6"] }
    ]
  };

  var script = document.currentScript;
  var theme = (script && script.getAttribute("data-theme")) || "storytelling";
  var list = PALETTES[theme] || [];
  var KEY = "sapguide-palette-" + theme;
  var root = document.documentElement;

  function read() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function apply(id) {
    var valid = list.some(function (p) { return p.id === id; });
    if (!valid) id = "";
    if (id) root.setAttribute("data-palette", id); else root.removeAttribute("data-palette");
    return id;
  }

  // 盡早套用，避免頁面先閃一下預設配色
  var current = apply(read());

  // 列印／另存 PDF 時一律用預設的淺色配色（避免深色底整頁印出來），印完再恢復
  window.addEventListener("beforeprint", function () { root.removeAttribute("data-palette"); });
  window.addEventListener("afterprint", function () { apply(current); });

  function swatchHtml(p) {
    return '<span class="palette-dot" aria-hidden="true">' + p.sw.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + '</span>';
  }

  /* ---------- 主要模式：嵌入右上角選單 ---------- */
  function buildInMenu(panel) {
    if (panel.querySelector(".palette-row")) return true;
    var divider = document.createElement("li");
    divider.className = "menu-title palette-divider";
    divider.setAttribute("role", "separator");
    var li = document.createElement("li");
    li.className = "menu-title palette-row";
    li.innerHTML =
      '<div class="palette-row-head"><span class="palette-row-label">配色</span><span class="palette-row-name" aria-live="polite"></span></div>' +
      '<div class="palette-swatches" role="radiogroup" aria-label="選擇配色">' +
        list.map(function (p) {
          return '<button type="button" class="palette-swatch" role="radio" data-id="' + p.id + '" data-name="' + p.name + '" aria-label="' + p.name + '" title="' + p.name + '（' + p.desc + '）">' + swatchHtml(p) + '</button>';
        }).join("") +
      '</div>';
    panel.appendChild(divider);
    panel.appendChild(li);

    var nameEl = li.querySelector(".palette-row-name");
    var btns = Array.prototype.slice.call(li.querySelectorAll(".palette-swatch"));
    function curName() { var c = list.filter(function (p) { return p.id === current; })[0]; return c ? c.name : ""; }
    function mark() {
      btns.forEach(function (b) {
        var on = b.getAttribute("data-id") === current;
        b.classList.toggle("active", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });
      nameEl.textContent = curName();
    }
    mark();
    btns.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        current = apply(b.getAttribute("data-id")); save(current); mark();
      });
      // 滑鼠移到色票上時，先預告名稱
      b.addEventListener("mouseenter", function () { nameEl.textContent = b.getAttribute("data-name"); });
      b.addEventListener("focus", function () { nameEl.textContent = b.getAttribute("data-name"); });
    });
    li.addEventListener("mouseleave", function () { nameEl.textContent = curName(); });
    li.addEventListener("keydown", function (e) {
      // 方向鍵在色票間移動，且不要觸發頁面的「切換步驟」
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) === -1) return;
      e.preventDefault(); e.stopPropagation();
      var i = btns.indexOf(document.activeElement);
      var d = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      btns[(i + d + btns.length) % btns.length].focus();
    });
    return true;
  }

  /* ---------- 備用模式：頂欄上的獨立色票按鈕（頁面沒有選單時才用） ---------- */
  function buildStandalone() {
    var host = document.querySelector(".topbar-right");
    if (!host || document.getElementById("paletteSwitch")) return;
    var wrap = document.createElement("div");
    wrap.className = "palette-switch"; wrap.id = "paletteSwitch";
    wrap.innerHTML =
      '<button type="button" class="palette-trigger" aria-haspopup="true" aria-expanded="false" aria-label="切換配色" title="切換配色">' + swatchHtml(list[0]) + '</button>' +
      '<div class="palette-panel" role="menu" aria-label="選擇配色">' +
        list.map(function (p) {
          return '<button type="button" class="palette-item" role="menuitemradio" data-id="' + p.id + '">' + swatchHtml(p) +
            '<span class="palette-text"><span class="palette-name">' + p.name + '</span><span class="palette-desc">' + p.desc + '</span></span></button>';
        }).join("") + '</div>';
    host.insertBefore(wrap, host.firstChild);
    var btn = wrap.querySelector(".palette-trigger"), panel = wrap.querySelector(".palette-panel");
    var dots = btn.querySelectorAll(".palette-dot i");
    function mark() {
      var cur = list.filter(function (p) { return p.id === current; })[0] || list[0];
      dots.forEach(function (d, i) { d.style.background = cur.sw[i]; });
      wrap.querySelectorAll(".palette-item").forEach(function (it) { it.classList.toggle("active", it.getAttribute("data-id") === current); });
    }
    mark();
    btn.addEventListener("click", function (e) { e.stopPropagation(); var v = !panel.classList.contains("show"); panel.classList.toggle("show", v); btn.setAttribute("aria-expanded", v); });
    panel.addEventListener("click", function (e) { var it = e.target.closest(".palette-item"); if (!it) return; current = apply(it.getAttribute("data-id")); save(current); mark(); });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) { panel.classList.remove("show"); btn.setAttribute("aria-expanded", "false"); } });
  }

  function build() {
    var panel = document.querySelector(".topmenu-panel");
    if (panel) buildInMenu(panel); else buildStandalone();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
