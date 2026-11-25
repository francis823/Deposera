/* Deposera booth games: "Spot the damage" and "Fair or not?".
   Made for a tablet at the booth. Scores are kept on this device only. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = document.querySelector("[data-stage]");
  var toastEl = document.querySelector("[data-toast]");
  var QR = document.querySelector("[data-qr]").innerHTML;

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
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L13 18a2.1 2.1 0 0 1-3-3Z"/><path d="M14.5 6.5 17 4l3 3-2.5 2.5M10 15l-6 6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M15 8l2 2"/>',
    euro: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5a4 4 0 1 0 0 7M7 10.5h6M7 13.5h6"/>',
    vault: '<rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8v1M12 14v1M8.5 11.5h1M14.5 11.5h1M6 19v2M18 19v2"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || "i") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + "</svg>";
  }

  /* ---------- Rooms for "Spot the damage" (move-in vs move-out) ---------- */
  /* Each room has 5 obvious differences (tier 1) and 5 subtle ones (tier 2).
     draw(has) gets a function: has("id") is true when that difference shows. */

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
      draw: function (has) {
        var s = rect(0, 0, 400, 232, "#ebe2cf") + rect(0, 224, 400, 8, "#f6efe1") + woodFloor(232);
        s += '<path d="M150 0v22" stroke="#7d5f30" stroke-width="2"/><path d="M130 22h40l9 18h-58z" fill="' + (has("lamp") ? "#a5834b" : "#cfaa6c") + '"/>';
        s += '<rect x="240" y="36" width="122" height="112" rx="3" fill="#f8f3e8"/>' + rect(248, 44, 106, 96, "#bfd8c8") + '<path d="M301 44v96M248 92h106" stroke="#f8f3e8" stroke-width="5"/><rect x="234" y="146" width="134" height="8" rx="2" fill="#f6efe1"/>';
        s += '<path d="M290 146l3-16h18l3 16z" fill="#b98c5a"/><path d="M302 130c-8-12-2-24 4-30M302 130c6-10 14-14 18-22" stroke="#4f7d63" stroke-width="3" fill="none" stroke-linecap="round"/>';
        if (!has("leaf")) s += '<path d="M302 130c-2-10-10-14-16-16" stroke="#4f7d63" stroke-width="3" fill="none" stroke-linecap="round"/>';
        var frame = '<rect x="72" y="58" width="94" height="62" fill="#f8f3e8" stroke="#b8925a" stroke-width="4"/><path d="M80 112l22-24 16 14 12-10 28 20z" fill="#9fb7a6"/><circle cx="146" cy="76" r="6" fill="#e2c792"/>';
        s += has("frame") ? '<g transform="rotate(-9 119 89)">' + frame + "</g>" : frame;
        s += '<ellipse cx="150" cy="266" rx="110" ry="22" fill="#d9cbad"/><ellipse cx="150" cy="266" rx="92" ry="16" fill="none" stroke="#c4b393" stroke-width="2"/>';
        if (has("burn")) s += '<circle cx="98" cy="270" r="3.5" fill="#4a3824"/><circle cx="98" cy="270" r="6" fill="none" stroke="#8a6a3b" stroke-width="1.5" opacity=".7"/>';
        s += '<rect x="44" y="148" width="166" height="54" rx="14" fill="#2f6a50"/><rect x="36" y="186" width="182" height="36" rx="10" fill="#21503c"/><rect x="26" y="160" width="26" height="62" rx="11" fill="#21503c"/><rect x="202" y="160" width="26" height="62" rx="11" fill="#21503c"/><path d="M127 190v30" stroke="#173a2b" stroke-width="2"/>' + rect(202, 222, 8, 10, "#173a2b");
        if (!has("leg")) s += rect(44, 222, 8, 10, "#173a2b");
        if (has("scuff")) s += '<path d="M318 228h20M322 226h10" stroke="#8a7a62" stroke-width="2" stroke-linecap="round"/>';
        if (has("crack")) s += '<path d="M197 40l9 15-7 10 11 13-5 14 8 10" stroke="#5b4a35" stroke-width="2.2" fill="none" stroke-linejoin="round"/>';
        if (has("stain")) s += '<ellipse cx="198" cy="268" rx="22" ry="8" fill="#7a5a35" opacity=".7"/><ellipse cx="212" cy="263" rx="9" ry="4" fill="#7a5a35" opacity=".55"/>';
        if (has("window")) s += '<path d="M318 52l9 16-7 8 12 14-6 10M327 68l14-6" stroke="#f8f3e8" stroke-width="2.2" fill="none"/>';
        if (has("sofa")) s += '<path d="M68 198c8-7 22-7 28 2-5 9-20 10-28-2z" fill="#e9dfca" stroke="#0b1d15" stroke-width="1.5"/>';
        return s;
      },
      diffs: [
        { id: "crack", tier: 1, x: 203, y: 68, r: 30, label: "Crack in the wall" },
        { id: "stain", tier: 1, x: 202, y: 267, r: 32, label: "Stain on the rug" },
        { id: "frame", tier: 1, x: 119, y: 89, r: 44, label: "Picture hanging crooked" },
        { id: "window", tier: 1, x: 328, y: 76, r: 30, label: "Cracked window" },
        { id: "sofa", tier: 1, x: 82, y: 199, r: 28, label: "Tear in the sofa" },
        { id: "lamp", tier: 2, x: 150, y: 31, r: 22, label: "Scorched lamp shade" },
        { id: "leaf", tier: 2, x: 294, y: 121, r: 18, label: "Plant lost a leaf" },
        { id: "scuff", tier: 2, x: 328, y: 228, r: 16, label: "Scuff on the skirting board" },
        { id: "leg", tier: 2, x: 48, y: 227, r: 14, label: "Missing sofa leg" },
        { id: "burn", tier: 2, x: 98, y: 270, r: 14, label: "Small burn on the rug" }
      ]
    },
    {
      id: "kitchen",
      name: "Kitchen",
      draw: function (has) {
        var s = rect(0, 0, 400, 300, "#ebe2cf");
        s += '<rect x="262" y="22" width="112" height="62" rx="3" fill="#f8f3e8"/>' + rect(269, 29, 98, 48, "#bfd8c8");
        if (!has("mullion")) s += '<path d="M318 29v48" stroke="#f8f3e8" stroke-width="5"/>';
        for (var ty = 92, row = 0; ty < 150; ty += 14, row++) {
          for (var tx = row % 2 ? -14 : 0; tx < 400; tx += 28) s += '<rect x="' + tx + '" y="' + ty + '" width="27" height="13" fill="#f6efe1" stroke="#ddd0b4"/>';
        }
        s += '<rect x="20" y="18" width="96" height="70" rx="3" fill="#f3ecdc" stroke="#d9cbad" stroke-width="2"/>';
        if (!has("handle")) s += rect(103, 64, 4, 16, "#b8925a");
        var door = '<rect x="117" y="18" width="93" height="70" rx="3" fill="#f3ecdc" stroke="#d9cbad" stroke-width="2"/>';
        s += has("door") ? rect(117, 18, 93, 70, "#cfc2a4") + '<g transform="rotate(9 117 18)">' + door + "</g>" : door + rect(124, 64, 4, 16, "#b8925a");
        s += rect(0, 150, 400, 10, "#3b4a42");
        if (has("chip")) s += '<path d="M74 150l6 6 6-6z" fill="#ebe2cf"/>';
        s += rect(0, 160, 400, 92, "#f3ecdc") + '<path d="M100 160v92M300 160v92" stroke="#d9cbad" stroke-width="2"/>' + rect(90, 196, 4, 18, "#b8925a");
        if (!has("handle2")) s += rect(306, 196, 4, 18, "#b8925a");
        s += '<rect x="146" y="166" width="108" height="80" rx="6" fill="#2a2f2c"/>' + rect(158, 174, 84, 5, "#8b918d") + '<rect x="158" y="186" width="84" height="50" rx="4" fill="#4b524e"/>';
        s += rect(312, 147, 60, 5, "#cfd5d2") + '<path d="M342 147v-22h14v7" stroke="#9aa3a0" stroke-width="4" fill="none" stroke-linecap="round"/>';
        s += rect(0, 252, 400, 48, "#d9cbad");
        for (var fx = 0; fx < 400; fx += 50) s += '<path d="M' + fx + ' 252v48" stroke="#c9b892"/>';
        s += '<path d="M0 276h400" stroke="#c9b892"/>';
        if (has("floorcrack")) s += '<path d="M110 280l8 6-3 6 9 6" stroke="#9c8a68" stroke-width="1.6" fill="none"/>';
        if (has("oven")) s += '<ellipse cx="186" cy="206" rx="16" ry="9" fill="#8a6a3b" opacity=".85"/><ellipse cx="216" cy="220" rx="13" ry="7" fill="#8a6a3b" opacity=".75"/><ellipse cx="204" cy="198" rx="7" ry="4" fill="#a07c46" opacity=".8"/>';
        if (has("tile")) s += '<path d="M46 106l9 7-4 7 10 7-3 8" stroke="#6e5a40" stroke-width="2" fill="none"/>';
        if (has("scratch")) s += '<path d="M30 196l34 14M34 214l28 10M40 188l18 30" stroke="#a8977a" stroke-width="2" stroke-linecap="round"/>';
        if (has("leak")) s += '<ellipse cx="340" cy="274" rx="40" ry="9" fill="#8fb6c6" opacity=".75"/><path d="M349 132v10" stroke="#8fb6c6" stroke-width="3" stroke-linecap="round"/>';
        return s;
      },
      diffs: [
        { id: "oven", tier: 1, x: 200, y: 210, r: 38, label: "Greasy oven" },
        { id: "door", tier: 1, x: 165, y: 58, r: 46, label: "Cupboard door hanging loose" },
        { id: "tile", tier: 1, x: 56, y: 120, r: 28, label: "Cracked tile" },
        { id: "scratch", tier: 1, x: 48, y: 206, r: 32, label: "Scratched cupboard" },
        { id: "leak", tier: 1, x: 340, y: 272, r: 36, label: "Water leak on the floor" },
        { id: "handle", tier: 2, x: 105, y: 72, r: 14, label: "Missing handle, top cupboard" },
        { id: "handle2", tier: 2, x: 308, y: 205, r: 14, label: "Missing handle, bottom cupboard" },
        { id: "chip", tier: 2, x: 80, y: 153, r: 13, label: "Chip in the worktop" },
        { id: "mullion", tier: 2, x: 318, y: 53, r: 20, label: "Broken window frame" },
        { id: "floorcrack", tier: 2, x: 117, y: 289, r: 15, label: "Cracked floor tile" }
      ]
    },
    {
      id: "bedroom",
      name: "Bedroom",
      draw: function (has) {
        var s = rect(0, 0, 400, 232, "#ebe2cf") + rect(0, 224, 400, 8, "#f6efe1") + rect(0, 232, 400, 68, "#b9a58a");
        for (var cx = 10; cx < 400; cx += 22) for (var cy = 242; cy < 300; cy += 16) s += '<circle cx="' + (cx + (cy % 32 ? 11 : 0)) + '" cy="' + cy + '" r="1.4" fill="#a8947a"/>';
        if (has("thread")) s += '<path d="M292 266c6 4 10 8 18 8" stroke="#e7dcc3" stroke-width="2" fill="none" stroke-linecap="round"/>';
        s += '<rect x="246" y="34" width="116" height="116" rx="3" fill="#f8f3e8"/>' + rect(254, 42, 100, 100, "#bfd8c8");
        for (var sy = 44; sy < 136; sy += 8) {
          if (has("blind") && sy === 92) s += '<path d="M254 92l46 10" stroke="#e7dcc3" stroke-width="6"/><path d="M308 96l46-4" stroke="#e7dcc3" stroke-width="6"/>';
          else s += rect(254, sy, 100, 6, "#efe6d2");
        }
        s += '<path d="M346 44v92" stroke="#cdbb98" stroke-width="1.5"/>';
        if (!has("cord")) s += '<circle cx="346" cy="140" r="3" fill="#b8925a"/>';
        s += '<circle cx="118" cy="66" r="24" fill="#cfe0da" stroke="#b8925a" stroke-width="4"/>';
        if (!has("mirror")) s += '<path d="M106 58l10-6M106 68l18-10" stroke="#fff" stroke-width="3" opacity=".7"/>';
        s += '<rect x="30" y="118" width="176" height="72" rx="12" fill="#21503c"/><rect x="18" y="176" width="200" height="26" rx="6" fill="#f8f3e8"/><ellipse cx="78" cy="174" rx="34" ry="11" fill="#fbf8f1"/><ellipse cx="156" cy="174" rx="34" ry="11" fill="#fbf8f1"/>';
        if (has("pillow")) s += '<ellipse cx="160" cy="173" rx="7" ry="3.5" fill="#b59a72" opacity=".8"/>';
        s += '<rect x="18" y="190" width="200" height="40" rx="8" fill="#cfaa6c"/><path d="M18 206h200" stroke="#b8925a" stroke-width="2"/>' + rect(26, 228, 8, 10, "#173a2b");
        if (!has("bedleg")) s += rect(202, 228, 8, 10, "#173a2b");
        s += '<rect x="224" y="176" width="34" height="56" rx="3" fill="#b98c5a"/><path d="M224 204h34" stroke="#9c7445" stroke-width="2"/><circle cx="241" cy="192" r="2.5" fill="#7d5f30"/><circle cx="241" cy="218" r="2.5" fill="#7d5f30"/>';
        s += rect(236, 160, 10, 16, "#7d5f30");
        s += has("lamp") ? '<g transform="rotate(14 241 150)"><path d="M228 140h26l6 20h-38z" fill="#f3ecdc"/><path d="M236 142l6 10 -4 6" stroke="#9c7445" stroke-width="2" fill="none"/></g>' : '<path d="M228 140h26l6 20h-38z" fill="#f3ecdc"/>';
        if (has("hole")) s += '<ellipse cx="60" cy="96" rx="10" ry="8" fill="#5b4a35"/><path d="M50 90l-8-6M70 92l8-6M60 104l-2 8" stroke="#5b4a35" stroke-width="1.6"/>';
        if (has("carpet")) s += '<ellipse cx="132" cy="262" rx="26" ry="9" fill="#6e4f2e" opacity=".55"/>';
        if (has("table")) s += '<path d="M228 182l24 18M230 196l18 10" stroke="#f3e2c0" stroke-width="2" stroke-linecap="round"/>';
        return s;
      },
      diffs: [
        { id: "blind", tier: 1, x: 304, y: 96, r: 32, label: "Broken blind" },
        { id: "hole", tier: 1, x: 60, y: 96, r: 28, label: "Hole in the wall" },
        { id: "carpet", tier: 1, x: 132, y: 262, r: 34, label: "Stain on the carpet" },
        { id: "lamp", tier: 1, x: 242, y: 150, r: 26, label: "Torn lamp shade" },
        { id: "table", tier: 1, x: 240, y: 192, r: 24, label: "Scratched bedside table" },
        { id: "mirror", tier: 2, x: 114, y: 62, r: 18, label: "Mirror lost its shine" },
        { id: "pillow", tier: 2, x: 160, y: 173, r: 14, label: "Stain on the pillow" },
        { id: "cord", tier: 2, x: 346, y: 140, r: 12, label: "Blind cord pull missing" },
        { id: "bedleg", tier: 2, x: 206, y: 233, r: 12, label: "Missing bed leg" },
        { id: "thread", tier: 2, x: 301, y: 270, r: 15, label: "Pulled carpet thread" }
      ]
    }
  ];

  var SPOT_LEVELS = {
    1: { name: "Easy", obvious: 5, subtle: 0, seconds: 40, penalty: 2, pad: 8, mult: 1, text: "5 obvious differences · 40 seconds" },
    2: { name: "Medium", obvious: 3, subtle: 3, seconds: 40, penalty: 3, pad: 4, mult: 2, text: "6 differences, some subtle · 40 seconds · double points" },
    3: { name: "Hard", obvious: 2, subtle: 5, seconds: 35, penalty: 4, pad: 2, mult: 3, text: "7 differences, mostly subtle · 35 seconds · triple points" }
  };

  function roomSvg(room, after, active, marks) {
    var has = function (id) {
      return after && active.indexOf(id) !== -1;
    };
    return '<svg class="photo__svg" viewBox="0 0 400 300" aria-hidden="true" focusable="false">' + room.draw(has) + (marks || "") + "</svg>";
  }

  /* ---------- Situations for "Fair or not?" ---------- */

  var SITUATIONS = {
    1: [
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
    ],
    2: [
      { id: "selffix", icon: "wrench", text: "The tenant repaired a hole in the wall before key return, and it looks good.", fair: false, why: "Fixed properly before key return means nothing is deducted." },
      { id: "notes", icon: "camera", text: "A stained mattress that the tenant noted in the first 7 days.", fair: false, why: "It's in the move-in record, so it was already there." },
      { id: "overcharge", icon: "receipt", text: "€200 deducted for the oven, but the cleaning invoice says €120.", fair: false, why: "Only the real cost on the invoice: €120, not €200." },
      { id: "wine", icon: "layers", text: "A wine stain on the carpet, not in the move-in photos, with a cleaning invoice.", fair: true, why: "Fair. It is new damage, proven by our photos and an invoice." },
      { id: "marks", icon: "home", text: "Light marks on the walls where furniture stood for 3 years.", fair: false, why: "That's normal wear from living in a home." },
      { id: "keys", icon: "key", text: "The keys were never returned, so the landlord changed the lock (invoice €90).", fair: true, why: "Fair. It's a real cost caused by the tenant, backed by an invoice." },
      { id: "fee", icon: "euro", text: "Deposera's service fee taken out of the tenant's deposit.", fair: false, why: "Never. Our fee is paid upfront at booking and never comes out of the deposit." }
    ],
    3: [
      { id: "day13", icon: "calendar", text: "The landlord reports missed damage on day 13 after key return, and our move-out photos show it.", fair: true, why: "Fair. It's within the 14 days, and our photos prove it." },
      { id: "after", icon: "camera", text: "The landlord reports a broken window on day 10, but our move-out photos show it intact.", fair: false, why: "Our photos prove it was fine at key return." },
      { id: "record", icon: "search", text: "The tenant says a blind was always broken, but it's not in the photos or the 7-day notes.", fair: true, why: "The move-in record is final after 7 days. If it's not there, it counts as new." },
      { id: "oldcarpet", icon: "layers", text: "Paint spilled on a 10-year-old carpet. The landlord wants the full price of a new one.", fair: false, why: "The old carpet was nearly worn out anyway. Only a fair part of the cost can be deducted." },
      { id: "hold", icon: "vault", text: "The tenant disputes one €60 item, so the landlord wants to hold the whole €1,500.", fair: false, why: "Only the amount in question stays on hold. The rest is paid on time." },
      { id: "nofix", icon: "door", text: "The tenant left a damaged door unfixed after the pre-inspection. Repair invoice: €180.", fair: true, why: "Fair. The tenant had the chance to fix it first, and the cost is proven." }
    ]
  };

  var FAIR_LEVELS = {
    1: { name: "Easy", seconds: 0, text: "Clear cases · no timer" },
    2: { name: "Medium", seconds: 15, text: "Trickier cases · 15 seconds each" },
    3: { name: "Hard", seconds: 10, text: "Expert cases · 10 seconds each" }
  };

  /* ---------- State ---------- */

  var state = {
    screen: "hub",
    roomIndex: Number(load("deposera-room-index", 0)) || 0,
    spot: null,
    fair: null
  };

  var timers = { spot: null, countdown: null, fair: null, board: null };

  function clearTimers() {
    clearInterval(timers.board);
    clearInterval(timers.spot);
    clearInterval(timers.fair);
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
    return '<div class="vote"><div class="vote__qr">' + QR + '</div><div class="vote__text"><p class="vote__kicker">' + (text || "Thanks for playing") + '</p><p class="vote__title"><em>Deposera</em></p><p class="vote__url">Scan to visit our website<br>francis823.github.io/Deposera</p></div></div>';
  }

  function stars(level) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<span class="star' + (i <= level ? " is-on" : "") + '">★</span>';
    return '<span class="stars" aria-label="Level ' + level + ' of 3">' + s + "</span>";
  }

  /* ---------- Hub ---------- */

  /* ---------- Shared leaderboard ----------
     With a Google Sheet connected (games/config.js), every phone and the
     tablet send scores there and read the same list. Without it, scores
     stay on this device. Scores that fail to send are kept and retried. */

  var SCORES_URL = String(window.DEPOSERA_SCORES_URL || "").trim();
  var board = { list: null, at: 0, error: false };
  var GAME_NAMES = { spot: "Spot the damage", fair: "Fair or not?" };

  function localBoard() {
    return load("deposera-board", []);
  }

  function normalise(rows) {
    return (rows || []).map(function (r) {
      var game = r.game === "fair" || r.game === "Fair or not?" ? "fair" : "spot";
      var result = String(r.result || "");
      return { id: String(r.id || ""), name: String(r.name || "").slice(0, 16), game: game, level: Number(r.level) || 1, score: Number(r.score) || 0, result: result, ms: timeFromResult(result), t: Number(r.t) || Date.parse(r.time) || 0 };
    }).filter(function (e) { return e.name; });
  }

  function withPending(list) {
    var ids = {};
    list.forEach(function (e) { ids[e.id] = true; });
    return list.concat(load("deposera-pending", []).filter(function (e) { return !ids[e.id]; }));
  }

  function fetchBoard(force) {
    if (!SCORES_URL) {
      board.list = localBoard();
      board.at = Date.now();
      return Promise.resolve(board.list);
    }
    if (!force && board.list && Date.now() - board.at < 10000) return Promise.resolve(board.list);
    return fetch(SCORES_URL + (SCORES_URL.indexOf("?") === -1 ? "?" : "&") + "t=" + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        board.server = normalise(data.scores);
        board.list = withPending(board.server);
        board.at = Date.now();
        board.error = false;
        return board.list;
      })
      .catch(function () {
        // Offline: show the last list we had, plus this device's own scores.
        board.error = true;
        var seen = {};
        board.list = withPending((board.server || []).concat(localBoard()).filter(function (e) {
          if (seen[e.id]) return false;
          seen[e.id] = true;
          return true;
        }));
        return board.list;
      });
  }

  var flushing = false;
  function flushPending() {
    var pending = load("deposera-pending", []);
    if (!SCORES_URL || !pending.length || flushing) return Promise.resolve();
    flushing = true;
    var item = pending[0];
    return fetch(SCORES_URL, { method: "POST", body: JSON.stringify(item) })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok) throw new Error("not saved");
        save("deposera-pending", load("deposera-pending", []).filter(function (e) { return e.id !== item.id; }));
        flushing = false;
        board.at = 0;
        return flushPending();
      })
      .catch(function () {
        flushing = false;
      });
  }
  setInterval(flushPending, 20000);

  function submitScore(entry) {
    var list = localBoard();
    list.push(entry);
    save("deposera-board", list.slice(-2000));
    if (!SCORES_URL) return Promise.resolve();
    var pending = load("deposera-pending", []);
    pending.push(entry);
    save("deposera-pending", pending);
    return flushPending();
  }

  function secs(ms) {
    return (Math.round(ms / 100) / 10).toFixed(1) + " s";
  }

  // The time is saved inside the result text, e.g. "5/5 correct in 23.4 s".
  function timeFromResult(result) {
    var m = /in ([\d.]+) s/.exec(result || "");
    return m ? Math.round(parseFloat(m[1]) * 1000) : Infinity;
  }

  function better(a, b) {
    return a.score - b.score || b.ms - a.ms || b.t - a.t;
  }

  // Best result per player for one game: most points first, then fastest time.
  function ranked(list, game) {
    var best = {};
    (list || []).forEach(function (e) {
      if (e.game !== game || !e.name) return;
      var key = e.name.toLowerCase();
      var b = best[key];
      if (!b || better(e, b) > 0) best[key] = e;
    });
    return Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) {
      return better(b, a);
    });
  }

  function boardRows(rows, highlightName, limit) {
    if (!rows.length) return '<p class="muted">No scores yet. Be the first!</p>';
    var key = highlightName ? highlightName.toLowerCase() : "";
    var shown = rows.slice(0, limit || rows.length);
    var youIndex = -1;
    rows.forEach(function (e, i) { if (key && e.name.toLowerCase() === key) youIndex = i; });
    var html = '<ol class="board">' + shown.map(function (e, i) {
      return '<li class="' + (i === youIndex ? "is-you" : "") + '"><span class="board__rank">' + (i + 1) + '</span><span class="board__name">' + esc(e.name) + ' <span class="board__level">L' + e.level + '</span></span><span class="board__score">' + e.score + (isFinite(e.ms) ? '<small>' + secs(e.ms) + "</small>" : "") + "</span></li>";
    }).join("") + "</ol>";
    if (youIndex >= (limit || rows.length)) {
      html += '<ol class="board board--you" start="' + (youIndex + 1) + '"><li class="is-you"><span class="board__rank">' + (youIndex + 1) + '</span><span class="board__name">' + esc(rows[youIndex].name) + ' <span class="board__level">L' + rows[youIndex].level + '</span></span><span class="board__score">' + rows[youIndex].score + (isFinite(rows[youIndex].ms) ? "<small>" + secs(rows[youIndex].ms) + "</small>" : "") + "</span></li></ol>";
    }
    return html;
  }

  // Fill a small "top 5" box on a result screen once the list has loaded.
  function fillMiniBoard(game, name) {
    fetchBoard(true).then(function (list) {
      var el = stage.querySelector('[data-mini-board="' + game + '"]');
      if (el) el.innerHTML = boardRows(ranked(list, game), name, 5);
    });
  }

  function boardStatus() {
    if (!SCORES_URL) return "Scores saved on this device";
    if (board.error) return "Offline right now: showing the last scores we had";
    return "Live · everyone's scores · updated " + new Date(board.at || Date.now()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function renderBoard(game) {
    clearTimers();
    state.screen = "board";
    state.boardGame = game || state.boardGame || "spot";
    var g = state.boardGame;
    function paint() {
      if (state.screen !== "board") return;
      var list = board.list || [];
      var rows = ranked(list, g);
      var games = list.filter(function (e) { return e.game === g; }).length;
      show(
        '<section class="lb">' +
          '<div class="lb__head"><div><p class="eyebrow">Leaderboard</p><h2>Who protects deposits <em>best?</em></h2><p class="lb__status' + (board.error ? " is-off" : "") + '"><span class="lb__dot"></span>' + boardStatus() + "</p></div>" +
          '<button class="btn" type="button" data-pick="' + g + '">' + icon("play", "i i--sm") + "Play " + GAME_NAMES[g] + "</button></div>" +
          '<div class="tabs-row" role="tablist" aria-label="Choose a game">' +
            ["spot", "fair"].map(function (k) {
              return '<button class="tab' + (k === g ? " is-on" : "") + '" type="button" role="tab" aria-selected="' + (k === g) + '" data-board-tab="' + k + '">' + GAME_NAMES[k] + "</button>";
            }).join("") +
          "</div>" +
          '<p class="lb__count">Most points first. Same points? The fastest goes on top. · ' + rows.length + (rows.length === 1 ? " player" : " players") + " · " + games + (games === 1 ? " game" : " games") + " played</p>" +
          (board.list ? boardRows(rows, state.sessionName, 50) : '<p class="muted">Loading the leaderboard…</p>') +
        "</section>",
        false
      );
    }
    paint();
    fetchBoard(true).then(paint);
    timers.board = setInterval(function () {
      fetchBoard(true).then(paint);
    }, 15000);
  }

  function renderHub() {
    clearTimers();
    state.screen = "hub";
    var top = ranked(board.list || localBoard(), "spot")[0];
    show(
      '<section class="hub">' +
        '<div class="hub__intro"><p class="eyebrow">Booth games</p><h1>Can you protect <em>a deposit?</em></h1><p class="lead">Play a game and win a gold coin. Three levels each.</p></div>' +
        '<div class="hub__games">' +
          '<button class="game-card" type="button" data-pick="spot"><span class="game-card__icon">' + icon("search") + '</span><span class="game-card__title">Spot the damage</span><span class="game-card__text">Find the differences between move-in and move-out before time runs out.</span>' +
          (top ? '<span class="game-card__badge">' + icon("trophy", "i i--sm") + "Top score " + top.score + " by " + esc(top.name) + "</span>" : '<span class="game-card__badge">' + icon("trophy", "i i--sm") + "Be the first on the leaderboard</span>") +
          '<span class="game-card__play">' + icon("play", "i i--sm") + "Play</span></button>" +
          '<button class="game-card game-card--light" type="button" data-pick="fair"><span class="game-card__icon">' + icon("scales") + '</span><span class="game-card__title">Fair or not?</span><span class="game-card__text">Real situations. Would you keep the money?</span><span class="game-card__badge">' + icon("check", "i i--sm") + "See how other visitors voted</span>" +
          '<span class="game-card__play">' + icon("play", "i i--sm") + "Play</span></button>" +
        "</div>" +
        voteBlock("Deposera · Independent deposit holding") +
      "</section>"
    );
    fetchBoard().then(function (list) {
      var best = ranked(list, "spot")[0];
      var badge = stage.querySelector('[data-pick="spot"] .game-card__badge');
      if (best && badge && state.screen === "hub") badge.innerHTML = icon("trophy", "i i--sm") + "Top score " + best.score + " by " + esc(best.name);
    });
  }

  /* ---------- Level picker ---------- */

  function renderPicker(game) {
    clearTimers();
    state.screen = "pick";
    var levels = game === "spot" ? SPOT_LEVELS : FAIR_LEVELS;
    var title = game === "spot" ? "Spot the damage" : "Fair or not?";
    var html = '<section class="picker"><div class="picker__head"><p class="eyebrow">' + title + '</p><h2>Choose your level</h2></div><div class="levels">';
    [1, 2, 3].forEach(function (n) {
      html += '<button class="level level--' + n + '" type="button" data-start="' + game + '" data-level="' + n + '">' + stars(n) +
        '<span class="level__name">Level ' + n + " · " + levels[n].name + '</span><span class="level__text">' + levels[n].text + "</span></button>";
    });
    html += '</div><button class="btn btn--ghost picker__back" type="button" data-home>' + icon("home", "i i--sm") + "Back to menu</button></section>";
    show(html);
  }

  /* ---------- Players list (every game played on this device) ---------- */

  function plays() {
    return load("deposera-plays", []);
  }

  function logPlay(record) {
    var all = plays();
    record.t = Date.now();
    record.name = "";
    all.push(record);
    save("deposera-plays", all);
    return record.t;
  }

  function namePlay(t, name) {
    var all = plays();
    all.forEach(function (p) {
      if (p.t === t) p.name = name;
    });
    save("deposera-plays", all);
  }

  function cleanName(value) {
    return String(value).replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);
  }

  function entryForm(label) {
    return '<form class="entry" data-entry><label for="initials">' + label + '</label><div class="entry__row"><input id="initials" name="initials" maxlength="16" autocomplete="off" autocapitalize="words" required placeholder="Your first name" value="' + esc(state.sessionName || "") + '"><button class="btn" type="submit">Save</button><button class="btn btn--ghost" type="button" data-skip>Skip</button></div></form>';
  }

  function timeOf(t) {
    return new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function renderPlayers() {
    clearTimers();
    state.screen = "players";
    var all = plays().slice().reverse();
    var named = {};
    var games = { "Spot the damage": 0, "Fair or not?": 0 };
    var levels = { 1: 0, 2: 0, 3: 0 };
    all.forEach(function (p) {
      if (p.name) named[p.name] = true;
      games[p.game] = (games[p.game] || 0) + 1;
      levels[p.level] = (levels[p.level] || 0) + 1;
    });
    var best = ranked(localBoard(), "spot")[0];
    var rows = all.map(function (p) {
      return "<tr><td>" + timeOf(p.t) + "</td><td class=\"players__name\">" + (p.name ? esc(p.name) : '<span class="muted">-</span>') + "</td><td>" + esc(p.game) + "</td><td>" + stars(p.level) + "</td><td>" + esc(p.result) + '</td><td class="players__num">' + p.score + "</td></tr>";
    }).join("");
    show(
      '<section class="players">' +
        '<div class="players__head"><div><p class="eyebrow">Staff only</p><h2>Everyone who played</h2><p class="muted">Games played on this device. Visitors\' own phones keep their own scores.</p></div>' +
        '<div class="btn-row"><button class="btn" type="button" data-csv' + (all.length ? "" : " disabled") + '>Download list (CSV)</button><button class="btn btn--ghost" type="button" data-home>' + icon("home", "i i--sm") + "Back to games</button></div></div>" +
        '<div class="players__stats">' +
          '<div><span>' + all.length + "</span>games played</div>" +
          "<div><span>" + Object.keys(named).length + "</span>players with initials</div>" +
          "<div><span>" + games["Spot the damage"] + "</span>Spot the damage</div>" +
          "<div><span>" + games["Fair or not?"] + "</span>Fair or not?</div>" +
          "<div><span>" + levels[3] + "</span>level 3 games</div>" +
          "<div><span>" + (best ? best.score : 0) + "</span>top score" + (best ? " (" + esc(best.name) + ")" : "") + "</div>" +
        "</div>" +
        (all.length
          ? '<div class="players__table"><table><thead><tr><th>Time</th><th>Initials</th><th>Game</th><th>Level</th><th>Result</th><th class="players__num">Score</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
          : '<p class="muted">Nobody has played on this device yet.</p>') +
        '<button class="link-btn" type="button" data-clear-players>Clear the list, leaderboard and votes</button>' +
      "</section>"
    );
  }

  function downloadCsv() {
    var lines = [["Date", "Time", "Initials", "Game", "Level", "Result", "Score"]];
    plays().forEach(function (p) {
      var d = new Date(p.t);
      lines.push([d.toISOString().slice(0, 10), timeOf(p.t), p.name, p.game, p.level, p.result, p.score]);
    });
    var csv = lines.map(function (row) {
      return row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "deposera-players-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }

  /* ---------- Spot the damage ---------- */

  function pickDiffs(room, cfg) {
    var obvious = shuffle(room.diffs.filter(function (d) { return d.tier === 1; })).slice(0, cfg.obvious);
    var subtle = shuffle(room.diffs.filter(function (d) { return d.tier === 2; })).slice(0, cfg.subtle);
    return shuffle(obvious.concat(subtle));
  }

  function startSpot(level) {
    clearTimers();
    var cfg = SPOT_LEVELS[level];
    var room = ROOMS[state.roomIndex % ROOMS.length];
    state.roomIndex = (state.roomIndex + 1) % ROOMS.length;
    save("deposera-room-index", state.roomIndex);
    state.screen = "spot";
    var diffs = pickDiffs(room, cfg);
    state.spot = {
      room: room,
      level: level,
      cfg: cfg,
      diffs: diffs,
      active: diffs.map(function (d) { return d.id; }),
      found: [],
      left: cfg.seconds,
      misses: [],
      done: false
    };

    var n = 3;
    function tick() {
      show('<section class="countdown"><p class="eyebrow">' + room.name + " · Level " + level + " " + stars(level) + '</p><h2>Find ' + diffs.length + ' differences</h2><p class="countdown__num" aria-live="assertive">' + n + '</p><p class="lead">Tap the damage on either photo. Wrong taps cost ' + cfg.penalty + " seconds.</p></section>", n === 3);
      beep(440 + (3 - n) * 120, 0.12);
      n--;
      if (n >= 0) timers.countdown = setTimeout(n === 0 ? playSpot : tick, 900);
    }
    tick();
  }

  function marksFor(after) {
    var sp = state.spot;
    var s = "";
    sp.found.forEach(function (i) {
      var d = sp.diffs[i];
      s += '<circle class="mark" cx="' + d.x + '" cy="' + d.y + '" r="' + Math.max(d.r, 16) + '"/>';
    });
    if (sp.done) {
      sp.diffs.forEach(function (d, i) {
        if (sp.found.indexOf(i) === -1) s += '<circle class="mark mark--missed" cx="' + d.x + '" cy="' + d.y + '" r="' + Math.max(d.r, 16) + '"/>';
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
      '<figure class="photo" data-photo><span class="photo__tag">Move-in</span>' + roomSvg(sp.room, false, sp.active, marksFor(false)) + "</figure>" +
      '<figure class="photo" data-photo><span class="photo__tag photo__tag--out">Move-out</span>' + roomSvg(sp.room, true, sp.active, marksFor(true)) + "</figure>" +
      "</div>";
  }

  function spotList() {
    var sp = state.spot;
    return '<ol class="found">' + sp.diffs.map(function (d, i) {
      var got = sp.found.indexOf(i) !== -1;
      var cls = got ? "is-found" : sp.done ? "is-missed" : "";
      return '<li class="' + cls + '"><span class="found__dot">' + (got ? icon("check", "i i--xs") : i + 1) + "</span><span>" + (got || sp.done ? d.label : "???") + "</span></li>";
    }).join("") + "</ol>";
  }

  function renderSpotPlay() {
    var sp = state.spot;
    var pct = (sp.left / sp.cfg.seconds) * 100;
    show(
      '<section class="spot">' +
        '<div class="spot__bar"><div><p class="eyebrow">' + sp.room.name + " · Level " + sp.level + " " + stars(sp.level) + '</p><h2 class="spot__title">Spot the damage</h2></div>' +
        '<div class="spot__stats"><span class="pill" aria-live="polite"><strong>' + sp.found.length + "</strong>/" + sp.diffs.length + " found</span>" +
        '<span class="timer' + (sp.left <= 10 ? " is-low" : "") + '" style="--p:' + pct + '"><span>' + sp.left + "</span></span></div></div>" +
        spotBoard() + spotList() +
      "</section>",
      false
    );
  }

  function playSpot() {
    state.spot.startedAt = Date.now();
    state.spot.penaltyMs = 0;
    renderSpotPlay();
    timers.spot = setInterval(function () {
      var sp = state.spot;
      sp.left = Math.max(0, sp.left - 1);
      if (sp.left <= 5 && sp.left > 0) beep(880, 0.06);
      if (sp.left === 0) return endSpot();
      var timer = stage.querySelector(".timer");
      if (timer) {
        timer.style.setProperty("--p", (sp.left / sp.cfg.seconds) * 100);
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

    // Pick the closest unfound difference within reach.
    var hit = -1;
    var best = Infinity;
    sp.diffs.forEach(function (d, i) {
      if (sp.found.indexOf(i) !== -1) return;
      var dist = Math.hypot(d.x - x, d.y - y);
      if (dist <= d.r + sp.cfg.pad && dist < best) {
        best = dist;
        hit = i;
      }
    });

    if (hit !== -1) {
      sp.found.push(hit);
      soundGood();
      toast(sp.diffs[hit].label + "!");
      if (sp.found.length === sp.diffs.length) return endSpot();
    } else {
      sp.misses.push({ x: x, y: y });
      sp.left = Math.max(0, sp.left - sp.cfg.penalty);
      sp.penaltyMs += sp.cfg.penalty * 1000;
      soundBad();
      toast("Not there: -" + sp.cfg.penalty + " seconds");
      if (sp.left === 0) return endSpot();
    }
    renderSpotPlay();
  }

  function endSpot() {
    clearInterval(timers.spot);
    var sp = state.spot;
    sp.done = true;
    sp.all = sp.found.length === sp.diffs.length;
    sp.score = sp.found.length * 100 * sp.cfg.mult;
    sp.ms = Math.min(sp.cfg.seconds * 1000, Date.now() - sp.startedAt + sp.penaltyMs);
    sp.playId = logPlay({ game: "Spot the damage", level: sp.level, score: sp.score, result: sp.found.length + "/" + sp.diffs.length + " found in " + secs(sp.ms) + " (" + sp.room.name + ")" });
    if (sp.all) soundWin();
    renderSpotResult();
    if (sp.all) confetti();
  }

  function nextLevelButton(game, level, earned) {
    if (level >= 3 || !earned) return "";
    return '<button class="btn" type="button" data-start="' + game + '" data-level="' + (level + 1) + '">' + stars(level + 1) + " Try level " + (level + 1) + "</button>";
  }

  function renderSpotResult() {
    var sp = state.spot;
    var total = sp.diffs.length;
    var title = sp.all ? (sp.level === 3 ? "Expert inspector!" : "Every bit of damage found!") : sp.found.length >= total - 2 ? "Good eye!" : "Damage is easy to miss.";
    var entry = sp.named ? "" : entryForm("Put your name on the leaderboard");
    show(
      '<section class="result">' +
        '<div class="result__main">' +
          '<p class="eyebrow">' + sp.room.name + " · Level " + sp.level + " " + stars(sp.level) + '</p><h2>' + title + "</h2>" +
          '<p class="result__score"><span>' + sp.score + "</span> points" + (sp.cfg.mult > 1 ? " (×" + sp.cfg.mult + ")" : "") + " · " + secs(sp.ms) + "</p>" +
          '<p class="lead">You found ' + sp.found.length + " of " + total + (sp.all ? " in " + secs(sp.ms) + ". The fastest players top the leaderboard." : ".") + ' That\'s why <strong>we take neutral photos at move-in and move-out</strong>: so nobody has to argue about what changed.</p>' +
          entry +
          spotBoard() + spotList() +
        "</div>" +
        '<aside class="result__side"><h3>' + icon("trophy", "i i--sm") + 'Leaderboard</h3><div data-mini-board="spot"><p class="muted">Loading…</p></div><button class="link-btn" type="button" data-board="spot">See everyone</button>' +
          '<div class="btn-row">' + nextLevelButton("spot", sp.level, sp.all) +
          '<button class="btn' + (sp.all && sp.level < 3 ? " btn--ghost" : "") + '" type="button" data-start="spot" data-level="' + sp.level + '">' + icon("play", "i i--sm") + 'Play again</button><button class="btn btn--ghost" type="button" data-home>' + icon("home", "i i--sm") + "Menu</button></div>" +
          voteBlock() +
        "</aside>" +
      "</section>"
    );
    fillMiniBoard("spot", sp.named ? sp.name : "");
    var input = stage.querySelector("#initials");
    if (input && !input.value) input.focus();
  }

  function saveInitials(form) {
    var sp = state.spot;
    var name = cleanName(form.initials.value);
    if (!name) {
      form.initials.focus();
      return;
    }
    namePlay(sp.playId, name);
    sp.named = true;
    sp.name = name;
    saveToBoard("spot", name, sp.level, sp.score, sp.found.length + "/" + sp.diffs.length + " found", sp.ms);
    renderSpotResult();
  }

  // Send a named score, then tell the player where they rank.
  function saveToBoard(game, name, level, score, result, ms) {
    state.sessionName = name;
    var entry = { id: Date.now() + "-" + Math.random().toString(36).slice(2, 8), name: name, game: game, level: level, score: score, result: result + " in " + secs(ms), ms: ms, t: Date.now() };
    submitScore(entry).then(function () {
      return fetchBoard(true);
    }).then(function (list) {
      var rows = ranked(withPending(list.some(function (e) { return e.id === entry.id; }) ? list : list.concat(entry)), game);
      var rank = 1;
      rows.forEach(function (e, i) { if (e.name.toLowerCase() === name.toLowerCase()) rank = i + 1; });
      toast("Saved! " + name + ", you're #" + rank + " of " + rows.length + ".");
      var el = stage.querySelector('[data-mini-board="' + game + '"]');
      if (el) el.innerHTML = boardRows(rows, name, 5);
    });
  }

  /* ---------- Fair or not? ---------- */

  function startFair(level) {
    clearTimers();
    state.screen = "fair";
    state.fair = { level: level, cfg: FAIR_LEVELS[level], list: shuffle(SITUATIONS[level]).slice(0, 5), index: 0, correct: 0, answer: null, left: 0 };
    renderFair();
  }

  function votes() {
    return load("deposera-fair-votes", {});
  }

  function startQuestionTimer() {
    var f = state.fair;
    clearInterval(timers.fair);
    if (!f.cfg.seconds) return;
    f.left = f.cfg.seconds;
    timers.fair = setInterval(function () {
      f.left--;
      var el = stage.querySelector(".qtimer");
      if (el) {
        el.style.setProperty("--p", (f.left / f.cfg.seconds) * 100);
        el.classList.toggle("is-low", f.left <= 3);
        el.querySelector("span").textContent = f.left;
      }
      if (f.left <= 3 && f.left > 0) beep(880, 0.06);
      if (f.left <= 0) {
        clearInterval(timers.fair);
        answerFair("timeout");
      }
    }, 1000);
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
      var timedOut = f.answer === "timeout";
      var v = votes()[q.id] || { fair: 0, not: 0 };
      var total = v.fair + v.not;
      var pct = total ? Math.round((v.fair / total) * 100) : 0;
      reveal =
        '<div class="reveal ' + (right ? "is-right" : "is-wrong") + '" role="status">' +
          '<p class="reveal__verdict">' + icon(right ? "check" : timedOut ? "clock" : "close", "i") + "<span>" + (right ? "Correct!" : timedOut ? "Time's up!" : "Not quite.") + " It's <strong>" + (q.fair ? "fair" : "not fair") + "</strong>.</span></p>" +
          '<p class="reveal__why">' + esc(q.why) + "</p>" +
          (total ? '<div class="poll"><p class="poll__label">How visitors voted</p><div class="poll__bar"><span style="width:' + pct + '%"></span></div><p class="poll__nums"><span>Fair ' + pct + "%</span><span>Not fair " + (100 - pct) + "%</span></p></div>" : "") +
          '<button class="btn btn--big" type="button" data-next>' + (f.index < f.list.length - 1 ? "Next situation" : "See my score") + "</button>" +
        "</div>";
    }

    var timer = f.cfg.seconds && f.answer === null ? '<span class="timer qtimer" style="--p:100"><span>' + f.cfg.seconds + "</span></span>" : "";

    show(
      '<section class="fair">' +
        '<div class="fair__head"><p class="eyebrow">Fair or not? · Level ' + f.level + " " + stars(f.level) + " · " + (f.index + 1) + " of " + f.list.length + '</p><div class="fair__right">' + timer + '<div class="dots" aria-hidden="true">' + dots + "</div></div></div>" +
        '<div class="situation"><span class="situation__icon">' + icon(q.icon) + '</span><h2 class="situation__text">' + esc(q.text) + '</h2><p class="muted">Should this come out of the deposit?</p></div>' +
        (f.answer === null
          ? '<div class="choices"><button class="choice choice--fair" type="button" data-answer="fair">' + icon("check") + 'Fair</button><button class="choice choice--not" type="button" data-answer="not">' + icon("close") + "Not fair</button></div>"
          : reveal) +
      "</section>",
      f.answer === null
    );
    if (f.answer === null) {
      f.askedAt = Date.now();
      startQuestionTimer();
    } else {
      stage.querySelector("[data-next]").focus();
    }
  }

  function answerFair(choice) {
    var f = state.fair;
    if (f.answer !== null) return;
    clearInterval(timers.fair);
    var q = f.list[f.index];
    f.ms = (f.ms || 0) + (choice === "timeout" ? f.cfg.seconds * 1000 : Date.now() - f.askedAt);
    if (choice === "timeout") {
      f.answer = "timeout";
      soundBad();
    } else {
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
      finishFair();
    }
  }

  function finishFair() {
    clearInterval(timers.fair);
    var f = state.fair;
    f.score = f.correct * 100 * f.level;
    f.playId = logPlay({ game: "Fair or not?", level: f.level, score: f.score, result: f.correct + "/5 correct in " + secs(f.ms) });
    if (f.correct >= 4) {
      soundWin();
      setTimeout(confetti, 50);
    }
    renderFairResult();
  }

  function saveFairInitials(form) {
    var f = state.fair;
    var name = cleanName(form.initials.value);
    if (!name) {
      form.initials.focus();
      return;
    }
    namePlay(f.playId, name);
    f.named = true;
    f.name = name;
    saveToBoard("fair", name, f.level, f.score, f.correct + "/5 correct", f.ms);
    renderFairResult();
  }

  function renderFairResult() {
    var f = state.fair;
    var c = f.correct;
    var title = c === 5 ? (f.level === 3 ? "Deposit expert!" : "Perfect! You think like Deposera.") : c >= 3 ? "Nice judgement!" : "Deposit rules can be tricky.";
    show(
      '<section class="result result--fair">' +
        '<div class="result__main">' +
          '<p class="eyebrow">Fair or not? · Level ' + f.level + " " + stars(f.level) + '</p><h2>' + title + '</h2><p class="result__score"><span>' + c + "/5</span> correct · " + f.score + " points" + (f.level > 1 ? " (×" + f.level + ")" : "") + " · " + secs(f.ms) + "</p>" +
          '<p class="lead">At Deposera, <strong>a deposit is only kept for real, proven damage</strong>. We check every deduction against our photos and an invoice, and normal wear never counts.</p>' +
          (f.named ? "" : entryForm("Put your name on the leaderboard")) +
          '<div class="btn-row">' + nextLevelButton("fair", f.level, c >= 4) +
          '<button class="btn' + (c >= 4 && f.level < 3 ? " btn--ghost" : "") + '" type="button" data-start="fair" data-level="' + f.level + '">' + icon("play", "i i--sm") + 'Play again</button><button class="btn btn--ghost" type="button" data-pick="spot">' + icon("search", "i i--sm") + "Try Spot the damage</button></div>" +
        "</div>" +
        '<aside class="result__side result__side--board"><h3>' + icon("trophy", "i i--sm") + 'Leaderboard</h3><div data-mini-board="fair"><p class="muted">Loading…</p></div><button class="link-btn" type="button" data-board="fair">See everyone</button>' + voteBlock("Thanks for playing") + "</aside>" +
      "</section>"
    );
    fillMiniBoard("fair", f.named ? f.name : "");
    var input = stage.querySelector("#initials");
    if (input && !input.value) input.focus();
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
    if (d.home !== undefined) {
      if (location.hash) history.replaceState(null, "", location.pathname);
      if (el.classList.contains("brand")) return brandTap();
      return renderHub();
    }
    if (d.pick) return renderPicker(d.pick);
    if (d.board !== undefined) return renderBoard(d.board || state.boardGame || "spot");
    if (d.boardTab) {
      state.boardGame = d.boardTab;
      return renderBoard(d.boardTab);
    }
    if (d.start === "spot") return startSpot(Number(d.level) || 1);
    if (d.start === "fair") return startFair(Number(d.level) || 1);
    if (d.answer) return answerFair(d.answer);
    if (d.next !== undefined) return nextFair();
    if (d.skip !== undefined) {
      if (state.screen === "spot") {
        state.spot.named = true;
        return renderSpotResult();
      }
      state.fair.named = true;
      return renderFairResult();
    }
    if (d.csv !== undefined) return downloadCsv();
    if (d.clearPlayers !== undefined) {
      if (window.confirm("Clear the players list, the leaderboard and the visitor votes on this device?")) {
        save("deposera-plays", []);
        save("deposera-board", []);
        save("deposera-spot-scores", []);
        save("deposera-fair-votes", {});
        renderPlayers();
        toast("Cleared.");
      }
      return;
    }
    if (d.photo !== undefined && state.screen === "spot") return tapPhoto(event, el);
    if (d.fullscreen !== undefined) {
      var root = document.documentElement;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen().catch(function () {});
    }
  });

  document.addEventListener("submit", function (event) {
    event.preventDefault();
    if (event.target.matches("[data-entry]")) {
      if (state.screen === "spot") saveInitials(event.target);
      else saveFairInitials(event.target);
    }
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
    if (state.screen !== "hub" && state.screen !== "players" && state.screen !== "board" && !playing && Date.now() - lastActivity > IDLE_SECONDS * 1000) {
      state.sessionName = "";
      renderHub();
    }
  }, 5000);

  // Staff: tap the Deposera logo 5 times quickly to open the players list.
  var taps = [];
  function brandTap() {
    var now = Date.now();
    taps = taps.filter(function (t) { return now - t < 2500; });
    taps.push(now);
    if (taps.length >= 5) {
      taps = [];
      return renderPlayers();
    }
    renderHub();
  }

  // Staff shortcuts: games/index.html#players opens the players list,
  // games/index.html#reset clears the list, leaderboard and votes.
  if (location.hash === "#reset" && window.confirm("Clear the players list, the leaderboard and the visitor votes on this device?")) {
    save("deposera-plays", []);
    save("deposera-board", []);
    save("deposera-spot-scores", []);
    save("deposera-fair-votes", {});
    history.replaceState(null, "", location.pathname);
  }

  window.addEventListener("hashchange", function () {
    if (location.hash === "#players") renderPlayers();
    if (location.hash === "#leaderboard") renderBoard("spot");
  });

  if (location.hash === "#players") renderPlayers();
  else if (location.hash === "#leaderboard") renderBoard("spot");
  else renderHub();
  flushPending();
})();
