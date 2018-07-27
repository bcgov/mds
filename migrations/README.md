ASSUMPTIONS:
- there is a dedicated database (e.g. `mds`), with an owner (e.g. `mds`) that has all the required privileges required
- Openshift Pipeline will take care of this.  Note that if you require it locally:
   `psql -t -U $POSTGRESQL_USER`

```
  CREATE DATABASE mds;
  CREATE USER mds WITH ENCRYPTED PASSWORD '<xxxx>';
  GRANT ALL PRIVILEGES ON DATABASE mds TO mds;
```
1. Logged in as superuser on 'mds' database: 

```
cd $APP_ROOT/src/migrations
psql -d $POSTGRESQL_DATABASE -f 0000.mds-setup.sql
```

To revert: `psql -d $POSTGRESQL_DATABASE -f 0000.mds-setup.revert.sql`

2. Logged in as 'mds' user on 'mds' database: 

```
cd $APP_ROOT/src/migrations
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
\i 0001.mine-record.sql
EOF
```

To revert, logged in as 'mds' user on 'mds' database:

```
cd $APP_ROOT/src/migrations
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
\i 0001.mine-record.revert.sql
EOF
```

3. Optional test data, logged in as 'mds' user on 'mds' database: 

```
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
insert into mine_identity (mine_guid) values ('2daa4513-201f-4103-83c6-5bd1fae6a962');
insert into mine_detail (mine_detail_guid, mine_guid, mine_no, mine_name)
values ('f0bbc7da-11dd-4a1b-af6d-d280b6c8dfbf',
        '2daa4513-201f-4103-83c6-5bd1fae6a962',
        'XXXYYYZZZZ',
        'Test Mine #1 with core attributes which may change over time.')
;
\x
select * from mine_detail;
EOF
```