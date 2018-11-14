CREATE TABLE mds_required_document (
  req_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Data Columns
  req_document_name character varying(60) NOT NULL,
  req_document_description character varying (300) NULL,
  req_document_category character varying(60) NULL,
--Audit Columns
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

COMMENT ON TABLE mds_required_document IS 'A mds_required_document is a document defined in the code, but is not strictly a single file, acts as a default reporting requirement';

CREATE TABLE mine_document ( 
  mine_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Foreign Key Columns
  mine_guid uuid NOT NULL,
  document_fulfillment_guid uuid NULL,
--Data Columns
  doc_manager_fileID integer NULL,
--Audit Columns 
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

--Foreign Key Definitions
  FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_document IS 'an mds record of a document stored in the document manager microservice';

CREATE TABLE mine_expected_document_xref ( 
  exp_document_xref_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Foreign Key Columns
  mine_document_guid uuid NOT NULL,
  exp_document_guid uuid NOT NULL,
--Data Columns
--Audit Columns
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
--Foreign Key Definitions
  FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mds_required_document IS 'A mine_expected_document_xref entry is the join between the actual document artifact and the expectation that the document satisfies. an expectation can also be statisfied by multiple documents';


CREATE TABLE mine_expected_document ( 
  exp_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Foreign Key Columns
  req_document_guid uuid NULL,
  mine_guid uuid NOT NULL,
  document_fulfillment_guid uuid NULL,
--Data Columns
  exp_document_name character varying(60) NOT NULL,
  exp_document_category character varying(60) NULL,
  date_created date NOT NULL DEFAULT now(),
  date_received date NULL,
  date_accepted date NULL,
  due_date date NULL, 
  status character varying(60) NULL,
--Audit Columns
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
--Foreign Key Definitions
  FOREIGN KEY (req_document_guid) REFERENCES mds_required_document(req_document_guid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mine_expected_document_xref) REFERENCES mine_expected_document_xref(exp_document_xref_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mds_required_document IS 'A mine_expected_document is a reporting requirement that has been assigned to a mine';


ALTER TABLE mine_document
  ADD FOREIGN KEY(document_fulfillment_guid) REFERENCES mine_expected_document_xref(exp_document_xref_guid) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE mine_expected_document_xref
  ADD FOREIGN KEY (exp_document_guid) REFERENCES mine_expected_document(exp_document_guid) DEFERRABLE INITIALLY DEFERRED;

