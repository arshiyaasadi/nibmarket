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

# Drop legacy front-domain keys — origin comes from the request / browser.
# Usage: clear_front_origin_env FILE
clear_front_origin_env() {
  local file="$1"
  [[ -f "${file}" ]] || return 0
  if grep -qE '^(NEXT_PUBLIC_SITE_URL|NEXT_PUBLIC_APP_URL)=' "${file}" 2>/dev/null; then
    sed -i.bak -E '/^(NEXT_PUBLIC_SITE_URL|NEXT_PUBLIC_APP_URL)=/d' "${file}" && rm -f "${file}.bak"
  fi
}

# Apply NIB auth / SSO URL keys for a zone onto an env file.
# Front public host is NOT written — derived from Host / browser origin.
# Usage: patch_zone_auth_env FILE development|production
patch_zone_auth_env() {
  local file="$1"
  local zone="$2"

  clear_front_origin_env "${file}"

  if [[ "${zone}" == "production" ]]; then
    upsert_env_var "${file}" "APP_ENV" "production"
    upsert_env_var "${file}" "NEXT_PUBLIC_APP_ENV" "production"
    upsert_env_var "${file}" "BACKEND_API_BASE_URL" "https://club-srv.nibmarket.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_AUTH_BASE_URL" "https://auth.nibmarket.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_BASE_URL" "https://panel.nibmarket.com"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_PROFILE_URL" "https://panel.nibmarket.com/profile/"
    upsert_env_var "${file}" "NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL" "https://panel.nibmarket.com/user-account/"
    upsert_env_var "${file}" "SSO_CHECK_TOKEN_URL" "https://panel.nibmarket.com/api/v1/auth/check_token"
  else
    upsert_env_var "${file}" "APP_ENV" "development"
    upsert_env_var "${file}" "NEXT_PUBLIC_APP_ENV" "development"
    upsert_env_var "${file}" "BACKEND_API_BASE_URL" "https://api-club.nibdev.com"
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

# Enable in-memory BFF mocks on a production image (demo / UI review).
# Usage: patch_live_ui_mock_env FILE
# Requires rebuild so NEXT_PUBLIC_* bake into the client bundle.
patch_live_ui_mock_env() {
  local file="$1"
  upsert_env_var "${file}" "FORCE_UI_DEV_MODE" "1"
  upsert_env_var "${file}" "NEXT_PUBLIC_FORCE_UI_DEV_MODE" "1"
  upsert_env_var "${file}" "NEXT_PUBLIC_UI_DEV_MODE" "1"
  upsert_env_var "${file}" "API_SERVICE_MODE" "mock"
}

# Disable UI-mock flags (restore real API proxy).
# Usage: clear_live_ui_mock_env FILE
clear_live_ui_mock_env() {
  local file="$1"
  upsert_env_var "${file}" "FORCE_UI_DEV_MODE" "0"
  upsert_env_var "${file}" "NEXT_PUBLIC_FORCE_UI_DEV_MODE" "0"
  upsert_env_var "${file}" "UI_DEV_MODE" "0"
  upsert_env_var "${file}" "NEXT_PUBLIC_UI_DEV_MODE" "0"
  upsert_env_var "${file}" "API_SERVICE_MODE" "api"
}
