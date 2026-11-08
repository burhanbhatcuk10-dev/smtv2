export const CONDITIONS = {
  new: { label: "Brand New", short: "New", tone: "new", desc: "Sealed and unused, with full manufacturer warranty." },
  A: { label: "Refurbished - Grade A", short: "Grade A", tone: "a", desc: "Like new. Little to no visible marks. Fully tested and cleaned." },
  B: { label: "Refurbished - Grade B", short: "Grade B", tone: "b", desc: "Good condition. Light scratches or marks on the body; works perfectly." },
  C: { label: "Refurbished - Grade C", short: "Grade C", tone: "c", desc: "Fair. Visible wear and cosmetic marks, fully functional at the lowest price." },
};

export const CATEGORIES = ["Laptop", "Desktop", "Accessory"];

/* What a device is best suited for (admin ticks these on each product) */
export const USES = [
  { key: "Student", label: "Students", blurb: "Classes, notes and online learning", icon: "student" },
  { key: "Office", label: "Office & Business", blurb: "Documents, email and accounts", icon: "office" },
  { key: "Programming", label: "Programming", blurb: "Coding, servers and dev tools", icon: "code" },
  { key: "Design", label: "Design & Editing", blurb: "Photos, video and graphics", icon: "design" },
  { key: "Gaming", label: "Gaming", blurb: "Smooth frame rates and power", icon: "game" },
  { key: "Home", label: "Home & Browsing", blurb: "Streaming, browsing, family use", icon: "home" },
];
export const useLabel = (k) => USES.find((u) => u.key === k)?.label || k;

export const CPU_ORDER = ["Core i3", "Core i5", "Core i7", "Core i9", "Core (other)", "Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9", "Apple M-series", "Celeron / Pentium", "Other"];
export const RAM_ORDER = ["4 GB or less", "8 GB", "12–16 GB", "24 GB or more"];
export const STOR_ORDER = ["256 GB or less", "500–512 GB", "1 TB", "2 TB or more"];
export const STORT_ORDER = ["SSD", "SSD + HDD", "HDD"];
export const SCREEN_ORDER = ['13" & below', '14"', '15"–16"', '17" & above'];

/* Turn the free-text specs the admin typed into values the filters can use */
export function derive(p) {
  const ramTxt = String(p.ram || "");
  const rm = ramTxt.match(/(\d+)\s*GB/i) || ramTxt.match(/(\d+)/);
  const ramGB = rm ? Number(rm[1]) : 0;
  const ramB = !ramGB ? null : ramGB <= 4 ? RAM_ORDER[0] : ramGB <= 8 ? RAM_ORDER[1] : ramGB <= 16 ? RAM_ORDER[2] : RAM_ORDER[3];

  const stTxt = String(p.storage || "");
  let storGB = 0;
  for (const s of stTxt.matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)/gi)) {
    const v = parseFloat(s[1]) * (s[2].toUpperCase() === "TB" ? 1024 : 1);
    if (v > storGB) storGB = v;
  }
  const storB = !storGB ? null : storGB <= 256 ? STOR_ORDER[0] : storGB <= 512 ? STOR_ORDER[1] : storGB <= 1024 ? STOR_ORDER[2] : STOR_ORDER[3];
  const low = stTxt.toLowerCase();
  const ssd = /ssd|nvme|m\.2|emmc/.test(low);
  const hdd = /hdd|hard/.test(low);
  const storT = ssd && hdd ? "SSD + HDD" : ssd ? "SSD" : hdd ? "HDD" : null;

  const c = String(p.processor || "").toLowerCase();
  let cpu = null;
  if (c.trim()) {
    if (/\bi9\b|ultra\s*9/.test(c)) cpu = "Core i9";
    else if (/\bi7\b|ultra\s*7/.test(c)) cpu = "Core i7";
    else if (/\bi5\b|ultra\s*5/.test(c)) cpu = "Core i5";
    else if (/\bi3\b/.test(c)) cpu = "Core i3";
    else if (/ryzen\s*9/.test(c)) cpu = "Ryzen 9";
    else if (/ryzen\s*7/.test(c)) cpu = "Ryzen 7";
    else if (/ryzen\s*5/.test(c)) cpu = "Ryzen 5";
    else if (/ryzen\s*3/.test(c)) cpu = "Ryzen 3";
    else if (/apple|\bm[1-4]\b/.test(c)) cpu = "Apple M-series";
    else if (/celeron|pentium|athlon|\batom\b/.test(c)) cpu = "Celeron / Pentium";
    else if (/core/.test(c)) cpu = "Core (other)";
    else cpu = "Other";
  }

  const d = String(p.display || "");
  const sm = d.match(/(\d{2}(?:\.\d)?)\s*(?:"|”|''|-?\s*inch|in\b)/i);
  const inch = sm ? parseFloat(sm[1]) : 0;
  const scrB = !inch ? null : inch < 14 ? SCREEN_ORDER[0] : inch < 15 ? SCREEN_ORDER[1] : inch < 17 ? SCREEN_ORDER[2] : SCREEN_ORDER[3];

  return {
    ramGB, ramB, storGB, storB, storT, cpu, inch, scrB,
    uses: Array.isArray(p.uses) ? p.uses : [],
    images: Array.isArray(p.images) ? p.images : [],
  };
}

export const money = (n) => (n ? "₹" + Number(n).toLocaleString("en-IN") : "Ask for price");

export const discount = (p) => (p.originalPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0);

export const waLink = (settings, text) => {
  const n = (settings.whatsapp || settings.phone || "").replace(/\D/g, "");
  const num = n.length === 10 ? "91" + n : n;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
};

export const avg = (list) => (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0);

export const dateFmt = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
