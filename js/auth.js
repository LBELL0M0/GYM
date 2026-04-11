(function () {
  var gym = window.GYM_DATA && window.GYM_DATA.gym ? window.GYM_DATA.gym : { name: "Iron Force Gym" };
  var o = window.GymSession.getBrandOverrides();
  if (o && o.name) gym = Object.assign({}, gym, o);
  document.getElementById("auth-gym-name").textContent = gym.name;

  document.querySelectorAll(".auth-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-tab");
      document.querySelectorAll(".auth-tab").forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      document.querySelectorAll(".auth-panel").forEach(function (p) {
        p.classList.remove("is-active");
      });
      document.getElementById(id === "login" ? "form-login" : "form-register").classList.add("is-active");
    });
  });

  document.getElementById("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    var dni = document.getElementById("login-dni").value.trim();
    var password = document.getElementById("login-password").value;
    var btn = document.getElementById("btn-login");
    btn.disabled = true;
    btn.textContent = "Ingresando…";

    setTimeout(function () {
      var user = window.GymSession.findUser(dni, password);
      if (user) {
        window.GymSession.set({
          dni: user.dni,
          displayName: user.displayName,
          role: user.role || "Personal",
        });
        window.location.href = "admin.html";
        return;
      }
      window.showToast({
        title: "Error al iniciar sesión",
        description: "DNI o contraseña incorrectos. Usá las cuentas demo o registrate en Alta personal.",
        variant: "destructive",
      });
      btn.disabled = false;
      btn.textContent = "Iniciar sesión";
    }, 280);
  });

  document.getElementById("form-register").addEventListener("submit", function (e) {
    e.preventDefault();
    var dni = document.getElementById("reg-dni").value.trim();
    var displayName = document.getElementById("reg-name").value.trim();
    var password = document.getElementById("reg-password").value;
    var btn = document.getElementById("btn-register");
    btn.disabled = true;
    btn.textContent = "Creando…";

    setTimeout(function () {
      var ok = window.GymSession.registerUser({
        dni: dni,
        password: password,
        displayName: displayName,
        role: "Empleado",
      });
      if (!ok) {
        window.showToast({
          title: "No se pudo registrar",
          description: "Ya existe un usuario con ese DNI.",
          variant: "destructive",
        });
      } else {
        window.showToast({
          title: "Usuario creado",
          description: "Ya podés iniciar sesión con tu DNI y contraseña.",
        });
        document.querySelector('.auth-tab[data-tab="login"]').click();
        document.getElementById("login-dni").value = dni.replace(/\D/g, "");
      }
      btn.disabled = false;
      btn.textContent = "Crear usuario";
    }, 280);
  });
})();
