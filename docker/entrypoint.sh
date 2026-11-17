#!/bin/sh
set -e

# Railway menentukan port publik lewat variabel PORT; default 8080 untuk
# dijalankan manual/lokal (mis. `docker run -p 8080:8080 ...`).
: "${PORT:=8080}"
export PORT

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/sites-enabled/default.conf

cd /var/www/html

if [ -z "$APP_KEY" ]; then
    echo "FATAL: variabel APP_KEY belum diisi. Jalankan 'php artisan key:generate --show' lalu" >&2
    echo "       tempel hasilnya sebagai variabel environment APP_KEY di platform hosting." >&2
    exit 1
fi

# Bersihkan cache config lama (kalau ada dari image sebelumnya) lalu cache
# ulang dengan env variable yang sesungguhnya dari platform hosting.
php artisan config:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
