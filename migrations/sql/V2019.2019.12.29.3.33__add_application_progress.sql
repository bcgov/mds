CREATE TABLE IF NOT EXISTS application_progress_type (
  application_progress_type_code character varying(3)PRIMARY KEY,
  description character varying(100) NOT NULL,
  active_ind boolean,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE application_progress_type OWNER TO mds;

CREATE TABLE IF NOT EXISTS application_progress (
  application_progress_id SERIAL PRIMARY KEY,
  now_application_id integer,
  application_progress_type_code character varying(3),
  active_ind boolean,
  end_date character varying(60),
  start_date character varying(60) NOT NULL,
  created_by character varying(60) NOT NULL,
  updated_by character varying(60) NOT NULL,
  create_user character varying(60) NOT NULL,
  create_timestamp character varying(60) NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp character varying(60) NOT NULL,
  PRIMARY KEY (application_progress_id)

  FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id)
  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (application_progress_type_code) REFERENCES application_progress_type(application_progress_type_code)
  DEFERRABLE INITIALLY DEFERRED,
);

ALTER TABLE application_progress OWNER TO mds;
