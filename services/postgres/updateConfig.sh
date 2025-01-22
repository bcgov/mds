#!/usr/bin/env bash

cat /tmp/postgresql.conf >/var/lib/postgresql/data/postgresql.conf
cat /tmp/pg_hba.conf >/var/lib/postgresql/data/pg_hba.conf