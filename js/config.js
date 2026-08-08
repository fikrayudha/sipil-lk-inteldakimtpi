const API_URL = "https://script.google.com/macros/s/AKfycbwRvYD9lzl2rZWu4nqnDVUWT-Klzs9dE-t-I0VJRii5LBT-a2mWZO3dICLBjSzBPcgj/exec";

const SIPIL = {
  session() {
    try {
      return JSON.parse(localStorage.getItem("sipil_session") || "null");
    } catch (e) {
      return null;
    }
  },
  requireLogin() {
    const s = this.session();
    if (!s) {
      window.location.href = "login.html";
      return null;
    }
    return s;
  },
  logout() {
    localStorage.removeItem("sipil_session");
    window.location.href = "login.html";
  },
  async call(action, payload = {}) {
    const s = this.session();
    const body = JSON.stringify({ action, token: s ? s.token : null, ...payload });
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    });
    if (!res.ok) throw new Error("Gagal menghubungi server (" + res.status + ")");
    const json = await res.json();
    if (!json.ok) throw new Error(json.message || "Terjadi kesalahan");
    return json.data;
  },
  toast(icon, title, text) {
    Swal.fire({
      icon, title, text,
      confirmButtonColor: "#1D5FD1",
      background: "#fff",
    });
  },
  initials(name) {
    if (!name) return "?";
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  },
};
