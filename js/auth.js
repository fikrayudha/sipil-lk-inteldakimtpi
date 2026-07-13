(function () {
  if (SIPIL.session()) window.location.href = "dashboard.html";
})();

document.getElementById("togglePass").addEventListener("click", function () {
  const inp = document.getElementById("password");
  const icon = this.querySelector("i");
  const show = inp.type === "password";
  inp.type = show ? "text" : "password";
  icon.className = show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
});

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("btnLogin");
  const btnText = document.getElementById("btnLoginText");

  if (!username || !password) return;

  btn.disabled = true;
  btnText.innerHTML = '<span class="loader"></span> Memeriksa...';

  try {
    const data = await SIPIL.call("login", { username, password });
    localStorage.setItem("sipil_session", JSON.stringify(data));
    window.location.href = "dashboard.html";
  } catch (err) {
    SIPIL.toast("error", "Login gagal", err.message || "Username atau password salah.");
    btn.disabled = false;
    btnText.textContent = "Masuk";
  }
});
