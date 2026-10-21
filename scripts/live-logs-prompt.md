# Live log collection prompt (no remote for the agent)

Run this on the live server (or your own SSH session), copy the output, and paste it in chat for analysis.

## One-shot command (copy/paste on live)

```bash
echo "===== HOST / TIME ====="
hostname; date -u; date
echo
echo "===== CLUB CONTAINERS ====="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -40
echo
echo "===== COMPOSE (club) ====="
# Change project path if different on this host
cd /opt/novin-club 2>/dev/null || cd /opt/MLM_Front 2>/dev/null || cd ~/novin-club 2>/dev/null || true
pwd
docker compose -f docker-compose.live.yml ps 2>/dev/null || docker-compose -f docker-compose.live.yml ps 2>/dev/null
echo
echo "===== APP ENV (redacted) ====="
docker compose -f docker-compose.live.yml exec -T web printenv 2>/dev/null \
  | egrep '^(APP_ENV|NODE_ENV|BACKEND_|PANEL_|AUTH_|SSO_|NEXT_PUBLIC_|PUBLIC_)' \
  | sed -E 's/(TOKEN|SECRET|PASSWORD|KEY)=.*/\1=***/i' \
  || true
echo
echo "===== APP LOGS (last 200) ====="
docker compose -f docker-compose.live.yml logs --tail=200 web 2>/dev/null \
  || docker logs --tail=200 "$(docker ps -qf name=mlm_front_live)" 2>/dev/null
echo
echo "===== NGINX ERROR / ACCESS (last 80) ====="
sudo tail -n 80 /var/log/nginx/error.log 2>/dev/null
echo "---"
sudo tail -n 80 /var/log/nginx/access.log 2>/dev/null | egrep 'club|/login|/api/v2|sso' | tail -n 40
echo
echo "===== LOCAL CURL ORIGIN :3000 ====="
curl -sS -o /dev/null -w 'home:%{http_code} redirect:%{redirect_url}\n' http://127.0.0.1:3000/
curl -sS -o /dev/null -w 'sso:%{http_code} redirect:%{redirect_url}\n' 'http://127.0.0.1:3000/login/sso/'
curl -sS -o /dev/null -w 'bff-healthish:%{http_code}\n' -H 'Accept: application/json' http://127.0.0.1:3000/api/v2/ 2>/dev/null || true
echo
echo "===== BACKEND FROM ORIGIN HOST (HTTP only) ====="
curl -sS -o /dev/null -w 'club-srv:%{http_code} time:%{time_total}\n' \
  --connect-timeout 5 \
  http://club-srv.nibmarket.com/api/v2/ 2>/dev/null || echo 'club-srv unreachable'
echo
echo "===== DONE ====="
```

## App logs only

```bash
docker compose -f docker-compose.live.yml logs --tail=300 -t web
```

## Short chat prompt (paste with the output)

```
Live club logs — please analyze:
- SSO path (panel → /login/sso → session)
- BFF calls to http://club-srv.nibmarket.com
- 401 / 502 / redirect-loop errors
Command output:
<paste output here>
```
