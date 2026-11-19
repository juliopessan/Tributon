#!/usr/bin/env bash
# Sobe a Calculadora de Tributos oficial (Receita Federal, MIT) como serviço local, numa versão fixada.
# Uso: engine/run-engine.sh   (ENGINE_PORT padrão 8080, ENGINE_MGMT_PORT padrão 9101)
#   ENGINE_REF  tag do repositório oficial (padrão 1.6.1, a versão testada)
#   ENGINE_SRC  pasta com o código do motor (padrão engine/.calculadora, clonada se não existir)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REF="${ENGINE_REF:-1.6.1}"
SRC="${ENGINE_SRC:-$HERE/.calculadora}"
PORT="${ENGINE_PORT:-8080}"
MGMT_PORT="${ENGINE_MGMT_PORT:-9101}"
REPO="https://github.com/ReceitaFederal/calculadora-rtc-regime-regular"

if [ ! -d "$SRC/.git" ]; then
  echo "[engine] clonando $REPO na tag $REF..."
  git clone -q --depth 1 --branch "$REF" "$REPO" "$SRC"
fi
cd "$SRC"

if [ ! -f calculadora/db/calculadora-pro.db ]; then
  echo "[engine] gerando banco SQLite (Flyway)..."
  mkdir -p calculadora/db
  ./mvnw flyway:migrate -Dflyway.configFiles=./flyway/flyway-pro.conf --batch-mode --errors -q
fi
JAR="$(ls target/*.jar 2>/dev/null | head -1 || true)"
if [ -z "$JAR" ]; then
  echo "[engine] compilando o motor..."
  ./mvnw -DskipTests package --batch-mode -q
  JAR="$(ls target/*.jar | head -1)"
fi

echo "[engine] subindo $JAR na porta $PORT"
java -jar "$JAR" --spring.profiles.active=offline --server.port="$PORT" --management.server.port="$MGMT_PORT" &
PID=$!
trap 'kill $PID 2>/dev/null || true' INT TERM
for _ in $(seq 1 90); do
  if curl -sf "http://localhost:$PORT/api/calculadora/dados-abertos/versao" >/dev/null; then
    echo "[engine] pronto: http://localhost:$PORT/api/calculadora"
    wait $PID
    exit $?
  fi
  kill -0 $PID 2>/dev/null || { echo "[engine] processo terminou antes de responder" >&2; exit 1; }
  sleep 2
done
echo "[engine] não respondeu em 180 s" >&2
kill $PID
exit 1
