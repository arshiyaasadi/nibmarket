// Single source of truth for project branding and token configuration.
// Update here when the project name, logo, or native token changes.

export const PROJECT = {
  name: "باشگاه مشتریان تامین سرمایه نوین",
  logoSrc: "/images/logo.svg",
  token: {
    name: "Twin",
    symbol: "TWN",
  },
} as const;

export type ProjectConfig = typeof PROJECT;
