import { api } from '../lib/api.js';
import { toast } from '../lib/toast.js';
import { fmtINR } from '../lib/utils.js';

export async function renderRisk(container) {
  container.innerHTML = `
    <div style="padding:1.5rem;max-width:700px" class="fade-up">
      <div style="padding:0 0 1.5rem">
        <div style="font-size:1.25rem;font-weight:700;color:#e8eeff">Risk Management</div>
        <div style="font-size:0.78rem;color:#7a90b0;margin-top:2px">Set your capital and risk limits — used in Psychology analysis</div>
      </div>

      <!-- Settings card -->
      <div class="card" style="margin-bottom:1rem">
        <div style="font-weight:600;font-size:0.875rem;color:#e8eeff;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #1e2d45">
          Capital & Risk Settings
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.875rem">
          <div class="field">
            <label>Total Trading Capital ₹</label>
            <input class="input" type="number" id="rm-capital" placeholder="e.g. 500000" min="0">
            <div style="font-size:0.65rem;color:#3a4f6a;margin-top:3px">Your total account size</div>
          </div>
          <div class="field">
            <label>Available Margin ₹</label>
            <input class="input" type="number" id="rm-margin" placeholder="e.g. 250000" min="0">
            <div style="font-size:0.65rem;color:#3a4f6a;margin-top:3px">Current usable margin</div>
          </div>
          <div class="field">
            <label>Risk Per Trade (%)</label>
            <div style="position:relative">
              <input class="input" type="number" id="rm-risk-per-trade" placeholder="e.g. 1" min="0.1" max="100" step="0.1" style="padding-right:2rem">
              <span style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);font-size:0.8rem;color:#3a4f6a">%</span>
            </div>
            <div style="font-size:0.65rem;color:#3a4f6a;margin-top:3px">Max loss per single trade</div>
          </div>
          <div class="field">
            <label>Max Daily Loss Limit (%)</label>
            <div style="position:relative">
              <input class="input" type="number" id="rm-daily-loss" placeholder="e.g. 2" min="0.1" max="100" step="0.1" style="padding-right:2rem">
              <span style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);font-size:0.8rem;color:#3a4f6a">%</span>
            </div>
            <div style="font-size:0.65rem;color:#3a4f6a;margin-top:3px">Stop trading after this loss</div>
          </div>
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1.25rem">
          <button class="btn btn-primary" id="save-rm-btn">Save Settings</button>
          <button class="btn btn-secondary" id="reset-rm-btn">Reset</button>
        </div>
      </div>

      <!-- Live calculated limits -->
      <div class="card" id="rm-summary" style="display:none">
        <div style="font-weight:600;font-size:0.875rem;color:#e8eeff;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #1e2d45">
          Calculated Limits
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem" id="rm-cards">
        </div>
        <div style="margin-top:0.875rem;padding:0.75rem;background:rgba(234,179,8,0.06);border:1px solid rgba(234,179,8,0.2);border-radius:8px;font-size:0.75rem;color:#eab308">
          💡 These limits are displayed in Psychology insights to help you track discipline
        </div>
      </div>
    </div>
  `;

  // ── Load saved settings ────────────────────────────────────────────────────
  let saved = {};
  try {
    const data = await api.get('/profile/risk');
    saved = data.riskManagement || {};
    populate(container, saved);
    renderSummary(container, saved);
  } catch { toast('Could not load risk settings', 'error'); }

  // ── Live preview as user types ─────────────────────────────────────────────
  ['rm-capital','rm-margin','rm-risk-per-trade','rm-daily-loss'].forEach(id => {
    container.querySelector(`#${id}`)?.addEventListener('input', () => {
      renderSummary(container, readValues(container));
    });
  });

  // ── Save ───────────────────────────────────────────────────────────────────
  container.querySelector('#save-rm-btn').addEventListener('click', async () => {
    const btn = container.querySelector('#save-rm-btn');
    btn.textContent = 'Saving…'; btn.disabled = true;
    try {
      const vals = readValues(container);
      await api.put('/profile/risk', vals);
      toast('Risk settings saved!');
    } catch (err) { toast(err.message, 'error'); }
    btn.textContent = 'Save Settings'; btn.disabled = false;
  });

  // ── Reset ──────────────────────────────────────────────────────────────────
  container.querySelector('#reset-rm-btn').addEventListener('click', () => {
    populate(container, { totalCapital: 0, availableMargin: 0, riskPerTrade: 1, maxDailyLoss: 2 });
    renderSummary(container, {});
  });
}

function populate(container, rm) {
  const s = id => container.querySelector(`#${id}`);
  if (rm.totalCapital    != null) s('rm-capital').value         = rm.totalCapital;
  if (rm.availableMargin != null) s('rm-margin').value          = rm.availableMargin;
  if (rm.riskPerTrade    != null) s('rm-risk-per-trade').value  = rm.riskPerTrade;
  if (rm.maxDailyLoss    != null) s('rm-daily-loss').value      = rm.maxDailyLoss;
}

function readValues(container) {
  const g = id => parseFloat(container.querySelector(`#${id}`)?.value) || 0;
  return {
    totalCapital:    g('rm-capital'),
    availableMargin: g('rm-margin'),
    riskPerTrade:    g('rm-risk-per-trade'),
    maxDailyLoss:    g('rm-daily-loss'),
  };
}

function renderSummary(container, rm) {
  const summary = container.querySelector('#rm-summary');
  const cards   = container.querySelector('#rm-cards');
  const capital = rm.totalCapital || 0;
  const rpt     = rm.riskPerTrade || 0;
  const mdl     = rm.maxDailyLoss || 0;
  const margin  = rm.availableMargin || 0;

  if (!capital) { summary.style.display = 'none'; return; }
  summary.style.display = 'block';

  const maxLossPerTrade = (capital * rpt) / 100;
  const maxDailyLoss   = (capital * mdl) / 100;
  const marginUsed     = capital > 0 ? ((capital - margin) / capital * 100).toFixed(1) : 0;

  const items = [
    { label: 'Max Loss Per Trade', value: fmtINR(maxLossPerTrade), color: '#ef4444', sub: `${rpt}% of capital` },
    { label: 'Max Daily Loss',     value: fmtINR(maxDailyLoss),    color: '#f97316', sub: `${mdl}% of capital` },
    { label: 'Available Margin',   value: fmtINR(margin),          color: '#22c55e', sub: `${(100 - +marginUsed).toFixed(1)}% free` },
    { label: 'Total Capital',      value: fmtINR(capital),         color: '#60a5fa', sub: 'Account size' },
  ];

  cards.innerHTML = items.map(item => `
    <div style="padding:0.875rem;background:#080c14;border:1px solid ${item.color}22;border-radius:10px">
      <div style="font-size:0.68rem;color:#7a90b0;margin-bottom:0.375rem">${item.label}</div>
      <div style="font-size:1rem;font-weight:700;color:${item.color};font-family:'JetBrains Mono',monospace">${item.value}</div>
      <div style="font-size:0.62rem;color:#3a4f6a;margin-top:2px">${item.sub}</div>
    </div>`).join('');
}
