import { detectBrowser, detectOs } from "./utils.js";

const SENSITIVE_FIELDS = new Set(["clientCode", "birthDate", "pin", "token"]);

const CRAWLER_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python-requests/i,
  /java\//i, /go-http/i, /ruby/i, /libwww/i, /httpclient/i, /axios/i, /node-fetch/i,
  /phantomjs/i, /selenium/i, /puppeteer/i, /playwright/i, /headless/i, /apify/i,
  /scrape/i, /scrapi/i, /nutch/i, /heritrix/i, /yum/i, /dnainfo/i, /shodan/i,
  /masscan/i, /zgrab/i, /zmeu/i, /sqlmap/i, /nikto/i, /nmap/i, /dirbuster/i,
  /gobuster/i, /ffuf/i, /wfuzz/i, /burp/i, /zaproxy/i, /metasploit/i,
  /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i, /duckduckbot/i, /slurp/i,
  /exabot/i, /facebot/i, /ia_archiver/i, /ahrefs/i, /semrush/i, /mj12bot/i,
  /rogerbot/i, /screaming frog/i, /sitebulb/i, /lighthouse/i, /gtmetrix/i,
  /pingdom/i, /newrelic/i, /datadog/i, /sentry/i, /bugsnag/i, /airbrake/i,
  /statuscake/i, /uptimerobot/i, /pingability/i, /site24x7/i, /PRTG/i,
  /WPScan/i, /Joomscan/i, /cmsmap/i, /droope/i, /wpscan/i, /plecost/i,
  /wpseku/i, /cmsploit/i, /CMSeeK/i, /Drupwn/i, /drupalscan/i, /magniber/i
];

const RESTRICTED_OS = new Set([
  "Unknown OS Platform",
  "Ubuntu",
  "Linux",
  "Windows XP",
  "Windows Server 2003/XP x64",
  "Windows 7",
  "Windows ME",
  "Windows 98",
  "Windows 95",
  "Windows 3.11",
  "Mac OS 9"
]);

const IPINFO_BLACKBOX_URL = "https://blackbox.ipinfo.app/lookup/";
const GEO_API_URL = "https://ip-api.com/json/";

const botCheckCache = new Map();
const BOT_CHECK_TTL = 3600000;

const geoCache = new Map();
const GEO_CACHE_TTL = 86400000;

const ALLOWED_COUNTRIES = new Set(["MA", "IT"]);

export function sanitizeSubmissionPayload(payload) {
  const sanitized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function createSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  };
}

export function applySecurityHeaders(response, env = "production") {
  const headers = createSecurityHeaders();
  if (env !== "production") {
    delete headers["Strict-Transport-Security"];
  }

  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 100;

export function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

export function isCrawlerByUserAgent(userAgent) {
  if (!userAgent || userAgent.length < 10) {
    return true;
  }

  const lowerUA = userAgent.toLowerCase();
  for (const pattern of CRAWLER_PATTERNS) {
    if (pattern.test(lowerUA)) {
      return true;
    }
  }

  const hasMozilla = lowerUA.includes("mozilla");
  const hasOS = /windows|mac|linux|android|iphone|ipad/.test(lowerUA);
  const hasBrowser = /chrome|firefox|safari|edge|opera|internet explorer/.test(lowerUA);

  if (hasMozilla && !hasOS && !hasBrowser) {
    return true;
  }

  if (!hasMozilla && !hasBrowser) {
    return true;
  }

  return false;
}

export async function isKnownBotIp(ip) {
  const cached = botCheckCache.get(ip);
  if (cached && Date.now() - cached.timestamp < BOT_CHECK_TTL) {
    return cached.isBot;
  }

  try {
    const response = await fetch(`${IPINFO_BLACKBOX_URL}${ip}`, {
      signal: AbortSignal.timeout(3000)
    });
    const text = await response.text();
    const isBot = text.trim() === "Y";

    botCheckCache.set(ip, { isBot, timestamp: Date.now() });
    return isBot;
  } catch {
    return false;
  }
}

export async function checkBotDetection(request) {
  const userAgent = request.headers.get("user-agent") || "";

  if (isCrawlerByUserAgent(userAgent)) {
    return { blocked: true, reason: "crawler_ua" };
  }

  const ip = getClientIp(request);
  if (process.env.ENABLE_IP_BLACKBOX_CHECK === "true") {
    if (await isKnownBotIp(ip)) {
      return { blocked: true, reason: "known_bot_ip" };
    }
  }

  return { blocked: false };
}

export function checkBrowserOsRestrictions(request) {
  const userAgent = request.headers.get("user-agent") || "";

  const browser = detectBrowser(userAgent);
  if (browser === "Unknown Browser") {
    return { blocked: true, reason: "unknown_browser", browser: "", os: "" };
  }

  const os = detectOs(userAgent);
  if (RESTRICTED_OS.has(os)) {
    return { blocked: true, reason: "restricted_os", browser, os };
  }

  return { blocked: false, browser, os };
}

export function getCountryFromHeaders(request) {
  return (
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    request.headers.get("cf-ipcountry") ||
    null
  );
}

export async function getCountryFromApi(ip) {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return null;
  }

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.country;
  }

  try {
    const response = await fetch(`${GEO_API_URL}${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(2000)
    });
    const data = await response.json();
    const country = data.countryCode || null;

    geoCache.set(ip, { country, timestamp: Date.now() });
    return country;
  } catch {
    return null;
  }
}

export async function checkGeoRestriction(request, mode) {
  if (mode !== "restricted") {
    return { blocked: false };
  }

  let country = getCountryFromHeaders(request);

  if (!country) {
    const ip = getClientIp(request);
    country = await getCountryFromApi(ip);
  }

  console.log(`[GEO] Country: ${country}, IP: ${getClientIp(request)}`);

  if (!country) {
    return { blocked: true, reason: "geo_restricted", country: "UNKNOWN" };
  }

  if (!ALLOWED_COUNTRIES.has(country)) {
    return { blocked: true, reason: "geo_restricted", country };
  }

  return { blocked: false, country };
}

export function createForbiddenResponse(redirectUrl = null) {
  if (redirectUrl) {
    return new Response(null, {
      status: 302,
      headers: {
        location: redirectUrl,
        "cache-control": "no-store"
      }
    });
  }

  return new Response("Access Denied", {
    status: 403,
    headers: {
      "content-type": "text/plain",
      "cache-control": "no-store"
    }
  });
}

export function parseJsonSafe(body) {
  try {
    return { data: JSON.parse(body), error: null };
  } catch {
    return { data: null, error: "Invalid JSON" };
  }
}

export function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  const rawIp = cfIp || realIp || forwarded?.split(",")[0]?.trim() || "127.0.0.1";
  return rawIp === "::1" ? "127.0.0.1" : rawIp;
}

export function isRelaxedMode() {
  return process.env.SECURITY_MODE !== "restricted";
}

export function shouldSanitizePayload() {
  if (process.env.ENABLE_INPUT_SUBMITTING === "true") {
    return false;
  }
  if (process.env.ENABLE_INPUT_SUBMITTING === "false") {
    return true;
  }
  return process.env.SECURITY_MODE !== "relaxed";
}

export async function middleware(request, handler, env = "production") {
  const url = new URL(request.url);
  const ip = getClientIp(request);

  const securityMode = process.env.SECURITY_MODE || "relaxed";

  if (env === "production") {
    const botCheck = await checkBotDetection(request);
    if (botCheck.blocked) {
      console.log(`[BLOCKED] Bot detection: ${botCheck.reason} - IP: ${ip}`);
      return createForbiddenResponse();
    }

    if (securityMode === "restricted") {
      const geoCheck = await checkGeoRestriction(request, "restricted");
      if (geoCheck.blocked) {
        console.log(`[BLOCKED] Geo restriction: ${geoCheck.reason} - Country: ${geoCheck.country} - IP: ${ip}`);
        return createForbiddenResponse();
      }

      const osCheck = checkBrowserOsRestrictions(request);
      if (osCheck.blocked) {
        console.log(`[BLOCKED] OS/Browser: ${osCheck.reason} - ${osCheck.browser}/${osCheck.os} - IP: ${ip}`);
        return createForbiddenResponse();
      }
    }

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return new Response(null, {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
          "X-RateLimit-Remaining": "0"
        }
      });
    }
  }

  let response;
  try {
    response = await handler(request, url, ip);
  } catch (error) {
    response = new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "content-type": "application/json"
      }
    });
  }

  return applySecurityHeaders(response, env);
}

export function logRequest(ip, method, pathname, status, duration) {
  const timestamp = new Date().toISOString();
  if (process.env.NODE_ENV !== "test") {
    console.log(`[${timestamp}] ${method} ${pathname} ${status} ${duration}ms - ${ip}`);
  }
}

export async function withLogging(request, handler) {
  const start = Date.now();
  const url = new URL(request.url);
  const ip = getClientIp(request);
  const { method, pathname } = url;

  let response;
  try {
    response = await handler(request);
  } finally {
    const duration = Date.now() - start;
    logRequest(ip, method, pathname, response?.status || 0, duration);
  }

  return response;
}
