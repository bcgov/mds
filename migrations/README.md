ASSUMPTIONS:
- there is a dedicated database (e.g. mds), with an owner (e.g. mds) that has all the required privileges required
- Openshift Pipeline will take care of this.  Note that if you require it locally:
   psql -t -U $POSTGRESQL_USER

```
  CREATE DATABASE mds;
  CREATE USER mds WITH ENCRYPTED PASSWORD '<xxxx>';
  GRANT ALL PRIVILEGES ON DATABASE mds TO mds;
```
1. Logged in on 'mds' database: 
   psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER -c 'CREATE EXTENSION pgcrypto;'

2. Logged in as 'mds' user on 'mds' database:

    psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER -f 0001.mine-record.sql

3. Optional test data

insert into mine (mine_guid) values ('2daa4513-201f-4103-83c6-5bd1fae6a962');
insert into mine_core (mine_guid, mine_no, mine_name)
values ('2daa4513-201f-4103-83c6-5bd1fae6a962',
       'XXXYYYZZZZ',
       'Test Mine #1 with identifying attributes which may change over time.')
;