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
\ir sql/V0.4__Add_Mine_Manager.sql
EOF
```

To revert, logged in as 'mds' user on 'mds' database:

```
cd $APP_ROOT/src/migrations
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
\ir sql/U0.4__Add_Mine_Manager.sql
\ir sql/U0.3__Add_Tenure_Xref.sql
\ir sql/U0.2__Add_Mine_Tables.sql
EOF
```

3. Optional test data, logged in as 'mds' user on 'mds' database: 

```
psql -d $POSTGRESQL_DATABASE -U $POSTGRESQL_USER << EOF
INSERT INTO mine_identity
 (mine_guid, create_user, update_user) 
VALUES (
 '2daa4513-201f-4103-83c6-5bd1fae6a962'::uuid
 ,'IDIR\GARYWONG'
 ,'IDIR\GARYWONG'
 );

INSERT INTO mine_detail
 (mine_detail_guid, mine_guid, mine_no, mine_name,create_user, update_user)
VALUES (
 'f0bbc7da-11dd-4a1b-af6d-d280b6c8dfbf'::uuid
,'2daa4513-201f-4103-83c6-5bd1fae6a962'::uuid
,'BLAH2018'
,'Test Mine #1 with core attributes.'
,'IDIR\GARYWONG'
,'IDIR\GARYWONG'
);

INSERT INTO mineral_tenure_xref
 (mineral_tenure_xref_guid, mine_guid, tenure_number_id,create_user, update_user)
VALUES (
 'd1087161-cdf7-4c07-98d8-4f0508fa4556'::uuid
,'2daa4513-201f-4103-83c6-5bd1fae6a962'::uuid
,200239
,'IDIR\GARYWONG'
,'IDIR\GARYWONG'
);
INSERT INTO mineral_tenure_xref
 (mineral_tenure_xref_guid, mine_guid, tenure_number_id,create_user, update_user)
VALUES (
 '5e0281cc-8663-4108-afbf-abf915df16a4'::uuid
,'2daa4513-201f-4103-83c6-5bd1fae6a962'::uuid
,200724
,'IDIR\KLEFLER'
,'IDIR\KLEFLER'
);


INSERT INTO person
 (person_guid, first_name, surname, create_user, update_user,effective_date)
VALUES (
 'e251f99f-1bf8-4956-ac84-de1c058496ed'::uuid
,'Joseph'
,'Technicolour'  
,'IDIR\GARYWONG'
,'IDIR\GARYWONG'
,'1999-12-31'::date
);


INSERT INTO mgr_appointment
 (mgr_appointment_guid, mine_guid, person_guid, effective_date, create_user,  update_user)
VALUES (
 '527f16bf-9c11-41f1-80d9-f304f276df92'::uuid
,'2daa4513-201f-4103-83c6-5bd1fae6a962'::uuid
,'e251f99f-1bf8-4956-ac84-de1c058496ed'::uuid
,'1999-12-31'::date
,'IDIR\GARYWONG'
,'IDIR\GARYWONG'
);


SELECT id.mine_guid, det.mine_no
      ,det.mine_name
      ,xref.tenure_number_id
FROM   mine_identity id
INNER JOIN mine_detail         det  ON id.mine_guid   = det.mine_guid
INNER JOIN mineral_tenure_xref xref ON xref.mine_guid = id.mine_guid;

SELECT id.mine_guid, det.mine_no, det.mine_name, mgr.first_name, mgr.surname,
       app.effective_date, 
       CASE app.expiry_date
         WHEN '9999-12-31'::date THEN NULL
         ELSE app.expiry_date
       END 
FROM   mine_identity id,
       mine_detail det,
       person mgr,
       mgr_appointment app
WHERE  id.mine_guid = det.mine_guid
AND    id.mine_guid = app.mine_guid
AND    app.person_guid = mgr.person_guid;
EOF
```