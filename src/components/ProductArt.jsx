import { useId } from "react";
import { IconShield, IconCheck, IconTag } from "./Icons.jsx";

/* [dark, light, soft background] */
const PALETTES = [
  ["#2a3fc0", "#7c8cff", "#eef0fb"],
  ["#0f766e", "#34d399", "#e6f7f1"],
  ["#7c3aed", "#c084fc", "#f2ebfe"],
  ["#b45309", "#fbbf24", "#fdf2dc"],
  ["#be123c", "#fb7185", "#fdebee"],
  ["#0369a1", "#38bdf8", "#e5f3fc"],
];
export const paletteFor = (s) => {
  let h = 0;
  for (const ch of String(s || "x")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
};

const FONT = "Inter, Arial, sans-serif";

function Defs({ id, c1, c2 }) {
  return (
    <defs>
      <linearGradient id={id + "s"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </linearGradient>
      <linearGradient id={id + "b"} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eceffa" />
        <stop offset="1" stopColor="#b7bdd8" />
      </linearGradient>
    </defs>
  );
}

function LaptopSVG({ id, c1, c2, label }) {
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="Laptop illustration">
      <Defs id={id} c1={c1} c2={c2} />
      <ellipse cx="160" cy="197" rx="126" ry="8" fill="#14237a" opacity=".13" />
      <rect x="58" y="16" width="204" height="132" rx="10" fill="#161a36" />
      <rect x="66" y="25" width="188" height="114" rx="4" fill={`url(#${id}s)`} />
      <rect x="78" y="37" width="64" height="8" rx="4" fill="#fff" opacity=".85" />
      <rect x="78" y="51" width="40" height="5" rx="2.5" fill="#fff" opacity=".5" />
      <rect x="192" y="37" width="50" height="26" rx="6" fill="#fff" opacity=".22" />
      <rect x="78" y="98" width="164" height="30" rx="6" fill="#fff" opacity=".18" />
      <circle cx="160" cy="20.5" r="1.8" fill="#4a5080" />
      <text x="160" y="86" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="18" fill="#fff" letterSpacing="2">{label}</text>
      <path d="M26 152 H294 L282 178 Q280 184 272 184 H48 Q40 184 38 178 Z" fill={`url(#${id}b)`} />
      <rect x="136" y="152" width="48" height="6" rx="3" fill="#a3a9c9" />
    </svg>
  );
}

function DesktopSVG({ id, c1, c2, label }) {
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="Desktop computer illustration">
      <Defs id={id} c1={c1} c2={c2} />
      <ellipse cx="160" cy="198" rx="130" ry="8" fill="#14237a" opacity=".13" />
      <rect x="40" y="12" width="178" height="118" rx="9" fill="#161a36" />
      <rect x="48" y="20" width="162" height="102" rx="4" fill={`url(#${id}s)`} />
      <rect x="60" y="32" width="56" height="8" rx="4" fill="#fff" opacity=".85" />
      <rect x="60" y="46" width="34" height="5" rx="2.5" fill="#fff" opacity=".5" />
      <rect x="150" y="32" width="46" height="24" rx="6" fill="#fff" opacity=".22" />
      <rect x="60" y="92" width="136" height="22" rx="6" fill="#fff" opacity=".18" />
      <text x="129" y="80" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="15" fill="#fff" letterSpacing="2">{label}</text>
      <path d="M113 130 H145 L151 158 H107 Z" fill={`url(#${id}b)`} />
      <rect x="90" y="158" width="78" height="8" rx="4" fill="#a3a9c9" />
      <rect x="236" y="34" width="58" height="132" rx="8" fill={`url(#${id}b)`} />
      <circle cx="265" cy="52" r="4.5" fill={c2} />
      <rect x="246" y="72" width="38" height="4" rx="2" fill="#8d94b8" />
      <rect x="246" y="84" width="38" height="4" rx="2" fill="#8d94b8" />
      <circle cx="265" cy="142" r="8" fill="none" stroke="#8d94b8" strokeWidth="3" />
      <rect x="64" y="178" width="120" height="14" rx="5" fill="#dfe2f1" />
      <rect x="72" y="182" width="104" height="2.5" rx="1.2" fill="#b7bdd8" />
      <rect x="72" y="187" width="104" height="2.5" rx="1.2" fill="#b7bdd8" />
    </svg>
  );
}

function AccessorySVG({ id, c1, c2, label }) {
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="Keyboard and mouse illustration">
      <Defs id={id} c1={c1} c2={c2} />
      <ellipse cx="160" cy="190" rx="130" ry="8" fill="#14237a" opacity=".13" />
      <rect x="34" y="70" width="196" height="106" rx="14" fill={`url(#${id}b)`} />
      <rect x="40" y="76" width="184" height="94" rx="10" fill={`url(#${id}s)`} opacity=".92" />
      {[0, 1, 2].flatMap((r) =>
        Array.from({ length: 10 }, (_, c) => (
          <rect key={r + "-" + c} x={48 + c * 17} y={86 + r * 20} width="13" height="14" rx="3.5" fill="#fff" opacity=".9" />
        ))
      )}
      <rect x="84" y="148" width="96" height="12" rx="4" fill="#fff" opacity=".9" />
      <rect x="246" y="76" width="46" height="84" rx="23" fill={`url(#${id}b)`} />
      <path d="M269 76 V114" stroke="#8d94b8" strokeWidth="2.5" />
      <rect x="265.5" y="88" width="7" height="14" rx="3.5" fill={c1} />
      <text x="132" y="52" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="16" fill={c1} letterSpacing="2">{label}</text>
    </svg>
  );
}

/* Illustration shown when a product has no photo yet */
export default function ProductArt({ p, float = false }) {
  const id = useId().replace(/:/g, "");
  const [c1, c2, tint] = paletteFor(p.brand || p.name);
  const label = (p.brand || "").toUpperCase().slice(0, 12);
  const Art = p.category === "Desktop" ? DesktopSVG : p.category === "Accessory" ? AccessorySVG : LaptopSVG;
  return (
    <div className={"art" + (float ? " float" : "")} style={{ background: `radial-gradient(circle at 30% 18%, #ffffff 0%, ${tint} 72%)` }} aria-hidden="true">
      <span className="art-orb o1" style={{ background: c2 }} />
      <span className="art-orb o2" style={{ background: c1 }} />
      <Art id={id} c1={c1} c2={c2} label={label} />
    </div>
  );
}

/* Big animated laptop for the top of the home page */
export function HeroArt() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="hero-device" aria-hidden="true">
      <div className="glow" />
      <LaptopSVG id={id} c1="#3b55e6" c2="#f2c200" label="SM" />
      <div className="fchip c1"><IconShield width={18} height={18} /> Warranty included</div>
      <div className="fchip c2"><IconCheck width={18} height={18} /> Tested &amp; graded</div>
      <div className="fchip c3"><IconTag width={18} height={18} /> New &amp; refurbished</div>
    </div>
  );
}
