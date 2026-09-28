#!/usr/bin/env bash
# Upsert KEY=VALUE lines in an env file (creates file if missing).
# Usage: upsert_env_var FILE KEY VALUE
upsert_env_var() {
  local file="$1"
  local key="$2"
  local value="$3"
  touch "${file}"
  if grep -qE "^${key}=" "${file}" 2>/dev/null; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "${file}" && rm -f "${file}.bak"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${file}"
  fi
}

# Apply NIB auth / SSO URL keys for a zone onto an env file.
# Usage: patch_zone_auth_env FILE development|production
patch_zone_auth_env() {
  local file="$1"
  local zone="$2"

  if [[ "${zone}" == "production" ]]; then
    upsert_env_var "${file}" "APP_ENV" "production"
    upsert_env_var "${file}" "NEXT_PUBLIC_APP_ENV" "production"
    upsert_env_var "${file}" "NEXT_PUBLIC_SITE_URL" "https://club.nibmarket.ir"
    upsert_env_var "${file}" "NEXT_PUBLIC_APP_URL" "https://club.nibmarket.ir"
    upsert_env_var "${file}" "NEXT_PUBLIC_AUTH_BASE_URL" "https://auth.nibmarket.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_BASE_URL" "https://panel.nibmarket.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_PROFILE_URL" "https://panel.nibmarket.com/profile/"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL" "https://panel.nibmarket.com/user-account/"
    upsert_env_var "${file}" "SSO_CHECK_TOKEN_URL" "https://panel.nibmarket.com/api/v1/auth/check_token"
  else
    # Force club.nibdev.com as SSO callback host (never api-club)
    upsert_env_var "${file}" "APP_ENV" "development"
    upsert_env_var "${file}" "NEXT_PUBLIC_APP_ENV" "development"
    upsert_env_var "${file}" "NEXT_PUBLIC_SITE_URL" "https://club.nibdev.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_APP_URL" "https://club.nibdev.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_AUTH_BASE_URL" "https://auth.nibdev.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_BASE_URL" "https://panel.nibdev.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_PROFILE_URL" "https://panel.nibdev.com/profile/"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL" "https://panel.nibdev.com/user-account/"
    upsert_env_var "${file}" "SSO_CHECK_TOKEN_URL" "https://panel.nibdev.com/api/v1/auth/check_token"
  fi

  upsert_env_var "${file}" "NEXT_PUBLIC_SSO_CALLBACK_PATH" "/login/sso"
  upsert_env_var "${file}" "NEXT_PUBLIC_SSO_ENTRY_COOKIE" "nib_auth"
  upsert_env_var "${file}" "API_SERVICE_MODE" "api"
}
