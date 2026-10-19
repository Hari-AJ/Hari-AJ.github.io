/*
  Pixel Quest engine. Renders the sections from window.CONTENT and runs
  the world map: a walking avatar, a trail that lights up behind it,
  levels that clear as it passes, and a typed dialog for each level.
  No dependencies, no build step.
*/
(function () {
  "use strict";

  var C = window.CONTENT;
  if (!C) return;

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var hasIO = "IntersectionObserver" in window;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function emailAddress() { return C.email.user + "@" + C.email.domain; }

  /* ───────────────── 1. Sections rendered from CONTENT ───────────────── */

  function chip(text) { return el("span", "chip", "★ " + text); }

  function renderQuestLog() {
    var root = $("quest-log");
    if (!root) return;
    C.worlds.forEach(function (w) {
      var levels = C.levels.filter(function (l) { return l.world === w.id; });
      if (!levels.length) return;
      var block = el("article", "world reveal");
      var head = el("div", "world-head");
      head.style.background = w.color;
      head.appendChild(el("span", "world-name", "WORLD " + w.id + " · " + w.name));
      head.appendChild(el("span", "world-org", [w.org, w.when].filter(Boolean).join(" · ")));
      block.appendChild(head);

      var grid = el("div", "world-grid");
      levels.forEach(function (l) {
        var card = el("div", "card");
        var ch = el("div", "card-head");
        ch.appendChild(el("span", "code", l.code));
        ch.appendChild(el("h3", "card-title", l.title));
        card.appendChild(ch);
        card.appendChild(el("p", null, l.text));
        var chips = el("div", "chips");
        l.loot.forEach(function (t) { chips.appendChild(chip(t)); });
        card.appendChild(chips);
        grid.appendChild(card);
      });
      block.appendChild(grid);

      if (C.sideQuests && C.sideQuests.world === w.id) {
        var sq = el("div", "side-quests");
        sq.appendChild(el("h4", null, C.sideQuests.title));
        var ul = el("ul");
        C.sideQuests.items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        sq.appendChild(ul);
        block.appendChild(sq);
      }
      root.appendChild(block);
    });
  }

  function renderAchievements() {
    var root = $("achievement-grid");
    if (!root) return;
    C.achievements.forEach(function (a, i) {
      var card = el("div", "ach reveal");
      card.style.transitionDelay = (i % 4) * 0.08 + "s";
      card.appendChild(el("span", "ach-flag", "★ UNLOCKED"));
      var num = el("span", "ach-num", a.pre + a.num + a.post);
      num.dataset.pre = a.pre;
      num.dataset.num = a.num;
      num.dataset.post = a.post;
      card.appendChild(num);
      card.appendChild(el("span", "ach-label", a.label));
      root.appendChild(card);
    });
  }

  function renderInventory() {
    var root = $("inventory-panel");
    if (!root) return;
    C.inventory.forEach(function (g) {
      var group = el("div", "inv-group");
      var head = el("div", "inv-head");
      head.appendChild(el("span", "inv-slot", g.slot));
      head.appendChild(el("span", "inv-plain", g.plain));
      group.appendChild(head);
      var slots = el("div", "slots");
      g.items.forEach(function (t) { slots.appendChild(el("span", "slot", t)); });
      group.appendChild(slots);
      root.appendChild(group);
    });
  }

  function renderContact() {
    var addr = emailAddress();
    var href = "mailto:" + addr + (C.emailSubject ? "?subject=" + encodeURIComponent(C.emailSubject) : "");
    var btn = $("email-btn");
    if (btn) btn.href = href;
    var line = $("email-line");
    if (line) {
      line.appendChild(document.createTextNode("or write to "));
      var a = el("a", null, addr);
      a.href = href;
      line.appendChild(a);
    }
    var cv = $("resume-btn");
    if (cv && C.resume) cv.href = C.resume;
  }

  /* ───────────────── 2. Title screen ───────────────── */

  function renderStars() {
    var root = $("stars");
    if (!root) return;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 34; i++) {
      var s = el("span", "star");
      var size = rnd() > 0.6 ? 3 : 2;
      s.style.left = (rnd() * 100).toFixed(2) + "%";
      s.style.top = (rnd() * 100).toFixed(2) + "%";
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.animationDelay = (rnd() * 2.6).toFixed(2) + "s";
      root.appendChild(s);
    }
  }

  function dropTitle() {
    var h = $("title");
    if (!h || reduced) return;
    var lines = ["HARI", "KRISHNAN"];
    h.textContent = "";
    var k = 0;
    lines.forEach(function (line, li) {
      for (var i = 0; i < line.length; i++) {
        var s = el("span", "drop", line[i]);
        s.setAttribute("aria-hidden", "true");
        s.style.animationDelay = (0.15 + k * 0.06).toFixed(2) + "s";
        h.appendChild(s);
        k++;
      }
      if (li < lines.length - 1) h.appendChild(document.createElement("br"));
    });
  }

  /* ───────────────── 3. The world map ───────────────── */

  // Road waypoints (map pixels). Corners are waypoints too, so the avatar
  // walks along the road instead of cutting across.
  var PATH = [[90, 470], [260, 470], [260, 330], [400, 330], [600, 330], [600, 460], [760, 460], [760, 250], [880, 250], [960, 250], [960, 120]];
  // One stop per level: which waypoint it sits on, and where its code tag goes.
  var STOPS = [
    { wp: 0, tag: [74, 488] }, { wp: 1, tag: [244, 488] }, { wp: 2, tag: [212, 344] },
    { wp: 3, tag: [384, 348] }, { wp: 4, tag: [552, 346] }, { wp: 6, tag: [744, 480] },
    { wp: 7, tag: [712, 270] }, { wp: 8, tag: [900, 214] }, { wp: 10, tag: [914, 128] }
  ];
  var MAP_W = 1040, MAP_H = 560;

  // The avatar: a 10 × 12 pixel sprite drawn with box-shadows.
  var SPRITE = ["...CCCC...", "..CCCCCCC.", "..HSSSSH..", "..SSESES..", "..SSSSSS..", "...SSSS...",
                "..AAAAAA..", ".AAAAAAAA.", ".SAAAAAAS.", "..BBBBBB..", "..BB..BB..", "..DD..DD.."];
  var PALETTE = { C: "#FFD23F", H: "#2B1B14", S: "#C68A5B", E: "#1A1020", A: "#3D7BFF", B: "#2B2F4A", D: "#1A1020" };
  function spriteShadow(px) {
    var out = [];
    SPRITE.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) {
        if (row[c] !== ".") out.push(c * px + "px " + r * px + "px 0 0 " + PALETTE[row[c]]);
      }
    });
    return out.join(", ");
  }

  var LEVELS = C.levels.slice(0, STOPS.length);
  var LAST = LEVELS.length - 1;
  var NOW = Math.min(typeof C.nowLevel === "number" ? C.nowLevel : LAST - 1, LAST);

  var cum = [0];
  for (var i = 1; i < PATH.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));
  }
  var TOTAL = cum[cum.length - 1];

  var S = { pos: 0, maxPos: 0, target: 0, level: 0, moving: false, auto: false, face: 1, stepMs: 0, shown: -1 };
  var timers = { step: null, auto: null, intro: null };
  var introDone = false;
  var scale = 1;

  var map, viewport, sizer, trail, avatar, avatarFlip, stopEls = [];

  function buildMap() {
    map = $("map"); viewport = $("map-viewport"); sizer = $("map-sizer"); trail = $("trail");
    var stopsRoot = $("stops");
    if (!map || !stopsRoot) return false;

    LEVELS.forEach(function (lv, i) {
      var st = STOPS[i];
      var p = PATH[st.wp];
      var tag = el("span", "tag", lv.code);
      tag.setAttribute("aria-hidden", "true");
      tag.style.left = st.tag[0] + "px";
      tag.style.top = st.tag[1] + "px";
      stopsRoot.appendChild(tag);

      var b = el("button", "stop" + (i === LAST ? " final" : ""));
      b.type = "button";
      b.style.left = p[0] - 22 + "px";
      b.style.top = p[1] - 22 + "px";
      b.setAttribute("aria-label", "Level " + lv.code + ": " + lv.title.toLowerCase());
      b.appendChild(el("span", "ring"));
      var tile = el("span", "tile", i === LAST ? "?" : "");
      tile.style.animationDelay = (0.05 * i + 0.1).toFixed(2) + "s";
      b.appendChild(tile);
      b.addEventListener("click", function () { manual(i); });
      stopsRoot.appendChild(b);
      stopEls.push(b);
    });

    avatar = el("div", "avatar");
    avatar.setAttribute("aria-hidden", "true");
    avatar.appendChild(el("span", "avatar-shadow"));
    var body = el("div", "avatar-body");
    avatarFlip = el("div", "avatar-flip");
    var sp = el("span", "sprite");
    sp.style.boxShadow = spriteShadow(3);
    avatarFlip.appendChild(sp);
    body.appendChild(avatarFlip);
    avatar.appendChild(body);
    map.appendChild(avatar);

    var portrait = $("portrait-sprite");
    if (portrait) portrait.style.boxShadow = spriteShadow(6);
    return true;
  }

  function fit() {
    if (!viewport) return;
    var avail = viewport.clientWidth;
    scale = Math.max(0.62, Math.min(1, avail / MAP_W));
    map.style.transform = scale === 1 ? "" : "scale(" + scale + ")";
    sizer.style.width = MAP_W * scale + "px";
    sizer.style.height = MAP_H * scale + "px";
    follow(true);
  }

  // On narrow screens the map scrolls sideways: keep the avatar in view.
  function follow(instant) {
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 2) return;
    var x = PATH[S.pos][0] * scale - viewport.clientWidth / 2;
    viewport.scrollTo({ left: Math.max(0, x), behavior: instant || reduced ? "auto" : "smooth" });
  }

  function render() {
    var p = PATH[S.pos];
    avatar.style.transitionDuration = S.stepMs + "ms";
    avatar.style.left = p[0] - 15 + "px";
    avatar.style.top = p[1] - 40 + "px";
    avatar.classList.toggle("walking", S.moving);
    avatarFlip.classList.toggle("left", S.face < 0);

    if (trail) {
      trail.style.transitionDuration = S.stepMs + "ms";
      trail.style.strokeDashoffset = ((1 - cum[S.maxPos] / TOTAL) * 1000).toFixed(1);
    }

    var cleared = 0;
    stopEls.forEach(function (b, i) {
      var reached = STOPS[i].wp <= S.maxPos;
      var here = !S.moving && i === S.level && STOPS[i].wp === S.pos;
      if (reached) cleared++;
      b.classList.toggle("cleared", reached);
      b.classList.toggle("here", here);
      if (here) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });

    var lv = LEVELS[S.level];
    $("hud-world").textContent = lv.code;
    $("hud-cleared").textContent = cleared + "/" + LEVELS.length;
    $("progress").textContent = "LEVEL " + (S.level + 1) + " / " + LEVELS.length;
    $("btn-prev").disabled = S.level === 0;
    $("btn-next").disabled = S.level === LAST;
    $("btn-auto").textContent = S.auto ? "❚❚ PAUSE" : "▶▶ AUTO";
    renderDialog();
  }

  /* dialog with a typewriter effect */
  var typing = { raf: 0, node: null, text: "", done: true };

  function typeInto(node, text) {
    cancelAnimationFrame(typing.raf);
    typing.node = node; typing.text = text; typing.done = false;
    if (reduced) { node.textContent = text; typing.done = true; return; }
    var start = performance.now();
    var caret = el("span", "caret");
    function tick(t) {
      var n = Math.min(text.length, Math.floor((t - start) / 1000 * 170));
      node.textContent = text.slice(0, n);
      if (n < text.length) {
        node.appendChild(caret);
        typing.raf = requestAnimationFrame(tick);
      } else {
        typing.done = true;
      }
    }
    typing.raf = requestAnimationFrame(tick);
  }

  function skipTyping() {
    if (typing.done || !typing.node) return;
    cancelAnimationFrame(typing.raf);
    typing.node.textContent = typing.text;
    typing.done = true;
  }

  function renderDialog() {
    var lv = LEVELS[S.level];
    var world = C.worlds.filter(function (w) { return w.id === lv.world; })[0];
    var travel = $("dlg-travel"), main = $("dlg-main");
    if (S.moving) {
      travel.hidden = false;
      main.hidden = true;
      $("dlg-travel-to").textContent = "→ " + lv.code + " " + lv.title;
      return;
    }
    travel.hidden = true;
    main.hidden = false;
    if (S.shown === S.level) return;
    S.shown = S.level;

    main.classList.toggle("again");
    $("dlg-meta").textContent = [lv.code, world ? "WORLD " + world.id + " · " + world.name : "", lv.when.toUpperCase()].filter(Boolean).join(" · ");
    $("dlg-title").textContent = lv.title;
    typeInto($("dlg-text"), lv.text);
    var loot = $("dlg-loot");
    loot.textContent = "";
    loot.appendChild(el("span", "loot-label", "LOOT"));
    lv.loot.forEach(function (t, k) {
      var c = chip(t);
      c.style.animationDelay = (0.25 + k * 0.12).toFixed(2) + "s";
      loot.appendChild(c);
    });
    $("dlg-live").textContent = "Level " + lv.code + ", " + lv.title.toLowerCase() + ". " + lv.text + " Loot: " + lv.loot.join(", ") + ".";
  }

  /* a little "+1" that floats up when a level is cleared for the first time */
  function pop(i) {
    if (reduced) return;
    var p = PATH[STOPS[i].wp];
    var f = el("span", "fx", i === LAST ? "??? !" : "+1 ★");
    f.setAttribute("aria-hidden", "true");
    f.style.left = p[0] - 18 + "px";
    f.style.top = p[1] - 58 + "px";
    map.appendChild(f);
    setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 1100);
  }

  /* movement */
  function goTo(i) {
    if (i < 0 || i > LAST) return;
    S.level = i;
    S.target = STOPS[i].wp;
    S.shown = -1;
    // Short hops walk at a relaxed pace; long trips speed up so they never drag.
    var trip = Math.abs(cum[S.target] - cum[S.pos]);
    S.msPerPx = trip > 0 ? Math.min(3, Math.max(1.2, 2600 / trip)) : 3;
    if (reduced) {
      S.pos = S.target;
      S.maxPos = Math.max(S.maxPos, S.pos);
      S.stepMs = 0;
      S.moving = false;
      render();
      follow(true);
      arrived();
      return;
    }
    step();
  }

  function step() {
    if (timers.step) return;
    if (S.pos === S.target) {
      S.moving = false;
      render();
      arrived();
      return;
    }
    var next = S.pos + (S.target > S.pos ? 1 : -1);
    var a = PATH[S.pos], b = PATH[next];
    S.stepMs = Math.max(140, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * (S.msPerPx || 3)));
    if (b[0] !== a[0]) S.face = b[0] < a[0] ? -1 : 1;
    var firstVisit = next > S.maxPos;
    S.pos = next;
    if (firstVisit) S.maxPos = next;
    S.moving = true;
    render();
    follow(false);
    if (firstVisit) {
      STOPS.forEach(function (st, k) {
        if (st.wp === next) setTimeout(function () { pop(k); }, S.stepMs);
      });
    }
    timers.step = setTimeout(function () { timers.step = null; step(); }, S.stepMs);
  }

  function arrived() {
    clearTimeout(timers.auto);
    if (!S.auto) return;
    if (S.level < LAST) {
      timers.auto = setTimeout(function () { goTo(S.level + 1); }, 3200);
    } else {
      S.auto = false;
      render();
    }
  }

  function stopTimers() {
    clearTimeout(timers.step); timers.step = null;
    clearTimeout(timers.auto);
    clearTimeout(timers.intro);
  }

  function replay() {
    introDone = true;
    stopTimers();
    S.pos = 0; S.maxPos = 0; S.target = 0; S.level = 0; S.stepMs = 0;
    S.moving = false; S.face = 1; S.auto = true; S.shown = -1;
    render();
    follow(true);
    timers.auto = setTimeout(function () { goTo(1); }, 2600);
  }

  function manual(i) {
    introDone = true;
    S.auto = false;
    clearTimeout(timers.auto);
    clearTimeout(timers.intro);
    goTo(Math.max(0, Math.min(LAST, i)));
  }

  function toggleAuto() {
    introDone = true;
    clearTimeout(timers.intro);
    if (S.auto) {
      S.auto = false;
      clearTimeout(timers.auto);
      render();
      return;
    }
    if (S.level >= LAST) { replay(); return; }
    S.auto = true;
    render();
    if (!S.moving) goTo(S.level + 1);
  }

  function startIntro() {
    if (introDone) return;
    introDone = true;
    timers.intro = setTimeout(function () { goTo(NOW); }, reduced ? 0 : 500);
  }

  function initMap() {
    if (!buildMap()) return;
    fit();
    render();

    $("btn-prev").addEventListener("click", function () { manual(S.level - 1); });
    $("btn-next").addEventListener("click", function () { manual(S.level + 1); });
    $("btn-auto").addEventListener("click", toggleAuto);
    $("btn-replay").addEventListener("click", replay);
    $("dialog-body").addEventListener("click", skipTyping);

    var start = $("press-start");
    if (start) start.addEventListener("click", function () {
      introDone = true;
      clearTimeout(timers.intro);
      setTimeout(replay, reduced ? 0 : 450);
    });

    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); manual(S.level + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); manual(S.level - 1); }
    });

    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(viewport);
    else window.addEventListener("resize", fit);

    // The intro walk starts when the map scrolls into view, so visitors actually see it.
    if (hasIO) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { startIntro(); io.disconnect(); }
        });
      }, { threshold: 0.35 });
      io.observe(viewport);
    } else {
      startIntro();
    }
  }

  /* ───────────────── 4. Scroll reveal & count-up ───────────────── */

  function countUp(node) {
    var pre = node.dataset.pre || "", post = node.dataset.post || "", num = +node.dataset.num;
    if (reduced || !num) { node.textContent = pre + num + post; return; }
    var start = performance.now(), dur = 1200;
    (function tick(t) {
      var k = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      node.textContent = pre + Math.round(num * e) + post;
      if (k < 1) requestAnimationFrame(tick);
    })(start);
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!hasIO || reduced) {
      items.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        var num = en.target.querySelector(".ach-num");
        if (num) countUp(num);
        io.unobserve(en.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ───────────────── boot ───────────────── */

  renderStars();
  dropTitle();
  renderQuestLog();
  renderAchievements();
  renderInventory();
  renderContact();
  initMap();
  initReveal();

  if (window.console && console.log) {
    console.log("%cHi, fellow engineer. Thanks for opening the console. Say hello: " + emailAddress(),
      "font: 12px monospace; color: #FFD23F; background: #141026; padding: 6px 10px;");
  }
})();
