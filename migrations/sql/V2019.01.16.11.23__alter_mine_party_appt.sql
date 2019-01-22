ALTER TABLE mine_party_appt
ADD COLUMN processed_by character varying(60) DEFAULT '' NOT NULL,
ADD COLUMN processed_on timestamp with time zone DEFAULT now() NOT NULL;
