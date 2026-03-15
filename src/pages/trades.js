import { api } from '../lib/api.js';
import { toast } from '../lib/toast.js';
import { fmtINR, fmtDate, badge, pnlSpan } from '../lib/utils.js';

let filters = { status: '', optionType: '', symbol: '', from: '', to: '' };

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
  { value: '',              label: 'Select emotion…'  },
  { value: 'satisfied',    label: '😊  Satisfied'     },
  { value: 'neutral',      label: '😐  Neutral'       },
  { value: 'disappointed', label: '😞  Disappointed'  },
  { value: 'regret',       label: '😔  Regret'        },
  { value: 'angry',        label: '😠  Angry'         },
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

export async function renderTrades(container) {
  container.innerHTML = `
    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem" class="fade-up">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem">
        <div>
          <h1 class="page-title">Trade Book</h1>
          <p class="page-sub" id="trade-count">Loading…</p>
        </div>
        <div style="display:flex;gap:0.625rem">
          <button class="btn btn-secondary" id="import-csv-btn" style="display:flex;align-items:center;gap:0.4rem">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import CSV
          </button>
          <button class="btn btn-primary" id="add-btn" style="display:flex;align-items:center;gap:0.4rem">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            Add Trade
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end;padding:1rem">
        <div class="field" style="flex:1;min-width:140px">
          <label>Search symbol</label>
          <input class="input" id="f-symbol" placeholder="NIFTY, BANKNIFTY…" value="${filters.symbol}">
        </div>
        <div class="field" style="min-width:120px">
          <label>Status</label>
          <select class="input" id="f-status">
            <option value="">All</option>
            <option value="OPEN"    ${filters.status==='OPEN'   ?'selected':''}>Open</option>
            <option value="CLOSED"  ${filters.status==='CLOSED' ?'selected':''}>Closed</option>
            <option value="EXPIRED" ${filters.status==='EXPIRED'?'selected':''}>Expired</option>
          </select>
        </div>
        <div class="field" style="min-width:110px">
          <label>Option type</label>
          <select class="input" id="f-type">
            <option value="">CE + PE</option>
            <option value="CE" ${filters.optionType==='CE'?'selected':''}>CE (Call)</option>
            <option value="PE" ${filters.optionType==='PE'?'selected':''}>PE (Put)</option>
          </select>
        </div>
        <div class="field" style="min-width:130px">
          <label>From date</label>
          <input class="input" type="date" id="f-from" value="${filters.from}">
        </div>
        <div class="field" style="min-width:130px">
          <label>To date</label>
          <input class="input" type="date" id="f-to" value="${filters.to}">
        </div>
        <button class="btn btn-secondary btn-sm" id="clear-btn" style="margin-bottom:2px">Clear</button>
      </div>

      <div id="trades-wrap"></div>
    </div>

    <!-- ══ Close Trade Modal ══ -->
    <div id="close-modal" class="modal-backdrop" style="display:none">
      <div class="modal fade-up">
        <button id="close-modal-x" style="position:absolute;top:0.875rem;right:0.875rem;background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem">✕</button>
        <div style="font-weight:600;font-size:1rem;color:#e8eeff;margin-bottom:0.25rem">Close Trade</div>
        <div id="modal-trade-info" style="font-size:0.78rem;color:#7a90b0;margin-bottom:1.125rem"></div>
        <div style="display:flex;flex-direction:column;gap:0.875rem">
          <div class="field"><label>Exit Price ₹</label><input class="input" type="number" step="0.05" id="modal-exit-price" placeholder="Exit price per unit" autofocus></div>
          <div class="field"><label>Exit Date</label><input class="input" type="date" id="modal-exit-date" value="${new Date().toISOString().slice(0,10)}"></div>
          <div class="field"><label>Charges ₹</label><input class="input" type="number" id="modal-charges" value="20"></div>
        </div>
        <div id="modal-pnl" style="display:none;margin-top:0.875rem;padding:0.625rem 0.875rem;border-radius:7px;font-size:0.82rem"></div>
        <div style="display:flex;gap:0.625rem;margin-top:1.125rem">
          <button class="btn btn-secondary" id="modal-cancel" style="flex:1;justify-content:center">Cancel</button>
          <button class="btn btn-primary"   id="modal-confirm" style="flex:1;justify-content:center">Close Trade</button>
        </div>
      </div>
    </div>

    <!-- ══ Edit Strategy Modal ══ -->
    <div id="strategy-modal" class="modal-backdrop" style="display:none">
      <div class="modal fade-up" style="max-width:420px">
        <button id="strategy-modal-x" style="position:absolute;top:0.875rem;right:0.875rem;background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem">✕</button>
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
          <span style="font-size:1rem">🎯</span>
          <div style="font-weight:600;font-size:1rem;color:#e8eeff">Edit Strategy &amp; Notes</div>
        </div>
        <div id="strategy-modal-trade-info" style="font-size:0.78rem;color:#7a90b0;margin-bottom:1.25rem"></div>

        <div style="display:flex;flex-direction:column;gap:0.875rem">
          <div class="field">
            <label>Strategy</label>
            <select class="input" id="sm-strategy">
              <option value="">No strategy</option>
              ${STRATEGIES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Setup Type</label>
            <input class="input" id="sm-setup" placeholder="e.g. Breakout, Reversal, Range…">
          </div>
          <div class="field">
            <label>Tags <span style="font-weight:400;color:#3a4f6a;font-size:0.68rem">(comma separated)</span></label>
            <input class="input" id="sm-tags" placeholder="e.g. expiry, hedged, trend">
          </div>
          <div class="field">
            <label>Notes</label>
            <textarea class="input" id="sm-notes" rows="3" placeholder="Trade rationale, lessons learnt…"></textarea>
          </div>
          <div class="field">
            <label>Rating</label>
            <div style="display:flex;gap:0.4rem" id="sm-rating-stars">
              ${[1,2,3,4,5].map(n => `
                <button type="button" class="star-btn" data-val="${n}"
                  style="background:none;border:none;cursor:pointer;font-size:1.4rem;color:#1e2d45;transition:color 0.1s;padding:0.1rem">
                  ★
                </button>`).join('')}
            </div>
          </div>
        </div>

        <div style="display:flex;gap:0.625rem;margin-top:1.25rem">
          <button class="btn btn-secondary" id="strategy-modal-cancel" style="flex:1;justify-content:center">Cancel</button>
          <button class="btn btn-primary"   id="strategy-modal-save"   style="flex:1;justify-content:center">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- ══ Psychology Edit Modal ══ -->
    <div id="psych-modal" class="modal-backdrop" style="display:none">
      <div class="modal fade-up" style="max-width:520px;max-height:90vh;overflow-y:auto">
        <button id="psych-modal-x" style="position:absolute;top:0.875rem;right:0.875rem;background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem">✕</button>
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
          <span style="font-size:1rem">🧠</span>
          <div style="font-weight:600;font-size:1rem;color:#c084fc">Edit Psychology</div>
        </div>
        <div id="psych-modal-trade-info" style="font-size:0.78rem;color:#7a90b0;margin-bottom:1.25rem"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.875rem;margin-bottom:0.875rem">
          <div class="field">
            <label style="color:#c084fc">Emotion Before</label>
            <select class="input" id="pm-emotion-before" style="border-color:rgba(168,85,247,0.3)">
              ${EMOTIONS_BEFORE.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label style="color:#c084fc">Emotion After</label>
            <select class="input" id="pm-emotion-after" style="border-color:rgba(168,85,247,0.3)">
              ${EMOTIONS_AFTER.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="field" style="margin-bottom:0.875rem">
          <label style="color:#c084fc;display:flex;justify-content:space-between">
            <span>Discipline Rating</span>
            <span id="pm-disc-val" style="font-family:'JetBrains Mono',monospace;font-weight:700">5 / 10</span>
          </label>
          <input type="range" id="pm-discipline" min="1" max="10" value="5"
                 style="width:100%;accent-color:#a855f7;cursor:pointer;height:6px;margin-top:4px">
          <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:#3a4f6a;margin-top:3px">
            <span>1 — No discipline</span><span>10 — Perfect</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.875rem;
                    background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.15);
                    border-radius:8px;margin-bottom:0.875rem">
          <div style="font-size:0.82rem;font-weight:500;color:#c0cce0">Followed Trading Plan?</div>
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none">
            <span id="pm-plan-label" style="font-size:0.78rem;color:#7a90b0">Not set</span>
            <div style="position:relative;width:44px;height:24px">
              <input type="checkbox" id="pm-followed-plan"
                     style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0;z-index:1">
              <div id="pm-plan-track" style="position:absolute;inset:0;border-radius:12px;background:#1e2d45;transition:background 0.2s;border:1px solid #2a3f5a"></div>
              <div id="pm-plan-thumb" style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#3a4f6a;transition:all 0.2s"></div>
            </div>
          </label>
        </div>

        <div class="field" style="margin-bottom:0.875rem">
          <label style="color:#c084fc">Mistake Tags</label>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.4rem" id="pm-mistake-tags">
            ${MISTAKE_TAGS.map(m => `
              <button type="button" class="pm-mistake-tag" data-value="${m.value}"
                style="padding:0.3rem 0.7rem;border-radius:20px;border:1px solid #2a3f5a;
                       background:#080c14;color:#7a90b0;font-size:0.72rem;font-weight:500;cursor:pointer;transition:all 0.15s">
                ${m.label}
              </button>`).join('')}
          </div>
        </div>

        <div class="field" style="margin-bottom:1.125rem">
          <label style="color:#c084fc">Psychology Notes</label>
          <textarea class="input" id="pm-notes" rows="3"
            style="border-color:rgba(168,85,247,0.3)"
            placeholder="What were you thinking? What could you do better?"></textarea>
        </div>

        <div style="display:flex;gap:0.625rem">
          <button class="btn btn-secondary" id="psych-modal-cancel" style="flex:1;justify-content:center">Cancel</button>
          <button class="btn btn-primary"   id="psych-modal-save"   style="flex:1;justify-content:center;background:rgba(168,85,247,0.2);border-color:#a855f7">Save Psychology</button>
        </div>
      </div>
    </div>

    <!-- ══ Quick CSV Import Modal ══ -->
    <div id="csv-modal" class="modal-backdrop" style="display:none">
      <div class="modal fade-up" style="max-width:560px;width:95vw;padding:0;overflow:hidden;border-radius:14px">

        <!-- Header -->
        <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #1e2d45;display:flex;align-items:center;justify-content:space-between;background:#080e1a">
          <div style="display:flex;align-items:center;gap:0.625rem">
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:0.95rem;color:#e8eeff">Import CSV</div>
              <div style="font-size:0.65rem;color:#3a4f6a">Auto-detects 13 brokers · Options trades only</div>
            </div>
          </div>
          <button id="csv-modal-x" style="background:none;border:none;color:#7a90b0;cursor:pointer;font-size:1.1rem;padding:0.25rem">✕</button>
        </div>

        <!-- Body -->
        <div style="padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:1rem">

          <!-- Drop zone -->
          <label class="csv-drop" id="cm-drop" for="cm-file-input" style="padding:1.5rem">
            <div id="cm-drop-icon" style="margin-bottom:0.625rem">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3a4f6a" stroke-width="1.5" style="display:block;margin:0 auto">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div id="cm-drop-label" style="font-size:0.88rem;font-weight:500;color:#7a90b0">Click to select or drag &amp; drop your CSV</div>
            <div style="font-size:0.68rem;color:#3a4f6a;margin-top:3px">Supports Zerodha, Upstox, Dhan, Angel, Fyers, Groww &amp; 7 more</div>
            <input type="file" id="cm-file-input" accept=".csv,.CSV" style="display:none">
          </label>

          <!-- File info bar (hidden until file selected) -->
          <div id="cm-file-info" style="display:none;padding:0.625rem 0.875rem;background:#080c14;border:1px solid #1e2d45;border-radius:8px;display:none;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span id="cm-file-name" style="font-size:0.8rem;color:#c0cce0;font-weight:500"></span>
            </div>
            <span id="cm-file-size" style="font-size:0.72rem;color:#3a4f6a"></span>
          </div>

          <!-- Strategy + Notes row -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            <div class="field">
              <label>Strategy <span style="font-weight:400;color:#3a4f6a">(optional)</span></label>
              <select class="input" id="cm-strategy">
                <option value="">No strategy tag</option>
                ${STRATEGIES.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>Notes <span style="font-weight:400;color:#3a4f6a">(optional)</span></label>
              <input class="input" id="cm-notes" placeholder="e.g. Monthly F&O import">
            </div>
          </div>

          <!-- Psychology toggle -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.625rem 0.875rem;
                      background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.2);border-radius:8px">
            <div>
              <div style="font-size:0.82rem;font-weight:500;color:#c0cce0">Log Psychology</div>
              <div style="font-size:0.67rem;color:#7a90b0;margin-top:1px">Turn off for historical imports</div>
            </div>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none">
              <span id="cm-psych-lbl" style="font-size:0.72rem;color:#c084fc">On</span>
              <div style="position:relative;width:40px;height:22px">
                <input type="checkbox" id="cm-psych-toggle" checked
                       style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0;z-index:1">
                <div id="cm-psych-track" style="position:absolute;inset:0;border-radius:11px;background:#7c3aed;transition:background 0.2s;border:1px solid #a855f7"></div>
                <div id="cm-psych-thumb" style="position:absolute;top:3px;left:21px;width:16px;height:16px;border-radius:50%;background:#fff;transition:all 0.2s"></div>
              </div>
            </label>
          </div>

          <!-- Emotion (shown when psych is on) -->
          <div id="cm-emotion-wrap" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            <div class="field">
              <label style="color:#c084fc">Emotion Before</label>
              <select class="input" id="cm-emotion-before" style="border-color:rgba(168,85,247,0.3)">
                ${EMOTIONS_BEFORE.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label style="color:#c084fc">Emotion After</label>
              <select class="input" id="cm-emotion-after" style="border-color:rgba(168,85,247,0.3)">
                ${EMOTIONS_AFTER.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Result -->
          <div id="cm-result" style="display:none"></div>
        </div>

        <!-- Footer -->
        <div style="padding:1rem 1.5rem;border-top:1px solid #1e2d45;display:flex;gap:0.75rem;background:#080e1a">
          <button class="btn btn-secondary" id="cm-cancel" style="flex:1;justify-content:center">Cancel</button>
          <button class="btn btn-primary"   id="cm-import" style="flex:1;justify-content:center" disabled>
            Import Trades
          </button>
        </div>
      </div>
    </div>
  `;

  // ── Button wiring ──────────────────────────────────────────────────────────
  container.querySelector('#add-btn').addEventListener('click', () => { window.location.hash = '#add-trade'; });
  container.querySelector('#import-csv-btn').addEventListener('click', () => openCsvModal());

  // ── Filters ────────────────────────────────────────────────────────────────
  ['f-symbol','f-status','f-type','f-from','f-to'].forEach(id => {
    const el  = container.querySelector(`#${id}`);
    const key = { 'f-symbol':'symbol','f-status':'status','f-type':'optionType','f-from':'from','f-to':'to' }[id];
    el.addEventListener('change', () => { filters[key] = el.value; load(1); });
    if (id === 'f-symbol') el.addEventListener('keyup', () => { filters[key] = el.value; load(1); });
  });
  container.querySelector('#clear-btn').addEventListener('click', () => {
    filters = { status:'',optionType:'',symbol:'',from:'',to:'' };
    ['f-symbol','f-status','f-type','f-from','f-to'].forEach(id => { container.querySelector(`#${id}`).value = ''; });
    load(1);
  });

  // ══ Close Trade Modal ══════════════════════════════════════════════════════
  let activeTrade = null;
  const closeModal = container.querySelector('#close-modal');
  const modalPnl   = container.querySelector('#modal-pnl');

  const hideCloseModal = () => { closeModal.style.display = 'none'; activeTrade = null; };
  container.querySelector('#close-modal-x').addEventListener('click', hideCloseModal);
  container.querySelector('#modal-cancel').addEventListener('click', hideCloseModal);
  closeModal.addEventListener('click', e => { if (e.target === closeModal) hideCloseModal(); });

  container.querySelector('#modal-exit-price').addEventListener('input', function () {
    if (!activeTrade) return;
    const ep      = parseFloat(this.value);
    const charges = parseFloat(container.querySelector('#modal-charges').value || 0);
    if (!isNaN(ep)) {
      const mult  = activeTrade.tradeType === 'BUY' ? 1 : -1;
      const pnl   = mult * (ep - activeTrade.entryPrice) * activeTrade.quantity * activeTrade.lotSize - charges;
      const color = pnl >= 0 ? '#22c55e' : '#ef4444';
      modalPnl.style.display    = 'block';
      modalPnl.style.background = pnl >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
      modalPnl.style.border     = `1px solid ${color}40`;
      modalPnl.innerHTML = `<div style="display:flex;justify-content:space-between"><span style="color:#7a90b0">Est. Net P&L</span><span style="color:${color};font-family:'JetBrains Mono',monospace;font-weight:700">${fmtINR(pnl,true)}</span></div>`;
    }
  });

  container.querySelector('#modal-confirm').addEventListener('click', async () => {
    if (!activeTrade) return;
    const exitPrice = parseFloat(container.querySelector('#modal-exit-price').value);
    if (isNaN(exitPrice)) return toast('Enter a valid exit price', 'error');
    const btn = container.querySelector('#modal-confirm');
    btn.textContent = 'Closing…'; btn.disabled = true;
    try {
      await api.put(`/trades/${activeTrade._id}`, {
        exitPrice, status: 'CLOSED',
        exitDate: container.querySelector('#modal-exit-date').value,
        charges:  parseFloat(container.querySelector('#modal-charges').value || 0),
      });
      toast('Trade closed!'); hideCloseModal(); load();
    } catch (err) {
      toast(err.message, 'error'); btn.textContent = 'Close Trade'; btn.disabled = false;
    }
  });

  // ══ Edit Strategy Modal ════════════════════════════════════════════════════
  let stratTradeId = null;
  const stratModal = container.querySelector('#strategy-modal');
  let currentRating = 0;

  const hideStratModal = () => { stratModal.style.display = 'none'; stratTradeId = null; };
  container.querySelector('#strategy-modal-x').addEventListener('click', hideStratModal);
  container.querySelector('#strategy-modal-cancel').addEventListener('click', hideStratModal);
  stratModal.addEventListener('click', e => { if (e.target === stratModal) hideStratModal(); });

  // Star rating
  const stars = container.querySelectorAll('.star-btn');
  function setStars(val) {
    currentRating = val;
    stars.forEach(s => {
      s.style.color = parseInt(s.dataset.val) <= val ? '#eab308' : '#1e2d45';
    });
  }
  stars.forEach(s => {
    s.addEventListener('click', () => setStars(parseInt(s.dataset.val)));
    s.addEventListener('mouseenter', () => stars.forEach(x => { x.style.color = parseInt(x.dataset.val) <= parseInt(s.dataset.val) ? '#eab308cc' : '#1e2d45'; }));
    s.addEventListener('mouseleave', () => setStars(currentRating));
  });

  function openStratModal(trade) {
    stratTradeId = trade._id;
    container.querySelector('#strategy-modal-trade-info').textContent =
      `${trade.symbol || trade.underlying} · ${trade.tradeType} ${trade.optionType} @ ₹${trade.entryPrice} · ${fmtDate(trade.entryDate)}`;
    const sel = container.querySelector('#sm-strategy');
    sel.value = trade.strategy || '';
    container.querySelector('#sm-setup').value = trade.setupType || '';
    container.querySelector('#sm-tags').value  = (trade.tags || []).join(', ');
    container.querySelector('#sm-notes').value = trade.notes || '';
    setStars(trade.rating || 0);
    stratModal.style.display = 'flex';
  }

  container.querySelector('#strategy-modal-save').addEventListener('click', async () => {
    if (!stratTradeId) return;
    const btn = container.querySelector('#strategy-modal-save');
    btn.textContent = 'Saving…'; btn.disabled = true;
    try {
      const tagsRaw = container.querySelector('#sm-tags').value;
      await api.put(`/trades/${stratTradeId}`, {
        strategy:  container.querySelector('#sm-strategy').value,
        setupType: container.querySelector('#sm-setup').value.trim(),
        tags:      tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
        notes:     container.querySelector('#sm-notes').value.trim(),
        rating:    currentRating || undefined,
      });
      toast('Strategy updated! 🎯'); hideStratModal(); load();
    } catch (err) { toast(err.message, 'error'); }
    btn.textContent = 'Save Changes'; btn.disabled = false;
  });

  // ══ Psychology Modal ═══════════════════════════════════════════════════════
  let psychTradeId = null;
  const psychModal = container.querySelector('#psych-modal');

  const hidePsychModal = () => { psychModal.style.display = 'none'; psychTradeId = null; };
  container.querySelector('#psych-modal-x').addEventListener('click', hidePsychModal);
  container.querySelector('#psych-modal-cancel').addEventListener('click', hidePsychModal);
  psychModal.addEventListener('click', e => { if (e.target === psychModal) hidePsychModal(); });

  const pmSlider  = container.querySelector('#pm-discipline');
  const pmDiscVal = container.querySelector('#pm-disc-val');
  pmSlider.addEventListener('input', () => {
    const v = pmSlider.value;
    pmDiscVal.textContent = `${v} / 10`;
    pmDiscVal.style.color = v >= 7 ? '#22c55e' : v >= 4 ? '#eab308' : '#ef4444';
  });

  const pmChk = container.querySelector('#pm-followed-plan');
  pmChk.addEventListener('change', () => {
    const lbl = container.querySelector('#pm-plan-label');
    const trk = container.querySelector('#pm-plan-track');
    const thm = container.querySelector('#pm-plan-thumb');
    if (pmChk.checked) {
      lbl.textContent = 'Yes ✓'; lbl.style.color = '#22c55e';
      trk.style.background = '#16a34a'; trk.style.borderColor = '#22c55e';
      thm.style.background = '#fff'; thm.style.left = '23px';
    } else {
      lbl.textContent = 'No ✗'; lbl.style.color = '#ef4444';
      trk.style.background = '#7f1d1d'; trk.style.borderColor = '#ef4444';
      thm.style.background = '#fff'; thm.style.left = '3px';
    }
  });

  container.querySelector('#pm-mistake-tags').addEventListener('click', e => {
    const btn = e.target.closest('.pm-mistake-tag'); if (!btn) return;
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

  container.querySelector('#psych-modal-save').addEventListener('click', async () => {
    if (!psychTradeId) return;
    const btn  = container.querySelector('#psych-modal-save');
    btn.textContent = 'Saving…'; btn.disabled = true;
    const tags = [...container.querySelectorAll('.pm-mistake-tag[data-active="true"]')].map(b => b.dataset.value);
    try {
      await api.post(`/trades/${psychTradeId}/psychology`, {
        emotionBefore:    container.querySelector('#pm-emotion-before').value,
        emotionAfter:     container.querySelector('#pm-emotion-after').value,
        disciplineRating: parseInt(pmSlider.value),
        followedPlan:     pmChk.checked,
        mistakeTags:      tags,
        notes:            container.querySelector('#pm-notes').value.trim(),
      });
      toast('Psychology saved! 🧠'); hidePsychModal(); load();
    } catch (err) { toast(err.message, 'error'); }
    btn.textContent = 'Save Psychology'; btn.disabled = false;
  });

  function openPsychModal(trade) {
    psychTradeId = trade._id;
    container.querySelector('#psych-modal-trade-info').textContent =
      `${trade.symbol || trade.underlying} · ${trade.tradeType} ${trade.optionType} @ ₹${trade.entryPrice} · ${fmtDate(trade.entryDate)}`;
    const p = trade.psychology || {};
    container.querySelectorAll('.pm-mistake-tag').forEach(btn => {
      btn.dataset.active = 'false';
      btn.style.background = '#080c14'; btn.style.color = '#7a90b0'; btn.style.borderColor = '#2a3f5a';
    });
    container.querySelector('#pm-emotion-before').value = p.emotionBefore || '';
    container.querySelector('#pm-emotion-after').value  = p.emotionAfter  || '';
    pmSlider.value = p.disciplineRating || 5;
    pmDiscVal.textContent = `${pmSlider.value} / 10`;
    pmDiscVal.style.color = pmSlider.value >= 7 ? '#22c55e' : pmSlider.value >= 4 ? '#eab308' : '#ef4444';
    pmChk.checked = p.followedPlan || false;
    pmChk.dispatchEvent(new Event('change'));
    container.querySelector('#pm-notes').value = p.notes || '';
    (p.mistakeTags || []).forEach(val => {
      const btn     = container.querySelector(`.pm-mistake-tag[data-value="${val}"]`);
      const tagData = MISTAKE_TAGS.find(m => m.value === val);
      if (btn) {
        btn.dataset.active = 'true';
        btn.style.background  = (tagData?.color || '#a855f7') + '22';
        btn.style.color       = tagData?.color || '#a855f7';
        btn.style.borderColor = tagData?.color || '#a855f7';
      }
    });
    psychModal.style.display = 'flex';
  }

  // ══ Quick CSV Import Modal ═════════════════════════════════════════════════
  const csvModal   = container.querySelector('#csv-modal');
  const cmDrop     = container.querySelector('#cm-drop');
  const cmInput    = container.querySelector('#cm-file-input');
  const cmImport   = container.querySelector('#cm-import');
  const cmResult   = container.querySelector('#cm-result');
  const cmFileInfo = container.querySelector('#cm-file-info');
  const cmFileName = container.querySelector('#cm-file-name');
  const cmFileSize = container.querySelector('#cm-file-size');
  const cmDropLbl  = container.querySelector('#cm-drop-label');
  const cmPsychToggle = container.querySelector('#cm-psych-toggle');
  const cmEmotionWrap = container.querySelector('#cm-emotion-wrap');
  const cmPsychLbl    = container.querySelector('#cm-psych-lbl');
  const cmPsychTrack  = container.querySelector('#cm-psych-track');
  const cmPsychThumb  = container.querySelector('#cm-psych-thumb');

  let csvFile = null;

  function openCsvModal() {
    csvFile = null; cmImport.disabled = true;
    cmResult.style.display = 'none';
    cmFileInfo.style.display = 'none';
    cmDropLbl.textContent = 'Click to select or drag & drop your CSV';
    cmDrop.style.borderColor = '';
    cmDrop.style.background  = '';
    csvModal.style.display = 'flex';
  }

  const hideCsvModal = () => { csvModal.style.display = 'none'; };
  container.querySelector('#csv-modal-x').addEventListener('click', hideCsvModal);
  container.querySelector('#cm-cancel').addEventListener('click', hideCsvModal);
  csvModal.addEventListener('click', e => { if (e.target === csvModal) hideCsvModal(); });

  function setFile(f) {
    csvFile = f;
    cmDropLbl.textContent = f.name;
    cmDropLbl.style.color = '#60a5fa';
    cmDrop.style.borderColor = '#3b82f6';
    cmFileInfo.style.display = 'flex';
    cmFileName.textContent = f.name;
    cmFileSize.textContent = (f.size / 1024).toFixed(1) + ' KB';
    cmImport.disabled = false;
    cmResult.style.display = 'none';
  }

  cmInput.addEventListener('change', () => { if (cmInput.files[0]) setFile(cmInput.files[0]); });
  cmDrop.addEventListener('dragover', e => { e.preventDefault(); cmDrop.classList.add('drag'); });
  cmDrop.addEventListener('dragleave', () => cmDrop.classList.remove('drag'));
  cmDrop.addEventListener('drop', e => {
    e.preventDefault(); cmDrop.classList.remove('drag');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });

  // Psychology toggle
  function setCmPsych(on) {
    cmPsychToggle.checked = on;
    cmEmotionWrap.style.display = on ? 'grid' : 'none';
    cmPsychLbl.textContent = on ? 'On' : 'Off';
    cmPsychLbl.style.color = on ? '#c084fc' : '#7a90b0';
    cmPsychTrack.style.background   = on ? '#7c3aed' : '#1e2d45';
    cmPsychTrack.style.borderColor  = on ? '#a855f7' : '#2a3f5a';
    cmPsychThumb.style.left = on ? '21px' : '3px';
  }
  setCmPsych(true);
  cmPsychToggle.addEventListener('change', () => setCmPsych(cmPsychToggle.checked));

  cmImport.addEventListener('click', async () => {
    if (!csvFile) return;
    const psychOn = cmPsychToggle.checked;
    const emotionBefore = container.querySelector('#cm-emotion-before').value;
    if (psychOn && !emotionBefore) {
      toast('Please select Emotion Before Trade, or turn off Psychology', 'error');
      return;
    }

    cmImport.textContent = 'Importing…'; cmImport.disabled = true;
    cmResult.style.display = 'none';

    const fd = new FormData();
    fd.append('file', csvFile);
    const strategy = container.querySelector('#cm-strategy').value;
    const notes    = container.querySelector('#cm-notes').value.trim();
    if (strategy) fd.append('strategy', strategy);
    if (notes)    fd.append('notes',    notes);

    try {
      const res = await api.upload('/trades/import/csv', fd);

      if (psychOn && res.tradeIds?.length) {
        cmImport.textContent = 'Saving psychology…';
        const psych = {
          emotionBefore,
          emotionAfter: container.querySelector('#cm-emotion-after').value,
          disciplineRating: 5, followedPlan: false, mistakeTags: [], notes: '',
        };
        await Promise.allSettled(res.tradeIds.map(t => api.post(`/trades/${t._id}/psychology`, psych)));
      }

      cmResult.style.display = 'block';
      cmResult.innerHTML = `
        <div style="padding:0.875rem;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:8px">
          <div style="color:#22c55e;font-weight:600;font-size:0.875rem;margin-bottom:4px">✓ ${res.message}</div>
          <div style="font-size:0.75rem;color:#7a90b0">
            Broker: <strong style="color:#c0cce0">${res.broker || 'Auto'}</strong>
            · Closed: ${res.closed||0} · Open: ${res.open||0}
            ${res.skipped ? ` · ${res.skipped} skipped` : ''}
          </div>
        </div>`;
      load(1);
      setTimeout(hideCsvModal, 2000);
    } catch (err) {
      cmResult.style.display = 'block';
      cmResult.innerHTML = `
        <div style="padding:0.875rem;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:8px">
          <div style="color:#ef4444;font-weight:600;font-size:0.875rem">Import failed</div>
          <div style="font-size:0.75rem;color:#7a90b0;margin-top:3px">${err.message}</div>
        </div>`;
      cmImport.textContent = 'Import Trades'; cmImport.disabled = false;
    }
  });

  // ── Load trades ────────────────────────────────────────────────────────────
  let currentPage = 1;
  const PAGE_SIZE = 20;

  async function load(page = 1) {
    currentPage = page;
    const wrap = container.querySelector('#trades-wrap');
    wrap.innerHTML = '<div style="color:#3a4f6a;font-size:0.82rem;padding:0.5rem">Loading…</div>';
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
      params.set('limit', PAGE_SIZE);
      params.set('page', page);
      const res = await api.get(`/trades?${params}`);
      const total = res.total || 0;
      const pages = Math.ceil(total / PAGE_SIZE);
      container.querySelector('#trade-count').textContent = `${total} total trades`;
      renderTable(wrap, res.trades,
        (t) => {
          activeTrade = t;
          container.querySelector('#modal-trade-info').textContent = `${t.symbol || t.underlying} · ${t.tradeType} ${t.optionType} @ ₹${t.entryPrice}`;
          container.querySelector('#modal-exit-price').value = '';
          container.querySelector('#modal-exit-date').value  = new Date().toISOString().slice(0,10);
          modalPnl.style.display = 'none';
          closeModal.style.display = 'flex';
          setTimeout(() => container.querySelector('#modal-exit-price').focus(), 50);
        },
        openStratModal,
        openPsychModal,
        async (id) => {
          if (!confirm('Delete this trade?')) return;
          try { await api.delete(`/trades/${id}`); toast('Deleted'); load(currentPage); }
          catch (e) { toast(e.message, 'error'); }
        },
        { page, pages, total, pageSize: PAGE_SIZE, onPage: (p) => load(p) }
      );
    } catch (e) { wrap.innerHTML = `<div style="color:#ef4444;font-size:0.82rem">${e.message}</div>`; }
  }

  load();
}

// ── Table renderer ────────────────────────────────────────────────────────────
function renderTable(wrap, trades, onClose, onEditStrategy, onEditPsych, onDelete, pagination) {
  if (!trades.length) {
    wrap.innerHTML = `<div class="card empty-state">No trades found. <a href="#add-trade" style="color:#3b82f6">Add one →</a></div>`;
    return;
  }

  const { page, pages, total, pageSize, onPage } = pagination;

  // Pagination info
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  wrap.innerHTML = `
    <div style="overflow-x:auto;overflow-y:visible">
      <table class="trade-table">
        <thead>
          <tr>
            <th>Symbol</th><th>Type</th><th>Strike</th><th>Expiry</th>
            <th>Qty</th><th>Entry</th><th>Exit</th><th>Status</th>
            <th>Strategy</th><th>Net P&L</th><th>Date</th>
            <th style="width:44px"></th>
          </tr>
        </thead>
        <tbody>
          ${trades.map(t => `
            <tr>
              <td><span class="sym">${t.symbol || t.underlying}</span></td>
              <td><div class="pill-group">${badge(t.tradeType?.toLowerCase(), t.tradeType)} ${badge(t.optionType?.toLowerCase(), t.optionType)}</div></td>
              <td class="mono muted">₹${(t.strikePrice||0).toLocaleString('en-IN')}</td>
              <td class="muted" style="font-size:0.72rem;white-space:nowrap">${fmtDate(t.expiryDate)}</td>
              <td class="mono muted">${t.quantity}L</td>
              <td class="mono">₹${t.entryPrice}</td>
              <td class="mono muted">${t.exitPrice ? `₹${t.exitPrice}` : '—'}</td>
              <td>${badge(t.status?.toLowerCase(), t.status)}</td>
              <td>
                ${t.strategy
                  ? `<span style="font-size:0.7rem;padding:2px 8px;border-radius:4px;background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.25);white-space:nowrap">${t.strategy}</span>`
                  : `<span class="muted" style="font-size:0.7rem">—</span>`}
              </td>
              <td>${t.status !== 'OPEN' ? pnlSpan(t.netPnl) : '<span class="muted">—</span>'}</td>
              <td style="font-size:0.72rem;color:#3a4f6a;white-space:nowrap">${fmtDate(t.entryDate)}</td>
              <td>
                <button class="three-dot-btn" data-id="${t._id}"
                  style="background:none;border:none;color:#3a4f6a;cursor:pointer;padding:0.25rem 0.5rem;
                         border-radius:6px;font-size:1.1rem;line-height:1;transition:all 0.15s;position:relative;z-index:1"
                  onmouseenter="this.style.background='#1e2d45';this.style.color='#c0cce0'"
                  onmouseleave="this.style.background='none';this.style.color='#3a4f6a'">⋮</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Floating dropdown (rendered once, moved by JS) -->
    <div id="floating-menu" style="display:none;position:fixed;z-index:9999;
         background:#0d1824;border:1px solid #2a3f5a;border-radius:8px;
         min-width:175px;box-shadow:0 8px 32px rgba(0,0,0,0.6);overflow:hidden">
    </div>
  `;

  // ── Sticky pagination bar (rendered outside wrap, fixed to bottom) ──────────
  // Remove any existing pagination bar first
  const existingBar = document.getElementById('trades-pagination-bar');
  if (existingBar) existingBar.remove();

  if (pages > 1) {
    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, total);

    // Clamp visible page numbers (show max 5 around current)
    const maxVisible = 5;
    let startP = Math.max(1, page - Math.floor(maxVisible / 2));
    let endP   = Math.min(pages, startP + maxVisible - 1);
    if (endP - startP < maxVisible - 1) startP = Math.max(1, endP - maxVisible + 1);

    const bar = document.createElement('div');
    bar.id = 'trades-pagination-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 0; left: 220px; right: 0;
      z-index: 40;
      background: #0a0f1c;
      border-top: 1px solid #1e2d45;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1.5rem;
      gap: 0.75rem;
    `;
    bar.innerHTML = `
      <div style="font-size:0.75rem;color:#3a4f6a;white-space:nowrap">
        Showing <strong style="color:#7a90b0">${from}–${to}</strong> of <strong style="color:#7a90b0">${total}</strong> trades
      </div>
      <div style="display:flex;align-items:center;gap:0.3rem;flex-wrap:nowrap">
        <button class="pb-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}
          style="padding:0.35rem 0.75rem;border-radius:6px;border:1px solid #1e2d45;background:transparent;
                 color:${page <= 1 ? '#2a3f5a' : '#7a90b0'};cursor:${page <= 1 ? 'default' : 'pointer'};
                 font-size:0.78rem;font-family:inherit;transition:all 0.13s">
          ← Prev
        </button>
        ${startP > 1 ? `<button class="pb-btn" data-page="1" style="padding:0.35rem 0.6rem;border-radius:6px;font-size:0.78rem;cursor:pointer;border:1px solid #1e2d45;background:transparent;color:#7a90b0;font-family:inherit">1</button>
        ${startP > 2 ? `<span style="color:#3a4f6a;font-size:0.78rem;padding:0 0.2rem">…</span>` : ''}` : ''}
        ${Array.from({ length: endP - startP + 1 }, (_, i) => startP + i).map(p => `
          <button class="pb-btn" data-page="${p}"
            style="padding:0.35rem 0.6rem;border-radius:6px;font-size:0.78rem;cursor:pointer;font-family:inherit;transition:all 0.13s;
                   border:1px solid ${p === page ? 'rgba(59,130,246,0.5)' : '#1e2d45'};
                   background:${p === page ? 'rgba(59,130,246,0.15)' : 'transparent'};
                   color:${p === page ? '#60a5fa' : '#7a90b0'};
                   font-weight:${p === page ? '600' : '400'}">
            ${p}
          </button>`).join('')}
        ${endP < pages ? `
        ${endP < pages - 1 ? `<span style="color:#3a4f6a;font-size:0.78rem;padding:0 0.2rem">…</span>` : ''}
        <button class="pb-btn" data-page="${pages}" style="padding:0.35rem 0.6rem;border-radius:6px;font-size:0.78rem;cursor:pointer;border:1px solid #1e2d45;background:transparent;color:#7a90b0;font-family:inherit">${pages}</button>` : ''}
        <button class="pb-btn" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}
          style="padding:0.35rem 0.75rem;border-radius:6px;border:1px solid #1e2d45;background:transparent;
                 color:${page >= pages ? '#2a3f5a' : '#7a90b0'};cursor:${page >= pages ? 'default' : 'pointer'};
                 font-size:0.78rem;font-family:inherit;transition:all 0.13s">
          Next →
        </button>
      </div>
    `;

    document.body.appendChild(bar);

    bar.querySelectorAll('.pb-btn').forEach(btn => {
      if (btn.disabled) return;
      btn.addEventListener('mouseover', () => { btn.style.background = '#131c30'; });
      btn.addEventListener('mouseout',  () => {
        const p = parseInt(btn.dataset.page);
        btn.style.background = p === page ? 'rgba(59,130,246,0.15)' : 'transparent';
      });
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (!isNaN(p) && p >= 1 && p <= pages) onPage(p);
      });
    });

    // Add bottom padding to wrap so table content isn't hidden behind bar
    wrap.style.paddingBottom = '3.5rem';

    // Clean up bar when page navigates away
    const cleanup = () => { bar.remove(); window.removeEventListener('hashchange', cleanup); };
    window.addEventListener('hashchange', cleanup);
  }

  // ── Floating dropdown ──────────────────────────────────────────────────────
  const floatMenu = wrap.querySelector('#floating-menu');
  let openId = null;

  function buildMenuHTML(trade) {
    return `
      ${trade.status === 'OPEN' ? `
      <div class="fm-item fm-close" data-id="${trade._id}"
        style="padding:0.6rem 0.875rem;cursor:pointer;font-size:0.8rem;color:#c0cce0;
               display:flex;align-items:center;gap:0.5rem;transition:background 0.1s"
        onmouseenter="this.style.background='#1e2d45'" onmouseleave="this.style.background=''">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>
        Close Trade
      </div>` : ''}
      <div class="fm-item fm-strat" data-id="${trade._id}"
        style="padding:0.6rem 0.875rem;cursor:pointer;font-size:0.8rem;color:#c0cce0;
               display:flex;align-items:center;gap:0.5rem;transition:background 0.1s"
        onmouseenter="this.style.background='#1e2d45'" onmouseleave="this.style.background=''">
        🎯 Edit Strategy
      </div>
      <div class="fm-item fm-psych" data-id="${trade._id}"
        style="padding:0.6rem 0.875rem;cursor:pointer;font-size:0.8rem;color:#c0cce0;
               display:flex;align-items:center;gap:0.5rem;transition:background 0.1s"
        onmouseenter="this.style.background='#1e2d45'" onmouseleave="this.style.background=''">
        🧠 Edit Psychology
      </div>
      <div style="height:1px;background:#1e2d45"></div>
      <div class="fm-item fm-del" data-id="${trade._id}"
        style="padding:0.6rem 0.875rem;cursor:pointer;font-size:0.8rem;color:#ef4444;
               display:flex;align-items:center;gap:0.5rem;transition:background 0.1s"
        onmouseenter="this.style.background='rgba(239,68,68,0.08)'" onmouseleave="this.style.background=''">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        Delete Trade
      </div>`;
  }

  function positionMenu(btn) {
    const rect = btn.getBoundingClientRect();
    const menuH = 160; // approx height
    // Check if there's space below, else open upward
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < menuH) {
      floatMenu.style.top  = (rect.top - menuH + window.scrollY) + 'px';
    } else {
      floatMenu.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    }
    floatMenu.style.right = (window.innerWidth - rect.right) + 'px';
    floatMenu.style.left  = 'auto';
  }

  function closeMenu() {
    floatMenu.style.display = 'none';
    openId = null;
  }

  wrap.querySelectorAll('.three-dot-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id    = btn.dataset.id;
      const trade = trades.find(t => t._id === id);
      if (!trade) return;

      if (openId === id) { closeMenu(); return; }

      openId = id;
      floatMenu.innerHTML = buildMenuHTML(trade);
      floatMenu.style.display = 'block';
      positionMenu(btn);

      // Wire up menu item clicks
      floatMenu.querySelector('.fm-close')?.addEventListener('click', e => {
        e.stopPropagation(); closeMenu(); onClose(trade);
      });
      floatMenu.querySelector('.fm-strat')?.addEventListener('click', e => {
        e.stopPropagation(); closeMenu(); onEditStrategy(trade);
      });
      floatMenu.querySelector('.fm-psych')?.addEventListener('click', e => {
        e.stopPropagation(); closeMenu(); onEditPsych(trade);
      });
      floatMenu.querySelector('.fm-del')?.addEventListener('click', e => {
        e.stopPropagation(); closeMenu(); onDelete(id);
      });
    });
  });

  // Close menu on outside click — use setTimeout to let the button click finish first
  document.addEventListener('click', function outsideClick(e) {
    if (!floatMenu.contains(e.target)) {
      closeMenu();
      document.removeEventListener('click', outsideClick);
    }
  });

  // Close on scroll
  window.addEventListener('scroll', closeMenu, { once: true, passive: true });
}