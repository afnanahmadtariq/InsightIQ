#!/bin/sh
set -eu

run_database_migrations() {
  npm run db:migrate --workspace=@insightiq/db
}

case "${1:-serve}" in
  migrate)
    run_database_migrations
    ;;
  serve)
    if [ "${API_RUN_DB_SETUP_ON_STARTUP:-true}" = "true" ]; then
      run_database_migrations
    fi
    exec node apps/api/dist/main.js
    ;;
  *)
    exec "$@"
    ;;
esac
