export function fmtINR(n, sign = false) {
  const abs = Math.abs(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (!sign) return `₹${abs}`;
  return n >= 0 ? `+₹${abs}` : `-₹${abs}`;
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function badge(cls, text) {
  return `<span class="badge badge-${cls}">${text}</span>`;
}

export function pnlSpan(val) {
  if (val == null) return '<span class="muted">—</span>';
  return `<span class="${val >= 0 ? 'pnl-pos' : 'pnl-neg'}">${fmtINR(val, true)}</span>`;
}

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') e.insertAdjacentHTML('beforeend', c);
    else if (c) e.appendChild(c);
  });
  return e;
}

export function buildSymbol(underlying, expiry, strike, optionType) {
  if (!underlying || !expiry || !strike || !optionType) return '';
  const d = new Date(expiry);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${underlying}${String(d.getFullYear()).slice(2)}${months[d.getMonth()]}${strike}${optionType}`;
}
