const OS_PATTERNS = [
  [/windows nt 10/i, "Windows 10"],
  [/windows nt 6.3/i, "Windows 8.1"],
  [/windows nt 6.2/i, "Windows 8"],
  [/windows nt 6.1/i, "Windows 7"],
  [/windows nt 6.0/i, "Windows Vista"],
  [/windows nt 5.2/i, "Windows Server 2003/XP x64"],
  [/windows nt 5.1/i, "Windows XP"],
  [/windows xp/i, "Windows XP"],
  [/windows nt 5.0/i, "Windows 2000"],
  [/windows me/i, "Windows ME"],
  [/win98/i, "Windows 98"],
  [/win95/i, "Windows 95"],
  [/win16/i, "Windows 3.11"],
  [/macintosh|mac os x/i, "Mac OS X"],
  [/mac_powerpc/i, "Mac OS 9"],
  [/android/i, "Android"],
  [/iphone/i, "iPhone"],
  [/ipod/i, "iPod"],
  [/ipad/i, "iPad"],
  [/blackberry/i, "BlackBerry"],
  [/webos/i, "Mobile"],
  [/linux/i, "Linux"],
  [/ubuntu/i, "Ubuntu"],
];

const BROWSER_PATTERNS = [
  [/msie/i, "Internet Explorer"],
  [/Trident/i, "Internet Explorer"],
  [/firefox/i, "Firefox"],
  [/safari/i, "Safari"],
  [/chrome/i, "Chrome"],
  [/edge/i, "Edge"],
  [/opera/i, "Opera"],
  [/netscape/i, "Netscape"],
  [/maxthon/i, "Maxthon"],
  [/konqueror/i, "Konqueror"],
  [/ubrowser/i, "UC Browser"],
  [/mobile/i, "Handheld Browser"]
];

const MOBILE_AGENTS = new Set([
  "w3c ", "acs-", "alav", "alca", "amoi", "audi", "avan", "benq", "bird", "blac",
  "blaz", "brew", "cell", "cldc", "cmd-", "dang", "doco", "eric", "hipt", "inno",
  "ipaq", "java", "jigs", "kddi", "keji", "leno", "lg-c", "lg-d", "lg-g", "lge-",
  "maui", "maxo", "midp", "mits", "mmef", "mobi", "mot-", "moto", "mwbp", "nec-",
  "newt", "noki", "palm", "pana", "pant", "phil", "play", "port", "prox", "qwap",
  "sage", "sams", "sany", "sch-", "sec-", "send", "seri", "sgh-", "shar", "sie-",
  "siem", "smal", "smar", "sony", "sph-", "symb", "t-mo", "teli", "tim-", "tosh",
  "tsm-", "upg1", "upsi", "vk-v", "voda", "wap-", "wapa", "wapi", "wapp", "wapr",
  "webc", "winw", "xda ", "xda-"
]);

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function randomRedirectId() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = request.headers.get("cf-connecting-ip");
  const rawIp = clientIp || realIp || forwarded?.split(",")[0]?.trim() || "127.0.0.1";
  return rawIp === "::1" ? "127.0.0.1" : rawIp;
}

export function formatClientId(ip) {
  return String(ip).replaceAll(".", "-").replaceAll(":", "-");
}

export function getCountryCode(request) {
  return (
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    "--"
  );
}

export function formatTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = pad(date.getFullYear() % 100);
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds}-${month}/${day}/${year}`;
}

export function getUserAgent(request) {
  return request.headers.get("user-agent") || "";
}

export function detectOs(userAgent) {
  for (const [pattern, value] of OS_PATTERNS) {
    if (pattern.test(userAgent)) {
      return value;
    }
  }
  return "Unknown OS Platform";
}

export function detectBrowser(userAgent) {
  for (const [pattern, value] of BROWSER_PATTERNS) {
    if (pattern.test(userAgent)) {
      return value;
    }
  }
  return "Unknown Browser";
}

export function detectDevice(userAgent, accept = "") {
  const normalizedAgent = userAgent.toLowerCase();
  const normalizedAccept = accept.toLowerCase();
  let tablet = 0;
  let mobile = 0;

  if (/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i.test(normalizedAgent)) {
    tablet += 1;
  }

  if (/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile)/i.test(normalizedAgent)) {
    mobile += 1;
  }

  if (normalizedAccept.includes("application/vnd.wap.xhtml+xml")) {
    mobile += 1;
  }

  if (MOBILE_AGENTS.has(normalizedAgent.slice(0, 4))) {
    mobile += 1;
  }

  if (normalizedAgent.includes("opera mini")) {
    mobile += 1;
  }

  if (tablet > 0) {
    return "Tablet";
  }

  if (mobile > 0) {
    return "Mobile";
  }

  return "Computer";
}

export function getVisitorProfile(request) {
  const userAgent = getUserAgent(request);
  return {
    device: detectDevice(userAgent, request.headers.get("accept") || ""),
    os: detectOs(userAgent),
    browser: detectBrowser(userAgent)
  };
}

export function getOrigin(url, request) {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/+$/, "");
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const protocol = forwardedProto || url.protocol.replace(":", "");
  const host = forwardedHost || request.headers.get("host") || url.host;
  return `${protocol}://${host}`;
}

export function buildPanelUrl(url, request, ip) {
  return `${getOrigin(url, request)}/panel/index.php?id_user=${encodeURIComponent(ip)}`;
}
