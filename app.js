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
      function toneFor(p) { return (p && CATEGORY_TONE[p.category]) || ""; }

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
          html += '<li class="menu-title px-2 pt-2 pb-1 text-[0.68rem] tracking-wide">' + esc(g.name) + "</li>";
          g.cats.forEach(function (cat) {
            var tone = CATEGORY_TONE[cat.name] || "";
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
        return images.map(function (src) {
          return '<figure class="shot"><img src="' + src + '" alt="' + esc(title) + '" class="shot-img" /></figure>';
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

      function renderFieldsTable(fields) {
        if (!fields || !fields.length) return "";
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

        h += '<div class="collapse collapse-arrow gate-diagram-ref mt-4">' +
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
          if (!opt.overrideFields) {
            if (baseStep.body) h += '<div class="md text-sm mt-2">' + md(baseStep.body) + "</div>";
            h += renderFieldsTable(baseStep.fields);
          }
          if (opt.body) h += '<div class="md text-sm mt-2">' + md(opt.body) + "</div>";
          h += renderFieldsTable(opt.fields);
          if (opt.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(opt.tip) + "</span></div>";
          if (baseStep.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(baseStep.tip) + "</span></div>";
        } else if (s.showIf) {
          var match = branchState[s.showIf.stateKey] === s.showIf.equals;
          if (!match) {
            h += '<div class="text-sm opacity-60 italic">' + esc(s.elseBody || "此步驟不適用於您所選擇的情境，可直接點擊「下一步」繼續。") + "</div>";
            showShot = false;
          } else {
            h += '<div class="md text-sm">' + md(s.body) + "</div>";
            h += renderFieldsTable(s.fields);
            if (s.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(s.tip) + "</span></div>";
          }
        } else {
          h += '<div class="md text-sm">' + md(s.body) + "</div>";
          h += renderFieldsTable(s.fields);
          if (s.tip) h += '<div class="tip"><span class="tip-ico">💡</span><span>' + esc(s.tip) + "</span></div>";
        }

        if (showShot) h += renderShot(p, s, idx);
        if (s.attachments && s.attachments.length) {
          h += '<div class="flex flex-col gap-2">' + s.attachments.map(function (a) {
            return '<a href="' + a.url + '" download class="attachment-chip">' +
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
        if (bt && stepIndex === bt.index && !branchState[bt.step.branch.stateKey]) {
          renderGate(p, bt.step, bt.index);
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
            "<p>請從左側選單選擇一個系統或項目，開始查看操作教學。</p>" +
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
        gateQMode = false; gateQTrail = [GATE_TREE]; gateQAnswers = []; gatePendingAns = null;
        branchState = {};
        buildSidebar();
        render();
        closeSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function goHome() {
        active = -1; stepIndex = 0;
        buildSidebar();
        render();
        closeSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      document.getElementById("brandHome").addEventListener("click", goHome);

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

      buildSidebar();
      render();
    })();
