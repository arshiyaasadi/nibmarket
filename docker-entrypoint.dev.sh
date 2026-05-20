#!/bin/sh
set -e
if [ ! -f node_modules/.bin/next ]; then
  echo "[docker] Installing dependencies (first run or empty volume)..."
  npm ci
fi
exec "$@"
