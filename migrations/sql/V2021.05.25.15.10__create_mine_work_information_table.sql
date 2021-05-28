CREATE TABLE IF NOT EXISTS mine_work_information (
  mine_work_information_id integer PRIMARY KEY,
  mine_work_information_guid uuid DEFAULT gen_random_uuid() NOT NULL,
  mine_guid uuid NOT NULL,
  work_start_date date,
  work_stop_date date,
  work_comments varchar,
  created_by varchar NOT NULL,
  created_timestamp timestamptz NOT NULL,
  updated_by varchar NOT NULL,
  updated_timestamp timestamptz NOT NULL,
  deleted_ind boolean DEFAULT false NOT NULL,

  create_user varchar(60) NOT NULL,
  create_timestamp timestamptz DEFAULT now() NOT NULL,
  update_user varchar(60) NOT NULL,
  update_timestamp timestamptz DEFAULT now() NOT NULL,

  FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE mine_work_information OWNER TO mds;
