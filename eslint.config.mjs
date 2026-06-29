import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // جلوگیری از رشته‌های hardcoded فارسی در TSX/TS
      // استثنا: فایل‌های resource (messages, data)
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXText[value=/[\\u0600-\\u06FF]/]",
          message:
            "رشته فارسی مستقیم در JSX ممنوع است — از t() در next-intl استفاده کنید.",
        },
        {
          selector:
            "Literal[value=/[\\u0600-\\u06FF]/]:not(ImportDeclaration > Literal)",
          message:
            "رشته فارسی مستقیم ممنوع است — از resources/messages استفاده کنید.",
        },
        // ── Spacing token enforcement ────────────────────────────────
        {
          selector:
            "Literal[value=/\\b(p|px|py|pt|pb|ps|pe|m|mx|my|mt|mb|ms|me|gap|space-x|space-y)-(\\d+|\\[.+\\])/]",
          message:
            "Spacing خام ممنوع است — از توکن‌های semantic استفاده کنید (مثال: p-pad-mol، gap-atom). مستندات: docs/spacing.md",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/resources/**/*", "messages/**/*"],
    rules: { "no-restricted-syntax": "off" },
  },
]);

export default eslintConfig;
