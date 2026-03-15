import { api } from '../lib/api.js';
import { auth } from '../lib/auth.js';
import { toast } from '../lib/toast.js';
import { navigate } from '../router.js';

export async function renderLogin(container) {
  container.style.cssText = 'min-height:100vh;width:100%;background:#080c14;';

  container.innerHTML = `
    <!-- Back arrow -->
    <div style="position:fixed;top:1.25rem;left:1.25rem;z-index:50">
      <button id="back-btn" style="display:flex;align-items:center;justify-content:center;background:none;border:none;padding:0.4rem;color:#7a90b0;cursor:pointer;transition:color 0.15s" onmouseover="this.style.color='#e8eeff'" onmouseout="this.style.color='#7a90b0'">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
    </div>

    <div class="auth-wrap fade-up">
      <div class="auth-left" style="display:none" id="auth-left-panel">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <span style="font-size:1.1rem;font-weight:700;color:#e8eeff">TradeLog</span>
        </div>
        <div>
          <div style="display:inline-block;background:rgba(59,130,246,0.12);color:#60a5fa;padding:3px 12px;border-radius:20px;font-size:0.72rem;border:1px solid rgba(59,130,246,0.25);margin-bottom:1.25rem">
            🇮🇳 Indian Options Market
          </div>
          <h1 style="font-size:2.2rem;font-weight:700;color:#e8eeff;line-height:1.2;letter-spacing:-0.03em;margin-bottom:0.875rem">
            Track every<br><span style="color:#3b82f6">options trade</span><br>like a pro.
          </h1>
          <p style="color:#7a90b0;font-size:0.9rem;line-height:1.7">
            Journal NIFTY, BANKNIFTY &amp; FnO stocks.<br>Analyse your edge. Grow your capital.
          </p>
        </div>
        <div style="display:flex;gap:2rem">
          ${[['NSE','Nifty Options'],['BSE','Sensex Options'],['FnO','F&O Stocks']].map(([a,b])=>`
            <div>
              <div style="color:#3b82f6;font-weight:700;font-size:1rem;font-family:'JetBrains Mono',monospace">${a}</div>
              <div style="color:#3a4f6a;font-size:0.72rem">${b}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-box">
          <h2 class="auth-title">Sign in</h2>
          <p class="auth-sub">No account? <a href="#" id="go-signup">Create one</a></p>

          <div id="g-signin-btn" style="margin-bottom:1rem"></div>

          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">or continue with email</span>
            <div class="divider-line"></div>
          </div>

          <form id="login-form" style="display:flex;flex-direction:column;gap:0.875rem">
            <div class="field">
              <label>Email</label>
              <input class="input" type="email" id="email" placeholder="you@example.com" required>
            </div>
            <div class="field">
              <label>Password</label>
              <div style="position:relative">
                <input class="input" type="password" id="password" placeholder="••••••••" required style="padding-right:2.5rem">
                <button type="button" id="toggle-pass" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#3a4f6a;cursor:pointer;font-size:0.75rem">Show</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" id="login-btn" style="width:100%;justify-content:center;margin-top:4px">
              Sign in →
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#back-btn').addEventListener('click', () => navigate('#landing'));

  // Show left panel on wider screens
  if (window.innerWidth > 900) {
    const leftPanel = container.querySelector('#auth-left-panel');
    leftPanel.style.display = 'flex';
    leftPanel.style.flexDirection = 'column';
  }

  container.querySelector('#go-signup').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('#signup');
  });

  container.querySelector('#toggle-pass').addEventListener('click', function () {
    const inp = container.querySelector('#password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    this.textContent = inp.type === 'password' ? 'Show' : 'Hide';
  });

  container.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#login-btn');
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    try {
      const res = await api.post('/auth/login', {
        email:    container.querySelector('#email').value,
        password: container.querySelector('#password').value,
      });
      auth.save(res.token, res.user);
      toast('Welcome back!');
      navigate('#dashboard');
    } catch (err) {
      toast(err.message, 'error');
      btn.textContent = 'Sign in →';
      btn.disabled = false;
    }
  });

  // Google sign-in
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      callback: async (response) => {
        try {
          const res = await api.post('/auth/google', { credential: response.credential });
          auth.save(res.token, res.user);
          toast('Welcome back!');
          navigate('#dashboard');
        } catch (err) {
          toast(err.message, 'error');
        }
      },
    });
    window.google.accounts.id.renderButton(container.querySelector('#g-signin-btn'), {
      theme: 'filled_black', size: 'large', width: 380,
    });
  } else {
    container.querySelector('#g-signin-btn').innerHTML =
      '<p style="font-size:0.75rem;color:#3a4f6a">Google Sign-In not available (set VITE_GOOGLE_CLIENT_ID)</p>';
  }
}