-- notice_of_departure and notice_of_departure_document-xref table needs to be truncate before we can run this migration
ALTER TABLE
  notice_of_departure
ADD
  COLUMN nod_no character varying(36) NOT NULL;

ALTER TABLE
  notice_of_departure
ADD
  CONSTRAINT notice_of_departure_nod_no_unique_constraint UNIQUE (nod_no);

CREATE INDEX IF NOT EXISTS notice_of_departure_permit_guid_idx ON notice_of_departure (permit_guid);