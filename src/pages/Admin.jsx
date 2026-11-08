import { useEffect, useRef, useState } from "react";
import { api, getToken, setToken, resizeImage } from "../api.js";
import { CONDITIONS, CATEGORIES, USES, money, dateFmt } from "../utils.js";
import { IconPlus, IconX, IconLaptop, Stars, SocialIcon, SOCIAL_PLATFORMS } from "../components/Icons.jsx";

const EMPTY = {
  name: "", brand: "", category: "Laptop", condition: "A", price: "", originalPrice: "",
  processor: "", ram: "", storage: "", display: "", extras: "", description: "",
  conditionNotes: "", warranty: "", inStock: true, featured: false, uses: [], images: [],
};

function Login({ onDone }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { token } = await api.login(pw);
      setToken(token);
      onDone();
    } catch (er) {
      setErr(er.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={go}>
        <img src="/logo.svg" alt="SM Technologies" width="120" height="75" />
        <h2>Admin Login</h2>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Admin password" autoFocus required />
        {err && <div className="err">{err}</div>}
        <button className="btn primary" disabled={busy}>{busy ? "Checking..." : "Log in"}</button>
        <a href="/" className="back">&larr; Back to website</a>
      </form>
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const toggleUse = (k) =>
    setF((cur) => {
      const uses = Array.isArray(cur.uses) ? cur.uses : [];
      return { ...cur, uses: uses.includes(k) ? uses.filter((x) => x !== k) : [...uses, k] };
    });

  async function addImages(files) {
    setUp(true);
    setErr("");
    try {
      const urls = [];
      for (const file of [...files].slice(0, 6 - f.images.length)) {
        const blob = await resizeImage(file);
        const { url } = await api.admin.upload(blob);
        urls.push(url);
      }
      setF((cur) => ({ ...cur, images: [...cur.images, ...urls].slice(0, 6) }));
    } catch (e) {
      setErr(e.message || "Image upload failed");
    } finally {
      setUp(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await onSave(f);
    } catch (er) {
      setErr(er.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-back" onClick={onCancel}>
      <form className="modal admin-form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-x" onClick={onCancel} aria-label="Close"><IconX /></button>
        <h2>{f.id ? "Edit product" : "Add product"}</h2>

        <div className="fgrid">
          <label className="span2">Product name *<input value={f.name} onChange={set("name")} required maxLength={140} placeholder="e.g. Dell Latitude 5490" /></label>
          <label>Brand<input value={f.brand} onChange={set("brand")} placeholder="Dell, HP, Lenovo..." /></label>
          <label>Category<select value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => (<option key={c}>{c}</option>))}</select></label>
          <label>Condition<select value={f.condition} onChange={set("condition")}>{Object.entries(CONDITIONS).map(([k, c]) => (<option key={k} value={k}>{c.label}</option>))}</select></label>
          <label>Selling price (INR) *<input type="number" min="0" value={f.price} onChange={set("price")} required /></label>
          <label>Original / MRP price (optional)<input type="number" min="0" value={f.originalPrice} onChange={set("originalPrice")} /></label>
          <label>Warranty<input value={f.warranty} onChange={set("warranty")} placeholder="e.g. 6 months" /></label>
          <label>Processor<input list="dl-cpu" value={f.processor} onChange={set("processor")} placeholder="Intel Core i5 8th Gen" /></label>
          <label>RAM<input list="dl-ram" value={f.ram} onChange={set("ram")} placeholder="8 GB" /></label>
          <label>Storage<input list="dl-storage" value={f.storage} onChange={set("storage")} placeholder="256 GB SSD" /></label>
          <label>Display<input list="dl-display" value={f.display} onChange={set("display")} placeholder={'14" Full HD'} /></label>
          <datalist id="dl-cpu">
            {["Intel Core i3 ", "Intel Core i5 ", "Intel Core i7 ", "Intel Core i9 ", "AMD Ryzen 3 ", "AMD Ryzen 5 ", "AMD Ryzen 7 ", "Intel Celeron ", "Apple M1 "].map((v) => (<option key={v} value={v} />))}
          </datalist>
          <datalist id="dl-ram">{["4 GB", "8 GB", "12 GB", "16 GB", "32 GB"].map((v) => (<option key={v} value={v} />))}</datalist>
          <datalist id="dl-storage">{["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "500 GB HDD", "1 TB HDD", "256 GB SSD + 1 TB HDD"].map((v) => (<option key={v} value={v} />))}</datalist>
          <datalist id="dl-display">{['13.3" Full HD', '14" Full HD', '15.6" HD', '15.6" Full HD', '17.3" Full HD'].map((v) => (<option key={v} value={v} />))}</datalist>
          <label className="span2">Other features<input value={f.extras} onChange={set("extras")} placeholder="Backlit keyboard, Windows 11, ..." /></label>
          <label className="span2">Condition notes (shown to customers)<textarea rows={2} value={f.conditionNotes} onChange={set("conditionNotes")} placeholder="Scratches, battery backup, dents, anything the buyer should know" /></label>
          <label className="span2">Description<textarea rows={3} value={f.description} onChange={set("description")} /></label>
        </div>

        <div className="imgs">
          <b>Best suited for (customers can filter by this)</b>
          <div className="use-pick">
            {USES.map((u) => (
              <label key={u.key} className={(f.uses || []).includes(u.key) ? "on" : ""}>
                <input type="checkbox" checked={(f.uses || []).includes(u.key)} onChange={() => toggleUse(u.key)} /> {u.label}
              </label>
            ))}
          </div>
          <small className="hint">Tip: type RAM, storage, processor and screen size in the usual way (for example "8 GB", "256 GB SSD", "Intel Core i5", 14&quot;). The website filters are built from them automatically.</small>
        </div>

        <div className="checks">
          <label><input type="checkbox" checked={f.inStock} onChange={set("inStock")} /> In stock</label>
          <label><input type="checkbox" checked={f.featured} onChange={set("featured")} /> Featured</label>
        </div>

        <div className="imgs">
          <b>Photos (up to 6)</b>
          <div className="img-row">
            {f.images.map((u, i) => (
              <div className="img-tile" key={u}>
                <img src={u} alt="" />
                <button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} aria-label="Remove photo"><IconX width={14} height={14} /></button>
              </div>
            ))}
            {f.images.length < 6 && (
              <button type="button" className="img-add" onClick={() => fileRef.current.click()} disabled={up}>
                {up ? "Uploading..." : (<><IconPlus /> Add</>)}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addImages(e.target.files)} />
        </div>

        {err && <div className="err">{err}</div>}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={busy || up}>{busy ? "Saving..." : "Save product"}</button>
        </div>
      </form>
    </div>
  );
}

function Products({ data, refresh, toast }) {
  const [editing, setEditing] = useState(null);

  async function save(p) {
    await api.admin.saveProduct(p);
    setEditing(null);
    toast("Product saved");
    refresh();
  }
  async function del(p) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await api.admin.deleteProduct(p.id);
    toast("Product deleted");
    refresh();
  }
  async function toggleStock(p) {
    await api.admin.saveProduct({ ...p, inStock: !p.inStock });
    refresh();
  }

  return (
    <>
      <div className="bar">
        <h2>Products ({data.products.length})</h2>
        <button className="btn primary" onClick={() => setEditing({})}><IconPlus /> Add product</button>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th></th><th>Product</th><th>Condition</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td className="t-img">{p.images[0] ? <img src={p.images[0]} alt="" /> : <IconLaptop />}</td>
                <td><b>{p.name}</b><small>{p.category}{p.brand ? " · " + p.brand : ""}</small></td>
                <td>{CONDITIONS[p.condition]?.short}</td>
                <td>{money(p.price)}</td>
                <td><button className={"tog " + (p.inStock ? "in" : "out")} onClick={() => toggleStock(p)}>{p.inStock ? "In stock" : "Sold out"}</button></td>
                <td className="acts"><button onClick={() => setEditing(p)}>Edit</button><button className="danger" onClick={() => del(p)}>Delete</button></td>
              </tr>
            ))}
            {data.products.length === 0 && <tr><td colSpan="6" className="empty-td">No products yet. Click "Add product".</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </>
  );
}

function Reviews({ data, refresh, toast }) {
  const pending = data.reviews.filter((r) => !r.approved);
  const approved = data.reviews.filter((r) => r.approved);
  const name = (id) => data.products.find((p) => p.id === id)?.name;

  async function approve(r, v) {
    await api.admin.setReview(r.id, v);
    toast(v ? "Review published" : "Review hidden");
    refresh();
  }
  async function del(r) {
    if (!confirm("Delete this review?")) return;
    await api.admin.deleteReview(r.id);
    refresh();
  }
  const Item = ({ r }) => (
    <div className="rev admin-rev">
      <div className="rev-h"><b>{r.name}</b><Stars value={r.rating} size={15} /></div>
      <p>{r.comment}</p>
      <small>{name(r.productId) ? name(r.productId) + " · " : ""}{dateFmt(r.createdAt)}</small>
      <div className="acts">
        {r.approved ? <button onClick={() => approve(r, false)}>Hide</button> : <button className="ok" onClick={() => approve(r, true)}>Approve</button>}
        <button className="danger" onClick={() => del(r)}>Delete</button>
      </div>
    </div>
  );
  return (
    <>
      <div className="bar"><h2>Waiting for approval ({pending.length})</h2></div>
      {pending.length === 0 ? <div className="empty">No new reviews waiting.</div> : pending.map((r) => <Item key={r.id} r={r} />)}
      <div className="bar"><h2>Published ({approved.length})</h2></div>
      {approved.length === 0 ? <div className="empty">No published reviews yet.</div> : approved.map((r) => <Item key={r.id} r={r} />)}
    </>
  );
}

function Settings({ data, refresh, toast }) {
  const [s, setS] = useState({ ...data.settings, socials: [...data.settings.socials] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setSocial = (i, k, v) => setS({ ...s, socials: s.socials.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.admin.saveSettings(s);
      toast("Settings saved");
      refresh();
    } catch (er) {
      setErr(er.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="settings">
      <div className="bar"><h2>Shop details</h2></div>
      <div className="fgrid">
        <label>Shop name<input value={s.shopName} onChange={set("shopName")} /></label>
        <label>Tagline<input value={s.tagline} onChange={set("tagline")} /></label>
        <label className="span2">Homepage headline<input value={s.heroTitle} onChange={set("heroTitle")} /></label>
        <label className="span2">Homepage text<textarea rows={2} value={s.heroText} onChange={set("heroText")} /></label>
        <label>Phone number<input value={s.phone} onChange={set("phone")} /></label>
        <label>WhatsApp number (with country code)<input value={s.whatsapp} onChange={set("whatsapp")} placeholder="919419888899" /></label>
        <label>Email<input type="email" value={s.email} onChange={set("email")} /></label>
        <label>Opening hours<input value={s.hours} onChange={set("hours")} /></label>
        <label className="span2">Address<textarea rows={2} value={s.address} onChange={set("address")} /></label>
        <label className="span2">Google Maps link<input value={s.mapUrl} onChange={set("mapUrl")} /></label>
        <label className="span2">Warranty note (shown above products)<input value={s.warrantyNote} onChange={set("warrantyNote")} /></label>
      </div>

      <div className="bar"><h2>Social media links</h2>
        <button type="button" className="btn ghost sm" onClick={() => setS({ ...s, socials: [...s.socials, { platform: "facebook", url: "" }] })}><IconPlus /> Add social</button>
      </div>
      {s.socials.length === 0 && <div className="empty">No social links yet. Click "Add social" to show icons in the website footer.</div>}
      {s.socials.map((x, i) => (
        <div className="social-row" key={i}>
          <span className="s-ic"><SocialIcon platform={x.platform} /></span>
          <select value={x.platform} onChange={(e) => setSocial(i, "platform", e.target.value)}>
            {SOCIAL_PLATFORMS.map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
          </select>
          <input value={x.url} onChange={(e) => setSocial(i, "url", e.target.value)} placeholder="https://..." />
          <button type="button" className="danger icon" onClick={() => setS({ ...s, socials: s.socials.filter((_, j) => j !== i) })} aria-label="Remove"><IconX width={16} height={16} /></button>
        </div>
      ))}
      {err && <div className="err">{err}</div>}
      <div className="form-actions"><button className="btn primary" disabled={busy}>{busy ? "Saving..." : "Save settings"}</button></div>
    </form>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(!!getToken());
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("products");
  const [msg, setMsg] = useState("");

  const toast = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2200);
  };
  const logout = () => {
    setToken(null);
    setAuthed(false);
    setData(null);
  };
  const refresh = () =>
    api.admin.data().then(setData).catch((e) => {
      if (e.status === 401) logout();
      else toast(e.message);
    });

  useEffect(() => {
    document.title = "Admin | SM Technologies";
    if (authed) refresh();
  }, [authed]);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;
  if (!data) return <div className="page-loading">Loading admin...</div>;

  const pending = data.reviews.filter((r) => !r.approved).length;

  return (
    <div className="admin">
      <header className="admin-nav">
        <div className="wrap admin-nav-in">
          <a href="/" className="brand light"><img src="/logo.svg" alt="" width="46" height="29" /><span>Admin Panel</span></a>
          <div className="tabs">
            <button className={tab === "products" ? "on" : ""} onClick={() => setTab("products")}>Products</button>
            <button className={tab === "reviews" ? "on" : ""} onClick={() => setTab("reviews")}>Reviews{pending > 0 && <i>{pending}</i>}</button>
            <button className={tab === "settings" ? "on" : ""} onClick={() => setTab("settings")}>Settings &amp; Socials</button>
          </div>
          <div className="admin-right">
            <a href="/" target="_blank" rel="noopener noreferrer">View site</a>
            <button onClick={logout}>Log out</button>
          </div>
        </div>
      </header>
      <main className="wrap admin-main">
        {tab === "products" && <Products data={data} refresh={refresh} toast={toast} />}
        {tab === "reviews" && <Reviews data={data} refresh={refresh} toast={toast} />}
        {tab === "settings" && <Settings key={JSON.stringify(data.settings)} data={data} refresh={refresh} toast={toast} />}
      </main>
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
