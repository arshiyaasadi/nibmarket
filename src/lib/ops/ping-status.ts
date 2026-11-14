import fs from "fs";
import path from "path";

export type DeploySnapshot = {
  status: string | null;
  stage: string | null;
  message: string | null;
  error: string | null;
  pid: string | null;
  gitSha: string | null;
  buildTime: string | null;
  livePort: string | null;
  nginxDomain: string | null;
  updatedAt: string | null;
  startedAt: string | null;
  zone: string | null;
  activeSlot: string | null;
  composeFile: string | null;
};

export type CdPolicySnapshot = {
  /** Runtime zone from APP_ENV / deploy status */
  zone: "live" | "development" | "unknown";
  /** Policy: live → mlm-cd.timer; dig → yarn sync:dev only */
  autoCdExpected: boolean;
  /** Host file last-deployed-sha (live) or last-deployed-sha-dev (dig), if mounted/readable */
  lastDeployedSha: string | null;
  /** Hint for operators testing auto CD */
  verifyHint: string;
};

export type PingPayload = {
  ok: true;
  service: "novin-club";
  /** Friendly name for this surface */
  pingPong: "club-fe";
  now: string;
  version: {
    package: string | null;
    git: string;
    builtAt: string | null;
    upSince: string;
    uptimeSeconds: number;
  };
  /** Parsed `.cd-state/deploy-status` (mounted into the container when possible) */
  deploy: DeploySnapshot | null;
  cd: CdPolicySnapshot;
};

type BuildInfo = {
  version?: string;
  git?: string;
  builtAt?: string;
};

function readText(filePath: string): string | null {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return null;
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function readBuildInfo(): BuildInfo {
  const candidates = [
    path.join(process.cwd(), "public", "build-info.json"),
    path.join(process.cwd(), "build-info.json"),
  ];
  for (const candidate of candidates) {
    const text = readText(candidate);
    if (!text) continue;
    try {
      return JSON.parse(text) as BuildInfo;
    } catch {
      return {};
    }
  }
  return {};
}

function parseDeployStatus(text: string): DeploySnapshot {
  const raw: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    raw[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  const pick = (key: string) => {
    if (!(key in raw)) return null;
    return raw[key].length > 0 ? raw[key] : null;
  };
  return {
    status: pick("STATUS"),
    stage: pick("STAGE"),
    message: pick("MESSAGE"),
    error: pick("ERROR"),
    pid: pick("PID"),
    gitSha: pick("GIT_SHA"),
    buildTime: pick("BUILD_TIME"),
    livePort: pick("LIVE_PORT") ?? pick("PUBLIC_PORT"),
    nginxDomain: pick("NGINX_DOMAIN"),
    updatedAt: pick("UPDATED_AT"),
    startedAt: pick("STARTED_AT"),
    zone: pick("ZONE"),
    activeSlot: pick("ACTIVE_SLOT"),
    composeFile: pick("COMPOSE_FILE"),
  };
}

function deployStatusFile(): string | null {
  const candidates = [
    process.env.DEPLOY_STATUS_PATH,
    "/app/deploy-status",
    path.join(process.cwd(), ".cd-state", "deploy-status"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (readText(candidate) !== null) return candidate;
  }
  return null;
}

function readLastDeployedSha(zone: CdPolicySnapshot["zone"]): string | null {
  const candidates =
    zone === "live"
      ? [
          process.env.LAST_DEPLOYED_SHA_PATH,
          "/app/last-deployed-sha",
          path.join(process.cwd(), ".cd-state", "last-deployed-sha"),
        ]
      : [
          process.env.LAST_DEPLOYED_SHA_PATH,
          "/app/last-deployed-sha-dev",
          path.join(process.cwd(), ".cd-state", "last-deployed-sha-dev"),
          path.join(process.cwd(), ".cd-state", "last-deployed-sha"),
        ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const text = readText(candidate);
    if (text) return text.trim().split(/\s+/)[0] || null;
  }
  return null;
}

function resolveZone(deployZone: string | null): CdPolicySnapshot["zone"] {
  const env = (process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV || "").toLowerCase();
  if (deployZone === "production" || deployZone === "live" || env === "production") return "live";
  if (deployZone === "development" || env === "development") return "development";
  if (env === "production") return "live";
  if (env) return "development";
  return "unknown";
}

function nonEmpty(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPingPayload(now = new Date()): PingPayload {
  const info = readBuildInfo();
  const uptimeSeconds = Math.max(0, Math.round(process.uptime()));
  const upSince = new Date(now.getTime() - process.uptime() * 1000).toISOString();
  const statusFile = deployStatusFile();
  const statusText = statusFile ? readText(statusFile) : null;
  const deploy = statusText ? parseDeployStatus(statusText) : null;
  const zone = resolveZone(deploy?.zone ?? null);
  const autoCdExpected = zone === "live";
  const lastDeployedSha = readLastDeployedSha(zone);

  return {
    ok: true,
    service: "novin-club",
    pingPong: "club-fe",
    now: now.toISOString(),
    version: {
      package: nonEmpty(info.version),
      git:
        nonEmpty(process.env.GIT_SHA) ||
        nonEmpty(process.env.NEXT_PUBLIC_GIT_SHA) ||
        nonEmpty(info.git) ||
        "unknown",
      builtAt: nonEmpty(process.env.BUILD_TIME) || nonEmpty(info.builtAt),
      upSince,
      uptimeSeconds,
    },
    deploy,
    cd: {
      zone,
      autoCdExpected,
      lastDeployedSha,
      verifyHint: autoCdExpected
        ? "After git push novin main, wait ~2m then refresh /api/ping — version.git should match tip. Fallback: yarn logs:live"
        : "Dig has no auto CD — ship with yarn sync:dev, then refresh /api/ping. Fallback: yarn logs:dev",
    },
  };
}
