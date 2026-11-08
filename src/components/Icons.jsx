const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const IconPhone = (p) => (<svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>);
export const IconPin = (p) => (<svg {...base} {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const IconClock = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconMail = (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const IconShield = (p) => (<svg {...base} {...p}><path d="M12 3 4 6v6c0 4.5 3.2 7.6 8 9 4.8-1.4 8-4.5 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>);
export const IconCheck = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>);
export const IconTag = (p) => (<svg {...base} {...p}><path d="M3 12V4h8l10 10-8 8L3 12z" /><circle cx="7.5" cy="8.5" r="1.2" /></svg>);
export const IconTools = (p) => (<svg {...base} {...p}><path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5L15 12l-3-3 2.5-2.5z" /></svg>);
export const IconLaptop = (p) => (<svg {...base} strokeWidth={1.4} {...p}><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>);
export const IconX = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconSearch = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconPlus = (p) => (<svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const IconLock = (p) => (<svg {...base} {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
export const IconMenu = (p) => (<svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconFilter = (p) => (<svg {...base} {...p}><path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" /></svg>);
export const IconChevron = (p) => (<svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>);
export const IconArrow = (p) => (<svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const IconSpark = (p) => (<svg {...base} {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>);
export const IconEye =(p) => (<svg {...base} {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>);

export function UseIcon({ name, ...p }) {
  switch (name) {
    case "student":
      return (<svg {...base} {...p}><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v6" /></svg>);
    case "office":
      return (<svg {...base} {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" /></svg>);
    case "code":
      return (<svg {...base} {...p}><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" /></svg>);
    case "design":
      return (<svg {...base} {...p}><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.5-1-1.5-1-3 0-1 .8-2 2-2h2.5A3.5 3.5 0 0 0 21 10.5C21 6.4 17 3 12 3z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7" r="1" /></svg>);
    case "game":
      return (<svg {...base} {...p}><rect x="2.5" y="7" width="19" height="11" rx="5" /><path d="M7 10.5v4M5 12.5h4" /><circle cx="15.5" cy="11.5" r=".8" fill="currentColor" /><circle cx="18" cy="13.5" r=".8" fill="currentColor" /></svg>);
    default:
      return (<svg {...base} {...p}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>);
  }
}

export function IconWhatsApp(p) {
  return (
    <svg {...base} {...p}>
      <path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z" />
      <path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .6c-.8-.4-1.6-1.2-2-2l.6-1-1-2L9 9z" />
    </svg>
  );
}

export function Stars({ value = 0, size = 16 }) {
  const full = Math.round(value);
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(full)}
      <span className="off">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n <= value ? "on" : ""} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
          {"★"}
        </button>
      ))}
    </div>
  );
}

export const SOCIAL_PLATFORMS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["whatsapp", "WhatsApp"],
  ["youtube", "YouTube"],
  ["x", "X (Twitter)"],
  ["telegram", "Telegram"],
  ["linkedin", "LinkedIn"],
  ["tiktok", "TikTok"],
  ["snapchat", "Snapchat"],
  ["website", "Website"],
];

export function SocialIcon({ platform, size = 20 }) {
  const s = { ...base, width: size, height: size };
  switch (platform) {
    case "facebook":
      return (<svg {...s}><path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2H8v3.5h2.5V21H14v-7.5h2.5L17 10h-3V8.4c0-.2.1-.4.3-.4z" /></svg>);
    case "instagram":
      return (<svg {...s}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r=".6" fill="currentColor" /></svg>);
    case "whatsapp":
      return <IconWhatsApp width={size} height={size} />;
    case "youtube":
      return (<svg {...s}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" /></svg>);
    case "x":
      return (<svg {...s}><path d="M5 4l14 16M19 4 5 20" /></svg>);
    case "telegram":
      return (<svg {...s}><path d="M21 4 3 11l5.5 2L10 19l3-3.5 4.5 3.5L21 4z" /><path d="m8.5 13 8-5" /></svg>);
    case "linkedin":
      return (<svg {...s}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 11v5M8 8v.1M12 16v-5m0 2.5c0-1.5 1-2.5 2.2-2.5S16 12 16 13.5V16" /></svg>);
    case "tiktok":
      return (<svg {...s}><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.3 2.3 1.8 3.8 4 4" /></svg>);
    case "snapchat":
      return (<svg {...s}><path d="M12 4c-2.5 0-4 1.8-4 4v2.5c-.7.6-1.5.9-2.5 1 .8.9 1.7 1.2 2.5 1.3-.2 1-.7 1.6-1.8 2.2 1 .5 1.8.4 2.7.8.5.6 1.3 1.2 3.1 1.2s2.6-.6 3.1-1.2c.9-.4 1.7-.3 2.7-.8-1.1-.6-1.6-1.2-1.8-2.2.8-.1 1.7-.4 2.5-1.3-1-.1-1.8-.4-2.5-1V8c0-2.2-1.5-4-4-4z" /></svg>);
    default:
      return (<svg {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>);
  }
}

export const socialLabel = (k) => (SOCIAL_PLATFORMS.find((x) => x[0] === k) || [k, k])[1];
