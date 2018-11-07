CREATE TABLE mds_required_document (
  req_document_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  req_document_name character varying(60) NOT NULL,
  req_document_description character varying (300) NULL,
  req_document_category character varying(60) NULL,
  recurrance_default smallint NULL,
  effective_date date NOT NULL DEFAULT current_timestamp, --tailings Project inception June 2017
  expiry_date date NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

COMMENT ON TABLE mds_required_document IS 'A mds_required_document is a document defined in the code, but is not strictly a single file, see this as a reporting requirement';

CREATE TABLE mine_file ( 
  mine_file_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  doc_manager_fileID integer NULL, 
  approval_status character varying(60) NOT NULL, 
  due_date date NULL, 
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

  FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);


COMMENT ON TABLE mine_file IS 'an mds record of a document stored in the document manager microservice';


CREATE TABLE required_document_files ( 
  req_doc_file_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  req_document_guid uuid NOT NULL,
  mine_file_guid uuid NOT NULL,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

  FOREIGN KEY (req_document_guid) REFERENCES mds_required_document(req_document_guid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (mine_file_guid) REFERENCES mine_file(mine_file_guid) DEFERRABLE INITIALLY DEFERRED
);


