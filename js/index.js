(function () {
  var d = window.GYM_DATA;
  if (!d) return;

  function mergeGym() {
    var o = window.GymSession.getBrandOverrides();
    if (!o) return d.gym;
    return Object.assign({}, d.gym, o);
  }

  var gym = mergeGym();
  var selectedSedeId = d.sedes[0] ? d.sedes[0].id : null;

  var icons = {
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    mappin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    award:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    quote:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/></svg>',
    globe:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  };

  var iconList = [icons.users, icons.mappin, icons.calendar, icons.award];

  function fmtMoney(n) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function scrollToSelector(sel) {
    var el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function renderHero() {
    var parts = gym.slogan.split(",");
    var title = document.getElementById("hero-title");
    if (!title) return;
    title.innerHTML = "";
    parts.forEach(function (part, i) {
      if (i > 0) title.appendChild(document.createElement("br"));
      var span = document.createElement("span");
      if (i === 1) span.className = "text-gradient";
      span.textContent = part.trim();
      title.appendChild(span);
    });
    document.getElementById("hero-subtitle").textContent = gym.heroSubtitle;
  }

  function renderBrandUi() {
    document.getElementById("nav-brand-name").textContent = gym.name;
    document.getElementById("footer-brand").textContent = gym.name;
    document.getElementById("footer-slogan").textContent = gym.slogan;
    document.getElementById("footer-copy").textContent =
      "© " + new Date().getFullYear() + " " + gym.name + ". Todos los derechos reservados.";
    var fc = document.getElementById("footer-contact");
    fc.innerHTML =
      '<li style="display:flex;align-items:center;gap:0.5rem">' +
      icons.phone +
      '<span style="color:var(--muted-foreground);font-size:0.875rem">' +
      gym.whatsapp +
      "</span></li>" +
      '<li style="display:flex;align-items:center;gap:0.5rem">' +
      icons.instagram +
      '<span style="color:var(--muted-foreground);font-size:0.875rem">' +
      gym.instagram +
      "</span></li>" +
      '<li style="display:flex;align-items:center;gap:0.5rem">' +
      icons.globe +
      '<span style="color:var(--muted-foreground);font-size:0.875rem">' +
      gym.web +
      "</span></li>";
    Array.from(fc.querySelectorAll("svg")).forEach(function (svg) {
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.style.color = "var(--primary)";
      svg.style.flexShrink = "0";
    });
  }

  function renderNavAuth() {
    var logged = window.GymSession.isLoggedIn();
    var desktop = document.getElementById("nav-auth-slot");
    var mobile = document.getElementById("nav-auth-slot-mobile");
    function btnHtml() {
      if (logged) {
        return (
          '<a href="admin.html" class="btn btn--sm btn--outline">Panel Admin</a>'
        );
      }
      return (
        '<a href="auth.html" class="btn btn--sm btn--ghost">' +
        '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><path d="M15 3h4v4M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>' +
        "Ingresar</a>"
      );
    }
    desktop.innerHTML = btnHtml();
    mobile.innerHTML = btnHtml();
  }

  function renderMetrics() {
    var g = document.getElementById("metrics-grid");
    g.innerHTML = d.metrics
      .map(function (m, i) {
        return (
          '<div class="metrics__item reveal">' +
          iconList[i] +
          '<span class="metrics__value">' +
          (m.prefix || "") +
          m.value +
          "</span>" +
          '<span class="metrics__label">' +
          m.label +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderTrainers() {
    document.getElementById("trainers-grid").innerHTML = d.trainers
      .map(function (t) {
        return (
          '<article class="trainer-card glass reveal">' +
          '<div class="trainer-card__avatar"><img src="' +
          t.image +
          '" alt="' +
          t.name +
          '" loading="lazy"/></div>' +
          "<h3>" +
          t.name +
          "</h3>" +
          '<p class="spec">' +
          t.specialty +
          "</p>" +
          '<p class="sede">' +
          t.sedeName +
          "</p>" +
          '<p class="bio">' +
          t.bio +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderLocationTabs() {
    var tabs = document.getElementById("loc-tabs");
    tabs.innerHTML = d.sedes
      .map(function (s) {
        return (
          '<button type="button" role="tab" class="loc-tab' +
          (s.id === selectedSedeId ? " is-active" : "") +
          '" data-sede="' +
          s.id +
          '">' +
          s.name +
          "</button>"
        );
      })
      .join("");
  }

  function renderLocationContent() {
    var active = d.sedes.find(function (s) {
      return s.id === selectedSedeId;
    });
    if (!active) return;
    document.getElementById("loc-content").innerHTML =
      '<div class="loc-content__media"><img src="' +
      active.image +
      '" alt="' +
      active.name +
      '" loading="lazy"/></div>' +
      '<div>' +
      "<h3 style=\"margin:0 0 0.5rem;font-size:1.5rem;font-weight:800\">" +
      active.name +
      "</h3>" +
      '<p style="color:var(--muted-foreground);margin:0 0 1rem">' +
      active.description +
      "</p>" +
      '<div class="loc-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>' +
      active.address +
      "</span></div>" +
      '<div class="loc-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>' +
      active.hours +
      "</span></div>" +
      '<div class="loc-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>' +
      active.phone +
      '</span></div>' +
      '<button type="button" class="btn btn--primary gradient-primary btn--round" style="margin-top:1rem;border:none">Inscribite en esta sede</button>' +
      "</div>";
  }

  function renderPlans() {
    var visible = d.plans.filter(function (p) {
      return p.active && (p.sedeId === null || p.sedeId === selectedSedeId);
    });
    document.getElementById("plans-grid").innerHTML = visible
      .map(function (p) {
        var feat = p.recommended ? " plan-card--featured glass-strong" : " glass";
        var badge = p.recommended
          ? '<span class="plan-badge">Recomendado</span>'
          : "";
        var enroll =
          p.enrollment > 0
            ? '<p style="font-size:0.75rem;color:var(--muted-foreground);margin:0.25rem 0 0">+ Matrícula ' +
              fmtMoney(p.enrollment) +
              "</p>"
            : "";
        return (
          '<div class="plan-card reveal' +
          feat +
          '">' +
          badge +
          "<h3 style=\"margin:0;font-size:1.25rem;font-weight:800\">" +
          p.name +
          "</h3>" +
          '<p style="color:var(--muted-foreground);font-size:0.875rem;margin:0.25rem 0 1rem">' +
          p.duration +
          "</p>" +
          '<div style="margin-bottom:1.5rem"><span class="plan-price">' +
          fmtMoney(p.price) +
          "</span>" +
          enroll +
          "</div>" +
          "<ul>" +
          p.benefits
            .map(function (b) {
              return (
                "<li>" + icons.check + "<span>" + b + "</span></li>"
              );
            })
            .join("") +
          "</ul>" +
          '<button type="button" class="btn btn--full btn--round ' +
          (p.recommended ? "gradient-primary" : "btn--outline") +
          '" style="' +
          (p.recommended ? "border:none" : "") +
          '">Elegir plan</button></div>'
        );
      })
      .join("");
  }

  function renderTestimonials() {
    document.getElementById("testimonials-grid").innerHTML = d.testimonials
      .map(function (t) {
        return (
          '<article class="testimonial-card glass reveal">' +
          '<span class="quote-icon">' +
          icons.quote +
          "</span>" +
          '<div class="testimonial-card__head"><img src="' +
          t.image +
          '" alt="' +
          t.name +
          '" loading="lazy"/><div><p style="margin:0;font-weight:600;font-size:0.875rem">' +
          t.name +
          '</p><p style="margin:0;font-size:0.75rem;color:var(--primary)">' +
          t.activity +
          "</p></div></div>" +
          '<p style="margin:0;font-size:0.875rem;color:var(--muted-foreground);line-height:1.6">"' +
          t.text +
          '"</p></article>'
        );
      })
      .join("");
  }

  function bindNav() {
    document.querySelectorAll("[data-scroll]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        scrollToSelector(btn.getAttribute("data-scroll"));
        closeDrawer();
      });
    });
    var toggle = document.getElementById("nav-toggle");
    var drawer = document.getElementById("nav-drawer");
    function closeDrawer() {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.getElementById("icon-menu").style.display = "";
      document.getElementById("icon-close").style.display = "none";
    }
    toggle.addEventListener("click", function () {
      var open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.getElementById("icon-menu").style.display = open ? "none" : "";
      document.getElementById("icon-close").style.display = open ? "" : "none";
    });
  }

  function bindLocations() {
    document.getElementById("loc-tabs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-sede]");
      if (!b) return;
      selectedSedeId = b.getAttribute("data-sede");
      document.querySelectorAll(".loc-tab").forEach(function (t) {
        t.classList.toggle("is-active", t.getAttribute("data-sede") === selectedSedeId);
      });
      renderLocationContent();
      renderPlans();
    });
  }

  function revealOnScroll() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) en.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  renderHero();
  renderBrandUi();
  renderNavAuth();
  renderMetrics();
  renderTrainers();
  renderLocationTabs();
  renderLocationContent();
  renderPlans();
  renderTestimonials();
  bindNav();
  bindLocations();
  revealOnScroll();
})();
