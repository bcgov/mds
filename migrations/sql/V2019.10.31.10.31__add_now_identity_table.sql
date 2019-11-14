CREATE TABLE IF NOT EXISTS now_application_identity  (
  now_application_guid uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  now_application_id integer references now_application(now_application_id),
  messageid integer,
  mms_cid bigint
);

ALTER TABLE now_application_identity OWNER TO mds;

ALTER TABLE now_application DROP COLUMN now_application_guid;
ALTER TABLE now_application DROP COLUMN now_message_id;

ALTER TABLE now_application_identity 
ADD COLUMN create_user                      character varying(60) NOT NULL,
ADD COLUMN create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,
ADD COLUMN update_user                      character varying(60) NOT NULL,
ADD COLUMN update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL;