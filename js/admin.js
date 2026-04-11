(function () {
  if (!window.GymSession.isLoggedIn()) {
    window.location.replace("auth.html");
    return;
  }

  var d = window.GYM_DATA;
  var session = window.GymSession.get();
  var charts = { bar: null, line: null };

  var navItems = [
    { id: "dashboard", label: "Dashboard", hash: "" },
    { id: "acceso", label: "Control de acceso", hash: "acceso" },
    { id: "caja", label: "Caja", hash: "caja" },
    { id: "asistencias", label: "Asistencias", hash: "asistencias" },
    { id: "socios", label: "Socios", hash: "socios" },
    { id: "whatsapp", label: "WhatsApp", hash: "whatsapp" },
    { id: "ventas", label: "Ventas y stock", hash: "ventas" },
    { id: "empleados", label: "Equipo y auditoría", hash: "empleados" },
    { id: "estadisticas", label: "Estadísticas", hash: "estadisticas" },
    { id: "license", label: "Licencia", hash: "license" },
    { id: "brand", label: "Marca", hash: "brand" },
    { id: "locations", label: "Sedes", hash: "locations" },
    { id: "plans", label: "Planes", hash: "plans" },
    { id: "trainers", label: "Entrenadores", hash: "trainers" },
    { id: "testimonials", label: "Testimonios", hash: "testimonials" },
    { id: "users", label: "Usuarios", hash: "users" },
  ];

  var icons = {
    dashboard:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    scan: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M7 21H5a2 2 0 0 1-2-2v-2M17 21h2a2 2 0 0 0 2-2v-2M9 9h6v6H9z"/></svg>',
    wallet:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
    cal: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    socios:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    wa: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    cart: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    shield:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    stats:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>',
    key: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    palette:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    map: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    card: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
    dumbbell:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.4 14.4 9.6 9.6M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4M3.9 3.9 2.5 2.5M6.404 17.596l2.828-2.829M9.9 14.1l2.829-2.828"/></svg>',
    quote:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 3.417 1.67 6.667 4 8M21 21c-3 0-7-1-7-8V5c0-1.25.757-2.017 2-2h5c1.25 0 2 .75 2 1.972V11c0 3.417-1.67 6.667-4 8"/></svg>',
    users:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  };

  var navIcons = [
    icons.dashboard,
    icons.scan,
    icons.wallet,
    icons.cal,
    icons.socios,
    icons.wa,
    icons.cart,
    icons.shield,
    icons.stats,
    icons.key,
    icons.palette,
    icons.map,
    icons.card,
    icons.dumbbell,
    icons.quote,
    icons.users,
  ];

  function mergeGym() {
    var o = window.GymSession.getBrandOverrides();
    if (!o) return d.gym;
    return Object.assign({}, d.gym, o);
  }

  function fmtMoney(n) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function getRoute() {
    var h = (location.hash || "").replace(/^#\/?/, "");
    if (!h) return "dashboard";
    return h.split("/")[0] || "dashboard";
  }

  function mountShell() {
    var root = document.getElementById("admin-root");
    var tpl = document.getElementById("tpl-admin");
    root.appendChild(tpl.content.cloneNode(true));
    tpl.remove();

    var gym = mergeGym();
    document.getElementById("sidebar-brand").textContent = gym.name;

    var nav = document.getElementById("admin-nav");
    nav.innerHTML = navItems
      .map(function (item, i) {
        var href = item.hash ? "admin.html#" + item.hash : "admin.html";
        return (
          '<a href="' +
          href +
          '" data-route="' +
          item.id +
          '">' +
          navIcons[i] +
          "<span>" +
          item.label +
          "</span></a>"
        );
      })
      .join("");

    var label =
      session.displayName ||
      (session.dni ? "DNI " + session.dni : null) ||
      "Usuario";
    document.getElementById("admin-user-label").textContent = label;
    document.getElementById("admin-avatar").textContent = (label.charAt(0) || "U").toUpperCase();

    document.getElementById("btn-signout").addEventListener("click", function () {
      window.GymSession.clear();
      window.location.href = "index.html";
    });

    document.getElementById("sidebar-collapse").addEventListener("click", function () {
      document.getElementById("admin-sidebar").classList.toggle("is-collapsed");
    });

    nav.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-route]");
      if (!a) return;
      e.preventDefault();
      var id = a.getAttribute("data-route");
      var item = navItems.find(function (x) {
        return x.id === id;
      });
      if (item.hash) location.hash = item.hash;
      else {
        if (location.hash) location.hash = "";
        else applyRoute();
      }
    });

    renderDashboardPanel();
    renderLicensePanel();
    renderBrandPanel();
    renderLocationsPanel();
    renderPlansPanel();
    renderTrainersPanel();
    renderTestimonialsPanel();
    renderUsersPanel();

    if (window.GymSistema) {
      window.GymSistema.init({
        d: d,
        fmtMoney: fmtMoney,
        mergeGym: mergeGym,
      });
    }

    window.addEventListener("hashchange", applyRoute);
    applyRoute();
  }

  function applyRoute() {
    var route = getRoute();
    var item = navItems.find(function (x) {
      return x.id === route;
    });
    if (!item) route = "dashboard";

    document.querySelectorAll(".admin-nav a").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-route") === route);
    });
    document.querySelectorAll(".admin-panel").forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-panel") === route);
    });
    document.getElementById("admin-page-title").textContent =
      (navItems.find(function (x) {
        return x.id === route;
      }) || {}).label || "Panel";

    if (route === "dashboard") initCharts();
    if (window.GymSistema) window.GymSistema.onRoute(route);
  }

  function renderDashboardPanel() {
    var m = d.dashboardMetrics;
    var el = document.getElementById("panel-dashboard");
    el.innerHTML =
      '<div class="metric-grid">' +
      [
        {
          label: "Ingresos del día",
          value: "$" + m.todayIncome.toLocaleString("es-AR"),
          icon: "primary",
          svg: '<svg class="icon" style="color:var(--primary)" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        },
        {
          label: "Socios activos",
          value: m.activeMembers,
          svg: '<svg class="icon" style="color:var(--success)" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
        },
        {
          label: "Asistencias hoy",
          value: m.todayAttendance,
          svg: '<svg class="icon" style="color:var(--warning)" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        },
        {
          label: "Membresías por vencer",
          value: m.expiringMemberships,
          svg: '<svg class="icon" style="color:var(--warning)" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>',
        },
      ]
        .map(function (c) {
          return (
            '<div class="metric-card glass">' +
            '<div class="metric-card__row">' +
            "<div><p class=\"label\">" +
            c.label +
            '</p><p class="value">' +
            c.value +
            "</p></div>" +
            c.svg +
            "</div></div>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="chart-row" style="margin-top:1.5rem">' +
      '<div class="admin-card glass"><div class="admin-card__head"><h2>Ingresos semanales</h2></div><div class="admin-card__body"><div class="chart-box"><canvas id="chart-bar"></canvas></div></div></div>' +
      '<div class="admin-card glass"><div class="admin-card__head"><h2>Asistencia mensual</h2></div><div class="admin-card__body"><div class="chart-box"><canvas id="chart-line"></canvas></div></div></div>' +
      "</div>";
  }

  function initCharts() {
    if (typeof Chart === "undefined") return;
    var barCtx = document.getElementById("chart-bar");
    var lineCtx = document.getElementById("chart-line");
    if (!barCtx || !lineCtx) return;
    if (charts.bar) return;

    var grid = "hsl(240 4% 16%)";
    var tick = "hsl(215 14% 55%)";

    charts.bar = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: d.weeklyIncome.map(function (x) {
          return x.day;
        }),
        datasets: [
          {
            label: "Monto",
            data: d.weeklyIncome.map(function (x) {
              return x.amount;
            }),
            backgroundColor: "hsl(199 89% 48%)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick }, grid: { color: grid } },
          y: { ticks: { color: tick }, grid: { color: grid } },
        },
      },
    });

    charts.line = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: d.monthlyAttendance.map(function (x) {
          return x.week;
        }),
        datasets: [
          {
            label: "Asistencias",
            data: d.monthlyAttendance.map(function (x) {
              return x.count;
            }),
            borderColor: "hsl(142 71% 45%)",
            backgroundColor: "transparent",
            tension: 0.3,
            pointBackgroundColor: "hsl(142 71% 45%)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tick }, grid: { color: grid } },
          y: { ticks: { color: tick }, grid: { color: grid } },
        },
      },
    });
  }

  function renderLicensePanel() {
    var L = d.license;
    var pct = Math.round((L.currentMembers / L.maxMembers) * 100);
    var daysLeft = Math.ceil((new Date(L.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    document.getElementById("panel-license").innerHTML =
      '<div class="admin-card glass" style="max-width:42rem">' +
      '<div class="admin-card__head" style="display:flex;align-items:center;justify-content:space-between">' +
      "<h2>Estado de Licencia</h2>" +
      '<span class="badge badge--success">Activa</span></div>' +
      '<div class="admin-card__body">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">' +
      '<div><p class="label">ID de Licencia</p><p style="font-family:monospace;font-size:0.875rem;margin:0">' +
      L.id +
      "</p></div>" +
      '<div><p class="label">Versión</p><p style="margin:0">' +
      L.version +
      "</p></div>" +
      '<div><p class="label">Vencimiento</p><p style="margin:0">' +
      L.expiresAt +
      ' <span style="color:var(--muted-foreground)">(' +
      daysLeft +
      " días)</span></p></div>" +
      '<div><p class="label">Plan</p><p style="margin:0">' +
      L.plan +
      "</p></div></div>" +
      '<div style="margin-top:1.25rem">' +
      '<div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:0.5rem"><span style="color:var(--muted-foreground)">Uso de socios</span><span>' +
      L.currentMembers +
      " / " +
      L.maxMembers +
      "</span></div>" +
      '<div class="progress"><div class="progress__bar" style="width:' +
      pct +
      '%"></div></div></div></div></div>';
  }

  function renderBrandPanel() {
    var gym = mergeGym();
    var modOverrides = window.GymSession.getModuleOverrides() || {};
    var el = document.getElementById("panel-brand");
    el.innerHTML =
      '<div class="admin-card glass" style="max-width:48rem">' +
      '<div class="admin-card__head"><h2>Configuración de Marca</h2></div>' +
      '<div class="admin-card__body">' +
      '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">' +
      '<div style="width:5rem;height:5rem;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:var(--primary)" class="glass">IF</div>' +
      '<button type="button" class="btn btn--outline btn--sm" id="btn-fake-logo">Cambiar logo</button></div>' +
      '<div class="form-grid form-grid--2">' +
      ["name", "cuit", "whatsapp", "instagram", "web"]
        .map(function (key) {
          var lab = key === "cuit" ? "CUIT" : key;
          var val = gym[key] || "";
          return (
            '<div class="field"><label for="brand-' +
            key +
            '">' +
            lab +
            '</label><input id="brand-' +
            key +
            '" data-brand-key="' +
            key +
            '" value="' +
            String(val).replace(/"/g, "&quot;") +
            '" style="width:100%;padding:0.5rem 0.75rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>'
          );
        })
        .join("") +
      "</div>" +
      '<button type="button" class="btn gradient-primary btn--round" style="margin-top:1rem;border:none" id="btn-save-brand">Guardar cambios</button></div></div>' +
      '<div class="admin-card glass" style="max-width:48rem">' +
      '<div class="admin-card__head"><h2>Activación Modular</h2></div>' +
      '<div class="admin-card__body" id="module-list"></div></div>';

    var list = document.getElementById("module-list");
    list.innerHTML = d.modules
      .map(function (m) {
        var checked = modOverrides[m.id] !== undefined ? modOverrides[m.id] : m.enabled;
        return (
          '<div class="switch-row">' +
          "<div><p style=\"margin:0;font-size:0.875rem;font-weight:600\">" +
          m.name +
          '</p><p style="margin:0.15rem 0 0;font-size:0.75rem;color:var(--muted-foreground)">' +
          m.description +
          '</p></div><label class="switch"><input type="checkbox" data-module-id="' +
          m.id +
          '" ' +
          (checked ? "checked" : "") +
          ' /><span class="switch__ui"></span></label></div>'
        );
      })
      .join("");

    document.getElementById("btn-fake-logo").addEventListener("click", function () {
      window.showToast({ title: "Logo", description: "En modo local podés reemplazar el bloque IF por una imagen en el HTML/CSS." });
    });

    document.getElementById("btn-save-brand").addEventListener("click", function () {
      var next = {};
      el.querySelectorAll("[data-brand-key]").forEach(function (inp) {
        next[inp.getAttribute("data-brand-key")] = inp.value;
      });
      window.GymSession.saveBrandOverrides(next);
      var mods = {};
      list.querySelectorAll("input[data-module-id]").forEach(function (cb) {
        mods[cb.getAttribute("data-module-id")] = cb.checked;
      });
      window.GymSession.saveModuleOverrides(mods);
      document.getElementById("sidebar-brand").textContent = next.name || mergeGym().name;
      window.showToast({ title: "Guardado", description: "Marca y módulos actualizados en este navegador." });
    });
  }

  function renderLocationsPanel() {
    document.getElementById("panel-locations").innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      d.sedes.length +
      ' sedes registradas</p><button type="button" class="btn btn--sm gradient-primary" style="border:none">+ Nueva sede</button></div>' +
      '<div class="admin-locations">' +
      d.sedes
        .map(function (s) {
          return (
            '<div class="admin-card glass location-admin-card">' +
            '<img src="' +
            s.image +
            '" alt="' +
            s.name +
            '" loading="lazy"/>' +
            '<div class="admin-card__body">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">' +
            "<h3 style=\"margin:0;font-size:1rem\">" +
            s.name +
            '</h3><span class="badge badge--success">Activa</span></div>' +
            '<p style="margin:0.25rem 0;font-size:0.75rem;color:var(--muted-foreground);display:flex;gap:0.35rem;align-items:flex-start"><svg width="14" height="14" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
            s.address +
            '</p><p style="margin:0.25rem 0;font-size:0.75rem;color:var(--muted-foreground);display:flex;gap:0.35rem"><svg width="14" height="14" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
            s.hours +
            '</p><p style="margin:0.25rem 0;font-size:0.75rem;color:var(--muted-foreground);display:flex;gap:0.35rem"><svg width="14" height="14" fill="none" stroke="var(--primary)" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
            s.phone +
            '</p><button type="button" class="btn btn--outline btn--sm btn--full" style="margin-top:0.75rem">Editar</button></div></div>'
          );
        })
        .join("") +
      "</div>";
  }

  function renderPlansPanel() {
    document.getElementById("panel-plans").innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      d.plans.length +
      ' planes configurados</p><button type="button" class="btn btn--sm gradient-primary" style="border:none">+ Nuevo plan</button></div>' +
      '<div class="table-wrap glass">' +
      "<table class=\"admin-table\"><thead><tr><th>Nombre</th><th>Precio</th><th>Duración</th><th>Alcance</th><th>Activo</th><th style=\"text-align:right\">Acciones</th></tr></thead><tbody>" +
      d.plans
        .map(function (p) {
          return (
            "<tr><td style=\"font-weight:600\">" +
            p.name +
            (p.recommended
              ? ' <span class="badge badge--primary">Recomendado</span>'
              : "") +
            "</td><td>" +
            fmtMoney(p.price) +
            "</td><td>" +
            p.duration +
            "</td><td><span class=\"badge\">" +
            (p.sedeId ? "Por sede" : "Global") +
            '</span></td><td><label class="switch" style="display:inline-flex;vertical-align:middle"><input type="checkbox" ' +
            (p.active ? "checked" : "") +
            ' disabled /><span class="switch__ui"></span></label></td><td style="text-align:right"><button type="button" class="btn btn--ghost btn--sm">Editar</button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></div>";
  }

  function renderTrainersPanel() {
    document.getElementById("panel-trainers").innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      d.trainers.length +
      ' entrenadores registrados</p><button type="button" class="btn btn--sm gradient-primary" style="border:none">+ Nuevo entrenador</button></div>' +
      '<div class="admin-locations">' +
      d.trainers
        .map(function (t) {
          return (
            '<div class="glass" style="border-radius:var(--radius);padding:1.25rem;border:1px solid color-mix(in hsl,var(--border) 50%,transparent);display:flex;gap:1rem;align-items:flex-start">' +
            '<img src="' +
            t.image +
            '" alt="" width="56" height="56" style="border-radius:9999px;object-fit:cover;flex-shrink:0;border:2px solid color-mix(in hsl,var(--primary) 20%,transparent)"/>' +
            '<div style="min-width:0;flex:1">' +
            '<p style="margin:0;font-weight:600;font-size:0.875rem">' +
            t.name +
            '</p><p style="margin:0.15rem 0 0;font-size:0.75rem;color:var(--primary)">' +
            t.specialty +
            '</p><p style="margin:0.15rem 0 0;font-size:0.75rem;color:var(--muted-foreground)">' +
            t.sedeName +
            '</p><p style="margin:0.35rem 0 0;font-size:0.75rem;color:var(--muted-foreground);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' +
            t.bio +
            '</p><button type="button" class="btn btn--ghost btn--sm" style="margin-top:0.5rem;height:1.75rem;font-size:0.75rem;padding:0 0.5rem">Editar</button></div></div>'
          );
        })
        .join("") +
      "</div>";
  }

  function renderTestimonialsPanel() {
    document.getElementById("panel-testimonials").innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      d.testimonials.length +
      ' testimonios</p><button type="button" class="btn btn--sm gradient-primary" style="border:none">+ Nuevo testimonio</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:0.75rem">' +
      d.testimonials
        .map(function (t) {
          return (
            '<div class="glass" style="border-radius:var(--radius);padding:1rem;border:1px solid color-mix(in hsl,var(--border) 50%,transparent);display:flex;gap:1rem;align-items:flex-start">' +
            '<img src="' +
            t.image +
            '" alt="" width="48" height="48" style="border-radius:9999px;object-fit:cover;flex-shrink:0"/>' +
            '<div style="flex:1;min-width:0">' +
            '<p style="margin:0;font-weight:600;font-size:0.875rem">' +
            t.name +
            ' <span style="font-size:0.75rem;color:var(--primary);font-weight:500">' +
            t.activity +
            '</span></p><p style="margin:0.35rem 0 0;font-size:0.875rem;color:var(--muted-foreground)">"' +
            t.text +
            '"</p></div><button type="button" class="btn btn--ghost btn--sm" style="flex-shrink:0">Editar</button></div>'
          );
        })
        .join("") +
      "</div>";
  }

  function renderUsersPanel() {
    var roleClass = {
      "Super Admin": "badge--destructive",
      Dueño: "badge--warning",
      Profesor: "badge--primary",
      Empleado: "badge",
      Socio: "badge--muted",
    };
    document.getElementById("panel-users").innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      d.users.length +
      ' usuarios registrados</p><button type="button" class="btn btn--sm gradient-primary" style="border:none">+ Nuevo usuario</button></div>' +
      '<div class="table-wrap glass">' +
      "<table class=\"admin-table\"><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th style=\"text-align:right\">Acciones</th></tr></thead><tbody>" +
      d.users
        .map(function (u) {
          var rc = roleClass[u.role] || "";
          var st =
            u.status === "active"
              ? '<span class="badge badge--success">Activo</span>'
              : '<span class="badge badge--muted">Inactivo</span>';
          return (
            "<tr><td style=\"font-weight:600\">" +
            u.name +
            "</td><td style=\"color:var(--muted-foreground);font-size:0.875rem\">" +
            u.email +
            "</td><td><span class=\"badge " +
            rc +
            '">' +
            u.role +
            "</td><td>" +
            st +
            '</td><td style="text-align:right"><button type="button" class="btn btn--ghost btn--sm">Editar</button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table></div>";
  }

  mountShell();
})();
