import { api } from '../lib/api.js';
import { fmtINR } from '../lib/utils.js';

let charts = {};

export async function renderAnalytics(container) {
  container.innerHTML = `
    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;max-width:1200px" class="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem">
        <div>
          <div style="font-size:1.25rem;font-weight:700;color:#e8eeff">Analytics</div>
          <div style="font-size:0.78rem;color:#7a90b0;margin-top:2px">Performance breakdown of your options trades</div>
        </div>
        <div class="tab-bar" id="period-bar">
          ${[['7','7D'],['30','30D'],['90','90D'],['365','1Y']].map(([v,l])=>`<button class="tab-btn${v==='30'?' active':''}" data-period="${v}">${l}</button>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:0.75rem" id="metric-grid">
        <div class="card" style="grid-column:1/-1;text-align:center;color:#3a4f6a;font-size:0.82rem;padding:1.5rem">Loading…</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 260px;gap:1rem">
        <div class="card" style="min-width:0">
          <div style="font-weight:600;font-size:0.82rem;color:#e8eeff;margin-bottom:0.875rem">Daily P&L</div>
          <div style="position:relative;height:200px;width:100%">
            <canvas id="daily-chart" style="position:absolute;inset:0;width:100%!important;height:100%!important"></canvas>
          </div>
          <div id="daily-empty" style="display:none;height:200px;align-items:center;justify-content:center;color:#3a4f6a;font-size:0.8rem">No closed trades in this period</div>
        </div>
        <div class="card" style="min-width:0">
          <div style="font-weight:600;font-size:0.82rem;color:#e8eeff;margin-bottom:0.875rem">Win / Loss</div>
          <div style="position:relative;height:200px;width:100%">
            <canvas id="pie-chart" style="position:absolute;inset:0;width:100%!important;height:100%!important"></canvas>
          </div>
          <div id="pie-empty" style="display:none;height:200px;align-items:center;justify-content:center;color:#3a4f6a;font-size:0.8rem">No closed trades yet</div>
        </div>
      </div>

      <div class="card">
        <div style="font-weight:600;font-size:0.82rem;color:#e8eeff;margin-bottom:0.875rem">Cumulative P&L</div>
        <div style="position:relative;height:180px;width:100%">
          <canvas id="cumulative-chart" style="position:absolute;inset:0;width:100%!important;height:100%!important"></canvas>
        </div>
        <div id="cumulative-empty" style="display:none;height:180px;align-items:center;justify-content:center;color:#3a4f6a;font-size:0.8rem">No data yet</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div class="card"><div style="font-weight:600;font-size:0.82rem;color:#e8eeff;margin-bottom:0.875rem">By Underlying</div><div id="by-symbol"></div></div>
        <div class="card"><div style="font-weight:600;font-size:0.82rem;color:#e8eeff;margin-bottom:0.875rem">By Underlying Detail</div><div id="by-symbol-extra" style="display:none"></div></div>
      </div>

      <!-- By Strategy — full width table -->
      <div class="card" style="padding:0">
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #1e2d45;display:flex;align-items:center;justify-content:space-between">
          <div style="font-weight:600;font-size:0.875rem;color:#e8eeff">By Strategy</div>
          <div style="font-size:0.72rem;color:#3a4f6a">Closed trades only</div>
        </div>
        <div id="by-strategy"></div>
      </div>
    </div>
  `;

  let period = '30';

  async function load() {
    try {
      const [s, chart, sym, str] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/analytics/pnl-chart?days=${period}`),
        api.get('/analytics/by-symbol'),
        api.get('/analytics/by-strategy'),
      ]);
      renderMetrics(container.querySelector('#metric-grid'), s);
      renderDailyChart(container, chart.chartData || []);
      renderCumulativeChart(container, chart.chartData || []);
      renderPieChart(container, s);
      renderBreakdown(container.querySelector('#by-symbol'),   sym.data, 'underlying');
      renderBreakdown(container.querySelector('#by-strategy'), str.data, 'strategy');
    } catch (e) { console.error('Analytics error:', e); }
  }

  container.querySelector('#period-bar').addEventListener('click', e => {
    const btn = e.target.closest('[data-period]'); if (!btn) return;
    period = btn.dataset.period;
    container.querySelectorAll('#period-bar .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
    load();
  });

  load();
}

function renderMetrics(grid, s) {
  const cards = [
    { label:'Total P&L',     value: fmtINR(s.totalPnl||0, true),       color: (s.totalPnl||0) >= 0 ? '#22c55e' : '#ef4444' },
    { label:'Win Rate',      value: `${(s.winRate||0).toFixed(1)}%`,    color: '#3b82f6' },
    { label:'Profit Factor', value: (s.profitFactor||0).toFixed(2),     color: '#a855f7' },
    { label:'Total Trades',  value: s.totalTrades||0,                   color: '#e8eeff' },
    { label:'Avg Win',       value: fmtINR(Math.abs(s.avgWin||0)),      color: '#22c55e' },
    { label:'Avg Loss',      value: fmtINR(Math.abs(s.avgLoss||0)),     color: '#ef4444' },
    { label:'Best Trade',    value: fmtINR(s.maxWin||0, true),          color: '#22c55e' },
    { label:'Worst Trade',   value: fmtINR(s.maxLoss||0, true),         color: '#ef4444' },
    { label:'Total Charges', value: fmtINR(s.totalCharges||0),          color: '#eab308' },
  ];
  grid.innerHTML = cards.map(c => `
    <div class="card" style="padding:0.875rem">
      <div style="font-size:0.68rem;color:#3a4f6a;font-weight:500;text-transform:uppercase;letter-spacing:.04em;margin-bottom:0.375rem">${c.label}</div>
      <div style="font-size:1.1rem;font-weight:700;color:${c.color};font-family:'JetBrains Mono',monospace">${c.value}</div>
    </div>`).join('');
}

function renderDailyChart(container, data) {
  const canvas = container.querySelector('#daily-chart');
  const empty  = container.querySelector('#daily-empty');
  if (!data?.length) { canvas.style.display = 'none'; empty.style.display = 'flex'; return; }
  canvas.style.display = ''; empty.style.display = 'none';
  if (charts.daily) { charts.daily.destroy(); charts.daily = null; }
  const labels = data.map(d => { const dt = new Date(d.date); return `${dt.getDate()} ${dt.toLocaleString('en',{month:'short'})}`; });
  const values = data.map(d => d.pnl||0);
  charts.daily = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: values.map(v => v>=0 ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)'), borderRadius: 4, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor:'#0f1623', borderColor:'#1e2d45', borderWidth:1, titleColor:'#7a90b0', bodyColor:'#e8eeff', callbacks:{ label: ctx => ' ' + fmtINR(ctx.parsed.y, true) } } },
      scales: { x: { grid:{display:false}, ticks:{color:'#3a4f6a',font:{size:10},maxTicksLimit:10}, border:{display:false} }, y: { grid:{color:'rgba(30,45,69,0.6)'}, ticks:{color:'#3a4f6a',font:{size:10},callback:v=>v>=1000||v<=-1000?`₹${(v/1000).toFixed(1)}k`:`₹${v}`}, border:{display:false} } } },
  });
}

function renderCumulativeChart(container, data) {
  const canvas = container.querySelector('#cumulative-chart');
  const empty  = container.querySelector('#cumulative-empty');
  if (!data?.length) { canvas.style.display = 'none'; empty.style.display = 'flex'; return; }
  canvas.style.display = ''; empty.style.display = 'none';
  if (charts.cumulative) { charts.cumulative.destroy(); charts.cumulative = null; }
  const labels = data.map(d => { const dt = new Date(d.date); return `${dt.getDate()} ${dt.toLocaleString('en',{month:'short'})}`; });
  let running  = 0;
  const values = data.map(d => { running += (d.pnl||0); return parseFloat(running.toFixed(2)); });
  const finalVal  = values[values.length-1] || 0;
  const lineColor = finalVal >= 0 ? '#22c55e' : '#ef4444';
  charts.cumulative = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: [{ data: values, borderColor: lineColor, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.3, fill: true, backgroundColor: finalVal>=0?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend:{display:false}, tooltip:{backgroundColor:'#0f1623',borderColor:'#1e2d45',borderWidth:1,titleColor:'#7a90b0',bodyColor:'#e8eeff',callbacks:{label:ctx=>' '+fmtINR(ctx.parsed.y,true)}} },
      scales: { x:{grid:{display:false},ticks:{color:'#3a4f6a',font:{size:10},maxTicksLimit:10},border:{display:false}}, y:{grid:{color:'rgba(30,45,69,0.6)'},ticks:{color:'#3a4f6a',font:{size:10},callback:v=>v>=1000||v<=-1000?`₹${(v/1000).toFixed(1)}k`:`₹${v}`},border:{display:false}} } },
  });
}

function renderPieChart(container, s) {
  const canvas = container.querySelector('#pie-chart');
  const empty  = container.querySelector('#pie-empty');
  if (!s.totalTrades) { canvas.style.display = 'none'; empty.style.display = 'flex'; return; }
  canvas.style.display = ''; empty.style.display = 'none';
  if (charts.pie) { charts.pie.destroy(); charts.pie = null; }
  charts.pie = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: [`Winners (${s.winners||0})`, `Losers (${s.losers||0})`], datasets: [{ data: [s.winners||0, s.losers||0], backgroundColor: ['rgba(34,197,94,0.85)','rgba(239,68,68,0.85)'], borderWidth: 0, hoverOffset: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout:'68%', plugins: { legend:{position:'bottom',labels:{color:'#7a90b0',font:{size:11},padding:14,boxWidth:12}}, tooltip:{backgroundColor:'#0f1623',borderColor:'#1e2d45',borderWidth:1,titleColor:'#7a90b0',bodyColor:'#e8eeff'} } },
  });
}

function renderBreakdown(el, data, type) {
  if (!el) return;
  if (type === 'strategy') {
    renderStrategyTable(el, data);
  } else {
    renderSymbolBars(el, data);
  }
}

function renderSymbolBars(el, data) {
  if (!data?.length) {
    el.innerHTML = `<div style="text-align:center;padding:1.5rem 0;color:#3a4f6a;font-size:0.78rem">No data yet</div>`;
    return;
  }
  el.innerHTML = data.slice(0, 8).map(item => {
    const winPct = item.totalTrades ? ((item.wins / item.totalTrades) * 100).toFixed(0) : 0;
    const pnl    = item.totalPnl || 0;
    const color  = pnl >= 0 ? '#22c55e' : '#ef4444';
    const barW   = Math.min(100, Math.abs(pnl) / (Math.abs(data[0]?.totalPnl || 1)) * 100);
    return `
      <div style="padding:0.6rem 0;border-bottom:1px solid #1e2d45">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
          <div style="font-size:0.8rem;font-weight:600;color:#c0cce0;font-family:'JetBrains Mono',monospace">${item._id || 'Unknown'}</div>
          <div style="font-size:0.8rem;font-weight:700;color:${color};font-family:'JetBrains Mono',monospace">${fmtINR(pnl, true)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
          <div style="flex:1;height:3px;background:#1e2d45;border-radius:2px">
            <div style="width:${barW}%;height:100%;background:${color};border-radius:2px;opacity:0.6"></div>
          </div>
          <div style="font-size:0.65rem;color:#3a4f6a;white-space:nowrap">${item.totalTrades} trades · ${winPct}% win</div>
        </div>
      </div>`;
  }).join('');
}

function renderStrategyTable(el, data) {
  if (!data?.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1rem;color:#3a4f6a;font-size:0.82rem">
        <div style="font-size:1.5rem;margin-bottom:0.625rem;opacity:0.4">🎯</div>
        Tag your trades with strategies to see breakdown here
      </div>`;
    return;
  }

  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="border-bottom:1px solid #1e2d45">
          <th style="text-align:left;padding:0.75rem 1.25rem;font-size:0.68rem;font-weight:600;color:#3a4f6a;text-transform:uppercase;letter-spacing:0.06em">Strategy</th>
          <th style="text-align:right;padding:0.75rem 1.25rem;font-size:0.68rem;font-weight:600;color:#3a4f6a;text-transform:uppercase;letter-spacing:0.06em">Win %</th>
          <th style="text-align:right;padding:0.75rem 1.25rem;font-size:0.68rem;font-weight:600;color:#3a4f6a;text-transform:uppercase;letter-spacing:0.06em">Avg P&amp;L</th>
          <th style="text-align:right;padding:0.75rem 1.25rem;font-size:0.68rem;font-weight:600;color:#3a4f6a;text-transform:uppercase;letter-spacing:0.06em">Trades</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((item, i) => {
          const winPct  = item.totalTrades ? ((item.wins / item.totalTrades) * 100).toFixed(0) : 0;
          const avgPnl  = item.totalTrades ? (item.totalPnl / item.totalTrades) : 0;
          const winColor = winPct >= 55 ? '#22c55e' : winPct >= 45 ? '#eab308' : '#ef4444';
          const pnlColor = avgPnl >= 0 ? '#22c55e' : '#ef4444';
          const isLast   = i === data.length - 1;
          return `
            <tr style="border-bottom:${isLast ? 'none' : '1px solid #1e2d45'};transition:background 0.1s"
                onmouseenter="this.style.background='rgba(255,255,255,0.02)'"
                onmouseleave="this.style.background='transparent'">
              <td style="padding:0.875rem 1.25rem">
                <span style="font-size:0.875rem;font-weight:600;color:#e8eeff">${item._id || 'Unknown'}</span>
              </td>
              <td style="padding:0.875rem 1.25rem;text-align:right">
                <span style="font-size:0.875rem;font-weight:700;color:${winColor};font-family:'JetBrains Mono',monospace">${winPct}%</span>
              </td>
              <td style="padding:0.875rem 1.25rem;text-align:right">
                <span style="font-size:0.875rem;font-weight:600;color:${pnlColor};font-family:'JetBrains Mono',monospace">${fmtINR(avgPnl, true)}</span>
              </td>
              <td style="padding:0.875rem 1.25rem;text-align:right">
                <span style="font-size:0.875rem;color:#7a90b0">${item.totalTrades}</span>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}