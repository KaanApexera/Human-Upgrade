import { useState, useEffect, useRef } from "react";
import { useLocation, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const GOALS: Record<string, { label: string; sum: string; img: string; nutri: string[]; train: string[]; rout: string[] }> = {
  longevity: {
    label: "Longevity", sum: "Rebuild your body to age slower.", img: "/redesign/goal-longevity.png",
    nutri: ["Mediterranean base · 30g+ fiber daily", "Protein 1.6g/kg · 10-hour eating window", "Omega-3, magnesium & vitamin D stack"],
    train: ["Zone 2 cardio · 150 min / week", "2× full-body strength sessions", "VO₂max intervals · 1× / week"],
    rout: ["7.5–9h sleep · fixed wake time", "Morning light + cold exposure", "Screens off 60 min before bed"],
  },
  fatloss: {
    label: "Fat loss", sum: "Drop fat without wrecking metabolism.", img: "/redesign/goal-fatloss.png",
    nutri: ["300–500 kcal deficit · protein 2g/kg", "High-volume veg · low-GI carbs", "16:8 fasting · no late-night snacking"],
    train: ["3–4× strength · progressive overload", "8–12k steps daily (NEAT)", "2× short HIIT finishers"],
    rout: ["7–8h sleep to protect leptin", "3L water + electrolytes", "Weekly weigh-in & waist check"],
  },
  strength: {
    label: "Strength & muscle", sum: "Add muscle and raw strength.", img: "/redesign/goal-strength.png",
    nutri: ["Slight surplus · protein 2.2g/kg", "Carbs around training · 4–6g/kg", "Creatine 5g every day"],
    train: ["4–5× hypertrophy + heavy compounds", "10–20 sets / muscle / week · RPE 7–9", "Deload every 6–8 weeks"],
    rout: ["8–9h sleep for recovery", "Pre-sleep slow protein", "Mobility & soft-tissue · 10 min/day"],
  },
  energy: {
    label: "Energy & focus", sum: "Stable energy and sharper focus.", img: "/redesign/goal-energy.png",
    nutri: ["Protein + fat breakfast · stable glucose", "Cut refined sugar & alcohol", "B-vitamins, electrolytes, L-theanine"],
    train: ["Daily 20–30 min brisk movement", "2× short strength circuits", "Breathwork + Zone 2"],
    rout: ["Consistent sleep/wake · ±30 min", "10 min morning sunlight", "90-min deep-work focus blocks"],
  },
};

const FAQS = [
  ["Do I need a special lab test?", "No. Upload any standard blood panel you already have — a PDF or even a phone photo. Our AI reads it in seconds."],
  ["How are my plans personalized?", "We map your biomarkers, wearables and chosen goal into a nutrition, training and routine plan — then re-tune it weekly as new data arrives."],
  ["Are the protocols safe?", "Every recommendation is evidence-based and flags anything that needs a doctor. We never advise on emergency or red-flag symptoms — we route you to care."],
  ["What happens to my data?", "It's yours. Encrypted at rest, never sold, fully deletable at any time from settings."],
];

function Helix() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function resize() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    let mx = 0;
    const onMove = (e: MouseEvent) => { mx = (e.clientX / window.innerWidth - 0.5); };
    window.addEventListener("mousemove", onMove);
    const N = 130, turns = 4.5;
    const start = performance.now();
    function frame(now: number) {
      const t = reduce ? 0 : (now - start) / 1000;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";
      const cx = w / 2 + mx * 40, cy = h / 2;
      const amp = Math.min(w, 720) * 0.26, span = h * 0.92;
      const pts: { x: number; y: number; z: number; c: string }[] = [];
      for (let i = 0; i < N; i++) {
        const p = i / (N - 1);
        const ang = p * Math.PI * 2 * turns + t * 0.9;
        const y = cy - span / 2 + p * span;
        pts.push({ x: cx + Math.cos(ang) * amp, y, z: Math.sin(ang), c: "212,63,48" });
        pts.push({ x: cx + Math.cos(ang + Math.PI) * amp, y, z: Math.sin(ang + Math.PI), c: "237,231,221" });
        if (i % 3 === 0) {
          ctx!.strokeStyle = "rgba(212,63,48,0.10)";
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(cx + Math.cos(ang) * amp, y);
          ctx!.lineTo(cx + Math.cos(ang + Math.PI) * amp, y);
          ctx!.stroke();
        }
      }
      pts.sort((a, b) => a.z - b.z);
      for (const pt of pts) {
        const depth = (pt.z + 1) / 2;
        const r = 1.6 + depth * 3.4;
        const a = 0.18 + depth * 0.62;
        const grd = ctx!.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 3.2);
        grd.addColorStop(0, `rgba(${pt.c},${a})`);
        grd.addColorStop(1, `rgba(${pt.c},0)`);
        ctx!.fillStyle = grd;
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, r * 3.2, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={ref} className="hl-canvas" aria-hidden="true" />;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function Mark({ className = "hl-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 74" aria-hidden="true">
      <circle cx="50" cy="13" r="12" fill="hsl(var(--foreground))" />
      <path d="M34 27 L66 27 A8 8 0 0 1 66 43 L57 43 L50 33 L43 43 L34 43 A8 8 0 0 1 34 27 Z" fill="hsl(var(--foreground))" />
      <polygon points="50,34.5 58,44 42,44" fill="hsl(var(--primary))" />
      <rect x="26" y="47" width="22" height="13" rx="6.5" fill="hsl(var(--foreground))" />
      <rect x="52" y="47" width="22" height="13" rx="6.5" fill="hsl(var(--foreground))" />
    </svg>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery<User>({ queryKey: ["/api/user"] });
  const [goal, setGoal] = useState<keyof typeof GOALS>("longevity");
  const [faq, setFaq] = useState<number | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    document.querySelectorAll(".hl .rev").forEach((el) => io.observe(el));
    const t = setTimeout(() => document.querySelector(".hl")?.classList.add("ready"), 60);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  if (!isLoading && user) return <Redirect to="/dashboard" />;
  const g = GOALS[goal];
  const arrow = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  const check = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="17" height="17"><path d="M5 12l5 5L20 6" /></svg>;

  return (
    <div className="hl">
      <style>{CSS}</style>

      <nav className="hl-nav">
        <div className="hl-brand"><Mark />HUMAN&nbsp;UPGRADE</div>
        <div className="hl-links">
          <a onClick={() => scrollToId("discover")}>Method</a>
          <a onClick={() => scrollToId("goals")}>Plans</a>
          <a onClick={() => scrollToId("pricing")}>Access</a>
        </div>
        <button className="hl-pill" onClick={() => setLocation("/register")}>Start free {arrow}</button>
      </nav>

      <header className="hl-hero">
        <Helix />
        <div className="hl-vign" />
        <div className="hl-eyebrow"><span className="hl-dot" />Beta — first 50 humans · $1/month</div>
        <h1 className="hl-h1">
          <span className="ln"><span className="w">Feel</span> <span className="w">decades</span></span>
          <span className="ln"><span className="w grad">younger.</span></span>
        </h1>
        <p className="hl-sub">Upload any blood test. Our longevity engine reads 50+ biomarkers and engineers your nutrition, training and daily routine to reverse your biological age.</p>
        <div className="hl-ctas">
          <button className="hl-btn" onClick={() => setLocation("/register")}>Get my biological age {arrow}</button>
          <button className="hl-btn alt" onClick={() => scrollToId("discover")}>Watch the science</button>
        </div>
        <div className="hl-meta">
          <span>BIO-AGE ENGINE · v2.4</span>
          <span className="sc"><i />SCROLL</span>
          <span>50+ MARKERS DECODED</span>
        </div>
      </header>

      <div className="hl-marq"><div className="row">{Array(2).fill(0).map((_, k) => (
        <span key={k}>{["LONGEVITY", "NUTRITION", "TRAINING", "BIO-AGE", "ROUTINES", "PEPTIDES"].map((x, i) => (
          <span key={i}><span className={i % 2 ? "o" : ""}>{x}</span><span className="star">✦</span></span>
        ))}</span>
      ))}</div></div>

      <section className="hl-sec">
        <div className="hl-wrap">
          <p className="hl-kick rev">The thesis</p>
          <p className="hl-manif rev">Aging is <span className="grad">data.</span> And data can be <span className="gradc">rewritten.</span> <b>We turn your bloodwork into nutrition, workouts and routines that make your body younger — every single day.</b></p>
        </div>
      </section>

      <section className="hl-sec" id="discover">
        <div className="hl-wrap">
          <p className="hl-kick rev">What you'll discover</p>
          <h2 className="hl-st rev">Your body,<br /><span className="gradc">fully decoded.</span></h2>
          <div className="hl-split">
            <div className="hl-fig rev"><img src="/redesign/helix.png" alt="" /><div className="ov" /><div className="cap"><b>LIVE</b> · biological age engine · −8 yrs reversed</div></div>
            <div>
              <p className="hl-lead rev">No appointments. No expensive labs. Just upload what you have — a PDF or a phone photo — and get a system that works only for you.</p>
              <ul className="hl-feat rev">
                {[["01", "50+ biomarkers, instantly read", "AI extracts and benchmarks every marker against optimal longevity ranges."],
                  ["02", "Nutrition, training & peptide protocols", "Sequenced and timed from your exact data — not a generic plan."],
                  ["03", "One daily score", "A single number that tells you if today moved you younger or older."],
                  ["04", "Wearable sync", "Sleep, HRV and recovery folded into your longevity model."]].map((f) => (
                  <li key={f[0]}><span className="n">{f[0]}</span><div><h4>{f[1]}</h4><p>{f[2]}</p></div></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="hl-sec" id="goals">
        <div className="hl-wrap">
          <p className="hl-kick rev">Built around your goal</p>
          <h2 className="hl-st rev">One system.<br /><span className="grad">Every goal.</span></h2>
          <p className="hl-lead rev">Pick where you're headed. Your nutrition, workout plan and daily routine re-engineer themselves around it — and around your latest biomarkers.</p>
          <div className="hl-gtabs rev">
            {(Object.keys(GOALS) as (keyof typeof GOALS)[]).map((k) => (
              <button key={k} className={"gt" + (goal === k ? " on" : "")} onClick={() => setGoal(k)}>{GOALS[k].label}</button>
            ))}
          </div>
          <div className="hl-gbanner rev">
            <img src={g.img} alt="" key={g.img} />
            <div className="gbov" />
            <div className="gbcap"><span className="gt-lab">Your goal</span><p className="gsum">{g.sum}</p></div>
          </div>
          <div className="hl-ggrid rev">
            {[["Nutrition", g.nutri, "drop"], ["Workout plan", g.train, "bar"], ["Daily routine", g.rout, "clock"]].map((p, pi) => (
              <div className="hl-gcard" key={pi}>
                <div className="gh">
                  <span className="gi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      {p[2] === "drop" && <path d="M12 3c-3 4-6 6-6 10a6 6 0 0012 0c0-4-3-6-6-10z" />}
                      {p[2] === "bar" && <path d="M6 7v10M18 7v10M6 9h12M6 15h12" />}
                      {p[2] === "clock" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
                    </svg>
                  </span>
                  <div><span className="gt-lab">Pillar 0{pi + 1}</span><h4>{p[0] as string}</h4></div>
                </div>
                <ul>{(p[1] as string[]).map((x, i) => <li key={i} className="fade">{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hl-sec">
        <div className="hl-wrap">
          <p className="hl-kick rev">Biological age engine</p>
          <h2 className="hl-st rev">Older on paper.<br /><span className="grad">Younger in reality.</span></h2>
          <div className="hl-bio">
            <div className="hl-ring rev">
              <svg width="260" height="260" viewBox="0 0 280 280">
                <circle cx="140" cy="140" r="124" fill="none" stroke="rgba(242,238,230,.06)" strokeWidth="14" />
                <circle cx="140" cy="140" r="124" fill="none" stroke="url(#hg)" strokeWidth="14" strokeLinecap="round" strokeDasharray="779" strokeDashoffset="200" transform="rotate(-90 140 140)" />
                <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D43F30" /><stop offset="1" stopColor="#F2EEE6" /></linearGradient></defs>
              </svg>
              <div className="ctr"><b className="gradc">32</b><small>BODY AGE</small></div>
              <div className="biorow">
                <div><span>Chronological</span><b>40</b></div>
                <div><span>Body age</span><b className="gradc">32</b></div>
                <div><span>Reversed</span><b style={{ color: "#37F5B5" }}>−8</b></div>
              </div>
            </div>
            <div>
              <p className="hl-lead rev">We benchmark 50+ biomarkers against validated aging models to estimate how old your body actually is — then show you exactly which levers move the number.</p>
              <p className="hl-manif rev" style={{ fontSize: "clamp(22px,3vw,38px)", marginTop: 24 }}>Most people see results with their <span className="gradc">first upload.</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="hl-sec" id="pricing">
        <div className="hl-wrap">
          <p className="hl-kick rev">Access</p>
          <h2 className="hl-st rev">Start free. <span className="grad">No catch.</span></h2>
          <p className="hl-lead rev">First 50 people get full beta access for $1/month. No credit card to see your biological age.</p>
          <div className="hl-prices">
            {[{ n: "Free", a: "$0", per: "", d: "See your biological age in 60s", f: ["1 biomarker upload", "Biological age score", "Top 3 red flags"], pop: false, cta: "Start free", alt: true },
              { n: "Beta", a: "$1", per: "/mo", d: "Full access · first 50 users only", f: ["Unlimited uploads · 50+ markers", "Nutrition, workout & peptide plans", "Daily score + wearable sync", "Weekly re-tuning to your goal"], pop: true, cta: "Claim beta access", alt: false },
              { n: "Pro", a: "$29", per: "/mo", d: "For serious optimizers", f: ["Everything in Beta", "Cohort benchmarking", "Priority lab analysis"], pop: false, cta: "Go Pro", alt: true }].map((p) => (
              <div className={"hl-price" + (p.pop ? " pop" : "")} key={p.n}>
                <span className="pn">{p.n}</span>
                <div className="amt">{p.a}{p.per && <small>{p.per}</small>}</div>
                <p className="pd">{p.d}</p>
                <ul className="pf">{p.f.map((x, i) => <li key={i}>{check}{x}</li>)}</ul>
                <button className={"pbtn" + (p.alt ? " alt" : "")} onClick={() => setLocation("/register")}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hl-sec">
        <div className="hl-wrap">
          <p className="hl-kick rev">Questions we get a lot</p>
          <h2 className="hl-st rev">Good to <span className="gradc">know.</span></h2>
          <div className="hl-faq">
            {FAQS.map((q, i) => (
              <div className={"q" + (faq === i ? " open" : "")} key={i}>
                <button onClick={() => setFaq(faq === i ? null : i)}>{q[0]}<span className="plus">+</span></button>
                <div className="a" style={{ maxHeight: faq === i ? 220 : 0 }}><p>{q[1]}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hl-wrap"><div className="hl-band rev">
        <img src="/redesign/hero.png" alt="" /><div className="bov" />
        <h2>Become biologically<br /><span className="grad">younger.</span></h2>
        <p>Takes 60 seconds. First 50 people get beta access for $1/month. No credit card · results in 60 seconds.</p>
        <button className="hl-btn" onClick={() => setLocation("/register")}>Get my biological age {arrow}</button>
      </div></div>

      <footer className="hl-foot"><div className="hl-wrap fr">
        <div className="hl-brand sm"><Mark />HUMAN UPGRADE</div>
        <span>© 2026 · Longevity intelligence</span>
        <span><a onClick={() => setLocation("/privacy")}>Privacy</a> · <a onClick={() => setLocation("/terms")}>Terms</a></span>
      </div></footer>
    </div>
  );
}

const CSS = `
.hl{--bg:#0A0908;--ink:#F2EEE6;--muted:#938D83;--faint:#564F47;--red1:#D43F30;--red2:#F0584A;--bone2:#C9C2B5;--mint:#37F5B5;--hair:rgba(242,238,230,.07);--hair2:rgba(242,238,230,.15);position:relative;background:#0A0908;color:var(--ink);font-family:'Inter',sans-serif;overflow-x:hidden;min-height:100vh}
.hl ::selection{background:var(--red1);color:#fff}
.hl .grad{background:linear-gradient(96deg,var(--red1),var(--red2) 70%,#FF8C73);-webkit-background-clip:text;background-clip:text;color:transparent}
.hl .gradc{background:linear-gradient(96deg,#fff,var(--bone2));-webkit-background-clip:text;background-clip:text;color:transparent}
.hl-wrap{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 28px}
.hl-mark{width:30px;height:auto;display:block}
.hl-nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:20px 36px;background:linear-gradient(180deg,rgba(10,9,8,.85),transparent)}
.hl-brand{display:flex;align-items:center;gap:12px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;letter-spacing:.05em}
.hl-brand.sm{font-size:14px}.hl-brand.sm .hl-mark{width:24px}
.hl-links{display:flex;gap:34px}
.hl-links a{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:.2s}
.hl-links a:hover{color:var(--ink)}
.hl-pill{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:11px 20px;border-radius:100px;color:#fff;border:none;cursor:pointer;background:linear-gradient(95deg,var(--red1),var(--red2));box-shadow:0 10px 30px rgba(212,63,48,.4)}
.hl-hero{position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 24px}
.hl-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.hl-vign{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(120% 90% at 50% 35%,transparent 38%,rgba(10,9,8,.72) 78%,#0A0908 100%)}
.hl-hero>:not(.hl-canvas):not(.hl-vign){position:relative;z-index:2}
.hl-eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--red2);margin-bottom:24px}
.hl-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--red1);box-shadow:0 0 12px var(--red1);margin-right:10px;vertical-align:middle;animation:hlpulse 1.7s infinite}
@keyframes hlpulse{0%,100%{opacity:1}50%{opacity:.3}}
.hl-h1{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(48px,11vw,150px);line-height:.92;letter-spacing:-.035em;text-transform:uppercase}
.hl-h1 .ln{display:block;overflow:hidden}
.hl-h1 .w{display:inline-block;transform:translateY(110%);opacity:0;transition:transform 1s cubic-bezier(.16,1,.3,1),opacity 1s}
.hl.ready .hl-h1 .w{transform:none;opacity:1}
.hl-sub{color:var(--muted);font-weight:300;font-size:clamp(15px,1.7vw,19px);max-width:46ch;margin:28px auto 0;opacity:0;transition:.9s .5s}
.hl.ready .hl-sub{opacity:1}
.hl-ctas{display:flex;gap:13px;justify-content:center;margin-top:34px;flex-wrap:wrap;opacity:0;transition:.9s .65s}
.hl.ready .hl-ctas{opacity:1}
.hl-btn{display:inline-flex;align-items:center;gap:10px;font-weight:500;font-size:15px;cursor:pointer;border:none;padding:16px 28px;border-radius:100px;color:#fff;background:linear-gradient(95deg,var(--red1),var(--red2));box-shadow:0 14px 40px rgba(212,63,48,.42)}
.hl-btn.alt{background:rgba(242,238,230,.05);box-shadow:inset 0 0 0 1px var(--hair2);color:var(--ink)}
.hl-meta{position:absolute;bottom:34px;left:0;right:0;display:flex;justify-content:space-between;padding:0 36px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);opacity:0;transition:.9s 1s}
.hl.ready .hl-meta{opacity:1}
.hl-meta .sc{display:flex;align-items:center;gap:8px}
.hl-meta .sc i{display:block;width:1px;height:32px;background:linear-gradient(var(--red1),transparent)}
.hl-marq{border-top:1px solid var(--hair);border-bottom:1px solid var(--hair);padding:20px 0;overflow:hidden;white-space:nowrap;position:relative;z-index:2;background:rgba(10,9,8,.55)}
.hl-marq .row{display:inline-block;animation:hlslide 26s linear infinite;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:28px;text-transform:uppercase}
.hl-marq .row>span>span:first-child{margin:0 26px}
.hl-marq .o{color:transparent;-webkit-text-stroke:1px var(--faint)}.hl-marq .star{color:var(--red1)}
@keyframes hlslide{to{transform:translateX(-50%)}}
.hl-sec{position:relative;z-index:2;padding:120px 0;background:#0A0908}
.hl-kick{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--red2);display:inline-flex;align-items:center;gap:10px}
.hl-kick::before{content:"";width:30px;height:1px;background:var(--red1)}
.hl-st{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(34px,5vw,70px);letter-spacing:-.03em;line-height:1;margin-top:20px;text-transform:uppercase}
.hl-lead{color:var(--muted);font-weight:300;font-size:18px;max-width:56ch;margin-top:18px}
.hl-manif{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(26px,4.4vw,58px);line-height:1.12;letter-spacing:-.02em;max-width:18ch;margin-top:26px}
.hl-manif b{color:var(--faint);font-weight:500}
.hl .rev{opacity:0;transform:translateY(36px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
.hl .rev.in{opacity:1;transform:none}
.hl-fig,.hl-gbanner,.hl-gcard,.hl-ring,.hl-price,.hl-band{background:linear-gradient(180deg,rgba(242,238,230,.05),rgba(242,238,230,.02));border:1px solid var(--hair)}
.hl-split{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;margin-top:56px}
.hl-fig{position:relative;overflow:hidden;aspect-ratio:4/5;border-radius:24px;background:#100c0b}
.hl-fig img{width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;opacity:.96}
.hl-fig .ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(10,9,8,.7))}
.hl-fig .cap{position:absolute;left:20px;bottom:20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}
.hl-fig .cap b{color:var(--red2)}
.hl-feat{list-style:none;margin-top:26px;padding:0;display:flex;flex-direction:column}
.hl-feat li{display:flex;gap:18px;padding:20px 0;border-top:1px solid var(--hair)}
.hl-feat li:last-child{border-bottom:1px solid var(--hair)}
.hl-feat .n{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--red2);padding-top:3px}
.hl-feat h4{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:20px}
.hl-feat p{color:var(--muted);font-size:14.5px;font-weight:300;margin-top:3px}
.hl-gtabs{display:flex;gap:11px;flex-wrap:wrap;margin-top:44px}
.hl-gtabs .gt{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);cursor:pointer;padding:13px 22px;border-radius:100px;border:1px solid var(--hair2);background:rgba(242,238,230,.02);transition:.2s}
.hl-gtabs .gt.on{color:#fff;border-color:transparent;background:linear-gradient(95deg,var(--red1),var(--red2));box-shadow:0 10px 30px rgba(212,63,48,.38)}
.hl-gbanner{position:relative;margin-top:22px;border-radius:22px;overflow:hidden;aspect-ratio:21/7;min-height:200px;background:#100c0b}
.hl-gbanner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.95;mix-blend-mode:screen;animation:hlfade .5s ease}
@keyframes hlfade{from{opacity:0}to{opacity:.95}}
.hl-gbanner .gbov{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,9,8,.92) 8%,rgba(10,9,8,.35) 58%,transparent)}
.hl-gbanner .gbcap{position:absolute;left:32px;bottom:28px;right:32px}
.gt-lab{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--red2)}
.gsum{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(20px,2.6vw,32px);letter-spacing:-.01em;margin-top:6px}
.hl-ggrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:18px}
.hl-gcard{padding:26px;border-radius:20px}
.hl-gcard .gh{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.hl-gcard .gi{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;border:1px solid var(--hair);background:rgba(242,238,230,.03)}
.hl-gcard .gi svg{width:20px;height:20px;stroke:var(--red2)}
.hl-gcard h4{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:19px}
.hl-gcard ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:13px}
.hl-gcard li{display:flex;gap:11px;font-size:14px;color:var(--muted);font-weight:300}
.hl-gcard li::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--red1);margin-top:7px;flex-shrink:0;box-shadow:0 0 8px var(--red1)}
.fade{animation:hlfi .45s ease}
@keyframes hlfi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.hl-bio{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;margin-top:56px}
.hl-ring{padding:36px;text-align:center;position:relative;border-radius:20px}
.hl-ring .ctr{position:relative;margin-top:-200px;margin-bottom:120px;pointer-events:none}
.hl-ring .ctr b{font-family:'Space Grotesk',sans-serif;font-size:80px;font-weight:600;line-height:1;display:block}
.hl-ring .ctr small{display:block;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.2em;color:var(--red2);margin-top:4px}
.hl-ring .biorow{display:flex;border-top:1px solid var(--hair);padding-top:20px;margin-top:6px}
.hl-ring .biorow div{flex:1}
.hl-ring .biorow span{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.hl-ring .biorow b{display:block;font-family:'Space Grotesk',sans-serif;font-size:28px;margin-top:6px}
.hl-prices{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:56px;align-items:stretch}
.hl-price{padding:34px 28px;display:flex;flex-direction:column;border-radius:20px}
.hl-price.pop{border:1px solid rgba(212,63,48,.5);box-shadow:0 0 56px rgba(212,63,48,.2);position:relative}
.hl-price.pop::before{content:"MOST POPULAR";position:absolute;top:-11px;left:50%;transform:translateX(-50%);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;padding:6px 15px;border-radius:100px;color:#fff;background:linear-gradient(95deg,var(--red1),var(--red2));box-shadow:0 8px 22px rgba(212,63,48,.55)}
.hl-price .pn{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.hl-price .amt{font-family:'Space Grotesk',sans-serif;font-size:54px;font-weight:600;margin:14px 0 2px;letter-spacing:-.02em}
.hl-price .amt small{font-size:15px;color:var(--faint);font-weight:400}
.hl-price .pd{color:var(--faint);font-size:13px;margin-bottom:22px}
.hl-price .pf{list-style:none;padding:0;display:flex;flex-direction:column;gap:12px;margin:6px 0 26px}
.hl-price .pf li{display:flex;gap:10px;font-size:14px;color:var(--muted)}
.hl-price .pf li svg{flex-shrink:0;margin-top:2px}
.hl-price .pbtn{margin-top:auto;display:flex;justify-content:center;align-items:center;gap:8px;font-weight:500;font-size:14px;cursor:pointer;padding:15px;border-radius:100px;border:none;color:#fff;background:linear-gradient(95deg,var(--red1),var(--red2));box-shadow:0 12px 34px rgba(212,63,48,.4)}
.hl-price .pbtn.alt{background:rgba(242,238,230,.05);box-shadow:inset 0 0 0 1px var(--hair2);color:var(--ink)}
.hl-faq{max-width:840px;margin:50px auto 0}
.hl-faq .q{border-bottom:1px solid var(--hair)}
.hl-faq .q button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:26px 4px;background:none;border:none;color:var(--ink);font-family:'Space Grotesk',sans-serif;font-size:clamp(17px,2.3vw,25px);font-weight:500;text-align:left;cursor:pointer}
.hl-faq .plus{color:var(--red1);font-size:25px;transition:transform .3s;flex-shrink:0}
.hl-faq .q.open .plus{transform:rotate(45deg)}
.hl-faq .a{overflow:hidden;transition:max-height .35s ease}
.hl-faq .a p{padding:0 4px 26px;color:var(--muted);font-weight:300;font-size:16px;max-width:70ch}
.hl-band{position:relative;border-radius:30px;overflow:hidden;padding:100px 36px;text-align:center;margin:30px 0 80px}
.hl-band img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5;mix-blend-mode:screen}
.hl-band .bov{position:absolute;inset:0;background:radial-gradient(80% 120% at 50% 0%,rgba(212,63,48,.4),transparent 60%),linear-gradient(180deg,rgba(10,9,8,.4),rgba(10,9,8,.85))}
.hl-band h2{position:relative;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(34px,6vw,82px);letter-spacing:-.03em;line-height:.95;text-transform:uppercase}
.hl-band p{position:relative;color:var(--muted);margin:20px auto 30px;max-width:50ch;font-weight:300;font-size:17px}
.hl-band .hl-btn{position:relative}
.hl-foot{position:relative;z-index:2;background:#0A0908;border-top:1px solid var(--hair);padding:48px 0}
.hl-foot .fr{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;color:var(--faint);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.hl-foot .fr a{cursor:pointer}.hl-foot .fr a:hover{color:var(--ink)}
@media(max-width:900px){.hl-links{display:none}.hl-split,.hl-bio{grid-template-columns:1fr;gap:36px}.hl-prices,.hl-ggrid{grid-template-columns:1fr}.hl-sec{padding:80px 0}}
@media(prefers-reduced-motion:reduce){.hl .w,.hl-sub,.hl-ctas,.hl-meta,.hl .rev{opacity:1!important;transform:none!important}}
`;
