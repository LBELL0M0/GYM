(function () {
  var SESSION_KEY = "gymflow_session";
  var USERS_KEY = "gymflow_users";
  var BRAND_KEY = "gymflow_brand";
  var MODULES_KEY = "gymflow_modules";

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function normDni(d) {
    return String(d || "").replace(/\D/g, "");
  }

  function findDemoStaff(dniClean, password) {
    var list = (window.GYM_DATA && window.GYM_DATA.demoStaffAccounts) || [];
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (normDni(a.dni) === dniClean && a.password === password) return a;
    }
    return null;
  }

  window.GymSession = {
    get: function () {
      return readJson(SESSION_KEY, null);
    },
    set: function (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },
    clear: function () {
      localStorage.removeItem(SESSION_KEY);
    },
    isLoggedIn: function () {
      return !!this.get();
    },
    normDni: normDni,

    getRegisteredUsers: function () {
      return readJson(USERS_KEY, []);
    },

    /** Registro de personal: DNI + contraseña + nombre (mismo storage que antes, esquema nuevo) */
    registerUser: function (user) {
      var list = this.getRegisteredUsers();
      var dc = normDni(user.dni);
      if (!dc) return false;
      if (list.some(function (u) { return normDni(u.dni) === dc; })) return false;
      list.push({
        dni: dc,
        password: user.password,
        displayName: user.displayName,
        role: user.role || "Empleado",
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(list));
      return true;
    },

    findUser: function (dni, password) {
      var dc = normDni(dni);
      if (!dc) return null;
      var demo = findDemoStaff(dc, password);
      if (demo) {
        return {
          dni: dc,
          displayName: demo.displayName,
          role: demo.role,
          isDemo: true,
        };
      }
      var list = this.getRegisteredUsers();
      for (var i = 0; i < list.length; i++) {
        var u = list[i];
        if (normDni(u.dni) === dc && u.password === password) {
          return {
            dni: dc,
            displayName: u.displayName,
            role: u.role || "Empleado",
            isDemo: false,
          };
        }
      }
      return null;
    },

    getBrandOverrides: function () {
      return readJson(BRAND_KEY, null);
    },
    saveBrandOverrides: function (obj) {
      localStorage.setItem(BRAND_KEY, JSON.stringify(obj));
    },
    getModuleOverrides: function () {
      return readJson(MODULES_KEY, null);
    },
    saveModuleOverrides: function (obj) {
      localStorage.setItem(MODULES_KEY, JSON.stringify(obj));
    },
  };
})();
