/* 手機上點判斷邏輯圖 → 開啟橫向全螢幕檢視；點任何地方或 ✕ 關閉 */
(function () {
  var viewer;
  function ensure() {
    if (viewer) return viewer;
    viewer = document.createElement("div");
    viewer.className = "diagram-viewer";
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "判斷邏輯圖（橫向檢視）");
    viewer.innerHTML = '<div class="diagram-viewer-inner"></div><button type="button" class="diagram-viewer-close" aria-label="關閉">✕</button>';
    viewer.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && viewer.classList.contains("show")) close(); });
    document.body.appendChild(viewer);
    return viewer;
  }
  function open(svg) {
    var v = ensure();
    var inner = v.querySelector(".diagram-viewer-inner");
    inner.innerHTML = "";
    inner.appendChild(svg.cloneNode(true));
    v.classList.add("show");
    document.documentElement.style.overflow = "hidden";
    v.querySelector(".diagram-viewer-close").focus();
  }
  function close() {
    if (!viewer) return;
    viewer.classList.remove("show");
    document.documentElement.style.overflow = "";
  }
  document.addEventListener("click", function (e) {
    var wrap = e.target.closest && e.target.closest(".rt-diagram-wrap");
    if (!wrap || !window.matchMedia("(max-width: 639px)").matches) return;
    var svg = wrap.querySelector("svg");
    if (svg) open(svg);
  });
})();
