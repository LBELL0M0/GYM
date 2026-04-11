(function () {
  var K_SOCIOS = "gymflow_socios_data";
  var K_CAJA = "gymflow_caja_movs";
  var K_ASIST = "gymflow_asistencias_log";
  var K_WA = "gymflow_wa_automation";
  var K_PRODUCTS = "gymflow_products";
  var K_AUDIT = "gymflow_audit_log";

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function cloneSeed() {
    var seed = (window.GYM_DATA && window.GYM_DATA.sociosSeed) || [];
    return seed.map(function (s) {
      return JSON.parse(JSON.stringify(s));
    });
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  window.GymStore = {
    getSocios: function () {
      var stored = readJson(K_SOCIOS, null);
      if (stored && Array.isArray(stored)) return stored;
      return cloneSeed();
    },

    saveSocios: function (list) {
      localStorage.setItem(K_SOCIOS, JSON.stringify(list));
    },

    getSocioByDni: function (dni) {
      var clean = String(dni).replace(/\D/g, "");
      return this.getSocios().find(function (s) {
        return String(s.dni).replace(/\D/g, "") === clean;
      });
    },

    getSocioById: function (id) {
      return this.getSocios().find(function (s) {
        return s.id === id;
      });
    },

    updateSocio: function (id, patch) {
      var list = this.getSocios();
      var i = list.findIndex(function (s) {
        return s.id === id;
      });
      if (i < 0) return null;
      list[i] = Object.assign({}, list[i], patch);
      this.saveSocios(list);
      return list[i];
    },

    addSocio: function (socio) {
      var list = this.getSocios();
      socio.id = socio.id || uid("soc");
      if (!socio.payments) socio.payments = [];
      list.push(socio);
      this.saveSocios(list);
      return socio;
    },

    addPayment: function (socioId, payment) {
      var s = this.getSocioById(socioId);
      if (!s) return;
      payment.id = uid("pay");
      payment.at = payment.at || new Date().toISOString();
      var payments = (s.payments || []).concat([payment]);
      this.updateSocio(socioId, { payments: payments });
    },

    getCajaMovs: function () {
      return readJson(K_CAJA, []);
    },

    addCajaMov: function (mov) {
      var list = this.getCajaMovs();
      mov.id = mov.id || uid("caja");
      mov.at = mov.at || new Date().toISOString();
      list.unshift(mov);
      localStorage.setItem(K_CAJA, JSON.stringify(list));
      return mov;
    },

    getAsistencias: function () {
      return readJson(K_ASIST, []);
    },

    logAccess: function (entry) {
      var list = this.getAsistencias();
      entry.id = entry.id || uid("asist");
      entry.at = entry.at || new Date().toISOString();
      list.unshift(entry);
      localStorage.setItem(K_ASIST, JSON.stringify(list));
      return entry;
    },

    getWaConfig: function () {
      var defaults = (window.GYM_DATA && window.GYM_DATA.whatsappAutomationDefaults) || [];
      var stored = readJson(K_WA, null);
      if (!stored || !Array.isArray(stored)) {
        return defaults.map(function (t) {
          return JSON.parse(JSON.stringify(t));
        });
      }
      return stored;
    },

    saveWaConfig: function (arr) {
      localStorage.setItem(K_WA, JSON.stringify(arr));
    },

    /** YYYY-MM-DD hoy en zona local */
    todayStr: function () {
      var t = new Date();
      var y = t.getFullYear();
      var m = String(t.getMonth() + 1).padStart(2, "0");
      var da = String(t.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + da;
    },

    isQuotaOk: function (expiresAtStr) {
      return expiresAtStr >= this.todayStr();
    },

    addMonthsStr: function (yyyyMmDd, months) {
      var p = yyyyMmDd.split("-").map(Number);
      var d = new Date(p[0], p[1] - 1, p[2]);
      d.setMonth(d.getMonth() + months);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var da = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + da;
    },

    getProducts: function () {
      var seed = (window.GYM_DATA && window.GYM_DATA.productsSeed) || [];
      var stored = readJson(K_PRODUCTS, null);
      if (stored && Array.isArray(stored)) return stored;
      return seed.map(function (p) {
        return JSON.parse(JSON.stringify(p));
      });
    },

    saveProducts: function (list) {
      localStorage.setItem(K_PRODUCTS, JSON.stringify(list));
    },

    getProductBySku: function (raw) {
      var clean = String(raw || "").replace(/\s/g, "");
      return this.getProducts().find(function (p) {
        return String(p.sku) === clean;
      });
    },

    /** Venta: descuenta stock, caja, auditoría */
    registerSale: function (productId, qty, unitPrice, staffDni, staffName) {
      qty = Math.max(1, Number(qty) || 1);
      var list = this.getProducts();
      var i = list.findIndex(function (p) {
        return p.id === productId;
      });
      if (i < 0) return { ok: false, error: "Producto no encontrado" };
      if (list[i].stock < qty) return { ok: false, error: "Stock insuficiente" };
      list[i].stock -= qty;
      this.saveProducts(list);
      var total = unitPrice * qty;
      this.addCajaMov({
        type: "venta",
        amount: total,
        concept: "Venta " + qty + "× " + list[i].name,
        productId: productId,
      });
      this.appendAudit({
        staffDni: staffDni || "—",
        staffName: staffName || "—",
        action: "venta",
        detail: qty + "× " + list[i].name + " — " + total + " ARS",
      });
      return { ok: true, total: total, product: list[i] };
    },

    getAuditLog: function () {
      return readJson(K_AUDIT, []);
    },

    appendAudit: function (entry) {
      var list = this.getAuditLog();
      entry.id = entry.id || uid("aud");
      entry.at = entry.at || new Date().toISOString();
      list.unshift(entry);
      localStorage.setItem(K_AUDIT, JSON.stringify(list.slice(0, 500)));
      return entry;
    },
  };
})();
