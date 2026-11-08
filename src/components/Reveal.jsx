import { useEffect, useRef, useState } from "react";

/* Fades and slides content in the first time it scrolls into view */
export function Reveal({ children, delay = 0, as: Tag = "div", className = "", style, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={"reveal" + (shown ? " in" : "") + (className ? " " + className : "")} style={{ "--d": delay + "ms", ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/* Number that counts up when the page opens */
export function CountUp({ to, prefix = "", suffix = "", decimals = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !to) {
      setV(to || 0);
      return;
    }
    let raf;
    let start;
    const step = (t) => {
      if (start === undefined) start = t;
      const k = Math.min(1, (t - start) / 1300);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <>
      {prefix}
      {v.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </>
  );
}
