ALTER TABLE now_application ADD COLUMN ready_for_review_date timestamp with time zone;
ALTER TABLE now_application ADD COLUMN review_closed_on_date timestamp with time zone;


CREATE TABLE IF NOT EXISTS now_application_review_type (
  now_application_review_type_code character varying(3)PRIMARY KEY,
  description character varying(100) NOT NULL,
  active_ind boolean DEFAULT true NOT NULL,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE now_application_review_type OWNER TO mds;
COMMENT ON TABLE now_application_review_type IS 'Holds types of Notice of Work application reviews';


CREATE TABLE IF NOT EXISTS now_application_review (
  now_application_review_id SERIAL PRIMARY KEY,
  now_application_id integer NOT NULL,
  now_application_review_type_code character varying(3) NOT NULL,
  referee_name varchar NOT null,
  response_date timestamp with time zone,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT null,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT null,

  FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (now_application_review_type_code) REFERENCES now_application_review_type(now_application_review_type_code) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS now_application_review_document_xref(
  now_application_review_id integer NOT NULL,
  mine_document_id integer NOT NULL, 
  PRIMARY KEY(now_application_review_id, mine_document_id),
  
  FOREIGN KEY (now_application_review_id) REFERENCES now_application_review(now_application_review_id) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mine_document_id) REFERENCES mine_document(mine_document_id) DEFERRABLE INITIALLY DEFERRED
)


ALTER TABLE now_application_review OWNER TO mds;
COMMENT ON TABLE now_application_review IS 'Records tracking the review stage of a Notice of Work application';