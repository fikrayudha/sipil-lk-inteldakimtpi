// Bangun sidebar + userbox, isi jam berjalan, & pasang tombol logout.
// Dipanggil oleh setiap halaman lewat: SIPIL_SHELL.init("dashboard")
const SIPIL_SHELL = {
  menu: [
    { key: "dashboard", href: "dashboard.html", icon: "fa-gauge-high", label: "Dashboard" },
    { key: "pengambilan", href: "pengambilan.html", icon: "fa-file-circle-plus", label: "Pengambilan Nomor LK" },
    { key: "database", href: "database.html", icon: "fa-database", label: "Database LK" },
  ],

  init(activeKey) {
    const session = SIPIL.requireLogin();
    if (!session) return;

    const nav = this.menu.map(m => `
      <a class="nav-item ${m.key === activeKey ? "active" : ""}" href="${m.href}">
        <i class="fa-solid ${m.icon}"></i> ${m.label}
      </a>`).join("");

    document.getElementById("sidebarMount").innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="mark">
            <img src="assets/logo.png" alt="Logo" class="mark-img" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';">
            <span class="mark-fallback" style="display:none;">BD</span>
          </div>
          <div class="txt">
            <strong>SIPIL</strong>
            <span>Imigrasi Tanjungpinang</span>
          </div>
        </div>
        <div class="nav-group">
          <div class="nav-label">Menu Utama</div>
          ${nav}
        </div>
        <div class="userbox">
          <div class="av">${SIPIL.initials(session.nama || session.username)}</div>
          <div class="info">
            <strong>${session.nama || session.username}</strong>
            <span>${session.role || "Petugas"}</span>
          </div>
          <button id="btnLogout" title="Keluar"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      </aside>`;

    document.getElementById("btnLogout").addEventListener("click", () => {
      Swal.fire({
        title: "Keluar dari SIPIL?",
        text: "Sesi kamu akan diakhiri.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, keluar",
        cancelButtonText: "Batal",
        confirmButtonColor: "#E23B3B",
      }).then(r => { if (r.isConfirmed) SIPIL.logout(); });
    });

    const clockEl = document.getElementById("clock");
    if (clockEl) {
      const tick = () => {
        const d = new Date();
        clockEl.textContent = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
          " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      };
      tick();
      setInterval(tick, 30000);
    }

    const burger = document.getElementById("burger");
    if (burger) burger.addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));

    return session;
  }
};
