/* SAP Guidehub · Designed & maintained by Jaspine · © 2026 */
    (function () {
      "use strict";
      var DATA = [];
      try { DATA = JSON.parse(document.getElementById("proc-data").textContent || "[]"); } catch (e) { DATA = []; }

      var sidebar = document.getElementById("sidebar");
      var content = document.getElementById("content");
      var backdrop = document.getElementById("backdrop");
      var active = -1;
      var stepIndex = 0;

      var CATEGORY_TONE = {
        "物料主檔": "lavender",
        "請購/請款": "sky",
        "收貨作業": "mint",
        "系統偏好設定": "peach"
      };
      // 沒有子分類、但屬於不同系統（例如 TIPTOP）的項目，用系統本身的顏色頂上，一樣要「有顏色」
      var GROUP_TONE = { "TIPTOP": "gold" };
      function toneFor(p) {
        if (!p) return "";
        return CATEGORY_TONE[p.category] || GROUP_TONE[p.group] || "";
      }

      var GATE_TREE = {
        id: "q1",
        q: "這筆需求是否要轉為採購單，交由採購單位處理？",
        yes: {
          id: "q2",
          q: "是否需要由倉管或申請人收貨（A01收貨）？",
          yes: {
            id: "q3",
            q: "購買的項目是否為固定資產或列管資產？",
            yes: { id: "u", branch: "U" },
            no: { id: "k", branch: "K" }
          },
          no: { id: "v", branch: "V" }
        },
        no: {
          id: "q4",
          q: "是否為已持有收據或發票、要直接請款的費用（例如代墊、差旅）？",
          yes: { id: "z", branch: "Z" },
          no: { id: "oth", result: "這種情況目前教學尚未涵蓋，建議與財會或主管確認正確的申請方式。" }
        }
      };

      var GATE_DIAGRAM_SVG = '<svg viewBox="0 0 820 420" class="rt-diagram" role="img" aria-label="請購情境判斷流程圖"><defs><marker id="rtArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="rt-arrow-fill" /></marker></defs><rect x="315" y="12" width="190" height="52" rx="12" class="rt-q-box" /><text x="410" y="36" text-anchor="middle" class="rt-q-text">這筆需求是否要轉為</text><text x="410" y="51" text-anchor="middle" class="rt-q-text">採購單處理？</text><rect x="135" y="124" width="160" height="52" rx="12" class="rt-q-box" /><text x="215" y="148" text-anchor="middle" class="rt-q-text">是否需要收貨</text><text x="215" y="163" text-anchor="middle" class="rt-q-text">（A01收貨）？</text><rect x="510" y="124" width="210" height="52" rx="12" class="rt-q-box" /><text x="615" y="148" text-anchor="middle" class="rt-q-text">是否為已持有收據／發票、</text><text x="615" y="163" text-anchor="middle" class="rt-q-text">要直接請款的費用？</text><rect x="55" y="236" width="150" height="52" rx="12" class="rt-q-box" /><text x="130" y="260" text-anchor="middle" class="rt-q-text">是否為固定資產</text><text x="130" y="275" text-anchor="middle" class="rt-q-text">或列管資產？</text><rect x="264" y="240" width="132" height="44" rx="22" class="rt-o-box" data-tone="sky" /><text x="330" y="267" text-anchor="middle" class="rt-o-text">V．不需收貨</text><rect x="446" y="240" width="158" height="44" rx="22" class="rt-o-box" data-tone="rose" /><text x="525" y="267" text-anchor="middle" class="rt-o-text">Z．員工請款報支</text><rect x="637" y="240" width="116" height="44" rx="22" class="rt-o-box" data-tone="" /><text x="695" y="267" text-anchor="middle" class="rt-o-text">情況不明</text><rect x="15" y="354" width="110" height="44" rx="22" class="rt-o-box" data-tone="peach" /><text x="70" y="381" text-anchor="middle" class="rt-o-text">U．固定資產</text><rect x="155" y="354" width="110" height="44" rx="22" class="rt-o-box" data-tone="mint" /><text x="210" y="381" text-anchor="middle" class="rt-o-text">K．一般請購</text><line x1="380" y1="64" x2="235" y2="126" class="rt-line" marker-end="url(#rtArrow)" /><rect x="292" y="77" width="26" height="20" rx="6" class="rt-label-bg" /><text x="305" y="92" text-anchor="middle" class="rt-label-text">是</text><line x1="440" y1="64" x2="595" y2="126" class="rt-line" marker-end="url(#rtArrow)" /><rect x="537" y="77" width="26" height="20" rx="6" class="rt-label-bg" /><text x="550" y="92" text-anchor="middle" class="rt-label-text">否</text><line x1="200" y1="176" x2="145" y2="236" class="rt-line" marker-end="url(#rtArrow)" /><rect x="132" y="195" width="26" height="20" rx="6" class="rt-label-bg" /><text x="145" y="210" text-anchor="middle" class="rt-label-text">是</text><line x1="230" y1="176" x2="300" y2="240" class="rt-line" marker-end="url(#rtArrow)" /><rect x="272" y="195" width="26" height="20" rx="6" class="rt-label-bg" /><text x="285" y="210" text-anchor="middle" class="rt-label-text">否</text><line x1="595" y1="176" x2="545" y2="240" class="rt-line" marker-end="url(#rtArrow)" /><rect x="532" y="195" width="26" height="20" rx="6" class="rt-label-bg" /><text x="545" y="210" text-anchor="middle" class="rt-label-text">是</text><line x1="635" y1="176" x2="685" y2="240" class="rt-line" marker-end="url(#rtArrow)" /><rect x="697" y="195" width="26" height="20" rx="6" class="rt-label-bg" /><text x="710" y="210" text-anchor="middle" class="rt-label-text">否</text><line x1="115" y1="288" x2="80" y2="354" class="rt-line" marker-end="url(#rtArrow)" /><rect x="62" y="308" width="26" height="20" rx="6" class="rt-label-bg" /><text x="75" y="323" text-anchor="middle" class="rt-label-text">是</text><line x1="145" y1="288" x2="200" y2="354" class="rt-line" marker-end="url(#rtArrow)" /><rect x="172" y="308" width="26" height="20" rx="6" class="rt-label-bg" /><text x="185" y="323" text-anchor="middle" class="rt-label-text">否</text></svg>';

      var branchState = {};
      var gateQMode = false;
      var gateQTrail = [GATE_TREE];
      var gateQAnswers = [];
      var gatePendingAns = null; // 選了但還在淘汰動畫中的答案（"yes"／"no"），完成後才真的往下推進
      // 「換下一題」這個時機改用瀏覽器原生 View Transition 處理整體的淡出/縮放/淡入（見 advanceGate），
      // 這個旗標開著的時候，renderGatePath 就不再另外疊加自己的 landing／just／just-settled 進場動畫，
      // 避免兩套動畫同時跑，出現「先收合、再滑動、再展開」那種一段一段、卡卡的感覺。
      // 不支援 View Transition 的瀏覽器則維持原本的逐一動畫，不受影響。
      var suppressGateAnim = false;

      function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
        });
      }
      function md(t) {
        t = t || "";
        if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(t);
        var h = esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
        // 標示語法：[[n:1]] → 與截圖標示相同的編號；[[btn:訂購]] → 按鈕樣式標籤
        h = h.replace(/\[\[n:(\d+)\]\]/g, '<span class="step-n">$1</span>')
             .replace(/\[\[btn:([^\]]+)\]\]/g, '<span class="ui-btn">$1</span>');
        return h.split(/\n\s*\n/).map(function (para) { return "<p>" + para.replace(/\n/g, "<br>") + "</p>"; }).join("");
      }
      function buildSidebar() {
        var groups = [];
        DATA.forEach(function (p, i) {
          var g = groups.filter(function (x) { return x.name === p.group; })[0];
          if (!g) { g = { name: p.group, cats: [] }; groups.push(g); }
          var catName = p.category || "";
          var cat = g.cats.filter(function (c) { return c.name === catName; })[0];
          if (!cat) { cat = { name: catName, items: [] }; g.cats.push(cat); }
          cat.items.push({ p: p, i: i });
        });
        var html = '<div class="px-2 pb-2 pt-1"><div class="text-[0.65rem] font-semibold uppercase tracking-wider opacity-45">操作流程</div></div>';
        var UTILITY_CATEGORIES = ["系統偏好設定"];
        html += '<ul class="menu w-full p-0 gap-0.5">';
        groups.forEach(function (g) {
          var altSystem = g.name !== "SAP"; // 不同系統（例如 TIPTOP）跟預設的 SAP 用不同標籤樣式，方便一眼分辨
          if (altSystem) html += '<li class="sidebar-divider"></li>';
          html += '<li class="menu-title px-2 pt-2 pb-1 text-[0.68rem] tracking-wide' + (altSystem ? " menu-title-system" : "") + '">' + esc(g.name) + "</li>";
          g.cats.forEach(function (cat) {
            var tone = CATEGORY_TONE[cat.name] || GROUP_TONE[g.name] || "";
            if (cat.name && UTILITY_CATEGORIES.indexOf(cat.name) !== -1) html += '<li class="sidebar-divider"></li>';
            if (cat.name) html += '<li class="cat-title" data-tone="' + esc(tone) + '">' + esc(cat.name) + "</li>";
            cat.items.forEach(function (o) {
              var noSteps = !o.p.steps || !o.p.steps.length;
              html += '<li><a class="proc-link' + (cat.name ? " nested" : "") + (noSteps ? " ref-only" : "") + (o.i === active ? " active" : "") + '" data-tone="' + esc(tone) + '" data-i="' + o.i + '">' +
                '<span class="proc-name">' + esc(o.p.name) + "</span>" +
                (o.p.code ? '<span class="proc-code">' + esc(o.p.code) + "</span>" : "") +
                (o.p.pending ? '<span class="ref-badge">建置中</span>' : "") +
                "</a></li>";
            });
          });
        });
        html += "</ul>";
        sidebar.innerHTML = html;
        sidebar.querySelectorAll(".proc-link").forEach(function (a) {
          a.addEventListener("click", function () { select(+a.dataset.i); });
        });
      }

      function findBranchTemplate(p) {
        for (var i = 0; i < p.steps.length; i++) {
          if (p.steps[i].branch) return { index: i, step: p.steps[i] };
        }
        return null;
      }

      function findBranchStateKey(p) {
        var bt = findBranchTemplate(p);
        return bt ? bt.step.branch.stateKey : null;
      }

      function buildResolvedBranchStep(baseStep, opt) {
        return {
          title: baseStep.title,
          resolvedBranch: { baseStep: baseStep, opt: opt },
          images: opt.images
        };
      }

      function getEffectiveSteps(p) {
        var bt = findBranchTemplate(p);
        if (!bt) return p.steps;
        var head = p.steps.slice(0, bt.index);
        var sel = branchState[bt.step.branch.stateKey];
        var opt = bt.step.branch.options.filter(function (o) { return o.key === sel; })[0];
        if (!opt) return head.concat([{ title: bt.step.title }]); // 未選擇時：只佔用一個「選擇情境」的位置，尚未知道後面會展開幾步
        var tail = p.steps.slice(bt.index + 1);
        var mid = [buildResolvedBranchStep(bt.step, opt)].concat(opt.extraSteps || []);
        return head.concat(mid, tail);
      }

      function renderImages(images, title) {
        if (!images || !images.length) return "";
        return images.map(function (img) {
          var src = typeof img === "string" ? img : img.src;
          var small = typeof img === "object" && img && img.small;
          // marks：[{ box: [左%, 上%, 寬%, 高%], n: 編號 }]，由平台畫框，不畫在圖片上
          var marks = (typeof img === "object" && img && img.marks) || [];
          var markHtml = marks.map(function (m) {
            var b = m.box;
            var side = m.side || (b[0] < 6 ? "b" : "l");
            return '<span class="shot-mark" data-side="' + side + '"' + (m.n ? ' data-n="' + m.n + '"' : "") +
              ' style="left:calc(' + b[0] + "% - 5px);top:calc(" + b[1] + "% - 4px);width:calc(" + b[2] + "% + 10px);height:calc(" + b[3] + '% + 8px)"></span>';
          }).join("");
          var fig = '<figure class="shot' + (small ? " shot-small" : "") + '">' +
            (markHtml ? '<div class="shot-wrap"><img src="' + src + '" alt="' + esc(title) + '" class="shot-img" />' + markHtml + "</div>"
                      : '<img src="' + src + '" alt="' + esc(title) + '" class="shot-img" />') +
            (typeof img === "object" && img && img.caption ? "<figcaption>" + esc(img.caption) + "</figcaption>" : "") +
            "</figure>";
          // fold：填欄位的步驟以答案卷為主，截圖收合成「看實際畫面」
          if (typeof img === "object" && img && img.fold) {
            return '<details class="shot-fold"><summary>' + esc(img.fold === true ? "看實際畫面" : img.fold) + "</summary>" + fig + "</details>";
          }
          return fig;
        }).join("");
      }

      function renderShot(p, s, idx) {
        var imgs = s.images;
        if (s.imagesByBranch) {
          var bsk = findBranchStateKey(p);
          var branchKey = bsk ? branchState[bsk] : null;
          imgs = (branchKey && s.imagesByBranch[branchKey]) || [];
        }
        if (imgs && imgs.length) return renderImages(imgs, s.title);
        if (!s.screenshot && !s.image) return "";
        if (s.image) {
          return '<figure class="shot">' +
            '<img src="' + s.image + '" alt="' + esc(s.screenshot || s.title) + '" class="shot-img" />' +
            '<figcaption><span class="fig-no">圖 ' + (idx + 1) + ".</span> " + esc(s.screenshot) + "</figcaption>" +
            "</figure>";
        }
        return '<figure class="shot">' +
          '<div class="shot-frame">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 15l-4.5-4.5L7 20"/></svg>' +
          '<div class="shot-label">參考螢幕截圖</div>' +
          '<div class="shot-tag">' + esc(p.code || p.name) + " · 步驟 " + (idx + 1) + "</div>" +
          "</div>" +
          '<figcaption><span class="fig-no">圖 ' + (idx + 1) + ".</span> " + esc(s.screenshot) + "</figcaption>" +
          "</figure>";
      }

      // ---------- 「答案卷」呈現（內容呈現預覽 D）----------
      // 欄位有 ex（範例值）、kind（var／fixed／blank）或 section（區塊標題）時，改用答案卷呈現：
      // 直接秀出要填的值；規則（value）與備註（note）收在 ⓘ 裡，點該列才展開。
      // ex 內可用 [[c1:314]] 標記顏色，同一來源的數字用同一個顏色串起來（c1 粉紅、c2 藍、c3 黃）。
      function isAnswerSheet(fields) {
        return !!(fields && fields.some(function (f) { return f.ex != null || f.kind; }));
      }
      function asTokens(s) {
        return esc(s).replace(/\[\[(c\d):([^\]]+)\]\]/g, '<span class="as-v $1">$2</span>')
          .replace(/\[\[s:([^\]]+)\]\]/g, '<span class="as-sub">$1</span>');
      }
      function renderBanner(b) { return b ? '<div class="as-banner">' + asTokens(b) + "</div>" : ""; }
      // 依 SAP「一般資訊」畫面的區塊與順序排列（基本資料 → 價格和數量 → 憑證資料 → 組織），
      // 讓答案卷的順序跟螢幕上看到的一致；不在對照表裡的欄位（如成本中心）維持原順序、不分區。
      var AS_SECTIONS = ["基本資料", "價格和數量", "憑證資料", "組織"];
      var AS_ORDER = {
        "項目說明": [0, 1], "物料群組": [0, 2], "期望供應商": [0, 3],
        "評價價格": [1, 1], "價格單位": [1, 2], "已請求數量": [1, 3], "交貨日期": [1, 4],
        "稅碼": [2, 1], "發票日期": [2, 2], "統一編號": [2, 3], "發票號碼": [2, 4], "總金額": [2, 5],
        "稅基": [2, 6], "筆數": [2, 7], "付款日期": [2, 8], "憑證資料各欄": [2, 9],
        "採購群組": [3, 1], "採購組織": [3, 2], "工廠／採購工廠": [3, 3], "工廠": [3, 3], "科目指派種類": [3, 4]
      };
      function renderAnswerSheet(fields, notes) {
        notes = notes || {};
        var seen = {};
        var list = fields.map(function (f, i) { return { f: f, i: i, o: AS_ORDER[f.name] }; });
        var secCount = {};
        list.forEach(function (x) { if (x.o) secCount[x.o[0]] = 1; });
        var useSec = Object.keys(secCount).length >= 2;
        if (useSec) list.sort(function (a, b) {
          var ka = a.o ? a.o[0] * 100 + a.o[1] : 1000 + a.i, kb = b.o ? b.o[0] * 100 + b.o[1] : 1000 + b.i;
          return ka - kb;
        });
        var curSec = -1;
        var h = '<div class="as-sheet">';
        list.forEach(function (x) {
          var f = x.f;
          if (useSec && x.o && x.o[0] !== curSec) {
            curSec = x.o[0];
            var sn = AS_SECTIONS[curSec];
            h += '<div class="as-sec">' + esc(sn) + (notes[sn] ? '<span class="as-sec-note">' + esc(notes[sn]) + "</span>" : "") + "</div>";
          }
          var kind = f.kind || (f.ex != null ? "var" : "rule");
          seen[kind] = true;
          if (kind === "blank") {
            // 空格也可以帶提醒（例：費用項目的發票日期「不要點進去」），有 note 時一樣用 ⓘ 展開
            var bw = f.note ? "<div>" + esc(f.note) + "</div>" : "";
            h += '<div class="as-row k-blank' + (bw ? " has-why" : "") + '"><div class="as-k">' + esc(f.name) + '</div><div class="as-box">' + (f.ex ? esc(f.ex) : "") + "</div>" +
              (bw ? '<span class="as-i" title="看提醒">ⓘ</span><div class="as-why">' + bw + "</div>" : "") + "</div>";
            return;
          }
          var val = f.ex != null ? asTokens(f.ex) : esc(f.value || "");
          // 規則文字若已經出現在方框裡（例：價格單位 1、科目指派種類 Z），就不在 ⓘ 裡重複
          var exPlain = f.ex != null ? String(f.ex).replace(/\[\[(?:c\d|s):([^\]]+)\]\]/g, "$1") : "";
          var showRule = f.ex != null && f.value && exPlain.indexOf(f.value) === -1;
          var why = (showRule ? "<div>" + esc(f.value) + "</div>" : "") + (f.note ? "<div>" + esc(f.note) + "</div>" : "");
          h += '<div class="as-row k-' + kind + (why ? " has-why" : "") + '">' +
            '<div class="as-k">' + esc(f.name) + "</div>" +
            '<div class="as-box">' + val + "</div>" +
            (why ? '<span class="as-i" title="看填寫規則">ⓘ</span><div class="as-why">' + why + "</div>" : '<span class="as-i as-i-none"></span>') +
            "</div>";
        });
        h += "</div>";
        return h;
      }

      function renderFieldsTable(fields, notes) {
        if (!fields || !fields.length) return "";
        if (isAnswerSheet(fields)) return renderAnswerSheet(fields, notes);
        var h = '<div class="field-card-list">';
        fields.forEach(function (f) {
          h += '<div class="field-card">' +
            '<div class="field-card-row"><span class="field-card-label">' + esc(f.name) + "</span>" +
            (f.value ? '<span class="field-card-value">' + esc(f.value) + "</span>" : "") +
            "</div>" +
            (f.note ? '<div class="field-card-note">' + esc(f.note) + "</div>" : "") +
            "</div>";
        });
        h += "</div>";
        return h;
      }

      function renderGatePath() {
        var trail = gateQTrail, answers = gateQAnswers;
        // 以原圖的方框流程圖為視覺基底，由上而下逐層生長；還沒走到的問題／結果一律不畫出來。
        // 問題方框、是／否邊線與按鈕統一跟隨目前頁面的情境色（由外層 .gate-screen[data-tone] 提供的
        // --gate-strong / --gate-text 變數），不再依第幾題切換不同馬卡龍色。
        var h = '<div class="gate-flow">';
        for (var i = 0; i < trail.length - 1; i++) {
          // 剛從「目前這一題」退下來的那一題（就是上一輪的 current），用 just-settled 播放一次
          // 「從飽和變淡」的動畫；再更早之前的題目本來就已經是淡的，直接維持淡色、不重播動畫。
          // suppressGateAnim 開著時（換題交給 View Transition 處理）就不加這個 class，避免兩套動畫疊在一起。
          var justSettled = !suppressGateAnim && i === trail.length - 2 && !gatePendingAns ? " just-settled" : "";
          h += '<div class="gate-flow-node' + justSettled + '"><div class="gate-flow-node-text">' + esc(trail[i].q) + "</div></div>";
          var edgeJust = !suppressGateAnim && i === trail.length - 2 && !gatePendingAns ? " just" : "";
          h += '<div class="gate-flow-edge ans-' + esc(answers[i]) + edgeJust + '">' +
            '<span class="gate-flow-line"></span>' +
            '<span class="gate-flow-edge-label">' + (answers[i] === "yes" ? "是" : "否") + "</span>" +
            "</div>";
        }
        var current = trail[trail.length - 1];
        h += '<div class="gate-flow-node current' + (gatePendingAns || suppressGateAnim ? "" : " landing") + '">';
        h += '<div class="gate-flow-node-text">' + esc(current.q) + "</div>";
        h += '<div class="gate-flow-branches' + (gatePendingAns ? " pending" : "") + '">';
        ["yes", "no"].forEach(function (ans) {
          var isChosen = gatePendingAns === ans;
          var isRejected = !!gatePendingAns && gatePendingAns !== ans;
          var cls = "gate-flow-choice ans-" + ans + (isChosen ? " chosen" : "") + (isRejected ? " rejected" : "");
          h += '<div class="gate-flow-branch-col">' +
            '<span class="gate-flow-stub ans-' + ans + '"></span>' +
            '<button type="button" class="' + cls + '" data-ans="' + ans + '"' + (gatePendingAns ? " disabled" : "") + ">" +
            (ans === "yes" ? "是" : "否") +
            "</button></div>";
        });
        h += "</div></div>";
        h += "</div>";
        return h;
      }

      function renderGateAskInner(b) {
        var h = '<div class="gate-ask">';
        var current = gateQTrail[gateQTrail.length - 1];
        if (current.branch) {
          var opt = b.options.filter(function (o) { return o.key === current.branch; })[0];
          h += '<div class="gate-ask-result" data-tone="' + esc(opt ? opt.tone || "" : "") + '">' +
            (opt && opt.icon ? '<span class="gate-ask-result-icon">' + esc(opt.icon) + "</span>" : "") +
            '<div><div class="text-sm font-medium opacity-60">判斷結果</div>' +
            '<div class="text-lg font-bold">' + esc(opt ? (opt.title || opt.label) : current.branch) + "</div></div></div>";
          h += '<div class="flex flex-wrap gap-2 mt-3">' +
            '<button class="btn btn-primary btn-sm" id="gateApplyBtn">套用此情境 →</button>' +
            '<button class="btn btn-ghost btn-sm" id="gateQRestartBtn">重新開始</button>' +
            "</div>";
        } else if (current.result) {
          h += '<div class="text-sm font-medium opacity-60">結果</div>' +
            '<p class="text-sm mt-1">' + esc(current.result) + "</p>" +
            '<div class="flex flex-wrap gap-2 mt-2"><button class="btn btn-ghost btn-sm" id="gateQRestartBtn">重新開始</button></div>';
        } else {
          h += renderGatePath();
          if (gateQTrail.length > 1) h += '<div class="mt-2 text-center"><button class="btn btn-ghost btn-xs" id="gateQBackBtn"' + (gatePendingAns ? " disabled" : "") + '>← 上一題</button></div>';
        }
        h += '<div class="mt-3' + (current.branch || current.result ? "" : " text-center") + '"><button type="button" class="btn btn-ghost btn-xs" id="gatePickBtn">← 改用直接選擇</button></div>';
        h += "</div>";
        return h;
      }

      function renderGate(p, s, idx) {
        var b = s.branch;
        var pageTone = toneFor(p) || ""; // 讓問答與邏輯圖跟隨目前頁面的情境色，不再固定藍/金配色
        var h = '<div class="gate-screen" data-tone="' + esc(pageTone) + '">';
        h += '<div class="gate-label">開始前，先選擇你的情境</div>';

        if (gateQMode) {
          h += renderGateAskInner(b);
        } else {
          h += '<div class="gate-prompt">' + esc(b.prompt) + "</div>";
          h += '<button type="button" class="gate-helper-card" id="gateAskBtn">' +
            '<span class="gate-helper-icon">🧭</span>' +
            '<span class="gate-helper-text">' +
            '<span class="gate-helper-title">不確定該選哪個？</span>' +
            '<span class="gate-helper-desc">用幾個簡單的問答，幫你找到對應情境</span>' +
            "</span>" +
            '<span class="gate-helper-arrow">→</span>' +
            "</button>";
          h += '<div class="gate-or">或者，直接選擇你的情境：</div>';
          h += '<div class="branch-grid">' + b.options.map(function (o) {
            return '<button type="button" class="branch-card" data-tone="' + esc(o.tone || "") + '" data-key="' + esc(o.key) + '" data-statekey="' + esc(b.stateKey) + '">' +
              (o.icon ? '<span class="branch-icon">' + esc(o.icon) + "</span>" : "") +
              '<span class="branch-title">' + esc(o.title || o.label) + "</span>" +
              (o.desc ? '<span class="branch-desc">' + esc(o.desc) + "</span>" : "") +
              "</button>";
          }).join("") + "</div>";
        }

        // 「查看範例」放在整頁層級（不綁定特定情境卡片），因為範例會涵蓋整個請購／請款流程，
        // 不是只有 Z．員工請款報支才有。
        if (p.examples) {
          h += '<div class="gate-examples-trigger text-sm text-center mt-3">' +
            '<button type="button" id="gateExamplesBtn" class="gate-examples-btn">📎 查看範例</button>' +
            "</div>";
        }

        h += '<div class="collapse collapse-arrow gate-diagram-ref mt-3">' +
          '<input type="checkbox" />' +
          '<div class="collapse-title text-sm">查看完整判斷邏輯圖</div>' +
          '<div class="collapse-content"><div class="rt-diagram-wrap">' + GATE_DIAGRAM_SVG + "</div></div></div>";

        h += '<div class="gate-back"><button type="button" class="btn btn-ghost btn-sm" id="gateBackBtn">← 返回上一步</button></div>';
        h += "</div>";
        var w = document.getElementById("wizard");
        w.innerHTML = h;

        function resetAsk() { gateQTrail = [GATE_TREE]; gateQAnswers = []; gatePendingAns = null; }

        w.querySelectorAll(".branch-card").forEach(function (btn) {
          btn.addEventListener("click", function () {
            branchState[btn.dataset.statekey] = btn.dataset.key;
            gateQMode = false; resetAsk();
            renderWizard();
          });
        });
        var examplesBtn = document.getElementById("gateExamplesBtn");
        if (examplesBtn) examplesBtn.addEventListener("click", function () {
          openMediaModal("填寫範例", p.examples);
        });
        var askBtn = document.getElementById("gateAskBtn");
        if (askBtn) askBtn.addEventListener("click", function () {
          gateQMode = true; resetAsk();
          renderWizard();
        });
        var pickBtn = document.getElementById("gatePickBtn");
        if (pickBtn) pickBtn.addEventListener("click", function () {
          gateQMode = false; resetAsk();
          renderWizard();
        });
        // 換題／退回上一題：這兩個時機整段 #wizard 都是重新產生的 DOM，靠個別 class 疊動畫很容易
        // 兜不齊，看起來像「先收合、再滑動、再展開」。有 View Transition 的瀏覽器改交給它統一
        // 處理新舊畫面的淡出／縮放／淡入，是同一顆瀏覽器原生動畫、不會分段；沒有的話則照舊用
        // 原本逐一 class 疊加的動畫，行為不變。
        function renderGateStep() {
          if (typeof document.startViewTransition === "function") {
            suppressGateAnim = true;
            document.startViewTransition(function () { renderWizard(); });
            suppressGateAnim = false;
          } else {
            renderWizard();
          }
        }
        function chooseAns(ans) {
          if (gatePendingAns) return; // 淘汰動畫進行中，避免連點
          var trailAtClick = gateQTrail;
          gatePendingAns = ans;
          renderWizard(); // 先畫出「一個確認、一個淘汰」的狀態
          setTimeout(function () {
            if (gateQTrail !== trailAtClick) return; // 期間使用者已重新開始／離開，取消這次推進
            var cur = gateQTrail[gateQTrail.length - 1];
            gateQAnswers.push(ans);
            gateQTrail.push(cur[ans]);
            gatePendingAns = null;
            renderGateStep(); // 「降落」到下一題
          }, 260);
        }
        w.querySelectorAll(".gate-flow-choice").forEach(function (btn) {
          btn.addEventListener("click", function () { chooseAns(btn.dataset.ans); });
        });
        var qBackBtn = document.getElementById("gateQBackBtn");
        if (qBackBtn) qBackBtn.addEventListener("click", function () {
          if (gatePendingAns) return;
          if (gateQTrail.length > 1) { gateQTrail.pop(); gateQAnswers.pop(); }
          renderGateStep();
        });
        var qRestartBtn = document.getElementById("gateQRestartBtn");
        if (qRestartBtn) qRestartBtn.addEventListener("click", function () {
          resetAsk();
          renderWizard();
        });
        var applyBtn = document.getElementById("gateApplyBtn");
        if (applyBtn) applyBtn.addEventListener("click", function () {
          var cur = gateQTrail[gateQTrail.length - 1];
          branchState[b.stateKey] = cur.branch;
          gateQMode = false; resetAsk();
          renderWizard();
        });

        var back = document.getElementById("gateBackBtn");
        if (back) back.addEventListener("click", function () { if (idx > 0) setStep(idx - 1); });
      }

      function renderStepCard(p, s, idx) {
        var h = '<div class="card bg-base-100 border border-base-300 shadow-sm"><div class="card-body p-4 sm:p-5 gap-3">';
        h += '<div class="flex items-center gap-3"><div class="step-num">' + (idx + 1) + "</div>" +
          '<h3 class="font-semibold text-base leading-tight">' + esc(s.title) + "</h3></div>";

        var showShot = true;
        if (s.resolvedBranch) {
          var baseStep = s.resolvedBranch.baseStep, opt = s.resolvedBranch.opt;
          h += '<div class="branch-picked-row">' +
            '<button type="button" class="branch-back-btn" data-statekey="' + esc(baseStep.branch.stateKey) + '" title="重新選擇情境" aria-label="重新選擇情境">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>' +
            "</button>" +
            '<div class="branch-picked" data-tone="' + esc(opt.tone || "") + '">' +
            (opt.icon ? '<span class="branch-picked-icon">' + esc(opt.icon) + "</span>" : "") +
            '<span class="branch-picked-title">' + esc(opt.title || opt.label) + "</span>" +
            "</div>" +
            "</div>";
          if (isAnswerSheet(opt.fields) || isAnswerSheet(baseStep.fields)) {
            // 答案卷：先放說明文字，再把「共同欄位＋情境欄位」合成一張答案卷，不再分兩段
            if (!opt.overrideFields && baseStep.body) h += '<div class="md text-sm mt-2">' + md(baseStep.body) + "</div>";
            if (opt.body) h += '<div class="md text-sm mt-2">' + md(opt.body) + "</div>";
            h += renderBanner(opt.banner);
            h += renderFieldsTable((opt.overrideFields ? [] : (baseStep.fields || [])).concat(opt.fields || []), opt.sectionNotes);
          } else {
            if (!opt.overrideFields) {
              if (baseStep.body) h += '<div class="md text-sm mt-2">' + md(baseStep.body) + "</div>";
              h += renderFieldsTable(baseStep.fields);
            }
            if (opt.body) h += '<div class="md text-sm mt-2">' + md(opt.body) + "</div>";
            h += renderFieldsTable(opt.fields);
          }
          if (opt.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(opt.tip) + "</span></div>";
          if (baseStep.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(baseStep.tip) + "</span></div>";
        } else if (s.showIf) {
          var match = branchState[s.showIf.stateKey] === s.showIf.equals;
          if (!match) {
            h += '<div class="text-sm opacity-60 italic">' + esc(s.elseBody || "此步驟不適用於您所選擇的情境，可直接點擊「下一步」繼續。") + "</div>";
            showShot = false;
          } else {
            h += '<div class="md text-sm">' + md(s.body) + "</div>";
            h += renderBanner(s.banner);
            h += renderFieldsTable(s.fields, s.sectionNotes);
            if (s.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(s.tip) + "</span></div>";
          }
        } else {
          h += '<div class="md text-sm">' + md(s.body) + "</div>";
          h += renderBanner(s.banner);
          h += renderFieldsTable(s.fields, s.sectionNotes);
          if (s.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(s.tip) + "</span></div>";
        }

        if (showShot) h += renderShot(p, s, idx);
        if (s.attachments && s.attachments.length) {
          h += '<div class="flex flex-col gap-2">' + s.attachments.map(function (a) {
            return '<a href="' + a.url + '" download="' + esc(a.filename || a.name) + '" class="attachment-chip">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
              '<span>' + esc(a.name) + "</span></a>";
          }).join("") + "</div>";
        }
        h += "</div></div>";
        return h;
      }

      function railHtml(eff) {
        var h = '<div class="wiz-rail" role="tablist" aria-label="步驟">';
        eff.forEach(function (s, i) {
          var cls = i === stepIndex ? "current" : (i < stepIndex ? "done" : "todo");
          h += '<button class="wiz-dot ' + cls + '" data-s="' + i + '" title="' + esc((i + 1) + ". " + s.title) + '">' +
            (i < stepIndex ? "✓" : (i + 1)) + "</button>";
          if (i < eff.length - 1) h += '<span class="wiz-line ' + (i < stepIndex ? "done" : "") + '"></span>';
        });
        h += "</div>";
        return h;
      }

      function controlsHtml(eff) {
        var Y = eff.length, last = stepIndex === Y - 1;
        var pct = Math.round(((stepIndex + 1) / Y) * 100);
        var nextLabel, nextDisabled = false;
        if (!last) nextLabel = "下一步 →";
        else if (active < DATA.length - 1) nextLabel = "下一個：" + esc(DATA[active + 1].code || DATA[active + 1].name) + " →";
        else { nextLabel = "已完成 ✓"; nextDisabled = true; }
        return '<div class="wiz-controls">' +
          '<button class="btn btn-sm btn-ghost' + (stepIndex === 0 ? " btn-disabled" : "") + '" id="stepPrev">← 上一步</button>' +
          '<div class="wiz-progress"><div class="wiz-progress-bar" style="width:' + pct + '%"></div></div>' +
          '<span class="wiz-count">步驟 ' + (stepIndex + 1) + " / " + Y + "</span>" +
          '<button class="btn btn-sm btn-primary' + (nextDisabled ? " btn-disabled" : "") + '" id="stepNext">' + nextLabel + "</button>" +
          "</div>";
      }

      function renderWizard() {
        var p = DATA[active];
        var bt = findBranchTemplate(p);
        // 從搜尋跳過來、目標在「選擇情境之後」的共用步驟：選好情境後自動帶到該步驟
        if (pendingJump && pendingJump.proc === active && bt && branchState[bt.step.branch.stateKey]) {
          stepIndex = tailEffIndex(p, pendingJump.raw);
          pendingJump = null;
        }
        if (bt && stepIndex === bt.index && !branchState[bt.step.branch.stateKey]) {
          renderGate(p, bt.step, bt.index);
          var gs = pendingJump && pendingJump.proc === active && document.querySelector("#wizard .gate-screen");
          if (gs) gs.insertAdjacentHTML("afterbegin", '<div class="search-jump-note">🔎 你搜尋的「' + esc(pendingJump.title) + '」位於選擇情境之後，請先選擇情境，選好後會自動帶你到該步驟。</div>');
          return;
        }
        var eff = getEffectiveSteps(p);
        var Y = eff.length;
        if (stepIndex > Y - 1) stepIndex = Y - 1;
        if (stepIndex < 0) stepIndex = 0;
        var w = document.getElementById("wizard");
        var h = railHtml(eff) + renderStepCard(p, eff[stepIndex], stepIndex) + controlsHtml(eff);
        // 結果區塊已依需求移除，不再顯示
        w.innerHTML = h;
        if (pendingHighlight) { var ph = pendingHighlight; pendingHighlight = null; highlightIn(w, ph, true); }

        w.querySelectorAll(".wiz-dot").forEach(function (d) {
          d.addEventListener("click", function () { setStep(+d.dataset.s); });
        });
        w.querySelectorAll(".branch-back-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            delete branchState[btn.dataset.statekey];
            gateQMode = false; gateQTrail = [GATE_TREE]; gateQAnswers = []; gatePendingAns = null;
            if (bt) stepIndex = bt.index;
            renderWizard();
          });
        });
        var sp = document.getElementById("stepPrev");
        if (sp && stepIndex > 0) sp.addEventListener("click", function () { setStep(stepIndex - 1); });
        var sn = document.getElementById("stepNext");
        if (sn) sn.addEventListener("click", function () {
          if (stepIndex < Y - 1) setStep(stepIndex + 1);
          else if (active < DATA.length - 1) select(active + 1);
        });
      }

      function render() {
        var p = DATA[active];
        if (!p) {
          content.setAttribute("data-tone", "");
          content.innerHTML = '<div class="landing">' +
            '<div class="landing-icon">📘</div>' +
            "<h1>歡迎使用系統操作流程逐步導覽</h1>" +
            "<p>請從左側選單選擇一個系統或項目，開始查看操作教學；也可以用上方搜尋欄，直接搜尋步驟或欄位名稱。</p>" +
            "</div>";
          return;
        }
        content.setAttribute("data-tone", toneFor(p));
        var noSteps = !p.steps || !p.steps.length;
        var stepHintEl = document.getElementById("stepHint");
        if (stepHintEl) stepHintEl.style.display = noSteps ? "none" : "";
        var h = "";
        h += '<div class="breadcrumbs text-sm opacity-70 py-0"><ul>' +
          "<li>" + esc(p.group) + (p.category ? '</li><li>' + esc(p.category) : "") + '</li><li class="text-prim font-medium">' + esc(p.code || p.name) + "</li></ul></div>";
        h += '<div class="flex flex-wrap items-center gap-2.5 mt-1">' +
          '<h1 class="text-2xl font-bold leading-tight">' + esc(p.name) + "</h1>" +
          (p.code ? '<span class="badge badge-primary badge-lg font-mono">' + esc(p.code) + "</span>" : "") +
          (p.pending ? '<span class="badge badge-sm badge-ghost">教學建置中</span>' : "") +
          "</div>";
        h += '<p class="opacity-80 mt-2 max-w-3xl text-[0.95rem]">' + esc(p.summary) + "</p>";

        if (p.menuPath) {
          var isNavPath = String(p.menuPath).indexOf(">") !== -1;
          var menuPathText = String(p.menuPath).split(">").map(function (s) { return s.trim(); }).join(" › ");
          var metaIcon = isNavPath
            ? '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
            : '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/><rect x="13" y="13" width="8" height="8" rx="1.6"/></svg>';
          h += '<div class="page-meta">' +
            metaIcon +
            '<span class="page-meta-label">' + (isNavPath ? "路徑" : "功能磚") + "</span>" +
            "<span>" + esc(menuPathText) + "</span>" +
            "</div>";
        }

        var mediaHtml = "";
        if (p.images && p.images.length) {
          mediaHtml = '<div class="mt-4 flex flex-col gap-3">' + p.images.map(function (img) {
            var isVideo = /^data:video\//.test(img.src) || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(img.src);
            var media = isVideo
              ? '<video src="' + img.src + '" class="w-full block" autoplay loop muted playsinline controls></video>'
              : '<img src="' + img.src + '" alt="' + esc(img.caption || p.name) + '" class="w-full block" />';
            return '<figure class="border border-base-300 rounded-box overflow-hidden bg-base-100">' +
              media +
              (img.caption ? '<figcaption class="text-xs opacity-60 px-3 py-2 border-t border-base-300">' + esc(img.caption) + "</figcaption>" : "") +
              "</figure>";
          }).join("") + "</div>";
        }

        if (noSteps) {
          h += mediaHtml;
          if (p.pending) {
            h += '<div class="card bg-base-100 border border-base-300 shadow-sm mt-4"><div class="card-body p-4 gap-1">' +
              '<div class="flex items-center gap-2 text-sm font-medium"><span>🚧</span><span>此項目的操作教學尚未建置</span></div>' +
              '<p class="opacity-70 text-sm mt-1">目前僅先建立項目位置，內容將於後續補充。</p>' +
              "</div></div>";
          }
          content.innerHTML = h;
          activateVideos();
          return;
        }

        if (p.prerequisites && p.prerequisites.length) {
          h += '<div class="prereq-block mt-4">' +
            '<div class="prereq-label">開始前</div>' +
            '<ul class="prereq">' +
            p.prerequisites.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
        }

        var stepCountLabel = findBranchTemplate(p) ? "依情境而定" : (p.steps.length + " 個步驟");
        h += '<div class="flex items-center gap-2 mt-7 mb-3">' +
          '<h2 class="text-lg font-bold">逐步操作</h2>' +
          '<span class="badge badge-ghost badge-sm">' + esc(stepCountLabel) + "</span></div>";
        h += '<div id="wizard"></div>';
        h += mediaHtml;

        content.innerHTML = h;
        renderWizard();
        activateVideos();
      }

      function activateVideos() {
        content.querySelectorAll("video").forEach(function (v) {
          v.muted = true;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        });
      }

      function closeSidebar() { sidebar.classList.remove("open"); backdrop.classList.remove("show"); }

      function setStep(i) {
        var p = DATA[active];
        if (i < 0 || i > getEffectiveSteps(p).length - 1) return;
        stepIndex = i;
        renderWizard();
        var w = document.getElementById("wizard");
        if (w) w.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function select(i) {
        if (i < 0 || i >= DATA.length) return;
        active = i; stepIndex = 0;
        pendingJump = null; pendingHighlight = null;
        gateQMode = false; gateQTrail = [GATE_TREE]; gateQAnswers = []; gatePendingAns = null;
        branchState = {};
        buildSidebar();
        render();
        closeSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function goHome() {
        active = -1; stepIndex = 0;
        pendingJump = null; pendingHighlight = null;
        buildSidebar();
        render();
        closeSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.sapGuide = { goHome: goHome }; // 給 ui-themes/update-notice.js 的「更新紀錄」頁使用


      // ---------- 全站搜尋（頂欄搜尋欄）----------
      // 搜尋範圍：流程名稱／分類／摘要／開始前須知、每個步驟的標題、說明、欄位（名稱＋填法＋備註）與提示，
      // 以及請購情境（V／K／U／Z）各自的欄位與延伸步驟、頂欄「常用連結」裡的參考資料。
      // 點選結果會直接跳到該流程的對應步驟（必要時自動帶入情境），並在畫面上以螢光標出搜尋字詞。
      // 資料來源就是上方的 DATA，之後新增流程或修改內容，搜尋會自動涵蓋，不需另外維護。
      var searchIndex = [];

      function plain(t) { return String(t == null ? "" : t).replace(/\*\*|`/g, "").replace(/\s+/g, " ").trim(); }
      function fieldParts(fields) {
        return (fields || []).filter(function (f) { return f.name; }).map(function (f) {
          var ex = f.ex ? " " + plain(String(f.ex).replace(/\[\[(?:c\d|s):([^\]]+)\]\]/g, "$1")) : "";
          return { text: "【" + plain(f.name) + "】" + plain(f.value) + ex + (f.note ? "：" + plain(f.note) : ""), w: 3 };
        });
      }
      function stepParts(s) {
        var parts = [{ text: plain(s.title), w: 5, isTitle: true }];
        if (s.body) parts.push({ text: plain(s.body), w: 2 });
        parts = parts.concat(fieldParts(s.fields));
        if (s.tip) parts.push({ text: plain(s.tip), w: 1 });
        return parts;
      }
      function buildSearchIndex() {
        searchIndex = [];
        DATA.forEach(function (p, i) {
          var procParts = [{ text: plain(p.name), w: 6, isTitle: true }];
          if (p.code) procParts.push({ text: plain(p.code), w: 6 });
          if (p.category) procParts.push({ text: plain(p.category), w: 2 });
          if (p.menuPath) procParts.push({ text: plain(p.menuPath), w: 2 });
          if (p.summary) procParts.push({ text: plain(p.summary), w: 2 });
          (p.prerequisites || []).forEach(function (x) { procParts.push({ text: plain(x), w: 1 }); });
          if (p.outcome) procParts.push({ text: plain(p.outcome), w: 1 });
          searchIndex.push({ kind: "proc", i: i, title: p.name, loc: p.category || p.group || "", parts: procParts });

          var bt = null;
          (p.steps || []).forEach(function (s, k) {
            if (s.branch) {
              bt = { index: k, step: s };
              var baseParts = stepParts(s);
              if (s.branch.prompt) baseParts.push({ text: plain(s.branch.prompt), w: 1 });
              searchIndex.push({ kind: "base", i: i, raw: k, title: s.title, loc: "步驟 " + (k + 1) + " · 各情境共用欄位", parts: baseParts });
              s.branch.options.forEach(function (o) {
                var optName = o.title || o.label;
                var oParts = [{ text: plain(o.label || o.title), w: 5, isTitle: true }];
                if (o.desc) oParts.push({ text: plain(o.desc), w: 2 });
                if (o.body) oParts.push({ text: plain(o.body), w: 2 });
                oParts = oParts.concat(fieldParts(o.fields));
                if (o.tip) oParts.push({ text: plain(o.tip), w: 1 });
                searchIndex.push({ kind: "opt", i: i, raw: k, key: o.key, stateKey: s.branch.stateKey, title: s.title,
                  loc: "步驟 " + (k + 1) + " · " + optName, tone: o.tone, parts: oParts });
                (o.extraSteps || []).forEach(function (x, j) {
                  searchIndex.push({ kind: "extra", i: i, raw: k, extra: j, key: o.key, stateKey: s.branch.stateKey, title: x.title,
                    loc: "步驟 " + (k + 2 + j) + " · " + optName, tone: o.tone, parts: stepParts(x) });
                });
              });
            } else {
              searchIndex.push({ kind: bt ? "tail" : "step", i: i, raw: k, title: s.title,
                loc: bt ? "選擇情境後 · 各情境共用" : "步驟 " + (k + 1), parts: stepParts(s) });
            }
          });
        });
        // 頂欄「常用連結」裡的項目（稅碼對照表、差旅報支Excel範本、SAP 系統入口…），直接沿用選單本身的連結
        document.querySelectorAll(".topmenu-panel a").forEach(function (a) {
          var name = plain(a.textContent);
          var sec = a.closest("details");
          var secName = sec ? plain(sec.querySelector("summary").textContent) : "常用連結";
          searchIndex.push({ kind: "ref", el: a, title: name, loc: secName, parts: [{ text: name, w: 6, isTitle: true }, { text: secName, w: 1 }] });
        });
        searchIndex.forEach(function (e) {
          e.hay = e.parts.map(function (x) { return x.text.toLowerCase(); });
        });
      }

      // ---------- 語意搜尋（類 AI）----------
      // 不用打出完整名稱，用平常的說法、整句問題也找得到：
      // 1. 先拿掉「怎麼、如何、要、哪個…」這類問句用語；
      // 2. 把句子拆成詞（用下方同義詞表＋平台裡的欄位名稱、流程名稱當字典）；
      // 3. 每個詞連同它的同義詞一起比對（例：「報帳」也會找「請款、報支」）；
      // 4. 依「命中幾個概念、命中在標題還是內文、是原詞還是同義詞」排序。
      // 想讓某個說法也找得到：在 SYN 加一組同義詞即可（同一組裡的詞互通）。
      var SYN = [
        ["請款", "報支", "報帳", "報銷", "核銷", "請錢", "代墊", "墊款", "報"],
        ["差旅", "出差", "旅費", "高鐵", "交通", "交通費", "車資", "計程車", "火車", "住宿", "機票", "油資"],
        ["發票", "憑證", "收據", "單據"],
        ["請購", "採購", "購買", "買", "下單", "訂購", "請購單"],
        ["固定資產", "列管", "資產", "設備", "電腦", "筆電", "機台", "螢幕"],
        ["收貨", "驗收", "入庫", "到貨", "收料", "過帳"],
        ["請假", "休假", "假單", "特休", "病假", "事假", "補休", "假別"],
        ["代理人", "代理", "職務代理", "代理人員"],
        ["稅", "稅額", "稅碼", "營業稅", "稅基", "未稅", "含稅", "5%"],
        ["金額", "價格", "價錢", "單價", "總金額", "費用金額", "多少錢"],
        ["附件", "上傳", "附檔", "檔案", "電子檔"],
        ["列印", "印", "印出", "封面", "pdf", "匯出", "另存"],
        ["簽核", "審核", "核准", "電簽", "簽名", "主管", "核發", "送審"],
        ["我的最愛", "最愛", "捷徑", "功能磚", "常用"],
        ["主題", "外觀", "顏色", "深色", "佈景"],
        ["料號", "物料", "品號", "產品", "物料主檔"],
        ["供應商", "廠商"],
        ["委外", "服務", "外包", "清潔", "不需收貨"],
        ["交貨日期", "付款日期", "發票日期", "日期"],
        ["欄位", "表格", "配置", "調整配置", "顯示欄位", "欄寬"],
        ["excel", "範本", "表單", "xlsx", "報支單"],
        ["人資", "交付人資", "人事"],
        ["財務", "繳交財務", "財會"],
        ["新增", "建立", "開單", "建檔"]
      ];
      var STOP = ["請問", "請教", "我要", "我想", "想要", "想問", "如何", "怎麼樣", "怎麼", "怎樣", "要怎麼", "該怎麼", "應該", "可以", "能不能", "是否", "哪裡", "在哪", "哪個", "哪一個", "哪些", "什麼", "甚麼", "需要", "必須", "要走", "要用", "流程", "步驟", "教學", "一下", "一個", "如果", "的話", "時候", "時", "的", "了", "嗎", "呢", "吧", "啊", "喔", "要", "走", "該", "去", "做", "辦", "跟", "和", "與", "及", "或", "我", "你", "誰", "找", "哪", "?", "？", "!", "！", "。"];
      STOP.sort(function (a, b) { return b.length - a.length; });
      var STOP_RE = new RegExp(STOP.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|"), "gi");
      var SYN_L = SYN.map(function (g) { return g.map(function (w) { return w.toLowerCase(); }); });
      var vocab = [];

      function splitTerms(q) {
        return String(q || "").toLowerCase().split(/[\s,，、]+/).filter(Boolean);
      }
      function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
      function termsRegex(terms) {
        var sorted = terms.slice().sort(function (a, b) { return b.length - a.length; });
        return new RegExp("(" + sorted.map(escRe).join("|") + ")", "gi");
      }
      function hl(text, terms) {
        if (!terms || !terms.length) return esc(text);
        var re = termsRegex(terms);
        return String(text).split(re).map(function (seg, n) {
          return n % 2 ? "<mark>" + esc(seg) + "</mark>" : esc(seg);
        }).join("");
      }

      function buildVocab() {
        var v = {};
        SYN_L.forEach(function (g) { g.forEach(function (w) { v[w] = 1; }); });
        searchIndex.forEach(function (e) {
          if (e.kind === "proc" || e.kind === "ref") v[plain(e.title).toLowerCase()] = 1;
          e.parts.forEach(function (p) {
            var m = p.text.match(/^【([^】]+)】/);
            if (m && m[1].length <= 8) v[m[1].toLowerCase()] = 1;
          });
        });
        vocab = Object.keys(v).sort(function (a, b) { return b.length - a.length; });
      }
      function inIndex(t) {
        for (var i = 0; i < searchIndex.length; i++)
          for (var n = 0; n < searchIndex[i].hay.length; n++)
            if (searchIndex[i].hay[n].indexOf(t) !== -1) return true;
        return false;
      }
      function isSynWord(w) { return SYN_L.some(function (g) { return g.indexOf(w) !== -1; }); }
      // 把一段沒有空格的中文拆成詞；字典裡找不到的部分，用相鄰兩字（雙字詞）去比對
      function segment(chunk) {
        if (/^[a-z0-9%.\-]+$/i.test(chunk) || (chunk.length <= 6 && inIndex(chunk))) return [{ w: chunk }];
        var out = [], rest = "", i = 0;
        function flush() {
          if (rest.length >= 2) {
            var grams = [];
            for (var k = 0; k + 2 <= rest.length; k++) grams.push(rest.slice(k, k + 2));
            out.push({ grams: grams, raw: rest });
          }
          rest = "";
        }
        while (i < chunk.length) {
          var hit = null;
          for (var v = 0; v < vocab.length; v++) {
            var w = vocab[v];
            if ((w.length >= 2 || isSynWord(w)) && chunk.substr(i, w.length) === w) { hit = w; break; }
          }
          if (hit) { flush(); out.push({ w: hit }); i += hit.length; }
          else { rest += chunk.charAt(i); i++; }
        }
        flush();
        return out;
      }
      // 每個詞 → 一個「概念」：原詞（權重 1）＋同義詞（0.8）；拆不出來的部分用雙字詞（0.45）
      function toConcepts(q) {
        var cleaned = String(q || "").toLowerCase().replace(STOP_RE, " ");
        var chunks = splitTerms(cleaned);
        var concepts = [], usedGroups = {};
        chunks.forEach(function (c) {
          segment(c).forEach(function (tok) {
            if (tok.grams) {
              concepts.push({ alts: tok.grams.map(function (g) { return { w: g, f: 0.45 }; }), weak: true });
              return;
            }
            var w = tok.w, alts = [{ w: w, f: 1 }], seen = {};
            seen[w] = 1;
            SYN_L.forEach(function (g, gi) {
              var related = g.indexOf(w) !== -1 || (w.length >= 2 && g.some(function (x) { return x.length >= 2 && w.indexOf(x) !== -1; }));
              if (!related) return;
              if (usedGroups[gi] && g.indexOf(w) !== -1) { alts = null; return; } // 同一組的詞已經出現過，不重複計分
              usedGroups[gi] = 1;
              g.forEach(function (x) { if (alts && !seen[x]) { seen[x] = 1; alts.push({ w: x, f: 0.8 }); } });
            });
            if (alts) concepts.push({ alts: alts, orig: w });
          });
        });
        return concepts;
      }

      function runSearch(q) {
        var res = [];
        res.terms = [];
        res.fuzzy = false;
        var concepts = toConcepts(q);
        if (!concepts.length) {
          // 整句都是問句用語（例如只打「怎麼」），就退回原本的逐字比對
          concepts = splitTerms(q).map(function (t) { return { alts: [{ w: t, f: 1 }], orig: t }; });
        }
        if (!concepts.length) return res;
        // 拆不出來的碎詞（weak）只用來加分，不算在「至少要命中幾個概念」裡
        var nC = concepts.filter(function (c) { return !c.weak; }).length;
        var need = nC <= 1 ? 1 : Math.max(1, Math.ceil(nC * 0.6));
        var anyStrict = false, allTerms = {};
        searchIndex.forEach(function (e, order) {
          var score = 0, matched = 0, extra = 0, strict = true, hits = [];
          concepts.forEach(function (c) {
            var best = 0, bestExact = false, cHits = [];
            c.alts.forEach(function (a) {
              for (var n = 0; n < e.hay.length; n++) {
                if (e.hay[n].indexOf(a.w) === -1) continue;
                var v = e.parts[n].w * a.f;
                if (cHits.indexOf(a.w) === -1) cHits.push(a.w);
                if (v > best) best = v;
                if (a.f === 1) bestExact = true;
              }
            });
            if (c.weak) { if (best) { extra += best; hits = hits.concat(cHits); } return; }
            if (best) { matched++; score += best; hits = hits.concat(cHits); }
            if (!bestExact) strict = false;
          });
          if (nC === 0 ? !extra : matched < need) return;
          if (nC === 0) strict = false;
          if (strict) anyStrict = true;
          var cov = nC ? matched / nC : 1;
          score += extra;
          res.push({ e: e, score: score * cov * cov + (strict ? 1000 : 0), order: order, hits: hits });
        });
        res.sort(function (a, b) { return b.score - a.score || a.order - b.order; });
        var out = res.slice(0, 40);
        out.forEach(function (r) {
          // 只標示較有意義的命中字（有原詞命中時，就不標同一概念裡的雙字詞碎片）
          r.hits = r.hits.filter(function (h, k, arr) { return arr.indexOf(h) === k; });
          r.hits.forEach(function (h) { allTerms[h] = 1; });
        });
        out.terms = Object.keys(allTerms);
        out.fuzzy = out.length > 0 && !anyStrict;
        return out;
      }

      function snippetFor(e, terms) {
        // 優先從「非標題」的內容挑第一段有命中的文字當摘要；只有標題命中時，就顯示該段的說明開頭
        var pick = null, n;
        for (n = 0; n < e.parts.length; n++) {
          if (e.parts[n].isTitle) continue;
          var low = e.hay[n];
          if (terms.some(function (t) { return low.indexOf(t) !== -1; })) { pick = e.parts[n].text; break; }
        }
        if (!pick) {
          for (n = 0; n < e.parts.length; n++) if (!e.parts[n].isTitle) { pick = e.parts[n].text; break; }
          if (!pick) return "";
          return esc(pick.length > 60 ? pick.slice(0, 60) + "…" : pick);
        }
        var lowPick = pick.toLowerCase(), pos = Infinity;
        if (!terms.length) return esc(pick.length > 60 ? pick.slice(0, 60) + "…" : pick);
        terms.forEach(function (t) { var x = lowPick.indexOf(t); if (x !== -1 && x < pos) pos = x; });
        var start = Math.max(0, pos - 22), end = Math.min(pick.length, start + 72);
        return (start > 0 ? "…" : "") + hl(pick.slice(start, end), terms) + (end < pick.length ? "…" : "");
      }

      // 跳轉後在畫面上把搜尋字詞標起來，並捲到第一個命中的位置
      var pendingHighlight = null;
      var pendingJump = null; // 命中「選擇情境之後」的共用步驟時，先停在情境選擇頁，選好情境後再自動帶過去
      function highlightIn(root, terms, reveal) {
        if (!root || !terms || !terms.length) return;
        var re = termsRegex(terms);
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: function (node) {
            var par = node.parentNode;
            if (!node.nodeValue.trim() || !par || par.closest("script,style,svg,mark,.wiz-rail,.wiz-controls,button")) return NodeFilter.FILTER_REJECT;
            re.lastIndex = 0;
            return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        });
        var nodes = [], nd;
        while ((nd = walker.nextNode())) nodes.push(nd);
        var first = null;
        nodes.forEach(function (node) {
          var frag = document.createDocumentFragment();
          node.nodeValue.split(re).forEach(function (seg, n) {
            if (!seg) return;
            if (n % 2) {
              var m = document.createElement("mark");
              m.className = "search-mark";
              m.textContent = seg;
              frag.appendChild(m);
              if (!first) first = m;
            } else frag.appendChild(document.createTextNode(seg));
          });
          node.parentNode.replaceChild(frag, node);
        });
        if (first && reveal) {
          var card = first.closest(".field-card, .tip");
          if (card) {
            card.classList.add("search-flash");
            setTimeout(function () { card.classList.remove("search-flash"); }, 1800);
          }
          setTimeout(function () { first.scrollIntoView({ behavior: "smooth", block: "center" }); }, 30);
        }
      }

      function tailEffIndex(p, raw) {
        var bt = findBranchTemplate(p);
        var opt = bt.step.branch.options.filter(function (o) { return o.key === branchState[bt.step.branch.stateKey]; })[0];
        var extras = (opt && opt.extraSteps) ? opt.extraSteps.length : 0;
        return bt.index + 1 + extras + (raw - bt.index - 1);
      }

      function goToHit(e, terms) {
        if (e.kind === "ref") { e.el.click(); return; }
        select(e.i);
        var p = DATA[e.i];
        if (e.kind === "proc") { highlightIn(content, terms, false); return; }
        if (e.kind === "step" || e.kind === "base") {
          stepIndex = e.raw;
        } else if (e.kind === "opt" || e.kind === "extra") {
          branchState[e.stateKey] = e.key;
          stepIndex = e.raw + (e.kind === "extra" ? 1 + e.extra : 0);
        } else if (e.kind === "tail") {
          stepIndex = findBranchTemplate(p).index;
          pendingJump = { proc: e.i, raw: e.raw, title: e.title };
        }
        pendingHighlight = terms;
        renderWizard();
        var w = document.getElementById("wizard");
        if (w && !document.querySelector("#wizard .search-mark")) w.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      function initSearch() {
        var box = document.getElementById("topSearch");
        var input = document.getElementById("topSearchInput");
        var panel = document.getElementById("topSearchPanel");
        var clearBtn = document.getElementById("topSearchClear");
        if (!box || !input || !panel) return;
        buildSearchIndex();
        buildVocab();
        // 手機寬度空間較窄，提示文字縮短，避免被截斷
        var narrowMq = window.matchMedia("(max-width: 639px)");
        function syncPlaceholder() { input.placeholder = narrowMq.matches ? "搜尋或直接問…" : "搜尋，或直接描述要做的事…"; }
        syncPlaceholder();
        if (narrowMq.addEventListener) narrowMq.addEventListener("change", syncPlaceholder);
        var results = [], activeRes = -1, terms = [];

        function open() { panel.classList.add("show"); input.setAttribute("aria-expanded", "true"); }
        function close() { panel.classList.remove("show"); input.setAttribute("aria-expanded", "false"); activeRes = -1; }
        function paint() {
          var q = input.value.trim();
          box.classList.toggle("has-value", !!input.value);
          if (!q) {
            panel.innerHTML = '<div class="search-empty">可以打關鍵字，也可以直接用平常的說法問<br><span class="search-empty-eg">例如：稅基、成本中心、高鐵費怎麼報、買筆電要走哪個流程</span></div>';
            return;
          }
          results = runSearch(q);
          terms = results.terms;
          if (!results.length) {
            panel.innerHTML = '<div class="search-empty">找不到符合「' + esc(q) + '」的內容</div>';
            return;
          }
          var h = results.fuzzy
            ? '<div class="search-count">沒有完全相符的字詞，以下是相關的結果（' + results.length + (results.length >= 40 ? "+" : "") + " 筆）</div>"
            : '<div class="search-count">共 ' + results.length + (results.length >= 40 ? "+" : "") + " 筆結果</div>";
          h += results.map(function (r, n) {
            var e = r.e;
            var p = e.kind === "ref" ? null : DATA[e.i];
            var tone = e.kind === "ref" ? "" : (e.tone || toneFor(p));
            var head = e.kind === "ref" ? "常用連結" : p.name;
            var showTitle = e.kind !== "proc" && e.kind !== "ref";
            return '<button type="button" class="search-item' + (n === activeRes ? " active" : "") + '" data-n="' + n + '" role="option">' +
              '<span class="search-item-top"><span class="search-dot" data-tone="' + esc(tone) + '"></span>' +
              '<span class="search-proc">' + (e.kind === "proc" || e.kind === "ref" ? hl(e.title, r.hits) : esc(head)) + "</span>" +
              (e.loc ? '<span class="search-loc">' + esc(e.loc) + "</span>" : "") + "</span>" +
              (showTitle ? '<span class="search-item-title">' + hl(e.title, r.hits) + "</span>" : "") +
              (e.kind === "ref" ? "" : '<span class="search-snippet">' + snippetFor(e, r.hits) + "</span>") +
              "</button>";
          }).join("");
          panel.innerHTML = h;
        }
        function setActive(n) {
          var items = panel.querySelectorAll(".search-item");
          if (!items.length) return;
          activeRes = (n + items.length) % items.length;
          items.forEach(function (it, k) { it.classList.toggle("active", k === activeRes); });
          items[activeRes].scrollIntoView({ block: "nearest" });
        }
        function choose(n) {
          var r = results[n];
          if (!r) return;
          close();
          input.blur();
          goToHit(r.e, r.hits.length ? r.hits : terms);
        }

        input.addEventListener("input", function () { activeRes = -1; paint(); open(); });
        input.addEventListener("focus", function () { paint(); open(); });
        input.addEventListener("keydown", function (ev) {
          if (ev.key === "ArrowDown") { ev.preventDefault(); open(); setActive(activeRes + 1); }
          else if (ev.key === "ArrowUp") { ev.preventDefault(); setActive(activeRes - 1); }
          else if (ev.key === "Enter") { ev.preventDefault(); choose(activeRes >= 0 ? activeRes : 0); }
          else if (ev.key === "Escape") {
            ev.stopPropagation();
            if (input.value) { input.value = ""; paint(); } else { close(); input.blur(); }
          }
        });
        // 用 pointerdown 先攔截，避免點結果時輸入框先失焦把面板關掉
        panel.addEventListener("pointerdown", function (ev) { ev.preventDefault(); });
        panel.addEventListener("click", function (ev) {
          var it = ev.target.closest(".search-item");
          if (it) choose(+it.dataset.n);
        });
        input.addEventListener("blur", function () { setTimeout(close, 120); });
        if (clearBtn) {
          clearBtn.addEventListener("pointerdown", function (ev) { ev.preventDefault(); });
          clearBtn.addEventListener("click", function () { input.value = ""; paint(); input.focus(); });
        }
        // 快速鍵：「/」或 Ctrl／⌘＋K 聚焦搜尋欄
        document.addEventListener("keydown", function (ev) {
          var tag = (ev.target && ev.target.tagName) || "";
          var typing = tag === "INPUT" || tag === "TEXTAREA" || (ev.target && ev.target.isContentEditable);
          if ((ev.key === "k" || ev.key === "K") && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); input.focus(); input.select(); }
          else if (ev.key === "/" && !typing && !ev.ctrlKey && !ev.metaKey && !ev.altKey) { ev.preventDefault(); input.focus(); input.select(); }
        });
      }

      initSearch();

      // 答案卷：點有 ⓘ 的列，展開／收起填寫規則
      content.addEventListener("click", function (e) {
        var row = e.target.closest && e.target.closest(".as-row.has-why");
        if (row) row.classList.toggle("open");
      });

      document.getElementById("brandHome").addEventListener("click", goHome);

      // 常用連結選單裡的稅碼對照表：改成跟「查看範例」共用同一套彈窗，不再另開分頁；
      // 之後若有其他參考資料要加進「常用參考資料」，都比照這裡直接呼叫 openMediaModal。
      var taxCodeRefLink = document.getElementById("taxCodeRefLink");
      if (taxCodeRefLink) taxCodeRefLink.addEventListener("click", function (e) {
        e.preventDefault();
        openMediaModal("稅碼對照表", [{ src: taxCodeRefLink.getAttribute("href"), caption: "" }]);
      });

      document.getElementById("hamburger").addEventListener("click", function () {
        sidebar.classList.toggle("open");
        backdrop.classList.toggle("show");
      });
      backdrop.addEventListener("click", closeSidebar);

      document.addEventListener("keydown", function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        var tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        var p = DATA[active];
        if (!p) return;
        if (e.key === "ArrowRight") {
          if (stepIndex < getEffectiveSteps(p).length - 1) setStep(stepIndex + 1);
          else if (active < DATA.length - 1) select(active + 1);
        } else if (e.key === "ArrowLeft") {
          if (stepIndex > 0) setStep(stepIndex - 1);
          else if (active > 0) select(active - 1);
        }
      });

      // ---------- 通用的「參考媒體」彈出視窗：以字卡（一次一張、可切換上一張/下一張）呈現圖片 ----------
      // 通用元件，不只給「範例」用——稅碼對照表等其他參考資料，之後也都走同一套彈窗，
      // 不用另開分頁；只有 1 張圖時會自動隱藏上一張/下一張按鈕。尚未提供圖片時顯示「建置中」佔位卡。
      var mediaModal, mediaModalImg, mediaModalCaption, mediaModalCounter,
        mediaModalPrev, mediaModalNext, mediaModalPending, mediaModalTitle;
      var mediaModalCards = [], mediaModalIndex = 0;

      function ensureMediaModal() {
        if (mediaModal) return mediaModal;
        mediaModal = document.createElement("div");
        mediaModal.className = "example-modal-overlay";
        mediaModal.setAttribute("role", "dialog");
        mediaModal.setAttribute("aria-modal", "true");
        mediaModal.setAttribute("aria-label", "參考資料");

        var card = document.createElement("div");
        card.className = "example-modal";

        var closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "example-modal-close";
        closeBtn.setAttribute("aria-label", "關閉");
        closeBtn.textContent = "✕";

        var header = document.createElement("div");
        header.className = "example-modal-header";
        mediaModalTitle = document.createElement("span");
        mediaModalTitle.className = "example-modal-title";
        mediaModalCounter = document.createElement("span");
        mediaModalCounter.className = "example-modal-counter";
        header.appendChild(mediaModalTitle);
        header.appendChild(mediaModalCounter);

        var body = document.createElement("div");
        body.className = "example-modal-body";
        mediaModalImg = document.createElement("img");
        mediaModalCaption = document.createElement("p");
        mediaModalCaption.className = "example-modal-caption";
        mediaModalPending = document.createElement("div");
        mediaModalPending.className = "example-modal-pending";
        mediaModalPending.innerHTML = "<span>🚧</span><p>內容尚未提供，之後補上</p>";
        body.appendChild(mediaModalImg);
        body.appendChild(mediaModalCaption);
        body.appendChild(mediaModalPending);

        var nav = document.createElement("div");
        nav.className = "example-modal-nav";
        mediaModalPrev = document.createElement("button");
        mediaModalPrev.type = "button";
        mediaModalPrev.className = "example-modal-prev";
        mediaModalPrev.setAttribute("aria-label", "上一張");
        mediaModalPrev.textContent = "← 上一張";
        mediaModalNext = document.createElement("button");
        mediaModalNext.type = "button";
        mediaModalNext.className = "example-modal-next";
        mediaModalNext.setAttribute("aria-label", "下一張");
        mediaModalNext.textContent = "下一張 →";
        nav.appendChild(mediaModalPrev);
        nav.appendChild(mediaModalNext);

        card.appendChild(closeBtn);
        card.appendChild(header);
        card.appendChild(body);
        card.appendChild(nav);
        mediaModal.appendChild(card);
        document.body.appendChild(mediaModal);

        function close() { mediaModal.classList.remove("show"); }
        mediaModal.addEventListener("click", close);
        card.addEventListener("click", function (e) { e.stopPropagation(); });
        closeBtn.addEventListener("click", close);
        document.addEventListener("keydown", function (e) {
          if (!mediaModal.classList.contains("show")) return;
          if (e.key === "Escape") close();
          else if (e.key === "ArrowRight") stepMediaModal(1);
          else if (e.key === "ArrowLeft") stepMediaModal(-1);
        });
        mediaModalPrev.addEventListener("click", function () { stepMediaModal(-1); });
        mediaModalNext.addEventListener("click", function () { stepMediaModal(1); });

        return mediaModal;
      }

      function stepMediaModal(dir) {
        var next = mediaModalIndex + dir;
        if (next < 0 || next > mediaModalCards.length - 1) return;
        mediaModalIndex = next;
        renderMediaModalCard();
      }

      function renderMediaModalCard() {
        var hasCards = mediaModalCards.length > 0;
        mediaModalImg.style.display = hasCards ? "" : "none";
        mediaModalCaption.style.display = hasCards ? "" : "none";
        mediaModalPending.style.display = hasCards ? "none" : "";
        mediaModalPrev.style.visibility = mediaModalCards.length > 1 ? "visible" : "hidden";
        mediaModalNext.style.visibility = mediaModalCards.length > 1 ? "visible" : "hidden";
        if (!hasCards) {
          mediaModalCounter.textContent = "";
          return;
        }
        var c = mediaModalCards[mediaModalIndex];
        var src = typeof c === "string" ? c : c.src;
        var caption = typeof c === "object" && c ? c.caption : "";
        mediaModalImg.src = src;
        mediaModalImg.alt = caption || "";
        mediaModalCaption.textContent = caption || "";
        mediaModalCaption.style.display = caption ? "" : "none";
        mediaModalCounter.textContent = mediaModalCards.length > 1 ? (mediaModalIndex + 1) + " / " + mediaModalCards.length : "";
        mediaModalPrev.disabled = mediaModalIndex === 0;
        mediaModalNext.disabled = mediaModalIndex === mediaModalCards.length - 1;
      }

      // title: 顯示在視窗標題；items: 圖片陣列（{src, caption} 或純字串），可為空陣列（顯示建置中）
      function openMediaModal(title, items) {
        ensureMediaModal();
        mediaModalTitle.textContent = title || "";
        mediaModalCards = items || [];
        mediaModalIndex = 0;
        renderMediaModalCard();
        mediaModal.classList.add("show");
      }

      buildSidebar();
      render();
    })();

    // ---------- 手機版：點擊截圖可放大檢視（獨立功能，不影響其他邏輯與電腦版行為） ----------
    (function () {
      var MOBILE_QUERY = "(max-width: 1023px)";
      var overlay, overlayImg;

      function ensureOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement("div");
        overlay.className = "img-lightbox-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "放大檢視截圖");
        overlayImg = document.createElement("div");
        overlayImg.className = "img-lightbox-stage";
        var closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "img-lightbox-close";
        closeBtn.setAttribute("aria-label", "關閉放大檢視");
        closeBtn.textContent = "✕";
        overlay.appendChild(overlayImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        function close() {
          overlay.classList.remove("show");
          overlayImg.innerHTML = "";
        }
        overlay.addEventListener("click", close);
        closeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          close();
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") close();
        });
        return overlay;
      }

      document.addEventListener("click", function (e) {
        var img = e.target.closest && e.target.closest(".shot-img");
        if (!img) return;
        // 2026-10-19：電腦版也可點擊放大；有平台標示的截圖連同標示一起放大
        ensureOverlay();
        var wrap = img.closest(".shot-wrap");
        var node;
        if (wrap) {
          node = wrap.cloneNode(true);
          // 放大檢視時沿用頁面上的標示顏色（各流程的主題色）
          var tone = getComputedStyle(wrap).getPropertyValue("--story-tone");
          if (tone) node.style.setProperty("--story-tone", tone.trim());
        } else {
          node = document.createElement("img");
          node.src = img.currentSrc || img.src;
          node.alt = img.alt || "";
        }
        overlayImg.innerHTML = "";
        overlayImg.appendChild(node);
        overlay.classList.add("show");
      });
    })();
