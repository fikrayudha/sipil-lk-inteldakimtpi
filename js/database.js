SIPIL_SHELL.init("database");

const state = { page: 1, pageSize: 10, search: "", kategori: "", status: "", totalPages: 1 };
let debounceTimer = null;

function badgeKategori(k) { return k === "WNA" ? '<span class="badge wna">WNA</span>' : '<span class="badge wni">WNI</span>'; }
function badgeStatus(s) { return s === "Selesai" ? '<span class="badge selesai">Selesai</span>' : '<span class="badge proses">Proses</span>'; }

async function loadTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#8895B3;padding:24px;">Memuat data...</td></tr>`;

  try {
    const data = await SIPIL.call("getData", {
      page: state.page, pageSize: state.pageSize,
      search: state.search, kategori: state.kategori, status: state.status,
    });

    state.totalPages = Math.max(1, Math.ceil(data.total / state.pageSize));
    const rows = data.rows || [];

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><i class="fa-solid fa-inbox"></i><div>Tidak ada data ditemukan.</div></div></td></tr>`;
    } else {
      tbody.innerHTML = rows.map(r => `
        <tr>
          <td class="mono-cell">${r.nomorLK}</td>
          <td>${r.tanggal}</td>
          <td>${r.nama}</td>
          <td>${badgeKategori(r.kategori)}</td>
          <td>${r.kebangsaan}</td>
          <td>${r.nikPaspor}</td>
          <td>${r.jenisBAP}</td>
          <td>${r.petugas}</td>
          <td>${badgeStatus(r.status)}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn edit-btn" data-id="${r.nomorLK}" title="Edit"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-btn del del-btn" data-id="${r.nomorLK}" title="Hapus"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`).join("");
    }

    document.getElementById("pageInfo").textContent =
      `Menampilkan ${rows.length ? (state.page - 1) * state.pageSize + 1 : 0}–${(state.page - 1) * state.pageSize + rows.length} dari ${data.total} data`;

    renderPagination();
    attachRowEvents(rows);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#E23B3B;padding:24px;">${err.message}</td></tr>`;
  }
}

function renderPagination() {
  const wrap = document.getElementById("pageButtons");
  let html = `<button ${state.page === 1 ? "disabled" : ""} id="prevBtn"><i class="fa-solid fa-chevron-left"></i></button>`;
  const start = Math.max(1, state.page - 2);
  const end = Math.min(state.totalPages, start + 4);
  for (let p = start; p <= end; p++) {
    html += `<button class="page-num ${p === state.page ? "active" : ""}" data-p="${p}">${p}</button>`;
  }
  html += `<button ${state.page === state.totalPages ? "disabled" : ""} id="nextBtn"><i class="fa-solid fa-chevron-right"></i></button>`;
  wrap.innerHTML = html;

  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  if (prev) prev.addEventListener("click", () => { state.page--; loadTable(); });
  if (next) next.addEventListener("click", () => { state.page++; loadTable(); });
  wrap.querySelectorAll(".page-num").forEach(b => {
    b.addEventListener("click", () => { state.page = parseInt(b.dataset.p); loadTable(); });
  });
}

function attachRowEvents(rows) {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => openEdit(rows.find(r => r.nomorLK === btn.dataset.id)));
  });
  document.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", () => confirmDelete(btn.dataset.id));
  });
}

function openEdit(r) {
  if (!r) return;
  document.getElementById("editNomorLK").value = r.nomorLK;
  document.getElementById("editTanggal").value = r.tanggal;
  document.getElementById("editKategori").value = r.kategori;
  document.getElementById("editNama").value = r.nama;
  document.getElementById("editKebangsaan").value = r.kebangsaan;
  document.getElementById("editNik").value = r.nikPaspor;
  document.getElementById("editJenisBAP").value = r.jenisBAP;
  document.getElementById("editStatus").value = r.status;
  document.getElementById("editPerihal").value = r.perihal;
  document.getElementById("editPetugas").value = r.petugas;
  document.getElementById("editModal").style.display = "flex";
}
document.getElementById("btnCancelEdit").addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

document.getElementById("formEdit").addEventListener("submit", async function (e) {
  e.preventDefault();
  const btn = document.getElementById("btnSaveEdit");
  btn.disabled = true;
  btn.innerHTML = '<span class="loader"></span> Menyimpan...';

  try {
    await SIPIL.call("updateData", {
      nomorLK: document.getElementById("editNomorLK").value,
      tanggal: document.getElementById("editTanggal").value,
      kategori: document.getElementById("editKategori").value,
      nama: document.getElementById("editNama").value.trim(),
      kebangsaan: document.getElementById("editKebangsaan").value.trim(),
      nikPaspor: document.getElementById("editNik").value.trim(),
      jenisBAP: document.getElementById("editJenisBAP").value.trim(),
      status: document.getElementById("editStatus").value,
      perihal: document.getElementById("editPerihal").value.trim(),
      petugas: document.getElementById("editPetugas").value.trim(),
    });
    document.getElementById("editModal").style.display = "none";
    SIPIL.toast("success", "Tersimpan", "Data berhasil diperbarui.");
    loadTable();
  } catch (err) {
    SIPIL.toast("error", "Gagal menyimpan", err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Perubahan";
  }
});

function confirmDelete(nomorLK) {
  Swal.fire({
    title: "Hapus data ini?",
    text: nomorLK + " akan dihapus permanen dari database.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#E23B3B",
  }).then(async (r) => {
    if (!r.isConfirmed) return;
    try {
      await SIPIL.call("deleteData", { nomorLK });
      SIPIL.toast("success", "Terhapus", nomorLK + " berhasil dihapus.");
      loadTable();
    } catch (err) {
      SIPIL.toast("error", "Gagal menghapus", err.message);
    }
  });
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.search = e.target.value.trim();
    state.page = 1;
    loadTable();
  }, 350);
});
document.getElementById("filterKategori").addEventListener("change", (e) => {
  state.kategori = e.target.value; state.page = 1; loadTable();
});
document.getElementById("filterStatus").addEventListener("change", (e) => {
  state.status = e.target.value; state.page = 1; loadTable();
});

document.getElementById("btnExport").addEventListener("click", exportToExcel);

async function exportToExcel() {
  const btn = document.getElementById("btnExport");
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="loader" style="border-color:rgba(29,95,209,0.35);border-top-color:#1D5FD1;"></span> Menyiapkan...';

  try {
    // Ambil SEMUA data yang cocok dengan filter/pencarian aktif (bukan cuma 1 halaman)
    const data = await SIPIL.call("getData", {
      page: 1, pageSize: 100000,
      search: state.search, kategori: state.kategori, status: state.status,
    });
    const rows = data.rows || [];

    if (!rows.length) {
      SIPIL.toast("info", "Tidak ada data", "Tidak ada data yang cocok untuk diexport.");
      return;
    }

    const exportRows = rows.map(r => ({
      "Nomor LK": r.nomorLK,
      "Tanggal": r.tanggal,
      "Nama": r.nama,
      "Kategori": r.kategori,
      "Kebangsaan": r.kebangsaan,
      "NIK/Paspor": r.nikPaspor,
      "Jenis BAP": r.jenisBAP,
      "Perihal": r.perihal,
      "Petugas": r.petugas,
      "Status": r.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws["!cols"] = [
      { wch: 26 }, { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 14 },
      { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 20 }, { wch: 10 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data LK");

    const tanggalFile = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Rekap-LK-SIPIL-${tanggalFile}.xlsx`);

    SIPIL.toast("success", "Berhasil diexport", `${rows.length} data disimpan ke file Excel.`);
  } catch (err) {
    SIPIL.toast("error", "Gagal export", err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

loadTable();
