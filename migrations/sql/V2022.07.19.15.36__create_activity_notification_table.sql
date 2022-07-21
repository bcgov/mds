CREATE SCHEMA IF NOT EXISTS activity;

CREATE TABLE IF NOT EXISTS activity.activity_notification (
  notification_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_recipient character varying(60) NOT NULL,
  notification_document JSONB NOT NULL,
  activity_type character varying(30) NOT NULL,
  notification_read boolean NOT NULL DEFAULT FALSE,
  create_user character varying(60) NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mine_guid ON activity.activity_notification ((notification_document->'metadata'->'mine'->'mine_guid')); 
CREATE INDEX IF NOT EXISTS idx_notification_recipient ON activity.activity_notification (notification_recipient);

ALTER TABLE activity.activity_notification
    OWNER TO mds;

COMMENT ON TABLE activity.activity_notification IS 'Notification on all activities';