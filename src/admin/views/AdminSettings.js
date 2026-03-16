import { renderAdminLayout, adminApi, loading } from '../components/AdminLayout.js';

export function renderAdminSettings(container) {
  renderAdminLayout(container, 'Platform Settings', '#admin-settings', (content) => {
    content.innerHTML = loading();
    adminApi('/settings').then(({ settings }) => renderPage(content, settings))
      .catch(err => { content.innerHTML = `<div style="color:#ef4444;padding:2rem">${err.message}</div>`; });
  });
}

function renderPage(content, s) {
  content.innerHTML = `
    <div class="adm-page-header">
      <div class="adm-page-title">Platform Settings</div>
      <div class="adm-page-sub">Configure pricing, maintenance, signups and admin access</div>
    </div>

    <!-- Toast -->
    <div id="s-toast" style="display:none;position:fixed;top:1.25rem;right:1.25rem;z-index:9999;
         padding:0.75rem 1.25rem;border-radius:10px;font-size:0.85rem;font-weight:600;
         box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:all 0.2s"></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">

      <!-- LEFT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:1.25rem">

        <!-- General -->
        <div class="adm-card">
          <div class="adm-card-title" style="display:flex;align-items:center;gap:0.5rem">
            <span>⚙️</span> General
          </div>
          <div class="adm-field">
            <label>Platform Name</label>
            <input class="adm-input" id="s-name" value="${s.platformName || 'TradeLog'}" style="width:100%">
          </div>
          <div class="adm-field">
            <label>Support Email</label>
            <input class="adm-input" id="s-email" type="email" value="${s.supportEmail || ''}" style="width:100%">
          </div>
          <div class="adm-field" style="margin:0">
            <label>Max Trades per User</label>
            <input class="adm-input" id="s-maxtrades" type="number" value="${s.maxTradesPerUser || 10000}" style="width:100%">
          </div>
        </div>

        <!-- Pricing -->
        <div class="adm-card">
          <div class="adm-card-title" style="display:flex;align-items:center;gap:0.5rem">
            <span>💰</span> Subscription Pricing
          </div>
          <div class="adm-field">
            <label>Starter Plan (₹/month)</label>
            <div style="position:relative">
              <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:#475569;font-weight:600">₹</span>
              <input class="adm-input" id="s-starter" type="number" value="${s.starterPrice || 199}" min="0" style="width:100%;padding-left:1.75rem">
            </div>
          </div>
          <div class="adm-field">
            <label>Pro Trader Plan (₹/month)</label>
            <div style="position:relative">
              <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:#475569;font-weight:600">₹</span>
              <input class="adm-input" id="s-pro" type="number" value="${s.proPrice || 699}" min="0" style="width:100%;padding-left:1.75rem">
            </div>
          </div>
          <div class="adm-field" style="margin-bottom:1rem">
            <label>Free Trial Days (Pro)</label>
            <input class="adm-input" id="s-trial" type="number" value="${s.trialDays || 14}" min="0" max="90" style="width:100%">
          </div>

          <!-- Live price preview -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;padding-top:0.875rem;border-top:1px solid rgba(255,255,255,0.06)">
            <div style="background:#080e1a;border:1px solid rgba(59,130,246,0.2);border-top:2px solid #3b82f6;border-radius:10px;padding:0.875rem;text-align:center">
              <div style="font-size:0.68rem;color:#3b82f6;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:0.25rem">Starter</div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:800;color:#f8fafc" id="preview-starter">₹${s.starterPrice || 199}</div>
              <div style="font-size:0.65rem;color:#334155">/month + GST</div>
            </div>
            <div style="background:#080e1a;border:1px solid rgba(245,158,11,0.2);border-top:2px solid #f59e0b;border-radius:10px;padding:0.875rem;text-align:center">
              <div style="font-size:0.68rem;color:#f59e0b;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:0.25rem">Pro Trader</div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:800;color:#f8fafc" id="preview-pro">₹${s.proPrice || 699}</div>
              <div style="font-size:0.65rem;color:#334155">/month + GST</div>
            </div>
          </div>
        </div>

        <!-- Announcement banner -->
        <div class="adm-card">
          <div class="adm-card-title" style="display:flex;align-items:center;gap:0.5rem">
            <span>📢</span> Announcement Banner
          </div>
          <div style="font-size:0.75rem;color:#475569;margin-bottom:0.75rem">Shown as a banner to all logged-in users. Leave empty to hide.</div>
          <textarea class="adm-input" id="s-announcement" rows="3" style="width:100%;resize:vertical;margin-bottom:0.75rem"
            placeholder="e.g. We're adding new features this weekend. Briefly offline Saturday 2–4 AM IST.">${s.announcement || ''}</textarea>
          <button class="adm-btn adm-btn-primary adm-btn-sm" id="s-broadcast-btn" style="width:100%;justify-content:center">
            📢 Push Announcement
          </button>
          <div id="s-broadcast-result" style="font-size:0.75rem;margin-top:0.375rem"></div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:1.25rem">

        <!-- Platform controls -->
        <div class="adm-card">
          <div class="adm-card-title" style="display:flex;align-items:center;gap:0.5rem">
            <span>🎛️</span> Platform Controls
          </div>

          <!-- Maintenance mode -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.875rem;
               background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:10px;margin-bottom:0.75rem">
            <div>
              <div style="font-size:0.875rem;font-weight:600;color:#f1f5f9">🔧 Maintenance Mode</div>
              <div style="font-size:0.72rem;color:#475569;margin-top:2px">Takes platform offline for all users</div>
            </div>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none">
              <span id="maint-lbl" style="font-size:0.72rem;color:${s.maintenanceMode ? '#ef4444' : '#475569'};font-weight:600">${s.maintenanceMode ? 'ON' : 'OFF'}</span>
              <div style="position:relative;width:44px;height:24px">
                <input type="checkbox" id="s-maintenance" ${s.maintenanceMode ? 'checked' : ''}
                  style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0;z-index:1">
                <div id="maint-track" style="position:absolute;inset:0;border-radius:12px;transition:background 0.2s;
                     background:${s.maintenanceMode ? '#ef4444' : '#1e293b'};border:1px solid ${s.maintenanceMode ? '#ef4444' : '#334155'}"></div>
                <div id="maint-thumb" style="position:absolute;top:3px;width:18px;height:18px;border-radius:50%;
                     background:#fff;transition:left 0.2s;left:${s.maintenanceMode ? '23px' : '3px'}"></div>
              </div>
            </label>
          </div>

          <!-- Allow signups -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.875rem;
               background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:10px">
            <div>
              <div style="font-size:0.875rem;font-weight:600;color:#f1f5f9">🚪 Allow New Signups</div>
              <div style="font-size:0.72rem;color:#475569;margin-top:2px">Let new users register accounts</div>
            </div>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;user-select:none">
              <span id="signup-lbl" style="font-size:0.72rem;color:${s.allowSignups ? '#22c55e' : '#475569'};font-weight:600">${s.allowSignups ? 'ON' : 'OFF'}</span>
              <div style="position:relative;width:44px;height:24px">
                <input type="checkbox" id="s-signups" ${s.allowSignups ? 'checked' : ''}
                  style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0;z-index:1">
                <div id="signup-track" style="position:absolute;inset:0;border-radius:12px;transition:background 0.2s;
                     background:${s.allowSignups ? '#22c55e' : '#1e293b'};border:1px solid ${s.allowSignups ? '#22c55e' : '#334155'}"></div>
                <div id="signup-thumb" style="position:absolute;top:3px;width:18px;height:18px;border-radius:50%;
                     background:#fff;transition:left 0.2s;left:${s.allowSignups ? '23px' : '3px'}"></div>
              </div>
            </label>
          </div>
        </div>

        <!-- Admin management -->
        <div class="adm-card">
          <div class="adm-card-title" style="display:flex;align-items:center;gap:0.5rem">
            <span>👑</span> Admin Access
          </div>

          <div style="margin-bottom:1rem">
            <div style="font-size:0.8rem;font-weight:600;color:#f1f5f9;margin-bottom:0.25rem">Grant Admin</div>
            <div style="font-size:0.72rem;color:#475569;margin-bottom:0.625rem">Enter user email to give admin access</div>
            <div style="display:flex;gap:0.5rem">
              <input class="adm-input" id="s-grant-email" placeholder="user@email.com" style="flex:1">
              <button class="adm-btn adm-btn-primary adm-btn-sm" id="s-grant-btn">Grant</button>
            </div>
            <div id="s-grant-result" style="font-size:0.75rem;margin-top:0.375rem"></div>
          </div>

          <div style="padding-top:1rem;border-top:1px solid rgba(255,255,255,0.06)">
            <div style="font-size:0.8rem;font-weight:600;color:#f1f5f9;margin-bottom:0.25rem">Revoke Admin</div>
            <div style="font-size:0.72rem;color:#475569;margin-bottom:0.625rem">Remove admin access from a user</div>
            <div style="display:flex;gap:0.5rem">
              <input class="adm-input" id="s-revoke-email" placeholder="admin@email.com" style="flex:1">
              <button class="adm-btn adm-btn-danger adm-btn-sm" id="s-revoke-btn">Revoke</button>
            </div>
            <div id="s-revoke-result" style="font-size:0.75rem;margin-top:0.375rem"></div>
          </div>
        </div>

        <!-- Extend subscription -->
        <div class="adm-card">
          <div class="adm-card-title" style="display:flex;align-items:center;gap:0.5rem">
            <span>📅</span> Extend Subscription
          </div>
          <div style="font-size:0.72rem;color:#475569;margin-bottom:0.875rem">Manually extend a user's subscription</div>
          <div class="adm-field">
            <label>User Email</label>
            <input class="adm-input" id="s-ext-email" placeholder="user@email.com" style="width:100%">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.875rem">
            <div class="adm-field" style="margin:0">
              <label>Plan</label>
              <select class="adm-input" id="s-ext-plan" style="width:100%">
                <option value="">Keep current</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro Trader</option>
              </select>
            </div>
            <div class="adm-field" style="margin:0">
              <label>Extend by (days)</label>
              <input class="adm-input" id="s-ext-days" type="number" value="30" min="1" max="365" style="width:100%">
            </div>
          </div>
          <button class="adm-btn adm-btn-green adm-btn-sm" id="s-ext-btn" style="width:100%;justify-content:center">
            ➕ Extend Subscription
          </button>
          <div id="s-ext-result" style="font-size:0.75rem;margin-top:0.375rem"></div>
        </div>

        <!-- Save settings -->
        <button class="adm-btn adm-btn-primary" id="s-save" style="width:100%;justify-content:center;padding:0.875rem;font-size:0.95rem">
          💾 Save All Settings
        </button>
      </div>
    </div>
  `;

  // ── Toast helper ─────────────────────────────────────────────────────────────
  function toast(msg, type = 'success') {
    const el = content.querySelector('#s-toast');
    el.textContent = msg;
    el.style.background = type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    el.style.border = `1px solid ${type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`;
    el.style.color  = type === 'success' ? '#22c55e' : '#ef4444';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  function setResult(id, msg, ok) {
    const el = content.querySelector(`#${id}`);
    if (el) { el.textContent = msg; el.style.color = ok ? '#22c55e' : '#ef4444'; }
  }

  // ── Live price preview ────────────────────────────────────────────────────────
  content.querySelector('#s-starter').addEventListener('input', function () {
    content.querySelector('#preview-starter').textContent = '₹' + (this.value || 0);
  });
  content.querySelector('#s-pro').addEventListener('input', function () {
    content.querySelector('#preview-pro').textContent = '₹' + (this.value || 0);
  });

  // ── Maintenance toggle ────────────────────────────────────────────────────────
  content.querySelector('#s-maintenance').addEventListener('change', function () {
    const on = this.checked;
    content.querySelector('#maint-track').style.background = on ? '#ef4444' : '#1e293b';
    content.querySelector('#maint-track').style.borderColor = on ? '#ef4444' : '#334155';
    content.querySelector('#maint-thumb').style.left = on ? '23px' : '3px';
    content.querySelector('#maint-lbl').textContent = on ? 'ON' : 'OFF';
    content.querySelector('#maint-lbl').style.color  = on ? '#ef4444' : '#475569';
  });

  // ── Signups toggle ────────────────────────────────────────────────────────────
  content.querySelector('#s-signups').addEventListener('change', function () {
    const on = this.checked;
    content.querySelector('#signup-track').style.background = on ? '#22c55e' : '#1e293b';
    content.querySelector('#signup-track').style.borderColor = on ? '#22c55e' : '#334155';
    content.querySelector('#signup-thumb').style.left = on ? '23px' : '3px';
    content.querySelector('#signup-lbl').textContent = on ? 'ON' : 'OFF';
    content.querySelector('#signup-lbl').style.color  = on ? '#22c55e' : '#475569';
  });

  // ── Save all settings ─────────────────────────────────────────────────────────
  content.querySelector('#s-save').addEventListener('click', async () => {
    const btn = content.querySelector('#s-save');
    btn.textContent = 'Saving…'; btn.disabled = true;
    try {
      await adminApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          platformName:     content.querySelector('#s-name').value.trim(),
          supportEmail:     content.querySelector('#s-email').value.trim(),
          maxTradesPerUser: parseInt(content.querySelector('#s-maxtrades').value) || 10000,
          announcement:     content.querySelector('#s-announcement').value.trim(),
          starterPrice:     parseInt(content.querySelector('#s-starter').value) || 199,
          proPrice:         parseInt(content.querySelector('#s-pro').value) || 699,
          trialDays:        parseInt(content.querySelector('#s-trial').value) || 14,
          maintenanceMode:  content.querySelector('#s-maintenance').checked,
          allowSignups:     content.querySelector('#s-signups').checked,
        }),
      });
      toast('✅ Settings saved successfully');
    } catch (err) {
      toast('❌ ' + err.message, 'error');
    }
    btn.textContent = '💾 Save All Settings'; btn.disabled = false;
  });

  // ── Broadcast announcement ────────────────────────────────────────────────────
  content.querySelector('#s-broadcast-btn').addEventListener('click', async () => {
    const msg = content.querySelector('#s-announcement').value.trim();
    const btn = content.querySelector('#s-broadcast-btn');
    btn.textContent = 'Pushing…'; btn.disabled = true;
    try {
      await adminApi('/broadcast', { method: 'POST', body: JSON.stringify({ message: msg }) });
      setResult('s-broadcast-result', msg ? '✅ Announcement live for all users' : '✅ Announcement cleared', true);
    } catch (err) { setResult('s-broadcast-result', err.message, false); }
    btn.textContent = '📢 Push Announcement'; btn.disabled = false;
  });

  // ── Grant admin ───────────────────────────────────────────────────────────────
  content.querySelector('#s-grant-btn').addEventListener('click', async () => {
    const email = content.querySelector('#s-grant-email').value.trim();
    if (!email) { setResult('s-grant-result', 'Enter an email', false); return; }
    const btn = content.querySelector('#s-grant-btn');
    btn.textContent = 'Granting…'; btn.disabled = true;
    try {
      const data = await adminApi(`/users?search=${encodeURIComponent(email)}&limit=1`);
      const user = (data.users || []).find(u => u.email === email);
      if (!user) { setResult('s-grant-result', 'No user found with this email', false); }
      else {
        await adminApi(`/users/${user._id}/make-admin`, { method: 'POST', body: '{}' });
        setResult('s-grant-result', `✅ ${email} is now an admin`, true);
        content.querySelector('#s-grant-email').value = '';
      }
    } catch (err) { setResult('s-grant-result', err.message, false); }
    btn.textContent = 'Grant'; btn.disabled = false;
  });

  // ── Revoke admin ──────────────────────────────────────────────────────────────
  content.querySelector('#s-revoke-btn').addEventListener('click', async () => {
    const email = content.querySelector('#s-revoke-email').value.trim();
    if (!email) { setResult('s-revoke-result', 'Enter an email', false); return; }
    if (!confirm(`Remove admin access from ${email}?`)) return;
    const btn = content.querySelector('#s-revoke-btn');
    btn.textContent = 'Revoking…'; btn.disabled = true;
    try {
      const data = await adminApi(`/users?search=${encodeURIComponent(email)}&limit=1`);
      const user = (data.users || []).find(u => u.email === email);
      if (!user) { setResult('s-revoke-result', 'No user found with this email', false); }
      else {
        await adminApi(`/users/${user._id}/revoke-admin`, { method: 'POST', body: '{}' });
        setResult('s-revoke-result', `✅ Admin access revoked for ${email}`, true);
        content.querySelector('#s-revoke-email').value = '';
      }
    } catch (err) { setResult('s-revoke-result', err.message, false); }
    btn.textContent = 'Revoke'; btn.disabled = false;
  });

  // ── Extend subscription ───────────────────────────────────────────────────────
  content.querySelector('#s-ext-btn').addEventListener('click', async () => {
    const email = content.querySelector('#s-ext-email').value.trim();
    const days  = parseInt(content.querySelector('#s-ext-days').value) || 30;
    const plan  = content.querySelector('#s-ext-plan').value;
    if (!email) { setResult('s-ext-result', 'Enter a user email', false); return; }
    const btn = content.querySelector('#s-ext-btn');
    btn.textContent = 'Extending…'; btn.disabled = true;
    try {
      const data = await adminApi(`/users?search=${encodeURIComponent(email)}&limit=1`);
      const user = (data.users || []).find(u => u.email === email);
      if (!user) { setResult('s-ext-result', 'No user found with this email', false); }
      else {
        const res = await adminApi(`/users/${user._id}/extend-subscription`, {
          method: 'POST',
          body: JSON.stringify({ days, plan: plan || undefined }),
        });
        setResult('s-ext-result', `✅ Extended by ${days} days. New expiry: ${new Date(res.newExpiry).toLocaleDateString('en-IN')}`, true);
        content.querySelector('#s-ext-email').value = '';
      }
    } catch (err) { setResult('s-ext-result', err.message, false); }
    btn.textContent = '➕ Extend Subscription'; btn.disabled = false;
  });
}