#!/usr/bin/env bash
# Sobe um Postgres 16 efêmero para testes (porta 55432) e imprime as URLs.
# Uso: eval "$(scripts/test-db.sh)"
set -euo pipefail
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)}"
DATA="${PGDATA_DIR:-/tmp/tributon-pg}"
PORT="${PGPORT_TEST:-55432}"
AS=()
[ "$(id -u)" = "0" ] && AS=(runuser -u postgres --)

if [ ! -f "$DATA/PG_VERSION" ]; then
  mkdir -p "$DATA" && [ "$(id -u)" = "0" ] && chown postgres "$DATA"
  "${AS[@]}" "$PGBIN/initdb" -D "$DATA" -U postgres --auth=trust -E UTF8 >/dev/null
fi
if ! "${AS[@]}" "$PGBIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
  "${AS[@]}" "$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/log" start -w >/dev/null
fi
psql -h localhost -p "$PORT" -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='tributon_test'" | grep -q 1 \
  || psql -h localhost -p "$PORT" -U postgres -qc "CREATE DATABASE tributon_test" >/dev/null

echo "export DATABASE_URL=postgres://postgres@localhost:$PORT/tributon_test"
echo "export DATABASE_URL_APP=postgres://tributon_app:tributon_app@localhost:$PORT/tributon_test"
echo "export DATABASE_URL_WORKER=postgres://tributon_worker:tributon_worker@localhost:$PORT/tributon_test"
