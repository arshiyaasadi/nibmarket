# پرامپت جمع‌آوری لاگ لایو (بدون ریموت برای ایجنت)

این متن را روی سرور یا در ترمینال خودت اجرا کن، خروجی را کپی کن و در چت بفرست تا تحلیل شود.

## دستور یک‌جا (کپی/پیست روی سرور لایو)

```bash
echo "===== HOST / TIME ====="
hostname; date -u; date
echo
echo "===== CLUB CONTAINERS ====="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -40
echo
echo "===== COMPOSE (club) ====="
# مسیر پروژه را اگر فرق دارد عوض کن
cd /opt/novin-club 2>/dev/null || cd ~/novin-club 2>/dev/null || true
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
  || docker logs --tail=200 "$(docker ps -qf name=web)" 2>/dev/null
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

## اگر فقط لاگ اپ لازم است

```bash
docker compose -f docker-compose.live.yml logs --tail=300 -t web
```

## پرامپت کوتاه برای چت (همین را با خروجی بفرست)

```
لاگ لایو کلاب را می‌فرستم. لطفاً تحلیل کن:
- مسیر SSO (panel → /login/sso → session)
- تماس BFF با http://club-srv.nibmarket.com
- خطاهای 401/502/redirect loop
خروجی دستورات زیر:
<اینجا paste خروجی>
```
