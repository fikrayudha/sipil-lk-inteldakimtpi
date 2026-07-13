SIPIL_SHELL.init("dashboard");

function badgeKategori(k) {
  return k === "WNA" ? '<span class="badge wna">WNA</span>' : '<span class="badge wni">WNI</span>';
}

(async function loadStats() {
  try {
    const s = await SIPIL.call("getDashboardStats");

    document.getElementById("valLastNumber").textContent = s.lastNumber || "-";
    document.getElementById("valLastNumber").classList.remove("skeleton");
    document.getElementById("valTotal").textContent = s.totalYear ?? 0;
    document.getElementById("valTotal").classList.remove("skeleton");
    document.getElementById("valToday").textContent = s.todayCount ?? 0;
    document.getElementById("valToday").classList.remove("skeleton");
    document.getElementById("valNegara").textContent = s.negaraCount ?? 0;
    document.getElementById("valNegara").classList.remove("skeleton");
    document.getElementById("valWni").textContent = s.wniCount ?? 0;
    document.getElementById("valWni").classList.remove("skeleton");
    document.getElementById("valWna").textContent = s.wnaCount ?? 0;
    document.getElementById("valWna").classList.remove("skeleton");

    const rows = (s.recent || []);
    const tbody = document.getElementById("recentRows");
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8895B3;padding:24px;">Belum ada data.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="mono-cell">${r.nomorLK}</td>
        <td>${r.tanggal}</td>
        <td>${r.nama}</td>
        <td>${badgeKategori(r.kategori)}</td>
        <td>${r.jenisBAP}</td>
        <td>${r.petugas}</td>
      </tr>`).join("");
  } catch (err) {
    SIPIL.toast("error", "Gagal memuat dashboard", err.message);
  }
})();
