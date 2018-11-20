CREATE TABLE mds_required_document_category(
  req_document_category_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  req_document_category character varying(60) NOT NULL,
  active_ind boolean NOT NULL DEFAULT 'true'
);

COMMENT ON TABLE mds_required_document_category IS 'A mds_required_document_category is fixed tag on an mds_required_document for searching';

CREATE TABLE mds_required_document (
  req_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Data Columns
  req_document_name character varying(100) NOT NULL,
  req_document_description character varying (300) NULL,
  req_document_category_guid uuid NOT NULL,
--Audit Columns
  active_ind boolean NOT NULL DEFAULT 'true',
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

  --Foreign Key Definitions
  FOREIGN KEY (req_document_category_guid) REFERENCES mds_required_document_category(req_document_category_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mds_required_document IS 'A mds_required_document is a document defined in the code, but is not strictly a single file, acts as a default reporting requirement';

CREATE TABLE mine_document ( 
  mine_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Foreign Key Columns
  mine_guid uuid NOT NULL,
--Data Columns
  doc_manager_fileID integer NULL,
--Audit Columns 
  active_ind boolean NOT NULL DEFAULT 'true',
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

--Foreign Key Definitions
  FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_document IS 'an mds record of a document stored in the document manager microservice';

CREATE TABLE mine_expected_document ( 
  exp_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Foreign Key Columns
  req_document_guid uuid NULL,
  mine_guid uuid NOT NULL,
--Data Columns
  exp_document_name character varying(100) NOT NULL,
  exp_document_description character varying (300) NULL,
  due_date date NULL, 
--Audit Columns
  active_ind boolean NOT NULL DEFAULT 'true',
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
--Foreign Key Definitions
  FOREIGN KEY (req_document_guid) REFERENCES mds_required_document(req_document_guid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_expected_document IS 'A mine_expected_document is a reporting requirement that has been assigned to a mine';

CREATE TABLE mine_expected_document_xref ( 
  mine_exp_document_xref_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--Foreign Key Columns
  mine_document_guid uuid NOT NULL,
  exp_document_guid uuid NOT NULL,
--Data Columns
--Audit Columns
  active_ind boolean NOT NULL DEFAULT 'true',
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
--Foreign Key Definitions
  FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (exp_document_guid) REFERENCES mine_expected_document(exp_document_guid) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_expected_document_xref IS 'A mine_expected_document_xref entry is the join between the actual document artifact and the expectation that the document satisfies. an expectation can also be statisfied by multiple documents';

