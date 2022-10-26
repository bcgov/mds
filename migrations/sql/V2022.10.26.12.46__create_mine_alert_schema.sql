CREATE TABLE IF NOT EXISTS mine_alert (
  mine_alert_guid         uuid DEFAULT gen_random_uuid()        PRIMARY KEY,
  mine_alert_id           serial                                   NOT NULL,
  mine_guid               uuid                                     NOT NULL,
  contact_name            character varying(200)                   NOT NULL,
  contact_phone           character varying(12)                    NOT NULL,
  start_date              timestamp with time zone                 NOT NULL,
  end_date                timestamp with time zone                         ,
  message                 character varying                        NOT NULL,
  create_user             character varying(60)                    NOT NULL,
  create_timestamp        timestamp with time zone DEFAULT now()   NOT NULL,
  update_user             character varying(60)                    NOT NULL,
  update_timestamp        timestamp with time zone DEFAULT now()   NOT NULL,
  deleted_ind             boolean DEFAULT false                    NOT NULL,

  CONSTRAINT mine_alert_id UNIQUE (mine_alert_id),
  CONSTRAINT mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE mine_alert OWNER TO mds;
--
-- Name: TABLE mine_alert; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE mine_alert IS 'Mine Alert contains a contact, message, start, and optional end date for a specific mine.';