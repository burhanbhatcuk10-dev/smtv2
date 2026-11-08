import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../home.css";
import { api } from "../api.js";
import {
  CONDITIONS, CATEGORIES, USES, CPU_ORDER, RAM_ORDER, STOR_ORDER, STORT_ORDER, SCREEN_ORDER,
  money, discount, waLink, avg, dateFmt, derive, useLabel,
} from "../utils.js";
import {
  IconPhone, IconPin, IconClock, IconMail, IconShield, IconCheck, IconTag, IconTools, IconX, IconSearch,
  IconWhatsApp, IconLock, IconMenu, IconFilter, IconChevron, IconArrow, IconEye, IconSpark,
  Stars, StarInput, SocialIcon, UseIcon, socialLabel,
} from "../components/Icons.jsx";
import ProductArt, { HeroArt, paletteFor } from "../components/ProductArt.jsx";
import { Reveal, CountUp } from "../components/Reveal.jsx";

/* ---------- filters ---------- */
const EMPTY_F = { q: "", cat: "All", cond: "All", stock: false, maxPrice: 0, brands: [], cpus: [], rams: [], stor: [], storT: [], screens: [], uses: [] };

const FACETS = [
  { key: "uses", title: "Best for", get: (p) => p.uses, order: USES.map((u) => u.key), label: useLabel, open: true },
  { key: "brands", title: "Brand", get: (p) => (p.brand ? [p.brand] : []), open: true },
  { key: "cpus", title: "Processor", get: (p) => (p.cpu ? [p.cpu] : []), order: CPU_ORDER, open: true },
  { key: "rams", title: "RAM", get: (p) => (p.ramB ? [p.ramB] : []), order: RAM_ORDER, open: true },
  { key: "stor", title: "Storage size", get: (p) => (p.storB ? [p.storB] : []), order: STOR_ORDER },
  { key: "storT", title: "Storage type", get: (p) => (p.storT ? [p.storT] : []), order: STORT_ORDER },
  { key: "screens", title: "Screen size", get: (p) => (p.scrB ? [p.scrB] : []), order: SCREEN_ORDER },
];

function passes(p, f, skip) {
  if (f.cat !== "All" && p.category !== f.cat) return false;
  if (f.cond === "new" && p.condition !== "new") return false;
  if (f.cond === "refurb" && p.condition === "new") return false;
  if (f.stock && !p.inStock) return false;
  if (f.maxPrice && p.price > f.maxPrice) return false;
  const t = f.q.trim().toLowerCase();
  if (t && !`${p.name} ${p.brand} ${p.processor} ${p.ram} ${p.storage} ${p.display} ${p.extras}`.toLowerCase().includes(t)) return false;
  for (const fc of FACETS) {
    if (fc.key === skip) continue;
    const sel = f[fc.key];
    if (sel.length && !fc.get(p).some((v) => sel.includes(v))) return false;
  }
  return true;
}

const SORTERS = {
  new: (a, b) => b.createdAt - a.createdAt,
  low: (a, b) => (a.price || 1e12) - (b.price || 1e12),
  high: (a, b) => b.price - a.price,
  disc: (a, b) => discount(b) - discount(a),
  ram: (a, b) => b.ramGB - a.ramGB,
};

const scrollToShop = () => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ---------- small pieces ---------- */
function CondBadge({ c }) {
  const info = CONDITIONS[c] || CONDITIONS.A;
  return <span className={"badge cond-" + info.tone}>{info.label}</span>;
}

function NavBar({ settings, hasUse }) {
  const [scrolled, setScrolled] = useState(false);
  const [prog, setProg] = useState(0);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setScrolled(el.scrollTop > 8);
        setProg(max > 0 ? el.scrollTop / max : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  const close = () => setMenu(false);
  return (
    <header className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="progress" style={{ transform: `scaleX(${prog})` }} />
      <div className="wrap nav-in">
        <a href="#top" className="brand" onClick={close}>
          <img src="/logo.svg" alt="" width="54" height="34" />
          <span>{settings.shopName}<small>{settings.tagline}</small></span>
        </a>
        <nav className={menu ? "open" : ""} aria-label="Main">
          <a href="#shop" onClick={close}>Shop</a>
          {hasUse && <a href="#use" onClick={close}>Shop by use</a>}
          <a href="#grades" onClick={close}>Condition guide</a>
          <a href="#reviews" onClick={close}>Reviews</a>
          <a href="#contact" onClick={close}>Contact</a>
          <Link to="/admin" className="nav-admin-m" onClick={close}><IconLock width={16} height={16} /> Admin login</Link>
        </nav>
        <div className="nav-right">
          <Link to="/admin" className="admin-link" title="Admin login"><IconLock width={15} height={15} /> <span>Admin</span></Link>
          {settings.phone && (
            <a className="btn primary sm call-btn" href={`tel:${settings.phone}`}>
              <IconPhone width={16} height={16} /> <span className="hide-sm">{settings.phone}</span><span className="show-sm">Call</span>
            </a>
          )}
          <button className="burger" onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
            {menu ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}

function ProductCard({ p, rating, count, index, onOpen }) {
  const d = discount(p);
  return (
    <article
      className={"card" + (p.inStock ? "" : " sold")}
      style={{ "--i": Math.min(index, 12) }}
      onClick={() => onOpen(p)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(p)}
    >
      <div className="card-img">
        {p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" /> : <ProductArt p={p} />}
        <CondBadge c={p.condition} />
        {!p.inStock && <span className="oos">Sold out</span>}
        {d > 0 && p.inStock && <span className="off">{d}% off</span>}
        <span className="peek"><IconEye width={15} height={15} /> View details</span>
      </div>
      <div className="card-body">
        <div className="card-cat">{p.brand ? p.brand + " · " : ""}{p.category}</div>
        <h3>{p.name}</h3>
        <div className="chips">
          {[p.processor, p.ram, p.storage].filter(Boolean).map((s) => (<span key={s}>{s}</span>))}
        </div>
        {p.uses.length > 0 && <div className="uses-line">Best for: <b>{p.uses.slice(0, 3).map(useLabel).join(", ")}</b></div>}
        <div className="card-foot">
          <div>
            <div className="price">{money(p.price)}</div>
            {p.originalPrice > p.price && <div className="mrp">{money(p.originalPrice)}</div>}
          </div>
          {count > 0 && <div className="mini-rate"><Stars value={rating} size={14} /> <small>({count})</small></div>}
        </div>
      </div>
    </article>
  );
}

function SpecSheet({ p }) {
  const rows = [["Processor", p.processor], ["RAM", p.ram], ["Storage", p.storage], ["Display", p.display]].filter((r) => r[1]);
  return (
    <div className="specsheet">
      {rows.length === 0 && <div className="ss-t"><small>Specs</small><b>Ask us for details</b></div>}
      {rows.map(([k, v]) => (<div className="ss-t" key={k}><small>{k}</small><b>{v}</b></div>))}
    </div>
  );
}

function ProductModal({ p, settings, reviews, onClose }) {
  const [img, setImg] = useState(0);
  const info = CONDITIONS[p.condition] || CONDITIONS.A;
  const d = discount(p);
  const hasImgs = p.images.length > 0;
  const views = hasImgs ? p.images : ["art", "specs"];
  const cur = views[Math.min(img, views.length - 1)];
  const specs = [
    ["Processor", p.processor], ["Memory (RAM)", p.ram], ["Storage", p.storage],
    ["Display", p.display], ["Other", p.extras], ["Warranty", p.warranty],
  ].filter((r) => r[1]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const msg = `Hello ${settings.shopName}, I'm interested in "${p.name}" (${info.label}) listed at ${money(p.price)}. Is it available?`;

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close"><IconX /></button>
        <div className="modal-grid">
          <div className="gallery">
            <div className="gallery-main">
              {hasImgs ? <img src={cur} alt={p.name} decoding="async" /> : cur === "art" ? <ProductArt p={p} float /> : <SpecSheet p={p} />}
            </div>
            {views.length > 1 && (
              <div className="thumbs">
                {hasImgs
                  ? views.map((u, i) => (
                      <button key={u} className={i === img ? "on" : ""} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`}>
                        <img src={u} alt="" loading="lazy" />
                      </button>
                    ))
                  : views.map((v, i) => (
                      <button key={v} className={"tt" + (i === img ? " on" : "")} onClick={() => setImg(i)}>{v === "art" ? "Preview" : "Specs"}</button>
                    ))}
              </div>
            )}
          </div>
          <div className="detail">
            <div className="detail-top"><CondBadge c={p.condition} />{!p.inStock && <span className="badge sold-b">Sold out</span>}</div>
            <h2>{p.name}</h2>
            {reviews.length > 0 && (
              <div className="mini-rate"><Stars value={avg(reviews)} /> <small>{avg(reviews).toFixed(1)} ({reviews.length} review{reviews.length > 1 ? "s" : ""})</small></div>
            )}
            <div className="price-row">
              <span className="price big">{money(p.price)}</span>
              {p.originalPrice > p.price && <span className="mrp">{money(p.originalPrice)}</span>}
              {d > 0 && <span className="save">Save {d}%</span>}
            </div>

            <div className={"cond-box cond-" + info.tone}>
              <strong>Condition: {info.label}</strong>
              <p>{info.desc}</p>
              {p.conditionNotes && <p className="notes"><b>Inspector's note:</b> {p.conditionNotes}</p>}
            </div>

            {p.uses.length > 0 && (
              <div className="use-tags"><span>Best for</span>{p.uses.map((u) => (<i key={u}>{useLabel(u)}</i>))}</div>
            )}
            {p.description && <p className="desc">{p.description}</p>}

            {specs.length > 0 && (
              <table className="specs"><tbody>
                {specs.map(([k, v]) => (<tr key={k}><th>{k}</th><td>{v}</td></tr>))}
              </tbody></table>
            )}

            <div className="cta">
              <a className="btn wa" href={waLink(settings, msg)} target="_blank" rel="noopener noreferrer"><IconWhatsApp /> Enquire on WhatsApp</a>
              {settings.phone && <a className="btn ghost" href={`tel:${settings.phone}`}><IconPhone /> Call {settings.phone}</a>}
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="modal-reviews">
            <h3>Customer reviews for this product</h3>
            {reviews.slice(0, 4).map((r) => (
              <div className="rev" key={r.id}>
                <div className="rev-h"><b>{r.name}</b><Stars value={r.rating} size={14} /></div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewForm({ products }) {
  const [f, setF] = useState({ name: "", rating: 0, comment: "", productId: "" });
  const [state, setState] = useState({ busy: false, done: false, err: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, done: false, err: "" });
    try {
      await api.submitReview(f);
      setState({ busy: false, done: true, err: "" });
      setF({ name: "", rating: 0, comment: "", productId: "" });
    } catch (er) {
      setState({ busy: false, done: false, err: er.message });
    }
  }

  if (state.done)
    return (
      <div className="form-card thanks">
        <IconCheck width={40} height={40} />
        <h3>Thank you for your review!</h3>
        <p>It will appear on the website once it has been approved.</p>
        <button className="btn ghost" onClick={() => setState({ busy: false, done: false, err: "" })}>Write another</button>
      </div>
    );

  return (
    <form className="form-card" onSubmit={submit}>
      <h3>Share your experience</h3>
      <label>Your name<input value={f.name} onChange={set("name")} maxLength={60} required placeholder="e.g. Aamir Khan" /></label>
      <label>Rating<StarInput value={f.rating} onChange={(n) => setF({ ...f, rating: n })} /></label>
      <label>Product you bought (optional)
        <select value={f.productId} onChange={set("productId")}>
          <option value="">Not listed / general review</option>
          {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
      </label>
      <label>Your review<textarea value={f.comment} onChange={set("comment")} rows={4} maxLength={1000} required placeholder="How was the laptop, the condition and our service?" /></label>
      {state.err && <div className="err">{state.err}</div>}
      <button className="btn primary" disabled={state.busy}>{state.busy ? "Sending..." : "Submit review"}</button>
    </form>
  );
}

function FacetGroup({ fc, selected, onToggle }) {
  return (
    <details className="fgroup" open={fc.open}>
      <summary>{fc.title}<IconChevron width={16} height={16} /></summary>
      <div className="fopts">
        {fc.opts.map((o) => {
          const on = selected.includes(o.value);
          return (
            <label key={o.value} className={"opt" + (o.count === 0 && !on ? " dim" : "")}>
              <input type="checkbox" checked={on} onChange={() => onToggle(fc.key, o.value)} />
              <span className="ol">{fc.label ? fc.label(o.value) : o.value}</span>
              <em>{o.count}</em>
            </label>
          );
        })}
      </div>
    </details>
  );
}

const STEPS = [
  { t: "Inspect", d: "Every device is checked inside and out for faults, wear and missing parts.", icon: <IconSearch width={22} height={22} /> },
  { t: "Clean & upgrade", d: "Deep cleaned, with storage or memory upgrades where they make sense.", icon: <IconSpark width={22} height={22} /> },
  { t: "Test", d: "Battery, screen, keyboard, ports and performance are tested before listing.", icon: <IconTools width={22} height={22} /> },
  { t: "Grade & warranty", d: "Graded honestly, photographed and sold with a clearly stated warranty.", icon: <IconShield width={22} height={22} /> },
];

/* ---------- page ---------- */
export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [f, setF] = useState(EMPTY_F);
  const [sort, setSort] = useState("new");
  const [heroQ, setHeroQ] = useState("");

  useEffect(() => {
    api.public().then(setData).catch(() => setError("Could not load the shop. Please refresh."));
  }, []);

  const settings = data?.settings;
  useEffect(() => {
    if (settings) document.title = `${settings.shopName} | New & Refurbished Laptops and Computers in Srinagar`;
  }, [settings]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const items = useMemo(() => (data?.products || []).map((p) => ({ ...p, ...derive(p) })), [data]);
  const reviews = useMemo(() => data?.reviews || [], [data]);

  const byProduct = useMemo(() => {
    const m = {};
    reviews.forEach((r) => r.productId && (m[r.productId] ||= []).push(r));
    return m;
  }, [reviews]);

  const bounds = useMemo(() => {
    const ps = items.map((p) => p.price).filter((x) => x > 0);
    if (!ps.length) return null;
    const lo = Math.floor(Math.min(...ps) / 1000) * 1000;
    let hi = Math.ceil(Math.max(...ps) / 1000) * 1000;
    if (hi <= lo) hi = lo + 1000;
    return { lo, hi };
  }, [items]);

  const options = useMemo(
    () =>
      FACETS.map((fc) => {
        const totals = new Map();
        items.forEach((p) => fc.get(p).forEach((v) => totals.set(v, (totals.get(v) || 0) + 1)));
        const all = [...totals.keys()];
        const keys = fc.order
          ? fc.order.filter((k) => totals.has(k)).concat(all.filter((k) => !fc.order.includes(k)))
          : all.sort((a, b) => a.localeCompare(b));
        const counts = {};
        items.forEach((p) => {
          if (passes(p, f, fc.key)) fc.get(p).forEach((v) => (counts[v] = (counts[v] || 0) + 1));
        });
        return { ...fc, opts: keys.map((k) => ({ value: k, count: counts[k] || 0 })) };
      }),
    [items, f]
  );

  const list = useMemo(() => {
    const out = items.filter((p) => passes(p, f));
    out.sort((a, b) => Number(b.inStock) - Number(a.inStock) || SORTERS[sort](a, b));
    return out;
  }, [items, f, sort]);

  const cats = useMemo(() => CATEGORIES.filter((c) => items.some((p) => p.category === c)), [items]);
  const brands = useMemo(() => [...new Set(items.map((p) => p.brand).filter(Boolean))], [items]);
  const featured = useMemo(() => items.filter((p) => p.featured && p.inStock).slice(0, 4), [items]);
  const useTiles = useMemo(
    () => USES.map((u) => ({ ...u, count: items.filter((p) => p.inStock && p.uses.includes(u.key)).length })).filter((u) => u.count > 0),
    [items]
  );

  const setKey = (k, v) => setF((cur) => ({ ...cur, [k]: v }));
  const toggle = (key, v) =>
    setF((cur) => ({ ...cur, [key]: cur[key].includes(v) ? cur[key].filter((x) => x !== v) : [...cur[key], v] }));
  const goFilter = (patch) => {
    setF({ ...EMPTY_F, ...patch });
    scrollToShop();
  };

  if (error) return <div className="page-loading">{error}</div>;
  if (!data) return <div className="page-loading"><img src="/logo.svg" alt="" width="120" height="75" className="pulse" /><p>Loading...</p></div>;

  const chips = [];
  if (f.q.trim()) chips.push({ label: `"${f.q.trim()}"`, rm: () => setKey("q", "") });
  if (f.cat !== "All") chips.push({ label: f.cat + "s", rm: () => setKey("cat", "All") });
  if (f.cond !== "All") chips.push({ label: f.cond === "new" ? "Brand new" : "Refurbished", rm: () => setKey("cond", "All") });
  if (f.stock) chips.push({ label: "In stock only", rm: () => setKey("stock", false) });
  if (f.maxPrice) chips.push({ label: "Up to " + money(f.maxPrice), rm: () => setKey("maxPrice", 0) });
  FACETS.forEach((fc) => f[fc.key].forEach((v) => chips.push({ label: fc.label ? fc.label(v) : v, rm: () => toggle(fc.key, v) })));

  const overall = avg(reviews);
  const inStockCount = items.filter((p) => p.inStock).length;
  const prices = items.filter((p) => p.inStock && p.price > 0).map((p) => p.price);
  const fromPrice = prices.length ? Math.min(...prices) : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  const brandRow = brands.length ? Array.from({ length: Math.max(1, Math.ceil(8 / brands.length)) }).flatMap(() => brands) : [];

  const faqs = [
    ["What do the condition grades mean?", "Brand New devices are sealed and unused. Refurbished devices are inspected, cleaned and tested, then graded A, B or C by their cosmetic condition. Every listing also has an inspector's note that tells you exactly what to expect."],
    ["Do the devices come with a warranty?", settings.warrantyNote || "Warranty details are shown on each listing."],
    ["How can I buy or reserve a device?", "Tap the WhatsApp enquiry button on any product, call us, or visit the store. Please confirm availability before you travel, as stock changes quickly."],
    ["Which laptop is right for me?", "Use the filters to narrow down by what you will use it for, then by processor, RAM and storage. If you are unsure, message us your budget and what you need it for and we will suggest options."],
  ];

  const panel = (
    <aside className={"fpanel" + (drawer ? " open" : "")} aria-label="Filters">
      <div className="fpanel-h">
        <b>Filters</b>
        {chips.length > 0 && <button className="linkbtn" onClick={() => setF(EMPTY_F)}>Clear all</button>}
        <button className="fclose" onClick={() => setDrawer(false)} aria-label="Close filters"><IconX /></button>
      </div>
      <div className="fpanel-body">
        <div className="fblock">
          <h4>Category</h4>
          <div className="pills">
            {["All", ...cats].map((c) => (<button key={c} className={f.cat === c ? "on" : ""} onClick={() => setKey("cat", c)}>{c === "All" ? "All" : c + "s"}</button>))}
          </div>
        </div>
        <div className="fblock">
          <h4>Condition</h4>
          <div className="pills">
            {[["All", "Any"], ["new", "Brand new"], ["refurb", "Refurbished"]].map(([k, l]) => (<button key={k} className={f.cond === k ? "on" : ""} onClick={() => setKey("cond", k)}>{l}</button>))}
          </div>
        </div>
        {bounds && (
          <div className="fblock">
            <h4>Max price <b>{f.maxPrice ? money(f.maxPrice) : "Any"}</b></h4>
            <input
              type="range" min={bounds.lo} max={bounds.hi} step="1000" value={f.maxPrice || bounds.hi}
              onChange={(e) => { const v = Number(e.target.value); setKey("maxPrice", v >= bounds.hi ? 0 : v); }}
              aria-label="Maximum price"
            />
            <div className="range-l"><span>{money(bounds.lo)}</span><span>{money(bounds.hi)}</span></div>
          </div>
        )}
        <div className="fblock">
          <label className="opt"><input type="checkbox" checked={f.stock} onChange={(e) => setKey("stock", e.target.checked)} /><span className="ol">In stock only</span></label>
        </div>
        {options.filter((fc) => fc.opts.length > 1 || f[fc.key].length > 0).map((fc) => (
          <FacetGroup key={fc.key} fc={fc} selected={f[fc.key]} onToggle={toggle} />
        ))}
      </div>
      <div className="fpanel-f">
        <button className="btn primary" style={{ width: "100%" }} onClick={() => setDrawer(false)}>Show {list.length} device{list.length === 1 ? "" : "s"}</button>
      </div>
    </aside>
  );

  return (
    <>
      <NavBar settings={settings} hasUse={useTiles.length > 0} />

      <main id="top">
        <section className="hero">
          <div className="blob b1" /><div className="blob b2" /><div className="hero-grid" />
          <div className="wrap hero-in">
            <div className="hero-copy">
              <span className="eyebrow rise" style={{ "--d": "0ms" }}>Srinagar's trusted laptop &amp; computer store</span>
              <h1 className="rise" style={{ "--d": "90ms" }}>{settings.heroTitle}</h1>
              <p className="rise" style={{ "--d": "180ms" }}>{settings.heroText}</p>
              <form className="hero-search rise" style={{ "--d": "270ms" }} onSubmit={(e) => { e.preventDefault(); goFilter({ q: heroQ }); }}>
                <IconSearch width={20} height={20} />
                <input type="search" value={heroQ} onChange={(e) => setHeroQ(e.target.value)} placeholder="Search Dell i5, 16 GB, SSD..." aria-label="Search devices" />
                <button className="btn gold sm">Search</button>
              </form>
              {useTiles.length > 0 && (
                <div className="hero-uses rise" style={{ "--d": "340ms" }}>
                  <span>Popular:</span>
                  {useTiles.slice(0, 4).map((u) => (<button key={u.key} onClick={() => goFilter({ uses: [u.key] })}>{u.label}</button>))}
                </div>
              )}
              <div className="hero-cta rise" style={{ "--d": "410ms" }}>
                <a className="btn gold" href="#shop">Browse devices <IconArrow width={18} height={18} /></a>
                <a className="btn outline" href={waLink(settings, `Hello ${settings.shopName}, I need help choosing a laptop.`)} target="_blank" rel="noopener noreferrer"><IconWhatsApp /> Chat on WhatsApp</a>
              </div>
              <div className="hero-stats rise" style={{ "--d": "480ms" }}>
                <div><b><CountUp to={inStockCount} suffix="+" /></b><span>Devices in stock</span></div>
                {fromPrice > 0 && <div><b><CountUp to={fromPrice} prefix={"₹"} /></b><span>Starting price</span></div>}
                {reviews.length > 0
                  ? <div><b><CountUp to={overall} decimals={1} /> {"★"}</b><span>{reviews.length} customer review{reviews.length > 1 ? "s" : ""}</span></div>
                  : <div><b><CountUp to={brands.length} /></b><span>Brands available</span></div>}
              </div>
            </div>
            <div className="hero-art"><HeroArt /></div>
          </div>
        </section>

        {brandRow.length > 0 && (
          <div className="marquee" aria-label="Brands we stock">
            <div className="marquee-track">
              {[...brandRow, ...brandRow].map((b, i) => (<button key={b + i} onClick={() => goFilter({ brands: [b] })} tabIndex={i < brandRow.length ? 0 : -1}>{b}</button>))}
            </div>
          </div>
        )}

        <section className="trust">
          <div className="wrap trust-in">
            <Reveal><IconTools /><b>Tested &amp; quality-checked</b><span>Every device inspected before sale</span></Reveal>
            <Reveal delay={80}><IconTag /><b>Honest grading</b><span>True condition shown on every listing</span></Reveal>
            <Reveal delay={160}><IconShield /><b>Warranty included</b><span>Clear warranty on each device</span></Reveal>
            <Reveal delay={240}><IconCheck /><b>New &amp; refurbished</b><span>Choose what fits your budget</span></Reveal>
          </div>
        </section>

        {useTiles.length > 0 && (
          <section id="use" className="section alt">
            <div className="wrap">
              <Reveal><h2 className="h2">Shop by what you need it for</h2><p className="sub">Not sure about specs? Start with how you will use it and we will show the right machines.</p></Reveal>
              <div className="use-grid">
                {useTiles.map((u, i) => (
                  <Reveal as="button" delay={i * 70} key={u.key} className="use-tile" style={{ "--c": paletteFor(u.key)[0] }} onClick={() => goFilter({ uses: [u.key] })}>
                    <span className="use-ic"><UseIcon name={u.icon} width={24} height={24} /></span>
                    <b>{u.label}</b>
                    <small>{u.blurb}</small>
                    <em>{u.count} device{u.count > 1 ? "s" : ""} <IconArrow width={14} height={14} /></em>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="section feat">
            <div className="wrap">
              <Reveal><h2 className="h2">Featured picks</h2><p className="sub">Hand-picked by our team for value and condition.</p></Reveal>
              <div className="grid">
                {featured.map((p, i) => (<ProductCard key={p.id} p={p} index={i} rating={avg(byProduct[p.id] || [])} count={(byProduct[p.id] || []).length} onOpen={setOpen} />))}
              </div>
            </div>
          </section>
        )}

        <section id="shop" className="section">
          <div className="wrap">
            <Reveal><h2 className="h2">Our Laptops &amp; Computers</h2><p className="sub">{settings.warrantyNote}</p></Reveal>
            <div className="shop-layout">
              {panel}
              {drawer && <div className="fback" onClick={() => setDrawer(false)} />}
              <div className="shop-main">
                <div className="toolbar">
                  <button className="btn ghost filter-btn" onClick={() => setDrawer(true)}>
                    <IconFilter width={18} height={18} /> Filters{chips.length > 0 && <span className="fbadge">{chips.length}</span>}
                  </button>
                  <div className="search">
                    <IconSearch width={18} height={18} />
                    <input type="search" value={f.q} onChange={(e) => setKey("q", e.target.value)} placeholder="Search brand, processor, RAM..." aria-label="Search" />
                  </div>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                    <option value="new">Newest first</option>
                    <option value="low">Price: low to high</option>
                    <option value="high">Price: high to low</option>
                    <option value="disc">Biggest discount</option>
                    <option value="ram">Most RAM</option>
                  </select>
                </div>
                {chips.length > 0 && (
                  <div className="chips-row">
                    {chips.map((c, i) => (<button key={c.label + i} className="achip" onClick={c.rm}>{c.label} <IconX width={13} height={13} /></button>))}
                    <button className="linkbtn" onClick={() => setF(EMPTY_F)}>Clear all</button>
                  </div>
                )}
                <div className="count" aria-live="polite">Showing <b>{list.length}</b> of {items.length} device{items.length === 1 ? "" : "s"}</div>
                {list.length === 0 ? (
                  <div className="empty">
                    No devices match these filters.{" "}
                    <button className="linkbtn" onClick={() => setF(EMPTY_F)}>Clear filters</button> or{" "}
                    <a href={waLink(settings, "Hello, I'm looking for a laptop.")} target="_blank" rel="noopener noreferrer">ask us on WhatsApp</a>.
                  </div>
                ) : (
                  <div className="grid">
                    {list.map((p, i) => (<ProductCard key={p.id} p={p} index={i} rating={avg(byProduct[p.id] || [])} count={(byProduct[p.id] || []).length} onOpen={setOpen} />))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="grades" className="section alt">
          <div className="wrap">
            <Reveal><h2 className="h2">Understand our condition grades</h2><p className="sub">No surprises. Every listing shows exactly what you are buying.</p></Reveal>
            <div className="grades">
              {Object.entries(CONDITIONS).map(([k, c], i) => (
                <Reveal key={k} delay={i * 80} className={"grade cond-" + c.tone}><h4>{c.label}</h4><p>{c.desc}</p></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <Reveal><h2 className="h2">How we prepare every refurbished device</h2><p className="sub">A simple process so you can buy with confidence.</p></Reveal>
            <div className="steps">
              {STEPS.map((s, i) => (
                <Reveal key={s.t} delay={i * 90} className="step">
                  <span className="step-n">{i + 1}</span>
                  <span className="step-ic">{s.icon}</span>
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="section alt">
          <div className="wrap">
            <Reveal><h2 className="h2">What our customers say</h2></Reveal>
            <div className="rev-layout">
              <div className="rev-list">
                {reviews.length > 0 && (
                  <Reveal className="rev-sum">
                    <div className="rev-score"><div className="rev-big">{overall.toFixed(1)}</div><Stars value={overall} size={18} /><small>{reviews.length} review{reviews.length > 1 ? "s" : ""}</small></div>
                    <div className="bars">
                      {dist.map((d) => (<div className="bar-r" key={d.n}><span>{d.n}</span><i style={{ "--w": `${(d.c / reviews.length) * 100}%` }} /><span>{d.c}</span></div>))}
                    </div>
                  </Reveal>
                )}
                {reviews.length === 0 && <div className="empty">No reviews yet. Be the first to share your experience!</div>}
                {reviews.slice(0, 12).map((r, i) => {
                  const prod = items.find((p) => p.id === r.productId);
                  return (
                    <Reveal className="rev" key={r.id} delay={Math.min(i, 4) * 60}>
                      <div className="rev-h"><b>{r.name}</b><Stars value={r.rating} size={15} /></div>
                      <p>{r.comment}</p>
                      <small>{prod ? prod.name + " · " : ""}{dateFmt(r.createdAt)}</small>
                    </Reveal>
                  );
                })}
              </div>
              <ReviewForm products={items} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <Reveal><h2 className="h2">Frequently asked questions</h2></Reveal>
            <div className="faq">
              {faqs.map(([q, a], i) => (
                <Reveal as="details" key={q} delay={i * 60}>
                  <summary>{q}<IconChevron width={18} height={18} /></summary>
                  <p>{a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section alt">
          <div className="wrap contact">
            <Reveal>
              <h2 className="h2">Visit our store</h2>
              <ul className="info">
                <li><IconPin /><span>{settings.address}</span></li>
                {settings.phone && <li><IconPhone /><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>}
                {settings.email && <li><IconMail /><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
                {settings.hours && <li><IconClock /><span>{settings.hours}</span></li>}
              </ul>
              <div className="hero-cta">
                {settings.mapUrl && <a className="btn primary" href={settings.mapUrl} target="_blank" rel="noopener noreferrer"><IconPin /> Open in Google Maps</a>}
                <a className="btn wa" href={waLink(settings, `Hello ${settings.shopName}`)} target="_blank" rel="noopener noreferrer"><IconWhatsApp /> WhatsApp us</a>
              </div>
            </Reveal>
            <Reveal className="why" delay={120}>
              <h3>Why customers choose us</h3>
              <ul>
                <li><IconCheck /> New and refurbished devices under one roof</li>
                <li><IconCheck /> Condition and price clearly shown, no hidden surprises</li>
                <li><IconCheck /> Tested hardware with warranty</li>
                <li><IconCheck /> Friendly advice to match the right device to your budget</li>
              </ul>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="brand light"><img src="/logo.svg" alt="" width="54" height="34" /><span>{settings.shopName}<small>{settings.tagline}</small></span></div>
              {settings.socials.length > 0 && (
                <div className="socials">
                  {settings.socials.map((s) => (
                    <a key={s.platform + s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={socialLabel(s.platform)} title={socialLabel(s.platform)}><SocialIcon platform={s.platform} /></a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h5>Explore</h5>
              <ul>
                <li><a href="#shop">Shop all devices</a></li>
                <li><a href="#grades">Condition guide</a></li>
                <li><a href="#reviews">Customer reviews</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5>Contact</h5>
              <ul>
                {settings.phone && <li><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>}
                {settings.email && <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
                {settings.hours && <li>{settings.hours}</li>}
              </ul>
            </div>
            <div>
              <h5>Address</h5>
              <ul><li>{settings.address}</li></ul>
            </div>
          </div>
          <div className="foot-bottom">
            <small>&copy; {new Date().getFullYear()} {settings.shopName}. All rights reserved.</small>
            <Link to="/admin" className="admin-foot"><IconLock width={14} height={14} /> Admin login</Link>
          </div>
        </div>
      </footer>

      <a className="float-wa" href={waLink(settings, `Hello ${settings.shopName}`)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><IconWhatsApp width={28} height={28} /></a>

      {open && <ProductModal p={open} settings={settings} reviews={byProduct[open.id] || []} onClose={() => setOpen(null)} />}
    </>
  );
}
