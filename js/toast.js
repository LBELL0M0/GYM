(function () {
  window.showToast = function (opts) {
    opts = opts || {};
    var title = opts.title || "";
    var description = opts.description || "";
    var variant = opts.variant || "default";

    var el = document.createElement("div");
    el.className = "toast toast--" + variant;
    el.innerHTML =
      "<strong class=\"toast__title\"></strong><p class=\"toast__desc\"></p>";
    el.querySelector(".toast__title").textContent = title;
    el.querySelector(".toast__desc").textContent = description;

    var host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    host.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("toast--show");
    });
    setTimeout(function () {
      el.classList.remove("toast--show");
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 3800);
  };
})();
