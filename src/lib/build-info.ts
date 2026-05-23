import { readFile } from 'fs/promises'
import path from 'path'

export type BuildInfo = {
  version: string
  gitCommit: string
  gitCommitFull?: string
  buildTime: string
  environment: 'production' | 'development' | string
  nodeEnv?: string
}

const DEFAULT_BUILD_INFO: BuildInfo = {
  version: process.env.npm_package_version || 'unknown',
  gitCommit: 'unknown',
  buildTime: 'unknown',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  nodeEnv: process.env.NODE_ENV || 'development'
}

export async function readBuildInfo(): Promise<BuildInfo> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'build-info.json')
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as BuildInfo

    return { ...DEFAULT_BUILD_INFO, ...parsed }
  } catch {
    return {
      ...DEFAULT_BUILD_INFO,
      version: process.env.APP_VERSION || DEFAULT_BUILD_INFO.version,
      gitCommit: process.env.GIT_COMMIT || DEFAULT_BUILD_INFO.gitCommit,
      buildTime: process.env.BUILD_TIME || DEFAULT_BUILD_INFO.buildTime,
      environment: process.env.APP_ENV || DEFAULT_BUILD_INFO.environment
    }
  }
}

export function formatBuildTime(iso: string, locale = 'fa-IR'): string {
  if (!iso || iso === 'unknown') return 'نامشخص'

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Tehran'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function environmentLabel(env: string): string {
  if (env === 'production') return 'پروداکشن (Production)'

  return 'توسعه (Development)'
}
