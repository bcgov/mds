



CREATE TABLE IF NOT EXISTS notice_of_departure_document_xref (
  nod_xref_guid UUID DEFAULT gen_random_uuid() NOT NULL,
  mine_document_guid UUID NOT NULL,
  nod_guid UUID NOT NULL,
  document_description character varying(500),
  deleted_ind BOOLEAN NOT NULL DEFAULT false,
  create_user character varying(60) NOT NULL,
  create_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (nod_xref_guid),
  FOREIGN KEY(mine_document_guid) REFERENCES mine_document (mine_document_guid),
  FOREIGN KEY(nod_guid) REFERENCES notice_of_departure (nod_guid)
);


COMMENT ON TABLE notice_of_departure_document_xref is 'Notice of departure document xref';

ALTER TABLE notice_of_departure_document_xref OWNER TO mds;