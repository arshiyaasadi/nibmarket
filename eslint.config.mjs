import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Block hardcoded Persian strings in TS/TSX (except resource files below).
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXText[value=/[\\u0600-\\u06FF]/]",
          message: "Hardcoded Persian in JSX is not allowed — use t() from next-intl.",
        },
        {
          selector: "Literal[value=/[\\u0600-\\u06FF]/]:not(ImportDeclaration > Literal)",
          message: "Hardcoded Persian strings are not allowed — use resources/messages.",
        },
        // ── Spacing token enforcement ────────────────────────────────
        {
          selector:
            "Literal[value=/\\b(p|px|py|pt|pb|ps|pe|m|mx|my|mt|mb|ms|me|gap|space-x|space-y)-(\\d+|\\[.+\\])/]",
          message:
            "Raw Tailwind spacing is not allowed — use semantic tokens (e.g. p-pad-mol, gap-atom). See docs/spacing.md",
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
