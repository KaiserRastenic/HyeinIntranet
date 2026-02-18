(function (window, document) {
  "use strict";

  function addClass(el, name) {
    if (!el || !name) return;
    if (el.classList) {
      el.classList.add(name);
      return;
    }
    if ((" " + el.className + " ").indexOf(" " + name + " ") === -1) {
      el.className += (el.className ? " " : "") + name;
    }
  }

  function removeClass(el, name) {
    if (!el || !name) return;
    if (el.classList) {
      el.classList.remove(name);
      return;
    }
    el.className = (" " + el.className + " ").replace(" " + name + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function syncModalState(modal) {
    if (!modal) return;
    var hidden = modal.getAttribute("aria-hidden");
    if (hidden === "false") {
      addClass(modal, "gwx-open");
    } else {
      removeClass(modal, "gwx-open");
    }
  }

  function initModalMotion() {
    var modals = document.querySelectorAll(".gw-modal");
    var i;
    for (i = 0; i < modals.length; i += 1) {
      syncModalState(modals[i]);
    }

    if (!("MutationObserver" in window)) return;

    for (i = 0; i < modals.length; i += 1) {
      (function (modal) {
        var observer = new MutationObserver(function () {
          syncModalState(modal);
        });
        observer.observe(modal, { attributes: true, attributeFilter: ["aria-hidden"] });
      })(modals[i]);
    }
  }

  function initReveal() {
    var cards = document.querySelectorAll(".card");
    var i;

    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      for (i = 0; i < cards.length; i += 1) {
        addClass(cards[i], "gwx-in");
      }
      return;
    }

    var io = new IntersectionObserver(
      function (entries, observer) {
        var j;
        for (j = 0; j < entries.length; j += 1) {
          if (!entries[j].isIntersecting) continue;
          addClass(entries[j].target, "gwx-in");
          observer.unobserve(entries[j].target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    for (i = 0; i < cards.length; i += 1) {
      io.observe(cards[i]);
    }
  }

  function bindRipple(node) {
    if (!node) return;
    if (node.getAttribute("data-gwx-ripple") === "1") return;

    node.setAttribute("data-gwx-ripple", "1");
    addClass(node, "gwx-ripple-host");

    var onPress = function (event) {
      if (event.type === "mousedown" && event.button !== 0) return;

      var rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      var size = Math.max(rect.width, rect.height) * 1.35;
      var x = rect.width / 2;
      var y = rect.height / 2;

      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
      } else if (typeof event.clientX === "number") {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      }

      var ripple = document.createElement("span");
      ripple.className = "gwx-ripple";
      ripple.style.width = size + "px";
      ripple.style.height = size + "px";
      ripple.style.left = x - size / 2 + "px";
      ripple.style.top = y - size / 2 + "px";
      node.appendChild(ripple);

      window.setTimeout(function () {
        if (ripple && ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 680);
    };

    node.addEventListener("mousedown", onPress, false);
    node.addEventListener("touchstart", onPress, false);
  }

  function initRipple() {
    var selector = [
      "a",
      "button",
      ".btn",
      ".btn-chip",
      ".btn-soft",
      ".btn-icon",
      ".gw-nav-item",
      ".gw-nav-group-btn",
      ".kpi-card"
    ].join(",");

    var nodes = document.querySelectorAll(selector);
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      bindRipple(nodes[i]);
    }
  }

  function animateCountById(id, duration) {
    var el = document.getElementById(id);
    if (!el) return;

    var text = (el.textContent || "").replace(/[^0-9]/g, "");
    if (!text) return;

    var target = parseInt(text, 10);
    if (isNaN(target) || target <= 0) return;

    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = (ts - start) / duration;
      if (progress > 1) progress = 1;
      var value = Math.floor(target * progress);
      el.textContent = String(value);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }

    window.requestAnimationFrame(step);
  }

  function initDeadLinks() {
    var links = document.querySelectorAll('a[href="#"][data-frame="0"]');
    var i;
    for (i = 0; i < links.length; i += 1) {
      links[i].addEventListener(
        "click",
        function (event) {
          if (event && event.preventDefault) {
            event.preventDefault();
          }
        },
        false
      );
    }
  }

  ready(function () {
    addClass(document.body, "gwx-anim");
    window.setTimeout(function () {
      addClass(document.body, "gwx-loaded");
    }, 34);

    initReveal();
    initRipple();
    initModalMotion();
    initDeadLinks();

    animateCountById("kpiWait", 600);
    animateCountById("badgeWait", 520);
    animateCountById("pillInbox", 520);
  });
})(window, document);
