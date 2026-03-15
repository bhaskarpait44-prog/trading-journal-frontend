import { api } from '../lib/api.js';
import { auth } from '../lib/auth.js';
import { fmtINR, fmtDate, pnlSpan, badge } from '../lib/utils.js';

let pnlChart = null;

export async function renderDashboard(container) {
  const user     = auth.getUser();
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today    = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  container.innerHTML = `
    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;max-width:1200px" class="fade-up">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:0.75rem">
        <div>
          <div style="font-size:1.25rem;font-weight:700;color:#e8eeff">${greeting}, ${user?.name?.split(' ')[0] || 'Trader'} 👋</div>
          <div style="font-size:0.78rem;color:#7a90b0;margin-top:2px">${today} · NSE/BSE Options</div>
        </div>
        <a href="#add-trade" onclick="window.location.hash='#add-trade';return false" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:0.375rem">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          Add Trade
        </a>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem" id="stat-grid">
        <div class="card" style="grid-column:1/-1;text-align:center;color:#3a4f6a;font-size:0.82rem;padding:1.5rem">Loading…</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 320px;gap:1rem">
        <div class="card" style="min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.875rem">
            <div>
              <div style="font-weight:600;font-size:0.85rem;color:#e8eeff">Cumulative P&L</div>
              <div style="font-size:0.7rem;color:#7a90b0">Last 30 days</div>
            </div>
            <div id="chart-pnl-badge" style="font-size:0.78rem;font-weight:700;font-family:'JetBrains Mono',monospace"></div>
          </div>
          <div style="position:relative;height:190px;width:100%">
            <canvas id="pnl-chart" style="position:absolute;inset:0;width:100%!important;height:100%!important"></canvas>
          </div>
          <div id="chart-empty" style="display:none;height:190px;align-items:center;justify-content:center;color:#3a4f6a;font-size:0.8rem;text-align:center">
            No closed trades yet<br>
            <a href="#add-trade" onclick="window.location.hash='#add-trade';return false" style="color:#3b82f6;font-size:0.75rem;margin-top:0.5rem;display:inline-block">Add your first trade →</a>
          </div>
        </div>

        <div class="card" style="min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.875rem">
            <div style="font-weight:600;font-size:0.85rem;color:#e8eeff">Recent Trades</div>
            <a href="#trades" onclick="window.location.hash='#trades';return false" style="font-size:0.72rem;color:#3b82f6;text-decoration:none">View all →</a>
          </div>
          <div id="recent-trades"><div style="text-align:center;padding:1.5rem 0;color:#3a4f6a;font-size:0.8rem">Loading…</div></div>
        </div>
      </div>
    </div>
  `;

  try {
    const [summary, chart, trades] = await Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/pnl-chart?days=30'),
      api.get('/trades?limit=8'),
    ]);
    renderStats(container.querySelector('#stat-grid'), summary);
    renderChart(container, chart.chartData || []);
    renderRecent(container.querySelector('#recent-trades'), trades.trades || []);
  } catch (e) { console.error('Dashboard error:', e); }
}

function renderStats(grid, s) {
  const cards = [
    { label:'Total P&L',     value: fmtINR(s.totalPnl||0, true),                     color: (s.totalPnl||0) >= 0 ? '#22c55e' : '#ef4444', sub: `${s.totalTrades||0} closed trades` },
    { label:'Win Rate',      value: `${(s.winRate||0).toFixed(1)}%`,                  color: '#3b82f6',  sub: `${s.winners||0}W / ${s.losers||0}L` },
    { label:'Profit Factor', value: (s.profitFactor||0).toFixed(2),                   color: '#a855f7',  sub: 'Gross win / gross loss' },
    { label:'Open Trades',   value: s.openTrades||0,                                  color: '#eab308',  sub: 'Currently active' },
    { label:'Best Trade',    value: fmtINR(s.maxWin||0, true),                        color: '#22c55e',  sub: `Avg ₹${Math.abs(s.avgWin||0).toLocaleString('en-IN',{maximumFractionDigits:0})}` },
    { label:'Worst Trade',   value: fmtINR(s.maxLoss||0, true),                       color: '#ef4444',  sub: `Avg ₹${Math.abs(s.avgLoss||0).toLocaleString('en-IN',{maximumFractionDigits:0})}` },
  ];
  grid.innerHTML = cards.map(c => `
    <div class="card" style="position:relative;overflow:hidden;padding:0.875rem">
      <div style="position:absolute;top:0;right:0;width:44px;height:44px;border-radius:0 10px 0 44px;background:${c.color}15"></div>
      <div style="font-size:0.68rem;color:#3a4f6a;font-weight:500;text-transform:uppercase;letter-spacing:.04em;margin-bottom:0.375rem">${c.label}</div>
      <div style="font-size:1.15rem;font-weight:700;color:${c.color};font-family:'JetBrains Mono',monospace;margin-bottom:0.2rem">${c.value}</div>
      <div style="font-size:0.68rem;color:#3a4f6a">${c.sub}</div>
    </div>`).join('');
}

function renderChart(container, data) {
  const canvas  = container.querySelector('#pnl-chart');
  const emptyEl = container.querySelector('#chart-empty');
  const badgeEl = container.querySelector('#chart-pnl-badge');

  if (!data || !data.length) { canvas.style.display = 'none'; emptyEl.style.display = 'flex'; return; }
  canvas.style.display = ''; emptyEl.style.display = 'none';
  if (pnlChart) { pnlChart.destroy(); pnlChart = null; }

  const labels = data.map(d => { const dt = new Date(d.date); return `${dt.getDate()} ${dt.toLocaleString('en',{month:'short'})}`; });
  let running  = 0;
  const values = data.map(d => { running += (d.pnl || d.cumulative || 0); return parseFloat(running.toFixed(2)); });
  const lastVal    = values[values.length-1] || 0;
  const lineColor  = lastVal >= 0 ? '#22c55e' : '#ef4444';
  if (badgeEl) { badgeEl.textContent = fmtINR(lastVal, true); badgeEl.style.color = lineColor; }

  const ctx  = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 190);
  grad.addColorStop(0, lineColor + '35'); grad.addColorStop(1, lineColor + '00');

  pnlChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data: values, borderColor: lineColor, borderWidth: 2, fill: true, backgroundColor: grad, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: lineColor }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f1623', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#7a90b0', bodyColor: '#e8eeff', callbacks: { label: ctx => ' ' + fmtINR(ctx.parsed.y, true) } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#3a4f6a', font: { size: 10 }, maxTicksLimit: 8 }, border: { display: false } },
        y: { grid: { color: 'rgba(30,45,69,0.5)' }, ticks: { color: '#3a4f6a', font: { size: 10 }, callback: v => v >= 1000 || v <= -1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}` }, border: { display: false } },
      },
    },
  });
}

function renderRecent(el, trades) {
  if (!trades || !trades.length) {
    el.innerHTML = `<div style="text-align:center;padding:2rem 0;color:#3a4f6a;font-size:0.8rem;line-height:2">No trades yet<br><a href="#add-trade" onclick="window.location.hash='#add-trade';return false" style="color:#3b82f6;font-size:0.75rem">Add your first trade →</a></div>`;
    return;
  }
  el.innerHTML = trades.map(t => {
    const isOpen   = t.status === 'OPEN';
    const pnlColor = (t.netPnl||0) >= 0 ? '#22c55e' : '#ef4444';
    const sym      = t.symbol || t.underlying || '—';
    const optBadge = t.optionType ? `<span style="font-size:0.6rem;padding:1px 5px;border-radius:3px;font-weight:700;background:${t.optionType==='CE'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)'};color:${t.optionType==='CE'?'#22c55e':'#ef4444'}">${t.optionType}</span>` : '';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.625rem;border-radius:7px;background:#080c14;border:1px solid #1e2d45;margin-bottom:0.3rem">
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:0.35rem;margin-bottom:2px">
            <span style="font-size:0.75rem;font-weight:600;color:#c0cce0;font-family:'JetBrains Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px">${sym}</span>
            ${optBadge}
          </div>
          <div style="font-size:0.65rem;color:#3a4f6a">${fmtDate(t.entryDate)} · ${t.tradeType||''}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:0.5rem">
          ${isOpen
            ? `<span style="font-size:0.65rem;padding:2px 7px;border-radius:4px;background:rgba(234,179,8,0.12);color:#eab308;font-weight:600">OPEN</span>`
            : `<span style="font-size:0.8rem;font-weight:700;color:${pnlColor};font-family:'JetBrains Mono',monospace">${fmtINR(t.netPnl||0,true)}</span>`}
        </div>
      </div>`;
  }).join('');
}
