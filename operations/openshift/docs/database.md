# Database Restores
At the time of writing this Core is using Postgres 9.6 Redhat + PostGIS using the [BCDevOps Backup Container](https://github.com/BCDevOps/backup-container)

Two types of restores are typically performed and they depend on if the database already exists or if you're starting from scratch

## Database Already exists and matches runtime
- Run the BCDevops container restore function targeting the desired database following [BCDevOps Backup Container](https://github.com/BCDevOps/backup-container) documentation
- `WARNING` THIS DROPS THE TARGET DATABASE BEFORE THE RESTORE
- Note that the backup solution will stop when it encounters ANY (missing extensions, roles, etc) errors, as per this [line](https://github.com/BCDevOps/backup-container/blob/master/docker/backup.postgres.plugin#L89)

## Database is fresh/empty
- Postgresql has a `maintenance` database that is always provisioned named `postgres` regardless of if you use that as your named database
- The `maintenance` database contains schema/performance/maintenance info and user roles
- When a database restore is performed, if roles do not exist then tables/data will fail that depend on those missing roles (depending on how the dump was performed)
- In the case of the backups provided by our solution, we need to ensure roles exist
- To get the roles, run the following in the postgresql pod: `pg_dumpall --roles-only -U postgres > /tmp/roles.sql` and `oc rsync` the file out of the pod to where you need it (the file is considered sensitive)
- Seed roles: `psql -h HOSTNAME -U postgres -f roles.sql`
- Find and rsync the most recent backup file by accessing the `dbbackup` pod and looking under `/backups/`
- `gunzip` the backup file so that it's plain sql
- Perform restore: `psql -h HOSTNAME -U postgres -f BACKUPFILE`

# Notes
- If you try switching images but using the same backups you'll get a failure from missing extensions, make sure your new solution has matching extensions to what is in the backup. It is not simply a case of executing a create extension statement, they must also be installed in the filesystem during build time.
