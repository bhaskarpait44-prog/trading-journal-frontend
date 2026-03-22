import { api }    from '../lib/api.js';
import { fmtINR } from '../lib/utils.js';

export async function renderCalendar(container) {
  // Current view state
  let viewYear  = new Date().getFullYear();
  let viewMonth = new Date().getMonth(); // 0-indexed
  let allData   = {};  // keyed by YYYY-MM-DD

  container.innerHTML = `
  <style>
    .cal-wrap {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 1100px;
      padding-bottom: 2rem;
    }

    /* ── Header ── */
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .cal-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .cal-nav-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: 1px solid #1e2d45;
      background: #0a1220;
      color: #7a90b0;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem;
      transition: all 0.15s;
      font-family: inherit;
    }
    .cal-nav-btn:hover { border-color: #3b82f6; color: #60a5fa; background: rgba(59,130,246,0.08); }
    .cal-month-label {
      font-size: 1.1rem;
      font-weight: 800;
      color: #e8eeff;
      min-width: 160px;
      text-align: center;
      letter-spacing: -0.02em;
    }
    .cal-today-btn {
      padding: 0.3rem 0.875rem;
      border-radius: 6px;
      border: 1px solid #1e2d45;
      background: transparent;
      color: #7a90b0;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .cal-today-btn:hover { border-color: #3b82f6; color: #60a5fa; }

    /* ── Stats strip ── */
    .cal-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    @media (min-width: 480px) { .cal-stats { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 800px) { .cal-stats { grid-template-columns: repeat(7, 1fr); } }

    .cal-stat {
      background: #0a1220;
      border: 1px solid #1e2d45;
      border-radius: 10px;
      padding: 0.7rem 0.875rem;
      transition: border-color 0.15s;
    }
    .cal-stat:hover { border-color: #2a3f5a; }
    .cal-stat-label {
      font-size: 0.6rem;
      color: #3a4f6a;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.3rem;
    }
    .cal-stat-value {
      font-size: 0.95rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }

    /* ── Calendar grid ── */
    .cal-card {
      background: #0a1220;
      border: 1px solid #1e2d45;
      border-radius: 14px;
      padding: 1rem;
      overflow: hidden;
    }
    .cal-dow-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 0.4rem;
    }
    .cal-dow {
      text-align: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: #2a3f5a;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.3rem 0;
    }
    .cal-dow.weekend { color: #3a4f6a; }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
    }
    .cal-cell {
      aspect-ratio: 1;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 4px 5px 3px;
      cursor: default;
      position: relative;
      transition: transform 0.1s, border-color 0.1s;
      min-height: 52px;
      border: 1px solid transparent;
      overflow: hidden;
    }
    @media (min-width: 640px) { .cal-cell { min-height: 68px; padding: 6px 7px 5px; } }

    .cal-cell.empty {
      background: transparent;
      border-color: transparent;
      cursor: default;
    }
    .cal-cell.no-trade {
      background: #080c14;
      border-color: #111827;
    }
    .cal-cell.today {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 1px rgba(59,130,246,0.3);
    }
    .cal-cell.has-trade {
      cursor: pointer;
    }
    .cal-cell.has-trade:hover {
      transform: scale(1.04);
      z-index: 2;
      border-color: rgba(255,255,255,0.15) !important;
    }
    /* P&L intensity colors */
    .cal-cell.win-1  { background: rgba(34,197,94,0.10); border-color: rgba(34,197,94,0.15); }
    .cal-cell.win-2  { background: rgba(34,197,94,0.20); border-color: rgba(34,197,94,0.25); }
    .cal-cell.win-3  { background: rgba(34,197,94,0.35); border-color: rgba(34,197,94,0.40); }
    .cal-cell.win-4  { background: rgba(34,197,94,0.55); border-color: rgba(34,197,94,0.60); }
    .cal-cell.win-5  { background: rgba(34,197,94,0.75); border-color: rgba(34,197,94,0.80); }
    .cal-cell.loss-1 { background: rgba(239,68,68,0.10); border-color: rgba(239,68,68,0.15); }
    .cal-cell.loss-2 { background: rgba(239,68,68,0.20); border-color: rgba(239,68,68,0.25); }
    .cal-cell.loss-3 { background: rgba(239,68,68,0.35); border-color: rgba(239,68,68,0.40); }
    .cal-cell.loss-4 { background: rgba(239,68,68,0.55); border-color: rgba(239,68,68,0.60); }
    .cal-cell.loss-5 { background: rgba(239,68,68,0.75); border-color: rgba(239,68,68,0.80); }

    .cal-day-num {
      font-size: 0.65rem;
      font-weight: 700;
      position: absolute;
      top: 4px; left: 5px;
      opacity: 0.5;
      line-height: 1;
    }
    .cal-cell.no-trade .cal-day-num { opacity: 0.2; color: #3a4f6a; }
    .cal-cell.win-1 .cal-day-num,
    .cal-cell.win-2 .cal-day-num,
    .cal-cell.win-3 .cal-day-num  { color: #22c55e; }
    .cal-cell.win-4 .cal-day-num,
    .cal-cell.win-5 .cal-day-num  { color: #dcfce7; }
    .cal-cell.loss-1 .cal-day-num,
    .cal-cell.loss-2 .cal-day-num,
    .cal-cell.loss-3 .cal-day-num { color: #ef4444; }
    .cal-cell.loss-4 .cal-day-num,
    .cal-cell.loss-5 .cal-day-num { color: #fee2e2; }

    .cal-pnl {
      font-size: 0.58rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.2;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cal-cell.win-1 .cal-pnl,
    .cal-cell.win-2 .cal-pnl,
    .cal-cell.win-3 .cal-pnl  { color: #4ade80; }
    .cal-cell.win-4 .cal-pnl,
    .cal-cell.win-5 .cal-pnl  { color: #dcfce7; }
    .cal-cell.loss-1 .cal-pnl,
    .cal-cell.loss-2 .cal-pnl,
    .cal-cell.loss-3 .cal-pnl { color: #f87171; }
    .cal-cell.loss-4 .cal-pnl,
    .cal-cell.loss-5 .cal-pnl { color: #fee2e2; }

    .cal-trade-count {
      font-size: 0.52rem;
      color: rgba(255,255,255,0.25);
      line-height: 1;
      margin-bottom: 1px;
    }
    @media (min-width: 640px) {
      .cal-pnl         { font-size: 0.65rem; }
      .cal-day-num     { font-size: 0.68rem; top: 5px; left: 6px; }
      .cal-trade-count { font-size: 0.58rem; }
    }

    /* ── Tooltip ── */
    .cal-tooltip {
      position: fixed;
      background: #0f1a2b;
      border: 1px solid #2a3f5a;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.78rem;
      color: #c0cce0;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.12s;
      min-width: 160px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    .cal-tooltip.visible { opacity: 1; }
    .cal-tooltip-date { font-size: 0.65rem; color: #3a4f6a; margin-bottom: 0.4rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .cal-tooltip-pnl  { font-size: 1.05rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-bottom: 0.3rem; }
    .cal-tooltip-row  { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.72rem; color: #7a90b0; margin-top: 2px; }
    .cal-tooltip-val  { color: #c0cce0; font-weight: 600; }

    /* ── Legend ── */
    .cal-legend {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .cal-legend-label { font-size: 0.65rem; color: #3a4f6a; }
    .cal-legend-swatch {
      width: 14px; height: 14px;
      border-radius: 3px;
    }

    /* ── DoW pattern bar ── */
    .cal-dow-pattern {
      background: #0a1220;
      border: 1px solid #1e2d45;
      border-radius: 14px;
      padding: 1rem 1.25rem;
    }
    .cal-dow-bars {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      align-items: end;
      height: 80px;
      margin-top: 0.75rem;
    }
    .cal-dow-bar-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      height: 100%;
      justify-content: flex-end;
    }
    .cal-dow-bar {
      width: 100%;
      border-radius: 4px 4px 0 0;
      min-height: 3px;
      transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cal-dow-bar-label {
      font-size: 0.65rem;
      color: #3a4f6a;
      font-weight: 600;
    }
    .cal-dow-bar-val {
      font-size: 0.6rem;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }

    /* ── Shimmer ── */
    .cal-skel {
      background: linear-gradient(90deg,#0d1524 25%,#111f30 50%,#0d1524 75%);
      background-size: 200% 100%;
      animation: cal-shimmer 1.4s infinite;
      border-radius: 8px;
    }
    @keyframes cal-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  </style>

  <div class="cal-wrap fade-up">

    <!-- Header -->
    <div class="cal-header">
      <div>
        <div style="font-size:1.1rem;font-weight:800;color:#e8eeff;display:flex;align-items:center;gap:0.5rem">
          📅 Trade Calendar
        </div>
        <div style="font-size:0.72rem;color:#3a4f6a;margin-top:2px">P&L heatmap · Green days · Red days · Patterns</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
        <button class="cal-today-btn" id="cal-today-btn">Today</button>
        <div class="cal-nav">
          <button class="cal-nav-btn" id="cal-prev">‹</button>
          <div class="cal-month-label" id="cal-month-label">— ——</div>
          <button class="cal-nav-btn" id="cal-next">›</button>
        </div>
      </div>
    </div>

    <!-- Stats strip (skeleton) -->
    <div class="cal-stats" id="cal-stats">
      ${Array(7).fill(0).map(()=>`
        <div class="cal-stat">
          <div class="cal-skel" style="width:60%;height:9px;margin-bottom:8px"></div>
          <div class="cal-skel" style="width:80%;height:16px"></div>
        </div>`).join('')}
    </div>

    <!-- Calendar -->
    <div class="cal-card">
      <div class="cal-dow-header">
        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>
          `<div class="cal-dow${i>=5?' weekend':''}">${d}</div>`).join('')}
      </div>
      <div class="cal-grid" id="cal-grid">
        ${Array(35).fill(0).map(()=>`<div class="cal-skel" style="min-height:52px;border-radius:8px"></div>`).join('')}
      </div>
    </div>

    <!-- Legend + DoW pattern row -->
    <div style="display:grid;grid-template-columns:1fr;gap:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;padding:0 0.25rem">
        <div class="cal-legend">
          <span class="cal-legend-label">Loss</span>
          ${[5,4,3,2,1].map(i=>`<div class="cal-legend-swatch" style="background:rgba(239,68,68,${0.1+i*0.13})"></div>`).join('')}
          <span class="cal-legend-label" style="margin:0 0.25rem">·</span>
          ${[1,2,3,4,5].map(i=>`<div class="cal-legend-swatch" style="background:rgba(34,197,94,${0.1+i*0.13})"></div>`).join('')}
          <span class="cal-legend-label">Profit</span>
        </div>
        <div style="font-size:0.65rem;color:#2a3f5a">No-trade days shown dark · Hover for details</div>
      </div>

      <!-- Day-of-week P&L pattern -->
      <div class="cal-dow-pattern" id="cal-dow-pattern">
        <div style="font-size:0.78rem;font-weight:700;color:#e8eeff;display:flex;align-items:center;gap:0.5rem">
          📊 Day-of-Week Pattern
          <span style="font-size:0.65rem;color:#3a4f6a;font-weight:400">avg P&L per day · all time</span>
        </div>
        <div class="cal-dow-bars" id="cal-dow-bars">
          ${['Mon','Tue','Wed','Thu','Fri'].map(()=>`
            <div class="cal-dow-bar-wrap">
              <div class="cal-skel" style="width:100%;height:40px;border-radius:4px"></div>
            </div>`).join('')}
        </div>
      </div>
    </div>

  </div>

  <!-- Floating tooltip -->
  <div class="cal-tooltip" id="cal-tooltip"></div>
  `;

  // ── Wire up controls ────────────────────────────────────────────────────────
  const tooltip = container.querySelector('#cal-tooltip') || document.querySelector('#cal-tooltip');

  container.querySelector('#cal-prev').addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderMonth();
  });
  container.querySelector('#cal-next').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderMonth();
  });
  container.querySelector('#cal-today-btn').addEventListener('click', () => {
    viewYear = new Date().getFullYear();
    viewMonth = new Date().getMonth();
    renderMonth();
  });

  // ── Load ALL data once (wide range: 2 years back) ──────────────────────────
  try {
    const from = new Date(); from.setFullYear(from.getFullYear() - 2); from.setDate(1);
    const res  = await api.get(`/analytics/pnl-chart?from=${from.toISOString().slice(0,10)}&to=${new Date().toISOString().slice(0,10)}&days=730`);
    (res.chartData || []).forEach(d => { allData[d.date] = d; });
    renderMonth();
    renderDowPattern();
  } catch (e) {
    console.error('Calendar error:', e);
    container.querySelector('#cal-grid').innerHTML =
      `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#3a4f6a;font-size:0.8rem">Failed to load calendar data</div>`;
  }

  // ── Render the current month ────────────────────────────────────────────────
  function renderMonth() {
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    container.querySelector('#cal-month-label').textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    const today     = new Date();
    const todayStr  = today.toISOString().slice(0,10);
    const firstDay  = new Date(viewYear, viewMonth, 1);
    const lastDay   = new Date(viewYear, viewMonth + 1, 0);
    // Monday-based: Mon=0 … Sun=6
    const startDow  = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    // Collect this month's data
    const monthData = {};
    for (let d = 1; d <= totalDays; d++) {
      const key = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      if (allData[key]) monthData[key] = allData[key];
    }

    // Stats for this month
    const tradingDays = Object.values(monthData);
    const winDays     = tradingDays.filter(d => d.pnl > 0);
    const lossDays    = tradingDays.filter(d => d.pnl < 0);
    const totalPnl    = tradingDays.reduce((s,d) => s + d.pnl, 0);
    const totalTrades = tradingDays.reduce((s,d) => s + d.trades, 0);
    const bestDay     = tradingDays.reduce((b,d) => d.pnl > (b?.pnl||0) ? d : b, null);
    const worstDay    = tradingDays.reduce((w,d) => d.pnl < (w?.pnl||Infinity) ? d : w, null);

    // Intensity scale: find max abs PnL for this month
    const maxAbs = Math.max(...tradingDays.map(d => Math.abs(d.pnl)), 1);
    function intensityClass(pnl) {
      if (!pnl) return '';
      const ratio = Math.abs(pnl) / maxAbs;
      const lvl   = ratio > 0.8 ? 5 : ratio > 0.6 ? 4 : ratio > 0.35 ? 3 : ratio > 0.15 ? 2 : 1;
      return pnl > 0 ? `win-${lvl}` : `loss-${lvl}`;
    }

    // Render stats strip
    const statsEl = container.querySelector('#cal-stats');
    const winRate = tradingDays.length ? Math.round((winDays.length / tradingDays.length) * 100) : 0;
    const statCards = [
      { label:'Month P&L',    value: fmtINR(totalPnl, true),      color: totalPnl >= 0 ? '#22c55e' : '#ef4444' },
      { label:'Trading Days', value: tradingDays.length,           color: '#60a5fa' },
      { label:'Win Days',     value: winDays.length,               color: '#22c55e' },
      { label:'Loss Days',    value: lossDays.length,              color: '#ef4444' },
      { label:'Win Rate',     value: `${winRate}%`,                color: winRate >= 55 ? '#22c55e' : winRate >= 40 ? '#eab308' : '#ef4444' },
      { label:'Best Day',     value: bestDay  ? fmtINR(bestDay.pnl,  true) : '—', color: '#22c55e' },
      { label:'Worst Day',    value: worstDay ? fmtINR(worstDay.pnl, true) : '—', color: '#ef4444' },
    ];
    statsEl.innerHTML = statCards.map(c => `
      <div class="cal-stat">
        <div class="cal-stat-label">${c.label}</div>
        <div class="cal-stat-value" style="color:${c.color}">${c.value}</div>
      </div>`).join('');

    // Build calendar grid
    const totalCells = Math.ceil((startDow + totalDays) / 7) * 7;
    let html = '';
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startDow + 1;
      if (dayNum < 1 || dayNum > totalDays) {
        html += `<div class="cal-cell empty"></div>`; continue;
      }
      const key      = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      const d        = allData[key];
      const isToday  = key === todayStr;
      const dow      = (i % 7); // 0=Mon, 6=Sun
      const isWeekend = dow >= 5;

      if (!d) {
        html += `<div class="cal-cell no-trade${isToday?' today':''}">
          <span class="cal-day-num" style="${isWeekend?'color:#1e2d45':''}">${dayNum}</span>
        </div>`;
        continue;
      }

      const cls     = intensityClass(d.pnl);
      const pnlFmt  = d.pnl >= 0
        ? `+${fmtINR(d.pnl)}`
        : `−${fmtINR(Math.abs(d.pnl))}`;

      html += `<div class="cal-cell has-trade ${cls}${isToday?' today':''}"
          data-date="${key}" data-pnl="${d.pnl}" data-trades="${d.trades}">
          <span class="cal-day-num">${dayNum}</span>
          <span class="cal-trade-count">${d.trades}T</span>
          <span class="cal-pnl">${pnlFmt}</span>
        </div>`;
    }

    const grid = container.querySelector('#cal-grid');
    grid.innerHTML = html;

    // Tooltip events
    grid.querySelectorAll('.cal-cell.has-trade').forEach(cell => {
      cell.addEventListener('mouseenter', e => showTooltip(e, cell));
      cell.addEventListener('mousemove',  e => positionTooltip(e));
      cell.addEventListener('mouseleave', ()  => hideTooltip());
    });
  }

  // ── Day-of-week pattern (all historical data) ──────────────────────────────
  function renderDowPattern() {
    const DOW_NAMES = ['Mon','Tue','Wed','Thu','Fri'];
    const byDow = {0:{pnl:0,days:0}, 1:{pnl:0,days:0}, 2:{pnl:0,days:0}, 3:{pnl:0,days:0}, 4:{pnl:0,days:0}};

    Object.entries(allData).forEach(([dateStr, d]) => {
      const dt  = new Date(dateStr);
      const dow = (dt.getDay() + 6) % 7; // 0=Mon
      if (dow <= 4) {
        byDow[dow].pnl  += d.pnl;
        byDow[dow].days += 1;
      }
    });

    const avgs    = [0,1,2,3,4].map(i => byDow[i].days > 0 ? byDow[i].pnl / byDow[i].days : 0);
    const maxAvg  = Math.max(...avgs.map(Math.abs), 1);

    const barsEl  = container.querySelector('#cal-dow-bars');
    barsEl.innerHTML = avgs.map((avg, i) => {
      const pct   = Math.abs(avg) / maxAvg * 100;
      const color = avg >= 0 ? '#22c55e' : '#ef4444';
      const label = avg >= 0 ? `+${fmtINR(avg)}` : `−${fmtINR(Math.abs(avg))}`;
      return `
        <div class="cal-dow-bar-wrap" title="${DOW_NAMES[i]}: avg ${label}/day">
          <div class="cal-dow-bar-val" style="color:${color};font-size:0.58rem">${label}</div>
          <div class="cal-dow-bar" style="background:${color};height:${Math.max(pct,3)}%;opacity:0.8"></div>
          <div class="cal-dow-bar-label">${DOW_NAMES[i]}</div>
        </div>`;
    }).join('');
  }

  // ── Tooltip helpers ─────────────────────────────────────────────────────────
  function showTooltip(e, cell) {
    const date   = cell.dataset.date;
    const pnl    = parseFloat(cell.dataset.pnl);
    const trades = parseInt(cell.dataset.trades);
    const dt     = new Date(date);
    const dayName = dt.toLocaleDateString('en-IN', { weekday:'long' });
    const dateFmt = dt.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    const color  = pnl >= 0 ? '#22c55e' : '#ef4444';
    const sign   = pnl >= 0 ? '+' : '';

    const tip = document.querySelector('#cal-tooltip');
    tip.innerHTML = `
      <div class="cal-tooltip-date">${dayName}, ${dateFmt}</div>
      <div class="cal-tooltip-pnl" style="color:${color}">${sign}${fmtINR(pnl)}</div>
      <div class="cal-tooltip-row">
        <span>Trades</span>
        <span class="cal-tooltip-val">${trades}</span>
      </div>
      <div class="cal-tooltip-row">
        <span>Avg / trade</span>
        <span class="cal-tooltip-val" style="color:${color}">${sign}${fmtINR(pnl / trades)}</span>
      </div>`;
    positionTooltip(e);
    tip.classList.add('visible');
  }

  function positionTooltip(e) {
    const tip = document.querySelector('#cal-tooltip');
    const tw  = tip.offsetWidth  || 180;
    const th  = tip.offsetHeight || 110;
    let x = e.clientX + 14;
    let y = e.clientY + 14;
    if (x + tw > window.innerWidth  - 10) x = e.clientX - tw - 10;
    if (y + th > window.innerHeight - 10) y = e.clientY - th - 10;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }

  function hideTooltip() {
    document.querySelector('#cal-tooltip')?.classList.remove('visible');
  }
}