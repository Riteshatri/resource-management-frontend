#!/bin/sh
set -e

echo "▶ Generating nginx config from template..."

envsubst '$BACKEND_HOST $BACKEND_PORT' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "▶ Starting nginx..."

exec "$@"
