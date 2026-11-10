/* Deposera site scripts: menu, scroll effects, coin game, tabs, FAQ filter, repair checklist and forms. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Helpers ---------- */

  function formatEUR(value) {
    var whole = Math.abs(value - Math.round(value)) < 0.005;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2
    }).format(whole ? Math.round(value) : value);
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, reduceMotion ? 0 : ms);
    });
  }

  // Count a number up or down inside an element. Returns a cancel function.
  function animateNumber(el, from, to, duration, format) {
    format = format || formatEUR;
    if (reduceMotion || from === to) {
      el.textContent = format(to);
      return function () {};
    }
    var start = null;
    var frame;
    function step(time) {
      if (start === null) start = time;
      var t = Math.min((time - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = from + (to - from) * eased;
      el.textContent = format(t < 1 ? Math.round(value) : to);
      if (t < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return function () {
      cancelAnimationFrame(frame);
    };
  }

  /* ---------- Header and menu ---------- */

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var menuButton = document.querySelector(".menu-button");
  var nav = document.getElementById("site-nav");
  if (menuButton && nav) {
    var setMenu = function (open) {
      menuButton.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (nav.classList.contains("is-open") && !header.contains(event.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Scroll reveal and counters ---------- */

  var revealItems = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-count]");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach(function (item, index) {
      // Stagger items that share a parent, like cards in a grid.
      var siblings = item.parentElement.querySelectorAll(":scope > .reveal");
      var position = Array.prototype.indexOf.call(siblings, item);
      item.style.transitionDelay = Math.min(position, 4) * 90 + "ms";
      revealObserver.observe(item);
    });

    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          animateNumber(el, 0, Number(el.dataset.count), 1200, String);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      el.textContent = "0";
      countObserver.observe(el);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------- Coin game: drag the deposit into the tenant's pocket ---------- */

  function initCoinGame(root) {
    var stage = root.querySelector("[data-stage]");
    var coin = root.querySelector("[data-coin]");
    var pocket = root.querySelector("[data-pocket]");
    var status = root.querySelector("[data-coin-status]");
    var badge = root.querySelector("[data-coin-badge]");
    var heldEl = root.querySelector("[data-coin-held]");
    var returnedEl = root.querySelector("[data-coin-returned]");
    var resetButton = root.querySelector("[data-coin-reset]");
    var amount = Number(root.dataset.amount) || 1500;
    var initialMessage = status.textContent;

    var state = "idle"; // idle, dragging, animating, done
    var offset = { x: 0, y: 0 };
    var pointerStart = null;
    var moved = false;
    var suppressClick = false;

    function setOffset(x, y) {
      offset.x = x;
      offset.y = y;
      coin.style.setProperty("--dx", x + "px");
      coin.style.setProperty("--dy", y + "px");
    }

    function coinCentre() {
      var r = coin.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    // Where the coin centre would be with no drag offset.
    function homeCentre() {
      var c = coinCentre();
      return { x: c.x - offset.x, y: c.y - offset.y };
    }

    function isOverPocket() {
      var c = coinCentre();
      var p = pocket.getBoundingClientRect();
      var pad = Math.max(12, p.width * 0.12);
      return c.x > p.left - pad && c.x < p.right + pad && c.y > p.top - pad * 2 && c.y < p.bottom;
    }

    function touched() {
      root.classList.add("is-touched");
    }

    // Move the coin along a curved path using requestAnimationFrame.
    function flyTo(target, control, duration) {
      return new Promise(function (resolve) {
        var from = { x: offset.x, y: offset.y };
        if (reduceMotion) {
          setOffset(target.x, target.y);
          resolve();
          return;
        }
        var start = null;
        function step(time) {
          if (start === null) start = time;
          var t = Math.min((time - start) / duration, 1);
          var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          var inv = 1 - e;
          var x = inv * inv * from.x + 2 * inv * e * control.x + e * e * target.x;
          var y = inv * inv * from.y + 2 * inv * e * control.y + e * e * target.y;
          setOffset(x, y);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    }

    function burst() {
      if (reduceMotion) return;
      var s = stage.getBoundingClientRect();
      var p = pocket.getBoundingClientRect();
      var cx = p.left + p.width / 2 - s.left;
      var cy = p.top + p.height * 0.1 - s.top;
      for (var i = 0; i < 14; i++) {
        var spark = document.createElement("span");
        var angle = Math.PI + (Math.PI * i) / 13 + (Math.random() - 0.5) * 0.3;
        var dist = 40 + Math.random() * 50;
        spark.className = "spark";
        spark.style.left = cx + "px";
        spark.style.top = cy + "px";
        spark.style.setProperty("--tx", Math.cos(angle) * dist + "px");
        spark.style.setProperty("--ty", Math.sin(angle) * dist + "px");
        stage.appendChild(spark);
        setTimeout(spark.remove.bind(spark), 950);
      }
    }

    function deliver() {
      state = "animating";
      touched();
      coin.classList.add("is-flying");
      coin.classList.remove("is-returning");

      var home = homeCentre();
      var p = pocket.getBoundingClientRect();
      var mouth = { x: p.left + p.width / 2 - home.x, y: p.top + p.height * 0.08 - home.y };
      var control = {
        x: (offset.x + mouth.x) / 2,
        y: Math.min(offset.y, mouth.y) - p.height * 0.9
      };

      flyTo(mouth, control, 700)
        .then(function () {
          coin.classList.add("is-sinking");
          coin.style.setProperty("--s", "0.85");
          return flyTo({ x: mouth.x, y: mouth.y + p.height * 0.55 }, { x: mouth.x, y: mouth.y + p.height * 0.2 }, 320);
        })
        .then(function () {
          coin.classList.add("is-hidden");
          pocket.classList.add("is-bounce");
          burst();
          finish();
          return wait(700);
        })
        .then(function () {
          pocket.classList.remove("is-bounce");
        });
    }

    function finish() {
      state = "done";
      root.classList.add("is-done");
      badge.textContent = "Returned";
      badge.classList.add("is-returned");
      animateNumber(heldEl, amount, 0, 900);
      animateNumber(returnedEl, 0, amount, 900);
      status.textContent = "Deposit returned. " + formatEUR(amount) + " goes back to the tenant within 14 days of key return.";
      resetButton.hidden = false;
      if (document.activeElement === coin || document.activeElement === document.body) resetButton.focus();
    }

    function missed() {
      state = "idle";
      coin.classList.add("is-returning");
      setOffset(0, 0);
      status.textContent = "Almost. Drop the coin into the tenant's pocket to return the deposit.";
    }

    function reset() {
      var hadFocus = document.activeElement === resetButton;
      state = "idle";
      root.classList.remove("is-done");
      coin.classList.remove("is-flying", "is-sinking", "is-hidden", "is-returning");
      coin.style.setProperty("--s", "1");
      setOffset(0, 0);
      coin.classList.add("is-appearing");
      setTimeout(function () {
        coin.classList.remove("is-appearing");
      }, 600);
      badge.textContent = "Held safely";
      badge.classList.remove("is-returned");
      heldEl.textContent = formatEUR(amount);
      returnedEl.textContent = formatEUR(0);
      status.textContent = initialMessage;
      resetButton.hidden = true;
      if (hadFocus) coin.focus();
    }

    coin.addEventListener("pointerdown", function (event) {
      if (state !== "idle" || event.button > 0) return;
      event.preventDefault();
      coin.setPointerCapture(event.pointerId);
      coin.classList.remove("is-returning");
      coin.classList.add("is-dragging");
      pointerStart = { x: event.clientX - offset.x, y: event.clientY - offset.y };
      moved = false;
      state = "dragging";
      touched();
    });

    coin.addEventListener("pointermove", function (event) {
      if (state !== "dragging") return;
      var x = event.clientX - pointerStart.x;
      var y = event.clientY - pointerStart.y;
      if (Math.hypot(x, y) > 5) moved = true;

      // Keep the coin inside the stage.
      var s = stage.getBoundingClientRect();
      var home = homeCentre();
      var r = coin.offsetWidth / 2;
      x = Math.max(s.left + r - home.x, Math.min(s.right - r - home.x, x));
      y = Math.max(s.top + r - home.y, Math.min(s.bottom - r - home.y, y));
      setOffset(x, y);
      pocket.classList.toggle("is-ready", isOverPocket());
    });

    function endDrag() {
      if (state !== "dragging") return;
      coin.classList.remove("is-dragging");
      pocket.classList.remove("is-ready");
      if (!moved) {
        state = "idle";
        return; // A plain tap or click is handled by the click event.
      }
      suppressClick = true;
      setTimeout(function () {
        suppressClick = false;
      }, 50);
      if (isOverPocket()) deliver();
      else missed();
    }

    coin.addEventListener("pointerup", endDrag);
    coin.addEventListener("pointercancel", endDrag);

    // Keyboard (Enter or Space) and simple taps send the coin on its own.
    coin.addEventListener("click", function () {
      if (suppressClick || state !== "idle") return;
      deliver();
    });

    resetButton.addEventListener("click", reset);
  }

  document.querySelectorAll("[data-coin-game]").forEach(initCoinGame);

  /* ---------- Repair checklist: fix it yourself, keep more ---------- */

  function initRepairSim(form) {
    var deposit = Number(form.dataset.deposit) || 1500;
    var boxes = form.querySelectorAll("input[type=checkbox]");
    var deductedEl = form.querySelector("[data-sim-deducted]");
    var backEl = form.querySelector("[data-sim-back]");
    var daysEl = form.querySelector("[data-sim-days]");
    var bar = form.querySelector("[data-sim-bar]");
    var live = form.querySelector("[data-sim-live]");
    var shown = { deducted: 0, back: 0 };
    var cancel = { deducted: function () {}, back: function () {} };
    var first = true;

    function show(key, el, value) {
      cancel[key]();
      cancel[key] = first ? (el.textContent = formatEUR(value), function () {}) : animateNumber(el, shown[key], value, 500);
      shown[key] = value;
    }

    function update() {
      var deducted = 0;
      boxes.forEach(function (box) {
        var fixed = box.checked;
        if (!fixed) deducted += Number(box.dataset.cost);
        box.closest(".repair-item").querySelector("[data-state]").textContent = fixed
          ? "Fixed by the tenant"
          : "Landlord's company repairs it";
      });
      var back = deposit - deducted;
      var days = deducted === 0 ? 14 : 30;
      show("deducted", deductedEl, deducted);
      show("back", backEl, back);
      daysEl.textContent = days + " days";
      bar.style.width = (back / deposit) * 100 + "%";
      if (!first) {
        live.textContent = formatEUR(back) + " goes back to the tenant within " + days + " days.";
      }
      first = false;
    }

    boxes.forEach(function (box) {
      box.addEventListener("change", update);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
    update();
  }

  document.querySelectorAll("[data-repair-sim]").forEach(initRepairSim);

  /* ---------- Tabs: tenant / landlord ---------- */

  function initTabs(list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab);
      });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
    select(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
  }

  document.querySelectorAll("[data-tabs]").forEach(initTabs);

  /* ---------- FAQ topic filter ---------- */

  function initFaqFilter(bar) {
    var buttons = bar.querySelectorAll("[data-filter]");
    var groups = document.querySelectorAll("[data-group]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.dataset.filter;
        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === button));
        });
        groups.forEach(function (group) {
          group.hidden = filter !== "all" && group.dataset.group !== filter;
        });
      });
    });
  }

  document.querySelectorAll("[data-faq-filter]").forEach(initFaqFilter);

  /* ---------- Shared form helpers ---------- */

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(field, errorEl, message) {
    field.setAttribute("aria-invalid", String(Boolean(message)));
    var described = (field.getAttribute("aria-describedby") || "").split(" ").filter(function (id) {
      return id && id !== errorEl.id;
    });
    if (message) described.push(errorEl.id);
    if (described.length) field.setAttribute("aria-describedby", described.join(" "));
    else field.removeAttribute("aria-describedby");
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  /* ---------- Log in and register (demo only: nothing is sent) ---------- */

  function passwordScore(value) {
    var score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value) || value.length >= 14) score++;
    return value ? Math.max(1, score) : 0;
  }

  function initAuthForm(form) {
    var mode = form.dataset.authForm;
    var status = form.querySelector("[data-form-status]");
    var fields = form.querySelectorAll("[data-check]");

    function check(field) {
      var type = field.dataset.check;
      var value = field.value || "";
      if (type === "required") return value.trim() ? "" : "This field is required.";
      if (type === "email") {
        if (!value.trim()) return "Enter your email address.";
        return EMAIL.test(value.trim()) ? "" : "Enter an email address like name@example.com.";
      }
      if (type === "new-password") return value.length >= 8 ? "" : "Use at least 8 characters.";
      if (type === "checked") return field.checked ? "" : "Please agree to continue.";
      if (type === "role") return field.querySelector("input:checked") ? "" : "Choose tenant, landlord or agency.";
      return "";
    }

    function validate(field) {
      var errorEl = document.getElementById(field.id + "-error");
      var message = check(field);
      showError(field, errorEl, message);
      return !message;
    }

    fields.forEach(function (field) {
      var events = field.dataset.check === "role" || field.dataset.check === "checked" ? ["change"] : ["input", "blur"];
      events.forEach(function (name) {
        field.addEventListener(name, function () {
          if (name === "blur" && !field.value) return;
          if (name === "input" && field.getAttribute("aria-invalid") !== "true") return;
          validate(field);
        });
      });
    });

    // Show or hide the password.
    form.querySelectorAll("[data-password-toggle]").forEach(function (button) {
      var input = document.getElementById(button.getAttribute("aria-controls"));
      button.addEventListener("click", function () {
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        button.textContent = show ? "Hide" : "Show";
        button.setAttribute("aria-pressed", String(show));
      });
    });

    // Password strength meter (register).
    var meter = form.querySelector("[data-strength]");
    if (meter) {
      var label = form.querySelector("[data-strength-label]");
      var words = ["", "Weak", "Okay", "Good", "Strong"];
      form.querySelector('[data-check="new-password"]').addEventListener("input", function (event) {
        var score = passwordScore(event.target.value);
        meter.dataset.score = String(score);
        label.textContent = words[score] ? "Strength: " + words[score] + "." : "";
      });
    }

    var forgot = form.querySelector("[data-forgot]");
    if (forgot) {
      forgot.addEventListener("click", function () {
        status.classList.remove("is-error");
        status.textContent = "Password reset will be available in the Deposera app. This is a demo, so nothing was sent.";
        status.hidden = false;
        status.focus();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validate(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        status.hidden = true;
        (firstInvalid.querySelector("input") || firstInvalid).focus();
        return;
      }

      if (mode === "register") {
        var first = form.elements.name.value.trim().split(" ")[0];
        var role = form.querySelector('input[name="role"]:checked').value;
        status.textContent =
          "Thanks, " + first + ". Your " + role + " account will be ready when the Deposera app launches. This is a demo, so nothing was saved.";
      } else {
        status.textContent = "Details look right. The Deposera app is coming soon, so you can't log in yet. This is a demo, so nothing was sent.";
      }
      status.classList.remove("is-error");
      status.hidden = false;
      status.focus();
      form.reset();
      if (meter) {
        meter.dataset.score = "0";
        form.querySelector("[data-strength-label]").textContent = "";
      }
      form.querySelectorAll("[data-password-toggle]").forEach(function (button) {
        document.getElementById(button.getAttribute("aria-controls")).type = "password";
        button.textContent = "Show";
        button.setAttribute("aria-pressed", "false");
      });
      fields.forEach(function (field) {
        field.removeAttribute("aria-invalid");
      });
    });
  }

  document.querySelectorAll("[data-auth-form]").forEach(initAuthForm);

  /* ---------- Contact form (demo only: nothing is sent) ---------- */

  function initContactForm(form) {
    var status = form.querySelector("[data-form-status]");
    var checks = {
      name: function (v) {
        return v.trim() ? "" : "Enter your name.";
      },
      email: function (v) {
        if (!v.trim()) return "Enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter an email address like name@example.com.";
      },
      role: function (v) {
        return v ? "" : "Choose whether you are a tenant, landlord, letting agency or someone else.";
      },
      message: function (v) {
        return v.trim().length >= 10 ? "" : "Enter a message of at least 10 characters.";
      }
    };

    function validate(field) {
      var error = document.getElementById(field.id + "-error");
      var message = checks[field.name](field.value);
      field.setAttribute("aria-invalid", String(Boolean(message)));
      if (message) {
        field.setAttribute("aria-describedby", error.id);
        error.textContent = message;
        error.hidden = false;
      } else {
        field.removeAttribute("aria-describedby");
        error.textContent = "";
        error.hidden = true;
      }
      return !message;
    }

    Object.keys(checks).forEach(function (name) {
      var field = form.elements[name];
      field.addEventListener("blur", function () {
        if (field.value || field.getAttribute("aria-invalid") === "true") validate(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstInvalid = null;
      Object.keys(checks).forEach(function (name) {
        var field = form.elements[name];
        if (!validate(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.hidden = true;
        firstInvalid.focus();
        return;
      }

      var name = form.elements.name.value.trim().split(" ")[0];
      status.textContent =
        "Thanks, " + name + ". Your message is ready to send. This is a demo, so nothing has been sent.";
      status.classList.remove("is-error");
      status.hidden = false;
      status.focus();
      form.reset();
      Object.keys(checks).forEach(function (key) {
        form.elements[key].removeAttribute("aria-invalid");
      });
    });
  }

  document.querySelectorAll("[data-contact-form]").forEach(initContactForm);
})();
