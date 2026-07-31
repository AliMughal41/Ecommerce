import API_URL from '../config';

const SESSION_KEY = 'thriftora_session';
const SESSION_TTL = 30 * 60 * 1000;

let geoCache = null;

export function getSessionId() {
  try {
    const now = Date.now();
    let data = null;
    try { data = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { data = null; }
    if (data && data.id && now - (data.ts || 0) < SESSION_TTL) return data.id;
    const id = `${now}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: now }));
    return id;
  } catch {
    return '';
  }
}

function refreshSessionTs() {
  try {
    const id = getSessionId();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }));
  } catch { /* ignore */ }
}

export function getDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  let deviceType = 'Desktop';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    deviceType = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'Tablet' : 'Mobile';
  }
  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  return { deviceType, browser, os };
}

export function getTrafficSource() {
  try {
    const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
    if (!ref) return { referrer: '', source: 'Direct' };
    if (ref.includes(window.location.origin)) return { referrer: ref, source: 'Internal' };
    let source = 'Other';
    if (/google\./i.test(ref)) source = 'Google';
    else if (/bing\.|yahoo\.|duckduckgo\./i.test(ref)) source = 'Search Engine';
    else if (/facebook|instagram|tiktok|youtube|twitter|x\.com|whatsapp|pinterest|snapchat|linkedin/i.test(ref)) source = 'Social Media';
    return { referrer: ref, source };
  } catch {
    return { referrer: '', source: 'Direct' };
  }
}

export async function getGeo() {
  if (geoCache) return geoCache;
  geoCache = { city: '', country: '' };
  return geoCache;
}

function buildBase() {
  const sessionId = getSessionId();
  const { deviceType, browser, os } = getDeviceInfo();
  const { referrer, source } = getTrafficSource();
  return {
    sessionId,
    deviceType,
    browser,
    os,
    referrer,
    source,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    ...(geoCache || { city: '', country: '' }),
  };
}

export function track(eventType, payload = {}) {
  try {
    const body = { eventType, ...buildBase(), ...payload };
    fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
    refreshSessionTs();
  } catch { /* ignore */ }
}

export function heartbeat() {
  try {
    const body = buildBase();
    if (!body.sessionId) return;
    navigator.sendBeacon(`${API_URL}/api/analytics/session/heartbeat`, new Blob([JSON.stringify(body)], { type: 'application/json' }));
  } catch { /* ignore */ }
}

let heartbeatInterval = null;

export function startSessionTracking() {
  if (heartbeatInterval) return;
  heartbeatInterval = setInterval(heartbeat, 20000);
  window.addEventListener('pagehide', heartbeat);
  window.addEventListener('pagehide', () => {
    try {
      const body = { sessionId: getSessionId() };
      navigator.sendBeacon(`${API_URL}/api/analytics/session/end`, new Blob([JSON.stringify(body)], { type: 'application/json' }));
    } catch { /* ignore */ }
  });
}

export function stopSessionTracking() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function trackPageView(path) {
  track('page_view', { path, metadata: { title: typeof document !== 'undefined' ? document.title : '' } });
}

export function trackProductView(productId, productName) {
  track('product_view', { productId, metadata: { productName } });
}

export function trackAddToCart(productId, productName, qty = 1) {
  track('cart_add', { productId, metadata: { productName, qty } });
}

export function trackRemoveFromCart(productId, productName) {
  track('cart_remove', { productId, metadata: { productName } });
}

export function trackSearch(query) {
  if (query && query.trim()) track('search', { query: query.trim() });
}

export function trackCheckoutStart(orderNumber) {
  track('checkout_start', { metadata: { orderNumber } });
}

export function trackWishlist(productId, productName) {
  track('wishlist_add', { productId, metadata: { productName } });
}

export function trackLogin() {
  track('login');
}

export function trackRegister() {
  track('register');
}

export function initGeo() {
  getGeo();
}
