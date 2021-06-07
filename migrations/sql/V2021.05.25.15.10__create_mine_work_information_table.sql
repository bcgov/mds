CREATE TABLE IF NOT EXISTS mine_work_status (
  mine_work_status_code varchar PRIMARY KEY,
  description varchar NOT NULL,
  display_order smallint,
  active_ind boolean DEFAULT true NOT NULL,
  create_user varchar(60) NOT NULL,
  create_timestamp timestamptz DEFAULT now() NOT NULL,
  update_user varchar(60) NOT NULL,
  update_timestamp timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE mine_work_status OWNER TO mds;

INSERT INTO mine_work_status (
  mine_work_status_code,
  description,
  display_order,
  create_user,
  update_user
)
VALUES
  ('WORKING', 'Working', 10, 'system-mds', 'system-mds'),
  ('NOT_WORKING', 'Not Working', 20, 'system-mds', 'system-mds'),
  ('UNKNOWN', 'Unknown', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS mine_work_information (
  mine_work_information_id serial PRIMARY KEY,
  mine_work_information_guid uuid DEFAULT gen_random_uuid() NOT NULL,
  mine_guid uuid NOT NULL,
  work_start_date date,
  work_stop_date date,
  work_comments varchar,
  mine_work_status_code varchar,
  created_by varchar NOT NULL,
  created_timestamp timestamptz NOT NULL,
  updated_by varchar NOT NULL,
  updated_timestamp timestamptz NOT NULL,
  deleted_ind boolean DEFAULT false NOT NULL,

  create_user varchar(60) NOT NULL,
  create_timestamp timestamptz DEFAULT now() NOT NULL,
  update_user varchar(60) NOT NULL,
  update_timestamp timestamptz DEFAULT now() NOT NULL,

  FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mine_work_status_code) REFERENCES mine_work_status(mine_work_status_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE mine_work_information OWNER TO mds;

-- Create indexes