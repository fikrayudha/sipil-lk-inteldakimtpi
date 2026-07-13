SIPIL_SHELL.init("pengambilan");

document.getElementById("tanggal").value = new Date().toISOString().slice(0, 10);

const kebangsaanSelect = document.getElementById("kebangsaan");
const kebangsaanLainnyaWrap = document.getElementById("kebangsaanLainnyaWrap");
const kebangsaanLainnyaInput = document.getElementById("kebangsaanLainnya");

function syncKebangsaanLainnya() {
  const isLainnya = kebangsaanSelect.value === "Lainnya";
  kebangsaanLainnyaWrap.style.display = isLainnya ? "" : "none";
  kebangsaanLainnyaInput.required = isLainnya;
  if (!isLainnya) kebangsaanLainnyaInput.value = "";
}
kebangsaanSelect.addEventListener("change", syncKebangsaanLainnya);
syncKebangsaanLainnya();

document.getElementById("btnReset").addEventListener("click", () => {
  document.getElementById("formLK").reset();
  document.getElementById("tanggal").value = new Date().toISOString().slice(0, 10);
  document.getElementById("resultTicket").classList.remove("show");
  syncKebangsaanLainnya();
});

document.getElementById("formLK").addEventListener("submit", async function (e) {
  e.preventDefault();

  const kebangsaanValue = kebangsaanSelect.value === "Lainnya"
    ? kebangsaanLainnyaInput.value.trim()
    : kebangsaanSelect.value;

  const payload = {
    tanggal: document.getElementById("tanggal").value,
    kategori: document.getElementById("kategori").value,
    nama: document.getElementById("nama").value.trim(),
    jenisKelamin: document.getElementById("jenisKelamin").value,
    kebangsaan: kebangsaanValue,
    nikPaspor: document.getElementById("nikPaspor").value.trim(),
    jenisBAP: document.getElementById("jenisBAP").value,
    perihal: document.getElementById("perihal").value.trim(),
    petugas: document.getElementById("petugas").value.trim(),
  };

  const btn = document.getElementById("btnGenerate");
  const btnText = document.getElementById("btnGenerateText");
  btn.disabled = true;
  btnText.innerHTML = '<span class="loader"></span> Membuat nomor...';

  try {
    const data = await SIPIL.call("generateNumber", payload);
    document.getElementById("resultNumber").textContent = data.nomorLK;
    document.getElementById("resultTicket").classList.add("show");

    SIPIL.toast("success", "Nomor LK dibuat", data.nomorLK);

    document.getElementById("formLK").reset();
    document.getElementById("tanggal").value = new Date().toISOString().slice(0, 10);
    syncKebangsaanLainnya();
  } catch (err) {
    SIPIL.toast("error", "Gagal membuat nomor", err.message);
  } finally {
    btn.disabled = false;
    btnText.textContent = "Generate Nomor";
  }
});
