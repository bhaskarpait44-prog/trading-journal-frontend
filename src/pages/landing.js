import { navigate } from '../router.js';
import { auth } from '../lib/auth.js';

export function renderLanding(container) {
  // Full-page landing — no height restriction, full scroll
  container.style.cssText = 'width:100%;display:block;background:#060a12;';

  container.innerHTML = `
  <style>
    .land * { box-sizing:border-box; margin:0; padding:0; }
    .land { font-family:'Inter',sans-serif; color:#e8eeff; background:#060a12; }

    /* Nav */
    .ln-nav {
      position:fixed; top:0; left:0; right:0; z-index:100;
      padding:0 2rem; height:64px;
      display:flex; align-items:center; justify-content:space-between;
      border-bottom:1px solid rgba(255,255,255,0.04);
      backdrop-filter:blur(20px);
      background:rgba(6,10,18,0.85);
    }
    .ln-logo { display:flex; align-items:center; gap:0.625rem; text-decoration:none; }
    .ln-logo-icon {
      width:32px; height:32px; border-radius:8px;
      background:linear-gradient(135deg,#3b82f6,#1d4ed8);
      display:flex; align-items:center; justify-content:center;
    }
    .ln-logo-text { font-family:'Syne',sans-serif; font-weight:800; font-size:1.05rem; color:#fff; }
    .ln-nav-links { display:flex; align-items:center; gap:2rem; }
    .ln-nav-links a { color:#7a90b0; font-size:0.875rem; text-decoration:none; transition:color 0.15s; }
    .ln-nav-links a:hover { color:#e8eeff; }
    .ln-nav-btns { display:flex; align-items:center; gap:0.75rem; }
    .ln-btn-ghost {
      padding:0.45rem 1rem; border-radius:7px; border:1px solid rgba(255,255,255,0.1);
      color:#c0cce0; font-size:0.83rem; font-weight:500; cursor:pointer;
      background:transparent; transition:all 0.15s; font-family:'DM Sans',sans-serif;
    }
    .ln-btn-ghost:hover { background:rgba(255,255,255,0.05); color:#fff; }
    .ln-btn-solid {
      padding:0.45rem 1.1rem; border-radius:7px; border:none;
      background:linear-gradient(135deg,#3b82f6,#2563eb);
      color:#fff; font-size:0.83rem; font-weight:600; cursor:pointer;
      font-family:'DM Sans',sans-serif; transition:all 0.15s;
    }
    .ln-btn-solid:hover { filter:brightness(1.12); }

    /* Hero */
    .ln-hero {
      padding: 140px 2rem 80px;
      max-width:1200px; margin:0 auto;
      display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center;
    }
    @media(max-width:900px){ .ln-hero{ grid-template-columns:1fr; padding:120px 1.5rem 60px; } }
    .ln-badge {
      display:inline-flex; align-items:center; gap:0.4rem;
      padding:0.3rem 0.875rem; border-radius:20px;
      border:1px solid rgba(59,130,246,0.3); background:rgba(59,130,246,0.08);
      color:#60a5fa; font-size:0.75rem; font-weight:500; margin-bottom:1.5rem;
    }
    .ln-h1 {
      font-family:'Syne',sans-serif; font-weight:800;
      font-size:clamp(2.2rem,4.5vw,3.5rem); line-height:1.1;
      letter-spacing:-0.03em; color:#fff; margin-bottom:1.25rem;
    }
    .ln-h1 .grad {
      background:linear-gradient(135deg,#60a5fa,#818cf8,#a78bfa);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      background-clip:text;
    }
    .ln-subtext { color:#7a90b0; font-size:1.05rem; line-height:1.7; margin-bottom:2.25rem; max-width:500px; }
    .ln-hero-btns { display:flex; gap:0.875rem; flex-wrap:wrap; }
    .ln-cta-primary {
      display:inline-flex; align-items:center; gap:0.5rem;
      padding:0.75rem 1.75rem; border-radius:9px; border:none;
      background:linear-gradient(135deg,#3b82f6,#2563eb);
      color:#fff; font-size:0.95rem; font-weight:600; cursor:pointer;
      font-family:'DM Sans',sans-serif; transition:all 0.2s;
      box-shadow:0 0 30px rgba(59,130,246,0.35);
    }
    .ln-cta-primary:hover { transform:translateY(-1px); filter:brightness(1.1); box-shadow:0 0 40px rgba(59,130,246,0.5); }
    .ln-cta-secondary {
      display:inline-flex; align-items:center; gap:0.5rem;
      padding:0.75rem 1.75rem; border-radius:9px;
      border:1px solid rgba(255,255,255,0.12);
      color:#c0cce0; font-size:0.95rem; font-weight:500; cursor:pointer;
      font-family:'DM Sans',sans-serif; background:transparent; transition:all 0.2s;
    }
    .ln-cta-secondary:hover { background:rgba(255,255,255,0.05); color:#fff; }

    /* Hero mock dashboard */
    .ln-mock {
      background:#0d1524; border:1px solid rgba(255,255,255,0.07);
      border-radius:16px; overflow:hidden;
      box-shadow:0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1);
      position:relative;
    }
    .ln-mock::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,rgba(59,130,246,0.5),transparent);
    }
    .ln-mock-bar {
      padding:0.6rem 1rem; background:#080e1a;
      border-bottom:1px solid rgba(255,255,255,0.06);
      display:flex; align-items:center; gap:0.4rem;
    }
    .ln-mock-dot { width:8px; height:8px; border-radius:50%; }
    .ln-mock-body { padding:1rem; }
    .ln-mock-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem; margin-bottom:1rem; }
    .ln-ms {
      background:#111827; border:1px solid rgba(255,255,255,0.06);
      border-radius:8px; padding:0.6rem 0.75rem;
    }
    .ln-ms-label { font-size:0.6rem; color:#3a4f6a; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.25rem; }
    .ln-ms-val { font-family:'JetBrains Mono',monospace; font-size:0.875rem; font-weight:600; }
    .ln-mock-chart { background:#111827; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:0.75rem; margin-bottom:1rem; }
    .ln-mock-chart-label { font-size:0.65rem; color:#3a4f6a; margin-bottom:0.5rem; }
    .ln-chart-svg { width:100%; height:60px; }
    .ln-mock-trades { display:flex; flex-direction:column; gap:0.35rem; }
    .ln-mt {
      display:flex; justify-content:space-between; align-items:center;
      background:#111827; border:1px solid rgba(255,255,255,0.06);
      border-radius:6px; padding:0.45rem 0.6rem;
    }
    .ln-mt-sym { font-family:'JetBrains Mono',monospace; font-size:0.72rem; font-weight:600; color:#e8eeff; }
    .ln-mt-type { font-size:0.6rem; padding:1px 5px; border-radius:3px; }

    /* Section base */
    .ln-section { padding:80px 2rem; max-width:1200px; margin:0 auto; }
    .ln-section-label {
      display:inline-block; font-size:0.72rem; font-weight:600; letter-spacing:.12em;
      text-transform:uppercase; color:#3b82f6; margin-bottom:0.875rem;
    }
    .ln-section-title {
      font-family:'Syne',sans-serif; font-weight:800;
      font-size:clamp(1.8rem,3.5vw,2.6rem); color:#fff;
      letter-spacing:-0.025em; margin-bottom:1rem; line-height:1.15;
    }
    .ln-section-sub { color:#7a90b0; font-size:1rem; line-height:1.65; max-width:540px; }

    /* Features */
    .ln-features-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
      gap:1rem; margin-top:3rem;
    }
    .ln-feat-card {
      background:#0d1524; border:1px solid rgba(255,255,255,0.07);
      border-radius:12px; padding:1.25rem;
      transition:all 0.2s; position:relative; overflow:hidden;
    }
    .ln-feat-card:hover { border-color:rgba(59,130,246,0.3); transform:translateY(-2px); }
    .ln-feat-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent);
      opacity:0; transition:opacity 0.2s;
    }
    .ln-feat-card:hover::before { opacity:1; }
    .ln-feat-icon {
      width:40px; height:40px; border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      margin-bottom:1rem; font-size:1.1rem;
    }
    .ln-feat-title { font-family:'Syne',sans-serif; font-weight:700; font-size:0.95rem; color:#e8eeff; margin-bottom:0.4rem; }
    .ln-feat-desc { color:#7a90b0; font-size:0.8rem; line-height:1.6; }

    /* Analytics preview */
    .ln-analytics-wrap {
      margin-top:3rem; background:#0d1524;
      border:1px solid rgba(255,255,255,0.07); border-radius:16px;
      overflow:hidden;
    }
    .ln-analytics-header {
      padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.06);
      display:flex; justify-content:space-between; align-items:center;
    }
    .ln-analytics-body { padding:1.5rem; }
    .ln-analytics-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    @media(max-width:700px){ .ln-analytics-cards{ grid-template-columns:repeat(2,1fr); } }
    .ln-ac {
      background:#111827; border:1px solid rgba(255,255,255,0.06);
      border-radius:10px; padding:1rem;
    }
    .ln-ac-label { font-size:0.68rem; color:#3a4f6a; text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.4rem; }
    .ln-ac-val { font-family:'JetBrains Mono',monospace; font-size:1.3rem; font-weight:700; margin-bottom:0.2rem; }
    .ln-ac-sub { font-size:0.7rem; color:#3a4f6a; }

    /* Strategy section */
    .ln-strategy-grid { display:grid; grid-template-columns:1fr 1.3fr; gap:3rem; margin-top:3rem; align-items:start; }
    @media(max-width:800px){ .ln-strategy-grid{ grid-template-columns:1fr; } }
    .ln-strat-list { display:flex; flex-direction:column; gap:0.75rem; }
    .ln-strat-item {
      padding:1rem 1.25rem; border-radius:10px;
      border:1px solid rgba(255,255,255,0.07); background:#0d1524;
      cursor:pointer; transition:all 0.15s;
    }
    .ln-strat-item.active, .ln-strat-item:hover {
      border-color:rgba(59,130,246,0.35); background:rgba(59,130,246,0.06);
    }
    .ln-strat-name { font-weight:600; font-size:0.875rem; color:#e8eeff; margin-bottom:0.25rem; }
    .ln-strat-desc { font-size:0.78rem; color:#7a90b0; }
    .ln-strat-table { background:#0d1524; border:1px solid rgba(255,255,255,0.07); border-radius:12px; overflow:hidden; }
    .ln-st-row { display:grid; grid-template-columns:1.8fr 1fr 1fr 1fr; gap:0; }
    .ln-st-header { background:#080e1a; border-bottom:1px solid rgba(255,255,255,0.06); }
    .ln-st-cell {
      padding:0.75rem 1rem; font-size:0.78rem;
      border-right:1px solid rgba(255,255,255,0.04);
    }
    .ln-st-cell:last-child { border-right:none; }
    .ln-st-header .ln-st-cell { color:#3a4f6a; font-size:0.7rem; text-transform:uppercase; letter-spacing:.05em; font-weight:500; }
    .ln-st-body .ln-st-row { border-bottom:1px solid rgba(255,255,255,0.04); }
    .ln-st-body .ln-st-row:last-child { border-bottom:none; }

    /* Psychology */
    .ln-psych-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-top:3rem; }
    @media(max-width:700px){ .ln-psych-grid{ grid-template-columns:1fr; } }
    .ln-psych-card {
      padding:1.25rem; border-radius:12px;
      border:1px solid rgba(168,85,247,0.2); background:rgba(168,85,247,0.05);
      transition:all 0.2s;
    }
    .ln-psych-card:hover { border-color:rgba(168,85,247,0.4); }
    .ln-psych-icon { font-size:1.5rem; margin-bottom:0.75rem; }
    .ln-psych-title { font-family:'Syne',sans-serif; font-weight:700; font-size:0.95rem; color:#c084fc; margin-bottom:0.375rem; }
    .ln-psych-desc { font-size:0.8rem; color:#7a90b0; line-height:1.6; }

    /* Pricing */
    .ln-pricing-grid { display:grid; grid-template-columns:1fr 1.08fr; gap:1.5rem; margin-top:3rem; max-width:720px; margin-left:auto; margin-right:auto; }
    @media(max-width:700px){ .ln-pricing-grid{ grid-template-columns:1fr; max-width:400px; } }
    .ln-plan {
      background:#0d1524; border:1px solid rgba(255,255,255,0.08);
      border-radius:16px; padding:2rem; position:relative;
    }
    .ln-plan-pro {
      background:linear-gradient(180deg,#0d1a2e,#0a1220);
      border-color:rgba(59,130,246,0.4);
      box-shadow:0 0 40px rgba(59,130,246,0.1);
    }
    .ln-plan-badge {
      position:absolute; top:-12px; left:50%; transform:translateX(-50%);
      padding:3px 14px; border-radius:20px;
      background:linear-gradient(135deg,#3b82f6,#2563eb);
      font-size:0.68rem; font-weight:700; color:#fff; white-space:nowrap; letter-spacing:.04em;
    }
    .ln-plan-name { font-size:0.8rem; font-weight:600; color:#7a90b0; text-transform:uppercase; letter-spacing:.08em; margin-bottom:0.5rem; }
    .ln-plan-price {
      font-family:'Syne',sans-serif; font-weight:800;
      font-size:2.5rem; color:#fff; line-height:1; margin-bottom:0.25rem;
    }
    .ln-plan-price span { font-size:1rem; font-weight:400; color:#7a90b0; }
    .ln-plan-per { font-size:0.78rem; color:#3a4f6a; margin-bottom:1.5rem; }
    .ln-plan-sep { height:1px; background:rgba(255,255,255,0.07); margin-bottom:1.25rem; }
    .ln-plan-features { display:flex; flex-direction:column; gap:0.625rem; margin-bottom:1.75rem; }
    .ln-plan-feat { display:flex; align-items:center; gap:0.6rem; font-size:0.83rem; color:#c0cce0; }
    .ln-plan-feat svg { flex-shrink:0; }
    .ln-plan-btn {
      width:100%; padding:0.75rem; border-radius:9px; border:none;
      font-size:0.9rem; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;
      transition:all 0.2s;
    }
    .ln-plan-btn-ghost {
      background:transparent; border:1px solid rgba(255,255,255,0.12); color:#c0cce0;
    }
    .ln-plan-btn-ghost:hover { background:rgba(255,255,255,0.05); color:#fff; }
    .ln-plan-btn-solid {
      background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff;
      box-shadow:0 4px 20px rgba(59,130,246,0.35);
    }
    .ln-plan-btn-solid:hover { filter:brightness(1.1); transform:translateY(-1px); }

    /* Testimonials */
    .ln-testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:3rem; }
    @media(max-width:800px){ .ln-testi-grid{ grid-template-columns:1fr; } }
    .ln-testi {
      background:#0d1524; border:1px solid rgba(255,255,255,0.07);
      border-radius:12px; padding:1.5rem; position:relative;
    }
    .ln-testi-quote {
      font-size:0.875rem; color:#c0cce0; line-height:1.7; margin-bottom:1.25rem;
      font-style:italic;
    }
    .ln-testi-author { display:flex; align-items:center; gap:0.625rem; }
    .ln-testi-avatar {
      width:36px; height:36px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-weight:700; font-size:0.85rem; color:#fff; flex-shrink:0;
    }
    .ln-testi-name { font-weight:600; font-size:0.83rem; color:#e8eeff; }
    .ln-testi-role { font-size:0.7rem; color:#3a4f6a; margin-top:1px; }
    .ln-stars { color:#eab308; font-size:0.75rem; margin-bottom:1rem; }

    /* FAQ */
    .ln-faq { display:flex; flex-direction:column; gap:0.5rem; margin-top:3rem; max-width:700px; }
    .ln-faq-item {
      border:1px solid rgba(255,255,255,0.07); border-radius:10px;
      overflow:hidden; cursor:pointer;
    }
    .ln-faq-q {
      padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center;
      font-weight:500; font-size:0.9rem; color:#c0cce0; background:#0d1524;
      transition:background 0.15s;
    }
    .ln-faq-q:hover { background:#111827; }
    .ln-faq-a {
      padding:0 1.25rem; max-height:0; overflow:hidden;
      font-size:0.82rem; color:#7a90b0; line-height:1.7;
      transition:max-height 0.3s ease, padding 0.3s ease;
      background:#080e1a;
    }
    .ln-faq-item.open .ln-faq-a { max-height:200px; padding:0.875rem 1.25rem; }
    .ln-faq-chevron { transition:transform 0.3s; color:#3a4f6a; flex-shrink:0; }
    .ln-faq-item.open .ln-faq-chevron { transform:rotate(180deg); }

    /* Final CTA */
    .ln-final {
      margin:0 2rem 80px; border-radius:20px;
      background:linear-gradient(135deg,#0d1a2e,#091422);
      border:1px solid rgba(59,130,246,0.2);
      padding:80px 2rem; text-align:center;
      position:relative; overflow:hidden;
    }
    .ln-final::before {
      content:''; position:absolute; top:-60px; left:50%; transform:translateX(-50%);
      width:500px; height:300px;
      background:radial-gradient(ellipse,rgba(59,130,246,0.15),transparent 70%);
      pointer-events:none;
    }
    .ln-final-title {
      font-family:'Syne',sans-serif; font-weight:800;
      font-size:clamp(1.8rem,4vw,2.8rem); color:#fff;
      letter-spacing:-0.025em; margin-bottom:1rem;
    }
    .ln-final-sub { color:#7a90b0; font-size:1rem; margin-bottom:2rem; }

    /* Footer */
    .ln-footer {
      border-top:1px solid rgba(255,255,255,0.05);
      padding:2rem 2rem; display:flex; justify-content:space-between; align-items:center;
      max-width:1200px; margin:0 auto;
    }
    .ln-footer-copy { font-size:0.78rem; color:#3a4f6a; }
    .ln-footer-links { display:flex; gap:1.5rem; }
    .ln-footer-links a { font-size:0.78rem; color:#3a4f6a; text-decoration:none; }
    .ln-footer-links a:hover { color:#7a90b0; }

    /* Divider between sections */
    .ln-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); max-width:1200px; margin:0 auto; }

    /* Animations */
    @keyframes ln-fadeup { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    .ln-fadeup { animation:ln-fadeup 0.6s ease both; }
    .ln-fadeup-1 { animation-delay:0.1s; }
    .ln-fadeup-2 { animation-delay:0.2s; }
    .ln-fadeup-3 { animation-delay:0.35s; }
    .ln-fadeup-4 { animation-delay:0.5s; }

    /* Glow grid bg */
    .ln-bg-grid {
      position:fixed; inset:0; pointer-events:none; z-index:0;
      background-image:
        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
      background-size:60px 60px;
    }

    /* ── Hamburger button ── */
    .ln-hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 38px; height: 38px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      cursor: pointer;
      padding: 0;
      transition: background 0.15s;
    }
    .ln-hamburger:hover { background: rgba(255,255,255,0.06); }
    .ln-hamburger span {
      display: block; width: 18px; height: 2px;
      background: #c0cce0; border-radius: 2px;
      transition: all 0.25s;
    }
    .ln-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .ln-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .ln-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile drawer ── */
    .ln-drawer-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.6); z-index: 200;
      backdrop-filter: blur(4px);
    }
    .ln-drawer-overlay.open { display: block; }
    .ln-drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 280px; z-index: 201;
      background: #0a0f1c;
      border-left: 1px solid rgba(255,255,255,0.07);
      transform: translateX(100%);
      transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
      display: flex; flex-direction: column;
      padding: 1.25rem;
    }
    .ln-drawer.open { transform: translateX(0); }
    .ln-drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem; padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .ln-drawer-close {
      background: transparent; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 7px; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      color: #7a90b0; cursor: pointer; font-size: 1rem;
      transition: all 0.15s;
    }
    .ln-drawer-close:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .ln-drawer-links {
      display: flex; flex-direction: column; gap: 0.25rem; flex: 1;
    }
    .ln-drawer-links a {
      display: flex; align-items: center;
      padding: 0.75rem 0.875rem; border-radius: 9px;
      color: #c0cce0; font-size: 0.92rem; font-weight: 500;
      text-decoration: none; transition: all 0.14s;
      border: 1px solid transparent;
    }
    .ln-drawer-links a:hover {
      background: rgba(59,130,246,0.08);
      border-color: rgba(59,130,246,0.2);
      color: #60a5fa;
    }
    .ln-drawer-btns {
      display: flex; flex-direction: column; gap: 0.625rem;
      padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.07);
    }
    .ln-drawer-btns button {
      width: 100%; padding: 0.7rem; border-radius: 9px;
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      font-family: 'Inter', sans-serif; transition: all 0.15s;
    }

    /* ── Mobile responsive ── */
    @media (max-width: 768px) {
      .ln-nav-links { display: none; }
      .ln-nav-btns  { display: none; }
      .ln-hamburger { display: flex; }
      .ln-nav { padding: 0 1rem; }
      .ln-hero {
        grid-template-columns: 1fr;
        padding: 100px 1.25rem 50px;
        gap: 2rem;
      }
      .ln-h1 { font-size: clamp(1.8rem, 7vw, 3rem); }
      .ln-subtext { font-size: 0.95rem; max-width: 100%; }
      .ln-hero-btns { flex-direction: column; gap: 0.625rem; }
      .ln-cta-primary, .ln-cta-secondary { width: 100%; justify-content: center; }
      .ln-mock { display: none; }
      .ln-section-title { font-size: clamp(1.4rem, 5vw, 1.9rem); }
      .ln-section-sub { font-size: 0.9rem; }
      .ln-pricing-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
      .ln-testi-grid { grid-template-columns: 1fr !important; }
      .ln-analytics-cards { grid-template-columns: repeat(2,1fr) !important; }
      .ln-strategy-grid { grid-template-columns: 1fr !important; }
      .ln-psych-grid { grid-template-columns: 1fr !important; }
      .ln-footer { flex-direction: column; gap: 1rem; text-align: center; }
      .ln-footer-links { justify-content: center; flex-wrap: wrap; }
    }
    @media (max-width: 480px) {
      .ln-analytics-cards { grid-template-columns: 1fr !important; }
    }
  </style>

  <div class="land">
    <div class="ln-bg-grid"></div>

    <!-- Mobile drawer overlay -->
    <div class="ln-drawer-overlay" id="ln-drawer-overlay"></div>

    <!-- Mobile drawer -->
    <div class="ln-drawer" id="ln-drawer">
      <div class="ln-drawer-header">
        <a class="ln-logo" href="#">
          <div class="ln-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <span class="ln-logo-text">TradeLog</span>
        </a>
        <button class="ln-drawer-close" id="ln-drawer-close">✕</button>
      </div>
      <div class="ln-drawer-links">
        <a href="#ln-features" class="ln-drawer-link">📊 Features</a>
        <a href="#ln-pricing"  class="ln-drawer-link">💳 Pricing</a>
        <a href="#ln-faq"      class="ln-drawer-link">❓ FAQ</a>
      </div>
      <div class="ln-drawer-btns">
        <button class="ln-btn-ghost" id="drawer-login" style="width:100%">Sign in</button>
        <button class="ln-btn-solid" id="drawer-signup" style="width:100%">Get Started →</button>
      </div>
    </div>

    <!-- NAV -->
    <nav class="ln-nav">
      <a class="ln-logo" href="#">
        <div class="ln-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
          </svg>
        </div>
        <span class="ln-logo-text">TradeLog</span>
      </a>
      <div class="ln-nav-links">
        <a href="#ln-features">Features</a>
        <a href="#ln-pricing">Pricing</a>
        <a href="#ln-faq">FAQ</a>
      </div>
      <div class="ln-nav-btns">
        <button class="ln-btn-ghost" id="nav-login">Sign in</button>
        <button class="ln-btn-solid" id="nav-signup">Get Started</button>
      </div>
      <!-- Hamburger — visible on mobile only -->
      <button class="ln-hamburger" id="ln-hamburger" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <!-- HERO -->
    <section class="ln-hero" style="position:relative;z-index:1">
      <div>
        <div class="ln-badge ln-fadeup">
          <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse 2s infinite"></span>
          Built for NIFTY, BANKNIFTY & F&O Traders
        </div>
        <h1 class="ln-h1 ln-fadeup ln-fadeup-1">
          Become a<br>
          <span class="grad">Consistently Profitable</span><br>
          Options Trader
        </h1>
        <p class="ln-subtext ln-fadeup ln-fadeup-2">
          Track trades, analyse strategies, control risk, and master your trading psychology — all in one powerful journal built for Indian options markets.
        </p>
        <div class="ln-hero-btns ln-fadeup ln-fadeup-3">
          <button class="ln-cta-primary" id="hero-trial">
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button class="ln-cta-secondary" id="hero-pricing">
            View Pricing
          </button>
        </div>
        <div class="ln-fadeup ln-fadeup-4" style="margin-top:2rem;display:flex;gap:2rem;flex-wrap:wrap">
          ${[['2000+','Active traders'],['₹50Cr+','P&L tracked'],['4.9★','User rating']].map(([v,l])=>`
            <div>
              <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.25rem;color:#fff">${v}</div>
              <div style="font-size:0.72rem;color:#3a4f6a;margin-top:2px">${l}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Mock Dashboard -->
      <div class="ln-mock ln-fadeup ln-fadeup-2">
        <div class="ln-mock-bar">
          <div class="ln-mock-dot" style="background:#ef4444"></div>
          <div class="ln-mock-dot" style="background:#eab308"></div>
          <div class="ln-mock-dot" style="background:#22c55e"></div>
          <span style="font-size:0.65rem;color:#3a4f6a;margin-left:0.5rem">TradeLog — Dashboard</span>
        </div>
        <div class="ln-mock-body">
          <div class="ln-mock-stats">
            <div class="ln-ms"><div class="ln-ms-label">Today P&L</div><div class="ln-ms-val" style="color:#22c55e">+₹12,450</div></div>
            <div class="ln-ms"><div class="ln-ms-label">Win Rate</div><div class="ln-ms-val" style="color:#60a5fa">68%</div></div>
            <div class="ln-ms"><div class="ln-ms-label">Net P&L</div><div class="ln-ms-val" style="color:#22c55e">+₹2.4L</div></div>
            <div class="ln-ms"><div class="ln-ms-label">Trades</div><div class="ln-ms-val" style="color:#e8eeff">142</div></div>
          </div>
          <div class="ln-mock-chart">
            <div class="ln-mock-chart-label">Equity Curve — 2024</div>
            <svg class="ln-chart-svg" viewBox="0 0 300 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,55 L20,50 L40,48 L60,42 L80,38 L100,35 L110,40 L130,32 L150,28 L170,22 L185,26 L200,18 L220,14 L240,10 L260,8 L280,5 L300,3" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
              <path d="M0,55 L20,50 L40,48 L60,42 L80,38 L100,35 L110,40 L130,32 L150,28 L170,22 L185,26 L200,18 L220,14 L240,10 L260,8 L280,5 L300,3 L300,60 L0,60Z" fill="url(#cg)"/>
            </svg>
          </div>
          <div class="ln-mock-trades">
            ${[
              ['NIFTY24DEC24000CE','BUY','CE','#22c55e','+₹4,500'],
              ['BANKNIFTY24DEC47000PE','SELL','PE','#ef4444','-₹1,200'],
              ['NIFTY24DEC23800PE','BUY','PE','#22c55e','+₹3,750'],
            ].map(([sym,type,opt,col,pnl])=>`
              <div class="ln-mt">
                <div style="display:flex;align-items:center;gap:0.5rem">
                  <span class="ln-mt-sym">${sym}</span>
                  <span class="ln-mt-type" style="background:${type==='BUY'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)'};color:${type==='BUY'?'#22c55e':'#ef4444'}">${type}</span>
                  <span class="ln-mt-type" style="background:rgba(59,130,246,0.12);color:#60a5fa">${opt}</span>
                </div>
                <span style="font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:${col};font-weight:600">${pnl}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- FEATURES -->
    <section class="ln-section" id="ln-features">
      <div class="ln-section-label">Features</div>
      <h2 class="ln-section-title">Everything you need to<br>trade like a professional</h2>
      <p class="ln-section-sub">Designed specifically for Indian options traders — not generic tools repurposed for F&O.</p>
      <div class="ln-features-grid">
        ${[
          ['📒','Trade Book','Log every NIFTY, BANKNIFTY & F&O trade. Auto-calculate P&L, charges, and net returns per trade.',['rgba(59,130,246,0.15)','rgba(59,130,246,0.08)']],
          ['📊','Strategy Analytics','See which strategies — Iron Condor, Straddle, Scalp — actually make you money and which drain your capital.',['rgba(34,197,94,0.15)','rgba(34,197,94,0.08)']],
          ['🧠','Psychology Tracking','Track emotions before and after each trade. Detect revenge trading, FOMO entries, and overtrading patterns.',['rgba(168,85,247,0.15)','rgba(168,85,247,0.08)']],
          ['🛡️','Risk Management','Set capital limits, daily loss caps, and position sizing rules. Get alerted before you break your own rules.',['rgba(239,68,68,0.15)','rgba(239,68,68,0.08)']],
          ['🔍','Mistake Detection','Auto-tag common mistakes: no stop loss, late entry, oversized position. Learn from patterns across hundreds of trades.',['rgba(234,179,8,0.15)','rgba(234,179,8,0.08)']],
          ['🔗','Broker Sync','Sync trades directly from Dhan API. No manual entry for broker trades — just connect and analyse.',['rgba(99,102,241,0.15)','rgba(99,102,241,0.08)']],
          ['📈','Performance Dashboard','Daily P&L, equity curve, win rate, streak tracking, and drawdown analysis — your entire trading career in one view.',['rgba(59,130,246,0.15)','rgba(59,130,246,0.08)']],
          ['🎯','Option Strategy Tracker','Track strategies like Straddle, Strangle, Iron Condor, Bull Call Spread — with legs, Greeks, and P&L attribution.',['rgba(168,85,247,0.15)','rgba(168,85,247,0.08)']],
        ].map(([icon,title,desc,[ibg]])=>`
          <div class="ln-feat-card">
            <div class="ln-feat-icon" style="background:${ibg}">${icon}</div>
            <div class="ln-feat-title">${title}</div>
            <div class="ln-feat-desc">${desc}</div>
          </div>`).join('')}
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- ANALYTICS PREVIEW -->
    <section class="ln-section">
      <div class="ln-section-label">Analytics</div>
      <h2 class="ln-section-title">Data-driven decisions,<br>not gut feelings</h2>
      <div class="ln-analytics-wrap">
        <div class="ln-analytics-header">
          <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem;color:#e8eeff">Performance Overview — FY 2024-25</div>
          <div style="font-size:0.72rem;color:#3a4f6a">Jan 2024 – Dec 2024</div>
        </div>
        <div class="ln-analytics-body">
          <div class="ln-analytics-cards">
            ${[
              ['Daily P&L','₹12,450','+₹3,200 vs yesterday','#22c55e'],
              ['Win Rate','67.4%','↑ 4.2% this month','#60a5fa'],
              ['Best Strategy','Iron Condor','₹89,200 total P&L','#a78bfa'],
              ['Discipline Score','8.2/10','Followed plan 84%','#22c55e'],
            ].map(([l,v,s,c])=>`
              <div class="ln-ac">
                <div class="ln-ac-label">${l}</div>
                <div class="ln-ac-val" style="color:${c}">${v}</div>
                <div class="ln-ac-sub">${s}</div>
              </div>`).join('')}
          </div>
          <!-- Equity curve -->
          <div style="background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:1.25rem">
            <div style="font-size:0.72rem;color:#3a4f6a;margin-bottom:1rem;display:flex;justify-content:space-between">
              <span>Equity Curve</span>
              <span style="color:#22c55e;font-family:'JetBrains Mono',monospace">+₹2,45,600 YTD</span>
            </div>
            <svg width="100%" height="100" viewBox="0 0 800 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,90 C40,85 60,80 80,75 C120,65 140,68 160,60 C200,45 210,50 240,42 C280,32 300,35 330,28 C360,22 370,30 400,22 C440,14 460,18 490,12 C530,5 550,8 580,5 C620,2 650,6 680,4 C720,2 750,4 800,2"
                fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M0,90 C40,85 60,80 80,75 C120,65 140,68 160,60 C200,45 210,50 240,42 C280,32 300,35 330,28 C360,22 370,30 400,22 C440,14 460,18 490,12 C530,5 550,8 580,5 C620,2 650,6 680,4 C720,2 750,4 800,2 L800,100 L0,100Z"
                fill="url(#eg)"/>
              <!-- drawdown zone -->
              <path d="M200,45 C210,50 230,55 240,42" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3"/>
              <path d="M360,22 C370,30 385,35 400,22" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3"/>
            </svg>
            <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:#3a4f6a;margin-top:0.5rem">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- STRATEGY ANALYTICS -->
    <section class="ln-section">
      <div class="ln-section-label">Strategy Analysis</div>
      <h2 class="ln-section-title">Know which setups<br>actually work for you</h2>
      <div class="ln-strategy-grid">
        <div>
          <p class="ln-section-sub" style="margin-bottom:1.5rem">Stop trading blindly. TradeLog tracks your performance across every strategy type so you know exactly where your edge is.</p>
          <div class="ln-strat-list">
            ${[
              ['Opening Range Breakout','Trade the first 15-min range breakout on index options'],
              ['VWAP Bounce','Buy/sell when price bounces off VWAP with confirmation'],
              ['Liquidity Sweep','Capture moves after stop hunts at key levels'],
              ['Option Scalping','Quick 5–15 min trades capturing premium moves'],
            ].map(([n,d],i)=>`
              <div class="ln-strat-item ${i===0?'active':''}">
                <div class="ln-strat-name">${n}</div>
                <div class="ln-strat-desc">${d}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="ln-strat-table">
          <div class="ln-st-row ln-st-header">
            <div class="ln-st-cell">Strategy</div>
            <div class="ln-st-cell">Win %</div>
            <div class="ln-st-cell">Avg P&L</div>
            <div class="ln-st-cell">Trades</div>
          </div>
          <div class="ln-st-body">
            ${[
              ['Iron Condor','72%','+₹4,200','34'],
              ['ORB Breakout','61%','+₹2,800','58'],
              ['VWAP Bounce','58%','+₹1,950','41'],
              ['Scalping','54%','+₹890','112'],
              ['Straddle','48%','-₹320','22'],
              ['Liquidity Sweep','65%','+₹3,100','29'],
            ].map(([s,w,p,t])=>`
              <div class="ln-st-row">
                <div class="ln-st-cell" style="color:#c0cce0;font-weight:500">${s}</div>
                <div class="ln-st-cell" style="color:${parseFloat(w)>55?'#22c55e':'#ef4444'};font-family:'JetBrains Mono',monospace;font-weight:600">${w}</div>
                <div class="ln-st-cell" style="color:${p.startsWith('+')?'#22c55e':'#ef4444'};font-family:'JetBrains Mono',monospace">${p}</div>
                <div class="ln-st-cell" style="color:#7a90b0">${t}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- PSYCHOLOGY -->
    <section class="ln-section">
      <div class="ln-section-label">Psychology</div>
      <h2 class="ln-section-title">Your biggest edge is<br>mental discipline</h2>
      <p class="ln-section-sub" style="margin-bottom:0">80% of trading losses come from psychological mistakes, not wrong analysis. TradeLog makes them visible.</p>
      <div class="ln-psych-grid">
        ${[
          ['😌','Emotion Tracking','Log how you feel before and after every trade. Discover if you trade better calm, confident, or fearful — and make decisions accordingly.'],
          ['🚨','Mistake Detection','Automatically tag trades where you skipped stop loss, entered on FOMO, or sized too large. See patterns before they destroy your account.'],
          ['😡','Revenge Trading Detection','Get flagged when you enter trades too quickly after a loss. Revenge trading is identified by pattern, not self-reporting.'],
          ['📉','Overtrading Alerts','Track how discipline score and win rate change as trade count increases in a session. Stop before you give back profits.'],
        ].map(([i,t,d])=>`
          <div class="ln-psych-card">
            <div class="ln-psych-icon">${i}</div>
            <div class="ln-psych-title">${t}</div>
            <div class="ln-psych-desc">${d}</div>
          </div>`).join('')}
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- PRICING -->
    <section class="ln-section" id="ln-pricing">
      <div class="ln-section-label">Pricing</div>
      <h2 class="ln-section-title">Simple, transparent pricing</h2>
      <p class="ln-section-sub">Start free, upgrade when you're ready. Cancel anytime.</p>
      <div class="ln-pricing-grid">
        <!-- Starter -->
        <div class="ln-plan">
          <div class="ln-plan-name">Starter</div>
          <div class="ln-plan-price">₹199<span>/mo</span></div>
          <div class="ln-plan-per">Billed monthly · No setup fee</div>
          <div class="ln-plan-sep"></div>
          <div class="ln-plan-features">
            ${['Trade journal (unlimited)','Basic analytics dashboard','Psychology tracking','Risk management tools','CSV import (all brokers)','Email support'].map(f=>`
              <div class="ln-plan-feat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ${f}
              </div>`).join('')}
          </div>
          <button class="ln-plan-btn ln-plan-btn-ghost" data-plan="starter">Start Starter Plan</button>
        </div>
        <!-- Pro -->
        <div class="ln-plan ln-plan-pro">
          <div class="ln-plan-badge">MOST POPULAR</div>
          <div class="ln-plan-name" style="color:#60a5fa">Pro Trader</div>
          <div class="ln-plan-price">₹699<span>/mo</span></div>
          <div class="ln-plan-per">Billed monthly · 14-day free trial</div>
          <div class="ln-plan-sep"></div>
          <div class="ln-plan-features">
            ${['Everything in Starter','Advanced strategy analytics','Strategy performance tracking','Dhan broker auto sync','AI trade insights & patterns','Priority support + Discord'].map(f=>`
              <div class="ln-plan-feat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ${f}
              </div>`).join('')}
          </div>
          <button class="ln-plan-btn ln-plan-btn-solid" data-plan="pro">Start Pro Plan →</button>
        </div>
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- TESTIMONIALS -->
    <section class="ln-section">
      <div class="ln-section-label">Testimonials</div>
      <h2 class="ln-section-title">Trusted by Indian options traders</h2>
      <div class="ln-testi-grid">
        ${[
          [
            'Arjun M.','Options Scalper, Mumbai','AM','linear-gradient(135deg,#3b82f6,#1d4ed8)',
            'I was profitable some days and losing on others with no idea why. TradeLog showed me I had a 74% win rate on ORB trades but was destroying profits with FOMO entries after 2PM. Game changer.'
          ],[
            'Priya S.','Swing Trader, Bangalore','PS','linear-gradient(135deg,#a855f7,#7c3aed)',
            'The psychology tracking is unreal. I discovered I trade completely differently when I\'m overconfident — win rate drops from 65% to 31%. Now I size down automatically on those days.'
          ],[
            'Rahul K.','BankNifty Trader, Hyderabad','RK','linear-gradient(135deg,#22c55e,#16a34a)',
            'Dhan broker sync means my trades just appear. No manual entry. The strategy analytics showed Iron Condor is my best setup — I had no idea. Up ₹3.2L since switching focus.'
          ],
        ].map(([n,r,init,bg,q])=>`
          <div class="ln-testi">
            <div class="ln-stars">★★★★★</div>
            <p class="ln-testi-quote">"${q}"</p>
            <div class="ln-testi-author">
              <div class="ln-testi-avatar" style="background:${bg}">${init}</div>
              <div>
                <div class="ln-testi-name">${n}</div>
                <div class="ln-testi-role">${r}</div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </section>

    <div class="ln-divider"></div>

    <!-- FAQ -->
    <section class="ln-section" id="ln-faq">
      <div class="ln-section-label">FAQ</div>
      <h2 class="ln-section-title">Questions answered</h2>
      <div class="ln-faq">
        ${[
          ['Is TradeLog connected to brokers directly?','Yes — the Pro plan includes Dhan API sync that automatically imports your F&O trades. We only read trade data; we cannot place orders or access your funds.'],
          ['Can beginners use this?','Absolutely. The Starter plan is perfect for new traders who want to understand their patterns. Just log trades manually or upload your broker CSV — no API setup needed.'],
          ['Is my trade data secure?','Your data is encrypted in transit and at rest. We never share your data with third parties. You can export or delete all your data at any time from the profile page.'],
          ['Which brokers are supported for CSV import?','Zerodha, Dhan, Upstox, Angel One, Fyers, Groww, 5Paisa, ICICI Direct, HDFC Securities, Kotak, AliceBlue, Sharekhan, and more. Most CSVs are auto-detected.'],
          ['What is the 14-day free trial?','The Pro plan comes with a full 14-day free trial. No credit card required to start. You\'ll only be charged after the trial ends if you choose to continue.'],
          ['Can I cancel anytime?','Yes. No lock-in. Cancel from your profile page and you\'ll keep access until the end of your billing period. No questions asked.'],
        ].map(([q,a])=>`
          <div class="ln-faq-item">
            <div class="ln-faq-q">
              <span>${q}</span>
              <svg class="ln-faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div class="ln-faq-a">${a}</div>
          </div>`).join('')}
      </div>
    </section>

    <!-- FINAL CTA -->
    <div style="padding:0 2rem 2rem;position:relative;z-index:1">
      <div class="ln-final">
        <h2 class="ln-final-title">Stop Guessing.<br>Start Trading with Data.</h2>
        <p class="ln-final-sub">Join 10,000+ Indian options traders who journal with TradeLog.</p>
        <button class="ln-cta-primary" id="final-cta" style="font-size:1rem;padding:0.875rem 2.5rem">
          Get Started →
        </button>
        <div style="margin-top:1.25rem;font-size:0.78rem;color:#3a4f6a">No credit card required · Cancel anytime</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="ln-footer" style="border-top:1px solid rgba(255,255,255,0.05);padding:1.5rem 2rem">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <div class="ln-logo-icon" style="width:24px;height:24px;border-radius:5px">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          </svg>
        </div>
        <span style="font-weight:700;font-size:0.85rem;color:#fff">TradeLog</span>
        <span style="font-size:0.72rem;color:#3a4f6a;margin-left:0.5rem">© 2025 · All rights reserved</span>
      </div>
      <div style="display:flex;gap:1.5rem">
        <a href="#" id="footer-privacy" style="font-size:0.75rem;color:#3a4f6a;text-decoration:none;transition:color 0.15s" onmouseover="this.style.color='#7a90b0'" onmouseout="this.style.color='#3a4f6a'">Privacy Policy</a>
        <a href="#" id="footer-terms"   style="font-size:0.75rem;color:#3a4f6a;text-decoration:none;transition:color 0.15s" onmouseover="this.style.color='#7a90b0'" onmouseout="this.style.color='#3a4f6a'">Terms of Service</a>
        <a href="#" id="footer-contact" style="font-size:0.75rem;color:#3a4f6a;text-decoration:none;transition:color 0.15s" onmouseover="this.style.color='#7a90b0'" onmouseout="this.style.color='#3a4f6a'">Contact Us</a>
      </div>
    </div>

    <!-- ── Privacy Policy Modal ── -->
    <div id="ln-privacy-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:1000;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px)">
      <div style="background:#0d1524;border:1px solid #1e2d45;border-radius:16px;width:100%;max-width:620px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.5rem;border-bottom:1px solid #1e2d45;flex-shrink:0">
          <div style="font-weight:700;font-size:1rem;color:#e8eeff">🔒 Privacy Policy</div>
          <button class="ln-modal-close" data-modal="ln-privacy-modal" style="background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem;line-height:1;padding:0.2rem">✕</button>
        </div>
        <div style="padding:1.5rem;overflow-y:auto;font-size:0.82rem;color:#7a90b0;line-height:1.8">
          <p style="font-size:0.7rem;color:#3a4f6a;margin-bottom:1.25rem">Last updated: January 2025</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">1. Information We Collect</h3>
          <p style="margin-bottom:1rem">We collect your name, email address, and trade data you enter into TradeLog. If you connect a broker API (Dhan), we temporarily access trade records to import them — we never store your API credentials or access tokens.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">2. How We Use Your Data</h3>
          <p style="margin-bottom:1rem">Your data is used solely to provide the TradeLog service — displaying your trades, computing analytics, and generating psychology insights. We do not use your data for advertising and never sell it to third parties under any circumstances.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">3. Data Storage & Security</h3>
          <p style="margin-bottom:1rem">Your data is stored on secure servers with encryption in transit (HTTPS/TLS) and at rest. We use industry-standard security practices. Passwords are hashed using bcrypt and are never stored in plain text.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">4. Data Deletion</h3>
          <p style="margin-bottom:1rem">You can permanently delete your account and all associated trade data at any time from Profile → Privacy settings. Deletion is immediate and irreversible.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">5. Cookies</h3>
          <p style="margin-bottom:1rem">We use only functional storage (JWT token in localStorage) necessary to keep you logged in. We do not use tracking or advertising cookies.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">6. Third-Party Services</h3>
          <p style="margin-bottom:1rem">We use Google Sign-In (optional) and Razorpay for payments. These services have their own privacy policies. We share only the minimum data required for these integrations.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">7. Contact</h3>
          <p>For privacy-related questions or data requests, email us at <span style="color:#60a5fa">support@tradelog.in</span>.</p>
        </div>
        <div style="padding:1rem 1.5rem;border-top:1px solid #1e2d45;flex-shrink:0">
          <button class="ln-modal-close" data-modal="ln-privacy-modal" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #1e2d45;background:transparent;color:#7a90b0;cursor:pointer;font-size:0.85rem;font-family:inherit">Close</button>
        </div>
      </div>
    </div>

    <!-- ── Terms of Service Modal ── -->
    <div id="ln-terms-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:1000;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px)">
      <div style="background:#0d1524;border:1px solid #1e2d45;border-radius:16px;width:100%;max-width:620px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.5rem;border-bottom:1px solid #1e2d45;flex-shrink:0">
          <div style="font-weight:700;font-size:1rem;color:#e8eeff">📄 Terms of Service</div>
          <button class="ln-modal-close" data-modal="ln-terms-modal" style="background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem;line-height:1;padding:0.2rem">✕</button>
        </div>
        <div style="padding:1.5rem;overflow-y:auto;font-size:0.82rem;color:#7a90b0;line-height:1.8">
          <p style="font-size:0.7rem;color:#3a4f6a;margin-bottom:1.25rem">Last updated: January 2025</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">1. Acceptance of Terms</h3>
          <p style="margin-bottom:1rem">By creating a TradeLog account, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service. You must be at least 18 years old to use TradeLog.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">2. Use of Service</h3>
          <p style="margin-bottom:1rem">TradeLog is a personal trading journal and analytics tool for individual use. You agree to use the service only for lawful purposes. You may not share your account or use the platform to store data that violates any applicable law.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">3. Not Financial Advice</h3>
          <p style="margin-bottom:1rem">TradeLog is a journaling and analytics tool only. Nothing on the platform constitutes financial, investment, or trading advice. Past performance shown in your journal does not guarantee future results. Always consult a qualified financial advisor before making trading decisions.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">4. Account Responsibility</h3>
          <p style="margin-bottom:1rem">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use. TradeLog is not liable for losses resulting from unauthorised account access.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">5. Subscription & Payments</h3>
          <p style="margin-bottom:1rem">Paid plans are billed monthly via Razorpay. You may cancel at any time — access continues until the end of the current billing period. Refunds are not provided for partial months. We reserve the right to change prices with 30 days' notice.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">6. Termination</h3>
          <p style="margin-bottom:1rem">We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Profile settings.</p>
          <h3 style="color:#c0cce0;font-size:0.875rem;margin-bottom:0.5rem">7. Limitation of Liability</h3>
          <p>TradeLog and its operators shall not be liable for any indirect, incidental, or consequential damages arising from use of the service. Our maximum liability shall not exceed the amount you paid in the last 30 days.</p>
        </div>
        <div style="padding:1rem 1.5rem;border-top:1px solid #1e2d45;flex-shrink:0">
          <button class="ln-modal-close" data-modal="ln-terms-modal" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #1e2d45;background:transparent;color:#7a90b0;cursor:pointer;font-size:0.85rem;font-family:inherit">Close</button>
        </div>
      </div>
    </div>

    <!-- ── Contact Modal ── -->
    <div id="ln-contact-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:1000;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(6px)">
      <div style="background:#0d1524;border:1px solid #1e2d45;border-radius:16px;width:100%;max-width:480px;display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.5rem;border-bottom:1px solid #1e2d45">
          <div style="font-weight:700;font-size:1rem;color:#e8eeff">✉️ Contact Us</div>
          <button class="ln-modal-close" data-modal="ln-contact-modal" style="background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem;line-height:1;padding:0.2rem">✕</button>
        </div>
        <div style="padding:1.5rem;font-size:0.82rem;color:#7a90b0;line-height:1.8">
          <p style="margin-bottom:1.5rem">We'd love to hear from you. Reach out for support, feedback, or partnership inquiries.</p>
          <div style="display:flex;flex-direction:column;gap:0.875rem">
            <div style="display:flex;align-items:center;gap:0.875rem;padding:0.875rem;background:#080c14;border:1px solid #1e2d45;border-radius:10px">
              <div style="width:36px;height:36px;border-radius:9px;background:rgba(59,130,246,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <div style="font-size:0.72rem;color:#3a4f6a;margin-bottom:2px">Email Support</div>
                <a href="mailto:support@tradelog.in" style="color:#60a5fa;text-decoration:none;font-size:0.85rem;font-weight:500">support@tradelog.in</a>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.875rem;padding:0.875rem;background:#080c14;border:1px solid #1e2d45;border-radius:10px">
              <div style="width:36px;height:36px;border-radius:9px;background:rgba(168,85,247,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div>
                <div style="font-size:0.72rem;color:#3a4f6a;margin-bottom:2px">Discord Community</div>
                <a href="#" style="color:#c084fc;text-decoration:none;font-size:0.85rem;font-weight:500">Join our Discord →</a>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.875rem;padding:0.875rem;background:#080c14;border:1px solid #1e2d45;border-radius:10px">
              <div style="width:36px;height:36px;border-radius:9px;background:rgba(34,197,94,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div style="font-size:0.72rem;color:#3a4f6a;margin-bottom:2px">Response Time</div>
                <span style="color:#c0cce0;font-size:0.85rem">Within 24 hours on business days</span>
              </div>
            </div>
          </div>
        </div>
        <div style="padding:1rem 1.5rem;border-top:1px solid #1e2d45">
          <button class="ln-modal-close" data-modal="ln-contact-modal" style="width:100%;padding:0.65rem;border-radius:8px;border:1px solid #1e2d45;background:transparent;color:#7a90b0;cursor:pointer;font-size:0.85rem;font-family:inherit">Close</button>
        </div>
      </div>
    </div>
  </div>
  `;

  // Nav smooth scroll
  container.querySelectorAll('a[href^="#ln-"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = container.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Hamburger / mobile drawer ─────────────────────────────────────────────
  const hamburger     = container.querySelector('#ln-hamburger');
  const drawer        = container.querySelector('#ln-drawer');
  const drawerOverlay = container.querySelector('#ln-drawer-overlay');

  const openDrawer = () => {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
  container.querySelector('#ln-drawer-close').addEventListener('click', closeDrawer);

  // Close drawer and navigate on drawer link clicks
  container.querySelectorAll('.ln-drawer-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      closeDrawer();
      const target = container.querySelector(link.getAttribute('href'));
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    });
  });

  container.querySelector('#drawer-login').addEventListener('click', () => { closeDrawer(); navigate('#login'); });
  container.querySelector('#drawer-signup').addEventListener('click', () => { closeDrawer(); navigate('#signup'); });

  // ── CTA buttons ───────────────────────────────────────────────────────────
  const goSignup  = () => navigate('#signup');
  const goPricing = () => navigate('#pricing');
  container.querySelector('#nav-login').addEventListener('click', () => navigate('#login'));
  container.querySelector('#nav-signup').addEventListener('click', goSignup);
  container.querySelector('#hero-trial').addEventListener('click', goSignup);
  container.querySelector('#hero-pricing').addEventListener('click', () => {
    const target = container.querySelector('#ln-pricing');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  container.querySelector('#final-cta').addEventListener('click', goSignup);

  // ── Footer modals ─────────────────────────────────────────────────────────
  const openModal  = (id) => { const m = container.querySelector(`#${id}`); if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; } };
  const closeAllModals = () => { ['ln-privacy-modal','ln-terms-modal','ln-contact-modal'].forEach(id => { const m = container.querySelector(`#${id}`); if (m) m.style.display = 'none'; }); document.body.style.overflow = ''; };

  container.querySelector('#footer-privacy').addEventListener('click', e => { e.preventDefault(); openModal('ln-privacy-modal'); });
  container.querySelector('#footer-terms').addEventListener('click',   e => { e.preventDefault(); openModal('ln-terms-modal'); });
  container.querySelector('#footer-contact').addEventListener('click', e => { e.preventDefault(); openModal('ln-contact-modal'); });

  container.querySelectorAll('.ln-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  ['ln-privacy-modal','ln-terms-modal','ln-contact-modal'].forEach(id => {
    const m = container.querySelector(`#${id}`);
    if (m) m.addEventListener('click', e => { if (e.target === m) closeAllModals(); });
  });

  // Pricing plan buttons
  container.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('selectedPlan', btn.dataset.plan);
      navigate('#signup');
    });
  });

  // FAQ accordion
  container.querySelectorAll('.ln-faq-item').forEach(item => {
    item.querySelector('.ln-faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      container.querySelectorAll('.ln-faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Strategy table hover
  container.querySelectorAll('.ln-strat-item').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelectorAll('.ln-strat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}