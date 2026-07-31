import API_URL from '../config';

const SESSION_KEY = 'thriftora_session';
const SESSION_TTL = 30 * 60 * 1000;

let geoCache = null;

function isAdmin() {
  try {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('adminToken');
  } catch {
    return false;
  }
}

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
  const uad = typeof navigator !== 'undefined' && navigator.userAgentData ? navigator.userAgentData : null;
  const touch = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  let deviceType = 'Desktop';
  if (uad && uad.mobile) {
    deviceType = 'Mobile';
  } else if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    deviceType = /Android(?!.*Mobile)|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (touch && /Android|iPad|PlayBook|Silk/i.test(ua)) {
    deviceType = 'Tablet';
  }

  let browser = 'Unknown';
  if (/Edg(e|A|iOS)?\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera|OPT\//i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/UCBrowser/i.test(ua)) browser = 'UC Browser';
  else if (/MiuiBrowser|XiaoMi|Miui/i.test(ua)) browser = 'MIUI Browser';
  else if (/CriOS\//i.test(ua)) browser = 'Chrome';
  else if (/Chrome\/|Chromium\//i.test(ua)) browser = 'Chrome';
  else if (/FxiOS\//i.test(ua)) browser = 'Firefox';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/Windows NT|Windows Phone/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/CrOS|Chrome OS/i.test(ua)) os = 'Chrome OS';
  else if (/Linux|X11/i.test(ua)) os = 'Linux';

  if (uad && uad.platform) {
    const p = uad.platform;
    if (/Win/i.test(p)) os = 'Windows';
    else if (/Android/i.test(p)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(p) || /iOS/i.test(p)) os = 'iOS';
    else if (/Mac/i.test(p)) os = 'macOS';
    else if (/Linux/i.test(p)) os = 'Linux';
  }

  return { deviceType, browser, os };
}

export function getTrafficSource() {
  try {
    const ref = typeof document !== 'undefined' ? document.referrer || '' : '';
    if (!ref) return { referrer: '', source: 'Direct' };
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (origin && ref.includes(origin)) return { referrer: ref, source: 'Internal' };
    let host = '';
    try { host = new URL(ref).hostname.toLowerCase().replace(/^www\./, ''); } catch { host = ref.toLowerCase(); }
    const isDomain = (name) => host === name || host.endsWith(`.${name}`) || host.startsWith(`${name}.`) || host.includes(`.${name}.`);
    let source = 'Other';
    if (isDomain('google') || isDomain('goo.gl')) source = 'Google';
    else if (['bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ecosia', 'ask', 'seznam', 'naver', 'qwant', 'brave.search'].some(isDomain)) source = 'Search Engine';
    else if (['facebook', 'fb', 'instagram', 'tiktok', 'youtube', 'twitter', 'x', 'whatsapp', 'pinterest', 'snapchat', 'linkedin', 'telegram', 't.me', 'messenger', 'reddit', 'vk', 'tumblr', 't.co'].some(isDomain)) source = 'Social Media';
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
    if (isAdmin()) return;
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
    if (isAdmin()) return;
    const body = buildBase();
    if (!body.sessionId) return;
    navigator.sendBeacon(`${API_URL}/api/analytics/session/heartbeat`, new Blob([JSON.stringify(body)], { type: 'application/json' }));
  } catch { /* ignore */ }
}

let heartbeatInterval = null;

export function startSessionTracking() {
  if (isAdmin()) return;
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
