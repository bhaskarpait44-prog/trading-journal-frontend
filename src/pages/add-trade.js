import { api } from '../lib/api.js';
import { toast } from '../lib/toast.js';
import { navigate } from '../router.js';
import { buildSymbol } from '../lib/utils.js';

// ── NSE symbols ───────────────────────────────────────────────────────────────
const FALLBACK_SYMBOLS = [
  { symbol: 'NIFTY',      lotSize: 65   },
  { symbol: 'BANKNIFTY',  lotSize: 30   },
  { symbol: 'FINNIFTY',   lotSize: 65   },
  { symbol: 'MIDCPNIFTY', lotSize: 120  },
  { symbol: 'SENSEX',     lotSize: 20   },
  { symbol: 'BANKEX',     lotSize: 20   },
  { symbol: 'RELIANCE',   lotSize: 250  },
  { symbol: 'TCS',        lotSize: 175  },
  { symbol: 'INFY',       lotSize: 400  },
  { symbol: 'HDFCBANK',   lotSize: 550  },
  { symbol: 'ICICIBANK',  lotSize: 700  },
  { symbol: 'SBIN',       lotSize: 750  },
  { symbol: 'AXISBANK',   lotSize: 625  },
  { symbol: 'KOTAKBANK',  lotSize: 400  },
  { symbol: 'WIPRO',      lotSize: 1500 },
  { symbol: 'LT',         lotSize: 175  },
  { symbol: 'BAJFINANCE', lotSize: 125  },
  { symbol: 'TATASTEEL',  lotSize: 1350 },
  { symbol: 'ADANIENT',   lotSize: 625  },
  { symbol: 'MARUTI',     lotSize: 100  },
];
let nseSymbols = [...FALLBACK_SYMBOLS];
let nseFetched = false;

async function loadNSESymbols() {
  if (nseFetched) return nseSymbols;
  try {
    const data = await api.get('/nse/fno-symbols');
    if (data.symbols?.length) { nseSymbols = data.symbols; nseFetched = true; }
  } catch { /* keep fallback */ }
  return nseSymbols;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STRATEGIES = [
  'Long Call','Long Put','Short Call','Short Put',
  'Bull Call Spread','Bear Put Spread','Iron Condor',
  'Straddle','Strangle','Butterfly','Scalp','Other',
];
const EMOTIONS_BEFORE = [
  { value: '',              label: 'Select emotion…'  },
  { value: 'calm',          label: '😌  Calm'          },
  { value: 'confident',     label: '💪  Confident'     },
  { value: 'overconfident', label: '🤩  Overconfident' },
  { value: 'fearful',       label: '😨  Fearful'       },
  { value: 'frustrated',    label: '😤  Frustrated'    },
  { value: 'revenge',       label: '😡  Revenge'       },
];
const EMOTIONS_AFTER = [
  { value: '',             label: 'Select emotion…'  },
  { value: 'satisfied',   label: '😊  Satisfied'     },
  { value: 'neutral',     label: '😐  Neutral'       },
  { value: 'disappointed',label: '😞  Disappointed'  },
  { value: 'regret',      label: '😔  Regret'        },
  { value: 'angry',       label: '😠  Angry'         },
];
const MISTAKE_TAGS = [
  { value: 'no_stoploss',        label: 'No Stop Loss',       color: '#ef4444' },
  { value: 'revenge_trade',      label: 'Revenge Trade',      color: '#f97316' },
  { value: 'fomo_entry',         label: 'FOMO Entry',         color: '#eab308' },
  { value: 'overtrading',        label: 'Overtrading',        color: '#a855f7' },
  { value: 'oversized_position', label: 'Oversized Position', color: '#ec4899' },
  { value: 'late_entry',         label: 'Late Entry',         color: '#3b82f6' },
  { value: 'early_exit',         label: 'Early Exit',         color: '#06b6d4' },
];

// ── Psychology HTML ───────────────────────────────────────────────────────────
function psychHTML(idPrefix = '', required = false) {
  return `
    <div class="card" style="margin-top:1rem;border-color:rgba(168,85,247,0.35);background:rgba(168,85,247,0.04)">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding-bottom:0.75rem;border-bottom:1px solid rgba(168,85,247,0.2);margin-bottom:1rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="font-size:1rem">🧠</span>
          <div>
            <div style="font-weight:600;font-size:0.875rem;color:#c084fc">
              Trade Psychology ${required ? '<span style="font-size:0.65rem;color:#ef4444;margin-left:4px">REQUIRED</span>' : ''}
            </div>
            <div style="font-size:0.68rem;color:#7a90b0;margin-top:1px">Log emotions &amp; mistakes — helps build behavioural insights</div>
          </div>
        </div>
      </div>
      <div id="${idPrefix}psych-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.875rem;margin-bottom:0.875rem">
          <div class="field">
            <label style="color:#c084fc">Emotion Before Trade <span class="req">*</span></label>
            <select class="input" id="${idPrefix}psych-emotion-before" style="border-color:rgba(168,85,247,0.3)">
              ${EMOTIONS_BEFORE.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label style="color:#c084fc">Emotion After Trade</label>
            <select class="input" id="${idPrefix}psych-emotion-after" style="border-color:rgba(168,85,247,0.3)">
              ${EMOTIONS_AFTER.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field" style="margin-bottom:0.875rem">
          <label style="color:#c084fc;display:flex;justify-content:space-between">
            <span>Discipline Rating</span>
            <span id="${idPrefix}disc-val" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:0.9rem">5 / 10</span>
          </label>
          <input type="range" id="${idPrefix}psych-discipline" min="1" max="10" value="5"
                 style="width:100%;accent-color:#a855f7;cursor:pointer;height:6px;margin-top:4px">
          <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:#3a4f6a;margin-top:3px">
            <span>1 — No discipline</span><span>10 — Perfect</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.875rem;
                    background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.15);
                    border-radius:8px;margin-bottom:0.875rem">
          <div>
            <div style="font-size:0.82rem;font-weight:500;color:#c0cce0">Followed Trading Plan?</div>
            <div style="font-size:0.68rem;color:#7a90b0;margin-top:1px">Did you stick to your rules?</div>
          </div>
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none">
            <span id="${idPrefix}plan-label" style="font-size:0.78rem;color:#7a90b0">Not set</span>
            <div style="position:relative;width:44px;height:24px">
              <input type="checkbox" id="${idPrefix}psych-followed-plan"
                     style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0;z-index:1">
              <div id="${idPrefix}plan-track" style="position:absolute;inset:0;border-radius:12px;background:#1e2d45;transition:background 0.2s;border:1px solid #2a3f5a"></div>
              <div id="${idPrefix}plan-thumb" style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#3a4f6a;transition:all 0.2s"></div>
            </div>
          </label>
        </div>
        <div class="field" style="margin-bottom:0.875rem">
          <label style="color:#c084fc">Mistake Tags <span style="font-weight:400;color:#7a90b0">(select all that apply)</span></label>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem" id="${idPrefix}mistake-tags">
            ${MISTAKE_TAGS.map(m => `
              <button type="button" class="${idPrefix}mistake-tag" data-value="${m.value}"
                style="padding:0.3rem 0.7rem;border-radius:20px;border:1px solid #2a3f5a;
                       background:#080c14;color:#7a90b0;font-size:0.72rem;font-weight:500;cursor:pointer;transition:all 0.15s">
                ${m.label}
              </button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label style="color:#c084fc">Psychology Notes</label>
          <textarea class="input" id="${idPrefix}psych-notes" rows="2"
            style="border-color:rgba(168,85,247,0.3)"
            placeholder="What were you thinking? What could you do better?"></textarea>
        </div>
      </div>
    </div>`;
}

function bindPsych(container, prefix = '') {
  const p = s => container.querySelector(`#${prefix}${s}`);
  const slider = p('psych-discipline'), discVal = p('disc-val');
  slider.addEventListener('input', () => {
    const v = slider.value;
    discVal.textContent = `${v} / 10`;
    discVal.style.color = v >= 7 ? '#22c55e' : v >= 4 ? '#eab308' : '#ef4444';
  });
  const chk = p('psych-followed-plan');
  chk.addEventListener('change', () => {
    const lbl = p('plan-label'), track = p('plan-track'), thumb = p('plan-thumb');
    if (chk.checked) {
      lbl.textContent = 'Yes ✓'; lbl.style.color = '#22c55e';
      track.style.background = '#16a34a'; track.style.borderColor = '#22c55e';
      thumb.style.background = '#fff'; thumb.style.left = '23px';
    } else {
      lbl.textContent = 'No ✗'; lbl.style.color = '#ef4444';
      track.style.background = '#7f1d1d'; track.style.borderColor = '#ef4444';
      thumb.style.background = '#fff'; thumb.style.left = '3px';
    }
  });
  const tagsWrap = p('mistake-tags');
  if (tagsWrap) tagsWrap.addEventListener('click', e => {
    const btn = e.target.closest(`.${prefix}mistake-tag`); if (!btn) return;
    const active  = btn.dataset.active === 'true';
    const tagData = MISTAKE_TAGS.find(m => m.value === btn.dataset.value);
    if (active) {
      btn.dataset.active = 'false';
      btn.style.background = '#080c14'; btn.style.color = '#7a90b0'; btn.style.borderColor = '#2a3f5a';
    } else {
      btn.dataset.active = 'true';
      btn.style.background  = (tagData?.color || '#a855f7') + '22';
      btn.style.color       = tagData?.color || '#a855f7';
      btn.style.borderColor = tagData?.color || '#a855f7';
    }
  });
}

// Psychology is now REQUIRED — returns payload or throws
function getPsychPayload(container, prefix = '') {
  const p  = s => container.querySelector(`#${prefix}${s}`);
  const em = p('psych-emotion-before')?.value;
  if (!em) return null; // caller handles required check
  const tags = [...(container.querySelectorAll(`.${prefix}mistake-tag[data-active="true"]`) || [])].map(b => b.dataset.value);
  return {
    emotionBefore:    em,
    emotionAfter:     p('psych-emotion-after')?.value  || '',
    disciplineRating: parseInt(p('psych-discipline')?.value || '5'),
    followedPlan:     p('psych-followed-plan')?.checked || false,
    mistakeTags:      tags,
    notes:            p('psych-notes')?.value?.trim()  || '',
  };
}

async function applyPsychToTrades(tradeIds, psych) {
  if (!tradeIds?.length || !psych) return;
  await Promise.allSettled(tradeIds.map(t => api.post(`/trades/${t._id}/psychology`, psych)));
}

// ── Page ──────────────────────────────────────────────────────────────────────
export async function renderAddTrade(container) {
  container.innerHTML = `
    <div style="padding:1.5rem;max-width:820px" class="fade-up">
      <div style="padding:0 0 1.25rem">
        <div style="font-size:1.25rem;font-weight:700;color:#e8eeff">Add Trade</div>
        <div style="font-size:0.78rem;color:#7a90b0;margin-top:2px">Log manually, import CSV, or sync from Dhan</div>
      </div>
      <div class="tab-bar" style="margin-bottom:1.5rem" id="tab-bar">
        <button class="tab-btn active" data-tab="manual">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Manual Entry
        </button>
        <button class="tab-btn" data-tab="csv">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import CSV
        </button>
        <button class="tab-btn" data-tab="broker">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          Dhan API
        </button>
      </div>
      <div id="tab-content"></div>
    </div>
  `;

  container.querySelector('#tab-bar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn'); if (!btn) return;
    const tab = btn.dataset.tab;
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const tc = container.querySelector('#tab-content');
    if      (tab === 'manual') renderManual(tc);
    else if (tab === 'csv')    renderCSV(tc);
    else                       renderDhan(tc);
  });

  renderManual(container.querySelector('#tab-content'));
}

// ── MANUAL TAB ────────────────────────────────────────────────────────────────
function renderManual(container) {
  container.innerHTML = `
    <form id="trade-form">
      <!-- Option Details -->
      <div class="card" style="margin-bottom:1rem">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #1e2d45">
          <div style="font-weight:600;font-size:0.875rem;color:#e8eeff">Option Details</div>
          <div style="display:flex;align-items:center;gap:0.35rem">
            <span id="nse-dot" style="width:7px;height:7px;border-radius:50%;background:#3a4f6a;display:inline-block;flex-shrink:0"></span>
            <span id="nse-text" style="font-size:0.65rem;color:#3a4f6a">Loading symbols…</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.875rem">

          <!-- Symbol search -->
          <div class="field" style="position:relative">
            <label>Underlying <span class="req">*</span></label>
            <input class="input" id="underlying-search" placeholder="Type e.g. NIFTY…" autocomplete="off" spellcheck="false">
            <input type="hidden" id="underlying" value="">
            <div id="underlying-dropdown"
              style="display:none;position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:9999;
                     background:#0d1824;border:1px solid #2a3f5a;border-radius:8px;
                     max-height:200px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
            </div>
          </div>

          <div class="field">
            <label>Option Type <span class="req">*</span></label>
            <select class="input" id="option-type">
              <option value="CE">CE — Call</option>
              <option value="PE">PE — Put</option>
            </select>
          </div>

          <div class="field">
            <label>Strike Price <span class="req">*</span></label>
            <input class="input" type="number" id="strike" placeholder="e.g. 22500">
          </div>

          <div class="field">
            <label>Expiry Date <span class="req">*</span></label>
            <input class="input" type="date" id="expiry">
          </div>

          <div class="field">
            <label style="display:flex;align-items:baseline;gap:0.4rem">
              Lot Size <span class="req">*</span>
              <span id="lot-hint" style="font-size:0.62rem;font-weight:400;color:#3a4f6a"></span>
            </label>
            <input class="input" type="number" id="lot-size" placeholder="Enter manually" min="1">
          </div>

          <div class="field">
            <label>Quantity (lots) <span class="req">*</span></label>
            <input class="input" type="number" id="quantity" value="1" min="1">
          </div>

        </div>

        <!-- Total quantity info bar -->
        <div id="qty-info" style="display:none;margin-top:0.75rem;padding:0.4rem 0.875rem;
             background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);
             border-radius:6px;font-size:0.75rem;color:#7a90b0;display:flex;justify-content:space-between">
          <span>Total quantity: <strong id="qty-total" style="color:#60a5fa;font-family:'JetBrains Mono',monospace"></strong></span>
          <span id="symbol-val-wrap" style="display:none">
            Symbol: <span id="symbol-val" style="color:#60a5fa;font-family:'JetBrains Mono',monospace;font-weight:600"></span>
          </span>
        </div>
      </div>

      <!-- Trade Execution -->
      <div class="card" style="margin-bottom:1rem">
        <div style="font-weight:600;font-size:0.875rem;color:#e8eeff;margin-bottom:1rem;
                    padding-bottom:0.75rem;border-bottom:1px solid #1e2d45">Trade Execution</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.875rem">
          <div class="field">
            <label>Trade Type <span class="req">*</span></label>
            <select class="input" id="trade-type">
              <option value="BUY">BUY</option>
              <option value="SELL">SELL (Write)</option>
            </select>
          </div>
          <div class="field">
            <label>Entry Price ₹ <span class="req">*</span></label>
            <input class="input" type="number" step="0.05" id="entry-price" placeholder="e.g. 120.50">
          </div>
          <div class="field">
            <label>Entry Date <span class="req">*</span></label>
            <input class="input" type="date" id="entry-date" value="${new Date().toISOString().slice(0,10)}">
          </div>
          <div class="field">
            <label>Status</label>
            <select class="input" id="status">
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="EXPIRED">Expired (0)</option>
            </select>
          </div>
          <div class="field" id="exit-price-field" style="display:none">
            <label>Exit Price ₹</label>
            <input class="input" type="number" step="0.05" id="exit-price" placeholder="e.g. 180.00">
          </div>
          <div class="field" id="exit-date-field" style="display:none">
            <label>Exit Date</label>
            <input class="input" type="date" id="exit-date">
          </div>
          <div class="field">
            <label>Charges ₹</label>
            <input class="input" type="number" id="charges" value="20">
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="card" style="margin-bottom:1rem">
        <div style="font-weight:600;font-size:0.875rem;color:#e8eeff;margin-bottom:1rem;
                    padding-bottom:0.75rem;border-bottom:1px solid #1e2d45">Notes &amp; Strategy</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.875rem">
          <div class="field">
            <label>Strategy</label>
            <select class="input" id="strategy">
              <option value="">Select strategy…</option>
              ${STRATEGIES.map(s => `<option>${s}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Tags (comma separated)</label>
            <input class="input" id="tags" placeholder="e.g. expiry, hedged, trend">
          </div>
          <div class="field" style="grid-column:1/-1">
            <label>Trade Notes</label>
            <textarea class="input" id="notes" rows="2" placeholder="Trade rationale, setup, lessons…"></textarea>
          </div>
        </div>
      </div>

      ${psychHTML('', true)}

      <button type="submit" class="btn btn-primary" id="save-btn"
        style="width:100%;justify-content:center;padding:0.75rem;margin-top:0.5rem">
        Save Trade →
      </button>
    </form>
  `;

  const searchInput = container.querySelector('#underlying-search');
  const hiddenInput = container.querySelector('#underlying');
  const dropdown    = container.querySelector('#underlying-dropdown');
  const lotInput    = container.querySelector('#lot-size');
  const qtyInput    = container.querySelector('#quantity');
  const lotHint     = container.querySelector('#lot-hint');
  const nseDot      = container.querySelector('#nse-dot');
  const nseText     = container.querySelector('#nse-text');
  const qtyInfo     = container.querySelector('#qty-info');
  const qtyTotal    = container.querySelector('#qty-total');

  // ── NSE load ───────────────────────────────────────────────────────────────
  loadNSESymbols().then(() => {
    if (nseFetched) {
      nseDot.style.background = '#22c55e';
      nseText.textContent     = `${nseSymbols.length} F&O symbols`;
      nseText.style.color     = '#22c55e';
    } else {
      nseDot.style.background = '#eab308';
      nseText.textContent     = 'Offline list'; nseText.style.color = '#eab308';
    }
  });

  // ── Total quantity calculator: lot size × quantity ─────────────────────────
  function updateQtyInfo() {
    const lot = parseInt(lotInput.value) || 0;
    const qty = parseInt(qtyInput.value) || 0;
    if (lot > 0 && qty > 0) {
      qtyInfo.style.display = 'flex';
      qtyTotal.textContent  = `${lot * qty} units (${qty} lot${qty > 1 ? 's' : ''} × ${lot})`;
    } else {
      qtyInfo.style.display = 'none';
    }
    updatePreview();
  }
  lotInput.addEventListener('input', updateQtyInfo);
  qtyInput.addEventListener('input', updateQtyInfo);

  // ── Autocomplete ───────────────────────────────────────────────────────────
  function renderDropdown(results) {
    if (!results.length) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = results.map((s, i) => `
      <div class="sym-opt" data-symbol="${s.symbol}" data-lot="${s.lotSize}"
        style="padding:0.5rem 0.875rem;cursor:pointer;display:flex;justify-content:space-between;
               align-items:center;transition:background 0.1s;
               ${i < results.length - 1 ? 'border-bottom:1px solid #1a2738' : ''}">
        <span style="font-weight:600;font-size:0.875rem;color:#e8eeff;font-family:'JetBrains Mono',monospace">${s.symbol}</span>
        <span style="font-size:0.68rem;color:#3a4f6a">Lot: ${s.lotSize}</span>
      </div>`).join('');
    dropdown.style.display = 'block';
    dropdown.querySelectorAll('.sym-opt').forEach(opt => {
      opt.addEventListener('mouseenter', () => { clearActive(); opt.dataset.active = '1'; opt.style.background = '#1a2738'; });
      opt.addEventListener('mouseleave', () => { if (opt.dataset.active) { delete opt.dataset.active; opt.style.background = ''; } });
      opt.addEventListener('mousedown',  e  => { e.preventDefault(); pickSymbol(opt.dataset.symbol, parseInt(opt.dataset.lot)); });
    });
  }
  function clearActive() { dropdown.querySelectorAll('.sym-opt[data-active]').forEach(o => { delete o.dataset.active; o.style.background = ''; }); }

  function pickSymbol(symbol, lotSize) {
    searchInput.value      = symbol;
    hiddenInput.value      = symbol;
    dropdown.style.display = 'none';
    // Auto-fill lot size from NSE data if field is empty
    if (!lotInput.value) lotInput.value = lotSize;
    lotHint.textContent = `NSE: ${lotSize}`;
    updateQtyInfo();
    container.querySelector('#option-type')?.focus();
  }

  searchInput.addEventListener('input', function () {
    hiddenInput.value = '';
    const q = this.value.trim().toUpperCase();
    if (!q) { dropdown.style.display = 'none'; return; }
    const starts   = nseSymbols.filter(s => s.symbol.startsWith(q));
    const contains = nseSymbols.filter(s => !s.symbol.startsWith(q) && s.symbol.includes(q));
    renderDropdown([...starts, ...contains].slice(0, 12));
  });

  searchInput.addEventListener('keydown', function (e) {
    const opts = [...dropdown.querySelectorAll('.sym-opt')];
    if (!opts.length && e.key !== 'Escape') return;
    const cur = opts.findIndex(o => o.dataset.active === '1');
    if (e.key === 'ArrowDown') {
      e.preventDefault(); clearActive();
      const n = opts[cur < opts.length - 1 ? cur + 1 : 0]; n.dataset.active = '1'; n.style.background = '#1a2738'; n.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); clearActive();
      const p = opts[cur > 0 ? cur - 1 : opts.length - 1]; p.dataset.active = '1'; p.style.background = '#1a2738'; p.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && cur >= 0) {
      e.preventDefault(); pickSymbol(opts[cur].dataset.symbol, parseInt(opts[cur].dataset.lot));
    } else if (e.key === 'Tab' && opts.length) {
      e.preventDefault(); pickSymbol(opts[0].dataset.symbol, parseInt(opts[0].dataset.lot));
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.style.display = 'none';
      if (!hiddenInput.value) { searchInput.value = ''; lotHint.textContent = ''; }
    }, 200);
  });

  // ── Symbol preview ─────────────────────────────────────────────────────────
  function updatePreview() {
    const sym = buildSymbol(hiddenInput.value, container.querySelector('#expiry').value,
                            container.querySelector('#strike').value, container.querySelector('#option-type').value);
    const symWrap = container.querySelector('#symbol-val-wrap');
    if (sym) { symWrap.style.display = ''; container.querySelector('#symbol-val').textContent = sym; }
    else       symWrap.style.display = 'none';
    qtyInfo.style.display = (parseInt(lotInput.value) > 0 && parseInt(qtyInput.value) > 0) ? 'flex' : 'none';
  }
  ['option-type','strike','expiry'].forEach(id => {
    container.querySelector(`#${id}`)?.addEventListener('input',  updatePreview);
    container.querySelector(`#${id}`)?.addEventListener('change', updatePreview);
  });

  // Status toggle
  container.querySelector('#status').addEventListener('change', function () {
    const show = this.value === 'CLOSED';
    container.querySelector('#exit-price-field').style.display = show ? '' : 'none';
    container.querySelector('#exit-date-field').style.display  = show ? '' : 'none';
  });

  bindPsych(container, '');

  // ── Submit ─────────────────────────────────────────────────────────────────
  container.querySelector('#trade-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = container.querySelector('#save-btn');
    btn.textContent = 'Saving…'; btn.disabled = true;
    const get    = id => container.querySelector(`#${id}`)?.value?.trim();
    const status = get('status');

    if (!hiddenInput.value) {
      toast('Please select an underlying symbol', 'error');
      btn.textContent = 'Save Trade →'; btn.disabled = false; searchInput.focus(); return;
    }
    const lotVal = parseInt(get('lot-size'));
    if (!lotVal || lotVal < 1) {
      toast('Please enter a valid Lot Size', 'error');
      btn.textContent = 'Save Trade →'; btn.disabled = false; return;
    }

    // Psychology is REQUIRED
    const psych = getPsychPayload(container, '');
    if (!psych) {
      toast('Please select Emotion Before Trade (Psychology is required)', 'error');
      btn.textContent = 'Save Trade →'; btn.disabled = false;
      container.querySelector('#psych-emotion-before')?.focus(); return;
    }

    const payload = {
      underlying:  hiddenInput.value,
      optionType:  get('option-type'),
      strikePrice: parseFloat(get('strike')),
      expiryDate:  get('expiry'),
      lotSize:     lotVal,
      quantity:    parseInt(get('quantity')),
      tradeType:   get('trade-type'),
      entryPrice:  parseFloat(get('entry-price')),
      entryDate:   get('entry-date'),
      status,
      charges:     parseFloat(get('charges') || '0'),
      strategy:    get('strategy'),
      notes:       get('notes'),
      tags:        get('tags') ? get('tags').split(',').map(t => t.trim()).filter(Boolean) : [],
      symbol:      container.querySelector('#symbol-val')?.textContent || hiddenInput.value,
      psychology:  psych,
    };
    if (status === 'CLOSED') {
      if (get('exit-price')) payload.exitPrice = parseFloat(get('exit-price'));
      if (get('exit-date'))  payload.exitDate  = get('exit-date');
    }

    try {
      await api.post('/trades', payload);
      toast('Trade saved! 🧠 Psychology logged');
      navigate('#trades');
    } catch (err) {
      toast(err.message, 'error');
      btn.textContent = 'Save Trade →'; btn.disabled = false;
    }
  });
}

// ── CSV TAB ───────────────────────────────────────────────────────────────────
function renderCSV(container) {
  const BROKERS = [
    'Zerodha','Upstox','Angel One','Fyers','Dhan',
    'Groww','5Paisa','ICICI Direct','HDFC','Kotak','AliceBlue','Sharekhan','Samco',
  ];

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:1.25rem;max-width:1100px;align-items:start" class="fade-up">

      <!-- ── LEFT COLUMN ── -->
      <div style="display:flex;flex-direction:column;gap:1rem">

        <!-- Upload card -->
        <div class="card" style="padding:0;overflow:hidden">

          <!-- Card header -->
          <div style="padding:1rem 1.25rem;border-bottom:1px solid #1e2d45;display:flex;align-items:center;gap:0.625rem;background:#080e1a">
            <div style="width:30px;height:30px;border-radius:7px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#e8eeff">Upload Tradebook CSV</div>
              <div style="font-size:0.65rem;color:#3a4f6a;margin-top:1px">Auto-detects broker · Options trades only</div>
            </div>
          </div>

          <div style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem">

            <!-- Drop zone -->
            <label id="csv-drop" for="csv-input"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                     border:2px dashed #1e2d45;border-radius:12px;padding:2rem 1.5rem;
                     cursor:pointer;transition:all 0.2s;background:#080c14;text-align:center;min-height:130px">
              <div id="csv-drop-icon" style="margin-bottom:0.75rem;transition:transform 0.2s">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2a3f5a" stroke-width="1.5" style="display:block">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div id="csv-drop-main" style="font-size:0.875rem;font-weight:600;color:#7a90b0;margin-bottom:0.3rem">
                Click to select or drag &amp; drop CSV
              </div>
              <div style="font-size:0.68rem;color:#3a4f6a">CSV only · Max 5MB · Options rows auto-filtered</div>
              <input type="file" id="csv-input" accept=".csv,.CSV" style="display:none">
            </label>

            <!-- File info (shown after selection) -->
            <div id="csv-file-info" style="display:none;align-items:center;justify-content:space-between;
                 padding:0.625rem 0.875rem;background:rgba(59,130,246,0.06);
                 border:1px solid rgba(59,130,246,0.2);border-radius:8px">
              <div style="display:flex;align-items:center;gap:0.5rem;min-width:0">
                <div style="width:28px;height:28px;border-radius:6px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style="min-width:0">
                  <div id="csv-file-name" style="font-size:0.8rem;font-weight:600;color:#c0cce0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px"></div>
                  <div id="csv-file-size" style="font-size:0.65rem;color:#3a4f6a;margin-top:1px"></div>
                </div>
              </div>
              <button id="csv-clear-file" style="background:none;border:none;color:#3a4f6a;cursor:pointer;font-size:1rem;padding:0.2rem;line-height:1;flex-shrink:0"
                onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#3a4f6a'">✕</button>
            </div>

            <!-- Supported brokers chips -->
            <div>
              <div style="font-size:0.68rem;font-weight:500;color:#3a4f6a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem">Supported Brokers</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.35rem">
                ${BROKERS.map(b => `
                  <span style="padding:0.2rem 0.6rem;background:#080c14;border:1px solid #1e2d45;
                               border-radius:20px;font-size:0.68rem;color:#7a90b0;white-space:nowrap">
                    ${b}
                  </span>`).join('')}
                <span style="padding:0.2rem 0.6rem;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.2);
                             border-radius:20px;font-size:0.68rem;color:#22c55e;white-space:nowrap">
                  + Generic
                </span>
              </div>
            </div>

            <!-- Divider -->
            <div style="height:1px;background:#1e2d45"></div>

            <!-- Strategy -->
            <div class="field">
              <label style="display:flex;align-items:center;justify-content:space-between">
                <span>Strategy</span>
                <span style="font-size:0.65rem;font-weight:400;color:#3a4f6a">applied to all imported trades</span>
              </label>
              <select class="input" id="csv-strategy">
                <option value="">No strategy tag…</option>
                ${STRATEGIES.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>

            <!-- Notes -->
            <div class="field">
              <label style="display:flex;align-items:center;justify-content:space-between">
                <span>Notes</span>
                <span style="font-size:0.65rem;font-weight:400;color:#3a4f6a">applied to all imported trades</span>
              </label>
              <textarea class="input" id="csv-notes" rows="2"
                placeholder="e.g. Imported from broker · Monthly F&O trades"
                style="resize:none"></textarea>
            </div>

            <!-- Import button -->
            <button class="btn btn-primary" id="csv-btn" disabled
              style="width:100%;justify-content:center;padding:0.75rem;font-size:0.9rem;
                     opacity:0.45;transition:opacity 0.2s">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import Trades
            </button>

            <!-- Result -->
            <div id="csv-result" style="display:none"></div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT COLUMN: Psychology ── -->
      <div style="display:flex;flex-direction:column;gap:1rem">

        <!-- Psychology card -->
        <div class="card" style="padding:0;overflow:hidden;border-color:rgba(168,85,247,0.25)">
          <div style="padding:1rem 1.25rem;border-bottom:1px solid rgba(168,85,247,0.2);background:rgba(168,85,247,0.04);
                      display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <span style="font-size:1.1rem">🧠</span>
              <div>
                <div style="font-weight:700;font-size:0.875rem;color:#c084fc">Psychology</div>
                <div id="csv-psych-status-label" style="font-size:0.65rem;color:#7a90b0;margin-top:1px">Toggle off for historical imports</div>
              </div>
            </div>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none">
              <span id="csv-psych-toggle-label" style="font-size:0.72rem;color:#c084fc;font-weight:500">On</span>
              <div style="position:relative;width:40px;height:22px">
                <input type="checkbox" id="csv-psych-toggle" checked
                       style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0;z-index:1">
                <div id="csv-psych-track" style="position:absolute;inset:0;border-radius:11px;background:#7c3aed;transition:background 0.2s;border:1px solid #a855f7"></div>
                <div id="csv-psych-thumb" style="position:absolute;top:3px;left:21px;width:16px;height:16px;border-radius:50%;background:#fff;transition:all 0.2s"></div>
              </div>
            </label>
          </div>

          <!-- Psychology ON -->
          <div id="csv-psych-fields" style="padding:1.25rem">
            ${psychHTML('csv-', false)}
          </div>

          <!-- Psychology OFF -->
          <div id="csv-psych-off-msg" style="display:none;padding:1.5rem 1.25rem;text-align:center">
            <div style="font-size:1.5rem;margin-bottom:0.5rem;opacity:0.4">📅</div>
            <div style="font-size:0.8rem;font-weight:500;color:#3a4f6a;margin-bottom:0.25rem">Psychology skipped</div>
            <div style="font-size:0.72rem;color:#2a3f5a;line-height:1.5">
              Good for importing historical trade data.<br>Toggle on to log emotions for this batch.
            </div>
          </div>
        </div>

        <!-- Tip card -->
        <div style="padding:0.875rem;background:#080c14;border:1px solid #1e2d45;border-radius:10px">
          <div style="font-size:0.72rem;font-weight:600;color:#c0cce0;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.375rem">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            How to export your tradebook
          </div>
          <div style="font-size:0.7rem;color:#3a4f6a;line-height:1.75">
            <div><span style="color:#7a90b0">Zerodha</span> → Console → Reports → Tradebook</div>
            <div><span style="color:#7a90b0">Upstox</span> → Reports → Trade Details → Export</div>
            <div><span style="color:#7a90b0">Dhan</span> → Statements → Trade Book → Download</div>
            <div><span style="color:#7a90b0">Angel</span> → My Account → Reports → Trade Book</div>
            <div style="margin-top:0.375rem;color:#2a3f5a">
              <span style="color:#22c55e">✓</span> Select F&O / Options segment when exporting
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── Psychology toggle ──────────────────────────────────────────────────────
  const psychToggle = container.querySelector('#csv-psych-toggle');
  const psychFields = container.querySelector('#csv-psych-fields');
  const psychOffMsg = container.querySelector('#csv-psych-off-msg');
  const psychTrack  = container.querySelector('#csv-psych-track');
  const psychThumb  = container.querySelector('#csv-psych-thumb');
  const toggleLabel = container.querySelector('#csv-psych-toggle-label');

  function setPsychToggle(on) {
    psychToggle.checked = on;
    if (on) {
      psychFields.style.display = 'block';
      psychOffMsg.style.display = 'none';
      psychTrack.style.background  = '#7c3aed';
      psychTrack.style.borderColor = '#a855f7';
      psychThumb.style.background  = '#fff';
      psychThumb.style.left = '21px';
      toggleLabel.textContent = 'On';
      toggleLabel.style.color = '#c084fc';
    } else {
      psychFields.style.display = 'none';
      psychOffMsg.style.display = 'block';
      psychTrack.style.background  = '#1e2d45';
      psychTrack.style.borderColor = '#2a3f5a';
      psychThumb.style.background  = '#3a4f6a';
      psychThumb.style.left = '3px';
      toggleLabel.textContent = 'Off';
      toggleLabel.style.color = '#7a90b0';
    }
  }
  setPsychToggle(true);
  psychToggle.addEventListener('change', () => setPsychToggle(psychToggle.checked));

  // ── File handling ──────────────────────────────────────────────────────────
  let file = null;
  const input    = container.querySelector('#csv-input');
  const drop     = container.querySelector('#csv-drop');
  const btn      = container.querySelector('#csv-btn');
  const fileInfo = container.querySelector('#csv-file-info');
  const fileName = container.querySelector('#csv-file-name');
  const fileSize = container.querySelector('#csv-file-size');
  const dropMain = container.querySelector('#csv-drop-main');
  const dropIcon = container.querySelector('#csv-drop-icon');
  const resultEl = container.querySelector('#csv-result');

  const setFile = f => {
    file = f;
    // Update drop zone
    dropMain.textContent = f.name;
    dropMain.style.color = '#60a5fa';
    drop.style.borderColor = '#3b82f6';
    drop.style.background  = 'rgba(59,130,246,0.04)';
    dropIcon.innerHTML = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" style="display:block">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>`;
    // Show file info bar
    fileInfo.style.display = 'flex';
    fileName.textContent = f.name;
    fileSize.textContent = (f.size / 1024).toFixed(1) + ' KB';
    // Enable button
    btn.disabled = false;
    btn.style.opacity = '1';
    resultEl.style.display = 'none';
  };

  const clearFile = () => {
    file = null; input.value = '';
    dropMain.textContent = 'Click to select or drag & drop CSV';
    dropMain.style.color = '#7a90b0';
    drop.style.borderColor = '';
    drop.style.background  = '';
    dropIcon.innerHTML = `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2a3f5a" stroke-width="1.5" style="display:block">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`;
    fileInfo.style.display = 'none';
    btn.disabled = true;
    btn.style.opacity = '0.45';
    resultEl.style.display = 'none';
  };

  // Hover effect on drop zone
  drop.addEventListener('mouseenter', () => { if (!file) drop.style.borderColor = '#2a3f5a'; });
  drop.addEventListener('mouseleave', () => { if (!file) drop.style.borderColor = ''; });

  input.addEventListener('change', () => { if (input.files[0]) setFile(input.files[0]); });
  drop.addEventListener('dragover',  e => { e.preventDefault(); drop.style.borderColor = '#3b82f6'; drop.style.background = 'rgba(59,130,246,0.06)'; drop.classList.add('drag'); });
  drop.addEventListener('dragleave', () => { if (!file) { drop.style.borderColor = ''; drop.style.background = ''; } drop.classList.remove('drag'); });
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('drag');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  container.querySelector('#csv-clear-file').addEventListener('click', e => { e.preventDefault(); clearFile(); });

  bindPsych(container, 'csv-');

  // ── Import ─────────────────────────────────────────────────────────────────
  btn.addEventListener('click', async () => {
    if (!file) return;

    const psychOn = psychToggle.checked;
    let psych = null;

    if (psychOn) {
      psych = getPsychPayload(container, 'csv-');
      if (!psych) {
        toast('Please select Emotion Before Trade, or turn off Psychology for historical imports', 'error');
        container.querySelector('#csv-psych-emotion-before')?.focus();
        return;
      }
    }

    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-opacity="0.25"/><path d="M21 12a9 9 0 00-9-9"/></svg> Importing…`;
    btn.disabled = true;
    resultEl.style.display = 'none';

    const fd = new FormData();
    fd.append('file', file);
    const strategy = container.querySelector('#csv-strategy').value;
    const notes    = container.querySelector('#csv-notes').value.trim();
    if (strategy) fd.append('strategy', strategy);
    if (notes)    fd.append('notes',    notes);

    try {
      const res = await api.upload('/trades/import/csv', fd);
      if (psych && res.tradeIds?.length) {
        btn.innerHTML = '🧠 Saving psychology…';
        await applyPsychToTrades(res.tradeIds, psych);
      }
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div style="padding:0.875rem;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.25);border-radius:8px">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <div style="color:#22c55e;font-weight:600;font-size:0.875rem">${res.message}</div>
          </div>
          <div style="font-size:0.73rem;color:#7a90b0;line-height:1.6">
            Broker: <strong style="color:#c0cce0">${res.broker || 'Auto-detected'}</strong>
            &nbsp;·&nbsp; Closed: <strong style="color:#c0cce0">${res.closed || 0}</strong>
            &nbsp;·&nbsp; Open: <strong style="color:#c0cce0">${res.open || 0}</strong>
            ${res.skipped ? `&nbsp;·&nbsp; <span style="color:#eab308">${res.skipped} skipped</span>` : ''}
            ${psych ? `<div style="color:#c084fc;margin-top:3px">🧠 Psychology logged for all trades</div>` : ''}
          </div>
        </div>`;
      setTimeout(() => navigate('#trades'), 2000);
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div style="padding:0.875rem;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.25);border-radius:8px">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div style="color:#ef4444;font-weight:600;font-size:0.875rem">Import failed</div>
          </div>
          <div style="font-size:0.75rem;color:#7a90b0">${err.message}</div>
        </div>`;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Import Trades`;
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  });
}


// ── DHAN API TAB ──────────────────────────────────────────────────────────────
function renderDhan(container) {
  const today     = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  container.innerHTML = `
    <style>
      .dhan-wrap {
        max-width: 780px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      /* ── Header banner ── */
      .dhan-banner {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.1rem 1.25rem;
        background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.06));
        border: 1px solid rgba(59,130,246,0.25);
        border-radius: 14px;
        position: relative;
        overflow: hidden;
      }
      .dhan-banner::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent);
      }
      .dhan-banner-logo {
        width: 44px; height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.1rem; font-weight: 800; color: #fff;
        flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(99,102,241,0.35);
      }
      .dhan-banner-text { flex: 1; min-width: 0; }
      .dhan-banner-title {
        font-size: 0.95rem; font-weight: 700; color: #e8eeff;
        margin-bottom: 2px;
      }
      .dhan-banner-sub { font-size: 0.72rem; color: #7a90b0; }
      .dhan-banner-badge {
        padding: 3px 10px;
        background: rgba(34,197,94,0.12);
        border: 1px solid rgba(34,197,94,0.3);
        border-radius: 20px;
        font-size: 0.65rem; font-weight: 700;
        color: #22c55e; white-space: nowrap; flex-shrink: 0;
      }

      /* ── Main grid ── */
      .dhan-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        align-items: start;
      }
      @media (max-width: 640px) {
        .dhan-grid { grid-template-columns: 1fr; }
        .dhan-banner { flex-wrap: wrap; }
        .dhan-banner-badge { margin-top: 0.25rem; }
      }

      /* ── Credential card ── */
      .dhan-cred-card {
        background: #0a1220;
        border: 1px solid #1e2d45;
        border-radius: 14px;
        overflow: hidden;
      }
      .dhan-card-header {
        padding: 0.875rem 1.1rem;
        background: #080e1a;
        border-bottom: 1px solid #1e2d45;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .dhan-card-header-icon {
        width: 26px; height: 26px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .dhan-card-title { font-size: 0.82rem; font-weight: 700; color: #e8eeff; }
      .dhan-card-sub   { font-size: 0.65rem; color: #3a4f6a; margin-top: 1px; }
      .dhan-card-body  { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.875rem; }

      /* ── Token input with show/hide ── */
      .dhan-token-wrap { position: relative; }
      .dhan-token-wrap .input { padding-right: 2.5rem; }
      .dhan-token-eye {
        position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: #3a4f6a; cursor: pointer;
        padding: 0; line-height: 1;
        transition: color 0.15s;
      }
      .dhan-token-eye:hover { color: #7a90b0; }

      /* ── Date range row ── */
      .dhan-date-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.625rem;
      }

      /* ── Quick date chips ── */
      .dhan-date-chips {
        display: flex; flex-wrap: wrap; gap: 0.35rem;
      }
      .dhan-chip {
        padding: 0.25rem 0.7rem;
        background: #080c14;
        border: 1px solid #1e2d45;
        border-radius: 20px;
        font-size: 0.68rem; font-weight: 500; color: #7a90b0;
        cursor: pointer; transition: all 0.15s;
        white-space: nowrap;
      }
      .dhan-chip:hover, .dhan-chip.active {
        background: rgba(59,130,246,0.1);
        border-color: rgba(59,130,246,0.4);
        color: #60a5fa;
      }

      /* ── Info pills ── */
      .dhan-info {
        padding: 0.625rem 0.875rem;
        border-radius: 8px;
        font-size: 0.72rem;
        line-height: 1.6;
      }
      .dhan-info-blue {
        background: rgba(59,130,246,0.06);
        border: 1px solid rgba(59,130,246,0.18);
        color: #7a90b0;
      }
      .dhan-info-yellow {
        background: rgba(234,179,8,0.06);
        border: 1px solid rgba(234,179,8,0.2);
        color: #ca8a04;
        display: flex; align-items: center; gap: 0.4rem;
      }

      /* ── Sync button ── */
      .dhan-sync-btn {
        width: 100%;
        padding: 0.8rem;
        border-radius: 10px; border: none;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: #fff;
        font-size: 0.9rem; font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        transition: all 0.2s;
        box-shadow: 0 4px 20px rgba(59,130,246,0.3);
        letter-spacing: -0.01em;
      }
      .dhan-sync-btn:hover:not(:disabled) {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 6px 28px rgba(99,102,241,0.4);
      }
      .dhan-sync-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

      /* ── Result box ── */
      .dhan-result-ok {
        padding: 0.875rem 1rem;
        background: rgba(34,197,94,0.07);
        border: 1px solid rgba(34,197,94,0.25);
        border-radius: 10px;
      }
      .dhan-result-err {
        padding: 0.875rem 1rem;
        background: rgba(239,68,68,0.07);
        border: 1px solid rgba(239,68,68,0.25);
        border-radius: 10px;
      }
      .dhan-result-title { font-size: 0.875rem; font-weight: 700; margin-bottom: 4px; }
      .dhan-result-sub   { font-size: 0.75rem; color: #7a90b0; line-height: 1.5; }

      /* ── Psychology panel ── */
      .dhan-psych-card {
        background: #0a1220;
        border: 1px solid rgba(168,85,247,0.2);
        border-radius: 14px;
        overflow: hidden;
      }
      .dhan-psych-header {
        padding: 0.875rem 1.1rem;
        background: rgba(168,85,247,0.05);
        border-bottom: 1px solid rgba(168,85,247,0.15);
        display: flex; align-items: center; justify-content: space-between;
        gap: 0.75rem;
      }
      .dhan-psych-body { padding: 1.1rem; }

      /* Toggle pill */
      .dhan-toggle-wrap {
        display: flex; align-items: center; gap: 0.5rem;
        cursor: pointer; user-select: none; flex-shrink: 0;
      }
      .dhan-toggle-label { font-size: 0.72rem; font-weight: 600; transition: color 0.2s; }
      .dhan-toggle-track {
        position: relative; width: 40px; height: 22px;
      }
      .dhan-toggle-track input {
        opacity: 0; position: absolute; width: 100%; height: 100%;
        cursor: pointer; margin: 0; z-index: 1;
      }
      .dhan-toggle-bg {
        position: absolute; inset: 0; border-radius: 11px;
        background: #1e2d45; border: 1px solid #2a3f5a;
        transition: all 0.2s;
      }
      .dhan-toggle-thumb {
        position: absolute; top: 3px; left: 3px;
        width: 16px; height: 16px; border-radius: 50%;
        background: #3a4f6a; transition: all 0.2s;
      }

      /* ── How-to steps ── */
      .dhan-steps {
        background: #080c14;
        border: 1px solid #1e2d45;
        border-radius: 12px;
        padding: 1rem;
      }
      .dhan-steps-title {
        font-size: 0.75rem; font-weight: 700; color: #c0cce0;
        margin-bottom: 0.75rem;
        display: flex; align-items: center; gap: 0.375rem;
      }
      .dhan-step {
        display: flex; gap: 0.75rem; align-items: flex-start;
        margin-bottom: 0.625rem;
      }
      .dhan-step:last-child { margin-bottom: 0; }
      .dhan-step-num {
        width: 20px; height: 20px; border-radius: 50%;
        background: rgba(59,130,246,0.15);
        border: 1px solid rgba(59,130,246,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 0.62rem; font-weight: 700; color: #60a5fa;
        flex-shrink: 0; margin-top: 1px;
      }
      .dhan-step-text {
        font-size: 0.72rem; color: #7a90b0; line-height: 1.55;
      }
      .dhan-step-text strong { color: #c0cce0; }
      .dhan-step-text a { color: #60a5fa; text-decoration: none; }
      .dhan-step-text a:hover { text-decoration: underline; }
    </style>

    <div class="dhan-wrap fade-up">

      <!-- Banner -->
      <div class="dhan-banner">
        <div class="dhan-banner-logo">D</div>
        <div class="dhan-banner-text">
          <div class="dhan-banner-title">Dhan Broker Sync</div>
          <div class="dhan-banner-sub">Import your F&amp;O trades directly — no manual CSV export needed</div>
        </div>
        <div class="dhan-banner-badge">✓ Read-only · Safe</div>
      </div>

      <!-- Main grid -->
      <div class="dhan-grid">

        <!-- LEFT: Credentials + config -->
        <div style="display:flex;flex-direction:column;gap:1rem">

          <!-- Credentials -->
          <div class="dhan-cred-card">
            <div class="dhan-card-header">
              <div class="dhan-card-header-icon" style="background:rgba(59,130,246,0.15)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div>
                <div class="dhan-card-title">API Credentials</div>
                <div class="dhan-card-sub">Used only for this sync — never stored</div>
              </div>
            </div>
            <div class="dhan-card-body">
              <div class="field">
                <label>Client ID <span class="req">*</span></label>
                <input class="input" id="dhan-client-id" placeholder="Your Dhan client ID" autocomplete="off">
              </div>
              <div class="field">
                <label>Access Token <span class="req">*</span></label>
                <div class="dhan-token-wrap">
                  <input class="input" type="password" id="dhan-token" placeholder="Paste your access token" autocomplete="off">
                  <button class="dhan-token-eye" id="dhan-eye" type="button" title="Show/hide token">
                    <svg id="dhan-eye-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="dhan-info dhan-info-yellow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Token expires daily — regenerate each session
              </div>
            </div>
          </div>

          <!-- Date range -->
          <div class="dhan-cred-card">
            <div class="dhan-card-header">
              <div class="dhan-card-header-icon" style="background:rgba(34,197,94,0.12)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <div>
                <div class="dhan-card-title">Date Range</div>
                <div class="dhan-card-sub">Select the period to import</div>
              </div>
            </div>
            <div class="dhan-card-body">
              <!-- Quick chips -->
              <div>
                <div style="font-size:0.65rem;font-weight:600;color:#3a4f6a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem">Quick Select</div>
                <div class="dhan-date-chips">
                  <button class="dhan-chip" data-days="1">Today</button>
                  <button class="dhan-chip" data-days="7">Last 7d</button>
                  <button class="dhan-chip active" data-days="30">Last 30d</button>
                  <button class="dhan-chip" data-days="90">Last 90d</button>
                </div>
              </div>
              <!-- Custom range -->
              <div class="dhan-date-row">
                <div class="field" style="margin:0">
                  <label>From</label>
                  <input class="input" type="date" id="from-date" value="${thirtyAgo}">
                </div>
                <div class="field" style="margin:0">
                  <label>To</label>
                  <input class="input" type="date" id="to-date" value="${today}">
                </div>
              </div>
            </div>
          </div>

          <!-- Strategy + Notes -->
          <div class="dhan-cred-card">
            <div class="dhan-card-header">
              <div class="dhan-card-header-icon" style="background:rgba(168,85,247,0.12)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div class="dhan-card-title">Tag Imported Trades</div>
                <div class="dhan-card-sub">Applied to all synced trades</div>
              </div>
            </div>
            <div class="dhan-card-body">
              <div class="field" style="margin:0">
                <label>Strategy</label>
                <select class="input" id="dhan-strategy">
                  <option value="">No strategy tag…</option>
                  ${STRATEGIES.map(s => `<option>${s}</option>`).join('')}
                </select>
              </div>
              <div class="field" style="margin:0">
                <label>Notes</label>
                <textarea class="input" id="dhan-notes" rows="2"
                  placeholder="e.g. Weekly expiry trades · Dhan sync"
                  style="resize:none"></textarea>
              </div>
            </div>
          </div>

          <!-- Result -->
          <div id="dhan-result" style="display:none"></div>

          <!-- Sync button -->
          <button class="dhan-sync-btn" id="dhan-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Sync Trades from Dhan
          </button>
        </div>

        <!-- RIGHT: Psychology + How-to -->
        <div style="display:flex;flex-direction:column;gap:1rem">

          <!-- Psychology -->
          <div class="dhan-psych-card">
            <div class="dhan-psych-header">
              <div style="display:flex;align-items:center;gap:0.5rem;min-width:0">
                <span style="font-size:1.1rem;flex-shrink:0">🧠</span>
                <div style="min-width:0">
                  <div style="font-weight:700;font-size:0.85rem;color:#c084fc">Trade Psychology</div>
                  <div id="dhan-psych-sub" style="font-size:0.65rem;color:#7a90b0;margin-top:1px">Auto-enabled for today's trades</div>
                </div>
              </div>
              <label class="dhan-toggle-wrap">
                <span class="dhan-toggle-label" id="dhan-psych-toggle-label" style="color:#7a90b0">Off</span>
                <div class="dhan-toggle-track">
                  <input type="checkbox" id="dhan-psych-toggle">
                  <div class="dhan-toggle-bg" id="dhan-psych-track"></div>
                  <div class="dhan-toggle-thumb" id="dhan-psych-thumb"></div>
                </div>
              </label>
            </div>

            <div id="dhan-psych-fields" style="display:none;padding:1.1rem">
              ${psychHTML('dhan-', false)}
            </div>

            <div id="dhan-psych-off-msg" style="padding:1.25rem;text-align:center">
              <div style="font-size:1.5rem;margin-bottom:0.5rem;opacity:0.35">📅</div>
              <div style="font-size:0.8rem;font-weight:600;color:#3a4f6a;margin-bottom:0.25rem">Psychology off</div>
              <div style="font-size:0.7rem;color:#2a3f5a;line-height:1.55">
                Best for historical imports.<br>
                Toggle on when syncing today's trades.
              </div>
            </div>
          </div>

          <!-- When to use psychology -->
          <div style="padding:0.875rem;background:#080c14;border:1px solid #1e2d45;border-radius:12px">
            <div style="font-size:0.72rem;font-weight:700;color:#c0cce0;margin-bottom:0.625rem;display:flex;align-items:center;gap:0.375rem">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              When to enable psychology
            </div>
            <div style="display:flex;flex-direction:column;gap:0.4rem">
              <div style="display:flex;gap:0.5rem;font-size:0.72rem">
                <span style="color:#22c55e;flex-shrink:0">✓</span>
                <span style="color:#7a90b0"><strong style="color:#c0cce0">Today's trades</strong> — turn ON to log emotions &amp; mistakes</span>
              </div>
              <div style="display:flex;gap:0.5rem;font-size:0.72rem">
                <span style="color:#3a4f6a;flex-shrink:0">–</span>
                <span style="color:#3a4f6a"><strong style="color:#475569">Historical</strong> — keep OFF, just import records</span>
              </div>
            </div>
          </div>

          <!-- How-to steps -->
          <div class="dhan-steps">
            <div class="dhan-steps-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              How to get your Dhan credentials
            </div>
            <div class="dhan-step">
              <div class="dhan-step-num">1</div>
              <div class="dhan-step-text">Login at <a href="https://web.dhan.co" target="_blank">web.dhan.co</a> or open the Dhan app</div>
            </div>
            <div class="dhan-step">
              <div class="dhan-step-num">2</div>
              <div class="dhan-step-text">Go to <strong>My Profile → Access Token</strong></div>
            </div>
            <div class="dhan-step">
              <div class="dhan-step-num">3</div>
              <div class="dhan-step-text">Copy your <strong>Client ID</strong> and click <strong>Generate Token</strong></div>
            </div>
            <div class="dhan-step">
              <div class="dhan-step-num">4</div>
              <div class="dhan-step-text">Paste both above and click Sync — we fetch <strong>F&amp;O trades only</strong>, read-only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── Show/hide token ──────────────────────────────────────────────────────────
  const tokenInput = container.querySelector('#dhan-token');
  const eyeBtn     = container.querySelector('#dhan-eye');
  const eyeIcon    = container.querySelector('#dhan-eye-icon');
  let tokenVisible = false;
  eyeBtn.addEventListener('click', () => {
    tokenVisible = !tokenVisible;
    tokenInput.type = tokenVisible ? 'text' : 'password';
    eyeIcon.innerHTML = tokenVisible
      ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });

  // ── Quick date chips ─────────────────────────────────────────────────────────
  const fromInput = container.querySelector('#from-date');
  const toInput   = container.querySelector('#to-date');
  container.querySelectorAll('.dhan-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.dhan-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const days = parseInt(chip.dataset.days);
      const to   = new Date();
      const from = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
      toInput.value   = to.toISOString().slice(0, 10);
      fromInput.value = from.toISOString().slice(0, 10);
      checkDateAndSetPsych();
    });
  });
  // Deselect chip when dates changed manually
  [fromInput, toInput].forEach(inp => {
    inp.addEventListener('change', () => {
      container.querySelectorAll('.dhan-chip').forEach(c => c.classList.remove('active'));
      checkDateAndSetPsych();
    });
  });

  // ── Psychology smart toggle ────────────────────────────────────────────────
  const psychToggle = container.querySelector('#dhan-psych-toggle');
  const psychFields = container.querySelector('#dhan-psych-fields');
  const psychOffMsg = container.querySelector('#dhan-psych-off-msg');
  const psychTrack  = container.querySelector('#dhan-psych-track');
  const psychThumb  = container.querySelector('#dhan-psych-thumb');
  const toggleLabel = container.querySelector('#dhan-psych-toggle-label');

  function setDhanPsychToggle(on) {
    psychToggle.checked = on;
    if (on) {
      psychFields.style.display = 'block';
      psychOffMsg.style.display = 'none';
      psychTrack.style.background  = '#7c3aed';
      psychTrack.style.borderColor = '#a855f7';
      psychThumb.style.background  = '#fff';
      psychThumb.style.left        = '21px';
      toggleLabel.textContent      = 'On';
      toggleLabel.style.color      = '#c084fc';
    } else {
      psychFields.style.display = 'none';
      psychOffMsg.style.display = 'block';
      psychTrack.style.background  = '#1e2d45';
      psychTrack.style.borderColor = '#2a3f5a';
      psychThumb.style.background  = '#3a4f6a';
      psychThumb.style.left        = '3px';
      toggleLabel.textContent      = 'Off';
      toggleLabel.style.color      = '#7a90b0';
    }
  }

  function checkDateAndSetPsych() {
    const isToday = toInput.value === today;
    setDhanPsychToggle(isToday);
  }
  checkDateAndSetPsych();
  psychToggle.addEventListener('change', () => setDhanPsychToggle(psychToggle.checked));
  bindPsych(container, 'dhan-');

  // ── Sync ──────────────────────────────────────────────────────────────────
  const btn      = container.querySelector('#dhan-btn');
  const resultEl = container.querySelector('#dhan-result');

  btn.addEventListener('click', async () => {
    const clientId = container.querySelector('#dhan-client-id').value.trim();
    const token    = tokenInput.value.trim();
    if (!clientId) return toast('Client ID is required', 'error');
    if (!token)    return toast('Access Token is required', 'error');

    const psychOn = psychToggle.checked;
    let psych = null;
    if (psychOn) {
      psych = getPsychPayload(container, 'dhan-');
      if (!psych) {
        toast('Please select Emotion Before Trade, or turn off Psychology', 'error');
        container.querySelector('#dhan-psych-emotion-before')?.focus();
        return;
      }
    }

    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           style="animation:spin 1s linear infinite">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-opacity="0.25"/>
        <path d="M21 12a9 9 0 00-9-9"/>
      </svg>
      Syncing…`;
    btn.disabled = true;
    resultEl.style.display = 'none';

    const strategy = container.querySelector('#dhan-strategy').value;
    const notes    = container.querySelector('#dhan-notes').value.trim();

    try {
      const res = await api.post('/trades/import/broker', {
        broker: 'dhan', clientId, accessToken: token,
        fromDate: fromInput.value, toDate: toInput.value,
        strategy, notes,
      });

      if (psych && res.tradeIds?.length) {
        btn.innerHTML = '🧠 Saving psychology…';
        await applyPsychToTrades(res.tradeIds, psych);
      }

      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="dhan-result-ok">
          <div class="dhan-result-title" style="color:#22c55e;display:flex;align-items:center;gap:0.4rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ${res.message}
          </div>
          <div class="dhan-result-sub">
            Closed: <strong style="color:#c0cce0">${res.closed || 0}</strong>
            &nbsp;·&nbsp; Open: <strong style="color:#c0cce0">${res.open || 0}</strong>
            ${res.skipped ? `&nbsp;·&nbsp; <span style="color:#eab308">${res.skipped} skipped</span>` : ''}
            ${strategy ? `&nbsp;·&nbsp; Strategy: <strong style="color:#c0cce0">${strategy}</strong>` : ''}
            ${psych ? `<div style="color:#c084fc;margin-top:4px">🧠 Psychology logged for all trades</div>` : ''}
          </div>
        </div>`;
      setTimeout(() => navigate('#trades'), 1800);
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="dhan-result-err">
          <div class="dhan-result-title" style="color:#ef4444">Sync failed</div>
          <div class="dhan-result-sub">
            ${err.message}
            <div style="margin-top:6px;color:#3a4f6a">Check: correct Client ID? Token expired? Date range has F&amp;O trades?</div>
          </div>
        </div>`;
      btn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
        </svg>
        Sync Trades from Dhan`;
      btn.disabled = false;
    }
  });
}