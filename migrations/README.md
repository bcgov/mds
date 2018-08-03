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
psql -d $POSTGRESQL_DATABASE -f sql/V0.1__Extension_Crypto.sql
```

To revert: `psql -d $POSTGRESQL_DATABASE -f sql/U0.1__Extension_Crypto.sql`

2. Logged in as 'mds' user on 'mds' database: 

```
cd $APP_ROOT/src/migrations
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
\ir sql/V0.2__Add_Mine_Tables.sql
\ir sql/V0.3__Add_Tenure_Xref.sql
EOF
```

To revert, logged in as 'mds' user on 'mds' database:

```
cd $APP_ROOT/src/migrations
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
\ir sql/U0.3__Add_Tenure_Xref.sql
\ir sql/U0.2__Add_Mine_Tables.sql
EOF
```

4. Optional test data, logged in as 'mds' user on 'mds' database: 

```
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
insert into mine_identity (mine_guid, create_user, update_user) 
values ('2daa4513-201f-4103-83c6-5bd1fae6a962', 'IDIR\GARYWONG', 'IDIR\GARYWONG');

insert into mine_detail
(mine_detail_guid, mine_guid, mine_no, mine_name,create_user, update_user)
values ('f0bbc7da-11dd-4a1b-af6d-d280b6c8dfbf',
        '2daa4513-201f-4103-83c6-5bd1fae6a962',
        'BLAH2018',
        'Test Mine #1 with core attributes.',
        'IDIR\GARYWONG',
        'IDIR\GARYWONG'
        )
;

insert into mineral_tenure_xref
(mineral_tenure_xref_guid, mine_guid, tenure_number_id,create_user, update_user)
values ('d1087161-cdf7-4c07-98d8-4f0508fa4556',
        '2daa4513-201f-4103-83c6-5bd1fae6a962',
        '200239',
        'IDIR\GARYWONG',
        'IDIR\GARYWONG'
        )
;
insert into mineral_tenure_xref
(mineral_tenure_xref_guid, mine_guid, tenure_number_id,create_user, update_user)
values ('5e0281cc-8663-4108-afbf-abf915df16a4',
        '2daa4513-201f-4103-83c6-5bd1fae6a962',
        '200724',
        'IDIR\KLEFLER',
        'IDIR\KLEFLER'
        )
;

select identity.mine_guid, detail.mine_no, detail.mine_name,
       tenure_xref.tenure_number_id
from   mine_identity identity,
       mine_detail detail,
       mineral_tenure_xref tenure_xref
;
EOF
```