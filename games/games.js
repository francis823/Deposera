/* Deposera booth games: "Spot the damage" and "Fair or not?".
   Made for a tablet at the booth. Scores are kept on this device only. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = document.querySelector("[data-stage]");
  var toastEl = document.querySelector("[data-toast]");
  var QR = document.querySelector("[data-qr]").innerHTML;

  var SPOT_SECONDS = 40;
  var IDLE_SECONDS = 60;

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function load(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* Storage can be blocked; the games still work without it. */
    }
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- Small sounds (no files needed) ---------- */

  var audio = null;
  function beep(freq, duration, type) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch (e) {
      /* Sound is optional. */
    }
  }
  function soundGood() {
    beep(660, 0.12);
    setTimeout(function () { beep(990, 0.18); }, 90);
  }
  function soundBad() {
    beep(180, 0.22, "square");
  }
  function soundWin() {
    [523, 659, 784, 1047].forEach(function (f, i) {
      setTimeout(function () { beep(f, 0.2); }, i * 110);
    });
  }

  /* ---------- Icons ---------- */

  var ICONS = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8.5 11l2 2 3.5-3.5"/>',
    scales: '<path d="M12 3v18M7 21h10M5 7h14M12 5l-7 2M12 5l7 2"/><path d="M5 7l-3 6a3 3 0 0 0 6 0Z M19 7l-3 6a3 3 0 0 0 6 0Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
    play: '<path d="M8 5v14l11-7Z"/>',
    camera: '<path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    paint: '<rect x="4" y="3" width="14" height="6" rx="1.5"/><path d="M18 6h2v5h-8v3"/><rect x="10" y="14" width="4" height="7" rx="1"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    door: '<path d="M6 21V3h12v18M3 21h18"/><circle cx="15" cy="12" r="1"/>',
    flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 2 2 2 3 1-2 1-4 1-6Z"/>',
    snow: '<path d="M12 2v20M4 6.5l16 11M4 17.5l16-11"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L13 18a2.1 2.1 0 0 1-3-3Z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5M10 15l-6 6"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || "i") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + "</svg>";
  }

  /* ---------- Rooms for "Spot the damage" (move-in vs move-out) ---------- */

  function rect(x, y, w, h, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || "") + "/>";
  }

  function woodFloor(y) {
    var s = rect(0, y, 400, 300 - y, "#c39a68");
    for (var x = -80; x < 480; x += 40) s += '<path d="M' + x + " " + y + "L" + (x + (x - 200) * 0.5) + ' 300" stroke="#9c7445" stroke-opacity=".45"/>';
    return s;
  }

  var ROOMS = [
    {
      id: "living",
      name: "Living room",
      draw: function (after) {
        var s = rect(0, 0, 400, 232, "#ebe2cf") + rect(0, 224, 400, 8, "#f6efe1") + woodFloor(232);
        s += '<path d="M150 0v22" stroke="#7d5f30" stroke-width="2"/><path d="M130 22h40l9 18h-58z" fill="#cfaa6c"/>';
        s += '<rect x="240" y="36" width="122" height="112" rx="3" fill="#f8f3e8"/>' + rect(248, 44, 106, 96, "#bfd8c8") + '<path d="M301 44v96M248 92h106" stroke="#f8f3e8" stroke-width="5"/><rect x="234" y="146" width="134" height="8" rx="2" fill="#f6efe1"/>';
        s += '<path d="M290 146l3-16h18l3 16z" fill="#b98c5a"/><path d="M302 130c-8-12-2-24 4-30M302 130c6-10 14-14 18-22M302 130c-2-10-10-14-16-16" stroke="#4f7d63" stroke-width="3" fill="none" stroke-linecap="round"/>';
        var frame = '<rect x="72" y="58" width="94" height="62" fill="#f8f3e8" stroke="#b8925a" stroke-width="4"/><path d="M80 112l22-24 16 14 12-10 28 20z" fill="#9fb7a6"/><circle cx="146" cy="76" r="6" fill="#e2c792"/>';
        s += after ? '<g transform="rotate(-9 119 89)">' + frame + "</g>" : frame;
        s += '<ellipse cx="150" cy="266" rx="110" ry="22" fill="#d9cbad"/><ellipse cx="150" cy="266" rx="92" ry="16" fill="none" stroke="#c4b393" stroke-width="2"/>';
        s += '<rect x="44" y="148" width="166" height="54" rx="14" fill="#2f6a50"/><rect x="36" y="186" width="182" height="36" rx="10" fill="#21503c"/><rect x="26" y="160" width="26" height="62" rx="11" fill="#21503c"/><rect x="202" y="160" width="26" height="62" rx="11" fill="#21503c"/><path d="M127 190v30" stroke="#173a2b" stroke-width="2"/>' + rect(44, 222, 8, 10, "#173a2b") + rect(202, 222, 8, 10, "#173a2b");
        if (after) {
          s += '<path d="M197 40l9 15-7 10 11 13-5 14 8 10" stroke="#5b4a35" stroke-width="2.2" fill="none" stroke-linejoin="round"/>';
          s += '<ellipse cx="198" cy="268" rx="22" ry="8" fill="#7a5a35" opacity=".7"/><ellipse cx="212" cy="263" rx="9" ry="4" fill="#7a5a35" opacity=".55"/>';
          s += '<path d="M318 52l9 16-7 8 12 14-6 10M327 68l14-6" stroke="#f8f3e8" stroke-width="2.2" fill="none"/>';
          s += '<path d="M68 198c8-7 22-7 28 2-5 9-20 10-28-2z" fill="#e9dfca" stroke="#0b1d15" stroke-width="1.5"/>';
        }
        return s;
      },
      diffs: [
        { x: 203, y: 68, r: 30, label: "Crack in the wall" },
        { x: 202, y: 267, r: 32, label: "Stain on the rug" },
        { x: 119, y: 89, r: 44, label: "Picture hanging crooked" },
        { x: 328, y: 76, r: 30, label: "Cracked window" },
        { x: 82, y: 199, r: 28, label: "Tear in the sofa" }
      ]
    },
    {
      id: "kitchen",
      name: "Kitchen",
      draw: function (after) {
        var s = rect(0, 0, 400, 300, "#ebe2cf");
        s += '<rect x="262" y="22" width="112" height="62" rx="3" fill="#f8f3e8"/>' + rect(269, 29, 98, 48, "#bfd8c8") + '<path d="M318 29v48" stroke="#f8f3e8" stroke-width="5"/>';
        for (var ty = 92, row = 0; ty < 150; ty += 14, row++) {
          for (var tx = row % 2 ? -14 : 0; tx < 400; tx += 28) s += '<rect x="' + tx + '" y="' + ty + '" width="27" height="13" fill="#f6efe1" stroke="#ddd0b4"/>';
        }
        s += '<rect x="20" y="18" width="96" height="70" rx="3" fill="#f3ecdc" stroke="#d9cbad" stroke-width="2"/>' + rect(103, 64, 4, 16, "#b8925a");
        var door = '<rect x="117" y="18" width="93" height="70" rx="3" fill="#f3ecdc" stroke="#d9cbad" stroke-width="2"/>';
        s += after ? rect(117, 18, 93, 70, "#cfc2a4") + '<g transform="rotate(9 117 18)">' + door + "</g>" : door + rect(124, 64, 4, 16, "#b8925a");
        s += rect(0, 150, 400, 10, "#3b4a42") + rect(0, 160, 400, 92, "#f3ecdc") + '<path d="M100 160v92M300 160v92" stroke="#d9cbad" stroke-width="2"/>' + rect(90, 196, 4, 18, "#b8925a") + rect(306, 196, 4, 18, "#b8925a");
        s += '<rect x="146" y="166" width="108" height="80" rx="6" fill="#2a2f2c"/>' + rect(158, 174, 84, 5, "#8b918d") + '<rect x="158" y="186" width="84" height="50" rx="4" fill="#4b524e"/>';
        s += rect(312, 147, 60, 5, "#cfd5d2") + '<path d="M342 147v-22h14v7" stroke="#9aa3a0" stroke-width="4" fill="none" stroke-linecap="round"/>';
        s += rect(0, 252, 400, 48, "#d9cbad");
        for (var fx = 0; fx < 400; fx += 50) s += '<path d="M' + fx + ' 252v48" stroke="#c9b892"/>';
        s += '<path d="M0 276h400" stroke="#c9b892"/>';
        if (after) {
          s += '<ellipse cx="186" cy="206" rx="16" ry="9" fill="#8a6a3b" opacity=".85"/><ellipse cx="216" cy="220" rx="13" ry="7" fill="#8a6a3b" opacity=".75"/><ellipse cx="204" cy="198" rx="7" ry="4" fill="#a07c46" opacity=".8"/>';
          s += '<path d="M46 106l9 7-4 7 10 7-3 8" stroke="#6e5a40" stroke-width="2" fill="none"/>';
          s += '<path d="M30 196l34 14M34 214l28 10M40 188l18 30" stroke="#a8977a" stroke-width="2" stroke-linecap="round"/>';
          s += '<ellipse cx="340" cy="274" rx="40" ry="9" fill="#8fb6c6" opacity=".75"/><path d="M349 132v10" stroke="#8fb6c6" stroke-width="3" stroke-linecap="round"/>';
        }
        return s;
      },
      diffs: [
        { x: 200, y: 210, r: 38, label: "Greasy oven" },
        { x: 165, y: 58, r: 46, label: "Cupboard door hanging loose" },
        { x: 56, y: 120, r: 28, label: "Cracked tile" },
        { x: 48, y: 206, r: 32, label: "Scratched cupboard" },
        { x: 340, y: 272, r: 36, label: "Water leak on the floor" }
      ]
    },
    {
      id: "bedroom",
      name: "Bedroom",
      draw: function (after) {
        var s = rect(0, 0, 400, 232, "#ebe2cf") + rect(0, 224, 400, 8, "#f6efe1") + rect(0, 232, 400, 68, "#b9a58a");
        for (var cx = 10; cx < 400; cx += 22) for (var cy = 242; cy < 300; cy += 16) s += '<circle cx="' + (cx + (cy % 32 ? 11 : 0)) + '" cy="' + cy + '" r="1.4" fill="#a8947a"/>';
        s += '<rect x="246" y="34" width="116" height="116" rx="3" fill="#f8f3e8"/>' + rect(254, 42, 100, 100, "#bfd8c8");
        for (var sy = 44; sy < 136; sy += 8) {
          if (after && sy === 92) s += '<path d="M254 92l46 10" stroke="#e7dcc3" stroke-width="6"/><path d="M308 96l46-4" stroke="#e7dcc3" stroke-width="6"/>';
          else s += rect(254, sy, 100, 6, "#efe6d2");
        }
        s += '<path d="M346 44v92" stroke="#cdbb98" stroke-width="1.5"/><circle cx="346" cy="140" r="3" fill="#b8925a"/>';
        s += '<circle cx="118" cy="66" r="24" fill="#cfe0da" stroke="#b8925a" stroke-width="4"/><path d="M106 58l10-6M106 68l18-10" stroke="#fff" stroke-width="3" opacity=".7"/>';
        s += '<rect x="30" y="118" width="176" height="72" rx="12" fill="#21503c"/><rect x="18" y="176" width="200" height="26" rx="6" fill="#f8f3e8"/><ellipse cx="78" cy="174" rx="34" ry="11" fill="#fbf8f1"/><ellipse cx="156" cy="174" rx="34" ry="11" fill="#fbf8f1"/><rect x="18" y="190" width="200" height="40" rx="8" fill="#cfaa6c"/><path d="M18 206h200" stroke="#b8925a" stroke-width="2"/>' + rect(26, 228, 8, 10, "#173a2b") + rect(202, 228, 8, 10, "#173a2b");
        s += '<rect x="224" y="176" width="34" height="56" rx="3" fill="#b98c5a"/><path d="M224 204h34" stroke="#9c7445" stroke-width="2"/><circle cx="241" cy="192" r="2.5" fill="#7d5f30"/><circle cx="241" cy="218" r="2.5" fill="#7d5f30"/>';
        s += rect(236, 160, 10, 16, "#7d5f30");
        s += after ? '<g transform="rotate(14 241 150)"><path d="M228 140h26l6 20h-38z" fill="#f3ecdc"/><path d="M236 142l6 10 -4 6" stroke="#9c7445" stroke-width="2" fill="none"/></g>' : '<path d="M228 140h26l6 20h-38z" fill="#f3ecdc"/>';
        if (after) {
          s += '<ellipse cx="60" cy="96" rx="10" ry="8" fill="#5b4a35"/><path d="M50 90l-8-6M70 92l8-6M60 104l-2 8" stroke="#5b4a35" stroke-width="1.6"/>';
          s += '<ellipse cx="132" cy="262" rx="26" ry="9" fill="#6e4f2e" opacity=".55"/>';
          s += '<path d="M228 182l24 18M230 196l18 10" stroke="#f3e2c0" stroke-width="2" stroke-linecap="round"/>';
        }
        return s;
      },
      diffs: [
        { x: 304, y: 96, r: 32, label: "Broken blind" },
        { x: 60, y: 96, r: 28, label: "Hole in the wall" },
        { x: 132, y: 262, r: 34, label: "Stain on the carpet" },
        { x: 242, y: 150, r: 26, label: "Torn lamp shade" },
        { x: 240, y: 192, r: 24, label: "Scratched bedside table" }
      ]
    }
  ];

  function roomSvg(room, after, marks) {
    return '<svg class="photo__svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">' + room.draw(after) + (marks || "") + "</svg>";
  }

  /* ---------- Situations for "Fair or not?" ---------- */

  var SITUATIONS = [
    { id: "carpet", icon: "layers", text: "The carpet is lightly worn after 2 years.", fair: false, why: "Normal wear from everyday living is not damage." },
    { id: "oven", icon: "flame", text: "The oven was left greasy at move-out.", fair: true, why: "Fair, but only the real cleaning cost, backed by an invoice." },
    { id: "crack", icon: "camera", text: "A crack in the wall that is already in the move-in photos.", fair: false, why: "It was there before the tenant moved in. Our photos prove it." },
    { id: "blind", icon: "wrench", text: "A broken blind that is not in the move-in photos.", fair: true, why: "Fair. The tenant could have fixed it after the pre-inspection." },
    { id: "cleaning", icon: "receipt", text: '"General cleaning: €300", with no invoice.', fair: false, why: "No proof, no deduction. Every cost needs an invoice." },
    { id: "paint", icon: "paint", text: "The tenant painted a wall bright purple without permission.", fair: true, why: "Fair, but only the real cost of repainting it." },
    { id: "fridge", icon: "snow", text: "A 15-year-old fridge stopped working.", fair: false, why: "Old age is wear, not damage caused by the tenant." },
    { id: "late", icon: "calendar", text: "The landlord reports new damage 3 weeks after key return.", fair: false, why: "Too late. Landlords have 14 days after key return to report missed damage." },
    { id: "curtains", icon: "sun", text: "Curtains faded by the sun after 4 years.", fair: false, why: "Sun fading is normal wear." },
    { id: "door", icon: "door", text: "A hole in a door from a party, found at key return.", fair: true, why: "Fair. It is real damage, and only the repair cost comes out." }
  ];

  /* ---------- State ---------- */

  var state = {
    screen: "hub",
    roomIndex: Number(load("deposera-room-index", 0)) || 0,
    spot: null,
    fair: null
  };

  var timers = { spot: null, countdown: null };

  function clearTimers() {
    clearInterval(timers.spot);
    clearTimeout(timers.countdown);
  }

  function show(html, focus) {
    stage.innerHTML = '<div class="screen">' + html + "</div>";
    stage.scrollTop = 0;
    if (focus !== false) {
      var h = stage.querySelector("h1, h2");
      if (h) {
        h.setAttribute("tabindex", "-1");
        h.focus({ preventScroll: true });
      }
    }
  }

  function voteBlock(text) {
    return '<div class="vote"><div class="vote__qr">' + QR + '</div><div class="vote__text"><p class="vote__kicker">' + (text || "Thanks for playing") + '</p><p class="vote__title">Like it? <em>Vote Deposera</em></p><p class="vote__url">Scan to visit our website<br>francis823.github.io/Deposera</p></div></div>';
  }

  /* ---------- Hub ---------- */

  function spotScores() {
    return load("deposera-spot-scores", []);
  }

  function renderHub() {
    clearTimers();
    state.screen = "hub";
    var top = spotScores()[0];
    show(
      '<section class="hub">' +
        '<div class="hub__intro"><p class="eyebrow">Booth games</p><h1>Can you protect <em>a deposit?</em></h1><p class="lead">Play a game and win a gold coin.</p></div>' +
        '<div class="hub__games">' +
          '<button class="game-card" type="button" data-start="spot"><span class="game-card__icon">' + icon("search") + '</span><span class="game-card__title">Spot the damage</span><span class="game-card__text">Find 5 differences between move-in and move-out in ' + SPOT_SECONDS + ' seconds.</span>' +
          (top ? '<span class="game-card__badge">' + icon("trophy", "i i--sm") + "Top score " + top.score + " by " + esc(top.name) + "</span>" : '<span class="game-card__badge">' + icon("trophy", "i i--sm") + "Be the first on the leaderboard</span>") +
          '<span class="game-card__play">' + icon("play", "i i--sm") + "Play</span></button>" +
          '<button class="game-card game-card--light" type="button" data-start="fair"><span class="game-card__icon">' + icon("scales") + '</span><span class="game-card__title">Fair or not?</span><span class="game-card__text">5 real situations. Would you keep the money?</span><span class="game-card__badge">' + icon("check", "i i--sm") + "See how other visitors voted</span>" +
          '<span class="game-card__play">' + icon("play", "i i--sm") + "Play</span></button>" +
        "</div>" +
        voteBlock("Deposera · Independent deposit holding") +
      "</section>"
    );
  }

  /* ---------- Spot the damage ---------- */

  function startSpot() {
    clearTimers();
    var room = ROOMS[state.roomIndex % ROOMS.length];
    state.roomIndex = (state.roomIndex + 1) % ROOMS.length;
    save("deposera-room-index", state.roomIndex);
    state.screen = "spot";
    state.spot = { room: room, found: [], left: SPOT_SECONDS, misses: [], done: false };

    // 3-2-1 countdown, then play.
    var n = 3;
    function tick() {
      show('<section class="countdown"><p class="eyebrow">' + room.name + '</p><h2>Find 5 differences</h2><p class="countdown__num" aria-live="assertive">' + n + '</p><p class="lead">Tap the damage on either photo.</p></section>', n === 3);
      beep(440 + (3 - n) * 120, 0.12);
      n--;
      if (n >= 0) timers.countdown = setTimeout(n === 0 ? playSpot : tick, n === 0 ? 900 : 900);
    }
    tick();
  }

  function marksFor(after) {
    var sp = state.spot;
    var s = "";
    sp.found.forEach(function (i) {
      var d = sp.room.diffs[i];
      s += '<circle class="mark" cx="' + d.x + '" cy="' + d.y + '" r="' + d.r + '"/>';
    });
    if (sp.done) {
      sp.room.diffs.forEach(function (d, i) {
        if (sp.found.indexOf(i) === -1) s += '<circle class="mark mark--missed" cx="' + d.x + '" cy="' + d.y + '" r="' + d.r + '"/>';
      });
    }
    if (after) {
      sp.misses.forEach(function (m) {
        s += '<g class="miss" transform="translate(' + m.x + " " + m.y + ')"><path d="M-9-9 9 9M9-9-9 9"/></g>';
      });
    }
    return s;
  }

  function spotBoard() {
    var sp = state.spot;
    return '<div class="photos">' +
      '<figure class="photo" data-photo><span class="photo__tag">Move-in</span>' + roomSvg(sp.room, false, marksFor(false)) + "</figure>" +
      '<figure class="photo" data-photo><span class="photo__tag photo__tag--out">Move-out</span>' + roomSvg(sp.room, true, marksFor(true)) + "</figure>" +
      "</div>";
  }

  function spotList() {
    var sp = state.spot;
    return '<ol class="found">' + sp.room.diffs.map(function (d, i) {
      var got = sp.found.indexOf(i) !== -1;
      var cls = got ? "is-found" : sp.done ? "is-missed" : "";
      return '<li class="' + cls + '"><span class="found__dot">' + (got ? icon("check", "i i--xs") : i + 1) + "</span><span>" + (got || sp.done ? d.label : "???") + "</span></li>";
    }).join("") + "</ol>";
  }

  function renderSpotPlay() {
    var sp = state.spot;
    var pct = (sp.left / SPOT_SECONDS) * 100;
    show(
      '<section class="spot">' +
        '<div class="spot__bar"><div><p class="eyebrow">' + sp.room.name + '</p><h2 class="spot__title">Spot the damage</h2></div>' +
        '<div class="spot__stats"><span class="pill" aria-live="polite"><strong>' + sp.found.length + "</strong>/5 found</span>" +
        '<span class="timer' + (sp.left <= 10 ? " is-low" : "") + '" style="--p:' + pct + '"><span>' + sp.left + "</span></span></div></div>" +
        spotBoard() + spotList() +
      "</section>",
      false
    );
  }

  function playSpot() {
    renderSpotPlay();
    timers.spot = setInterval(function () {
      var sp = state.spot;
      sp.left = Math.max(0, sp.left - 1);
      if (sp.left <= 5 && sp.left > 0) beep(880, 0.06);
      if (sp.left === 0) return endSpot();
      var timer = stage.querySelector(".timer");
      if (timer) {
        timer.style.setProperty("--p", (sp.left / SPOT_SECONDS) * 100);
        timer.classList.toggle("is-low", sp.left <= 10);
        timer.querySelector("span").textContent = sp.left;
      }
    }, 1000);
  }

  function tapPhoto(event, figure) {
    var sp = state.spot;
    if (!sp || sp.done) return;
    var svg = figure.querySelector("svg");
    var box = svg.getBoundingClientRect();
    var x = ((event.clientX - box.left) / box.width) * 400;
    var y = ((event.clientY - box.top) / box.height) * 300;

    var hit = -1;
    sp.room.diffs.forEach(function (d, i) {
      if (sp.found.indexOf(i) !== -1 || hit !== -1) return;
      if (Math.hypot(d.x - x, d.y - y) <= d.r + 8) hit = i;
    });

    if (hit !== -1) {
      sp.found.push(hit);
      soundGood();
      toast(sp.room.diffs[hit].label + "!");
      if (sp.found.length === sp.room.diffs.length) return endSpot();
    } else {
      sp.misses.push({ x: x, y: y });
      sp.left = Math.max(0, sp.left - 2);
      soundBad();
      toast("Not there: -2 seconds");
      if (sp.left === 0) return endSpot();
    }
    renderSpotPlay();
  }

  function spotScore() {
    var sp = state.spot;
    return sp.found.length * 100 + (sp.found.length === 5 ? sp.left * 20 : 0);
  }

  function endSpot() {
    clearInterval(timers.spot);
    var sp = state.spot;
    sp.done = true;
    sp.score = spotScore();
    var scores = spotScores();
    sp.qualifies = sp.score > 0 && (scores.length < 5 || sp.score > scores[scores.length - 1].score);
    var all = sp.found.length === 5;
    if (all) soundWin();
    renderSpotResult();
    if (all) confetti();
  }

  function leaderboard(highlight) {
    var scores = spotScores();
    if (!scores.length) return '<p class="muted">No scores yet. Be the first!</p>';
    return '<ol class="board">' + scores.map(function (s, i) {
      return '<li class="' + (highlight === i ? "is-you" : "") + '"><span class="board__rank">' + (i + 1) + '</span><span class="board__name">' + esc(s.name) + '</span><span class="board__score">' + s.score + "</span></li>";
    }).join("") + "</ol>";
  }

  function renderSpotResult(highlight) {
    var sp = state.spot;
    var all = sp.found.length === 5;
    var title = all ? "Every bit of damage found!" : sp.found.length >= 3 ? "Good eye!" : "Damage is easy to miss.";
    var entry = sp.qualifies && highlight === undefined
      ? '<form class="entry" data-entry><label for="initials">You made the leaderboard! Your initials</label><div class="entry__row"><input id="initials" name="initials" maxlength="3" autocomplete="off" autocapitalize="characters" required placeholder="ABC"><button class="btn" type="submit">Save</button></div></form>'
      : "";
    show(
      '<section class="result">' +
        '<div class="result__main">' +
          '<p class="eyebrow">' + sp.room.name + ' · Result</p><h2>' + title + "</h2>" +
          '<p class="result__score"><span>' + sp.score + '</span> points</p>' +
          '<p class="lead">You found ' + sp.found.length + " of 5" + (all ? " with " + sp.left + " seconds to spare." : ".") + ' That\'s why <strong>we take neutral photos at move-in and move-out</strong>: so nobody has to argue about what changed.</p>' +
          entry +
          spotBoard() + spotList() +
        "</div>" +
        '<aside class="result__side"><h3>' + icon("trophy", "i i--sm") + "Top 5 today</h3>" + leaderboard(highlight) +
          '<div class="btn-row"><button class="btn" type="button" data-start="spot">' + icon("play", "i i--sm") + 'Play again</button><button class="btn btn--ghost" type="button" data-home>' + icon("home", "i i--sm") + "Menu</button></div>" +
          voteBlock() +
        "</aside>" +
      "</section>"
    );
    var input = stage.querySelector("#initials");
    if (input) input.focus();
  }

  function saveInitials(form) {
    var sp = state.spot;
    var name = form.initials.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!name) {
      form.initials.focus();
      return;
    }
    var scores = spotScores();
    var entry = { name: name, score: sp.score, t: Date.now() };
    scores.push(entry);
    scores.sort(function (a, b) { return b.score - a.score || a.t - b.t; });
    scores = scores.slice(0, 5);
    save("deposera-spot-scores", scores);
    sp.qualifies = false;
    renderSpotResult(scores.indexOf(scores.filter(function (s) { return s.t === entry.t; })[0]));
    toast("Saved! You're on the leaderboard.");
  }

  /* ---------- Fair or not? ---------- */

  function startFair() {
    clearTimers();
    state.screen = "fair";
    state.fair = { list: shuffle(SITUATIONS).slice(0, 5), index: 0, correct: 0, answer: null };
    renderFair();
  }

  function votes() {
    return load("deposera-fair-votes", {});
  }

  function renderFair() {
    var f = state.fair;
    var q = f.list[f.index];
    var dots = f.list.map(function (_, i) {
      return '<span class="dots__dot' + (i < f.index ? " is-done" : i === f.index ? " is-current" : "") + '"></span>';
    }).join("");

    var reveal = "";
    if (f.answer !== null) {
      var right = f.answer === q.fair;
      var v = votes()[q.id] || { fair: 0, not: 0 };
      var total = v.fair + v.not;
      var pct = total ? Math.round((v.fair / total) * 100) : 0;
      reveal =
        '<div class="reveal ' + (right ? "is-right" : "is-wrong") + '" role="status">' +
          '<p class="reveal__verdict">' + icon(right ? "check" : "close", "i") + "<span>" + (right ? "Correct!" : "Not quite.") + " It's <strong>" + (q.fair ? "fair" : "not fair") + "</strong>.</span></p>" +
          '<p class="reveal__why">' + esc(q.why) + "</p>" +
          '<div class="poll"><p class="poll__label">How visitors voted</p><div class="poll__bar"><span style="width:' + pct + '%"></span></div><p class="poll__nums"><span>Fair ' + pct + "%</span><span>Not fair " + (100 - pct) + "%</span></p></div>" +
          '<button class="btn btn--big" type="button" data-next>' + (f.index < f.list.length - 1 ? "Next situation" : "See my score") + "</button>" +
        "</div>";
    }

    show(
      '<section class="fair">' +
        '<div class="fair__head"><p class="eyebrow">Fair or not? · ' + (f.index + 1) + " of " + f.list.length + '</p><div class="dots" aria-hidden="true">' + dots + "</div></div>" +
        '<div class="situation"><span class="situation__icon">' + icon(q.icon) + '</span><h2 class="situation__text">' + esc(q.text) + '</h2><p class="muted">Should this come out of the deposit?</p></div>' +
        (f.answer === null
          ? '<div class="choices"><button class="choice choice--fair" type="button" data-answer="fair">' + icon("check") + 'Fair</button><button class="choice choice--not" type="button" data-answer="not">' + icon("close") + "Not fair</button></div>"
          : reveal) +
      "</section>",
      f.answer === null
    );
    if (f.answer !== null) stage.querySelector("[data-next]").focus();
  }

  function answerFair(choice) {
    var f = state.fair;
    if (f.answer !== null) return;
    var q = f.list[f.index];
    f.answer = choice === "fair";
    var all = votes();
    var v = all[q.id] || { fair: 0, not: 0 };
    if (f.answer) v.fair++;
    else v.not++;
    all[q.id] = v;
    save("deposera-fair-votes", all);
    if (f.answer === q.fair) {
      f.correct++;
      soundGood();
    } else {
      soundBad();
    }
    renderFair();
  }

  function nextFair() {
    var f = state.fair;
    if (f.index < f.list.length - 1) {
      f.index++;
      f.answer = null;
      renderFair();
    } else {
      renderFairResult();
    }
  }

  function renderFairResult() {
    var f = state.fair;
    var c = f.correct;
    var title = c === 5 ? "Perfect! You think like Deposera." : c >= 3 ? "Nice judgement!" : "Deposit rules can be tricky.";
    if (c >= 4) {
      soundWin();
      setTimeout(confetti, 50);
    }
    show(
      '<section class="result result--fair">' +
        '<div class="result__main">' +
          '<p class="eyebrow">Fair or not? · Result</p><h2>' + title + '</h2><p class="result__score"><span>' + c + "/5</span> correct</p>" +
          '<p class="lead">At Deposera, <strong>a deposit is only kept for real, proven damage</strong>. We check every deduction against our photos and an invoice, and normal wear never counts.</p>' +
          '<div class="btn-row"><button class="btn" type="button" data-start="fair">' + icon("play", "i i--sm") + 'Play again</button><button class="btn btn--ghost" type="button" data-start="spot">' + icon("search", "i i--sm") + 'Try Spot the damage</button></div>' +
        "</div>" +
        '<aside class="result__side">' + voteBlock("Thanks for playing") + "</aside>" +
      "</section>"
    );
  }

  /* ---------- Confetti ---------- */

  function confetti() {
    if (reduceMotion) return;
    var colors = ["#e2c792", "#cfaa6c", "#fbf8f1", "#2f6a50", "#b8925a"];
    for (var i = 0; i < 70; i++) {
      var p = document.createElement("span");
      p.className = "confetti";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--x", (Math.random() - 0.5) * 200 + "px");
      p.style.setProperty("--r", Math.random() * 720 + "deg");
      p.style.animationDelay = Math.random() * 0.4 + "s";
      p.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
      document.body.appendChild(p);
      setTimeout(p.remove.bind(p), 3400);
    }
  }

  /* ---------- Events ---------- */

  document.addEventListener("click", function (event) {
    var el = event.target.closest("button, [data-photo]");
    if (!el) return;
    var d = el.dataset;
    if (d.home !== undefined) return renderHub();
    if (d.start === "spot") return startSpot();
    if (d.start === "fair") return startFair();
    if (d.answer) return answerFair(d.answer);
    if (d.next !== undefined) return nextFair();
    if (d.photo !== undefined && state.screen === "spot") return tapPhoto(event, el);
    if (d.fullscreen !== undefined) {
      var root = document.documentElement;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
    }
  });

  document.addEventListener("submit", function (event) {
    event.preventDefault();
    if (event.target.matches("[data-entry]")) saveInitials(event.target);
  });

  // Back to the menu when nobody has touched the tablet for a while.
  var lastActivity = Date.now();
  ["pointerdown", "keydown"].forEach(function (name) {
    document.addEventListener(name, function () {
      lastActivity = Date.now();
    }, true);
  });
  setInterval(function () {
    var playing = state.screen === "spot" && state.spot && !state.spot.done;
    if (state.screen !== "hub" && !playing && Date.now() - lastActivity > IDLE_SECONDS * 1000) renderHub();
  }, 5000);

  // Staff shortcut: open games/index.html#reset to clear the leaderboard and votes.
  if (location.hash === "#reset" && window.confirm("Clear the leaderboard and the visitor votes on this device?")) {
    save("deposera-spot-scores", []);
    save("deposera-fair-votes", {});
    history.replaceState(null, "", location.pathname);
  }

  renderHub();
})();
