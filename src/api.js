const TOKEN_KEY = "sm_admin_token";
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
};

async function req(url, { method = "GET", json, body, headers = {}, auth } = {}) {
  const h = { ...headers };
  if (json !== undefined) {
    h["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (auth) {
    const t = getToken();
    if (t) h.Authorization = "Bearer " + t;
  }
  const res = await fetch(url, { method, headers: h, body });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  public: () => req("/api/public"),
  login: (password) => req("/api/login", { method: "POST", json: { password } }),
  submitReview: (r) => req("/api/reviews", { method: "POST", json: r }),
  admin: {
    data: () => req("/api/admin/data", { auth: true }),
    saveProduct: (p) =>
      p.id
        ? req("/api/admin/products/" + p.id, { method: "PUT", json: p, auth: true })
        : req("/api/admin/products", { method: "POST", json: p, auth: true }),
    deleteProduct: (id) => req("/api/admin/products/" + id, { method: "DELETE", auth: true }),
    setReview: (id, approved) => req("/api/admin/reviews/" + id, { method: "PATCH", json: { approved }, auth: true }),
    deleteReview: (id) => req("/api/admin/reviews/" + id, { method: "DELETE", auth: true }),
    saveSettings: (s) => req("/api/admin/settings", { method: "PUT", json: s, auth: true }),
    upload: (blob) => req("/api/admin/upload", { method: "POST", body: blob, headers: { "Content-Type": blob.type }, auth: true }),
  },
};

/* Resize a photo in the browser so uploads are small and pages load fast */
export async function resizeImage(file, max = 1200) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", 0.82)
  );
}
