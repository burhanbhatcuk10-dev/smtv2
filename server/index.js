import express from "express";
import compression from "compression";
import pg from "pg";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "..", "dist");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SECRET = process.env.SESSION_SECRET || crypto.createHash("sha256").update("sm-" + ADMIN_PASSWORD).digest("hex");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add your Neon connection string as the DATABASE_URL environment variable.");
  process.exit(1);
}
if (!process.env.ADMIN_PASSWORD) {
  console.warn("WARNING: ADMIN_PASSWORD is not set. Using the default 'admin123'. Set it before going live!");
}

const httpErr = (status, message) => Object.assign(new Error(message), { status, expose: true });
const uid = () => crypto.randomBytes(6).toString("hex");

/* ---------------- database (Neon Postgres) ---------------- */
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});
pool.on("error", (e) => console.error("Postgres pool error:", e.message));

function seed() {
  const now = Date.now();
  return {
    settings: {
      shopName: "SM Technologies",
      tagline: "Come & Feel the Difference",
      heroTitle: "Quality Laptops & Computers, Honestly Graded",
      heroText:
        "Brand-new and carefully refurbished laptops, desktops and accessories in Srinagar. Every device is tested, graded and sold with its true condition clearly shown.",
      phone: "9419888899",
      whatsapp: "919419888899",
      email: "",
      address: "SM Technologies Pvt Ltd, Beighpora Baghimehtab, Main Road, 1st Floor, Opposite Lone Medicate, Srinagar, J&K - 190019",
      mapUrl: "https://maps.app.goo.gl/ymtiDh43M5GYSAP78?g_st=iwb",
      hours: "Mon - Sat: 10:00 AM - 8:00 PM",
      warrantyNote: "Every device is tested before sale. Warranty details are shown on each listing.",
      socials: [],
    },
    products: [
      {
        id: uid(), name: "Dell Latitude 5490 (Sample)", brand: "Dell", category: "Laptop", condition: "A",
        price: 22999, originalPrice: 32999, processor: "Intel Core i5 8th Gen", ram: "8 GB", storage: "256 GB SSD",
        display: "14\" Full HD", extras: "Backlit keyboard, Windows 11",
        description: "Sample listing. A reliable business laptop, fully tested and cleaned. Edit or delete this from the admin panel.",
        conditionNotes: "Body in excellent shape with very light marks. Battery backup around 3 hours.", warranty: "6 months",
        inStock: true, featured: true, uses: ["Student", "Office", "Home"], images: [], createdAt: now,
      },
      {
        id: uid(), name: "HP ProBook 450 G5 (Sample)", brand: "HP", category: "Laptop", condition: "B",
        price: 18499, originalPrice: 27999, processor: "Intel Core i5 8th Gen", ram: "8 GB", storage: "256 GB SSD + 1 TB HDD",
        display: "15.6\" HD", extras: "Numeric keypad, Windows 10/11",
        description: "Sample listing. Great value everyday laptop.",
        conditionNotes: "Visible scratches on lid and palm rest. Screen and keyboard are clean.", warranty: "3 months",
        inStock: true, featured: false, uses: ["Office", "Student", "Home"], images: [], createdAt: now - 1,
      },
      {
        id: uid(), name: "Lenovo ThinkCentre Desktop (Sample)", brand: "Lenovo", category: "Desktop", condition: "A",
        price: 12999, originalPrice: 19999, processor: "Intel Core i5 6th Gen", ram: "8 GB", storage: "256 GB SSD",
        display: "Monitor sold separately", extras: "Small form factor, Wi-Fi ready",
        description: "Sample listing. Compact desktop for office, study and home use.",
        conditionNotes: "Clean chassis with minimal marks.", warranty: "6 months",
        inStock: true, featured: false, uses: ["Office", "Home"], images: [], createdAt: now - 2,
      },
      {
        id: uid(), name: "ASUS Vivobook 15 X1502ZA (Sample)", brand: "ASUS", category: "Laptop", condition: "new",
        price: 47999, originalPrice: 0, processor: "Intel Core 12th Gen", ram: "16 GB", storage: "512 GB SSD",
        display: "15.6\" Full HD", extras: "Sealed box, Windows 11",
        description: "Sample listing. Brand new with manufacturer warranty. Update specs and price from the admin panel.",
        conditionNotes: "Brand new, sealed.", warranty: "1 year manufacturer warranty",
        inStock: true, featured: true, uses: ["Student", "Office", "Programming", "Home"], images: [], createdAt: now - 3,
      },
    ],
  };
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (id int PRIMARY KEY, data jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS products (id text PRIMARY KEY, created_at bigint NOT NULL, data jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS reviews (id text PRIMARY KEY, created_at bigint NOT NULL, approved boolean NOT NULL DEFAULT false, data jsonb NOT NULL);
  `);
  const { rowCount } = await pool.query("SELECT 1 FROM settings WHERE id = 1");
  if (!rowCount) {
    const s = seed();
    await pool.query("INSERT INTO settings (id, data) VALUES (1, $1) ON CONFLICT DO NOTHING", [s.settings]);
    for (const p of s.products) {
      await pool.query("INSERT INTO products (id, created_at, data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [p.id, p.createdAt, p]);
    }
  }

  // Older databases: add the "uses" field (the sample products get sensible defaults, the rest start empty)
  const SAMPLE_USES = {
    "Dell Latitude": ["Student", "Office", "Home"],
    "HP ProBook": ["Office", "Student", "Home"],
    "Lenovo ThinkCentre": ["Office", "Home"],
    "ASUS Vivobook": ["Student", "Office", "Programming", "Home"],
  };
  const old = await pool.query("SELECT id, data FROM products WHERE NOT (data ? 'uses')");
  for (const r of old.rows) {
    const name = String(r.data.name || "");
    const hit = Object.keys(SAMPLE_USES).find((k) => name.startsWith(k) && name.includes("(Sample)"));
    await pool.query("UPDATE products SET data = $2 WHERE id = $1", [r.id, { ...r.data, uses: hit ? SAMPLE_USES[hit] : [] }]);
  }
}

const getSettings = async () => (await pool.query("SELECT data FROM settings WHERE id = 1")).rows[0]?.data || seed().settings;
const getProducts = async () => (await pool.query("SELECT data FROM products ORDER BY created_at DESC")).rows.map((r) => r.data);
const getReviews = async (onlyApproved) =>
  (await pool.query(`SELECT data, approved FROM reviews ${onlyApproved ? "WHERE approved = true" : ""} ORDER BY created_at DESC`)).rows.map(
    (r) => ({ ...r.data, approved: r.approved })
  );

/* small in-memory cache so the public site stays fast even when Neon wakes from sleep */
let publicCache = null;
const bust = () => (publicCache = null);
async function getPublic() {
  if (publicCache && Date.now() - publicCache.at < 5 * 60e3) return publicCache.data;
  const [settings, products, reviews] = await Promise.all([getSettings(), getProducts(), getReviews(true)]);
  const data = { settings, products, reviews };
  publicCache = { at: Date.now(), data };
  return data;
}

/* ---------------- Cloudinary image storage ---------------- */
async function uploadToCloudinary(buf, mime) {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloud || !key || !secret) throw httpErr(500, "Image storage is not set up. Add the Cloudinary environment variables.");
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "sm-technologies";
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), "upload");
  form.append("api_key", key);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.secure_url) throw httpErr(502, j.error?.message || "Image upload failed.");
  // f_auto/q_auto make Cloudinary serve the smallest good-looking format to each visitor
  return j.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
}

/* ---------------- auth ---------------- */
const sign = (s) => crypto.createHmac("sha256", SECRET).update(s).digest("hex");
const makeToken = () => {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  return `${exp}.${sign(String(exp))}`;
};
function validToken(t) {
  if (!t) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  if (validToken(h.startsWith("Bearer ") ? h.slice(7) : "")) return next();
  res.status(401).json({ error: "Please log in again." });
}
function passwordOk(p) {
  const a = crypto.createHash("sha256").update(String(p || "")).digest();
  const b = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

const hits = new Map();
function limit(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (!v.some((t) => now - t < 3600e3)) hits.delete(k);
}, 600e3).unref();

/* ---------------- sanitizers ---------------- */
const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
};
const CATS = ["Laptop", "Desktop", "Accessory"];
const CONDS = ["new", "A", "B", "C"];
const USE_KEYS = ["Student", "Office", "Programming", "Design", "Gaming", "Home"];
const okUrl = (u) => /^https:\/\//i.test(u);

function cleanProduct(b, existing) {
  const p = {
    id: existing?.id || uid(),
    name: str(b.name, 140),
    brand: str(b.brand, 60),
    category: CATS.includes(b.category) ? b.category : "Laptop",
    condition: CONDS.includes(b.condition) ? b.condition : "A",
    price: num(b.price),
    originalPrice: num(b.originalPrice),
    processor: str(b.processor, 100),
    ram: str(b.ram, 40),
    storage: str(b.storage, 80),
    display: str(b.display, 80),
    extras: str(b.extras, 200),
    description: str(b.description, 2000),
    conditionNotes: str(b.conditionNotes, 800),
    warranty: str(b.warranty, 100),
    inStock: b.inStock !== false,
    featured: !!b.featured,
    uses: [...new Set((Array.isArray(b.uses) ? b.uses : []).filter((u) => USE_KEYS.includes(u)))],
    images: (Array.isArray(b.images) ? b.images : []).map((u) => str(u, 500)).filter(okUrl).slice(0, 6),
    createdAt: existing?.createdAt || Date.now(),
  };
  return p.name ? p : null;
}

function cleanSettings(b) {
  const s = {};
  for (const k of ["shopName", "tagline", "heroTitle", "phone", "whatsapp", "email", "hours"]) s[k] = str(b[k], 120);
  s.heroText = str(b.heroText, 400);
  s.address = str(b.address, 300);
  s.warrantyNote = str(b.warrantyNote, 300);
  s.mapUrl = /^https?:\/\//i.test(b.mapUrl || "") ? str(b.mapUrl, 400) : "";
  s.whatsapp = s.whatsapp.replace(/\D/g, "");
  s.socials = (Array.isArray(b.socials) ? b.socials : [])
    .map((x) => ({ platform: str(x.platform, 30).toLowerCase(), url: str(x.url, 400) }))
    .filter((x) => x.platform && /^https?:\/\//i.test(x.url))
    .slice(0, 12);
  return s;
}

/* ---------------- app ---------------- */
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(compression());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.send("ok"));

app.get("/api/public", ah(async (_req, res) => {
  res.set("Cache-Control", "no-cache");
  res.json(await getPublic());
}));

app.post("/api/reviews", ah(async (req, res) => {
  if (!limit("rev:" + req.ip, 5, 3600e3)) throw httpErr(429, "Too many reviews. Please try again later.");
  const b = req.body || {};
  const name = str(b.name, 60);
  const comment = str(b.comment, 1000);
  const rating = Math.round(Number(b.rating));
  if (name.length < 2) throw httpErr(400, "Please enter your name.");
  if (comment.length < 5) throw httpErr(400, "Please write a short review.");
  if (!(rating >= 1 && rating <= 5)) throw httpErr(400, "Please choose a star rating.");
  let productId = "";
  if (b.productId) {
    const { rowCount } = await pool.query("SELECT 1 FROM products WHERE id = $1", [String(b.productId)]);
    if (rowCount) productId = String(b.productId);
  }
  const review = { id: uid(), name, comment, rating, productId, approved: false, createdAt: Date.now() };
  await pool.query("INSERT INTO reviews (id, created_at, approved, data) VALUES ($1, $2, false, $3)", [review.id, review.createdAt, review]);
  res.json({ ok: true });
}));

app.post("/api/login", (req, res) => {
  if (!limit("login:" + req.ip, 10, 15 * 60e3)) return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  if (!passwordOk(req.body?.password)) return res.status(401).json({ error: "Wrong password." });
  res.json({ token: makeToken() });
});

/* admin */
app.get("/api/admin/data", auth, ah(async (_req, res) => {
  const [settings, products, reviews] = await Promise.all([getSettings(), getProducts(), getReviews(false)]);
  res.json({ settings, products, reviews });
}));

app.post("/api/admin/products", auth, ah(async (req, res) => {
  const p = cleanProduct(req.body || {});
  if (!p) throw httpErr(400, "Product name is required.");
  await pool.query("INSERT INTO products (id, created_at, data) VALUES ($1, $2, $3)", [p.id, p.createdAt, p]);
  bust();
  res.json(p);
}));
app.put("/api/admin/products/:id", auth, ah(async (req, res) => {
  const cur = (await pool.query("SELECT data FROM products WHERE id = $1", [req.params.id])).rows[0];
  if (!cur) throw httpErr(404, "Product not found.");
  const p = cleanProduct(req.body || {}, cur.data);
  if (!p) throw httpErr(400, "Product name is required.");
  await pool.query("UPDATE products SET data = $2 WHERE id = $1", [p.id, p]);
  bust();
  res.json(p);
}));
app.delete("/api/admin/products/:id", auth, ah(async (req, res) => {
  await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  bust();
  res.json({ ok: true });
}));

app.patch("/api/admin/reviews/:id", auth, ah(async (req, res) => {
  const approved = !!req.body?.approved;
  const { rows } = await pool.query(
    "UPDATE reviews SET approved = $2, data = jsonb_set(data, '{approved}', to_jsonb($2::boolean)) WHERE id = $1 RETURNING data, approved",
    [req.params.id, approved]
  );
  if (!rows[0]) throw httpErr(404, "Review not found.");
  bust();
  res.json({ ...rows[0].data, approved: rows[0].approved });
}));
app.delete("/api/admin/reviews/:id", auth, ah(async (req, res) => {
  await pool.query("DELETE FROM reviews WHERE id = $1", [req.params.id]);
  bust();
  res.json({ ok: true });
}));

app.put("/api/admin/settings", auth, ah(async (req, res) => {
  const s = cleanSettings(req.body || {});
  await pool.query("INSERT INTO settings (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data", [s]);
  bust();
  res.json(s);
}));

const MIMES = ["image/jpeg", "image/png", "image/webp"];
app.post("/api/admin/upload", auth, express.raw({ type: MIMES, limit: "6mb" }), ah(async (req, res) => {
  const mime = req.headers["content-type"]?.split(";")[0];
  if (!MIMES.includes(mime) || !Buffer.isBuffer(req.body) || !req.body.length) throw httpErr(400, "Please upload a JPG, PNG or WebP image.");
  res.json({ url: await uploadToCloudinary(req.body, mime) });
}));

/* static site */
app.use("/assets", express.static(path.join(DIST, "assets"), { maxAge: "1y", immutable: true }));
app.use(express.static(DIST, { maxAge: "1h", index: false }));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(DIST, "index.html"), (err) => {
    if (err) res.status(200).send("Site is not built yet. Run: npm run build");
  });
});

app.use((err, _req, res, _next) => {
  if (!err.expose) console.error(err);
  const status = err.status === 413 ? 413 : err.status || 500;
  res.status(status).json({ error: err.expose ? err.message : status === 413 ? "File too large." : "Something went wrong." });
});

await initDb();
app.listen(PORT, () => console.log(`SM Technologies running on port ${PORT}`));
