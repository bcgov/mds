#!/bin/bash
set -e

if [ "$#" -eq 0 -o "${1:0:1}" = '-' ]; then
	set -- pg_upgrade "$@" -o "-c logging_collector=off"
fi

if [ "$1" = 'pg_upgrade' -a "$(id -u)" = '0' ]; then
	exec gosu postgres "$BASH_SOURCE" "$@"
fi

if [ "$1" = 'pg_upgrade' ]; then
	if [ ! -s "$PGDATANEW/PG_VERSION" ]; then
		PGDATA="$PGDATANEW" eval "initdb $POSTGRES_INITDB_ARGS"
	fi
fi

exec "$@"