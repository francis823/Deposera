/* Deposera app prototype. Demo only: all data is made up and nothing is saved or sent. */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function eur(value) {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  /* ---------- Icons ---------- */

  var ICON_PATHS = {
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
    camera: '<path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L13 18a2.1 2.1 0 0 1-3-3Z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5M10 15l-6 6"/>',
    file: '<path d="M7 3h7l5 5v13H7Z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    euro: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a4 4 0 1 0 0 7M7 10.5h6M7 13.5h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z"/><circle cx="12" cy="10" r="2.2"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M15 8l2 2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9h8M8 12h5"/>',
    vault: '<rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8v1M12 14v1M8.5 11.5h1M14.5 11.5h1M6 19v2M18 19v2"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5V14M12 17h.01"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || "i") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON_PATHS[name] + "</svg>";
  }

  /* ---------- Illustrated "photos" ---------- */

  function floorBand(y) {
    var lines = "";
    for (var x = -40; x < 340; x += 38) lines += '<path d="M' + x + " " + y + "l" + (x - 150) * 0.35 + " " + (220 - y) + '" stroke="#9c7445" stroke-opacity=".45"/>';
    return '<rect y="' + y + '" width="300" height="' + (220 - y) + '" fill="#c39a68"/>' + lines + '<rect y="' + (y - 6) + '" width="300" height="6" fill="#f6efe1"/>';
  }

  function scene(kind, damaged) {
    var wall = '<rect width="300" height="220" fill="#ebe2cf"/><rect width="300" height="220" fill="url(#light)"/>';
    var body = "";
    if (kind === "window") {
      body = wall + floorBand(176) +
        '<rect x="150" y="28" width="112" height="104" rx="3" fill="#f8f3e8"/><rect x="157" y="35" width="98" height="90" fill="#bfd8c8"/><path d="M206 35v90M157 80h98" stroke="#f8f3e8" stroke-width="5"/>' +
        '<path d="M175 125c4-18 18-30 26-36" stroke="#7fa58f" stroke-width="3" fill="none"/><ellipse cx="60" cy="168" rx="16" ry="5" fill="#000" opacity=".12"/><path d="M52 168h16l-3-22H55Z" fill="#f6efe1"/><path d="M60 146c-10-16 2-34 0-46M60 146c8-14 16-20 14-36" stroke="#4f7d63" stroke-width="3" fill="none"/>' +
        (damaged ? '<path d="M120 60l8 10-4 9 9 11-3 12" stroke="#5b4a35" stroke-width="1.6" fill="none"/>' : "");
    } else if (kind === "wall") {
      body = wall + floorBand(176) + '<rect x="0" y="66" width="300" height="3" fill="#f6efe1"/>' +
        '<rect x="56" y="88" width="64" height="48" rx="2" fill="#f8f3e8" stroke="#cdbb98" stroke-width="2"/><path d="M64 128l16-18 12 12 8-8 14 14" stroke="#9fb7a6" stroke-width="3" fill="none"/>' +
        '<rect x="196" y="120" width="10" height="16" rx="2" fill="#f8f3e8" stroke="#cdbb98"/>' +
        (damaged ? '<ellipse cx="175" cy="104" rx="20" ry="12" fill="#cbbd9f"/><path d="M160 98l12 8-5 10 13 7 6 14M186 96l10-12" stroke="#6e5a40" stroke-width="1.8" fill="none"/><path d="M140 150c10-4 30-2 46 4" stroke="#8a7a62" stroke-width="5" stroke-linecap="round" opacity=".45"/>' : "");
    } else if (kind === "floor") {
      body = '<rect width="300" height="70" fill="#ebe2cf"/><rect y="64" width="300" height="6" fill="#f6efe1"/><polygon points="0,70 300,70 300,220 0,220" fill="#c39a68"/>';
      for (var i = -6; i < 12; i++) body += '<path d="M' + (150 + i * 14) + " 70L" + (150 + i * 60) + ' 220" stroke="#9c7445" stroke-opacity=".5"/>';
      body += '<path d="M40 150c20-3 34-2 52 3M200 120c14-2 26 0 34 4" stroke="#e9d2ad" stroke-width="2" opacity=".7"/>';
    } else if (kind === "door") {
      body = wall + floorBand(186) + '<rect x="104" y="30" width="92" height="156" rx="2" fill="#f8f3e8" stroke="#cdbb98" stroke-width="3"/><rect x="118" y="46" width="64" height="56" rx="2" fill="none" stroke="#ddd0b4" stroke-width="2"/><rect x="118" y="114" width="64" height="58" rx="2" fill="none" stroke="#ddd0b4" stroke-width="2"/><circle cx="183" cy="112" r="5" fill="#b8925a"/>';
    } else if (kind === "kitchen") {
      body = '<rect width="300" height="220" fill="#ebe2cf"/>';
      for (var tx = 0; tx < 300; tx += 30) for (var ty = 20; ty < 100; ty += 20) body += '<rect x="' + (tx + (ty % 40 ? 15 : 0)) + '" y="' + ty + '" width="29" height="19" fill="#f6efe1" stroke="#ddd0b4"/>';
      body += '<rect y="100" width="300" height="12" fill="#3b4a42"/><rect y="112" width="300" height="108" fill="#f3ecdc"/><rect x="92" y="122" width="116" height="90" rx="6" fill="#2a2f2c"/><rect x="104" y="140" width="92" height="56" rx="4" fill="#4b524e"/><rect x="104" y="128" width="92" height="6" rx="3" fill="#8b918d"/>' +
        '<circle cx="112" cy="117" r="4" fill="#cfcfcf"/><circle cx="128" cy="117" r="4" fill="#cfcfcf"/><circle cx="172" cy="117" r="4" fill="#cfcfcf"/><circle cx="188" cy="117" r="4" fill="#cfcfcf"/><path d="M20 140h56M224 140h56M48 140v70M252 140v70" stroke="#ddd0b4" stroke-width="2"/>' +
        (damaged ? '<ellipse cx="130" cy="162" rx="16" ry="9" fill="#8a6a3b" opacity=".75"/><ellipse cx="168" cy="176" rx="12" ry="7" fill="#8a6a3b" opacity=".65"/><ellipse cx="150" cy="150" rx="7" ry="4" fill="#a07c46" opacity=".7"/>' : "");
    } else if (kind === "blind") {
      body = wall + floorBand(186) + '<rect x="70" y="24" width="160" height="134" rx="3" fill="#f8f3e8"/><rect x="78" y="32" width="144" height="118" fill="#bfd8c8"/>';
      for (var sy = 34; sy < 122; sy += 8) {
        var broken = damaged && sy === 82;
        body += broken ? '<path d="M78 ' + sy + "L150 " + (sy + 10) + '" stroke="#e7dcc3" stroke-width="6"/><path d="M160 ' + (sy + 2) + "L222 " + sy + '" stroke="#e7dcc3" stroke-width="6"/>' : '<rect x="78" y="' + sy + '" width="144" height="6" fill="#efe6d2"/>';
      }
      body += '<path d="M214 34v92" stroke="#cdbb98" stroke-width="1.5"/><circle cx="214" cy="130" r="3" fill="#b8925a"/>';
    } else if (kind === "bath") {
      body = '<rect width="300" height="220" fill="#eef1ec"/>';
      for (var bx = 0; bx < 300; bx += 25) for (var by = 0; by < 220; by += 25) body += '<rect x="' + bx + '" y="' + by + '" width="24" height="24" fill="#f6f7f3" stroke="#dbe2dc"/>';
      body += '<rect x="105" y="26" width="90" height="70" rx="8" fill="#cfe0da" stroke="#b9c7c1" stroke-width="3"/><path d="M120 40l20-6M120 52l40-12" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M90 120h120l-14 36H104Z" fill="#fff" stroke="#c9d1cc" stroke-width="2"/><rect x="146" y="104" width="8" height="18" rx="3" fill="#b8925a"/><rect x="140" y="156" width="20" height="64" fill="#e3e9e5"/>';
    }
    return '<svg class="scene" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="light" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".06"/></linearGradient></defs>' + body + "</svg>";
  }

  /* ---------- Data (all made up) ---------- */

  var DEPOSIT = 1500;
  var ADDRESS = "Tulpstraat 12, Utrecht";
  var DATES = {
    received: "28 Aug 2025",
    movein: "1 Sep 2025",
    notesClose: "8 Sep 2025",
    preinspection: "12 Jun 2026",
    keyReturn: "30 Jun 2026",
    pay14: "14 Jul 2026",
    pay30: "30 Jul 2026"
  };

  var STAGES = [
    { id: "movein", label: "Just moved in", when: "3 Sep 2025", step: 0 },
    { id: "tenancy", label: "During the tenancy", when: "15 Feb 2026", step: 1 },
    { id: "preinspection", label: "Before move-out", when: "14 Jun 2026", step: 2 },
    { id: "payout", label: "After key return", when: "2 Jul 2026", step: 3 }
  ];

  var STEPS = ["Move-in", "Tenancy", "Pre-check", "Payout"];

  var ROOMS = [
    { id: "living", name: "Living room", count: 12, photos: [{ kind: "window", label: "Window wall" }, { kind: "floor", label: "Wooden floor" }, { kind: "door", label: "Door to the hall" }, { kind: "wall", label: "Back wall" }] },
    { id: "kitchen", name: "Kitchen", count: 11, photos: [{ kind: "kitchen", label: "Oven", damage: "oven" }, { kind: "window", label: "Kitchen window" }, { kind: "floor", label: "Floor" }] },
    { id: "bedroom", name: "Bedroom", count: 9, photos: [{ kind: "blind", label: "Window blind", damage: "blind" }, { kind: "wall", label: "Bed wall" }, { kind: "floor", label: "Floor" }] },
    { id: "bathroom", name: "Bathroom", count: 9, photos: [{ kind: "bath", label: "Sink and mirror" }, { kind: "door", label: "Bathroom door" }] },
    { id: "hallway", name: "Hallway", count: 7, photos: [{ kind: "wall", label: "Wall by the stairs", damage: "wall" }, { kind: "door", label: "Front door" }, { kind: "floor", label: "Floor" }] }
  ];

  var DAMAGE = [
    { id: "wall", name: "Damaged hallway wall", room: "hallway", photo: 0, cost: 250 },
    { id: "oven", name: "Greasy oven", room: "kitchen", photo: 0, cost: 150 },
    { id: "blind", name: "Broken bedroom blind", room: "bedroom", photo: 0, cost: 60 }
  ];

  var REASONS = ["It was already there at move-in", "It's normal wear", "The cost is too high", "Something else"];

  /* ---------- State ---------- */

  var state = {
    stage: "movein",
    tab: "home",
    route: null,
    pinMode: false,
    pendingPin: null,
    compare: 50,
    notes: {
      "living-1": [{ x: 30, y: 70, text: "Light scratches near the window", by: "Deposera", date: DATES.movein }],
      "bathroom-0": [{ x: 52, y: 22, text: "Small chip in the mirror corner", by: "Deposera", date: DATES.movein }]
    },
    damage: {
      wall: { plan: "self", fixed: true, challenged: false },
      oven: { plan: "landlord", fixed: false, challenged: false },
      blind: { plan: "landlord", fixed: false, challenged: false }
    }
  };

  function stage() {
    return STAGES.filter(function (s) { return s.id === state.stage; })[0];
  }

  function reached(id) {
    var order = STAGES.map(function (s) { return s.id; });
    return order.indexOf(state.stage) >= order.indexOf(id);
  }

  function room(id) {
    return ROOMS.filter(function (r) { return r.id === id; })[0];
  }

  function notesFor(roomId, index) {
    return state.notes[roomId + "-" + index] || [];
  }

  function noteCount(roomId) {
    var r = room(roomId);
    return r.photos.reduce(function (sum, p, i) { return sum + notesFor(roomId, i).length; }, 0);
  }

  function yourNotes() {
    return Object.keys(state.notes).reduce(function (sum, k) {
      return sum + state.notes[k].filter(function (n) { return n.by === "You"; }).length;
    }, 0);
  }

  function totalPhotos() {
    return ROOMS.reduce(function (sum, r) { return sum + r.count; }, 0);
  }

  // Works out what comes back to the tenant, and when.
  function money() {
    var final = state.stage === "payout";
    var deducted = 0;
    var hold = 0;
    DAMAGE.forEach(function (d) {
      var s = state.damage[d.id];
      if (s.challenged) hold += d.cost;
      else if (s.plan === "landlord" || (final && !s.fixed)) deducted += d.cost;
    });
    var days = deducted + hold === 0 ? 14 : 30;
    return { deducted: deducted, hold: hold, back: DEPOSIT - deducted - hold, days: days, date: days === 14 ? DATES.pay14 : DATES.pay30 };
  }

  function openItems() {
    return DAMAGE.filter(function (d) {
      var s = state.damage[d.id];
      return s.plan === "self" && !s.fixed && !s.challenged;
    }).length;
  }

  /* ---------- Shared bits ---------- */

  function header(title, sub, actions) {
    return '<header class="app-head"><div><p class="app-sub">' + sub + '</p><h2 class="app-title" tabindex="-1" data-focus>' + title + "</h2></div>" + (actions || "") + "</header>";
  }

  function backHeader(title, sub) {
    return '<header class="app-head app-head--back"><button class="icon-btn" type="button" data-back aria-label="Back">' + icon("back") + '</button><div><p class="app-sub">' + sub + '</p><h2 class="app-title" tabindex="-1" data-focus>' + title + "</h2></div></header>";
  }

  function progress() {
    var current = stage().step;
    return '<ol class="progress" aria-label="Where you are">' + STEPS.map(function (label, i) {
      var cls = i < current ? "is-done" : i === current ? "is-current" : "";
      var sr = i < current ? " (done)" : i === current ? " (now)" : "";
      return '<li class="' + cls + '"><span class="progress__dot">' + (i < current ? icon("check") : "") + '</span><span class="progress__label">' + label + '<span class="visually-hidden">' + sr + "</span></span></li>";
    }).join("") + "</ol>";
  }

  function chip(text, tone) {
    return '<span class="chip chip--' + (tone || "muted") + '">' + text + "</span>";
  }

  /* ---------- Home ---------- */

  function nextStep() {
    var m = money();
    var map = {
      movein: { icon: "camera", title: "Check your move-in photos", text: "We took " + totalPhotos() + " photos. Add your own notes by " + DATES.notesClose + ", 5 days left.", button: "Review photos", go: "photos" },
      tenancy: { icon: "shield", title: "Nothing to do right now", text: "Your deposit is safe. We'll remind you before the pre-inspection on " + DATES.preinspection + ".", button: "See key dates", go: "records" },
      preinspection: { icon: "wrench", title: DAMAGE.length + " items on your damage list", text: "Fix them yourself before key return on " + DATES.keyReturn + " to keep more of your deposit.", button: "Open damage list", go: "damage" },
      payout: { icon: "euro", title: "Your money is on its way", text: eur(m.back) + " will be paid by " + m.date + ".", button: "See the breakdown", go: "damage" }
    };
    var n = map[state.stage];
    return '<section class="next" aria-labelledby="next-title"><p class="next__label">Next step</p><div class="next__body"><span class="next__icon">' + icon(n.icon) + '</span><div><h3 id="next-title">' + n.title + "</h3><p>" + n.text + '</p></div></div><button class="btn" type="button" data-tab="' + n.go + '">' + n.button + icon("chevron", "i i--sm") + "</button></section>";
  }

  function depositCard() {
    var m = money();
    var payout = state.stage === "payout";
    var line = "In a separate account · €0 fees for you";
    if (state.stage === "preinspection") line = "Estimated back to you: <strong>" + eur(m.back) + "</strong>";
    if (payout) line = "Back to you: <strong>" + eur(m.back) + "</strong> by " + m.date;
    return '<section class="deposit" aria-label="Your deposit"><div class="deposit__top"><span class="deposit__label">Your deposit</span>' +
      (payout ? chip("Paying out", "brass") : chip("Held safely", "brass")) +
      '</div><p class="deposit__amount">' + eur(DEPOSIT) + '</p><p class="deposit__line">' + line + "</p>" + progress() + "</section>";
  }

  function keyDates() {
    var m = money();
    var rows = [
      { label: "Move-in inspection", date: DATES.movein, done: true },
      { label: "Notes window closes", date: DATES.notesClose, done: reached("tenancy") },
      { label: "Pre-inspection", date: DATES.preinspection, done: reached("preinspection") },
      { label: "Key return", date: DATES.keyReturn, done: reached("payout") },
      { label: "Money back", date: m.days === 14 ? DATES.pay14 : DATES.pay30 + " (with repairs)", done: false }
    ];
    return '<section class="block" aria-labelledby="dates-title"><div class="block__head"><h3 id="dates-title">Key dates</h3></div><ul class="dates">' +
      rows.map(function (r) {
        return '<li class="' + (r.done ? "is-done" : "") + '"><span class="dates__mark">' + (r.done ? icon("check") : "") + '</span><span class="dates__label">' + r.label + '</span><span class="dates__date">' + r.date + "</span></li>";
      }).join("") + "</ul></section>";
  }

  function tip() {
    var tips = {
      movein: "Spotted something we missed? Add a note on the exact photo. It protects you at move-out.",
      tenancy: "Something breaks during your stay? Tell your landlord in writing and keep the message.",
      preinspection: "Fixing small things yourself is often cheaper than the landlord's repair company.",
      payout: "Your landlord can report missed damage until " + DATES.pay14 + ". We check every report against our photos."
    };
    return '<aside class="tip"><span class="tip__tag">Tip</span><p>' + tips[state.stage] + "</p></aside>";
  }

  function renderHome() {
    var reminders = REMINDERS[state.stage].length;
    var actions = '<div class="app-head__actions"><button class="icon-btn" type="button" data-sheet="reminders" aria-label="Reminders, ' + reminders + ' new">' + icon("bell") + (reminders ? '<span class="dot-badge">' + reminders + "</span>" : "") +
      '</button><button class="avatar" type="button" data-sheet="profile" aria-label="Your profile">SV</button></div>';
    return header("Hi Sam", esc(ADDRESS), actions) + nextStep() + depositCard() + keyDates() + tip();
  }

  /* ---------- Photos ---------- */

  function notesBanner() {
    if (state.stage === "movein") {
      return '<p class="banner banner--open">' + icon("pin", "i i--sm") + "<span>You can add notes until <strong>" + DATES.notesClose + "</strong>. 5 days left.</span></p>";
    }
    return '<p class="banner">' + icon("check", "i i--sm") + "<span>Notes window closed on " + DATES.notesClose + ". The record is final.</span></p>";
  }

  function renderPhotos() {
    var sub = state.stage === "payout" ? "Move-in and move-out" : "Move-in record";
    var html = header("Photos", sub + " · Taken by Deposera") + notesBanner() + '<ul class="rows">';
    ROOMS.forEach(function (r) {
      var n = noteCount(r.id);
      html += '<li><button class="row" type="button" data-room="' + r.id + '"><span class="thumb">' + scene(r.photos[0].kind, false) + '</span><span class="row__text"><span class="row__title">' + r.name + '</span><span class="row__meta">' + r.count + " photos" + (n ? " · " + n + (n === 1 ? " note" : " notes") : "") + "</span></span>" + icon("chevron", "i i--muted") + "</button></li>";
    });
    return html + "</ul>";
  }

  function renderRoom(id) {
    var r = room(id);
    var html = backHeader(r.name, r.count + " photos · " + DATES.movein) + '<ul class="photo-grid">';
    r.photos.forEach(function (p, i) {
      var n = notesFor(id, i).length;
      html += '<li><button class="photo-tile" type="button" data-photo="' + id + ":" + i + '" aria-label="' + esc(p.label) + (n ? ", " + n + (n === 1 ? " note" : " notes") : "") + '">' + scene(p.kind, false) + '<span class="photo-tile__label">' + esc(p.label) + "</span>" + (n ? '<span class="photo-tile__notes">' + icon("pin", "i i--xs") + n + "</span>" : "") + "</button></li>";
    });
    var more = r.count - r.photos.length;
    html += '<li><button class="photo-tile photo-tile--more" type="button" data-toast="The prototype shows a few photos per room. The full app shows all ' + r.count + '.">+' + more + "<span>more</span></button></li>";
    return html + "</ul>";
  }

  function damageFor(roomId, index) {
    return DAMAGE.filter(function (d) { return d.room === roomId && d.photo === index; })[0];
  }

  function moveOutDamaged(d) {
    if (!d) return false;
    var s = state.damage[d.id];
    return !(s.plan === "self" && s.fixed);
  }

  function renderPhoto(id, index) {
    var r = room(id);
    var p = r.photos[index];
    var notes = notesFor(id, index);
    var canAdd = state.stage === "movein";
    var compare = state.stage === "payout";
    var d = damageFor(id, index);

    var pins = notes.map(function (n, i) {
      return '<span class="pin" style="left:' + n.x + "%;top:" + n.y + '%" aria-hidden="true">' + (i + 1) + "</span>";
    }).join("");

    var viewer;
    if (compare) {
      viewer = '<div class="viewer viewer--compare" style="--pos:' + state.compare + '%"><div class="viewer__layer">' + scene(p.kind, moveOutDamaged(d)) + '</div><div class="viewer__layer viewer__layer--before">' + scene(p.kind, false) + pins + '</div><span class="viewer__handle" aria-hidden="true"></span><span class="viewer__tag viewer__tag--left">Move-in</span><span class="viewer__tag viewer__tag--right">Move-out</span></div>' +
        '<label class="compare-range"><span>Move-in</span><input type="range" min="0" max="100" value="' + state.compare + '" data-compare aria-label="Compare move-in and move-out photos"><span>Move-out</span></label>';
    } else {
      viewer = '<div class="viewer' + (state.pinMode ? " is-pinning" : "") + '" data-viewer>' + scene(p.kind, false) + pins + (state.pinMode ? '<p class="viewer__hint">Tap where the problem is</p>' : "") + "</div>";
    }

    var html = backHeader(esc(p.label), r.name + " · Taken " + DATES.movein + ", 10:14") + viewer;

    if (compare && d) {
      var s = state.damage[d.id];
      html += '<p class="banner ' + (moveOutDamaged(d) ? "banner--warn" : "banner--open") + '">' + icon(moveOutDamaged(d) ? "wrench" : "check", "i i--sm") + "<span>" + (moveOutDamaged(d) ? esc(d.name) + ": " + (s.challenged ? "under review" : "repaired by the landlord's company") : "Fixed by you before key return. Nothing deducted.") + "</span></p>";
    }

    html += '<section class="block" aria-labelledby="notes-title"><div class="block__head"><h3 id="notes-title">Notes</h3><span class="muted">' + notes.length + "</span></div>";
    if (notes.length) {
      html += '<ol class="notes">' + notes.map(function (n, i) {
        return '<li><span class="pin pin--static" aria-hidden="true">' + (i + 1) + '</span><div><p class="notes__text">' + esc(n.text) + '</p><p class="notes__meta">Added by ' + n.by + " · " + n.date + "</p></div></li>";
      }).join("") + "</ol>";
    } else {
      html += '<p class="muted small">No notes on this photo.</p>';
    }
    html += "</section>";

    if (canAdd) {
      html += state.pinMode
        ? '<div class="btn-row"><button class="btn btn--ghost" type="button" data-pin-cancel>Cancel</button><button class="btn" type="button" data-pin-skip>Add without a pin</button></div>'
        : '<button class="btn" type="button" data-pin-start>' + icon("plus", "i i--sm") + "Add a note</button>";
    } else if (!compare) {
      html += '<p class="muted small center">Notes could be added until ' + DATES.notesClose + ".</p>";
    }
    return html;
  }

  /* ---------- Damage ---------- */

  function estimateCard() {
    var m = money();
    var final = state.stage === "payout";
    var pct = (m.back / DEPOSIT) * 100;
    return '<section class="estimate" aria-label="' + (final ? "Final amount" : "Estimate") + '">' +
      '<p class="estimate__label">' + (final ? "Back to you" : "Estimated back to you") + '</p><p class="estimate__amount">' + eur(m.back) + "</p>" +
      '<div class="estimate__bar" aria-hidden="true"><span style="width:' + pct + '%"></span>' + (m.hold ? '<span class="is-hold" style="width:' + (m.hold / DEPOSIT) * 100 + '%"></span>' : "") + "</div>" +
      '<dl class="estimate__grid"><div><dt>Deposit</dt><dd>' + eur(DEPOSIT) + "</dd></div><div><dt>Deducted</dt><dd>" + eur(m.deducted) + "</dd></div>" +
      (m.hold ? "<div><dt>On hold</dt><dd>" + eur(m.hold) + "</dd></div>" : "") +
      "<div><dt>Paid by</dt><dd>" + m.date + "</dd></div></dl>" +
      '<p class="estimate__note">' + (m.days === 14 ? "Nothing deducted, so you're paid within 14 days." : "Something is deducted or on hold, so payment takes up to 30 days.") + "</p></section>";
  }

  function damageItem(d) {
    var s = state.damage[d.id];
    var final = state.stage === "payout";
    var status;
    if (s.challenged) status = chip("Under review", "warn");
    else if (s.plan === "self" && s.fixed) status = chip("Fixed by you", "green");
    else if (s.plan === "self") status = chip(final ? "Not fixed: landlord repairs" : "You'll fix it", final ? "warn" : "brass");
    else status = chip(final ? "Repaired: " + eur(d.cost) : "Landlord repairs", final ? "muted" : "muted");

    var html = '<li class="dmg"><button class="dmg__thumb" type="button" data-photo="' + d.room + ":" + d.photo + '" aria-label="See photo of ' + esc(d.name) + '">' + scene(room(d.room).photos[d.photo].kind, true) + '</button><div class="dmg__main"><p class="dmg__name">' + esc(d.name) + '</p><p class="dmg__meta">' + room(d.room).name + " · " + eur(d.cost) + "</p>" + status + "</div>";

    if (!final && !s.challenged) {
      html += '<div class="dmg__actions"><div class="seg" role="group" aria-label="Who fixes ' + esc(d.name) + '"><button type="button" data-plan="' + d.id + ':self" aria-pressed="' + (s.plan === "self") + '">I\'ll fix it</button><button type="button" data-plan="' + d.id + ':landlord" aria-pressed="' + (s.plan === "landlord") + '">Landlord repairs</button></div>';
      if (s.plan === "self" && !s.fixed) html += '<button class="btn btn--small" type="button" data-fixed="' + d.id + '">' + icon("camera", "i i--sm") + "Mark as fixed</button>";
      html += '<button class="link" type="button" data-challenge="' + d.id + '">Disagree with this item?</button></div>';
    }
    return html + "</li>";
  }

  function renderDamage() {
    if (!reached("preinspection")) {
      return header("Damage", "Pre-inspection list") + '<div class="empty"><span class="empty__icon">' + icon("shield") + '</span><h3>No damage list yet</h3><p>Before you move out, we walk through the home with your landlord on <strong>' + DATES.preinspection + "</strong>. The list will appear here, and you can fix things yourself.</p></div>";
    }
    var final = state.stage === "payout";
    var html = header("Damage", final ? "Final statement" : "From the pre-inspection on " + DATES.preinspection) + estimateCard();
    html += '<section class="block" aria-labelledby="items-title"><div class="block__head"><h3 id="items-title">' + (final ? "What happened" : "Your list") + '</h3><span class="muted">' + DAMAGE.length + ' items</span></div><ul class="dmg-list">' + DAMAGE.map(damageItem).join("") + "</ul></section>";
    if (final) {
      html += '<p class="banner">' + icon("calendar", "i i--sm") + "<span>Your landlord can report missed damage until " + DATES.pay14 + ". None reported so far.</span></p>";
    } else {
      html += '<p class="muted small center">Fix items before key return on ' + DATES.keyReturn + ". We check them at the final inspection.</p>";
    }
    return html;
  }

  /* ---------- Records ---------- */

  function renderRecords() {
    var m = money();
    var events = [
      { date: DATES.received, title: "Deposit received", text: eur(DEPOSIT) + " in a separate account", icon: "vault", show: true },
      { date: DATES.movein, title: "Move-in inspection", text: totalPhotos() + " photos taken by Deposera", icon: "camera", show: true },
      { date: "3 Sep 2025", title: "You added notes", text: yourNotes() + (yourNotes() === 1 ? " note" : " notes") + " on the photos", icon: "pin", show: yourNotes() > 0 },
      { date: DATES.notesClose, title: "Notes window closed", text: "The move-in record is final", icon: "check", show: true, future: !reached("tenancy") },
      { date: DATES.preinspection, title: "Pre-inspection", text: DAMAGE.length + " items on the damage list", icon: "wrench", show: true, future: !reached("preinspection") },
      { date: DATES.keyReturn, title: "Key return check", text: "Move-out photos and final check", icon: "key", show: true, future: !reached("payout") },
      { date: m.date, title: "Money back", text: eur(m.back) + " to you", icon: "euro", show: true, future: true }
    ].filter(function (e) { return e.show; });

    var docs = [
      { name: "Lease agreement", meta: "PDF · 12 pages", show: true },
      { name: "Deposit receipt", meta: "PDF · " + DATES.received, show: true },
      { name: "Move-in report", meta: totalPhotos() + " photos · " + DATES.movein, show: true },
      { name: "Pre-inspection list", meta: DAMAGE.length + " items · " + DATES.preinspection, show: reached("preinspection") },
      { name: "Final statement", meta: eur(m.back) + " back to you", show: reached("payout") }
    ].filter(function (d) { return d.show; });

    var html = header("Records", "Everything, with dates");
    html += '<section class="block" aria-labelledby="log-title"><div class="block__head"><h3 id="log-title">Timeline</h3></div><ol class="log">' + events.map(function (e) {
      return '<li class="' + (e.future ? "is-future" : "") + '"><span class="log__icon">' + icon(e.icon, "i i--sm") + '</span><div><p class="log__title">' + e.title + (e.future ? ' <span class="chip chip--muted">Upcoming</span>' : "") + '</p><p class="log__meta">' + e.date + " · " + e.text + "</p></div></li>";
    }).join("") + "</ol></section>";
    html += '<section class="block" aria-labelledby="docs-title"><div class="block__head"><h3 id="docs-title">Documents</h3></div><ul class="rows">' + docs.map(function (d) {
      return '<li><button class="row" type="button" data-toast="Downloads will work in the full app."><span class="row__icon">' + icon("file") + '</span><span class="row__text"><span class="row__title">' + d.name + '</span><span class="row__meta">' + d.meta + "</span></span>" + icon("download", "i i--muted") + "</button></li>";
    }).join("") + "</ul></section>";
    html += '<button class="btn btn--ghost" type="button" data-toast="Tenant Support would open a chat here in the full app.">' + icon("chat", "i i--sm") + "Contact Tenant Support</button>";
    return html;
  }

  /* ---------- Sheets ---------- */

  var REMINDERS = {
    movein: [{ title: "5 days left to add notes", text: "The notes window closes on " + DATES.notesClose + "." }],
    tenancy: [],
    preinspection: [{ title: "Key return on " + DATES.keyReturn, text: "Fix items on your list before then." }, { title: "Pre-inspection done", text: DAMAGE.length + " items were listed." }],
    payout: [{ title: "Payment on its way", text: "Expected by " + money().date + "." }]
  };

  function remindersSheet() {
    var list = REMINDERS[state.stage];
    if (state.stage === "payout") list = [{ title: "Payment on its way", text: "Expected by " + money().date + "." }];
    return '<h3 id="sheet-title">Reminders</h3>' + (list.length ? '<ul class="reminders">' + list.map(function (r) {
      return "<li>" + icon("bell", "i i--sm") + "<div><strong>" + r.title + "</strong><span>" + r.text + "</span></div></li>";
    }).join("") + "</ul>" : '<p class="muted">Nothing right now. We\'ll remind you before every deadline.</p>') + '<button class="btn" type="button" data-close>Done</button>';
  }

  function profileSheet() {
    return '<div class="profile"><span class="avatar avatar--large" aria-hidden="true">SV</span><div><h3 id="sheet-title">Sam de Vries</h3><p class="muted">Tenant · ' + esc(ADDRESS) + '</p></div></div>' +
      '<ul class="rows"><li><div class="row row--static"><span class="row__icon">' + icon("user") + '</span><span class="row__text"><span class="row__title">Landlord</span><span class="row__meta">J. Bakker, via Utrecht Lettings</span></span></div></li>' +
      '<li><div class="row row--static"><span class="row__icon">' + icon("euro") + '</span><span class="row__text"><span class="row__title">Your fees</span><span class="row__meta">€0. The landlord\'s agency pays our fee.</span></span></div></li>' +
      '<li><button class="row" type="button" data-toast="Settings will be in the full app."><span class="row__icon">' + icon("bell") + '</span><span class="row__text"><span class="row__title">Reminders</span><span class="row__meta">Push and email</span></span>' + icon("chevron", "i i--muted") + "</button></li></ul>" +
      '<a class="btn btn--ghost" href="../index.html">Log out</a>';
  }

  function noteSheet() {
    var chips = ["Scratch", "Stain", "Crack", "Chip", "Already broken"];
    return '<h3 id="sheet-title">Add a note</h3><p class="muted small">Describe what you see. Keep it factual.</p><form class="note-form" data-note-form novalidate>' +
      '<div class="chips" role="group" aria-label="Quick words">' + chips.map(function (c) { return '<button class="chip-btn" type="button" data-chip="' + c + '">' + c + "</button>"; }).join("") + "</div>" +
      '<label class="visually-hidden" for="note-text">Note</label><textarea id="note-text" rows="3" maxlength="120" placeholder="For example: small scratch on the floor by the door" data-note-text></textarea>' +
      '<p class="form-error" data-note-error hidden>Write a short note first.</p>' +
      '<div class="btn-row"><button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Save note</button></div></form>';
  }

  function challengeSheet(id) {
    var d = DAMAGE.filter(function (x) { return x.id === id; })[0];
    return '<h3 id="sheet-title">Disagree with "' + esc(d.name) + '"</h3><p class="muted small">We review our photos, the damage list and the invoice. The ' + eur(d.cost) + " stays on hold until we decide. Everything else is paid on time.</p>" +
      '<form class="challenge-form" data-challenge-form="' + d.id + '" novalidate><fieldset><legend>Why?</legend>' +
      REASONS.map(function (r, i) { return '<label class="radio"><input type="radio" name="reason" value="' + i + '"' + (i === 0 ? " checked" : "") + "><span>" + r + "</span></label>"; }).join("") +
      '</fieldset><div class="btn-row"><button class="btn btn--ghost" type="button" data-close>Cancel</button><button class="btn" type="submit">Send for review</button></div></form>';
  }

  /* ---------- Rendering ---------- */

  var view = $("[data-view]");
  var tabbar = $("[data-tabbar]");
  var sheet = $("[data-sheet]");
  var sheetPanel = $("[data-sheet-panel]");
  var toastEl = $("[data-toast]");
  var screen = $("[data-screen]");

  var TABS = [
    { id: "home", label: "Home", icon: "home" },
    { id: "photos", label: "Photos", icon: "camera" },
    { id: "damage", label: "Damage", icon: "wrench" },
    { id: "records", label: "Records", icon: "file" }
  ];

  function renderTabs() {
    var open = state.stage === "preinspection" ? openItems() : 0;
    tabbar.innerHTML = TABS.map(function (t) {
      var badge = t.id === "damage" && open ? '<span class="dot-badge">' + open + '</span><span class="visually-hidden">, ' + open + " to fix</span>" : "";
      return '<button class="tabbar__btn" type="button" data-tab="' + t.id + '"' + (state.tab === t.id ? ' aria-current="page"' : "") + '><span class="tabbar__icon">' + icon(t.icon) + badge + "</span><span>" + t.label + "</span></button>";
    }).join("");
  }

  function render(moveFocus) {
    var html;
    if (state.route && state.route.type === "room") html = renderRoom(state.route.id);
    else if (state.route && state.route.type === "photo") html = renderPhoto(state.route.id, state.route.index);
    else if (state.tab === "photos") html = renderPhotos();
    else if (state.tab === "damage") html = renderDamage();
    else if (state.tab === "records") html = renderRecords();
    else html = renderHome();
    view.innerHTML = '<div class="screen-anim">' + html + "</div>";
    renderTabs();
    renderStages();
    if (moveFocus) {
      view.scrollTop = 0;
      var target = $("[data-focus]", view);
      if (target) target.focus({ preventScroll: true });
    }
  }

  function go(tab) {
    state.tab = tab;
    state.route = null;
    state.pinMode = false;
    render(true);
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  var lastFocus = null;

  function openSheet(html) {
    lastFocus = document.activeElement;
    sheetPanel.innerHTML = '<button class="sheet__close icon-btn" type="button" data-close aria-label="Close">' + icon("close") + "</button>" + html;
    sheet.hidden = false;
    requestAnimationFrame(function () {
      sheet.classList.add("is-open");
      var first = sheetPanel.querySelector("textarea, input:checked, input, .btn, a");
      (first || sheetPanel.querySelector("button")).focus();
    });
  }

  function closeSheet() {
    sheet.classList.remove("is-open");
    setTimeout(function () {
      sheet.hidden = true;
      sheetPanel.innerHTML = "";
    }, reduceMotion ? 0 : 250);
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
  }

  /* ---------- Stage picker (outside the phone) ---------- */

  var stagesEl = $("[data-stages]");

  function renderStages() {
    stagesEl.innerHTML = STAGES.map(function (s) {
      return '<label class="stage' + (s.id === state.stage ? " is-active" : "") + '"><input type="radio" name="stage" value="' + s.id + '"' + (s.id === state.stage ? " checked" : "") + '><span class="stage__dot" aria-hidden="true"></span><span class="stage__text"><span class="stage__label">' + s.label + '</span><span class="stage__when">' + s.when + "</span></span></label>";
    }).join("");
  }

  stagesEl.addEventListener("change", function (event) {
    if (event.target.name !== "stage") return;
    state.stage = event.target.value;
    state.pinMode = false;
    state.route = null;
    render(false);
    stagesEl.querySelector("input:checked").focus();
    toast("Jumped to: " + stage().label + " (" + stage().when + ")");
  });

  /* ---------- Events ---------- */

  screen.addEventListener("click", function (event) {
    var el = event.target.closest("button, [data-viewer], [data-close]");
    if (!el) return;
    var d = el.dataset;

    if (d.close !== undefined) return closeSheet();
    if (d.tab) {
      if (!sheet.hidden) closeSheet();
      return go(d.tab);
    }
    if (d.back !== undefined) {
      if (state.route && state.route.type === "photo" && state.route.from === "room") state.route = { type: "room", id: state.route.id };
      else state.route = null;
      state.pinMode = false;
      return render(true);
    }
    if (d.room) {
      state.route = { type: "room", id: d.room };
      return render(true);
    }
    if (d.photo) {
      var parts = d.photo.split(":");
      state.route = { type: "photo", id: parts[0], index: Number(parts[1]), from: state.route && state.route.type === "room" ? "room" : "tab" };
      state.pinMode = false;
      return render(true);
    }
    if (d.toast) return toast(d.toast);
    if (d.sheet === "reminders") return openSheet(remindersSheet());
    if (d.sheet === "profile") return openSheet(profileSheet());

    if (d.pinStart !== undefined) {
      state.pinMode = true;
      render(false);
      var hint = $("[data-viewer]", view);
      if (hint) hint.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      $("[data-pin-skip]", view).focus();
      return;
    }
    if (d.pinCancel !== undefined) {
      state.pinMode = false;
      render(false);
      return;
    }
    if (d.pinSkip !== undefined) {
      state.pendingPin = { x: 50, y: 50 };
      return openSheet(noteSheet());
    }
    if (d.viewer !== undefined && state.pinMode) {
      var rect = el.getBoundingClientRect();
      state.pendingPin = {
        x: Math.round(((event.clientX - rect.left) / rect.width) * 100),
        y: Math.round(((event.clientY - rect.top) / rect.height) * 100)
      };
      return openSheet(noteSheet());
    }
    if (d.chip) {
      var text = $("[data-note-text]", sheetPanel);
      text.value = text.value ? text.value + ", " + d.chip.toLowerCase() : d.chip;
      text.focus();
      return;
    }

    if (d.plan) {
      var p = d.plan.split(":");
      state.damage[p[0]].plan = p[1];
      if (p[1] === "landlord") state.damage[p[0]].fixed = false;
      render(false);
      var again = view.querySelector('[data-plan="' + d.plan + '"]');
      if (again) again.focus();
      return;
    }
    if (d.fixed) {
      state.damage[d.fixed].fixed = true;
      render(false);
      toast("Photo sent. We'll check it at key return.");
      return;
    }
    if (d.challenge) return openSheet(challengeSheet(d.challenge));
  });

  screen.addEventListener("submit", function (event) {
    event.preventDefault();
    var form = event.target;

    if (form.matches("[data-note-form]")) {
      var text = $("[data-note-text]", form).value.trim();
      if (!text) {
        $("[data-note-error]", form).hidden = false;
        $("[data-note-text]", form).focus();
        return;
      }
      var key = state.route.id + "-" + state.route.index;
      state.notes[key] = (state.notes[key] || []).concat({ x: state.pendingPin.x, y: state.pendingPin.y, text: text, by: "You", date: "3 Sep 2025" });
      state.pinMode = false;
      closeSheet();
      render(false);
      toast("Note saved and dated. Your landlord can see it too.");
      return;
    }

    if (form.matches("[data-challenge-form]")) {
      state.damage[form.dataset.challengeForm].challenged = true;
      closeSheet();
      render(false);
      toast("Sent for review. Only this amount is on hold.");
    }
  });

  screen.addEventListener("input", function (event) {
    if (event.target.matches("[data-compare]")) {
      state.compare = Number(event.target.value);
      $(".viewer--compare", view).style.setProperty("--pos", state.compare + "%");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !sheet.hidden) closeSheet();
    // Keep focus inside an open sheet.
    if (event.key === "Tab" && !sheet.hidden) {
      var items = sheetPanel.querySelectorAll("button, input, textarea, a");
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Start on a stage passed in the address, e.g. app/index.html#preinspection
  var fromHash = location.hash.replace("#", "");
  if (STAGES.some(function (s) { return s.id === fromHash; })) state.stage = fromHash;

  render(false);
})();
