(function () {
  var ctx = { d: null, fmtMoney: null, mergeGym: null };
  var statsCharts = { hourly: null, income: null };
  var accessMethod = "teclado";

  var ROUTES = ["acceso", "caja", "asistencias", "socios", "whatsapp", "ventas", "empleados", "estadisticas"];

  function auditStaff(action, detail) {
    var s = window.GymSession.get();
    window.GymStore.appendAudit({
      staffDni: (s && s.dni) || "—",
      staffName: (s && s.displayName) || "—",
      action: action,
      detail: detail || "",
    });
  }

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function gymName() {
    return (ctx.mergeGym && ctx.mergeGym().name) || "El gimnasio";
  }

  function openModal(html, wide) {
    var host = document.getElementById("modal-host");
    if (!host) return;
    host.innerHTML =
      '<div class="modal-dialog' +
      (wide ? " modal-dialog--wide" : "") +
      '" role="dialog" aria-modal="true">' +
      html +
      "</div>";
    host.hidden = false;
    host.querySelector(".modal-dialog").addEventListener("click", function (e) {
      e.stopPropagation();
    });
    host.onclick = function (e) {
      if (e.target === host) closeModal();
    };
    var closeBtn = host.querySelector("[data-close-modal]");
    if (closeBtn) closeBtn.onclick = closeModal;
  }

  function closeModal() {
    var host = document.getElementById("modal-host");
    if (!host) return;
    host.hidden = true;
    host.innerHTML = "";
    host.onclick = null;
  }

  function playBeep(error) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var a = new Ctx();
      var o = a.createOscillator();
      var g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.frequency.value = error ? 320 : 520;
      o.type = "sine";
      g.gain.setValueAtTime(0.08, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, a.currentTime + 0.15);
      o.start(a.currentTime);
      o.stop(a.currentTime + 0.16);
    } catch (e) {}
  }

  function buildNotifications() {
    var socios = window.GymStore.getSocios();
    var today = window.GymStore.todayStr();
    var items = [];
    socios.forEach(function (s) {
      if (s.debt > 0) {
        items.push({
          t: "Deuda",
          m: s.firstName + " " + s.lastName + ": " + ctx.fmtMoney(s.debt) + " pendiente",
        });
      }
      var exp = s.expiresAt;
      if (exp <= today) {
        items.push({ t: "Vencido", m: s.firstName + " " + s.lastName + " — cuota vencida (" + exp + ")" });
      } else {
        var d = Math.ceil((new Date(exp).getTime() - new Date(today).getTime()) / 86400000);
        if (d <= 2 && d >= 0) {
          items.push({ t: "Por vencer", m: s.firstName + " " + s.lastName + " vence en " + d + " día(s)" });
        }
      }
      if (s.birthDate) {
        var bm = s.birthDate.slice(5);
        var tm = today.slice(5);
        if (bm === tm) items.push({ t: "Cumpleaños", m: "Hoy es el cumple de " + s.firstName + " " + s.lastName });
      }
    });
    return items.slice(0, 12);
  }

  function refreshNotifUi() {
    var items = buildNotifications();
    var dd = document.getElementById("notif-dropdown");
    var bd = document.getElementById("notif-badge");
    if (!dd || !bd) return;
    bd.hidden = items.length === 0;
    bd.textContent = String(Math.min(items.length, 9));
    if (items.length > 9) bd.textContent = "9+";
    dd.innerHTML =
      items.length === 0
        ? '<p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">Sin alertas por ahora.</p>'
        : items
            .map(function (x) {
              return (
                '<div class="notif-item"><strong style="color:var(--foreground)">' +
                esc(x.t) +
                "</strong><br/>" +
                esc(x.m) +
                "</div>"
              );
            })
            .join("");
  }

  function bindNotifBell() {
    var btn = document.getElementById("btn-notifications");
    var dd = document.getElementById("notif-dropdown");
    if (!btn || !dd) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      refreshNotifUi();
      var open = dd.hidden === false;
      dd.hidden = open;
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
    document.addEventListener("click", function () {
      dd.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function renderAcceso() {
    var el = document.getElementById("panel-acceso");
    if (!el) return;
    el.innerHTML =
      '<div class="access-layout">' +
      '<div class="access-main">' +
      "<p style=\"margin:0 0 0.5rem;font-size:0.875rem;color:var(--muted-foreground)\">Medio de identificación (simulado). Todos validan cuota y deuda.</p>" +
      '<div class="access-methods" id="access-methods">' +
      ["Huella", "Código QR", "PIN / Teclado", "Tarjeta RFID", "Llavero RFID"]
        .map(function (label, i) {
          var m = ["huella", "qr", "teclado", "tarjeta", "llavero"][i];
          return (
            '<button type="button" class="method-pill' +
            (accessMethod === m ? " is-active" : "") +
            '" data-method="' +
            m +
            '">' +
            esc(label) +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="access-wedge glass" style="padding:0.75rem 1rem;border-radius:var(--radius);margin-bottom:0.5rem">' +
      '<label style="display:flex;align-items:center;gap:0.5rem;font-size:0.8125rem;cursor:pointer"><input type="checkbox" id="access-wedge-on" /> Modo lector USB / pistola (código de barras o teclado numérico + Enter)</label>' +
      '<p style="margin:0.35rem 0 0;font-size:0.72rem;color:var(--muted-foreground)">Activá, hacé clic en el campo de abajo y escaneá: el DNI o el código del carnet debe coincidir con un producto o socio según contexto; aquí se interpreta como <strong>DNI de socio</strong>.</p>' +
      '<input type="text" id="access-wedge-cap" autocomplete="off" style="width:100%;margin-top:0.5rem;padding:0.45rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground);opacity:0.6" placeholder="Captura del lector (Enter para ingresar)" disabled /></div>' +
      '<div class="access-display" id="access-display">' +
      '<p style="color:var(--muted-foreground);margin:0">Ingresá DNI o usá el teclado y tocá <strong>Simular ingreso</strong></p></div>' +
      '<div style="text-align:center">' +
      '<input type="text" inputmode="numeric" id="access-dni" placeholder="DNI" style="max-width:12rem;width:100%;padding:0.6rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground);text-align:center;font-size:1.1rem;font-weight:700" />' +
      '<div class="keypad" id="access-keypad"></div>' +
      '<button type="button" class="btn btn--primary gradient-primary btn--round" style="margin-top:0.75rem;border:none" id="access-submit">Simular ingreso</button></div>' +
      '<div class="access-search">' +
      "<h3 style=\"margin:0 0 0.5rem;font-size:0.8rem;text-transform:uppercase;color:var(--muted-foreground)\">Buscar ficha de socio</h3>" +
      '<div class="access-search__row">' +
      '<input type="search" id="access-find" placeholder="Nombre o DNI…" />' +
      '<button type="button" class="btn btn--outline btn--sm" id="access-find-btn">Buscar</button></div></div></div>' +
      '<div class="access-sidebar glass" style="padding:1rem;border-radius:var(--radius)">' +
      "<h3 style=\"margin:0 0 0.75rem;font-size:0.75rem;text-transform:uppercase;color:var(--muted-foreground)\">Atajos</h3>" +
      '<div class="shortcut">' +
      '<button type="button" class="btn btn--outline btn--sm" id="sc-new">＋ Nuevo socio</button>' +
      '<button type="button" class="btn btn--outline btn--sm" id="sc-caja">Ver caja</button>' +
      '<button type="button" class="btn btn--outline btn--sm" id="sc-ventas">Ventas y stock</button></div>' +
      '<p style="margin:1rem 0 0;font-size:0.7rem;color:var(--muted-foreground)">Torniquete: con cuota vencida podés negar el paso desde el cartel rojo y cobrar en recepción.</p></div></div>';

    var kp = el.querySelector("#access-keypad");
    "123456789".split("").forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = d;
      b.dataset.digit = d;
      kp.appendChild(b);
    });
    var b0 = document.createElement("button");
    b0.type = "button";
    b0.textContent = "0";
    b0.dataset.digit = "0";
    var bc = document.createElement("button");
    bc.type = "button";
    bc.textContent = "⌫";
    bc.dataset.del = "1";
    kp.appendChild(b0);
    kp.appendChild(bc);

    kp.addEventListener("click", function (e) {
      var t = e.target;
      var inp = el.querySelector("#access-dni");
      if (t.dataset.digit) inp.value = (inp.value + t.dataset.digit).slice(0, 12);
      if (t.dataset.del) inp.value = inp.value.slice(0, -1);
    });

    el.querySelector("#access-methods").addEventListener("click", function (e) {
      var b = e.target.closest("[data-method]");
      if (!b) return;
      accessMethod = b.getAttribute("data-method");
      el.querySelectorAll(".method-pill").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-method") === accessMethod);
      });
    });

    el.querySelector("#access-submit").addEventListener("click", function () {
      runAccessSimulation(el.querySelector("#access-dni").value);
    });

    el.querySelector("#sc-new").addEventListener("click", openWizardNuevoSocio);
    el.querySelector("#sc-caja").addEventListener("click", function () {
      location.hash = "caja";
    });
    el.querySelector("#sc-ventas").addEventListener("click", function () {
      location.hash = "ventas";
    });

    var wedgeOn = el.querySelector("#access-wedge-on");
    var wedgeCap = el.querySelector("#access-wedge-cap");
    wedgeOn.addEventListener("change", function () {
      wedgeCap.disabled = !wedgeOn.checked;
      wedgeCap.style.opacity = wedgeOn.checked ? "1" : "0.6";
      if (wedgeOn.checked) wedgeCap.focus();
    });
    wedgeCap.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var v = wedgeCap.value.trim();
        wedgeCap.value = "";
        if (v) runAccessSimulation(v);
      }
    });

    function doFind() {
      var q = el.querySelector("#access-find").value.trim().toLowerCase();
      if (!q) return;
      var socios = window.GymStore.getSocios();
      var hit = socios.find(function (s) {
        return (
          String(s.dni).includes(q) ||
          (s.firstName + " " + s.lastName).toLowerCase().includes(q)
        );
      });
      if (hit) openFichaSocio(hit.id);
      else window.showToast({ title: "Sin resultados", description: "No hay socio con ese nombre o DNI.", variant: "destructive" });
    }
    el.querySelector("#access-find-btn").addEventListener("click", doFind);
    el.querySelector("#access-find").addEventListener("keydown", function (e) {
      if (e.key === "Enter") doFind();
    });
  }

  function runAccessSimulation(dniRaw) {
    var el = document.getElementById("panel-acceso");
    var box = el && el.querySelector("#access-display");
    if (!box) return;
    var s = window.GymStore.getSocioByDni(dniRaw);
    if (!s) {
      box.innerHTML =
        '<div class="access-result"><div class="access-result__photo">?</div><h2>Socio no encontrado</h2><p class="meta">Verificá el DNI o dalo de alta.</p></div>';
      playBeep(true);
      return;
    }
    var quotaOk = window.GymStore.isQuotaOk(s.expiresAt);
    var name = s.firstName + " " + s.lastName;
    window.GymStore.logAccess({
      socioId: s.id,
      dni: s.dni,
      method: accessMethod,
      ok: quotaOk,
      quotaOk: quotaOk,
      debt: s.debt,
      displayName: name,
    });

    var statusHtml = "";
    if (!quotaOk) {
      statusHtml =
        '<div class="access-status access-status--bad">CUOTA VENCIDA</div><p class="meta">Venció el ' +
        esc(s.expiresAt) +
        "</p>";
      playBeep(true);
    } else {
      statusHtml = '<div class="access-status access-status--ok">AL DÍA — Acceso permitido</div>';
      playBeep(false);
    }
    var debtHtml =
      s.debt > 0
        ? '<div class="access-status--debt">Saldo pendiente: ' + ctx.fmtMoney(s.debt) + "</div>"
        : "";

    var cobrarHtml = "";
    if (!quotaOk) {
      cobrarHtml =
        '<div class="access-cobrar"><button type="button" class="btn gradient-primary btn-cobrar" data-cobrar="' +
        esc(s.id) +
        '">Cobrar</button></div>';
    }

    box.innerHTML =
      '<div class="access-result">' +
      '<div class="access-result__photo">' +
      esc((s.firstName[0] || "") + (s.lastName[0] || "")) +
      "</div>" +
      "<h2>" +
      esc(name) +
      "</h2>" +
      '<p class="meta">DNI ' +
      esc(s.dni) +
      "</p>" +
      '<p class="meta">Plan: ' +
      esc(s.planName) +
      "</p>" +
      '<p class="meta">Vencimiento: ' +
      esc(s.expiresAt) +
      "</p>" +
      debtHtml +
      statusHtml +
      cobrarHtml +
      "</div>";

    var cb = box.querySelector("[data-cobrar]");
    if (cb) {
      cb.addEventListener("click", function () {
        openRenewalModal(s.id);
      });
    }
    refreshNotifUi();
  }

  function planById(id) {
    return ctx.d.plans.find(function (p) {
      return p.id === id;
    });
  }

  function openRenewalModal(socioId) {
    var s = window.GymStore.getSocioById(socioId);
    if (!s) return;
    var plan = planById(s.planId) || ctx.d.plans[0];
    var base = plan.price;
    var host = document.getElementById("modal-host");
    openModal(
      "<h2>Renovar cuota</h2>" +
        "<p style=\"margin:0 0 1rem;font-size:0.875rem;color:var(--muted-foreground)\">Elegí desde cuándo corre el nuevo período (como en ControlFit).</p>" +
        '<div class="field"><label><input type="radio" name="ren-base" value="exp" checked /> Desde último vencimiento (' +
        esc(s.expiresAt) +
        ")</label></div>" +
        '<div class="field"><label><input type="radio" name="ren-base" value="today" /> Desde hoy (' +
        esc(window.GymStore.todayStr()) +
        ")</label></div>" +
        '<p class="label" style="margin-top:1rem">Próximo vencimiento estimado</p>' +
        '<p id="ren-preview" style="font-weight:800;margin:0 0 1rem"></p>' +
        '<div class="field"><label>Monto del plan</label><input type="number" id="ren-total" value="' +
        base +
        '" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
        '<div class="field"><label>Abona (puede ser parcial)</label><input type="number" id="ren-pay" value="' +
        base +
        '" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
        '<div class="field"><label>Forma de pago</label><select id="ren-method" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)">' +
        "<option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Mercado Pago</option></select></div>" +
        '<div class="modal-actions"><button type="button" class="btn btn--ghost" data-close-modal>Cancelar</button>' +
        '<button type="button" class="btn gradient-primary" id="ren-confirm" style="border:none">Cobrar</button></div>',
      true
    );

    function updPreview() {
      var dlg = host && host.querySelector(".modal-dialog");
      if (!dlg) return;
      var chk = dlg.querySelector('input[name="ren-base"]:checked');
      var useExp = chk && chk.value === "exp";
      var start = useExp ? s.expiresAt : window.GymStore.todayStr();
      var next = window.GymStore.addMonthsStr(start, 1);
      var prev = dlg.querySelector("#ren-preview");
      if (prev) prev.textContent = next;
    }
    host.querySelectorAll('input[name="ren-base"]').forEach(function (r) {
      r.addEventListener("change", updPreview);
    });
    updPreview();

    document.getElementById("ren-confirm").onclick = function () {
      var dlg = host.querySelector(".modal-dialog");
      var useExp = dlg.querySelector('input[name="ren-base"]:checked').value === "exp";
      var start = useExp ? s.expiresAt : window.GymStore.todayStr();
      var next = window.GymStore.addMonthsStr(start, 1);
      var total = Number(document.getElementById("ren-total").value) || 0;
      var pay = Number(document.getElementById("ren-pay").value) || 0;
      var method = document.getElementById("ren-method").value;
      var newDebt = s.debt + Math.max(0, total - pay);
      window.GymStore.updateSocio(socioId, { expiresAt: next, debt: newDebt });
      window.GymStore.addPayment(socioId, {
        amount: pay,
        method: method,
        concept: "Renovación " + s.planName,
      });
      window.GymStore.addCajaMov({
        type: "ingreso_socio",
        amount: pay,
        concept: "Cuota " + s.firstName + " " + s.lastName,
        socioId: socioId,
      });
      auditStaff(
        "cobro_cuota",
        s.firstName + " " + s.lastName + " DNI " + s.dni + " — " + ctx.fmtMoney(pay)
      );
      closeModal();
      window.showToast({
        title: "Cobro registrado",
        description: "Recibo simulado: se habría enviado por WhatsApp si hubiera API.",
      });
      renderAcceso();
      refreshNotifUi();
    };
  }

  function openWizardNuevoSocio() {
    var step = 1;
    var w = { dni: "", fn: "", ln: "", ph: "" };
    function renderStep() {
      if (step === 1) {
        openModal(
          "<h2>Nuevo socio — Datos</h2>" +
            '<p style="font-size:0.8rem;color:var(--muted-foreground);margin:0 0 1rem">DNI, nombre y apellido obligatorios. El resto ayuda para WhatsApp automático.</p>' +
            '<div class="field"><label>DNI *</label><input id="nw-dni" value="' +
            esc(w.dni) +
            '" required style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
            '<div class="field"><label>Nombre *</label><input id="nw-fn" value="' +
            esc(w.fn) +
            '" required style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
            '<div class="field"><label>Apellido *</label><input id="nw-ln" value="' +
            esc(w.ln) +
            '" required style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
            '<div class="field"><label>WhatsApp</label><input id="nw-ph" value="' +
            esc(w.ph) +
            '" placeholder="+54 …" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
            '<p style="font-size:0.75rem;color:var(--muted-foreground)">Foto: en una versión con cámara se pediría aquí (omitido en demo estática).</p>' +
            '<div class="modal-actions"><button type="button" class="btn btn--ghost" data-close-modal>Cancelar</button>' +
            '<button type="button" class="btn btn--primary" id="nw-next">Siguiente</button></div>',
          true
        );
        document.getElementById("nw-next").onclick = function () {
          w.dni = document.getElementById("nw-dni").value.trim();
          w.fn = document.getElementById("nw-fn").value.trim();
          w.ln = document.getElementById("nw-ln").value.trim();
          w.ph = document.getElementById("nw-ph").value.trim();
          if (!w.dni || !w.fn || !w.ln) {
            window.showToast({ title: "Faltan datos", description: "Completá DNI, nombre y apellido.", variant: "destructive" });
            return;
          }
          if (window.GymStore.getSocioByDni(w.dni)) {
            window.showToast({ title: "DNI existente", description: "Ya hay un socio con ese documento.", variant: "destructive" });
            return;
          }
          step = 2;
          renderStep();
        };
      } else if (step === 2) {
        var dni = w.dni;
        var fn = w.fn;
        var ln = w.ln;
        var ph = w.ph;
        var plansOpts = ctx.d.plans
          .filter(function (p) {
            return p.active;
          })
          .map(function (p) {
            return (
              '<option value="' +
              esc(p.id) +
              '">' +
              esc(p.name) +
              " — " +
              ctx.fmtMoney(p.price) +
              "</option>"
            );
          })
          .join("");
        openModal(
          "<h2>Plan y vencimiento</h2>" +
            '<div class="field"><label>Actividad</label><select id="nw-act" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)">' +
            "<option>Musculación</option><option>Funcional</option><option>CrossFit</option><option>Yoga</option></select></div>" +
            '<div class="field"><label>Plan</label><select id="nw-plan" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)">' +
            plansOpts +
            "</select></div>" +
            '<div class="field"><label>Próximo vencimiento</label><input type="date" id="nw-exp" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
            '<div class="modal-actions"><button type="button" class="btn btn--ghost" id="nw-back">Atrás</button>' +
            '<button type="button" class="btn gradient-primary" id="nw-cobrar" style="border:none">Cobrar</button></div>',
          true
        );
        var p0 = ctx.d.plans.find(function (p) {
          return p.active;
        });
        var defExp = window.GymStore.addMonthsStr(window.GymStore.todayStr(), 1);
        document.getElementById("nw-exp").value = defExp;

        document.getElementById("nw-back").onclick = function () {
          step = 1;
          renderStep();
        };
        document.getElementById("nw-cobrar").onclick = function () {
          var planId = document.getElementById("nw-plan").value;
          var plan = planById(planId);
          var exp = document.getElementById("nw-exp").value;
          var act = document.getElementById("nw-act").value;
          openModal(
            "<h2>Ventana de cobro</h2>" +
              '<p style="font-size:0.875rem;color:var(--muted-foreground);margin:0 0 1rem">Monto, recargo, descuento y forma de pago (simulado).</p>' +
              '<div class="field"><label>Total plan</label><input type="number" id="pay-total" value="' +
              plan.price +
              '" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
              '<div class="field"><label>Recargo</label><input type="number" id="pay-sur" value="0" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
              '<div class="field"><label>Descuento</label><input type="number" id="pay-disc" value="0" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
              '<div class="field"><label>Abona</label><input type="number" id="pay-pay" value="' +
              plan.price +
              '" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
              '<div class="field"><label>Forma de pago</label><select id="pay-met" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option></select></div>' +
              '<div class="modal-actions"><button type="button" class="btn btn--ghost" data-close-modal>Cancelar</button>' +
              '<button type="button" class="btn gradient-primary" id="pay-go" style="border:none">Cobrar</button></div>',
            true
          );
          document.getElementById("pay-go").onclick = function () {
            var total =
              Number(document.getElementById("pay-total").value) +
              Number(document.getElementById("pay-sur").value) -
              Number(document.getElementById("pay-disc").value);
            var pay = Number(document.getElementById("pay-pay").value) || 0;
            var met = document.getElementById("pay-met").value;
            var debt = Math.max(0, total - pay);
            var socio = {
              dni: dni,
              firstName: fn,
              lastName: ln,
              phone: ph,
              activity: act,
              planId: planId,
              planName: plan.name,
              expiresAt: exp,
              debt: debt,
              birthDate: null,
              payments: [],
            };
            window.GymStore.addSocio(socio);
            var created = window.GymStore.getSocioByDni(dni);
            window.GymStore.addPayment(created.id, {
              amount: pay,
              method: met,
              concept: "Alta + " + plan.name,
            });
            window.GymStore.addCajaMov({
              type: "ingreso_socio",
              amount: pay,
              concept: "Alta socio " + fn + " " + ln,
              socioId: created.id,
            });
            auditStaff("alta_socio", fn + " " + ln + " DNI " + dni + " — " + ctx.fmtMoney(pay));
            closeModal();
            window.showToast({
              title: "Socio dado de alta",
              description: "Recibo simulado por WhatsApp. Podés simular el ingreso con su DNI.",
            });
            refreshNotifUi();
          };
        };
      }
    }
    renderStep();
  }

  function openFichaSocio(id) {
    var s = window.GymStore.getSocioById(id);
    if (!s) return;
    var asist = window.GymStore.getAsistencias().filter(function (a) {
      return a.socioId === id;
    });
    var tab = "res";
    function body() {
      if (tab === "res") {
        return (
          "<p><strong>DNI:</strong> " +
          esc(s.dni) +
          "</p><p><strong>WhatsApp:</strong> " +
          esc(s.phone || "—") +
          "</p><p><strong>Actividad:</strong> " +
          esc(s.activity) +
          "</p><p><strong>Plan:</strong> " +
          esc(s.planName) +
          "</p><p><strong>Vence:</strong> " +
          esc(s.expiresAt) +
          "</p><p><strong>Deuda:</strong> " +
          ctx.fmtMoney(s.debt) +
          "</p>"
        );
      }
      if (tab === "pagos") {
        var rows = (s.payments || [])
          .map(function (p) {
            return (
              "<tr><td>" +
              esc((p.at || "").slice(0, 10)) +
              "</td><td>" +
              ctx.fmtMoney(p.amount) +
              "</td><td>" +
              esc(p.method) +
              "</td><td>" +
              esc(p.concept || "") +
              "</td></tr>"
            );
          })
          .join("");
        return (
          '<div class="table-wrap" style="border:none"><table class="admin-table"><thead><tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Concepto</th></tr></thead><tbody>' +
          (rows || "<tr><td colspan=\"4\">Sin pagos registrados</td></tr>") +
          "</tbody></table></div>"
        );
      }
      var ar = asist
        .map(function (a) {
          return (
            "<tr><td>" +
            esc((a.at || "").replace("T", " ").slice(0, 19)) +
            "</td><td>" +
            esc(a.method) +
            "</td><td>" +
            (!a.quotaOk
              ? "Cuota vencida"
              : a.debt > 0
                ? "OK (con deuda)"
                : "OK") +
            "</td></tr>"
          );
        })
        .join("");
      return (
        '<div class="table-wrap" style="border:none"><table class="admin-table"><thead><tr><th>Fecha/Hora</th><th>Medio</th><th>Resultado</th></tr></thead><tbody>' +
        (ar || "<tr><td colspan=\"3\">Sin accesos</td></tr>") +
        "</tbody></table></div>"
      );
    }
    function paint() {
      openModal(
        "<h2>" +
          esc(s.firstName + " " + s.lastName) +
          '</h2><div class="ficha-tabs">' +
          '<button type="button" class="' +
          (tab === "res" ? "is-active" : "") +
          '" data-tab="res">Resumen</button>' +
          '<button type="button" class="' +
          (tab === "pagos" ? "is-active" : "") +
          '" data-tab="pagos">Pagos</button>' +
          '<button type="button" class="' +
          (tab === "as" ? "is-active" : "") +
          '" data-tab="as">Accesos</button></div>' +
          '<div id="ficha-body">' +
          body() +
          '</div><div class="modal-actions"><button type="button" class="btn btn--ghost" data-close-modal>Cerrar</button>' +
          (!window.GymStore.isQuotaOk(s.expiresAt)
            ? '<button type="button" class="btn gradient-primary" id="ficha-cobrar" style="border:none">Cobrar</button>'
            : "") +
          "</div>",
        true
      );
      var tabsEl = document.getElementById("modal-host").querySelector(".ficha-tabs");
      if (tabsEl) {
        tabsEl.onclick = function (e) {
          var b = e.target.closest("[data-tab]");
          if (!b) return;
          tab = b.getAttribute("data-tab");
          paint();
        };
      }
      var fc = document.getElementById("ficha-cobrar");
      if (fc) fc.onclick = function () { closeModal(); openRenewalModal(s.id); };
    }
    paint();
  }

  function renderCaja() {
    var el = document.getElementById("panel-caja");
    if (!el) return;
    var movs = window.GymStore.getCajaMovs();
    var today = window.GymStore.todayStr();
    el.innerHTML =
      '<div class="toolbar" style="flex-wrap:wrap">' +
      '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">' +
      '<label style="font-size:0.8rem;color:var(--muted-foreground)">Desde <input type="date" id="caja-from" value="' +
      today +
      '" style="margin-left:0.25rem;padding:0.35rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></label>' +
      '<label style="font-size:0.8rem;color:var(--muted-foreground)">Hasta <input type="date" id="caja-to" value="' +
      today +
      '" style="margin-left:0.25rem;padding:0.35rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></label>' +
      '<button type="button" class="btn btn--sm btn--outline" id="caja-filter">Filtrar</button></div>' +
      '<div style="display:flex;gap:0.35rem;flex-wrap:wrap">' +
      '<button type="button" class="btn btn--sm btn--outline" id="caja-in">＋ Ingreso (cambio)</button>' +
      '<button type="button" class="btn btn--sm btn--outline" id="caja-out">Retiro</button>' +
      '<button type="button" class="btn btn--sm btn--outline" id="caja-exp">Gasto</button></div></div>' +
      '<p id="caja-total" style="font-weight:800;margin:0 0 0.75rem"></p>' +
      '<div class="table-wrap glass"><table class="admin-table"><thead><tr><th>Fecha/Hora</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead><tbody id="caja-tbody"></tbody></table></div>';

    function paintRows() {
      var from = document.getElementById("caja-from").value;
      var to = document.getElementById("caja-to").value;
      var filtered = movs.filter(function (m) {
        var d = (m.at || "").slice(0, 10);
        return d >= from && d <= to;
      });
      var sum = filtered.reduce(function (a, m) {
        return a + (m.amount || 0);
      }, 0);
      document.getElementById("caja-total").textContent =
        "Total en rango: " + ctx.fmtMoney(sum) + " · " + filtered.length + " movimientos";
      document.getElementById("caja-tbody").innerHTML =
        filtered.length === 0
          ? '<tr><td colspan="4">No hay movimientos en el período.</td></tr>'
          : filtered
              .map(function (m) {
                return (
                  "<tr><td>" +
                  esc((m.at || "").replace("T", " ").slice(0, 19)) +
                  "</td><td>" +
                  esc(m.type) +
                  "</td><td>" +
                  esc(m.concept || "—") +
                  "</td><td>" +
                  ctx.fmtMoney(m.amount) +
                  "</td></tr>"
                );
              })
              .join("");
    }
    paintRows();
    document.getElementById("caja-filter").onclick = paintRows;

    function quickMov(type, title) {
      openModal(
        "<h2>" +
          esc(title) +
          '</h2><div class="field"><label>Monto</label><input type="number" id="qm-amt" value="1000" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
          '<div class="field"><label>Detalle</label><input type="text" id="qm-c" style="width:100%;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></div>' +
          '<div class="modal-actions"><button type="button" class="btn btn--ghost" data-close-modal>Cancelar</button><button type="button" class="btn gradient-primary" id="qm-ok" style="border:none">Guardar</button></div>',
        false
      );
      document.getElementById("qm-ok").onclick = function () {
        window.GymStore.addCajaMov({
          type: type,
          amount: Number(document.getElementById("qm-amt").value) || 0,
          concept: document.getElementById("qm-c").value || title,
        });
        closeModal();
        renderCaja();
        window.showToast({ title: "Movimiento registrado", description: "Quedó guardado en la caja local." });
      };
    }
    document.getElementById("caja-in").onclick = function () {
      quickMov("cambio", "Ingreso de cambio");
    };
    document.getElementById("caja-out").onclick = function () {
      quickMov("retiro", "Retiro de caja");
    };
    document.getElementById("caja-exp").onclick = function () {
      quickMov("gasto", "Gasto / compra");
    };
  }

  function renderAsistencias() {
    var el = document.getElementById("panel-asistencias");
    if (!el) return;
    var list = window.GymStore.getAsistencias();
    var today = window.GymStore.todayStr();
    el.innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      list.length +
      ' registros</p>' +
      '<label style="font-size:0.8rem">Día <input type="date" id="as-day" value="' +
      today +
      '" style="margin-left:0.25rem;padding:0.35rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/></label></div>' +
      '<div class="table-wrap glass"><table class="admin-table"><thead><tr><th>Fecha/Hora</th><th>Socio</th><th>DNI</th><th>Medio</th><th>Estado cuota</th><th>Deuda</th></tr></thead><tbody id="as-tb"></tbody></table></div>';

    function paint() {
      var day = document.getElementById("as-day").value;
      var rows = list.filter(function (a) {
        return (a.at || "").slice(0, 10) === day;
      });
      document.getElementById("as-tb").innerHTML =
        rows.length === 0
          ? '<tr><td colspan="6">Nadie ingresó ese día (en simulación).</td></tr>'
          : rows
              .map(function (a) {
                return (
                  "<tr><td>" +
                  esc((a.at || "").replace("T", " ").slice(0, 19)) +
                  "</td><td>" +
                  esc(a.displayName || "—") +
                  "</td><td>" +
                  esc(a.dni || "") +
                  "</td><td>" +
                  esc(a.method) +
                  "</td><td>" +
                  (a.quotaOk === false ? '<span class="badge badge--destructive">Vencida</span>' : '<span class="badge badge--success">Al día</span>') +
                  "</td><td>" +
                  (a.debt > 0 ? ctx.fmtMoney(a.debt) : "—") +
                  "</td></tr>"
                );
              })
              .join("");
    }
    paint();
    document.getElementById("as-day").onchange = paint;
  }

  function renderSocios() {
    var el = document.getElementById("panel-socios");
    if (!el) return;
    var socios = window.GymStore.getSocios();
    el.innerHTML =
      '<div class="toolbar"><p style="margin:0;font-size:0.875rem;color:var(--muted-foreground)">' +
      socios.length +
      ' socios</p><button type="button" class="btn btn--sm gradient-primary" style="border:none" id="soc-new">＋ Nuevo socio</button></div>' +
      '<div class="table-wrap glass"><table class="admin-table"><thead><tr><th>Nombre</th><th>DNI</th><th>Plan</th><th>Vence</th><th>Deuda</th></tr></thead><tbody id="soc-tb"></tbody></table></div>';

    document.getElementById("soc-tb").innerHTML = socios
      .map(function (s) {
        return (
          "<tr data-socio=\"" +
          esc(s.id) +
          "\" style=\"cursor:pointer\"><td><strong>" +
          esc(s.firstName + " " + s.lastName) +
          "</strong></td><td>" +
          esc(s.dni) +
          "</td><td>" +
          esc(s.planName) +
          "</td><td>" +
          esc(s.expiresAt) +
          "</td><td>" +
          (s.debt > 0 ? ctx.fmtMoney(s.debt) : "—") +
          "</td></tr>"
        );
      })
      .join("");

    el.querySelector("#soc-tb").addEventListener("click", function (e) {
      var tr = e.target.closest("tr[data-socio]");
      if (!tr) return;
      openFichaSocio(tr.getAttribute("data-socio"));
    });
    document.getElementById("soc-new").onclick = openWizardNuevoSocio;
  }

  function renderWhatsapp() {
    var el = document.getElementById("panel-whatsapp");
    if (!el) return;
    var cfg = window.GymStore.getWaConfig();
    el.innerHTML =
      "<h2 style=\"margin:0 0 0.5rem;font-size:1rem\">WhatsApp automáticos</h2>" +
      '<p style="font-size:0.875rem;color:var(--muted-foreground);margin:0 0 1rem">Activá o editá plantillas. Los [campos] se reemplazan al enviar (simulado).</p>' +
      '<div id="wa-list"></div>' +
      '<button type="button" class="btn gradient-primary" id="wa-save" style="margin-top:1rem;border:none">Guardar plantillas</button>' +
      "<h2 style=\"margin:2rem 0 0.5rem;font-size:1rem\">Envío masivo (demo)</h2>" +
      '<textarea id="wa-bulk" style="width:100%;min-height:4rem;padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)" placeholder="Escribí promoción o aviso…"></textarea>' +
      '<p style="font-size:0.8rem;color:var(--muted-foreground)">Selección: todos los socios con WhatsApp cargado.</p>' +
      '<button type="button" class="btn btn--outline" id="wa-send">Enviar a todos (simulado)</button>';

    document.getElementById("wa-list").innerHTML = cfg
      .map(function (t, i) {
        return (
          '<div class="wa-card glass"><label style="display:flex;align-items:center;gap:0.5rem;font-weight:600"><input type="checkbox" data-wa-en="' +
          i +
          '" ' +
          (t.enabled ? "checked" : "") +
          " /> " +
          esc(t.name) +
          '</label><textarea data-wa-body="' +
          i +
          '">' +
          esc(t.body) +
          "</textarea></div>"
        );
      })
      .join("");

    document.getElementById("wa-save").onclick = function () {
      var next = cfg.map(function (t, i) {
        return {
          id: t.id,
          name: t.name,
          enabled: document.querySelector("[data-wa-en=\"" + i + "\"]").checked,
          body: document.querySelector("[data-wa-body=\"" + i + "\"]").value,
        };
      });
      window.GymStore.saveWaConfig(next);
      window.showToast({ title: "Guardado", description: "Plantillas guardadas en el navegador." });
    };
    document.getElementById("wa-send").onclick = function () {
      var msg = document.getElementById("wa-bulk").value.trim();
      if (!msg) return;
      var n = window.GymStore.getSocios().filter(function (s) {
        return s.phone;
      }).length;
      window.showToast({
        title: "Envío simulado",
        description: "Se habrían encolado " + n + " mensajes: " + msg.slice(0, 60) + (msg.length > 60 ? "…" : ""),
      });
    };
  }

  function renderVentas() {
    var el = document.getElementById("panel-ventas");
    if (!el) return;
    var staff = window.GymSession.get();
    el.innerHTML =
      '<p style="margin:0 0 1rem;font-size:0.875rem;color:var(--muted-foreground)">Escaneá el código de barras del producto (SKU en la demo) o vendé desde la tabla. Cada venta impacta <strong>stock</strong> y <strong>caja</strong>.</p>' +
      '<div class="toolbar" style="flex-wrap:wrap">' +
      '<div class="access-search__row" style="flex:1;min-width:14rem">' +
      '<input type="text" id="venta-scan" placeholder="Pistola USB: enfocá acá y escaneá…" autocomplete="off" style="flex:1;min-width:12rem;padding:0.55rem;border-radius:var(--radius);border:1px solid var(--border);background:var(--background);color:var(--foreground)"/>' +
      '<button type="button" class="btn btn--primary gradient-primary" id="venta-scan-go" style="border:none">Vender leído</button></div></div>' +
      '<div class="table-wrap glass" style="margin-top:1rem"><table class="admin-table"><thead><tr><th>Producto</th><th>SKU</th><th>Precio</th><th>Stock</th><th></th></tr></thead><tbody id="venta-tb"></tbody></table></div>';

    function paintTable() {
      var prods = window.GymStore.getProducts();
      document.getElementById("venta-tb").innerHTML = prods
        .map(function (p) {
          return (
            "<tr><td><strong>" +
            esc(p.name) +
            "</strong></td><td style=\"font-family:monospace;font-size:0.8rem\">" +
            esc(p.sku) +
            "</td><td>" +
            ctx.fmtMoney(p.price) +
            "</td><td>" +
            p.stock +
            '</td><td><button type="button" class="btn btn--sm btn--outline" data-vender="' +
            esc(p.id) +
            '">Vender ×1</button></td></tr>'
          );
        })
        .join("");
    }
    paintTable();

    function doSale(productId, qty) {
      var prods = window.GymStore.getProducts();
      var p = prods.find(function (x) {
        return x.id === productId;
      });
      if (!p) return;
      var r = window.GymStore.registerSale(productId, qty, p.price, staff && staff.dni, staff && staff.displayName);
      if (!r.ok) {
        window.showToast({ title: "Venta", description: r.error, variant: "destructive" });
        return;
      }
      window.showToast({
        title: "Venta registrada",
        description: ctx.fmtMoney(r.total) + " — Stock actualizado. Movimiento en caja.",
      });
      paintTable();
    }

    el.querySelector("#venta-tb").addEventListener("click", function (e) {
      var b = e.target.closest("[data-vender]");
      if (!b) return;
      doSale(b.getAttribute("data-vender"), 1);
    });

    function tryScan() {
      var raw = document.getElementById("venta-scan").value.trim();
      document.getElementById("venta-scan").value = "";
      if (!raw) return;
      var p = window.GymStore.getProductBySku(raw);
      if (p) {
        doSale(p.id, 1);
        return;
      }
      window.showToast({
        title: "SKU no encontrado",
        description: "Probá 7790001002002 (proteína) o escaneá desde la tabla.",
        variant: "destructive",
      });
    }
    document.getElementById("venta-scan-go").onclick = tryScan;
    document.getElementById("venta-scan").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        tryScan();
      }
    });
  }

  function renderEmpleados() {
    var el = document.getElementById("panel-empleados");
    if (!el) return;
    var demos = (ctx.d.demoStaffAccounts || []).map(function (u) {
      return {
        dni: u.dni,
        displayName: u.displayName,
        role: u.role,
        origin: "Demo",
      };
    });
    var reg = window.GymSession.getRegisteredUsers().map(function (u) {
      return {
        dni: u.dni,
        displayName: u.displayName,
        role: u.role || "Empleado",
        origin: "Registrado local",
      };
    });
    var rows = demos.concat(reg);
    el.innerHTML =
      '<p style="margin:0 0 1rem;font-size:0.875rem;color:var(--muted-foreground)">En un sistema real cada usuario tendría permisos granulares y cada acción quedaría auditada en servidor. Acá todo es <strong>local</strong>.</p>' +
      '<div class="admin-card glass" style="margin-bottom:1.25rem">' +
      '<div class="admin-card__head"><h2>Usuarios del software</h2></div>' +
      '<div class="admin-card__body" style="padding:0">' +
      '<div class="table-wrap" style="border:none"><table class="admin-table"><thead><tr><th>DNI</th><th>Nombre</th><th>Rol</th><th>Origen</th></tr></thead><tbody>' +
      rows
        .map(function (r) {
          return (
            "<tr><td>" +
            esc(r.dni) +
            "</td><td>" +
            esc(r.displayName) +
            "</td><td><span class=\"badge badge--primary\">" +
            esc(r.role) +
            "</span></td><td style=\"font-size:0.8rem;color:var(--muted-foreground)\">" +
            esc(r.origin) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div></div></div>" +
      '<div class="admin-card glass">' +
      '<div class="admin-card__head"><h2>Registro de auditoría</h2></div>' +
      '<div class="admin-card__body" style="padding:0">' +
      '<div class="table-wrap" style="border:none;max-height:22rem;overflow:auto"><table class="admin-table"><thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead><tbody id="aud-tb"></tbody></table></div></div></div>' +
      '<p style="margin-top:1rem;font-size:0.8rem;color:var(--muted-foreground)">Próximos pasos sugeridos: módulo ventas con permiso <em>solo caja</em>, app móvil del socio con QR, y sincronización con API.</p>';

    var logs = window.GymStore.getAuditLog();
    document.getElementById("aud-tb").innerHTML =
      logs.length === 0
        ? '<tr><td colspan="4">Aún no hay eventos. Cobrá una cuota o vendé un producto.</td></tr>'
        : logs
            .map(function (a) {
              return (
                "<tr><td style=\"white-space:nowrap;font-size:0.75rem\">" +
                esc((a.at || "").replace("T", " ").slice(0, 19)) +
                "</td><td>" +
                esc(a.staffName || "—") +
                "<br/><span style=\"font-size:0.7rem;color:var(--muted-foreground)\">DNI " +
                esc(a.staffDni || "—") +
                "</span></td><td>" +
                esc(a.action) +
                "</td><td style=\"font-size:0.8rem\">" +
                esc(a.detail) +
                "</td></tr>"
              );
            })
            .join("");
  }

  function renderEstadisticas() {
    var el = document.getElementById("panel-estadisticas");
    if (!el) return;
    if (statsCharts.hourly) {
      try {
        statsCharts.hourly.destroy();
      } catch (e) {}
      statsCharts.hourly = null;
    }
    if (statsCharts.income) {
      try {
        statsCharts.income.destroy();
      } catch (e) {}
      statsCharts.income = null;
    }
    el.innerHTML =
      '<p style="color:var(--muted-foreground);font-size:0.875rem;margin:0 0 1rem">Datos de ejemplo; con backend podrías cruzar asistencias reales y caja.</p>' +
      '<div class="chart-row"><div class="admin-card glass"><div class="admin-card__head"><h2>Concentración por franja (lunes tipo)</h2></div><div class="admin-card__body"><div class="chart-box"><canvas id="chart-hourly"></canvas></div></div></div>' +
      '<div class="admin-card glass"><div class="admin-card__head"><h2>Ingresos por día (demo)</h2></div><div class="admin-card__body"><div class="chart-box"><canvas id="chart-income"></canvas></div></div></div></div>';
  }

  function initStatsCharts() {
    if (typeof Chart === "undefined") return;
    var hEl = document.getElementById("chart-hourly");
    var iEl = document.getElementById("chart-income");
    if (!hEl || !iEl) return;
    if (statsCharts.hourly && statsCharts.income) return;
    var grid = "hsl(240 4% 16%)";
    var tick = "hsl(215 14% 55%)";
    var bh = ctx.d.statsByHour || [];
    statsCharts.hourly = new Chart(hEl, {
      type: "bar",
      data: {
        labels: bh.map(function (x) {
          return x.h;
        }),
        datasets: [
          {
            data: bh.map(function (x) {
              return x.n;
            }),
            backgroundColor: "hsl(280 65% 55%)",
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
    var wi = ctx.d.weeklyIncome || [];
    statsCharts.income = new Chart(iEl, {
      type: "line",
      data: {
        labels: wi.map(function (x) {
          return x.day;
        }),
        datasets: [
          {
            data: wi.map(function (x) {
              return x.amount;
            }),
            borderColor: "hsl(199 89% 48%)",
            tension: 0.35,
            fill: false,
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

  window.GymSistema = {
    init: function (opts) {
      ctx.d = opts.d;
      ctx.fmtMoney = opts.fmtMoney;
      ctx.mergeGym = opts.mergeGym;
      bindNotifBell();
      refreshNotifUi();
    },
    onRoute: function (route) {
      if (ROUTES.indexOf(route) < 0) return;
      if (route === "acceso") renderAcceso();
      if (route === "caja") renderCaja();
      if (route === "asistencias") renderAsistencias();
      if (route === "socios") renderSocios();
      if (route === "whatsapp") renderWhatsapp();
      if (route === "ventas") renderVentas();
      if (route === "empleados") renderEmpleados();
      if (route === "estadisticas") {
        renderEstadisticas();
        requestAnimationFrame(function () {
          initStatsCharts();
        });
      }
    },
  };
})();
