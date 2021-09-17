# rsh into openshift psql pod at path /tmp/ and run

pg_dumpall --roles-only -U postgres > /tmp/roles_super.sql  
pg_dump -Fc -U postgres mds > mds.dump

# then rsync them out locally

# seed roles first so that the dump doesnt default to rdsadmin

psql -h HOSTNAME -U postgres -f roles.sql

# restore all

pg_restore -h HOSTNAME --role=postgres --no-owner --no-privileges -U postgres -d mds mds.dump

# Remove migration row for db that causes flyway error
