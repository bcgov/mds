### Postgres 9 -> 13.3 Upgrade steps


> NOTE

```
Ref: https://postgis.net/docs/RT_FAQ.html 13.4 -> PostGIS raster is now a separate extension and requires: `CREATE EXTENSION postgis_raster;` to enable it in your database.
```


### Step 1 

- login to backup container
- copy and rename backup file as tmp.sql.gz
- extract using gunzip

### Step 2 

Run the following commands to edit the `tmp.sql` file

We do this because postgis is updated by a major version 2 -> 3 and has architecture changes at extension level 

```
sed -i '/raster_columns/d' tmp.sql
sed -i '/raster_overviews/d' tmp.sql
sed -i '/REFRESH MATERIALIZED VIEW public.now_application_gis_export_view;/d' tmp.sql
```

### Step 3

Gzip the update `tmp.sql` 

Run Restore Roles: `psql -h postgres13 -U postgres -f /tmp/roles.sql`

Run Restore: `./backup.sh -r postgres13:5432/mds -f <INSERT_FILENAME>`


### Step 4

Run the following manually after backup (the below section failed to run due to missing raster artifacts in new db)

Login to the new postgres db - `psql -h postgres13 -p 5432 -U postgres`

Connect to mds database `\c mds` 

```
CREATE EXTENSION IF NOT EXISTS postgis_raster;

GRANT ALL ON TABLE public.raster_columns TO mds;
GRANT SELECT ON TABLE public.raster_columns TO logstash;
GRANT SELECT ON TABLE public.raster_columns TO metabase;

GRANT ALL ON TABLE public.raster_overviews TO mds;
GRANT SELECT ON TABLE public.raster_overviews TO logstash;
GRANT SELECT ON TABLE public.raster_overviews TO metabase;

REFRESH MATERIALIZED VIEW public.now_application_gis_export_view;
```