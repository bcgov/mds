[garywong@nc070317 ddl (mds-8-sql-mine-record)]$ psql 
psql: FATAL:  database "garywong" does not exist
[garywong@nc070317 ddl (mds-8-sql-mine-record)]$ psql -d postgres
psql (10.4)
Type "help" for help.

postgres=# CREATE DATABASE mds;
CREATE DATABASE
postgres=# CREATE USER mds WITH ENCRYPTED PASSWORD '<xxxx>';
CREATE ROLE
postgres=# GRANT ALL PRIVILEGES ON DATABASE mds TO mds;
GRANT



[garywong@nc070317 ddl (mds-8-sql-mine-record)]$ psql -d mds
postgres=# CREATE EXTENSION pgcrypto;
CREATE EXTENSION


[garywong@nc070317 ddl (mds-8-sql-mine-record)]$ psql -d mds -U mds

DROP TABLE IF EXISTS mine;
CREATE TABLE mine (
  mine_guid        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  create_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

mds=> insert into mine (mine_guid) values (gen_random_uuid());
INSERT 0 1


DROP TABLE IF EXISTS mine_core;

CREATE TABLE mine_core (
  mine_guid uuid,
  mine_no   character varying(10) NOT NULL,
  mine_name character varying(50) NOT NULL,
  create_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL DEFAULT 'DUMMY_USER',
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
PRIMARY KEY (mine_guid, mine_no),
FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
CONSTRAINT mine_no_uk  UNIQUE (mine_no)
);


insert into mine_core (mine_guid, mine_no, mine_name)
select m.mine_guid, 'XXXXXXXXXX', 'Gary''s Fancy Hole in the Ground'
from mine m;

