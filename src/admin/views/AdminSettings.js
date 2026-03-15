import { renderAdminLayout } from '../components/AdminLayout.js';

const SETTINGS_KEY = 'adm_settings';

const DEFAULT_SETTINGS = {
  platformName:    'TradeLog',
  supportEmail:    'support@tradelog.in',
  starterPrice:    199,
  proPrice:        699,
  trialDays:       14,
  maintenanceMode: false,
  allowSignups:    true,
  maxTradesPerUser: 10000,
  announcement:    '',
};

function getSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
  catch { return DEFAULT_SETTINGS; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

export function renderAdminSettings(container) {
  renderAdminLayout(container, 'Platform Settings', '#admin-settings', (content) => {
    renderSettingsPage(content);
  });
}

function renderSettingsPage(content) {
  const s = getSettings();

  content.innerHTML = `
    <div class="adm-page-header">
      <div class="adm-page-title">Settings</div>
      <div class="adm-page-sub">Configure platform behaviour and pricing</div>
    </div>

    <div id="settings-saved" style="display:none;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);border-radius:8px;padding:0.625rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#22c55e">
      ✅ Settings saved successfully
    </div>

    <div class="adm-grid-2" style="gap:1.25rem">
      <!-- General settings -->
      <div>
        <div class="adm-card" style="margin-bottom:1.25rem">
          <div class="adm-card-title">General</div>
          <div class="adm-field">
            <label>Platform Name</label>
            <input class="adm-input" id="s-name" value="${s.platformName}" style="width:100%">
          </div>
          <div class="adm-field">
            <label>Support Email</label>
            <input class="adm-input" id="s-email" type="email" value="${s.supportEmail}" style="width:100%">
          </div>
          <div class="adm-field">
            <label>Max Trades per User</label>
            <input class="adm-input" id="s-maxtrades" type="number" value="${s.maxTradesPerUser}" style="width:100%">
          </div>
          <div class="adm-field" style="margin:0">
            <label>Announcement Banner (leave empty to hide)</label>
            <textarea class="adm-input" id="s-announcement" rows="2" style="width:100%;resize:vertical">${s.announcement}</textarea>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-title">Platform Controls</div>
          ${[
            ['maintenanceMode', 'Maintenance Mode', 'Take platform offline for maintenance', '#ef4444', s.maintenanceMode],
            ['allowSignups',    'Allow New Signups', 'Let new users create accounts', '#22c55e', s.allowSignups],
          ].map(([id, label, desc, col, val]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
              <div>
                <div style="font-size:0.85rem;font-weight:600;color:#f1f5f9">${label}</div>
                <div style="font-size:0.72rem;color:#475569;margin-top:2px">${desc}</div>
              </div>
              <button class="adm-toggle-switch ${val ? 'on' : 'off'}" data-key="${id}"
                style="width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;
                       background:${val ? col : '#1e293b'};position:relative;transition:background 0.2s;flex-shrink:0">
                <span style="position:absolute;width:18px;height:18px;border-radius:50%;background:#fff;
                             top:3px;left:${val ? '23px' : '3px'};transition:left 0.2s"></span>
              </button>
            </div>`).join('')}
          <div style="padding-top:0.75rem">
            <div style="font-size:0.85rem;font-weight:600;color:#f1f5f9;margin-bottom:0.25rem">Make User Admin</div>
            <div style="font-size:0.72rem;color:#475569;margin-bottom:0.625rem">Enter user email to grant admin access</div>
            <div style="display:flex;gap:0.5rem">
              <input class="adm-input" id="s-admin-email" placeholder="user@email.com" style="flex:1">
              <button class="adm-btn adm-btn-primary adm-btn-sm" id="s-make-admin">Grant Admin</button>
            </div>
            <div id="s-admin-result" style="font-size:0.75rem;margin-top:0.375rem"></div>
          </div>
        </div>
      </div>

      <!-- Pricing settings -->
      <div>
        <div class="adm-card" style="margin-bottom:1.25rem">
          <div class="adm-card-title">Subscription Pricing</div>
          <div class="adm-field">
            <label>Starter Plan Price (₹/month)</label>
            <div style="position:relative">
              <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:#475569">₹</span>
              <input class="adm-input" id="s-starter-price" type="number" value="${s.starterPrice}" min="0" style="width:100%;padding-left:1.75rem">
            </div>
          </div>
          <div class="adm-field">
            <label>Pro Trader Plan Price (₹/month)</label>
            <div style="position:relative">
              <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:#475569">₹</span>
              <input class="adm-input" id="s-pro-price" type="number" value="${s.proPrice}" min="0" style="width:100%;padding-left:1.75rem">
            </div>
          </div>
          <div class="adm-field" style="margin:0">
            <label>Free Trial Days (Pro Plan)</label>
            <input class="adm-input" id="s-trial-days" type="number" value="${s.trialDays}" min="0" max="90" style="width:100%">
          </div>
        </div>

        <!-- Preview -->
        <div class="adm-card" style="margin-bottom:1.25rem">
          <div class="adm-card-title">Pricing Preview</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.875rem">
            ${[
              ['Starter', 'starterPrice', '#3b82f6', s.starterPrice],
              ['Pro Trader', 'proPrice', '#f59e0b', s.proPrice],
            ].map(([name, key, col, price]) => `
              <div style="background:#080e1a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:1rem;border-top:2px solid ${col}30">
                <div style="font-size:0.7rem;color:${col};font-weight:700;text-transform:uppercase;letter-spacing:.08em">${name}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:800;color:#f8fafc;margin-top:0.25rem" id="preview-${key}">₹${price}</div>
                <div style="font-size:0.65rem;color:#334155">/month</div>
              </div>`).join('')}
          </div>
        </div>

        <button class="adm-btn adm-btn-primary" id="s-save" style="width:100%;justify-content:center;padding:0.75rem;font-size:0.9rem">
          💾 Save All Settings
        </button>
      </div>
    </div>
  `;

  // Toggle switches
  const toggleState = { maintenanceMode: s.maintenanceMode, allowSignups: s.allowSignups };
  content.querySelectorAll('.adm-toggle-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      toggleState[key] = !toggleState[key];
      const col = key === 'maintenanceMode' ? '#ef4444' : '#22c55e';
      btn.style.background = toggleState[key] ? col : '#1e293b';
      btn.querySelector('span').style.left = toggleState[key] ? '23px' : '3px';
    });
  });

  // Live price preview
  ['starter-price', 'pro-price'].forEach(id => {
    content.querySelector(`#s-${id}`)?.addEventListener('input', function () {
      const key = id.replace('-', '').replace('price', 'Price').replace('starter', 'starter').replace('pro', 'pro');
      const previewEl = content.querySelector(`#preview-s-${id}`);
      if (previewEl) previewEl.textContent = '₹' + (this.value || 0);
      // map to correct preview id
      const mapId = id === 'starter-price' ? 'preview-starterPrice' : 'preview-proPrice';
      const el = content.querySelector(`#${mapId}`);
      if (el) el.textContent = '₹' + (this.value || 0);
    });
  });

  // Make admin
  content.querySelector('#s-make-admin').addEventListener('click', () => {
    const email  = content.querySelector('#s-admin-email').value.trim();
    const result = content.querySelector('#s-admin-result');
    if (!email) { result.style.color = '#ef4444'; result.textContent = 'Please enter an email'; return; }

    const token = localStorage.getItem('token');
    fetch('/api/admin/users', {
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const user = (data.users || []).find(u => u.email === email);
      if (!user) { result.style.color = '#ef4444'; result.textContent = 'User not found'; return; }

      return fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: 'admin' })
      });
    }).then(() => {
      result.style.color = '#22c55e';
      result.textContent = `✅ ${email} is now an admin`;
      content.querySelector('#s-admin-email').value = '';
    }).catch(err => {
      result.style.color = '#ef4444';
      result.textContent = err.message || 'Failed';
    });
  });

  // Save
  content.querySelector('#s-save').addEventListener('click', () => {
    const newSettings = {
      platformName:    content.querySelector('#s-name').value.trim(),
      supportEmail:    content.querySelector('#s-email').value.trim(),
      maxTradesPerUser:parseInt(content.querySelector('#s-maxtrades').value) || 10000,
      announcement:   content.querySelector('#s-announcement').value.trim(),
      starterPrice:   parseInt(content.querySelector('#s-starter-price').value) || 199,
      proPrice:       parseInt(content.querySelector('#s-pro-price').value) || 699,
      trialDays:      parseInt(content.querySelector('#s-trial-days').value) || 14,
      maintenanceMode: toggleState.maintenanceMode,
      allowSignups:    toggleState.allowSignups,
    };
    saveSettings(newSettings);
    const saved = content.querySelector('#settings-saved');
    saved.style.display = 'block';
    setTimeout(() => saved.style.display = 'none', 3000);
  });
}
