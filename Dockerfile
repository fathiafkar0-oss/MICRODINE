# MICRODINE — Dockerfile untuk hosting (Railway / platform Docker lain)
#
# Satu container berisi: Nginx + PHP-FPM (aplikasi Laravel/Inertia) + Laravel
# Reverb (WebSocket real-time), dikelola Supervisor. Nginx meneruskan trafik
# WebSocket (path /app/…) ke Reverb secara internal, jadi hanya SATU port
# publik yang dibutuhkan — cocok untuk platform seperti Railway yang hanya
# mengekspos satu $PORT per service.
#
# Build frontend (Vite) dilakukan di stage terpisah supaya image akhir tidak
# perlu Node.js sama sekali.

# ---------------------------------------------------------------- Stage 1: build aset frontend
FROM node:20-alpine AS frontend

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# VITE_REVERB_* dibaca Vite SAAT BUILD (bukan saat runtime) — isi lewat build
# args di Railway (lihat docs/DEPLOY_RAILWAY.md) supaya frontend tahu alamat
# WebSocket publiknya.
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_SCHEME=https
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY \
    VITE_REVERB_HOST=$VITE_REVERB_HOST \
    VITE_REVERB_PORT=$VITE_REVERB_PORT \
    VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME
RUN npm run build

# ---------------------------------------------------------------- Stage 2: aplikasi PHP
FROM php:8.3-fpm-bookworm AS app

RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx supervisor libpq-dev libzip-dev zip unzip git gettext-base \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Salin dulu berkas dependency saja supaya layer composer bisa di-cache.
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction

COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN composer dump-autoload --optimize --no-dev \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && rm -f /etc/nginx/sites-enabled/default

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
