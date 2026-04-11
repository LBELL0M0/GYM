(function () {
  var SK = "gymflow_socio_portal";

  function normDni(d) {
    return String(d || "").replace(/\D/g, "");
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SK);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(obj) {
    sessionStorage.setItem(SK, JSON.stringify(obj));
  }

  function clearSession() {
    sessionStorage.removeItem(SK);
  }

  function checkPin(socio, pin) {
    var p = String(pin || "").replace(/\D/g, "");
    if (p === "1234") return true;
    var d = normDni(socio.dni);
    return d.length >= 4 && p === d.slice(-4);
  }

  function fmtMoney(n) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function mergeGym() {
    try {
      var o = JSON.parse(localStorage.getItem("gymflow_brand") || "null");
      if (o && window.GYM_DATA && window.GYM_DATA.gym) return Object.assign({}, window.GYM_DATA.gym, o);
    } catch (e) {}
    return (window.GYM_DATA && window.GYM_DATA.gym) || { name: "Gimnasio" };
  }

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLogin() {
    var gym = mergeGym();
    document.getElementById("socio-app").innerHTML =
      '<div class="auth-page">' +
      '<div class="auth-card glass" style="max-width:22rem">' +
      '<div class="auth-card__head">' +
      '<div class="auth-logo" style="margin-bottom:0.5rem"><svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>' +
      "<h1>" +
      esc(gym.name) +
      '</h1><p style="font-size:0.875rem">Portal del socio — consultá tu cuota y novedades</p></div>' +
      '<div class="glass" style="margin:0 1.25rem 1rem;padding:0.75rem;border-radius:var(--radius);font-size:0.78rem;color:var(--muted-foreground)">' +
      "<strong style=\"color:var(--primary)\">Demo</strong>: DNI <strong>30123456</strong> — PIN <strong>3456</strong> (últimos 4 del DNI) o <strong>1234</strong><br/>Otros socios demo: 28999887, 25444111 (misma regla de PIN).</div>" +
      '<form id="sf-login" class="auth-panel is-active" style="display:block;padding:1.25rem">' +
      '<div class="field"><label>DNI</label><input id="sf-dni" inputmode="numeric" required style="width:100%;padding:0.55rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
      '<div class="field"><label>PIN</label><input id="sf-pin" type="password" inputmode="numeric" maxlength="8" placeholder="4 dígitos" required style="width:100%;padding:0.55rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
      '<button type="submit" class="btn btn--primary btn--full gradient-primary btn--round">Entrar</button></form>' +
      '<div style="text-align:center;padding:0 1.5rem 1.5rem"><a href="index.html" class="btn btn--link">← Volver al sitio</a> · <a href="auth.html" class="btn btn--link">Acceso personal</a></div></div></div>';

    document.getElementById("sf-login").onsubmit = function (e) {
      e.preventDefault();
      var dni = document.getElementById("sf-dni").value;
      var pin = document.getElementById("sf-pin").value;
      var s = window.GymStore.getSocioByDni(dni);
      if (!s || !checkPin(s, pin)) {
        alert("DNI o PIN incorrectos.");
        return;
      }
      setSession({ id: s.id });
      renderHome(s);
    };
  }

  function renderHome(s) {
    var gym = mergeGym();
    var ok = window.GymStore.isQuotaOk(s.expiresAt);
    var st = ok
      ? '<div class="access-status access-status--ok" style="margin:0 0 1rem">Cuota al día</div>'
      : '<div class="access-status access-status--bad" style="margin:0 0 1rem">Cuota vencida — acercate a recepción</div>';
    var debt =
      s.debt > 0
        ? '<div class="access-status--debt" style="margin-bottom:1rem">Saldo pendiente: ' + fmtMoney(s.debt) + "</div>"
        : "";

    document.getElementById("socio-app").innerHTML =
      '<div class="auth-page" style="align-items:flex-start;padding-top:2rem;padding-bottom:2rem">' +
      '<div class="container" style="max-width:26rem">' +
      '<div class="glass" style="padding:1.25rem;border-radius:var(--radius)">' +
      "<h1 style=\"margin:0 0 0.25rem;font-size:1.25rem\">Hola, " +
      esc(s.firstName) +
      "</h1>" +
      '<p style="margin:0 0 1rem;color:var(--muted-foreground);font-size:0.875rem">' +
      esc(gym.name) +
      "</p>" +
      st +
      debt +
      '<ul style="list-style:none;padding:0;margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      "<li><strong style=\"color:var(--foreground)\">Plan:</strong> " +
      esc(s.planName) +
      "</li>" +
      "<li><strong style=\"color:var(--foreground)\">Vence:</strong> " +
      esc(s.expiresAt) +
      "</li>" +
      "<li><strong style=\"color:var(--foreground)\">Actividad:</strong> " +
      esc(s.activity) +
      "</li></ul>" +
      '<div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">' +
      "<p style=\"margin:0 0 0.5rem;font-weight:700;font-size:0.8rem\">Rutina (demo)</p>" +
      '<p style="margin:0;font-size:0.8rem;color:var(--muted-foreground)">Tu coach cargará la rutina aquí cuando exista backend. Placeholder: 3×10 sentadillas, 3×8 press banca.</p></div>' +
      '<div style="margin-top:1rem">' +
      "<p style=\"margin:0 0 0.5rem;font-weight:700;font-size:0.8rem\">Reservar turno (demo)</p>" +
      '<button type="button" class="btn btn--outline btn--full" id="sf-res">Pedir clase funcional mañana 18:00</button></div>' +
      '<div style="margin-top:1.25rem;display:flex;gap:0.5rem;flex-wrap:wrap">' +
      '<button type="button" class="btn btn--ghost btn--sm" id="sf-out">Cerrar sesión</button>' +
      '<a href="index.html" class="btn btn--link btn--sm">Sitio web</a></div></div></div></div>';

    document.getElementById("sf-res").onclick = function () {
      alert("Demo: con API se confirmaría la reserva y llegaría un WhatsApp.");
    };
    document.getElementById("sf-out").onclick = function () {
      clearSession();
      renderLogin();
    };
  }

  var sess = getSession();
  if (sess && sess.id) {
    var s = window.GymStore.getSocioById(sess.id);
    if (s) renderHome(s);
    else {
      clearSession();
      renderLogin();
    }
  } else {
    renderLogin();
  }
})();
