const config = {
  // no-restricted-syntax is warn-level (gradual spacing/i18n migration); fail only on errors.
  "*.{ts,tsx}": ["eslint --fix --max-warnings=9999", "prettier --write"],
  "*.{js,mjs,json,css}": ["prettier --write"],
};

export default config;
